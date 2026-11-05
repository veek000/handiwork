// Escrow payments. Accepting a quote creates a pending payment (quote + 2% service fee
// + processing fee); paying it holds the money in escrow and starts the job; the
// customer's confirmation releases it (jobs.confirmCompleted); cancellations refund it
// (escrow.ts). The vendor's balance (Wallet) is derived from these records.
//
// Money movement: Flutterwave isn't connected yet (needs FLUTTERWAVE_SECRET_KEY and the
// escrow / webhook integration). Until then `pay` only works on deployments that set
// ALLOW_SIMULATED_PAYMENTS=1 (dev), where it records the payment as held without
// charging anyone. Production refuses with a clear message.
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { feesFor, formatNaira, iso, nameOf, notify, requireViewer, systemMessage, viewerOrNull } from "./model";

/** Customer accepts the quote: creates (or reuses) the pending escrow payment. */
export const acceptQuote = mutation({
  args: { quoteId: v.string() },
  handler: async (ctx, { quoteId }) => {
    const me = await requireViewer(ctx, "customer");
    const id = ctx.db.normalizeId("quotes", quoteId);
    const q = id ? await ctx.db.get(id) : null;
    if (!q || q.customerId !== me._id) throw new ConvexError("That quote no longer exists.");
    const job = await ctx.db.get(q.jobId);
    if (!job || job.status !== "quoted") throw new ConvexError("This job isn't waiting on a quote any more.");
    if (q.status !== "pending" && q.status !== "accepted") throw new ConvexError("This quote can't be accepted now.");

    const existing = (await ctx.db.query("payments").withIndex("by_job", (x) => x.eq("jobId", job._id)).collect()).find(
      (p) => p.quoteId === q._id && p.status === "pending",
    );
    const fees = feesFor(q.amount);
    if (q.status === "pending") await ctx.db.patch(q._id, { status: "accepted" });
    const paymentId =
      existing?._id ??
      (await ctx.db.insert("payments", {
        jobId: job._id,
        quoteId: q._id,
        customerId: me._id,
        vendorId: q.vendorId,
        amount: q.amount,
        ...fees,
        status: "pending",
        provider: process.env.FLUTTERWAVE_SECRET_KEY ? "flutterwave" : "simulated",
      }));
    return { paymentId, amount: q.amount, ...fees };
  },
});

/** Pay the pending payment into escrow (see the note at the top about Flutterwave). */
export const pay = mutation({
  args: { paymentId: v.id("payments"), method: v.union(v.literal("card"), v.literal("transfer")) },
  handler: async (ctx, { paymentId, method }) => {
    const me = await requireViewer(ctx, "customer");
    const p = await ctx.db.get(paymentId);
    if (!p || p.customerId !== me._id) throw new ConvexError("That payment no longer exists.");
    if (p.status === "held") return;
    if (p.status !== "pending") throw new ConvexError("This payment can't be completed.");
    if (process.env.FLUTTERWAVE_SECRET_KEY) {
      throw new ConvexError("Card and transfer checkout is being connected. Please try again soon.");
    }
    if (process.env.ALLOW_SIMULATED_PAYMENTS !== "1") {
      throw new ConvexError("Online payment isn't available yet. Contact support to arrange payment.");
    }
    const job = await ctx.db.get(p.jobId);
    if (!job || job.status !== "quoted") throw new ConvexError("This job isn't waiting for payment any more.");

    await ctx.db.patch(p._id, { status: "held", heldAt: Date.now(), providerRef: `sim_${method}_${Date.now()}` });
    await ctx.db.patch(p.quoteId, { status: "paid" });
    await ctx.db.patch(job._id, { status: "in_progress" });
    await systemMessage(
      ctx,
      job._id,
      "Payment Notice",
      `Payment In Escrow — ${formatNaira(p.total)} is secured. Funds release when work is confirmed complete.`,
    );
    await notify(ctx, p.vendorId, {
      type: "payment_received",
      title: "Payment Received",
      body: `${nameOf(me)} paid ${formatNaira(p.amount)} into escrow for "${job.title}". You can start the job.`,
      jobId: job._id,
    });
  },
});

/** Vendor balance (Home BalanceCard, Analytics). Withdrawals aren't built yet, so
 *  everything released is withdrawable. */
export const wallet = query({
  args: {},
  handler: async (ctx) => {
    const me = await viewerOrNull(ctx);
    if (!me) return null;
    const payments = await ctx.db.query("payments").withIndex("by_vendor", (q) => q.eq("vendorId", me._id)).collect();
    const held = payments.filter((p) => p.status === "held").reduce((n, p) => n + p.amount, 0);
    const released = payments.filter((p) => p.status === "released");
    const withdrawable = released.reduce((n, p) => n + p.amount, 0);
    const year = new Date().getFullYear();
    const revenueByMonth = Array<number>(12).fill(0);
    let lastYearRevenue = 0;
    for (const p of released) {
      const d = new Date(p.releasedAt ?? p._creationTime);
      if (d.getFullYear() === year) revenueByMonth[d.getMonth()] += p.amount;
      else if (d.getFullYear() === year - 1) lastYearRevenue += p.amount;
    }
    return { totalBalance: held + withdrawable, withdrawableBalance: withdrawable, heldInEscrow: held, revenueByMonth, lastYearRevenue };
  },
});

/** The payment for a job, for the chat's payment step (customer or vendor). */
export const forJob = query({
  args: { jobId: v.string() },
  handler: async (ctx, { jobId }) => {
    const me = await viewerOrNull(ctx);
    const id = ctx.db.normalizeId("jobs", jobId);
    if (!me || !id) return null;
    const job = await ctx.db.get(id);
    if (!job || (job.customerId !== me._id && job.vendorId !== me._id)) return null;
    const list = await ctx.db.query("payments").withIndex("by_job", (q) => q.eq("jobId", id)).collect();
    const p = list.find((x) => x.status === "pending" || x.status === "held") ?? list[list.length - 1];
    if (!p) return null;
    return {
      id: p._id,
      status: p.status,
      amount: p.amount,
      serviceFee: p.serviceFee,
      processingFee: p.processingFee,
      total: p.total,
      createdAt: iso(p._creationTime),
    };
  },
});

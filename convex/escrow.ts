// Escrow bookkeeping used by the job lifecycle (no Convex functions here).
//
// Refund rules (PROJECT.md "Payments", tiered by stage and who cancelled):
//   • not yet paid (pending payment)          → payment marked failed, nothing to refund
//   • vendor cancels / rejects, any stage     → full refund of the total, no fee kept
//   • customer cancels after paying (vendor
//     had accepted / started)                 → refund the quote amount; the 2% service
//                                               fee is kept as the disclosed cancellation
//                                               fee; the processing fee isn't refundable
//
// The money movement itself (Flutterwave transfer / refund) isn't wired yet — these
// record the outcome. Payments are never deleted.
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export async function activePayment(ctx: MutationCtx, job: Doc<"jobs">) {
  const list = await ctx.db.query("payments").withIndex("by_job", (q) => q.eq("jobId", job._id)).collect();
  return list.find((p) => p.status === "held" || p.status === "pending") ?? null;
}

export async function settleOnCancel(ctx: MutationCtx, job: Doc<"jobs">, by: "customer" | "vendor") {
  const p = await activePayment(ctx, job);
  if (!p) return null;
  if (p.status === "pending") {
    await ctx.db.patch(p._id, { status: "failed" });
    return null;
  }
  const refundAmount = by === "vendor" ? p.total : p.amount;
  const retainedFee = by === "vendor" ? 0 : p.serviceFee;
  await ctx.db.patch(p._id, { status: "refunded", refundedAt: Date.now(), refundAmount, retainedFee });
  return { refundAmount, retainedFee };
}

export async function release(ctx: MutationCtx, job: Doc<"jobs">) {
  const p = await activePayment(ctx, job);
  if (!p || p.status !== "held") return null;
  await ctx.db.patch(p._id, { status: "released", releasedAt: Date.now() });
  return p;
}

/** Close any open quotes when a job ends. */
export async function closeQuotes(ctx: MutationCtx, job: Doc<"jobs">) {
  const quotes = await ctx.db.query("quotes").withIndex("by_job", (q) => q.eq("jobId", job._id)).collect();
  for (const q of quotes) {
    if (q.status === "pending" || q.status === "countered" || q.status === "accepted") {
      await ctx.db.patch(q._id, { status: "superseded" });
    }
  }
}

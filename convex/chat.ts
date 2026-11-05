// Job-scoped chat: one thread per job (PROJECT.md "Chat" — not an open inbox), text
// messages, read receipts, and the vendor's quotes. Typing indicators are not stored
// (planned via @convex-dev/presence).
import { ConvexError, v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { formatNaira, iso, nameOf, notify, requireViewer, viewerOrNull } from "./model";

const MAX_TEXT = 2000;

async function myJobs(ctx: QueryCtx, me: Doc<"users">) {
  const asCustomer = await ctx.db.query("jobs").withIndex("by_customer", (q) => q.eq("customerId", me._id)).collect();
  const asVendor = await ctx.db.query("jobs").withIndex("by_vendor", (q) => q.eq("vendorId", me._id)).collect();
  return [...asCustomer, ...asVendor];
}

async function jobFor(ctx: QueryCtx, me: Doc<"users">, jobId: string) {
  const id = ctx.db.normalizeId("jobs", jobId);
  const job = id ? await ctx.db.get(id) : null;
  if (!job || (job.customerId !== me._id && job.vendorId !== me._id)) return null;
  return job;
}

/** The Messages list: one row per job the viewer is part of, latest activity first. */
export const threads = query({
  args: {},
  handler: async (ctx) => {
    const me = await viewerOrNull(ctx);
    if (!me) return null;
    const jobs = await myJobs(ctx, me);
    const rows = await Promise.all(
      jobs.map(async (job) => {
        const other = await ctx.db.get(job.customerId === me._id ? job.vendorId : job.customerId);
        const msgs = await ctx.db.query("messages").withIndex("by_job", (q) => q.eq("jobId", job._id)).collect();
        const last = msgs[msgs.length - 1];
        const lastAt = last?._creationTime ?? job._creationTime;
        return {
          id: job._id as string,
          jobId: job._id as string,
          jobTitle: job.title,
          participantName: nameOf(other),
          participantAvatarUrl: other?.deletedAt ? undefined : other?.image,
          lastMessagePreview: last ? (last.kind === "quote" ? "Sent a quotation" : last.body) : job.title,
          lastMessageAt: iso(lastAt),
          unreadCount: msgs.filter((m) => m.senderId && m.senderId !== me._id && !m.readAt).length,
          lastMessageStatus: (last?.readAt ? "read" : "delivered") as "read" | "delivered",
          isTyping: false,
          sortKey: lastAt,
        };
      }),
    );
    return rows.sort((a, b) => b.sortKey - a.sortKey).map(({ sortKey: _s, ...row }) => row);
  },
});

/** Unread messages across all threads (header envelope badge). */
export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const me = await viewerOrNull(ctx);
    if (!me) return 0;
    let n = 0;
    for (const job of await myJobs(ctx, me)) {
      const msgs = await ctx.db.query("messages").withIndex("by_job", (q) => q.eq("jobId", job._id)).collect();
      n += msgs.filter((m) => m.senderId && m.senderId !== me._id && !m.readAt).length;
    }
    return n;
  },
});

export const messages = query({
  args: { jobId: v.string() },
  handler: async (ctx, { jobId }) => {
    const me = await viewerOrNull(ctx);
    if (!me) return null;
    const job = await jobFor(ctx, me, jobId);
    if (!job) return null;
    const msgs = await ctx.db.query("messages").withIndex("by_job", (q) => q.eq("jobId", job._id)).collect();
    const quotes = new Map(
      (await ctx.db.query("quotes").withIndex("by_job", (q) => q.eq("jobId", job._id)).collect()).map((q) => [q._id, q]),
    );
    return {
      jobStatus: job.status,
      messages: msgs.map((m) => {
        const q = m.quoteId ? quotes.get(m.quoteId) : undefined;
        return {
          id: m._id as string,
          conversationId: job._id as string,
          kind: m.kind,
          senderId: (m.senderId as string | undefined) ?? null,
          body: m.body,
          sentAt: iso(m._creationTime),
          status: (m.senderId === me._id ? (m.readAt ? "read" : "delivered") : "read") as "read" | "delivered",
          systemTitle: m.systemTitle,
          quote: q
            ? {
                id: q._id as string,
                amount: q.amount,
                counterAmount: q.counterAmount,
                // A replaced quote shows as it last stood; only the latest one is actionable.
                status: (q.status === "superseded" ? "pending" : q.status) as "pending" | "countered" | "accepted" | "paid",
                superseded: q.status === "superseded",
              }
            : undefined,
        };
      }),
    };
  },
});

export const send = mutation({
  args: { jobId: v.string(), body: v.string() },
  handler: async (ctx, { jobId, body }) => {
    const me = await requireViewer(ctx);
    const job = await jobFor(ctx, me, jobId);
    if (!job) throw new ConvexError("That chat no longer exists.");
    const other = await ctx.db.get(job.customerId === me._id ? job.vendorId : job.customerId);
    if (!other || other.deletedAt) throw new ConvexError("This person has left Handiwork, so the chat is closed.");
    const text = body.trim();
    if (!text) return;
    if (text.length > MAX_TEXT) throw new ConvexError("Keep messages under 2,000 characters.");
    await ctx.db.insert("messages", { jobId: job._id, senderId: me._id, kind: "text", body: text });
  },
});

/** Opening a thread marks the other person's messages as read. */
export const markRead = mutation({
  args: { jobId: v.string() },
  handler: async (ctx, { jobId }) => {
    const me = await viewerOrNull(ctx);
    if (!me) return;
    const job = await jobFor(ctx, me, jobId);
    if (!job) return;
    const msgs = await ctx.db.query("messages").withIndex("by_job", (q) => q.eq("jobId", job._id)).collect();
    const now = Date.now();
    for (const m of msgs) {
      if (m.senderId && m.senderId !== me._id && !m.readAt) await ctx.db.patch(m._id, { readAt: now });
    }
  },
});

// ---------------------------------------------------------------- quotes

function checkAmount(amount: number) {
  if (!Number.isFinite(amount) || amount < 500) throw new ConvexError("Quotes start at NGN500.");
  if (amount > 50_000_000) throw new ConvexError("That amount is too large. Contact support for big jobs.");
  return Math.round(amount);
}

async function openQuotes(ctx: QueryCtx, jobId: Id<"jobs">) {
  return (await ctx.db.query("quotes").withIndex("by_job", (q) => q.eq("jobId", jobId)).collect()).filter(
    (q) => q.status === "pending" || q.status === "countered",
  );
}

/** Vendor sends a quote. Any earlier open quote on the job is replaced. */
export const sendQuote = mutation({
  args: { jobId: v.string(), amount: v.number() },
  handler: async (ctx, { jobId, amount }) => {
    const me = await requireViewer(ctx, "vendor");
    const job = await jobFor(ctx, me, jobId);
    if (!job || job.vendorId !== me._id) throw new ConvexError("That job no longer exists.");
    if (job.status !== "pending" && job.status !== "quoted") throw new ConvexError("This job is past the quoting stage.");
    const value = checkAmount(amount);
    for (const q of await openQuotes(ctx, job._id)) await ctx.db.patch(q._id, { status: "superseded" });
    const quoteId = await ctx.db.insert("quotes", {
      jobId: job._id,
      vendorId: me._id,
      customerId: job.customerId,
      amount: value,
      status: "pending",
    });
    await ctx.db.insert("messages", { jobId: job._id, senderId: me._id, kind: "quote", body: "Quote", quoteId });
    await ctx.db.insert("messages", {
      jobId: job._id,
      senderId: me._id,
      kind: "text",
      body: "I've sent you a quotation. Let me know if adjustments are needed.",
    });
    await ctx.db.patch(job._id, { status: "quoted" });
    await notify(ctx, job.customerId, {
      type: "quote_received",
      title: "New Quote",
      body: `${nameOf(me)} quoted ${formatNaira(value)} for "${job.title}".`,
      jobId: job._id,
    });
  },
});

/** Vendor edits their open quote in place. */
export const editQuote = mutation({
  args: { quoteId: v.string(), amount: v.number() },
  handler: async (ctx, { quoteId, amount }) => {
    const me = await requireViewer(ctx, "vendor");
    const id = ctx.db.normalizeId("quotes", quoteId);
    const q = id ? await ctx.db.get(id) : null;
    if (!q || q.vendorId !== me._id) throw new ConvexError("That quote no longer exists.");
    if (q.status !== "pending" && q.status !== "countered") throw new ConvexError("This quote can't be changed any more.");
    const value = checkAmount(amount);
    await ctx.db.patch(q._id, { amount: value, status: "pending", counterAmount: undefined });
    await notify(ctx, q.customerId, {
      type: "quote_received",
      title: "Quote Updated",
      body: `${nameOf(me)} updated their quote to ${formatNaira(value)}.`,
      jobId: q.jobId,
    });
  },
});

/** Customer proposes a different amount. */
export const counterQuote = mutation({
  args: { quoteId: v.string(), amount: v.number() },
  handler: async (ctx, { quoteId, amount }) => {
    const me = await requireViewer(ctx, "customer");
    const id = ctx.db.normalizeId("quotes", quoteId);
    const q = id ? await ctx.db.get(id) : null;
    if (!q || q.customerId !== me._id) throw new ConvexError("That quote no longer exists.");
    if (q.status !== "pending") throw new ConvexError("This quote can't be countered now.");
    const value = checkAmount(amount);
    await ctx.db.patch(q._id, { status: "countered", counterAmount: value });
    await ctx.db.insert("messages", {
      jobId: q.jobId,
      senderId: me._id,
      kind: "text",
      body: `I'd like to counter at ${formatNaira(value)}.`,
    });
    await notify(ctx, q.vendorId, {
      type: "job_update",
      title: "Counter Offer",
      body: `${nameOf(me)} countered at ${formatNaira(value)}.`,
      jobId: q.jobId,
    });
  },
});

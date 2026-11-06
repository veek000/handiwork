// Reviews: one per completed job, written by its customer; the vendor can reply.
// Each write keeps the service's ratingSum / reviewCount in step.
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { nameOf, notify, requireViewer, toReview, toVendor, viewerOrNull } from "./model";

export async function adjustService(ctx: MutationCtx, serviceId: Doc<"reviews">["serviceId"], ratingDelta: number, countDelta: number) {
  const s = await ctx.db.get(serviceId);
  if (!s) return;
  await ctx.db.patch(serviceId, {
    ratingSum: Math.max(0, s.ratingSum + ratingDelta),
    reviewCount: Math.max(0, s.reviewCount + countDelta),
  });
}

/** Vendor My Reviews. */
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const me = await viewerOrNull(ctx);
    if (!me) return null;
    const reviews = (await ctx.db.query("reviews").withIndex("by_vendor", (q) => q.eq("vendorId", me._id)).order("desc").collect()).filter(
      (r) => !r.hiddenAt,
    );
    return { vendor: await toVendor(ctx, me), reviews: await Promise.all(reviews.map((r) => toReview(ctx, r))) };
  },
});

/** Customer adds or edits the review for a completed job. */
export const upsert = mutation({
  args: { jobId: v.string(), rating: v.number(), body: v.string() },
  handler: async (ctx, { jobId, rating, body }) => {
    const me = await requireViewer(ctx, "customer");
    const id = ctx.db.normalizeId("jobs", jobId);
    const job = id ? await ctx.db.get(id) : null;
    if (!job || job.customerId !== me._id) throw new ConvexError("That job no longer exists.");
    if (job.status !== "completed") throw new ConvexError("You can review a job once it's complete.");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ConvexError("Pick a rating from 1 to 5.");
    const text = body.trim();
    if (text.length > 1500) throw new ConvexError("Keep your review under 1,500 characters.");

    const existing = await ctx.db.query("reviews").withIndex("by_job", (q) => q.eq("jobId", job._id)).unique();
    if (existing) {
      if (existing.hiddenAt) throw new ConvexError("This review was removed by Handiwork and can't be edited.");
      await ctx.db.patch(existing._id, { rating, body: text });
      await adjustService(ctx, existing.serviceId, rating - existing.rating, 0);
      return;
    }
    await ctx.db.insert("reviews", { jobId: job._id, serviceId: job.serviceId, vendorId: job.vendorId, customerId: me._id, rating, body: text });
    await adjustService(ctx, job.serviceId, rating, 1);
    await notify(ctx, job.vendorId, {
      type: "new_review",
      title: "New Review",
      body: `${nameOf(me)} left a ${rating}-star review for "${job.title}".`,
      jobId: job._id,
    });
  },
});

export const remove = mutation({
  args: { jobId: v.string() },
  handler: async (ctx, { jobId }) => {
    const me = await requireViewer(ctx, "customer");
    const id = ctx.db.normalizeId("jobs", jobId);
    const r = id ? await ctx.db.query("reviews").withIndex("by_job", (q) => q.eq("jobId", id)).unique() : null;
    if (!r || r.customerId !== me._id) throw new ConvexError("That review no longer exists.");
    await ctx.db.delete(r._id);
    if (!r.hiddenAt) await adjustService(ctx, r.serviceId, -r.rating, -1);
  },
});

/** Vendor replies to, edits or (with no text) removes their reply. */
export const respond = mutation({
  args: { id: v.string(), response: v.optional(v.string()) },
  handler: async (ctx, { id, response }) => {
    const me = await requireViewer(ctx, "vendor");
    const reviewId = ctx.db.normalizeId("reviews", id);
    const r = reviewId ? await ctx.db.get(reviewId) : null;
    if (!r || r.vendorId !== me._id) throw new ConvexError("That review no longer exists.");
    const text = response?.trim();
    if (text && text.length > 1000) throw new ConvexError("Keep your reply under 1,000 characters.");
    await ctx.db.patch(r._id, { response: text || undefined });
  },
});

// Jobs: a customer's request to one vendor, from booking to completion.
//   pending → quoted (chat.sendQuote) → in_progress (payments: quote paid into escrow)
//   → marked_completed (vendor) → completed (customer confirms; escrow released)
//   Side exits: rejected (vendor, before payment), cancelled (either party).
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { closeQuotes, release, settleOnCancel } from "./escrow";
import { formatNaira, nameOf, notify, requireViewer, systemMessage, toJob, toReview, toUser, usersById, viewerOrNull } from "./model";

const OPEN: Doc<"jobs">["status"][] = ["pending", "quoted", "in_progress", "marked_completed"];
const MAX_OPEN_REQUESTS = 10;

// ---------------------------------------------------------------- reads

/** Customer My Jobs: their jobs, the reviews they left, and the vendors involved. */
export const customerJobs = query({
  args: {},
  handler: async (ctx) => {
    const me = await viewerOrNull(ctx);
    if (!me) return null;
    const jobs = await ctx.db.query("jobs").withIndex("by_customer", (q) => q.eq("customerId", me._id)).order("desc").collect();
    const reviews = await ctx.db.query("reviews").withIndex("by_customer", (q) => q.eq("customerId", me._id)).collect();
    const vendors = await usersById(ctx, jobs.map((j) => j.vendorId));
    return {
      customer: toUser(me),
      jobs: jobs.map(toJob),
      reviews: await Promise.all(reviews.filter((r) => r.jobId).map((r) => toReview(ctx, r))),
      vendors: vendors.map((u) => ({ ...toUser(u), role: "vendor" as const })),
    };
  },
});

/** Vendor Home / My Orders / Analytics: their jobs and the customers involved. */
export const vendorJobs = query({
  args: {},
  handler: async (ctx) => {
    const me = await viewerOrNull(ctx);
    if (!me) return null;
    const jobs = await ctx.db.query("jobs").withIndex("by_vendor", (q) => q.eq("vendorId", me._id)).order("desc").collect();
    const customers = await usersById(ctx, jobs.map((j) => j.customerId));
    return {
      jobs: jobs.map(toJob),
      customers: customers.map((u) => ({ ...toUser(u), role: "customer" as const })),
    };
  },
});

/** Vendor Job Details. */
export const vendorJob = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const me = await viewerOrNull(ctx);
    const jobId = ctx.db.normalizeId("jobs", id);
    if (!me || !jobId) return null;
    const job = await ctx.db.get(jobId);
    if (!job || job.vendorId !== me._id) return null;
    const customer = await ctx.db.get(job.customerId);
    return { job: toJob(job), customer: customer ? { ...toUser(customer), role: "customer" as const } : undefined };
  },
});

// ---------------------------------------------------------------- booking

function lagosToday() {
  return new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10); // WAT = UTC+1
}

export const request = mutation({
  args: {
    serviceIds: v.array(v.id("services")), // first = the main service; all must belong to one vendor
    preferredDate: v.string(),
    preferredTime: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const me = await requireViewer(ctx, "customer");
    if (!args.serviceIds.length) throw new ConvexError("Choose at least one service.");
    const services = await Promise.all(args.serviceIds.slice(0, 10).map((id) => ctx.db.get(id)));
    if (services.some((s) => !s || s.archivedAt)) throw new ConvexError("One of those services is no longer available.");
    const main = services[0]!;
    if (services.some((s) => s!.vendorId !== main.vendorId)) throw new ConvexError("Book one provider at a time.");
    const vendor = await ctx.db.get(main.vendorId);
    if (!vendor || vendor.deletedAt) throw new ConvexError("This provider is no longer on Handiwork.");
    if (vendor._id === me._id) throw new ConvexError("You can't book your own service.");

    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.preferredDate) || args.preferredDate < lagosToday()) {
      throw new ConvexError("Pick today or a later date.");
    }
    if (!/^\d{2}:\d{2}$/.test(args.preferredTime)) throw new ConvexError("Pick a time.");
    const description = args.description.trim();
    if (description.length > 1000) throw new ConvexError("Keep the description under 1,000 characters.");

    const mine = await ctx.db.query("jobs").withIndex("by_customer", (q) => q.eq("customerId", me._id)).collect();
    const open = mine.filter((j) => OPEN.includes(j.status));
    if (open.some((j) => j.serviceId === main._id)) {
      throw new ConvexError("You already have an open request for this service. Check My Jobs.");
    }
    if (open.length >= MAX_OPEN_REQUESTS) throw new ConvexError("You have a lot of open requests. Finish or cancel some first.");

    const title = services.map((s) => s!.title).join(" + ");
    const jobId = await ctx.db.insert("jobs", {
      customerId: me._id,
      vendorId: vendor._id,
      serviceId: main._id,
      title,
      description: description || `Request for ${title}.`,
      status: "pending",
      preferredDate: args.preferredDate,
      preferredTime: args.preferredTime,
      images: [],
    });
    await systemMessage(ctx, jobId, "Request Sent", `${nameOf(me)} requested ${title} for ${args.preferredDate} at ${args.preferredTime}.`);
    if (description) await ctx.db.insert("messages", { jobId, senderId: me._id, kind: "text", body: description });
    await notify(ctx, vendor._id, {
      type: "job_inquiry",
      title: "New Job Inquiry",
      body: `${nameOf(me)} requested ${title}. Send a quote to get started.`,
      jobId,
    });
    return jobId;
  },
});

// ---------------------------------------------------------------- lifecycle

async function loadForParty(ctx: Parameters<typeof requireViewer>[0], id: string) {
  const me = await requireViewer(ctx);
  const jobId = ctx.db.normalizeId("jobs", id);
  const job = jobId ? await ctx.db.get(jobId) : null;
  if (!job || (job.customerId !== me._id && job.vendorId !== me._id)) throw new ConvexError("That job no longer exists.");
  const as: "customer" | "vendor" = job.vendorId === me._id ? "vendor" : "customer";
  return { me, job, as };
}

export const cancel = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const { me, job, as } = await loadForParty(ctx, id);
    const allowed: Doc<"jobs">["status"][] = as === "customer" ? ["pending", "quoted", "in_progress"] : ["in_progress", "marked_completed"];
    if (!allowed.includes(job.status)) {
      throw new ConvexError(
        as === "customer" && job.status === "marked_completed"
          ? "The provider has marked this job done. Confirm it, or contact support if something's wrong."
          : "This job can't be cancelled now.",
      );
    }
    await ctx.db.patch(job._id, { status: "cancelled", cancelledBy: as, closedAt: Date.now() });
    await closeQuotes(ctx, job);
    const refund = await settleOnCancel(ctx, job, as);
    const other = as === "customer" ? job.vendorId : job.customerId;
    const refundNote = refund
      ? ` ${formatNaira(refund.refundAmount)} is being refunded to the customer${refund.retainedFee ? ` (the ${formatNaira(refund.retainedFee)} service fee is kept as the cancellation fee)` : ""}.`
      : "";
    await systemMessage(ctx, job._id, "Job Cancelled", `${nameOf(me)} cancelled this job.${refundNote}`);
    await notify(ctx, other, {
      type: "job_cancelled",
      title: "Job Canceled",
      body: `${nameOf(me)} cancelled "${job.title}".${refundNote}`,
      jobId: job._id,
    });
  },
});

export const reject = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const { me, job, as } = await loadForParty(ctx, id);
    if (as !== "vendor") throw new ConvexError("Only the provider can decline a request.");
    if (job.status !== "pending" && job.status !== "quoted") throw new ConvexError("This request has already moved on.");
    await ctx.db.patch(job._id, { status: "rejected", closedAt: Date.now() });
    await closeQuotes(ctx, job);
    await settleOnCancel(ctx, job, "vendor");
    await systemMessage(ctx, job._id, "Request Declined", `${nameOf(me)} can't take this job.`);
    await notify(ctx, job.customerId, {
      type: "job_cancelled",
      title: "Request Declined",
      body: `${nameOf(me)} can't take "${job.title}". You can book another provider.`,
      jobId: job._id,
    });
  },
});

export const markCompleted = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const { me, job, as } = await loadForParty(ctx, id);
    if (as !== "vendor") throw new ConvexError("Only the provider can mark the job done.");
    if (job.status !== "in_progress") throw new ConvexError("Only a paid, in-progress job can be marked done.");
    await ctx.db.patch(job._id, { status: "marked_completed" });
    await systemMessage(ctx, job._id, "System Notification", "Job marked as completed by provider. Waiting for customer confirmation.");
    await notify(ctx, job.customerId, {
      type: "job_update",
      title: "Job Marked as Completed",
      body: `${nameOf(me)} says "${job.title}" is done. Confirm to release the payment.`,
      jobId: job._id,
    });
  },
});

/** Customer confirms the work is done: the job completes and escrow is released. */
export const confirmCompleted = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const { me, job, as } = await loadForParty(ctx, id);
    if (as !== "customer") throw new ConvexError("Only the customer can confirm the job is done.");
    if (job.status !== "in_progress" && job.status !== "marked_completed") throw new ConvexError("This job isn't ready to confirm.");
    await ctx.db.patch(job._id, { status: "completed", closedAt: Date.now() });
    const paid = await release(ctx, job);
    await systemMessage(ctx, job._id, "System Notification", "Thank you for confirming. Your job is now marked as complete.");
    await notify(ctx, job.vendorId, {
      type: "payment_released",
      title: "Payment Released",
      body: paid
        ? `${nameOf(me)} confirmed "${job.title}". ${formatNaira(paid.amount)} has been released to your balance.`
        : `${nameOf(me)} confirmed "${job.title}" is complete.`,
      jobId: job._id,
    });
  },
});


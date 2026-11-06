// Admin area (/admin): platform overview and control. Every function requires
// users.isAdmin (granted only from the CLI — see grantAdmin below), and every write is
// recorded in auditLog. Lists are capped (newest first) — enough for the current scale;
// switch to pagination as the tables grow.
import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { audit, iso, locationOf, nameOf, notify, requireAdmin, systemMessage, formatNaira } from "./model";
import { closeQuotes, release, settleOnCancel } from "./escrow";
import { adjustService } from "./reviews";

const LIST_LIMIT = 300;
const OPEN: Doc<"jobs">["status"][] = ["pending", "quoted", "in_progress", "marked_completed"];

function userRow(u: Doc<"users">) {
  return {
    id: u._id as string,
    name: nameOf(u),
    email: u.email ?? "",
    role: u.role ?? null,
    location: locationOf(u),
    isAdmin: Boolean(u.isAdmin),
    demo: Boolean(u.demo),
    suspended: Boolean(u.suspendedAt),
    deleted: Boolean(u.deletedAt),
    verificationStatus: u.verificationStatus ?? null,
    createdAt: iso(u._creationTime),
  };
}

async function names(ctx: QueryCtx, ids: Id<"users">[]) {
  const map = new Map<string, string>();
  for (const id of new Set(ids)) map.set(id, nameOf(await ctx.db.get(id)));
  return map;
}

// ================================================================ reads

export const me = query({
  args: {},
  handler: async (ctx) => {
    try {
      const admin = await requireAdmin(ctx);
      return { id: admin._id as string, name: nameOf(admin), email: admin.email ?? "" };
    } catch {
      return null;
    }
  },
});

export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = (await ctx.db.query("users").collect()).filter((u) => !u.deletedAt);
    const jobs = await ctx.db.query("jobs").collect();
    const payments = await ctx.db.query("payments").collect();
    const services = await ctx.db.query("services").collect();
    const feedback = await ctx.db.query("feedback").collect();
    const sum = (list: Doc<"payments">[], f: (p: Doc<"payments">) => number) => list.reduce((n, p) => n + f(p), 0);
    const released = payments.filter((p) => p.status === "released");
    const refunded = payments.filter((p) => p.status === "refunded");
    const byStatus = Object.fromEntries(
      ["pending", "quoted", "in_progress", "marked_completed", "completed", "cancelled", "rejected"].map((s) => [
        s,
        jobs.filter((j) => j.status === s).length,
      ]),
    );
    return {
      users: {
        customers: users.filter((u) => u.role === "customer" && !u.demo).length,
        vendors: users.filter((u) => u.role === "vendor" && !u.demo).length,
        demo: users.filter((u) => u.demo).length,
        noRole: users.filter((u) => !u.role).length,
        suspended: users.filter((u) => u.suspendedAt).length,
        verifiedVendors: users.filter((u) => u.verificationStatus === "verified").length,
        pendingVerification: users.filter((u) => u.verificationStatus === "pending").length,
      },
      jobs: { total: jobs.length, byStatus, open: jobs.filter((j) => OPEN.includes(j.status)).length },
      money: {
        heldInEscrow: sum(payments.filter((p) => p.status === "held"), (p) => p.amount),
        releasedToVendors: sum(released, (p) => p.amount),
        refundedToCustomers: sum(refunded, (p) => p.refundAmount ?? 0),
        // Handiwork's margin: service fee on completed jobs + fees kept on late cancellations.
        platformFees: sum(released, (p) => p.serviceFee) + sum(refunded, (p) => p.retainedFee ?? 0),
      },
      services: { active: services.filter((s) => !s.archivedAt).length, archived: services.filter((s) => s.archivedAt).length },
      feedback: { open: feedback.filter((f) => !f.resolvedAt).length, total: feedback.length },
    };
  },
});

export const users = query({
  args: {
    search: v.optional(v.string()),
    filter: v.optional(
      v.union(
        v.literal("all"),
        v.literal("customer"),
        v.literal("vendor"),
        v.literal("no_role"),
        v.literal("admin"),
        v.literal("suspended"),
        v.literal("pending"),
        v.literal("demo"),
      ),
    ),
  },
  handler: async (ctx, { search, filter = "all" }) => {
    await requireAdmin(ctx);
    const q = search?.trim().toLowerCase() ?? "";
    const all = (await ctx.db.query("users").order("desc").collect()).filter((u) => !u.deletedAt);
    const matched = all.filter((u) => {
      if (filter === "customer" && u.role !== "customer") return false;
      if (filter === "vendor" && u.role !== "vendor") return false;
      if (filter === "no_role" && u.role) return false;
      if (filter === "admin" && !u.isAdmin) return false;
      if (filter === "suspended" && !u.suspendedAt) return false;
      if (filter === "pending" && u.verificationStatus !== "pending") return false;
      if (filter === "demo" && !u.demo) return false;
      if (!q) return true;
      return `${nameOf(u)} ${u.email ?? ""} ${u.phone ?? ""}`.toLowerCase().includes(q);
    });
    return matched.slice(0, LIST_LIMIT).map(userRow);
  },
});

export const userDetail = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const u = await ctx.db.get(id);
    if (!u) return null;
    const asCustomer = await ctx.db.query("jobs").withIndex("by_customer", (q) => q.eq("customerId", id)).collect();
    const asVendor = await ctx.db.query("jobs").withIndex("by_vendor", (q) => q.eq("vendorId", id)).collect();
    const services = await ctx.db.query("services").withIndex("by_vendor", (q) => q.eq("vendorId", id)).collect();
    const accounts = await ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", id)).collect();
    const received = await ctx.db.query("payments").withIndex("by_vendor", (q) => q.eq("vendorId", id)).collect();
    const paid = await ctx.db.query("payments").withIndex("by_customer", (q) => q.eq("customerId", id)).collect();
    return {
      ...userRow(u),
      phone: u.phone ? `${u.countryCode ?? ""} ${u.phone}`.trim() : "",
      address: u.address ?? "",
      service: u.service ?? "",
      yearsOfExperience: u.yearsOfExperience ?? "",
      bio: u.businessBio ?? "",
      signInMethods: accounts.map((a) => a.provider),
      suspendedReason: u.suspendedReason ?? "",
      verificationNote: u.verificationNote ?? "",
      jobs: {
        asCustomer: asCustomer.length,
        asVendor: asVendor.length,
        open: [...asCustomer, ...asVendor].filter((j) => OPEN.includes(j.status)).length,
      },
      services: services.filter((s) => !s.archivedAt).length,
      paidTotal: paid.filter((p) => p.status === "held" || p.status === "released").reduce((n, p) => n + p.total, 0),
      earnedTotal: received.filter((p) => p.status === "released").reduce((n, p) => n + p.amount, 0),
    };
  },
});

/** Vendors waiting for an ID decision, oldest first, with the document link and number. */
export const verificationQueue = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const pending = await ctx.db.query("users").withIndex("by_verification", (q) => q.eq("verificationStatus", "pending")).collect();
    const rows = await Promise.all(
      pending
        .filter((u) => !u.deletedAt)
        .map(async (u) => {
          const meta = u.idDocumentStorageId ? await ctx.db.system.get(u.idDocumentStorageId) : null;
          return {
            ...userRow(u),
            service: u.service ?? "",
            yearsOfExperience: u.yearsOfExperience ?? "",
            idNumber: u.governmentIdNumber ?? "",
            documentUrl: u.idDocumentStorageId ? await ctx.storage.getUrl(u.idDocumentStorageId) : null,
            documentType: meta?.contentType ?? null,
            submittedAt: u.verificationSubmittedAt ? iso(u.verificationSubmittedAt) : null,
          };
        }),
    );
    return rows.sort((a, b) => (a.submittedAt ?? "").localeCompare(b.submittedAt ?? ""));
  },
});

export const jobs = query({
  args: { status: v.optional(v.string()), disputesOnly: v.optional(v.boolean()) },
  handler: async (ctx, { status, disputesOnly }) => {
    await requireAdmin(ctx);
    let list = await ctx.db.query("jobs").order("desc").collect();
    if (status && status !== "all") list = list.filter((j) => j.status === status);
    // "Needs attention": paid jobs that are stuck waiting on a confirmation.
    if (disputesOnly) list = list.filter((j) => j.status === "in_progress" || j.status === "marked_completed");
    list = list.slice(0, LIST_LIMIT);
    const who = await names(ctx, list.flatMap((j) => [j.customerId, j.vendorId]));
    return Promise.all(
      list.map(async (j) => {
        const pays = await ctx.db.query("payments").withIndex("by_job", (q) => q.eq("jobId", j._id)).collect();
        const p = pays[pays.length - 1];
        return {
          id: j._id as string,
          title: j.title,
          status: j.status,
          customer: who.get(j.customerId) ?? "",
          vendor: who.get(j.vendorId) ?? "",
          createdAt: iso(j._creationTime),
          amount: p?.amount ?? null,
          paymentStatus: p?.status ?? null,
        };
      }),
    );
  },
});

export const jobDetail = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const j = await ctx.db.get(id);
    if (!j) return null;
    const msgs = await ctx.db.query("messages").withIndex("by_job", (q) => q.eq("jobId", id)).collect();
    const quotes = await ctx.db.query("quotes").withIndex("by_job", (q) => q.eq("jobId", id)).collect();
    const pays = await ctx.db.query("payments").withIndex("by_job", (q) => q.eq("jobId", id)).collect();
    const who = await names(ctx, [j.customerId, j.vendorId, ...msgs.flatMap((m) => (m.senderId ? [m.senderId] : []))]);
    return {
      id: j._id as string,
      title: j.title,
      description: j.description,
      status: j.status,
      cancelledBy: j.cancelledBy ?? null,
      preferred: `${j.preferredDate} ${j.preferredTime}`,
      createdAt: iso(j._creationTime),
      customer: { id: j.customerId as string, name: who.get(j.customerId) ?? "" },
      vendor: { id: j.vendorId as string, name: who.get(j.vendorId) ?? "" },
      messages: msgs.map((m) => ({
        id: m._id as string,
        kind: m.kind,
        from: m.senderId ? (who.get(m.senderId) ?? "") : (m.systemTitle ?? "System"),
        body: m.kind === "quote" ? `Quote: ${formatNaira(quotes.find((q) => q._id === m.quoteId)?.amount ?? 0)}` : m.body,
        at: iso(m._creationTime),
      })),
      quotes: quotes.map((q) => ({ amount: q.amount, counterAmount: q.counterAmount ?? null, status: q.status })),
      payments: pays.map((p) => ({
        id: p._id as string,
        status: p.status,
        provider: p.provider,
        amount: p.amount,
        serviceFee: p.serviceFee,
        processingFee: p.processingFee,
        total: p.total,
        refundAmount: p.refundAmount ?? null,
        retainedFee: p.retainedFee ?? null,
      })),
    };
  },
});

export const payments = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    await requireAdmin(ctx);
    let list = await ctx.db.query("payments").order("desc").collect();
    if (status && status !== "all") list = list.filter((p) => p.status === status);
    list = list.slice(0, LIST_LIMIT);
    const who = await names(ctx, list.flatMap((p) => [p.customerId, p.vendorId]));
    return Promise.all(
      list.map(async (p) => ({
        id: p._id as string,
        jobId: p.jobId as string,
        job: (await ctx.db.get(p.jobId))?.title ?? "",
        customer: who.get(p.customerId) ?? "",
        vendor: who.get(p.vendorId) ?? "",
        status: p.status,
        provider: p.provider,
        amount: p.amount,
        fees: p.serviceFee + p.processingFee,
        total: p.total,
        refundAmount: p.refundAmount ?? null,
        createdAt: iso(p._creationTime),
      })),
    );
  },
});

export const services = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, { search }) => {
    await requireAdmin(ctx);
    const q = search?.trim().toLowerCase() ?? "";
    const list = await ctx.db.query("services").order("desc").collect();
    const who = await names(ctx, list.map((s) => s.vendorId));
    return list
      .map((s) => ({
        id: s._id as string,
        title: s.title,
        category: s.category,
        price: s.price,
        priceUnit: s.priceUnit,
        vendor: who.get(s.vendorId) ?? "",
        vendorId: s.vendorId as string,
        reviewCount: s.reviewCount,
        rating: s.reviewCount ? Math.round((s.ratingSum / s.reviewCount) * 10) / 10 : 0,
        archived: Boolean(s.archivedAt),
        createdAt: iso(s._creationTime),
      }))
      .filter((s) => !q || `${s.title} ${s.category} ${s.vendor}`.toLowerCase().includes(q))
      .slice(0, LIST_LIMIT);
  },
});

export const reviews = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const list = (await ctx.db.query("reviews").order("desc").collect()).slice(0, LIST_LIMIT);
    const who = await names(ctx, list.flatMap((r) => [r.customerId, r.vendorId]));
    return Promise.all(
      list.map(async (r) => ({
        id: r._id as string,
        rating: r.rating,
        body: r.body,
        response: r.response ?? null,
        author: who.get(r.customerId) ?? "",
        vendor: who.get(r.vendorId) ?? "",
        service: (await ctx.db.get(r.serviceId))?.title ?? "",
        hidden: Boolean(r.hiddenAt),
        createdAt: iso(r._creationTime),
      })),
    );
  },
});

export const feedback = query({
  args: { showResolved: v.optional(v.boolean()) },
  handler: async (ctx, { showResolved }) => {
    await requireAdmin(ctx);
    const list = (await ctx.db.query("feedback").order("desc").collect()).filter((f) => showResolved || !f.resolvedAt).slice(0, LIST_LIMIT);
    return Promise.all(
      list.map(async (f) => {
        const u = await ctx.db.get(f.userId);
        return {
          id: f._id as string,
          kind: f.kind,
          rating: f.rating ?? null,
          message: f.message,
          from: nameOf(u),
          email: f.canContact ? (u?.email ?? "") : "",
          role: f.role ?? null,
          page: f.page ?? null,
          resolved: Boolean(f.resolvedAt),
          createdAt: iso(f._creationTime),
        };
      }),
    );
  },
});

export const auditLog = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const list = await ctx.db.query("auditLog").order("desc").take(200);
    const who = await names(ctx, list.map((a) => a.adminId));
    return list.map((a) => ({
      id: a._id as string,
      admin: who.get(a.adminId) ?? "",
      action: a.action,
      targetType: a.targetType,
      targetId: a.targetId,
      note: a.note ?? null,
      at: iso(a._creationTime),
    }));
  },
});

// ================================================================ actions

export const decideVerification = mutation({
  args: { userId: v.id("users"), decision: v.union(v.literal("verified"), v.literal("rejected")), note: v.optional(v.string()) },
  handler: async (ctx, { userId, decision, note }) => {
    const admin = await requireAdmin(ctx);
    const u = await ctx.db.get(userId);
    if (!u || u.deletedAt || u.role !== "vendor") throw new ConvexError("That vendor no longer exists.");
    if (!u.idDocumentStorageId) throw new ConvexError("This vendor hasn't uploaded an ID document.");
    const reason = note?.trim();
    if (decision === "rejected" && !reason) throw new ConvexError("Say why, so the vendor knows what to fix.");
    await ctx.db.patch(userId, {
      verificationStatus: decision,
      verifiedAt: decision === "verified" ? Date.now() : undefined,
      verificationNote: decision === "rejected" ? reason!.slice(0, 300) : undefined,
    });
    await audit(ctx, admin, decision === "verified" ? "verify_vendor" : "reject_verification", "user", userId, reason);
    await notify(ctx, userId, {
      type: "account_update",
      title: decision === "verified" ? "You're Verified" : "ID Not Approved",
      body:
        decision === "verified"
          ? "Your ID has been checked. The verified badge now shows on your profile and services."
          : `We couldn't verify your ID: ${reason}. Upload it again from Settings → Business.`,
    });
  },
});

export const setSuspended = mutation({
  args: { userId: v.id("users"), suspended: v.boolean(), reason: v.optional(v.string()) },
  handler: async (ctx, { userId, suspended, reason }) => {
    const admin = await requireAdmin(ctx);
    if (userId === admin._id) throw new ConvexError("You can't suspend your own account.");
    const u = await ctx.db.get(userId);
    if (!u || u.deletedAt) throw new ConvexError("That account no longer exists.");
    if (suspended && u.isAdmin) throw new ConvexError("Remove admin access (from the CLI) before suspending an admin.");
    const why = reason?.trim();
    if (suspended && !why) throw new ConvexError("Give a reason for the suspension.");
    await ctx.db.patch(userId, suspended ? { suspendedAt: Date.now(), suspendedReason: why!.slice(0, 300) } : { suspendedAt: undefined, suspendedReason: undefined });
    await audit(ctx, admin, suspended ? "suspend_user" : "unsuspend_user", "user", userId, why);
  },
});

/**
 * Settle a job as support (disputes, no-shows, stuck confirmations):
 *  • refund_customer — job cancelled; any escrow is refunded in full (no fee kept).
 *  • release_vendor  — job completed; escrow released to the vendor.
 */
export const resolveJob = mutation({
  args: { jobId: v.id("jobs"), outcome: v.union(v.literal("refund_customer"), v.literal("release_vendor")), note: v.string() },
  handler: async (ctx, { jobId, outcome, note }) => {
    const admin = await requireAdmin(ctx);
    const job = await ctx.db.get(jobId);
    if (!job) throw new ConvexError("That job no longer exists.");
    if (!OPEN.includes(job.status)) throw new ConvexError("This job is already closed.");
    const why = note.trim();
    if (why.length < 5) throw new ConvexError("Add a short note explaining the decision.");
    if (outcome === "release_vendor" && job.status !== "in_progress" && job.status !== "marked_completed") {
      throw new ConvexError("Only a paid job can be released to the vendor.");
    }
    if (outcome === "refund_customer") {
      await ctx.db.patch(jobId, { status: "cancelled", cancelledBy: "admin", closedAt: Date.now() });
      await closeQuotes(ctx, job);
      const refund = await settleOnCancel(ctx, job, "vendor"); // full refund, no fee kept
      const text = `Handiwork support closed this job${refund ? ` and refunded ${formatNaira(refund.refundAmount)} to the customer` : ""}. ${why}`;
      await systemMessage(ctx, jobId, "Support Decision", text);
      for (const uid of [job.customerId, job.vendorId]) {
        await notify(ctx, uid, { type: "job_cancelled", title: "Job Closed by Support", body: `"${job.title}": ${text}`, jobId });
      }
    } else {
      await ctx.db.patch(jobId, { status: "completed", closedAt: Date.now() });
      const paid = await release(ctx, job);
      const text = `Handiwork support completed this job${paid ? ` and released ${formatNaira(paid.amount)} to the provider` : ""}. ${why}`;
      await systemMessage(ctx, jobId, "Support Decision", text);
      for (const uid of [job.customerId, job.vendorId]) {
        await notify(ctx, uid, { type: "job_update", title: "Job Completed by Support", body: `"${job.title}": ${text}`, jobId });
      }
    }
    await audit(ctx, admin, outcome === "refund_customer" ? "refund_job" : "release_job", "job", jobId, why);
  },
});

export const setServiceArchived = mutation({
  args: { serviceId: v.id("services"), archived: v.boolean(), note: v.optional(v.string()) },
  handler: async (ctx, { serviceId, archived, note }) => {
    const admin = await requireAdmin(ctx);
    const s = await ctx.db.get(serviceId);
    if (!s) throw new ConvexError("That service no longer exists.");
    await ctx.db.patch(serviceId, { archivedAt: archived ? Date.now() : undefined });
    await audit(ctx, admin, archived ? "archive_service" : "restore_service", "service", serviceId, note);
  },
});

export const setReviewHidden = mutation({
  args: { reviewId: v.id("reviews"), hidden: v.boolean(), note: v.optional(v.string()) },
  handler: async (ctx, { reviewId, hidden, note }) => {
    const admin = await requireAdmin(ctx);
    const r = await ctx.db.get(reviewId);
    if (!r) throw new ConvexError("That review no longer exists.");
    if (Boolean(r.hiddenAt) === hidden) return;
    await ctx.db.patch(reviewId, { hiddenAt: hidden ? Date.now() : undefined });
    // Hidden reviews don't count toward the service rating.
    await adjustService(ctx, r.serviceId, hidden ? -r.rating : r.rating, hidden ? -1 : 1);
    await audit(ctx, admin, hidden ? "hide_review" : "restore_review", "review", reviewId, note);
  },
});

export const setFeedbackResolved = mutation({
  args: { feedbackId: v.id("feedback"), resolved: v.boolean() },
  handler: async (ctx, { feedbackId, resolved }) => {
    const admin = await requireAdmin(ctx);
    const f = await ctx.db.get(feedbackId);
    if (!f) throw new ConvexError("That feedback no longer exists.");
    await ctx.db.patch(feedbackId, { resolvedAt: resolved ? Date.now() : undefined });
    await audit(ctx, admin, resolved ? "resolve_feedback" : "reopen_feedback", "feedback", feedbackId);
  },
});

// ================================================================ CLI only

/**
 * Give or remove admin access. Internal — run from a terminal with deployment access:
 *   npx convex run admin:grantAdmin '{"email":"you@example.com"}'
 *   npx convex run admin:grantAdmin '{"email":"you@example.com","revoke":true}'
 * (add --prod for production). The account must already exist.
 */
export const grantAdmin = internalMutation({
  args: { email: v.string(), revoke: v.optional(v.boolean()) },
  handler: async (ctx, { email, revoke }) => {
    const u = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email.trim().toLowerCase())).first();
    if (!u) return `No account with ${email}. Sign up first, then run this again.`;
    await ctx.db.patch(u._id, { isAdmin: revoke ? undefined : true });
    return revoke ? `Removed admin access from ${email}.` : `${email} is now an admin. Open /admin.`;
  },
});

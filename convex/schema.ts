// App schema. authTables are Convex Auth's own tables (authSessions, authAccounts, …);
// we override `users` to carry the signup profile. Everything beyond email is OPTIONAL
// so OAuth logins (Google supplies only name/email/image) still validate.
//
// Marketplace data: services (vendor listings) → jobs (a customer's request to one
// vendor) → quotes + messages (the job's chat) → payments (escrow per accepted quote)
// → reviews (one per completed job). Notifications are written by the mutations that
// change those. The UI types in types/ are produced from these docs in convex/model.ts.
//
// Retention: users are tombstoned (deletedAt, personal fields cleared) rather than
// deleted, so jobs, messages, reviews and payments that point at them stay valid for
// the other party and for the financial record. See users.deleteAccount.
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const roleV = v.union(v.literal("customer"), v.literal("vendor"));
export const priceUnitV = v.union(v.literal("hr"), v.literal("day"), v.literal("wk"));
export const jobStatusV = v.union(
  v.literal("pending"), // requested, waiting for a quote
  v.literal("quoted"), // vendor sent a quote
  v.literal("in_progress"), // quote paid into escrow
  v.literal("marked_completed"), // vendor says done, awaiting customer confirmation
  v.literal("completed"), // customer confirmed; escrow released
  v.literal("cancelled"), // either party cancelled
  v.literal("rejected"), // vendor declined the request
);
export const quoteStatusV = v.union(
  v.literal("pending"),
  v.literal("countered"),
  v.literal("accepted"), // customer accepted; payment started
  v.literal("paid"), // payment held in escrow
  v.literal("superseded"), // replaced by a newer quote / job closed
);
export const paymentStatusV = v.union(
  v.literal("pending"), // created at quote acceptance, not yet paid
  v.literal("held"), // in escrow
  v.literal("released"), // paid out to the vendor's balance
  v.literal("refunded"), // returned to the customer (fully or partly — see refundAmount)
  v.literal("failed"),
);
export const notificationTypeV = v.union(
  v.literal("job_inquiry"),
  v.literal("quote_received"),
  v.literal("payment_received"),
  v.literal("payment_released"),
  v.literal("job_update"),
  v.literal("job_cancelled"),
  v.literal("new_review"),
  v.literal("account_update"), // verification decisions, suspension
);
export const verificationStatusV = v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected"));

export default defineSchema({
  ...authTables,
  users: defineTable({
    // --- base fields Convex Auth reads/writes ---
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // --- Handiwork signup profile fields (see types/user.ts) ---
    role: v.optional(roleV),
    fullName: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    state: v.optional(v.string()),
    area: v.optional(v.string()),
    address: v.optional(v.string()),
    // --- Vendor-only signup fields (Business Information + Verification steps) ---
    service: v.optional(v.string()),
    yearsOfExperience: v.optional(v.string()),
    businessBio: v.optional(v.string()),
    governmentIdNumber: v.optional(v.string()),
    // --- Settings ---
    // Notification preferences (Settings > Notifications). Missing = all on.
    notificationPrefs: v.optional(
      v.object({
        jobUpdates: v.boolean(),
        messages: v.boolean(),
        payments: v.boolean(),
        reviews: v.boolean(),
        tips: v.boolean(),
        email: v.boolean(),
      }),
    ),
    // --- Vendor ID verification (Settings → Business / signup Verification step) ---
    // The document lives in Convex storage and is only ever shown to admins.
    idDocumentStorageId: v.optional(v.id("_storage")),
    verificationStatus: v.optional(verificationStatusV),
    verificationSubmittedAt: v.optional(v.number()),
    verifiedAt: v.optional(v.number()),
    verificationNote: v.optional(v.string()), // why it was rejected (shown to the vendor)
    // --- Platform control ---
    isAdmin: v.optional(v.boolean()), // granted only from the CLI: npx convex run admin:grantAdmin
    suspendedAt: v.optional(v.number()),
    suspendedReason: v.optional(v.string()),
    // --- Lifecycle ---
    demo: v.optional(v.boolean()), // seeded showcase account (no sign-in); see seed.ts
    deletedAt: v.optional(v.number()), // tombstone: account deleted, record kept for history
  })
    .index("email", ["email"])
    .index("by_verification", ["verificationStatus"]),

  services: defineTable({
    vendorId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(), // whole naira
    priceUnit: priceUnitV,
    images: v.array(v.string()),
    ratingSum: v.number(), // maintained by reviews.* (average = ratingSum / reviewCount)
    reviewCount: v.number(),
    archivedAt: v.optional(v.number()), // hidden from customers; kept for past jobs
  })
    .index("by_vendor", ["vendorId"])
    .index("by_category", ["category"]),

  jobs: defineTable({
    customerId: v.id("users"),
    vendorId: v.id("users"),
    serviceId: v.id("services"),
    title: v.string(),
    description: v.string(),
    status: jobStatusV,
    preferredDate: v.string(), // YYYY-MM-DD
    preferredTime: v.string(), // HH:MM
    images: v.array(v.string()),
    cancelledBy: v.optional(v.union(v.literal("customer"), v.literal("vendor"), v.literal("admin"))),
    closedAt: v.optional(v.number()), // completed / cancelled / rejected
  })
    .index("by_customer", ["customerId"])
    .index("by_vendor", ["vendorId"]),

  quotes: defineTable({
    jobId: v.id("jobs"),
    vendorId: v.id("users"),
    customerId: v.id("users"),
    amount: v.number(),
    counterAmount: v.optional(v.number()),
    status: quoteStatusV,
  }).index("by_job", ["jobId"]),

  // The job's chat. senderId is absent for system notices.
  messages: defineTable({
    jobId: v.id("jobs"),
    senderId: v.optional(v.id("users")),
    kind: v.union(v.literal("text"), v.literal("quote"), v.literal("system")),
    body: v.string(),
    quoteId: v.optional(v.id("quotes")),
    systemTitle: v.optional(v.string()),
    readAt: v.optional(v.number()), // when the other participant read it
  }).index("by_job", ["jobId"]),

  // Escrow, one per accepted quote. Amounts in whole naira. The customer pays
  // total = amount + serviceFee + processingFee; the vendor receives `amount` on
  // release. Payments are financial records: never deleted (see users.deleteAccount).
  payments: defineTable({
    jobId: v.id("jobs"),
    quoteId: v.id("quotes"),
    customerId: v.id("users"),
    vendorId: v.id("users"),
    amount: v.number(),
    serviceFee: v.number(),
    processingFee: v.number(),
    total: v.number(),
    status: paymentStatusV,
    provider: v.union(v.literal("flutterwave"), v.literal("simulated")),
    providerRef: v.optional(v.string()),
    heldAt: v.optional(v.number()),
    releasedAt: v.optional(v.number()),
    refundedAt: v.optional(v.number()),
    refundAmount: v.optional(v.number()),
    retainedFee: v.optional(v.number()), // service fee kept on a late customer cancellation
  })
    .index("by_job", ["jobId"])
    .index("by_vendor", ["vendorId"])
    .index("by_customer", ["customerId"]),

  reviews: defineTable({
    jobId: v.optional(v.id("jobs")), // absent only for seeded showcase reviews
    serviceId: v.id("services"),
    vendorId: v.id("users"),
    customerId: v.id("users"),
    rating: v.number(), // 1–5
    body: v.string(),
    response: v.optional(v.string()),
    hiddenAt: v.optional(v.number()), // removed by an admin (moderation); excluded from ratings
  })
    .index("by_vendor", ["vendorId"])
    .index("by_service", ["serviceId"])
    .index("by_job", ["jobId"])
    .index("by_customer", ["customerId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: notificationTypeV,
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    jobId: v.optional(v.id("jobs")),
  }).index("by_user", ["userId"]),

  // Product feedback sent from the dashboard Feedback screen.
  feedback: defineTable({
    userId: v.id("users"),
    role: v.optional(roleV),
    kind: v.union(v.literal("suggestion"), v.literal("problem"), v.literal("compliment"), v.literal("other")),
    rating: v.optional(v.number()),
    message: v.string(),
    canContact: v.boolean(),
    page: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // Every admin action, for accountability. Never edited or deleted.
  auditLog: defineTable({
    adminId: v.id("users"),
    action: v.string(), // e.g. "verify_vendor", "suspend_user", "refund_job"
    targetType: v.string(), // "user" | "job" | "service" | "review" | "feedback"
    targetId: v.string(),
    note: v.optional(v.string()),
  }),
});

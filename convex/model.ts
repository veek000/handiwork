// Shared server helpers: auth checks, doc → UI-type mapping (the shapes in types/),
// escrow fees, and notification writes. Not a Convex function module — no exports
// here are callable from the client.
import { ConvexError } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const SIGNED_OUT = "You're signed out. Log in again to continue.";
export const DELETED_NAME = "Deleted user";

// ---------------------------------------------------------------- auth

export async function viewerOrNull(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  const user = await ctx.db.get(userId);
  return user && !user.deletedAt ? user : null;
}

export const SUSPENDED = "Your account is suspended. Contact support if you think this is a mistake.";

export async function requireViewer(ctx: QueryCtx, role?: "customer" | "vendor"): Promise<Doc<"users">> {
  const user = await viewerOrNull(ctx);
  if (!user) throw new ConvexError(SIGNED_OUT);
  if (user.suspendedAt) throw new ConvexError(SUSPENDED);
  if (role && !user.role) throw new ConvexError("Finish setting up your account first.");
  if (role && user.role !== role) {
    throw new ConvexError(role === "vendor" ? "Only service providers can do that." : "Only customers can do that.");
  }
  return user;
}

/** Admins only (users.isAdmin, granted from the CLI). Suspension applies to admins too. */
export async function requireAdmin(ctx: QueryCtx): Promise<Doc<"users">> {
  const user = await viewerOrNull(ctx);
  if (!user?.isAdmin || user.suspendedAt) throw new ConvexError("Admins only.");
  return user;
}

/** Records an admin action (auditLog). */
export async function audit(
  ctx: MutationCtx,
  admin: Doc<"users">,
  action: string,
  targetType: string,
  targetId: string,
  note?: string,
) {
  await ctx.db.insert("auditLog", { adminId: admin._id, action, targetType, targetId, note: note?.slice(0, 500) });
}

/** For display/mapping only. Accounts still choosing a role (new Google/Facebook
 *  sign-ups) read as customers; anything role-restricted checks `user.role` itself. */
export const roleOf = (u: Doc<"users">) => u.role ?? "customer";

// ---------------------------------------------------------------- mapping to types/

export const iso = (ms: number) => new Date(ms).toISOString();

export function nameOf(u: Doc<"users"> | null | undefined): string {
  if (!u) return "Unknown";
  if (u.deletedAt) return DELETED_NAME;
  return u.fullName || u.name || u.email || "Handiwork user";
}

export function locationOf(u: Doc<"users"> | null | undefined): string {
  if (!u || u.deletedAt) return "";
  if (u.area && u.state) return `${u.area}, ${u.state}`;
  return u.state || u.area || "Nigeria";
}

/** "3–5 years" → 3, "Less than 1 year" → 0, "More than 10 years" → 10. */
export function yearsFromBand(band?: string): number {
  if (!band || /less than/i.test(band)) return 0;
  const n = band.match(/\d+/);
  return n ? Number(n[0]) : 0;
}

export function toUser(u: Doc<"users">) {
  return {
    id: u._id as string,
    role: roleOf(u),
    fullName: nameOf(u),
    email: u.deletedAt ? "" : u.email ?? "",
    phone: u.phone ?? "",
    countryCode: u.countryCode ?? "+234",
    state: u.state ?? "",
    area: u.area ?? "",
    address: u.address ?? "",
    location: locationOf(u),
    avatarUrl: u.deletedAt ? undefined : u.image,
  };
}

/** VendorUser with aggregates computed from reviews + completed jobs. */
export async function toVendor(ctx: QueryCtx, u: Doc<"users">) {
  const reviews = (await ctx.db.query("reviews").withIndex("by_vendor", (q) => q.eq("vendorId", u._id)).collect()).filter(
    (r) => !r.hiddenAt,
  );
  const jobs = await ctx.db.query("jobs").withIndex("by_vendor", (q) => q.eq("vendorId", u._id)).collect();
  const sum = reviews.reduce((n, r) => n + r.rating, 0);
  return {
    ...toUser(u),
    role: "vendor" as const,
    bio: u.businessBio ?? "",
    yearsOfExperience: yearsFromBand(u.yearsOfExperience),
    jobsCompleted: jobs.filter((j) => j.status === "completed").length,
    ratingAverage: reviews.length ? Math.round((sum / reviews.length) * 10) / 10 : 0,
    reviewCount: reviews.length,
    availability: "available" as const,
    // Only after an admin has checked their ID document (admin.decideVerification).
    verified: u.verificationStatus === "verified",
  };
}

export function toService(s: Doc<"services">) {
  return {
    id: s._id as string,
    title: s.title,
    description: s.description,
    category: s.category,
    price: s.price,
    priceUnit: s.priceUnit,
    images: s.images.length ? s.images : ["/assets/img/service-cleaner.jpg"],
    providerId: s.vendorId as string,
    ratingAverage: s.reviewCount ? Math.round((s.ratingSum / s.reviewCount) * 10) / 10 : 0,
    reviewCount: s.reviewCount,
  };
}

export function toJob(j: Doc<"jobs">) {
  return {
    id: j._id as string,
    title: j.title,
    description: j.description,
    status: j.status,
    serviceId: j.serviceId as string,
    customerId: j.customerId as string,
    vendorId: j.vendorId as string,
    preferredDate: j.preferredDate,
    preferredTime: j.preferredTime,
    images: j.images,
    createdAt: iso(j._creationTime),
  };
}

export async function toReview(ctx: QueryCtx, r: Doc<"reviews">) {
  const author = await ctx.db.get(r.customerId);
  return {
    id: r._id as string,
    authorName: author?.deletedAt ? "Former customer" : nameOf(author),
    authorLocation: locationOf(author),
    authorAvatarUrl: author?.deletedAt ? undefined : author?.image,
    rating: Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5,
    body: r.body,
    response: r.response,
    serviceId: r.serviceId as string,
    jobId: r.jobId as string | undefined,
    vendorId: r.vendorId as string,
  };
}

/** Users referenced by a set of ids (deduplicated), mapped for the UI. */
export async function usersById(ctx: QueryCtx, ids: Id<"users">[]) {
  const unique = [...new Set(ids)];
  const docs = await Promise.all(unique.map((id) => ctx.db.get(id)));
  return docs.filter((d): d is Doc<"users"> => d !== null);
}

// ---------------------------------------------------------------- escrow fees

// PROJECT.md "Payments": 2% service fee (Handiwork) + Flutterwave's processing fee
// passed through at cost (~1.4%). Both are added on top of the vendor's quote.
export const SERVICE_FEE_RATE = 0.02;
export const PROCESSING_FEE_RATE = 0.014;

export function feesFor(amount: number) {
  const serviceFee = Math.round(amount * SERVICE_FEE_RATE);
  const processingFee = Math.round(amount * PROCESSING_FEE_RATE);
  return { serviceFee, processingFee, total: amount + serviceFee + processingFee };
}

// ---------------------------------------------------------------- side effects

type NotificationType = Doc<"notifications">["type"];

const PREF_FOR: Record<NotificationType, keyof NonNullable<Doc<"users">["notificationPrefs"]> | null> = {
  job_inquiry: "jobUpdates",
  quote_received: "jobUpdates",
  job_update: "jobUpdates",
  job_cancelled: "jobUpdates",
  new_review: "reviews",
  payment_received: null, // payment notices are always sent (Settings says so)
  payment_released: null,
  account_update: null, // verification decisions: always sent
};

/** In-app notification, honouring the recipient's Settings → Notifications choices. */
export async function notify(
  ctx: MutationCtx,
  userId: Id<"users">,
  n: { type: NotificationType; title: string; body: string; jobId?: Id<"jobs"> },
) {
  const user = await ctx.db.get(userId);
  if (!user || user.deletedAt || user.demo) return;
  const pref = PREF_FOR[n.type];
  if (pref && user.notificationPrefs && !user.notificationPrefs[pref]) return;
  await ctx.db.insert("notifications", { userId, read: false, ...n });
}

/** A system notice in the job's chat. */
export async function systemMessage(ctx: MutationCtx, jobId: Id<"jobs">, systemTitle: string, body: string) {
  await ctx.db.insert("messages", { jobId, kind: "system", body, systemTitle });
}

export function formatNaira(n: number) {
  return `NGN${n.toLocaleString("en-US")}`;
}

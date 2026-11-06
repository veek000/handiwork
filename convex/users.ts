// Current signed-in user + the Settings screen's reads and writes. Every function
// resolves the caller from the auth session (never from an argument), so a user can
// only read or change their own account.
import { ConvexError, v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query, type QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { SUSPENDED, viewerOrNull } from "./model";
import { checkDocument } from "./files";
import {
  getAuthSessionId,
  getAuthUserId,
  invalidateSessions,
  modifyAccountCredentials,
  retrieveAccount,
} from "@convex-dev/auth/server";

const MIN_PASSWORD = 8;
const SIGNED_OUT = "You're signed out. Log in again to continue.";

async function requireUserId(ctx: QueryCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError(SIGNED_OUT);
  return userId;
}

// Used client-side after login to route by the account's real role (customer →
// /customer, vendor → /vendor) and by the dashboards for the header identity and
// Settings. Returns null when unauthenticated (or the account was deleted). The
// government ID number never leaves the server — only whether one is on file.
export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (!user || user.deletedAt) return null;
    // The ID number and document stay server-side (admins see them in the admin area).
    const { governmentIdNumber, idDocumentStorageId, ...safe } = user;
    return { ...safe, hasGovernmentId: Boolean(governmentIdNumber), hasIdDocument: Boolean(idDocumentStorageId) };
  },
});

const roleArg = v.union(v.literal("customer"), v.literal("vendor"));

/**
 * First-time setup for accounts created with Google / Facebook (they arrive with no
 * role): pick customer or service provider and fill the same profile fields as the
 * signup wizard. Only works once — the role can't be changed afterwards.
 */
export const chooseRole = mutation({
  args: {
    role: roleArg,
    fullName: v.string(),
    countryCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    state: v.optional(v.string()),
    area: v.optional(v.string()),
    address: v.optional(v.string()),
    service: v.optional(v.string()),
    yearsOfExperience: v.optional(v.string()),
    businessBio: v.optional(v.string()),
  },
  handler: async (ctx, { role, ...f }) => {
    const user = await viewerOrNull(ctx);
    if (!user) throw new ConvexError(SIGNED_OUT);
    if (user.suspendedAt) throw new ConvexError(SUSPENDED);
    if (user.role) throw new ConvexError("Your account is already set up.");
    const fullName = f.fullName.trim().slice(0, 80);
    if (fullName.length < 2) throw new ConvexError("Enter your full name.");
    const phone = clean(f.phone, 20)?.replace(/\s/g, "");
    if (phone && !/^\d{7,15}$/.test(phone)) throw new ConvexError("Enter a valid phone number (digits only).");
    if (role === "vendor" && !f.service?.trim()) throw new ConvexError("Choose the service you offer.");
    await ctx.db.patch(user._id, {
      role,
      fullName,
      name: fullName,
      countryCode: clean(f.countryCode, 6) || "+234",
      phone: phone || undefined,
      state: clean(f.state, 60) || undefined,
      area: clean(f.area, 60) || undefined,
      address: clean(f.address, 160) || undefined,
      ...(role === "vendor"
        ? {
            service: clean(f.service, 60),
            yearsOfExperience: clean(f.yearsOfExperience, 30) || undefined,
            businessBio: clean(f.businessBio, 600) || undefined,
          }
        : {}),
    });
  },
});

/**
 * Vendor sends their ID for review (signup Verification step, Settings → Business):
 * the ID number plus a photo/scan of the document, uploaded to storage first. Status
 * becomes "pending" until an admin decides (admin.decideVerification). A verified vendor
 * can't resubmit; a pending or rejected one can replace what they sent.
 */
export const submitVerification = mutation({
  args: { idNumber: v.string(), documentStorageId: v.id("_storage") },
  handler: async (ctx, { idNumber, documentStorageId }) => {
    const user = await viewerOrNull(ctx);
    if (!user) throw new ConvexError(SIGNED_OUT);
    if (user.suspendedAt) throw new ConvexError(SUSPENDED);
    if (user.role !== "vendor") throw new ConvexError("Only service providers verify their ID.");
    if (user.verificationStatus === "verified") throw new ConvexError("You're already verified.");
    const number = idNumber.trim().replace(/\s+/g, " ");
    if (number.length < 5 || number.length > 30) throw new ConvexError("Enter the ID number as it appears on the document.");
    await checkDocument(ctx, documentStorageId);
    if (user.idDocumentStorageId && user.idDocumentStorageId !== documentStorageId) {
      await ctx.storage.delete(user.idDocumentStorageId); // replaced
    }
    await ctx.db.patch(user._id, {
      governmentIdNumber: number,
      idDocumentStorageId: documentStorageId,
      verificationStatus: "pending",
      verificationSubmittedAt: Date.now(),
      verificationNote: undefined,
    });
  },
});

// How the account signs in (Settings → Security): "password" and/or OAuth provider ids.
export const signInMethods = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const accounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
      .collect();
    return accounts.map((a) => a.provider);
  },
});

const clean = (s: string | undefined, max: number) => (s === undefined ? undefined : s.trim().slice(0, max));

// Settings → Profile / Business. Only fields that were sent are changed. Email and
// role are not editable here (email is the sign-in identity; role decides the dashboard).
export const updateProfile = mutation({
  args: {
    fullName: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    phone: v.optional(v.string()),
    state: v.optional(v.string()),
    area: v.optional(v.string()),
    address: v.optional(v.string()),
    service: v.optional(v.string()),
    yearsOfExperience: v.optional(v.string()),
    businessBio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const patch: Record<string, string | undefined> = {
      fullName: clean(args.fullName, 80),
      countryCode: clean(args.countryCode, 6),
      phone: clean(args.phone, 20)?.replace(/\s/g, ""),
      state: clean(args.state, 60),
      area: clean(args.area, 60),
      address: clean(args.address, 160),
      service: clean(args.service, 60),
      yearsOfExperience: clean(args.yearsOfExperience, 30),
      businessBio: clean(args.businessBio, 600),
    };
    if (patch.fullName !== undefined && patch.fullName.length < 2) throw new ConvexError("Enter your full name.");
    if (patch.phone && !/^\d{7,15}$/.test(patch.phone)) throw new ConvexError("Enter a valid phone number (digits only).");
    // Keep the auth `name` in step with fullName (as the signup profile() does).
    if (patch.fullName !== undefined) patch.name = patch.fullName;
    const defined = Object.fromEntries(Object.entries(patch).filter(([, val]) => val !== undefined));
    await ctx.db.patch(userId, defined);
  },
});

export const updateNotificationPrefs = mutation({
  args: {
    prefs: v.object({
      jobUpdates: v.boolean(),
      messages: v.boolean(),
      payments: v.boolean(),
      reviews: v.boolean(),
      tips: v.boolean(),
      email: v.boolean(),
    }),
  },
  handler: async (ctx, { prefs }) => {
    const userId = await requireUserId(ctx);
    await ctx.db.patch(userId, { notificationPrefs: prefs });
  },
});

// --- Password + sessions (actions: the Convex Auth account helpers need ActionCtx) ---

export const _passwordEmail = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const account = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId).eq("provider", "password"))
      .unique();
    return account?.providerAccountId ?? null;
  },
});

export const changePassword = action({
  args: { current: v.string(), next: v.string() },
  handler: async (ctx, { current, next }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(SIGNED_OUT);
    const email: string | null = await ctx.runQuery(internal.users._passwordEmail, { userId });
    if (!email) throw new ConvexError("This account signs in with Google, so it has no password to change.");
    if (next.length < MIN_PASSWORD) throw new ConvexError(`Use at least ${MIN_PASSWORD} characters.`);
    if (next === current) throw new ConvexError("The new password must be different from the current one.");
    try {
      await retrieveAccount(ctx, { provider: "password", account: { id: email, secret: current } });
    } catch {
      throw new ConvexError("Your current password is incorrect.");
    }
    await modifyAccountCredentials(ctx, { provider: "password", account: { id: email, secret: next } });
    // Sign out everywhere else: whoever knew the old password loses access.
    const sessionId = await getAuthSessionId(ctx);
    await invalidateSessions(ctx, { userId, except: sessionId ? [sessionId] : [] });
  },
});

export const signOutOtherDevices = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(SIGNED_OUT);
    const sessionId = await getAuthSessionId(ctx);
    await invalidateSessions(ctx, { userId, except: sessionId ? [sessionId] : [] });
  },
});

// Settings → Delete account, with retention rules:
//   • Blocked while the account has open jobs or money in escrow — finish or cancel them
//     first, so nobody is left with an unfinished job or unsettled payment.
//   • Removed: sign-in accounts + codes (so the email can sign up again), sessions,
//     notifications, feedback, and every personal field on the profile.
//   • Kept, de-identified: the users row itself as a tombstone (deletedAt), so jobs,
//     chat history, reviews and payments that reference it stay intact for the other
//     party. The UI shows "Deleted user" / "Former customer" in its place.
//   • Kept unchanged: payments — financial records for accounting and disputes.
//   • A vendor's services are archived (hidden from customers, kept for past jobs).
export const deleteAccount = action({
  args: { confirm: v.string() },
  handler: async (ctx, { confirm }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError(SIGNED_OUT);
    if (confirm !== "DELETE") throw new ConvexError("Type DELETE to confirm.");
    await ctx.runMutation(internal.users._retireUser, { userId });
    await invalidateSessions(ctx, { userId });
  },
});

const OPEN_STATUSES = ["pending", "quoted", "in_progress", "marked_completed"];

export const _retireUser = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user || user.deletedAt) return;

    const jobs = [
      ...(await ctx.db.query("jobs").withIndex("by_customer", (q) => q.eq("customerId", userId)).collect()),
      ...(await ctx.db.query("jobs").withIndex("by_vendor", (q) => q.eq("vendorId", userId)).collect()),
    ];
    const open = jobs.filter((j) => OPEN_STATUSES.includes(j.status)).length;
    if (open) {
      throw new ConvexError(
        `You have ${open} open job${open === 1 ? "" : "s"}. Finish or cancel ${open === 1 ? "it" : "them"} before deleting your account.`,
      );
    }
    const payments = [
      ...(await ctx.db.query("payments").withIndex("by_customer", (q) => q.eq("customerId", userId)).collect()),
      ...(await ctx.db.query("payments").withIndex("by_vendor", (q) => q.eq("vendorId", userId)).collect()),
    ];
    if (payments.some((p) => p.status === "held")) {
      throw new ConvexError("You have money held in escrow. Contact support so it can be settled before you leave.");
    }

    const accounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
      .collect();
    for (const account of accounts) {
      const codes = await ctx.db
        .query("authVerificationCodes")
        .withIndex("accountId", (q) => q.eq("accountId", account._id))
        .collect();
      for (const code of codes) await ctx.db.delete(code._id);
      await ctx.db.delete(account._id);
    }
    for (const n of await ctx.db.query("notifications").withIndex("by_user", (q) => q.eq("userId", userId)).collect()) {
      await ctx.db.delete(n._id);
    }
    for (const f of await ctx.db.query("feedback").withIndex("by_user", (q) => q.eq("userId", userId)).collect()) {
      await ctx.db.delete(f._id);
    }
    const now = Date.now();
    for (const s of await ctx.db.query("services").withIndex("by_vendor", (q) => q.eq("vendorId", userId)).collect()) {
      if (!s.archivedAt) await ctx.db.patch(s._id, { archivedAt: now });
    }
    if (user.idDocumentStorageId) await ctx.storage.delete(user.idDocumentStorageId);
    // Tombstone: keep the row (and role), clear everything personal.
    await ctx.db.patch(userId, {
      deletedAt: now,
      name: undefined,
      fullName: undefined,
      email: undefined,
      image: undefined,
      phone: undefined,
      countryCode: undefined,
      state: undefined,
      area: undefined,
      address: undefined,
      service: undefined,
      yearsOfExperience: undefined,
      businessBio: undefined,
      governmentIdNumber: undefined,
      idDocumentStorageId: undefined,
      verificationNote: undefined,
      notificationPrefs: undefined,
      emailVerificationTime: undefined,
      phoneVerificationTime: undefined,
    });
  },
});

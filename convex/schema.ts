// Real app schema (Phase 6 — auth). authTables are Convex Auth's own tables
// (authSessions, authAccounts, …). We OVERRIDE the `users` table to carry the
// profile fields the signup wizard collects. Everything beyond email is OPTIONAL
// so OAuth logins (Google/Facebook supply only name/email/image) still validate.
//
// NOTE: this is auth-only for now. The real Job/Service/Conversation/etc. tables
// (from types/) are NOT modelled here yet — that lands when dashboards move off
// mocks (the deferred "full" pass). Kept intentionally minimal.
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  // Overrides authTables.users with our extra profile fields. The base auth fields
  // (name, email, image, emailVerificationTime, phone, …) are still permitted; we
  // add ours as optional so both password sign-up and OAuth produce valid docs.
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
    role: v.optional(v.union(v.literal("customer"), v.literal("vendor"))),
    fullName: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    state: v.optional(v.string()),
    area: v.optional(v.string()),
    address: v.optional(v.string()),
    // --- Vendor-only signup fields (Business Information + Verification steps) ---
    // All optional: customers never set them, and OAuth accounts have no role yet.
    service: v.optional(v.string()),
    yearsOfExperience: v.optional(v.string()),
    businessBio: v.optional(v.string()),
    governmentIdNumber: v.optional(v.string()),
  }).index("email", ["email"]),
});

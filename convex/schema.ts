// ⚠️ SPIKE — THROWAWAY. Not the real app schema.
//
// `authTables` are Convex Auth's OWN required tables (users, authSessions,
// authAccounts, …) — needed for auth to function. They are NOT the real app's
// User type. `spikeMessages` is a bare chat table with zero relationship to the
// real Conversation/Message types. None of this is wired into the Phase 2 types
// or the planned Phase 6 schema. Delete the whole convex/ dir when the spike ends.
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  spikeMessages: defineTable({
    body: v.string(),
    authorId: v.id("users"),
    authorEmail: v.string(),
  }),
});

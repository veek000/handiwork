// ⚠️ SPIKE — THROWAWAY. A bare chat over Convex's reactive queries, to prove that
// two authenticated sessions see each other's messages live (no manual refresh).
// `list` is a reactive query: every subscribed client re-renders when `send`
// inserts a row. No relationship to the real Conversation/Message types.
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const msgs = await ctx.db.query("spikeMessages").order("desc").take(50);
    return msgs.reverse(); // oldest → newest for display
  },
});

export const send = mutation({
  args: { body: v.string() },
  handler: async (ctx, { body }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    await ctx.db.insert("spikeMessages", {
      body,
      authorId: userId,
      authorEmail: user?.email ?? "unknown",
    });
  },
});

// Product feedback from the dashboard Feedback screen. Signed-in users only; stored
// for the team to read in the Convex dashboard (no admin UI yet).
import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const submit = mutation({
  args: {
    kind: v.union(v.literal("suggestion"), v.literal("problem"), v.literal("compliment"), v.literal("other")),
    rating: v.optional(v.number()),
    message: v.string(),
    canContact: v.boolean(),
    page: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("You're signed out. Log in again to send feedback.");
    const message = args.message.trim();
    if (message.length < 10) throw new ConvexError("Tell us a little more (at least 10 characters).");
    if (message.length > 2000) throw new ConvexError("Keep it under 2,000 characters.");
    if (args.rating !== undefined && !(Number.isInteger(args.rating) && args.rating >= 1 && args.rating <= 5)) {
      throw new ConvexError("Pick a rating from 1 to 5.");
    }
    // One message a minute is plenty; stops accidental double-submits and spam.
    const last = await ctx.db
      .query("feedback")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
    if (last && Date.now() - last._creationTime < 60_000) {
      throw new ConvexError("We got your last message. Try again in a minute.");
    }
    const user = await ctx.db.get(userId);
    await ctx.db.insert("feedback", {
      userId,
      role: user?.role,
      kind: args.kind,
      rating: args.rating,
      message,
      canContact: args.canContact,
      page: args.page?.slice(0, 120),
    });
  },
});

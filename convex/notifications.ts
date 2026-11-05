// In-app notifications (written by the job / quote / payment / review mutations via
// model.notify). The bell shows the latest 50.
import { mutation, query } from "./_generated/server";
import { iso, viewerOrNull } from "./model";

const LIMIT = 50;

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const me = await viewerOrNull(ctx);
    if (!me) return null;
    const list = await ctx.db.query("notifications").withIndex("by_user", (q) => q.eq("userId", me._id)).order("desc").take(LIMIT);
    return list.map((n) => ({
      id: n._id as string,
      type: n.type,
      title: n.title,
      body: n.body,
      createdAt: iso(n._creationTime),
      read: n.read,
      jobId: n.jobId as string | undefined,
    }));
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const me = await viewerOrNull(ctx);
    if (!me) return;
    const unread = (await ctx.db.query("notifications").withIndex("by_user", (q) => q.eq("userId", me._id)).collect()).filter(
      (n) => !n.read,
    );
    for (const n of unread) await ctx.db.patch(n._id, { read: true });
  },
});

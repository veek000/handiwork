// Current signed-in user. Used client-side after login to route by the account's
// real role (customer → /customer, vendor → /vendor), replacing the login page's
// old RoleToggle-based routing. Returns null when unauthenticated.
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    return await ctx.db.get(userId);
  },
});

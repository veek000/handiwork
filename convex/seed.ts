// Showcase data so a fresh deployment has providers to browse: the vendors, services
// and reviews from mocks/ (the UI-phase fixtures). Seeded accounts are flagged
// `demo: true`; they have no sign-in account and never receive notifications. Real
// vendors who sign up list their own services alongside them.
//
//   npx convex run seed:demo            (dev)
//   npx convex run seed:removeDemo      (take the showcase data out again)
//
// Both are internal: not callable from the browser.
import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { vendors, customers } from "../mocks/users";
import { services } from "../mocks/services";
import { reviews } from "../mocks/reviews";

function band(years: number) {
  if (years < 1) return "Less than 1 year";
  if (years <= 2) return "1–2 years";
  if (years <= 5) return "3–5 years";
  if (years <= 10) return "6–10 years";
  return "More than 10 years";
}

export const demo = internalMutation({
  args: {},
  handler: async (ctx) => {
    const already = (await ctx.db.query("users").collect()).some((u) => u.demo);
    if (already) return "Demo data is already seeded.";

    const userIds = new Map<string, Id<"users">>();
    for (const vnd of vendors) {
      userIds.set(
        vnd.id,
        await ctx.db.insert("users", {
          demo: true,
          role: "vendor",
          fullName: vnd.fullName,
          name: vnd.fullName,
          image: vnd.avatarUrl,
          countryCode: vnd.countryCode,
          state: vnd.state,
          area: vnd.area,
          businessBio: vnd.bio,
          yearsOfExperience: band(vnd.yearsOfExperience),
        }),
      );
    }
    const customerIdByName = new Map<string, Id<"users">>();
    for (const c of customers) {
      const id = await ctx.db.insert("users", {
        demo: true,
        role: "customer",
        fullName: c.fullName,
        name: c.fullName,
        image: c.avatarUrl,
        state: c.state,
        area: c.area,
      });
      customerIdByName.set(c.fullName, id);
    }

    const serviceIds = new Map<string, Id<"services">>();
    for (const s of services) {
      const vendorId = userIds.get(s.providerId);
      if (!vendorId) continue;
      const own = reviews.filter((r) => r.serviceId === s.id);
      serviceIds.set(
        s.id,
        await ctx.db.insert("services", {
          vendorId,
          title: s.title,
          description: s.description,
          category: s.category,
          price: s.price,
          priceUnit: s.priceUnit,
          images: s.images,
          ratingSum: own.reduce((n, r) => n + r.rating, 0),
          reviewCount: own.length,
        }),
      );
    }

    for (const r of reviews) {
      const serviceId = serviceIds.get(r.serviceId);
      const vendorId = userIds.get(r.vendorId);
      if (!serviceId || !vendorId) continue;
      let customerId = customerIdByName.get(r.authorName);
      if (!customerId) {
        const [area, state] = r.authorLocation.split(",").map((x) => x.trim());
        customerId = await ctx.db.insert("users", {
          demo: true,
          role: "customer",
          fullName: r.authorName,
          name: r.authorName,
          image: r.authorAvatarUrl,
          area,
          state,
        });
        customerIdByName.set(r.authorName, customerId);
      }
      await ctx.db.insert("reviews", { serviceId, vendorId, customerId, rating: r.rating, body: r.body, response: r.response });
    }
    return `Seeded ${userIds.size} vendors, ${serviceIds.size} services and ${reviews.length} reviews.`;
  },
});

export const removeDemo = internalMutation({
  args: {},
  handler: async (ctx) => {
    const demoUsers = (await ctx.db.query("users").collect()).filter((u) => u.demo);
    const ids = new Set<string>(demoUsers.map((u) => u._id));
    const blocked = (await ctx.db.query("jobs").collect()).some((j) => ids.has(j.vendorId));
    if (blocked) return "Real customers have booked demo providers; archive their services instead of removing them.";
    for (const r of await ctx.db.query("reviews").collect()) if (ids.has(r.vendorId)) await ctx.db.delete(r._id);
    for (const s of await ctx.db.query("services").collect()) if (ids.has(s.vendorId)) await ctx.db.delete(s._id);
    for (const u of demoUsers) await ctx.db.delete(u._id);
    return `Removed ${demoUsers.length} demo accounts.`;
  },
});

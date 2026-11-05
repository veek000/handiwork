// Customer-facing reads: the service catalog (Home, Search), a service's detail page
// and a vendor's public profile. Archived services and deleted vendors are hidden.
import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { toReview, toService, toVendor } from "./model";

async function liveServices(ctx: QueryCtx) {
  const all = await ctx.db.query("services").collect();
  const active = all.filter((s) => !s.archivedAt);
  const vendors = new Map<string, Doc<"users"> | null>();
  for (const s of active) {
    if (!vendors.has(s.vendorId)) vendors.set(s.vendorId, await ctx.db.get(s.vendorId));
  }
  return active.filter((s) => {
    const v = vendors.get(s.vendorId);
    return v && !v.deletedAt;
  });
}

/** Every bookable service, most reviewed first (Home "Popular Services", Search). */
export const services = query({
  args: {},
  handler: async (ctx) => {
    const list = await liveServices(ctx);
    return list.sort((a, b) => b.reviewCount - a.reviewCount || b._creationTime - a._creationTime).map(toService);
  },
});

export const serviceDetail = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const serviceId = ctx.db.normalizeId("services", id);
    if (!serviceId) return null;
    const service = await ctx.db.get(serviceId);
    if (!service || service.archivedAt) return null;
    const vendorDoc = await ctx.db.get(service.vendorId);
    if (!vendorDoc || vendorDoc.deletedAt) return null;

    const all = await liveServices(ctx);
    const reviews = await ctx.db.query("reviews").withIndex("by_service", (q) => q.eq("serviceId", serviceId)).collect();
    const recommended = all
      .filter((s) => s._id !== serviceId)
      .sort((a, b) => Number(b.category === service.category) - Number(a.category === service.category) || b.reviewCount - a.reviewCount)
      .slice(0, 2);
    return {
      service: toService(service),
      vendor: await toVendor(ctx, vendorDoc),
      vendorServices: all.filter((s) => s.vendorId === service.vendorId).map(toService),
      reviews: await Promise.all(reviews.map((r) => toReview(ctx, r))),
      recommended: recommended.map(toService),
    };
  },
});

export const vendorProfile = query({
  args: { id: v.string(), from: v.optional(v.string()) },
  handler: async (ctx, { id, from }) => {
    const vendorId = ctx.db.normalizeId("users", id);
    if (!vendorId) return null;
    const vendorDoc = await ctx.db.get(vendorId);
    if (!vendorDoc || vendorDoc.deletedAt || vendorDoc.role !== "vendor") return null;
    const services = (await ctx.db.query("services").withIndex("by_vendor", (q) => q.eq("vendorId", vendorId)).collect()).filter(
      (s) => !s.archivedAt,
    );
    const reviews = await ctx.db.query("reviews").withIndex("by_vendor", (q) => q.eq("vendorId", vendorId)).collect();
    const fromService = services.find((s) => s._id === from);
    return {
      vendor: await toVendor(ctx, vendorDoc),
      services: services.map(toService),
      reviews: await Promise.all(reviews.map((r) => toReview(ctx, r))),
      from: fromService ? toService(fromService) : undefined,
    };
  },
});

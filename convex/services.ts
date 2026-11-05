// Vendor's own listings (My Services): list, add, edit, archive.
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { priceUnitV } from "./schema";
import { requireViewer, toService, viewerOrNull } from "./model";
import { checkImage } from "./files";

const MAX_SERVICES = 50;

function validate(d: { category: string; price: number; description: string }) {
  if (!d.category.trim()) throw new ConvexError("Choose a service category.");
  if (!Number.isFinite(d.price) || d.price <= 0 || d.price > 100_000_000) throw new ConvexError("Enter a rate above zero.");
  if (d.description.trim().length < 10) throw new ConvexError("Describe the service in a sentence or two.");
  if (d.description.length > 1000) throw new ConvexError("Keep the description under 1,000 characters.");
}

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const me = await viewerOrNull(ctx);
    if (!me) return null;
    const list = await ctx.db.query("services").withIndex("by_vendor", (q) => q.eq("vendorId", me._id)).order("desc").collect();
    return list.filter((s) => !s.archivedAt).map(toService);
  },
});

const draftArgs = {
  category: v.string(),
  price: v.number(),
  priceUnit: priceUnitV,
  description: v.string(),
  imageStorageId: v.optional(v.id("_storage")), // from files.generateUploadUrl
};

export const create = mutation({
  args: draftArgs,
  handler: async (ctx, { imageStorageId, ...d }) => {
    const me = await requireViewer(ctx, "vendor");
    validate(d);
    const images = imageStorageId ? [await checkImage(ctx, imageStorageId)] : [];
    const count = (await ctx.db.query("services").withIndex("by_vendor", (q) => q.eq("vendorId", me._id)).collect()).filter(
      (s) => !s.archivedAt,
    ).length;
    if (count >= MAX_SERVICES) throw new ConvexError(`You can list up to ${MAX_SERVICES} services.`);
    // Figma has no title field: a new service is titled by its category.
    await ctx.db.insert("services", {
      vendorId: me._id,
      title: d.category.trim(),
      category: d.category.trim(),
      description: d.description.trim(),
      price: Math.round(d.price),
      priceUnit: d.priceUnit,
      images,
      ratingSum: 0,
      reviewCount: 0,
    });
  },
});

export const update = mutation({
  args: { id: v.id("services"), ...draftArgs },
  handler: async (ctx, { id, imageStorageId, ...d }) => {
    const me = await requireViewer(ctx, "vendor");
    const s = await ctx.db.get(id);
    if (!s || s.vendorId !== me._id || s.archivedAt) throw new ConvexError("That service no longer exists.");
    validate(d);
    await ctx.db.patch(id, {
      category: d.category.trim(),
      price: Math.round(d.price),
      priceUnit: d.priceUnit,
      description: d.description.trim(),
      ...(imageStorageId ? { images: [await checkImage(ctx, imageStorageId)] } : {}),
    });
  },
});

/** "Delete" archives: past jobs and reviews keep pointing at the service. */
export const archive = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    const me = await requireViewer(ctx, "vendor");
    const s = await ctx.db.get(id);
    if (!s || s.vendorId !== me._id) throw new ConvexError("That service no longer exists.");
    const open = (await ctx.db.query("jobs").withIndex("by_vendor", (q) => q.eq("vendorId", me._id)).collect()).some(
      (j) => j.serviceId === id && ["pending", "quoted", "in_progress", "marked_completed"].includes(j.status),
    );
    if (open) throw new ConvexError("This service has open jobs. Finish or cancel them first.");
    await ctx.db.patch(id, { archivedAt: Date.now() });
  },
});

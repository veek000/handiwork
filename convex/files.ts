// Uploads to Convex file storage. The client asks for a one-time upload URL, POSTs the
// file there, and passes the returned storageId to the mutation that uses it (e.g.
// services.create), which checks it with checkImage().
import { ConvexError } from "convex/values";
import { mutation, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireViewer } from "./model";

const MAX_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireViewer(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Validates an uploaded image and returns its public URL (deletes it if invalid). */
export async function checkImage(ctx: MutationCtx, storageId: Id<"_storage">): Promise<string> {
  const meta = await ctx.db.system.get(storageId);
  if (!meta) throw new ConvexError("That upload didn't finish. Please try again.");
  if (!meta.contentType || !IMAGE_TYPES.includes(meta.contentType) || meta.size > MAX_BYTES) {
    await ctx.storage.delete(storageId);
    throw new ConvexError("Use a JPG, PNG, GIF or WebP image under 10MB.");
  }
  const url = await ctx.storage.getUrl(storageId);
  if (!url) throw new ConvexError("That upload didn't finish. Please try again.");
  return url;
}

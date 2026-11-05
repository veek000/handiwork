// Convex function references for the dashboard (Settings, Feedback). Built by name
// with makeFunctionReference — like viewerRef in useRoleRedirect — so the app builds
// without convex/_generated (gitignored / absent on Vercel CI).
import { makeFunctionReference } from "convex/server";
import { ConvexError } from "convex/values";

export type NotificationPrefs = {
  jobUpdates: boolean;
  messages: boolean;
  payments: boolean;
  reviews: boolean;
  tips: boolean;
  email: boolean;
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  jobUpdates: true,
  messages: true,
  payments: true,
  reviews: true,
  tips: true,
  email: true,
};

/** The users doc fields the dashboard reads (see convex/schema.ts). */
export type ViewerDoc = {
  role?: "customer" | "vendor";
  name?: string;
  fullName?: string;
  email?: string;
  image?: string;
  phone?: string;
  countryCode?: string;
  state?: string;
  area?: string;
  address?: string;
  service?: string;
  yearsOfExperience?: string;
  businessBio?: string;
  governmentIdNumber?: string;
  notificationPrefs?: NotificationPrefs;
};

export type FeedbackKind = "suggestion" | "problem" | "compliment" | "other";

export const api = {
  signInMethods: makeFunctionReference<"query", Record<string, never>, string[] | null>("users:signInMethods"),
  updateProfile: makeFunctionReference<"mutation", Partial<Omit<ViewerDoc, "role" | "email" | "image" | "notificationPrefs" | "governmentIdNumber" | "name">>>(
    "users:updateProfile",
  ),
  updateNotificationPrefs: makeFunctionReference<"mutation", { prefs: NotificationPrefs }>("users:updateNotificationPrefs"),
  changePassword: makeFunctionReference<"action", { current: string; next: string }>("users:changePassword"),
  signOutOtherDevices: makeFunctionReference<"action", Record<string, never>>("users:signOutOtherDevices"),
  deleteAccount: makeFunctionReference<"action", { confirm: string }>("users:deleteAccount"),
  submitFeedback: makeFunctionReference<
    "mutation",
    { kind: FeedbackKind; rating?: number; message: string; canContact: boolean; page?: string }
  >("feedback:submit"),
};

/**
 * A message that is safe to show the user. ConvexError messages are written for users
 * (see convex/users.ts); anything else (network, server bug) gets a generic line.
 */
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof ConvexError && typeof err.data === "string") return err.data;
  if (typeof navigator !== "undefined" && !navigator.onLine) return "You're offline. Check your connection and try again.";
  return fallback;
}

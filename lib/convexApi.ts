// Convex function references for the dashboard. Built by name
// with makeFunctionReference — like viewerRef in useRoleRedirect — so the app builds
// without convex/_generated (gitignored / absent on Vercel CI).
import { makeFunctionReference } from "convex/server";
import { ConvexError } from "convex/values";
import type { Conversation, Job, Message, Notification, PriceUnit, Review, Service, User, VendorUser, Wallet } from "@/types";

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
  hasGovernmentId?: boolean;
  notificationPrefs?: NotificationPrefs;
};

export type FeedbackKind = "suggestion" | "problem" | "compliment" | "other";

export const api = {
  signInMethods: makeFunctionReference<"query", Record<string, never>, string[] | null>("users:signInMethods"),
  updateProfile: makeFunctionReference<"mutation", Partial<Omit<ViewerDoc, "role" | "email" | "image" | "notificationPrefs" | "hasGovernmentId" | "name">>>(
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

type NoArgs = Record<string, never>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Args = Record<string, any>;
const q = <A extends Args, R>(name: string) => makeFunctionReference<"query", A, R>(name);
const m = <A extends Args, R = unknown>(name: string) => makeFunctionReference<"mutation", A, R>(name);

export type ThreadMessages = { jobStatus: Job["status"]; messages: Message[] };
export type PaymentInfo = {
  id: string;
  status: "pending" | "held" | "released" | "refunded" | "failed";
  amount: number;
  serviceFee: number;
  processingFee: number;
  total: number;
};

/** Marketplace data (convex/catalog, services, jobs, chat, payments, reviews, notifications). */
export const live = {
  services: q<NoArgs, Service[]>("catalog:services"),
  serviceDetail: q<
    { id: string },
    { service: Service; vendor: VendorUser; vendorServices: Service[]; reviews: Review[]; recommended: Service[] } | null
  >("catalog:serviceDetail"),
  vendorProfile: q<
    { id: string; from?: string },
    { vendor: VendorUser; services: Service[]; reviews: Review[]; from?: Service } | null
  >("catalog:vendorProfile"),

  myServices: q<NoArgs, Service[] | null>("services:mine"),
  createService: m<{ category: string; price: number; priceUnit: PriceUnit; description: string; imageStorageId?: string }>("services:create"),
  updateService: m<{ id: string; category: string; price: number; priceUnit: PriceUnit; description: string; imageStorageId?: string }>(
    "services:update",
  ),
  archiveService: m<{ id: string }>("services:archive"),
  uploadUrl: m<NoArgs, string>("files:generateUploadUrl"),

  customerJobs: q<NoArgs, { customer: User; jobs: Job[]; reviews: Review[]; vendors: User[] } | null>("jobs:customerJobs"),
  vendorJobs: q<NoArgs, { jobs: Job[]; customers: User[] } | null>("jobs:vendorJobs"),
  vendorJob: q<{ id: string }, { job: Job; customer?: User } | null>("jobs:vendorJob"),
  requestJob: m<{ serviceIds: string[]; preferredDate: string; preferredTime: string; description: string }, string>("jobs:request"),
  cancelJob: m<{ id: string }>("jobs:cancel"),
  rejectJob: m<{ id: string }>("jobs:reject"),
  markCompleted: m<{ id: string }>("jobs:markCompleted"),
  confirmCompleted: m<{ id: string }>("jobs:confirmCompleted"),

  threads: q<NoArgs, Conversation[] | null>("chat:threads"),
  unreadMessages: q<NoArgs, number>("chat:unreadCount"),
  messages: q<{ jobId: string }, ThreadMessages | null>("chat:messages"),
  sendMessage: m<{ jobId: string; body: string }>("chat:send"),
  markThreadRead: m<{ jobId: string }>("chat:markRead"),
  sendQuote: m<{ jobId: string; amount: number }>("chat:sendQuote"),
  editQuote: m<{ quoteId: string; amount: number }>("chat:editQuote"),
  counterQuote: m<{ quoteId: string; amount: number }>("chat:counterQuote"),

  acceptQuote: m<{ quoteId: string }, { paymentId: string; amount: number; serviceFee: number; processingFee: number; total: number }>(
    "payments:acceptQuote",
  ),
  pay: m<{ paymentId: string; method: "card" | "transfer" }>("payments:pay"),
  paymentForJob: q<{ jobId: string }, PaymentInfo | null>("payments:forJob"),
  wallet: q<NoArgs, Wallet | null>("payments:wallet"),

  vendorReviews: q<NoArgs, { vendor: VendorUser; reviews: Review[] } | null>("reviews:mine"),
  saveReview: m<{ jobId: string; rating: number; body: string }>("reviews:upsert"),
  deleteReview: m<{ jobId: string }>("reviews:remove"),
  respondToReview: m<{ id: string; response?: string }>("reviews:respond"),

  notifications: q<NoArgs, Notification[] | null>("notifications:mine"),
  markAllNotificationsRead: m<NoArgs>("notifications:markAllRead"),
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

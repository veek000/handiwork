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
  hasIdDocument?: boolean;
  verificationStatus?: "pending" | "verified" | "rejected";
  verificationNote?: string;
  isAdmin?: boolean;
  suspendedAt?: number;
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
  chooseRole: makeFunctionReference<
    "mutation",
    {
      role: "customer" | "vendor";
      fullName: string;
      countryCode?: string;
      phone?: string;
      state?: string;
      area?: string;
      address?: string;
      service?: string;
      yearsOfExperience?: string;
      businessBio?: string;
    }
  >("users:chooseRole"),
  submitVerification: makeFunctionReference<"mutation", { idNumber: string; documentStorageId: string }>("users:submitVerification"),
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

// ---------------------------------------------------------------- admin (/admin)
// Row shapes returned by convex/admin.ts.
export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "vendor" | null;
  location: string;
  isAdmin: boolean;
  demo: boolean;
  suspended: boolean;
  deleted: boolean;
  verificationStatus: "pending" | "verified" | "rejected" | null;
  createdAt: string;
};
export type AdminUserDetail = AdminUserRow & {
  phone: string;
  address: string;
  service: string;
  yearsOfExperience: string;
  bio: string;
  signInMethods: string[];
  suspendedReason: string;
  verificationNote: string;
  jobs: { asCustomer: number; asVendor: number; open: number };
  services: number;
  paidTotal: number;
  earnedTotal: number;
};
export type AdminVerification = AdminUserRow & {
  service: string;
  yearsOfExperience: string;
  idNumber: string;
  documentUrl: string | null;
  documentType: string | null;
  submittedAt: string | null;
};
export type AdminJobRow = {
  id: string;
  title: string;
  status: Job["status"];
  customer: string;
  vendor: string;
  createdAt: string;
  amount: number | null;
  paymentStatus: PaymentInfo["status"] | null;
};
export type AdminJobDetail = {
  id: string;
  title: string;
  description: string;
  status: Job["status"];
  cancelledBy: string | null;
  preferred: string;
  createdAt: string;
  customer: { id: string; name: string };
  vendor: { id: string; name: string };
  messages: { id: string; kind: string; from: string; body: string; at: string }[];
  quotes: { amount: number; counterAmount: number | null; status: string }[];
  payments: {
    id: string;
    status: PaymentInfo["status"];
    provider: string;
    amount: number;
    serviceFee: number;
    processingFee: number;
    total: number;
    refundAmount: number | null;
    retainedFee: number | null;
  }[];
};
export type AdminOverview = {
  users: { customers: number; vendors: number; demo: number; noRole: number; suspended: number; verifiedVendors: number; pendingVerification: number };
  jobs: { total: number; open: number; byStatus: Record<string, number> };
  money: { heldInEscrow: number; releasedToVendors: number; refundedToCustomers: number; platformFees: number };
  services: { active: number; archived: number };
  feedback: { open: number; total: number };
};

export const adminApi = {
  me: q<NoArgs, { id: string; name: string; email: string } | null>("admin:me"),
  overview: q<NoArgs, AdminOverview>("admin:overview"),
  users: q<{ search?: string; filter?: string }, AdminUserRow[]>("admin:users"),
  userDetail: q<{ id: string }, AdminUserDetail | null>("admin:userDetail"),
  verificationQueue: q<NoArgs, AdminVerification[]>("admin:verificationQueue"),
  jobs: q<{ status?: string; disputesOnly?: boolean }, AdminJobRow[]>("admin:jobs"),
  jobDetail: q<{ id: string }, AdminJobDetail | null>("admin:jobDetail"),
  payments: q<
    { status?: string },
    {
      id: string;
      jobId: string;
      job: string;
      customer: string;
      vendor: string;
      status: PaymentInfo["status"];
      provider: string;
      amount: number;
      fees: number;
      total: number;
      refundAmount: number | null;
      createdAt: string;
    }[]
  >("admin:payments"),
  services: q<
    { search?: string },
    {
      id: string;
      title: string;
      category: string;
      price: number;
      priceUnit: string;
      vendor: string;
      vendorId: string;
      reviewCount: number;
      rating: number;
      archived: boolean;
      createdAt: string;
    }[]
  >("admin:services"),
  reviews: q<
    NoArgs,
    { id: string; rating: number; body: string; response: string | null; author: string; vendor: string; service: string; hidden: boolean; createdAt: string }[]
  >("admin:reviews"),
  feedback: q<
    { showResolved?: boolean },
    {
      id: string;
      kind: string;
      rating: number | null;
      message: string;
      from: string;
      email: string;
      role: string | null;
      page: string | null;
      resolved: boolean;
      createdAt: string;
    }[]
  >("admin:feedback"),
  auditLog: q<NoArgs, { id: string; admin: string; action: string; targetType: string; targetId: string; note: string | null; at: string }[]>(
    "admin:auditLog",
  ),

  decideVerification: m<{ userId: string; decision: "verified" | "rejected"; note?: string }>("admin:decideVerification"),
  setSuspended: m<{ userId: string; suspended: boolean; reason?: string }>("admin:setSuspended"),
  resolveJob: m<{ jobId: string; outcome: "refund_customer" | "release_vendor"; note: string }>("admin:resolveJob"),
  setServiceArchived: m<{ serviceId: string; archived: boolean; note?: string }>("admin:setServiceArchived"),
  setReviewHidden: m<{ reviewId: string; hidden: boolean; note?: string }>("admin:setReviewHidden"),
  setFeedbackResolved: m<{ feedbackId: string; resolved: boolean }>("admin:setFeedbackResolved"),
};

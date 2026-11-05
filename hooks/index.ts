"use client";

// Data access for screens — the only place components get app data from (see
// COMPONENT-BUILD-RULES.md: components never import mocks/ or convex/ directly).
// Each hook is a live Convex subscription: `undefined` while loading, then the data
// (null where the query needs a signed-in account and there isn't one). The shapes
// are the UI types in types/, produced on the server in convex/model.ts.
import { useQuery } from "convex/react";
import type { Category, User } from "@/types";
import { categories } from "@/data/categories";
import { live, type ViewerDoc } from "@/lib/convexApi";
import { viewerRef } from "@/app/(auth)/useRoleRedirect";

const NONE = {} as Record<string, never>;

/** Reference data (static). */
export function useCategories(): Category[] {
  return categories;
}

/** The signed-in account as a UI User (null when signed out). */
export function useViewer(): User | null | undefined {
  const v = useQuery(viewerRef) as (ViewerDoc & { _id: string }) | null | undefined;
  if (v === undefined || v === null) return v;
  const place = [v.area, v.state].filter(Boolean).join(", ");
  return {
    id: v._id,
    role: v.role === "vendor" ? "vendor" : "customer",
    fullName: v.fullName || v.name || v.email || "Handiwork user",
    email: v.email ?? "",
    phone: v.phone ?? "",
    countryCode: v.countryCode ?? "+234",
    state: v.state ?? "",
    area: v.area ?? "",
    address: v.address ?? "",
    location: place || "Set your location",
    avatarUrl: v.image,
  } as User;
}

export const useServices = () => useQuery(live.services, NONE);
export const useServiceDetail = (id: string) => useQuery(live.serviceDetail, { id });
export const useVendorProfile = (id: string, from?: string) => useQuery(live.vendorProfile, { id, from });
export const useMyServices = () => useQuery(live.myServices, NONE);

export const useCustomerJobs = () => useQuery(live.customerJobs, NONE);
export const useVendorJobs = () => useQuery(live.vendorJobs, NONE);
export const useVendorJob = (id: string) => useQuery(live.vendorJob, { id });

export const useThreads = () => useQuery(live.threads, NONE);
export const useUnreadMessages = () => useQuery(live.unreadMessages, NONE);
export const useThreadMessages = (jobId: string | null) => useQuery(live.messages, jobId ? { jobId } : "skip");
export const usePaymentForJob = (jobId: string | null) => useQuery(live.paymentForJob, jobId ? { jobId } : "skip");

export const useWallet = () => useQuery(live.wallet, NONE);
export const useVendorReviews = () => useQuery(live.vendorReviews, NONE);
export const useNotifications = () => useQuery(live.notifications, NONE);

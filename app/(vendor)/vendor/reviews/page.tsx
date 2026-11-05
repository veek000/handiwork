"use client";

import { useVendorReviews } from "@/hooks";
import { LoadingState } from "@/components/LoadingState";
import { VendorReviewsScreen } from "@/components/VendorReviewsScreen";

export default function VendorReviewsPage() {
  const data = useVendorReviews();
  if (!data) return <LoadingState />;
  return <VendorReviewsScreen vendor={data.vendor} reviews={data.reviews} />;
}

import type { VendorUser } from "@/types";
import { useCurrentUser, useReviews } from "@/hooks";
import { VendorReviewsScreen } from "@/components/VendorReviewsScreen";

// Vendor My Reviews (Figma 6619:31115 / mobile 6619:43248). Data through the hooks seam.
export default function VendorReviewsPage() {
  const vendor = useCurrentUser("vendor") as VendorUser;
  const reviews = useReviews().filter((r) => r.vendorId === vendor.id);
  return <VendorReviewsScreen vendor={vendor} reviews={reviews} />;
}

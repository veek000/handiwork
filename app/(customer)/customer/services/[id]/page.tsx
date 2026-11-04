import { notFound } from "next/navigation";
import type { VendorUser } from "@/types";
import { useReviews, useServices, useUsers } from "@/hooks";
import { ServiceDetailScreen } from "@/components/ServiceDetailScreen";

// Service Detail + Book Service. Data is resolved here through the hooks seam (plain
// synchronous fixtures today, Convex queries at Phase 6) and handed to the client
// screen. `?q=` carries the search the customer came from, for the breadcrumb + Back.
export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
  const services = useServices();
  const service = services.find((s) => s.id === id);
  if (!service) notFound();

  const vendor = useUsers().find((u): u is VendorUser => u.id === service.providerId && u.role === "vendor");
  if (!vendor) notFound();

  const reviews = useReviews().filter((r) => r.serviceId === service.id);
  const vendorServices = services.filter((s) => s.providerId === vendor.id);
  // Recommended: same category first, then the most-reviewed elsewhere — two cards, per Figma.
  const recommended = services
    .filter((s) => s.id !== service.id)
    .sort((a, b) => Number(b.category === service.category) - Number(a.category === service.category) || b.reviewCount - a.reviewCount)
    .slice(0, 2);

  return (
    <ServiceDetailScreen
      service={service}
      vendor={vendor}
      vendorServices={vendorServices}
      reviews={reviews}
      recommended={recommended}
      query={(Array.isArray(q) ? q[0] : q)?.trim() ?? ""}
    />
  );
}

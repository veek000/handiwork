import { notFound } from "next/navigation";
import type { VendorUser } from "@/types";
import { useReviews, useServices, useUsers } from "@/hooks";
import { VendorProfileScreen } from "@/components/VendorProfileScreen";

// Vendor Profile (customer view). Data resolved through the hooks seam. `?from=` is the
// service the customer came from and `?q=` their search, for the breadcrumb + Back.
export default async function VendorProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string | string[]; q?: string | string[] }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

  const vendor = useUsers().find((u): u is VendorUser => u.id === id && u.role === "vendor");
  if (!vendor) notFound();

  const all = useServices();
  const services = all.filter((s) => s.providerId === vendor.id);
  const reviews = useReviews().filter((r) => r.vendorId === vendor.id);
  const from = all.find((s) => s.id === one(sp.from) && s.providerId === vendor.id);

  return <VendorProfileScreen vendor={vendor} services={services} reviews={reviews} from={from} query={one(sp.q)} />;
}

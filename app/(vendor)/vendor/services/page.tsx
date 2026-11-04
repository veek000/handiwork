import { useCategories, useCurrentUser, useServices } from "@/hooks";
import { VendorServicesScreen } from "@/components/VendorServicesScreen";

// Vendor My Services (Figma 6619:30286 / mobile 6619:42699). Data through the hooks seam.
// Category options = the browse categories plus any category already used by a service
// (mock services use "Cleaners", which has no browse tile).
export default function VendorServicesPage() {
  const vendor = useCurrentUser("vendor");
  const all = useServices();
  const services = all.filter((s) => s.providerId === vendor.id);
  const categories = Array.from(new Set([...useCategories().map((c) => c.name), ...all.map((s) => s.category)])).sort();
  return <VendorServicesScreen services={services} categories={categories} vendorId={vendor.id} />;
}

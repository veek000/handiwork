import { useCurrentUser, useJobs, useUsers } from "@/hooks";
import { VendorOrdersScreen } from "@/components/VendorOrdersScreen";

// Vendor My Orders (Figma 6619:31395 / mobile 6619:43443). Data through the hooks seam.
export default function VendorOrdersPage() {
  const vendor = useCurrentUser("vendor");
  const jobs = useJobs().filter((j) => j.vendorId === vendor.id);
  const customers = useUsers().filter((u) => u.role === "customer");
  return <VendorOrdersScreen jobs={jobs} customers={customers} />;
}

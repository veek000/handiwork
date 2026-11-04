import { useCurrentUser, useJobs, useUsers, useWallet } from "@/hooks";
import { VendorAnalyticsScreen } from "@/components/VendorAnalyticsScreen";
import { MOCK_REFERENCE_DATE } from "@/lib/time";

// Vendor Analytics (Figma 6619:32291 / mobile 6619:43823). Data through the hooks seam.
// "Current month" follows the demo reference date (see lib/time.ts) until data is live.
export default function VendorAnalyticsPage() {
  const vendor = useCurrentUser("vendor");
  const jobs = useJobs().filter((j) => j.vendorId === vendor.id);
  const customers = useUsers().filter((u) => u.role === "customer");
  const wallet = useWallet(vendor.id) ?? {
    totalBalance: 0,
    withdrawableBalance: 0,
    heldInEscrow: 0,
    revenueByMonth: Array(12).fill(0),
    lastYearRevenue: 0,
  };
  return <VendorAnalyticsScreen jobs={jobs} customers={customers} wallet={wallet} currentMonth={MOCK_REFERENCE_DATE.getMonth()} />;
}

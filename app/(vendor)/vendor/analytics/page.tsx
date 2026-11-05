"use client";

import { useVendorJobs, useWallet } from "@/hooks";
import { LoadingState } from "@/components/LoadingState";
import { VendorAnalyticsScreen } from "@/components/VendorAnalyticsScreen";

export default function VendorAnalyticsPage() {
  const data = useVendorJobs();
  const wallet = useWallet();
  if (!data || !wallet) return <LoadingState />;
  return <VendorAnalyticsScreen jobs={data.jobs} customers={data.customers} wallet={wallet} currentMonth={new Date().getMonth()} />;
}

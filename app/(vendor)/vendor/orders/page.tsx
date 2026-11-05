"use client";

import { useVendorJobs } from "@/hooks";
import { LoadingState } from "@/components/LoadingState";
import { VendorOrdersScreen } from "@/components/VendorOrdersScreen";

export default function VendorOrdersPage() {
  const data = useVendorJobs();
  if (!data) return <LoadingState />;
  return <VendorOrdersScreen jobs={data.jobs} customers={data.customers} />;
}

"use client";

import { useCustomerJobs } from "@/hooks";
import { LoadingState } from "@/components/LoadingState";
import { CustomerJobsScreen } from "@/components/CustomerJobsScreen";

export default function CustomerJobsPage() {
  const data = useCustomerJobs();
  if (!data) return <LoadingState />;
  return <CustomerJobsScreen jobs={data.jobs} reviews={data.reviews} vendors={data.vendors} />;
}

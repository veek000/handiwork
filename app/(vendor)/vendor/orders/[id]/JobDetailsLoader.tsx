"use client";

import { notFound } from "next/navigation";
import { useVendorJob } from "@/hooks";
import { LoadingState } from "@/components/LoadingState";
import { JobDetailsScreen } from "@/components/JobDetailsScreen";

export function JobDetailsLoader({ id }: { id: string }) {
  const data = useVendorJob(id);
  if (data === undefined) return <LoadingState />;
  if (data === null) notFound();
  return <JobDetailsScreen job={data.job} customer={data.customer} />;
}

import { notFound } from "next/navigation";
import { useCurrentUser, useJobs, useUsers } from "@/hooks";
import { JobDetailsScreen } from "@/components/JobDetailsScreen";

// Vendor Job Details (Figma 6619:31954 / mobile 6619:43666) — only the signed-in vendor's jobs.
export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = useCurrentUser("vendor");
  const job = useJobs().find((j) => j.id === id && j.vendorId === vendor.id);
  if (!job) notFound();
  const customer = useUsers().find((u) => u.id === job.customerId);
  return <JobDetailsScreen job={job} customer={customer} />;
}

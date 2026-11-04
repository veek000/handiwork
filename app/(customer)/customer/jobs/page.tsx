import { useCurrentUser, useJobs, useReviews, useUsers } from "@/hooks";
import { CustomerJobsScreen } from "@/components/CustomerJobsScreen";

// Customer My Jobs (Figma 6619:5727 / mobile 6619:20409). Data through the hooks seam:
// the signed-in customer's jobs, the reviews they left on those jobs, and the vendors.
export default function CustomerJobsPage() {
  const customer = useCurrentUser("customer");
  const jobs = useJobs().filter((j) => j.customerId === customer.id);
  const jobIds = new Set(jobs.map((j) => j.id));
  const reviews = useReviews().filter((r) => r.jobId && jobIds.has(r.jobId));
  const vendors = useUsers().filter((u) => u.role === "vendor");
  return <CustomerJobsScreen jobs={jobs} reviews={reviews} vendors={vendors} customer={customer} />;
}

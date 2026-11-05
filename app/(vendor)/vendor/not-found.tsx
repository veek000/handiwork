import Link from "next/link";
import { ErrorState } from "@/components/ErrorState";

// Shown inside the dashboard shell when a /vendor/* page calls notFound() (e.g. a service,
// vendor or job id that doesn't exist).
export default function DashboardNotFound() {
  return (
    <ErrorState
      art="/assets/illustration/illustration-20.svg"
      eyebrow="404"
      title="We couldn't find that"
      text="It may have been removed, or the link is wrong."
    >
      <Link className="hw-button hw-button--primary" href="/vendor">Go to Home</Link>
    </ErrorState>
  );
}

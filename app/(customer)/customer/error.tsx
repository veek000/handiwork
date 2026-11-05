"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/Button";

// Error boundary for every /customer/* screen: the dashboard shell (sidebar, header) stays
// up and only the page area is replaced, with Try Again (re-renders the segment).
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  return (
    <ErrorState
      title={offline ? "You're offline" : "Something went wrong"}
      text={
        offline
          ? "Check your internet connection, then try again."
          : "This page didn't load properly. Try again, and if it keeps happening, let our support team know."
      }
      detail={error.digest}
    >
      <Button variant="primary" onClick={reset}>Try Again</Button>
      <Link className="hw-button hw-button--secondary" href="/customer">Go to Home</Link>
    </ErrorState>
  );
}

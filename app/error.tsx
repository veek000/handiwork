"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/Button";

// Root error boundary: errors outside a dashboard page (auth screens, the dashboard
// layouts themselves). Dashboard pages have their own boundary inside the shell.
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="hw-errpage">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hw-errpage__logo" src="/assets/logo/wordmark-dark.svg" alt="Handiwork" />
      <ErrorState
        title="Something went wrong"
        text="We hit a problem loading this page. Try again, and if it keeps happening, contact hello@handiwork.com."
        detail={error.digest}
      >
        <Button variant="primary" onClick={reset}>Try Again</Button>
        <Link className="hw-button hw-button--secondary" href="/">Go to Home</Link>
      </ErrorState>
    </main>
  );
}

import Link from "next/link";
import { ErrorState } from "@/components/ErrorState";

// App-wide 404 (any URL that matches no route). Standalone: logo + message.
export default function NotFound() {
  return (
    <main className="hw-errpage">
      <Link href="/" aria-label="Handiwork home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hw-errpage__logo" src="/assets/logo/wordmark-dark.svg" alt="Handiwork" />
      </Link>
      <ErrorState
        art="/assets/illustration/illustration-20.svg"
        eyebrow="404"
        title="Page not found"
        text="The page you're looking for doesn't exist or has moved."
      >
        <Link className="hw-button hw-button--primary" href="/">Go to Home</Link>
        <Link className="hw-button hw-button--secondary" href="/login">Log In</Link>
      </ErrorState>
    </main>
  );
}

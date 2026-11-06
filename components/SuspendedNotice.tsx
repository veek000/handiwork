"use client";

import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/Button";
import { SUPPORT_CONTACT } from "@/data/faqs";

/**
 * SuspendedNotice — what a suspended account sees instead of its dashboard (an admin
 * suspended it from /admin/users). Shows the reason, how to reach support, and Log Out.
 * The server also refuses every action from a suspended account.
 */
export function SuspendedNotice({ reason }: { reason?: string }) {
  const router = useRouter();
  const { signOut } = useAuthActions();
  return (
    <main className="hw-errpage">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hw-errpage__logo" src="/assets/logo/wordmark-dark.svg" alt="Handiwork" />
      <ErrorState
        title="Account suspended"
        text={`Your account has been suspended${reason ? `: ${reason.replace(/[.\s]*$/, ".")}` : "."} If you think this is a mistake, email ${SUPPORT_CONTACT.email}.`}
      >
        <a className="hw-button hw-button--primary" href={`mailto:${SUPPORT_CONTACT.email}`}>Email Support</a>
        <Button
          variant="secondary"
          onClick={async () => {
            try {
              await signOut();
            } finally {
              router.replace("/");
            }
          }}
        >
          Log Out
        </Button>
      </ErrorState>
    </main>
  );
}

export default SuspendedNotice;

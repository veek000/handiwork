"use client";

import { useCallback, useState } from "react";
import { errorMessage } from "@/lib/convexApi";

/**
 * useRunner — wraps a screen action (a Convex mutation call) with busy + error state.
 * `run(fn)` resolves true on success, false on failure (the user-facing message is in
 * `error`, shown by <ActionError>). One action at a time per screen.
 */
export function useRunner() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(async (fn: () => Promise<unknown>, fallback?: string) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      return true;
    } catch (err) {
      setError(errorMessage(err, fallback));
      return false;
    } finally {
      setBusy(false);
    }
  }, []);
  return { run, busy, error, clearError: useCallback(() => setError(null), []) };
}

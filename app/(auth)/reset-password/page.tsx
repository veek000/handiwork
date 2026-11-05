import { ResetPasswordForm } from "./ResetPasswordForm";

// Opened from the reset email: /reset-password?email=…&token=… (`token`, not `code` — see
// convex/ResendPasswordReset.ts). The query is read on the server (see
// customer/search/page.tsx for why not useSearchParams).
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[]; token?: string | string[] }>;
}) {
  const sp = await searchParams;
  const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
  return <ResetPasswordForm email={one(sp.email)} code={one(sp.token)} />;
}

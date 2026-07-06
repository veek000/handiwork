// ⚠️ SPIKE — THROWAWAY. Convex Auth with the Password provider (email + password),
// the simplest flow to prove sign-up / sign-in. No OAuth, no email verification,
// no password reset — deliberately minimal to de-risk, not to ship.
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
});

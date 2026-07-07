// Convex Auth config for the real app.
//
// Providers:
//   • Password — email + password, with a custom profile() that stores the signup
//     wizard's fields on the user doc, and verify: ResendOTP for the emailed code.
//   • Google, Facebook — OAuth. Active once their AUTH_*_ID / AUTH_*_SECRET env vars
//     are set on the deployment + the callback URLs are registered with each provider.
//   • Apple — scaffolded but disabled (needs a paid Apple Developer account).
//
// Callback URL format (register with each OAuth provider), using this deployment's
// .site domain: https://proper-wolf-657.convex.site/api/auth/callback/<provider>
import Google from "@auth/core/providers/google";
import Facebook from "@auth/core/providers/facebook";
// import Apple from "@auth/core/providers/apple"; // deferred — paid Apple Developer account
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { DataModel } from "./_generated/dataModel";
import { ResendOTP } from "./ResendOTP";

// Password provider carrying the extra signup fields into the user document. The
// fields arrive from the client's FormData as `params`; only email/password are
// required by the provider — the rest are our profile additions (all optional in
// the schema). `verify: ResendOTP` turns on the email-code step (signup wizard step 3).
const HandiworkPassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      role: params.role as "customer" | "vendor" | undefined,
      fullName: params.fullName as string | undefined,
      // Also mirror fullName into the auth `name` field for OAuth-shaped consistency.
      name: params.fullName as string | undefined,
      countryCode: params.countryCode as string | undefined,
      phone: params.phone as string | undefined,
      state: params.state as string | undefined,
      area: params.area as string | undefined,
      address: params.address as string | undefined,
      // Vendor-only fields (Business Information + Verification signup steps).
      // Customers omit them; the schema marks all optional.
      service: params.service as string | undefined,
      yearsOfExperience: params.yearsOfExperience as string | undefined,
      businessBio: params.businessBio as string | undefined,
      governmentIdNumber: params.governmentIdNumber as string | undefined,
    };
  },
  verify: ResendOTP,
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [HandiworkPassword, Google, Facebook /*, Apple */],
});

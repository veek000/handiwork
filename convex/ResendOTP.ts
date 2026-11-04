// Email one-time-code provider for Convex Auth's Password `verify` step (signup
// wizard step 3). Sends a 4-digit numeric code via Resend. Requires AUTH_RESEND_KEY
// set on the Convex deployment; until it is set, sign-up cannot send codes.
import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";

export const ResendOTP = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  // Codes expire after 15 minutes (the provider default is 24 h). With a 4-digit code and
  // Convex Auth's ~10 failed attempts/hour lockout, 24 h allowed ~240 guesses (~2.4%);
  // 15 min caps it at ~10 (~0.1%).
  maxAge: 15 * 60,
  // 4-digit numeric code — matches the 4-box OTP UI on the signup Confirmation step.
  async generateVerificationToken() {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => (b % 10).toString()).join("");
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      // onboarding@resend.dev works for testing without a verified domain.
      from: "Handiwork <onboarding@resend.dev>",
      to: [email],
      subject: "Your Handiwork verification code",
      text: `Your Handiwork verification code is ${token}`,
    });
    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});

// Password reset by magic link (PROJECT.md "Password reset: magic link, not OTP" — a
// link has no short code someone can be talked into reading aloud). Convex Auth's
// Password `reset` step: flow "reset" emails the link, flow "reset-verification" (the
// /reset-password page) checks the token, sets the new password and signs out every
// other session. The token is 256 random bits and expires after 15 minutes.
// Requires AUTH_RESEND_KEY and SITE_URL on the Convex deployment.
import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";

const TTL_MINUTES = 15;

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export const ResendPasswordReset = Resend({
  id: "resend-password-reset",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: TTL_MINUTES * 60,
  async generateVerificationToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const site = (process.env.SITE_URL ?? "").replace(/\/$/, "");
    // `token`, not `code`: ConvexAuthProvider treats any ?code= in the URL as an OAuth
    // callback and consumes it on page load, which would burn the reset token.
    const link = `${site}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      // onboarding@resend.dev works for testing without a verified domain.
      from: "Handiwork <onboarding@resend.dev>",
      to: [email],
      subject: "Reset your Handiwork password",
      text: [
        "Someone asked to reset the password for your Handiwork account.",
        "",
        `Choose a new password here (the link works once and expires in ${TTL_MINUTES} minutes):`,
        link,
        "",
        "If this wasn't you, ignore this email — your password stays the same.",
        "Handiwork will never call or message you asking for this link.",
      ].join("\n"),
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#141414">
  <h1 style="font-size:20px;margin:0 0 12px">Reset your password</h1>
  <p style="margin:0 0 16px;line-height:1.5">Someone asked to reset the password for your Handiwork account.</p>
  <p style="margin:0 0 24px"><a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 20px;background:#001a13;color:#e8f5ee;font-weight:bold;text-decoration:none">Choose a new password</a></p>
  <p style="margin:0 0 8px;font-size:13px;color:#555;line-height:1.5">The link works once and expires in ${TTL_MINUTES} minutes.</p>
  <p style="margin:0 0 8px;font-size:13px;color:#555;line-height:1.5">If this wasn't you, ignore this email — your password stays the same.</p>
  <p style="margin:0;font-size:13px;color:#555;line-height:1.5">Handiwork will never call or message you asking for this link.</p>
</div>`,
    });
    if (error) throw new Error(JSON.stringify(error));
  },
});

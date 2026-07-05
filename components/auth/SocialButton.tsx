"use client";

/**
 * SocialButton — icon-only bordered button for third-party login.
 * Brand marks live in /assets/icons/social/. No real OAuth yet (Phase 6) — an
 * optional onClick is exposed for the parent to wire later. Styling: .hw-social-btn.
 */
export type SocialProvider = "facebook" | "google" | "apple";

const LABEL: Record<SocialProvider, string> = {
  facebook: "Facebook",
  google: "Google",
  apple: "Apple",
};

export function SocialButton({
  provider,
  onClick,
}: {
  provider: SocialProvider;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="hw-social-btn"
      aria-label={`Continue with ${LABEL[provider]}`}
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/assets/icons/social/${provider}.svg`} alt="" aria-hidden="true" width={24} height={24} />
    </button>
  );
}

export default SocialButton;

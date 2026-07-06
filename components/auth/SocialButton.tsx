"use client";

/**
 * SocialButton — icon-only bordered button for third-party login. Brand marks live
 * in /assets/icons/social/. `onClick` triggers the OAuth flow; `disabled` (+ optional
 * `title`) is used for providers not yet wired (e.g. Apple). Styling: .hw-social-btn.
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
  disabled,
  title,
}: {
  provider: SocialProvider;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      className="hw-social-btn"
      aria-label={`Continue with ${LABEL[provider]}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/assets/icons/social/${provider}.svg`} alt="" aria-hidden="true" width={24} height={24} />
    </button>
  );
}

export default SocialButton;

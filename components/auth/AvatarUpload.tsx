"use client";

/**
 * AvatarUpload — circular avatar placeholder with an upload badge. Static for now
 * (no real file upload until the backend lands, matching the rest of the auth
 * prototype). Styling: .hw-avatar-upload*.
 */
export function AvatarUpload() {
  return (
    <div className="hw-avatar-upload">
      <div className="hw-avatar-upload__circle">
        <hw-icon suppressHydrationWarning name="user" variant="filled" size="40"></hw-icon>
      </div>
      <button type="button" className="hw-avatar-upload__badge" aria-label="Upload profile photo">
        <hw-icon suppressHydrationWarning name="arrow-up-from-bracket" variant="filled" size="14"></hw-icon>
      </button>
    </div>
  );
}

export default AvatarUpload;

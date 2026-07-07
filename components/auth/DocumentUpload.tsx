"use client";

import { useRef, useState } from "react";

/**
 * DocumentUpload — the Verification-step ID uploader (Figma vendor signup, node
 * 363:12374). A dashed card with a file icon, "Upload Document" title + accepted-
 * formats subtitle, and a "Select Image" secondary button that opens a hidden
 * <input type="file"> (client-side only — the file is NOT uploaded anywhere yet;
 * real storage lands with the backend file pass, like AvatarUpload). On pick, the
 * card swaps its subtitle for the chosen filename. Controlled by the parent via the
 * optional `fileName`/`onFile` pair so the wizard can reflect the selection.
 * Styling: .hw-uploader*.
 */
export function DocumentUpload({
  fileName,
  onFile,
}: {
  fileName?: string;
  onFile?: (name: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localName, setLocalName] = useState<string | undefined>();
  const name = fileName ?? localName;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]?.name;
    setLocalName(picked);
    onFile?.(picked);
  }

  return (
    <div className={"hw-uploader" + (name ? " is-filled" : "")}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className="hw-uploader__input"
        onChange={handleChange}
      />
      <div className="hw-uploader__row">
        <span className="hw-uploader__icon" aria-hidden="true">
          <hw-icon suppressHydrationWarning name="image" variant="hollow" size="28"></hw-icon>
        </span>
        <div className="hw-uploader__text">
          <span className="hw-uploader__title">Upload Document</span>
          <span className="hw-uploader__subtitle">
            {name ?? "JPG, PNG, or GIF (max 10MB)"}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="hw-button hw-button--secondary hw-button--block hw-uploader__btn"
        onClick={() => inputRef.current?.click()}
      >
        {name ? "Change Image" : "Select Image"}
      </button>
    </div>
  );
}

export default DocumentUpload;

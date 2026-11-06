"use client";

import { useRef, useState } from "react";

/**
 * DocumentUpload — the Verification-step ID uploader (Figma vendor signup, node
 * 363:12374). A dashed card with a file icon, "Upload Document" title + accepted-
 * formats subtitle, and a "Select Image" secondary button that opens a hidden
 * <input type="file">. On pick, the card swaps its subtitle for the chosen filename
 * and `onFile` receives the name and the File (callers that store it upload it — My
 * Services does; the signup ID step doesn't yet). Files over 10MB or not JPG/PNG/GIF
 * are refused with a message. Controlled by the parent via the
 * optional `fileName`/`onFile` pair so the wizard can reflect the selection.
 * `title`/`hint` default to the Verification copy; Book Service reuses it as
 * "Upload image". Styling: .hw-uploader*.
 */
export function DocumentUpload({
  fileName,
  onFile,
  title = "Upload Document",
  hint,
  allowPdf = false,
}: {
  fileName?: string;
  onFile?: (name: string | undefined, file?: File) => void;
  title?: string;
  hint?: string;
  /** also accept PDF scans (ID documents) */
  allowPdf?: boolean;
}) {
  const types = allowPdf ? /^(image\/(jpeg|png|gif)|application\/pdf)$/ : /^image\/(jpeg|png|gif)$/;
  const label = allowPdf ? "JPG, PNG or PDF" : "JPG, PNG or GIF";
  hint = hint ?? `${label} (max 10MB)`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [localName, setLocalName] = useState<string | undefined>();
  const [problem, setProblem] = useState<string | null>(null);
  const name = fileName ?? localName;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && (!types.test(file.type) || file.size > 10 * 1024 * 1024)) {
      setProblem(`Use a ${label} under 10MB.`);
      e.target.value = "";
      return;
    }
    setProblem(null);
    setLocalName(file?.name);
    onFile?.(file?.name, file);
  }

  return (
    <div className={"hw-uploader" + (name ? " is-filled" : "")}>
      <input
        ref={inputRef}
        type="file"
        accept={allowPdf ? "image/jpeg,image/png,image/gif,application/pdf" : "image/jpeg,image/png,image/gif"}
        className="hw-uploader__input"
        onChange={handleChange}
      />
      <div className="hw-uploader__row">
        <span className="hw-uploader__icon" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/icons/upload-document.svg" alt="" aria-hidden="true" width={33} height={40} />
        </span>
        <div className="hw-uploader__text">
          <span className="hw-uploader__title">{title}</span>
          <span className="hw-uploader__subtitle" role={problem ? "alert" : undefined}>
            {problem ?? name ?? hint}
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

"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { DocumentUpload } from "@/components/auth/DocumentUpload";
import { FormStatus, IDLE, type Status } from "@/components/FormStatus";
import { api, errorMessage } from "@/lib/convexApi";
import { useUpload } from "@/lib/useUpload";

type VerificationStatus = "pending" | "verified" | "rejected" | undefined;

const STATUS_TEXT: Record<"none" | "pending" | "verified" | "rejected", { pill: string; text: string }> = {
  none: { pill: "Not submitted", text: "Upload a government ID (NIN slip, driver's licence, passport or voter's card) to get the verified badge." },
  pending: { pill: "Under review", text: "Thanks — we're checking your ID. This usually takes a working day. You can replace the document while you wait." },
  verified: { pill: "Verified", text: "Your ID has been checked. The verified badge shows on your profile and services." },
  rejected: { pill: "Not approved", text: "We couldn't verify the ID you sent. Fix the issue below and upload it again." },
};

/**
 * VerificationForm — Settings → Business: the vendor's ID status and, unless verified,
 * the ID number + document upload that sends it for review (users:submitVerification).
 * The document is only ever visible to Handiwork admins. Styling: .hw-settings*.
 */
export function VerificationForm({ status, note }: { status: VerificationStatus; note?: string }) {
  const [idNumber, setIdNumber] = useState("");
  const [file, setFile] = useState<File | undefined>();
  const [fileName, setFileName] = useState<string | undefined>();
  const [state, setState] = useState<Status>(IDLE);
  const submit = useMutation(api.submitVerification);
  const upload = useUpload();
  const key = status ?? "none";
  const info = STATUS_TEXT[key];

  async function send(e: FormEvent) {
    e.preventDefault();
    if (idNumber.trim().length < 5) return setState({ kind: "error", text: "Enter the ID number as it appears on the document." });
    if (!file) return setState({ kind: "error", text: "Choose a photo or scan of the document." });
    setState({ kind: "busy" });
    try {
      const documentStorageId = await upload(file);
      await submit({ idNumber, documentStorageId });
      setIdNumber("");
      setFile(undefined);
      setFileName(undefined);
      setState({ kind: "ok", text: "Sent for review. We'll notify you when it's checked." });
    } catch (err) {
      setState({ kind: "error", text: errorMessage(err, "We couldn't upload your ID. Please try again.") });
    }
  }

  return (
    <section className="hw-settings__group" aria-labelledby="ver-title">
      <h3 id="ver-title" className="hw-settings__group-title">Identity verification</h3>
      <div className="hw-settings__row">
        <span className="hw-settings__row-icon" aria-hidden="true">
          <hw-icon suppressHydrationWarning name="shield-check" variant="hollow" size="20"></hw-icon>
        </span>
        <div className="hw-settings__row-text">
          <p className="hw-settings__row-desc">{info.text}</p>
          {key === "rejected" && note ? <p className="hw-settings__fielderr">Reason: {note}</p> : null}
        </div>
        <span className={"hw-settings__pill" + (key === "verified" ? " hw-settings__pill--ok" : key === "rejected" ? " hw-settings__pill--bad" : "")}>
          {info.pill}
        </span>
      </div>

      {key !== "verified" ? (
        <form className="hw-settings__form" onSubmit={send} noValidate>
          <div className="hw-field">
            <label htmlFor="ver-number">Government ID Number</label>
            <Input id="ver-number" placeholder="Enter Government ID Number" autoComplete="off" value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)} />
          </div>
          <DocumentUpload
            title="Upload ID document"
            hint="JPG, PNG or PDF (max 10MB)"
            allowPdf
            fileName={fileName}
            onFile={(n, f) => { setFileName(n); setFile(f); }}
          />
          <div className="hw-settings__actions">
            <FormStatus status={state} />
            <div className="hw-settings__buttons">
              <Button type="submit" variant="primary" disabled={state.kind === "busy"}>
                {state.kind === "busy" ? "Uploading…" : key === "pending" ? "Replace Document" : "Submit for Review"}
              </Button>
            </div>
          </div>
        </form>
      ) : null}
    </section>
  );
}

export default VerificationForm;

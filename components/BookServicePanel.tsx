"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { SidePanel } from "@/components/SidePanel";
import { MultiSelect } from "@/components/MultiSelect";
import { Button } from "@/components/Button";
import { DocumentUpload } from "@/components/auth/DocumentUpload";

/**
 * BookServicePanel — "Book Service" request form (Figma desktop 6619:4273 → 6619:4668,
 * mobile 6619:19306 → 6619:19630) in the shared SidePanel: the vendor's services
 * (multi-select, the current one preselected), Date + Time, optional task description
 * and image, then Send Request → "Request Sent" confirmation with Message / Go Home.
 *
 * UI only: nothing is persisted — sending will create a pending Job once Convex is
 * wired. Figma's Date/Time placeholders read "Min" (copied from the price filter);
 * native date/time pickers are used instead. Styling: .hw-form* + .hw-booked*.
 */
export function BookServicePanel({
  vendorName,
  serviceOptions,
  initialService,
  messagesHref,
  homeHref,
  onClose,
}: {
  vendorName: string;
  serviceOptions: string[];
  initialService: string;
  messagesHref: string;
  homeHref: string;
  onClose: () => void;
}) {
  const [services, setServices] = useState<string[]>([initialService]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [task, setTask] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().slice(0, 10);
  const ready = services.length > 0 && Boolean(date) && Boolean(time);

  if (sent) {
    return (
      <SidePanel
        onClose={onClose}
        footer={
          <div className="hw-form__stack">
            <Link href={messagesHref} className="hw-button hw-button--secondary hw-button--block">
              Message Service Provider
            </Link>
            <Link href={homeHref} className="hw-button hw-button--primary hw-button--block">
              Go Home
            </Link>
          </div>
        }
      >
        <div className="hw-booked" role="status">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hw-booked__art" src="/assets/illustration/illustration-13.svg" alt="" width={128} height={128} />
          <h2 className="hw-booked__title">Request Sent</h2>
          <p className="hw-booked__text">Your request was sent to {vendorName}. Waiting for a quote.</p>
        </div>
      </SidePanel>
    );
  }

  return (
    <SidePanel
      title="Book Service"
      onClose={onClose}
      footer={
        <Button type="submit" form="hw-book-form" variant="primary" block disabled={!ready}>
          Send Request
        </Button>
      }
    >
      <form
        id="hw-book-form"
        className="hw-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) setSent(true);
        }}
      >
        <div className="hw-form__group">
          <span className="hw-form__label">What Service do you need?</span>
          <MultiSelect
            ariaLabel="What Service do you need?"
            values={services}
            onChange={setServices}
            options={serviceOptions}
            placeholder="Select the services you need"
          />
          <span className="hw-form__hint">Choose as many as desired</span>
        </div>

        <div className="hw-form__pair">
          <label className="hw-form__group">
            <span className="hw-form__label">Date</span>
            <span className="hw-form__picker">
              <input
                ref={dateRef}
                className="hw-input"
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <button type="button" className="hw-form__pickbtn" aria-label="Open calendar" onClick={() => dateRef.current?.showPicker?.()}>
                <hw-icon suppressHydrationWarning name="calendar" variant="hollow" size="16"></hw-icon>
              </button>
            </span>
          </label>
          <label className="hw-form__group">
            <span className="hw-form__label">Time</span>
            <span className="hw-form__picker">
              <input
                ref={timeRef}
                className="hw-input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
              <button type="button" className="hw-form__pickbtn" aria-label="Open time picker" onClick={() => timeRef.current?.showPicker?.()}>
                <hw-icon suppressHydrationWarning name="clock" variant="hollow" size="16"></hw-icon>
              </button>
            </span>
          </label>
        </div>

        <label className="hw-form__group">
          <span className="hw-form__label">
            Describe your task <span className="hw-form__optional">(Optional)</span>
          </span>
          <textarea
            className="hw-input"
            placeholder="Enter description"
            rows={4}
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
        </label>

        <div className="hw-form__group">
          <span className="hw-form__label">
            Images <span className="hw-form__optional">(Optional)</span>
          </span>
          <DocumentUpload title="Upload image" fileName={image} onFile={setImage} />
        </div>
      </form>
    </SidePanel>
  );
}

export default BookServicePanel;

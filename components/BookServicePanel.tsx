"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { SidePanel } from "@/components/SidePanel";
import { MultiSelect } from "@/components/MultiSelect";
import { Button } from "@/components/Button";
import { FormStatus, IDLE, type Status } from "@/components/FormStatus";
import { live, errorMessage } from "@/lib/convexApi";

/**
 * BookServicePanel — "Book Service" request form (Figma desktop 6619:4273 → 6619:4668,
 * mobile 6619:19306 → 6619:19630) in the shared SidePanel: the vendor's services
 * (multi-select, the current one preselected), Date + Time, optional task description,
 * then Send Request → a pending job in Convex (jobs:request, which notifies the vendor)
 * → "Request Sent" with Message (that job's chat) / Go Home.
 *
 * Figma's optional task image is left out until file uploads exist. Figma's Date/Time
 * placeholders read "Min" (copied from the price filter); native pickers are used
 * instead. Styling: .hw-form* + .hw-booked*.
 */
export function BookServicePanel({
  vendorName,
  serviceOptions,
  initialServiceId,
  homeHref,
  onClose,
}: {
  vendorName: string;
  serviceOptions: { id: string; title: string }[];
  initialServiceId: string;
  homeHref: string;
  onClose: () => void;
}) {
  const initial = serviceOptions.find((o) => o.id === initialServiceId)?.title;
  const [services, setServices] = useState<string[]>(initial ? [initial] : []);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [task, setTask] = useState("");
  const [sentJobId, setSentJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(IDLE);
  const request = useMutation(live.requestJob);
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().slice(0, 10);
  const ready = services.length > 0 && Boolean(date) && Boolean(time);

  async function send() {
    // The service the customer opened goes first, then the extras in list order.
    const chosen = serviceOptions.filter((o) => services.includes(o.title));
    chosen.sort((a, b) => Number(b.id === initialServiceId) - Number(a.id === initialServiceId));
    setStatus({ kind: "busy" });
    try {
      const jobId = await request({
        serviceIds: chosen.map((o) => o.id),
        preferredDate: date,
        preferredTime: time,
        description: task,
      });
      setSentJobId(jobId);
    } catch (err) {
      setStatus({ kind: "error", text: errorMessage(err, "We couldn't send your request. Please try again.") });
    }
  }

  if (sentJobId) {
    return (
      <SidePanel
        onClose={onClose}
        footer={
          <div className="hw-form__stack">
            <Link href={`/customer/messages?job=${sentJobId}`} className="hw-button hw-button--secondary hw-button--block">
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
        <div className="hw-form__stack">
          <FormStatus status={status} />
          <Button type="submit" form="hw-book-form" variant="primary" block disabled={!ready || status.kind === "busy"}>
            {status.kind === "busy" ? "Sending…" : "Send Request"}
          </Button>
        </div>
      }
    >
      <form
        id="hw-book-form"
        className="hw-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready && status.kind !== "busy") send();
        }}
      >
        <div className="hw-form__group">
          <span className="hw-form__label">What Service do you need?</span>
          <MultiSelect
            ariaLabel="What Service do you need?"
            values={services}
            onChange={setServices}
            options={serviceOptions.map((o) => o.title)}
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
            maxLength={1000}
            onChange={(e) => setTask(e.target.value)}
          />
        </label>
      </form>
    </SidePanel>
  );
}

export default BookServicePanel;

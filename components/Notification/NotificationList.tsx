"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import type { Notification } from "@/types";
import { live } from "@/lib/convexApi";
import { NotificationItem } from "./NotificationItem";

/**
 * NotificationList — the shared notification content: All/Unread tabs, the items
 * grouped Today / Earlier (or the empty state), and "Mark all as read" (saved to
 * Convex). Used by the desktop dropdown (NotificationBell, `withHead`) and the full
 * notification page (which renders its own Mark-all beside the heading and pages the
 * list through `pageItems`). Rows about a job link to its chat. Styling: .hw-notif*.
 */
export function NotificationList({
  notifications,
  role,
  withHead = false,
  pageItems,
}: {
  notifications: Notification[];
  role: "customer" | "vendor";
  withHead?: boolean;
  /** page the visible list (the full page); receives the filtered list */
  pageItems?: (list: Notification[]) => Notification[];
}) {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const markAll = useMutation(live.markAllNotificationsRead);

  const unread = notifications.filter((n) => !n.read);
  const filtered = tab === "all" ? notifications : unread;
  const shown = pageItems ? pageItems(filtered) : filtered;
  const today = new Date().toDateString();
  const groups = [
    { label: "Today", items: shown.filter((n) => new Date(n.createdAt).toDateString() === today) },
    { label: "Earlier", items: shown.filter((n) => new Date(n.createdAt).toDateString() !== today) },
  ].filter((g) => g.items.length);

  return (
    <div className="hw-notif-body">
      {withHead ? (
        <div className="hw-notif-panel__head">
          <span className="hw-notif-panel__title">Notification</span>
          <button type="button" className="hw-link hw-notif-panel__mark" disabled={!unread.length} onClick={() => markAll({})}>
            Mark all as read
          </button>
        </div>
      ) : null}

      <div className="hw-notif-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "all"}
          className={"hw-notif-tabs__tab" + (tab === "all" ? " is-active" : "")}
          onClick={() => setTab("all")}>
          All
        </button>
        <button type="button" role="tab" aria-selected={tab === "unread"}
          className={"hw-notif-tabs__tab" + (tab === "unread" ? " is-active" : "")}
          onClick={() => setTab("unread")}>
          Unread ({unread.length})
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="hw-notif-empty">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hw-notif-empty__art" src="/assets/illustration/illustration-16.svg" alt="" aria-hidden="true" />
          <p className="hw-notif-empty__title">No Notification</p>
          <p className="hw-notif-empty__text">New updates about bookings and offers will show up here.</p>
        </div>
      ) : (
        <div className="hw-notif-scroll">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="hw-notif-group">{g.label}</p>
              <ul className="hw-notif-list">
                {g.items.map((n) => (
                  <NotificationItem key={n.id} notification={n} href={n.jobId ? `/${role}/messages?job=${n.jobId}` : undefined} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationList;

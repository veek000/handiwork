"use client";

import { useState } from "react";
import type { Notification } from "@/types";
import { NotificationItem } from "./NotificationItem";

/**
 * NotificationList — the shared notification content: All/Unread tabs + the "Today"
 * group + items (or the empty state), with a local "Mark all as read". Used by the
 * desktop dropdown (NotificationBell, with `withHead`) and the mobile full-screen
 * notification page (NotificationPage, without the head). Styling: .hw-notif*.
 */
export function NotificationList({
  notifications,
  withHead = false,
}: {
  notifications: Notification[];
  withHead?: boolean;
}) {
  const [items, setItems] = useState(notifications);
  const [tab, setTab] = useState<"all" | "unread">("all");

  const unread = items.filter((n) => !n.read);
  const shown = tab === "all" ? items : unread;

  return (
    <div className="hw-notif-body">
      {withHead ? (
        <div className="hw-notif-panel__head">
          <span className="hw-notif-panel__title">Notification</span>
          <button
            type="button"
            className="hw-link hw-notif-panel__mark"
            onClick={() => setItems((list) => list.map((n) => ({ ...n, read: true })))}
          >
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

      {shown.length === 0 ? (
        <div className="hw-notif-empty">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hw-notif-empty__art" src="/assets/illustration/illustration-16.svg" alt="" aria-hidden="true" />
          <p className="hw-notif-empty__title">No Notification</p>
          <p className="hw-notif-empty__text">New updates about bookings and offers will show up here.</p>
        </div>
      ) : (
        <div className="hw-notif-scroll">
          <p className="hw-notif-group">Today</p>
          <ul className="hw-notif-list">
            {shown.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default NotificationList;

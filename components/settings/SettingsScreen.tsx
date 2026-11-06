"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useQuery } from "convex/react";
import { PageNav } from "@/components/PageNav";
import { viewerRef } from "@/app/(auth)/useRoleRedirect";
import { DEFAULT_NOTIFICATION_PREFS, type ViewerDoc } from "@/lib/convexApi";
import { ProfileSettings } from "./ProfileSettings";
import { BusinessSettings } from "./BusinessSettings";
import { NotificationSettings } from "./NotificationSettings";
import { SecuritySettings } from "./SecuritySettings";
import { VerificationForm } from "./VerificationForm";

export type SettingsTab = "profile" | "business" | "notifications" | "security";

const TABS: { value: SettingsTab; label: string; icon: string; title: string; desc: string; vendorOnly?: boolean }[] = [
  { value: "profile", label: "Profile", icon: "user", title: "Profile", desc: "Your name, contact details and where you are." },
  { value: "business", label: "Business", icon: "suitcase", title: "Business", desc: "What customers see about your services.", vendorOnly: true },
  { value: "notifications", label: "Notifications", icon: "bell", title: "Notifications", desc: "Choose what we tell you about, and where." },
  { value: "security", label: "Security", icon: "lock-closed", title: "Security", desc: "Your password, devices and account." },
];

/**
 * Settings (both roles) — not in the Figma capture; built from the dashboard's existing
 * parts (PageNav + Changa One title, signup fields, SidePanel, square white cards).
 * Desktop: a section list on the left, the active section's card on the right. Mobile:
 * the sections become a scrolling tab row above the card. `?tab=` deep-links a section.
 *
 * Reads the signed-in account (users:viewer) and saves to Convex. With no account (only
 * possible under the local NEXT_PUBLIC_DEV_SKIP_AUTH bypass) the form starts empty and
 * saving fails with the signed-out message.
 */
export function SettingsScreen({
  role,
  serviceOptions,
  initialTab,
}: {
  role: "customer" | "vendor";
  serviceOptions: string[];
  initialTab?: string;
}) {
  const tabs = TABS.filter((t) => !t.vendorOnly || role === "vendor");
  const [tab, setTab] = useState<SettingsTab>(tabs.find((t) => t.value === initialTab)?.value ?? "profile");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const viewer = useQuery(viewerRef) as ViewerDoc | null | undefined;

  const v = viewer ?? null;
  const profile = {
    fullName: v?.fullName || v?.name || "",
    countryCode: v?.countryCode || "+234",
    phone: v?.phone || "",
    state: v?.state || "",
    area: v?.area || "",
    address: v?.address || "",
  };
  const business = {
    service: v ? v.service || "" : "",
    yearsOfExperience: v ? v.yearsOfExperience || "" : "",
    businessBio: v?.businessBio || "",
  };
  // Remount the sections when the source switches (loading → account) so their form
  // state starts from the real values.
  const source = v ? "account" : "fallback";

  function select(next: SettingsTab) {
    setTab(next);
    window.history.replaceState(null, "", `?tab=${next}`);
  }

  function onTabKey(e: KeyboardEvent) {
    const i = tabs.findIndex((t) => t.value === tab);
    const go = (j: number) => {
      e.preventDefault();
      const next = tabs[(j + tabs.length) % tabs.length].value;
      select(next);
      tabRefs.current[next]?.focus();
    };
    if (e.key === "ArrowDown" || e.key === "ArrowRight") go(i + 1);
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") go(i - 1);
    if (e.key === "Home") go(0);
    if (e.key === "End") go(tabs.length - 1);
  }

  const active = tabs.find((t) => t.value === tab) ?? tabs[0];

  return (
    <div className="hw-jobs hw-settings">
      <PageNav backHref={`/${role}`} crumbs={[{ label: "Home", href: `/${role}` }, { label: "Settings" }]} />
      <header className="hw-settings__head">
        <h1 className="hw-jobs__title">Settings</h1>
        <p className="hw-settings__lede">Manage your profile, notifications and account security.</p>
      </header>

      <div className="hw-settings__layout">
        <div className="hw-settings__nav" role="tablist" aria-label="Settings sections" aria-orientation="vertical" onKeyDown={onTabKey}>
          {tabs.map((t) => (
            <button
              key={t.value}
              ref={(el) => { tabRefs.current[t.value] = el; }}
              type="button"
              role="tab"
              id={`settings-tab-${t.value}`}
              aria-selected={t.value === tab}
              aria-controls="settings-panel"
              tabIndex={t.value === tab ? 0 : -1}
              className={"hw-settings__tab" + (t.value === tab ? " is-active" : "")}
              onClick={() => select(t.value)}
            >
              <hw-icon suppressHydrationWarning name={t.icon} variant={t.value === tab ? "filled" : "hollow"} size="16"></hw-icon>
              {t.label}
            </button>
          ))}
        </div>

        <section id="settings-panel" className="hw-settings__card" role="tabpanel" aria-labelledby={`settings-tab-${active.value}`}>
          <header className="hw-settings__card-head">
            <h2 className="hw-settings__card-title">{active.title}</h2>
            <p className="hw-settings__card-desc">{active.desc}</p>
          </header>

          {active.value === "profile" ? (
            <ProfileSettings key={source} initial={profile} email={v?.email ?? ""}
              avatarUrl={v?.image} roleLabel={role === "vendor" ? "Service Provider" : "Customer"} />
          ) : null}
          {active.value === "business" ? (
            <>
              <BusinessSettings key={source} initial={business} serviceOptions={serviceOptions} />
              <VerificationForm status={v?.verificationStatus} note={v?.verificationNote} />
            </>
          ) : null}
          {active.value === "notifications" ? (
            <NotificationSettings key={source} role={role} initial={v?.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS} />
          ) : null}
          {active.value === "security" ? <SecuritySettings /> : null}
        </section>
      </div>
    </div>
  );
}

export default SettingsScreen;

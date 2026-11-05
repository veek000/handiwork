"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import type { Service } from "@/types";
import { live } from "@/lib/convexApi";
import { useRunner } from "@/lib/useRunner";
import { ActionError } from "@/components/ActionError";
import { PageNav } from "@/components/PageNav";
import { ServiceListItem } from "@/components/ServiceListItem";
import { FilterPanel } from "@/components/FilterPanel";
import { ConfirmPanel } from "@/components/ConfirmPanel";
import { ServiceFormPanel, type ServiceDraft } from "@/components/ServiceFormPanel";
import { EMPTY_FILTERS, activeFilterCount, searchServices, type SearchFilters } from "@/lib/search";

type Panel = { kind: "filter" } | { kind: "add" } | { kind: "edit" | "delete"; id: string } | null;

/**
 * Vendor My Services (Figma desktop 6619:30286 / 30518 / 30816, mobile 6619:42699 /
 * 42847 / 43047): the vendor's services with Edit / Delete, "+ Add New Service", Filter
 * By. Add / Edit open ServiceFormPanel; Delete asks first (not in Figma — destructive).
 * Saved to Convex (services:create / update / archive — "Delete" archives, so past jobs
 * keep their service). A picked photo is uploaded to Convex storage first.
 */
export function VendorServicesScreen({
  services,
  categories,
}: {
  services: Service[];
  categories: string[];
}) {
  const { run, busy, error, clearError } = useRunner();
  const createService = useMutation(live.createService);
  const updateService = useMutation(live.updateService);
  const archiveService = useMutation(live.archiveService);
  const uploadUrl = useMutation(live.uploadUrl);
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [panel, setPanel] = useState<Panel>(null);
  // Filters apply as on Search, but with no sort chosen the vendor's own order is kept
  // (newest additions first) rather than Search's popularity default.
  const shown = useMemo(() => {
    const hits = searchServices(services, "", filters);
    if (filters.sort) return hits;
    const keep = new Set(hits.map((s) => s.id));
    return services.filter((s) => keep.has(s.id));
  }, [services, filters]);
  const count = activeFilterCount(filters);
  const target = panel && "id" in panel ? services.find((s) => s.id === panel.id) : undefined;
  const close = () => setPanel(null);

  async function upload(file: File) {
    const url = await uploadUrl({});
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
    if (!res.ok) throw new Error("upload failed");
    const { storageId } = (await res.json()) as { storageId: string };
    return storageId;
  }

  async function save(draft: ServiceDraft) {
    if (busy) return;
    const ok = await run(async () => {
      const imageStorageId = draft.file ? await upload(draft.file) : undefined;
      const fields = { category: draft.category, price: draft.price, priceUnit: draft.priceUnit, description: draft.description, imageStorageId };
      if (panel?.kind === "edit" && target) await updateService({ id: target.id, ...fields });
      else await createService(fields);
    }, "We couldn't save the service. Please try again.");
    if (ok) close();
  }

  return (
    <div className="hw-vservices">
      <PageNav backHref="/vendor" crumbs={[{ label: "Home", href: "/vendor" }, { label: "My Services" }]} />

      <div className="hw-searchpage__titlerow">
        <h1 className="hw-jobs__title">My Services</h1>
        <button type="button" className={"hw-filterbtn" + (count ? " is-active" : "")} aria-haspopup="dialog" onClick={() => setPanel({ kind: "filter" })}>
          Filter By{count ? ` (${count})` : ""}
          <hw-icon suppressHydrationWarning name="angle-down" variant="hollow" size="16"></hw-icon>
        </button>
      </div>

      <button type="button" className="hw-button hw-button--primary hw-button--block hw-vservices__add" onClick={() => setPanel({ kind: "add" })}>
        <hw-icon suppressHydrationWarning name="plus" variant="filled" size="16"></hw-icon>
        Add New Service
      </button>

      {shown.length ? (
        <div className="hw-searchpage__grid">
          {shown.map((s) => (
            <ServiceListItem
              key={s.id}
              service={s}
              actions={
                <>
                  <button type="button" className="hw-jobcard__btn hw-jobcard__btn--complete" onClick={() => setPanel({ kind: "edit", id: s.id })}>
                    Edit
                  </button>
                  <button type="button" className="hw-jobcard__btn hw-jobcard__btn--cancel" onClick={() => setPanel({ kind: "delete", id: s.id })}>
                    Delete
                  </button>
                </>
              }
            />
          ))}
        </div>
      ) : (
        <p className="hw-searchpage__emptysub">
          {services.length ? "No services match these filters." : "You haven't added any services yet."}
        </p>
      )}

      {panel?.kind === "filter" ? (
        <FilterPanel value={filters} onClose={close} onApply={(next) => { setFilters(next); close(); }} />
      ) : null}
      {panel?.kind === "add" || (panel?.kind === "edit" && target) ? (
        <ServiceFormPanel categories={categories} service={panel.kind === "edit" ? target : undefined} onSubmit={save} onClose={close} />
      ) : null}
      {panel?.kind === "delete" && target ? (
        <ConfirmPanel
          title="Delete Service"
          text={`Remove "${target.title}" from your services? Customers will no longer be able to book it.`}
          confirmLabel="Delete"
          onClose={close}
          onConfirm={async () => {
            if (!busy && (await run(() => archiveService({ id: target.id })))) close();
          }}
        />
      ) : null}
      <ActionError error={error} onDismiss={clearError} />
    </div>
  );
}

export default VendorServicesScreen;

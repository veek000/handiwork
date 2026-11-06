"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { adminApi } from "@/lib/convexApi";
import { LoadingState } from "@/components/LoadingState";
import { AdminHead, Empty, NotePanel, Pill, Toolbar, naira, shortDate } from "@/components/admin/AdminParts";

/** Services: every listing; archive one that breaks the rules (hidden from customers) or restore it. */
export default function AdminServicesPage() {
  const [search, setSearch] = useState("");
  const list = useQuery(adminApi.services, { search });
  const setArchived = useMutation(adminApi.setServiceArchived);
  const [target, setTarget] = useState<{ id: string; title: string; vendor: string; archived: boolean } | null>(null);

  return (
    <div className="hw-admin__page">
      <AdminHead title="Services" lede="All listings, including archived ones." />
      <Toolbar search={search} onSearch={setSearch} placeholder="Search title, category or provider" />
      {list === undefined ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <Empty>No services match.</Empty>
      ) : (
        <div className="hw-admin__tablewrap">
          <table className="hw-admin__table">
            <thead>
              <tr><th>Service</th><th>Provider</th><th>Price</th><th>Rating</th><th>Status</th><th>Listed</th><th></th></tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id}>
                  <td><b>{s.title}</b> <span className="hw-admin__muted">· {s.category}</span></td>
                  <td>{s.vendor}</td>
                  <td>{naira(s.price)}/{s.priceUnit}</td>
                  <td>{s.reviewCount ? `${s.rating} (${s.reviewCount})` : "—"}</td>
                  <td><Pill value={s.archived ? "archived" : "active"} /></td>
                  <td>{shortDate(s.createdAt)}</td>
                  <td>
                    <button type="button" className="hw-link hw-admin__rowbtn" onClick={() => setTarget(s)}>
                      {s.archived ? "Restore" : "Archive"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {target ? (
        <NotePanel
          title={target.archived ? "Restore service" : "Archive service"}
          text={
            target.archived
              ? `Show "${target.title}" by ${target.vendor} to customers again?`
              : `Hide "${target.title}" by ${target.vendor} from customers? Past jobs keep it.`
          }
          confirmLabel={target.archived ? "Restore" : "Archive"}
          danger={!target.archived}
          onClose={() => setTarget(null)}
          onConfirm={(note) => setArchived({ serviceId: target.id, archived: !target.archived, note: note || undefined })}
        />
      ) : null}
    </div>
  );
}

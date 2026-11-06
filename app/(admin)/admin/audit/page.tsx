"use client";

import { useQuery } from "convex/react";
import { adminApi } from "@/lib/convexApi";
import { LoadingState } from "@/components/LoadingState";
import { AdminHead, Empty, dateTime } from "@/components/admin/AdminParts";

/** Audit log: the latest 200 admin actions. Records can't be edited or deleted. */
export default function AdminAuditPage() {
  const list = useQuery(adminApi.auditLog, {});
  return (
    <div className="hw-admin__page">
      <AdminHead title="Audit Log" lede="Every admin action, newest first. Entries can't be changed." />
      {list === undefined ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <Empty>No admin actions yet.</Empty>
      ) : (
        <div className="hw-admin__tablewrap">
          <table className="hw-admin__table">
            <thead>
              <tr><th>When</th><th>Admin</th><th>Action</th><th>Target</th><th>Note</th></tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>{dateTime(a.at)}</td>
                  <td>{a.admin}</td>
                  <td>{a.action.replace(/_/g, " ")}</td>
                  <td><span className="hw-admin__muted">{a.targetType}</span> <span className="hw-admin__mono">{a.targetId.slice(-8)}</span></td>
                  <td>{a.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

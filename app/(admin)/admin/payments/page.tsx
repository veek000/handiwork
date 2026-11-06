"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { adminApi } from "@/lib/convexApi";
import { LoadingState } from "@/components/LoadingState";
import { AdminHead, Empty, Pill, Toolbar, naira, shortDate } from "@/components/admin/AdminParts";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Awaiting payment" },
  { value: "held", label: "Held in escrow" },
  { value: "released", label: "Released" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Abandoned" },
];

/** Payments: every escrow record (read-only — settle disputes from Jobs & Disputes). */
export default function AdminPaymentsPage() {
  const [filter, setFilter] = useState("all");
  const list = useQuery(adminApi.payments, { status: filter });
  const total = (list ?? []).reduce((n, p) => n + p.total, 0);

  return (
    <div className="hw-admin__page">
      <AdminHead
        title="Payments"
        lede="Escrow records. “simulated” payments come from the dev test mode; real ones will show Flutterwave."
      />
      <Toolbar filters={FILTERS} filter={filter} onFilter={setFilter} />
      {list === undefined ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <Empty>No payments here.</Empty>
      ) : (
        <>
          <p className="hw-admin__muted">{list.length} payments · {naira(total)} paid by customers in total</p>
          <div className="hw-admin__tablewrap">
            <table className="hw-admin__table">
              <thead>
                <tr><th>Job</th><th>Customer → Provider</th><th>Status</th><th>Quote</th><th>Fees</th><th>Total</th><th>Refunded</th><th>Date</th></tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td><Link href={`/admin/jobs?status=all`} className="hw-link">{p.job}</Link></td>
                    <td>{p.customer} → {p.vendor}</td>
                    <td><Pill value={p.status} /> <span className="hw-admin__muted">{p.provider}</span></td>
                    <td>{naira(p.amount)}</td>
                    <td>{naira(p.fees)}</td>
                    <td><b>{naira(p.total)}</b></td>
                    <td>{p.refundAmount != null ? naira(p.refundAmount) : "—"}</td>
                    <td>{shortDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

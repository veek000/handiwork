"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { adminApi } from "@/lib/convexApi";
import { LoadingState } from "@/components/LoadingState";
import { SidePanel } from "@/components/SidePanel";
import { Button } from "@/components/Button";
import { AdminHead, Empty, NotePanel, Pill, Toolbar, naira, shortDate } from "@/components/admin/AdminParts";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "customer", label: "Customers" },
  { value: "vendor", label: "Providers" },
  { value: "pending", label: "ID pending" },
  { value: "no_role", label: "Setup unfinished" },
  { value: "suspended", label: "Suspended" },
  { value: "admin", label: "Admins" },
  { value: "demo", label: "Demo" },
];

/** Users: find any account, see its activity, and suspend or restore it (with a reason, logged). */
export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get("filter");
    if (f && FILTERS.some((x) => x.value === f)) setFilter(f);
  }, []);
  const users = useQuery(adminApi.users, { search, filter });

  return (
    <div className="hw-admin__page">
      <AdminHead title="Users" lede="Customers, service providers and staff. Click a row for details." />
      <Toolbar search={search} onSearch={setSearch} placeholder="Search name, email or phone" filters={FILTERS} filter={filter} onFilter={setFilter} />
      {users === undefined ? (
        <LoadingState />
      ) : users.length === 0 ? (
        <Empty>No accounts match.</Empty>
      ) : (
        <div className="hw-admin__tablewrap">
          <table className="hw-admin__table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} tabIndex={0} onClick={() => setOpenId(u.id)} onKeyDown={(e) => e.key === "Enter" && setOpenId(u.id)}>
                  <td><b>{u.name}</b>{u.location ? <span className="hw-admin__muted"> · {u.location}</span> : null}</td>
                  <td>{u.email || "—"}</td>
                  <td>{u.role === "vendor" ? "Provider" : u.role === "customer" ? "Customer" : <Pill value="pending" label="no role" />}</td>
                  <td className="hw-admin__pills">
                    {u.isAdmin ? <Pill value="admin" /> : null}
                    {u.demo ? <Pill value="demo" /> : null}
                    {u.suspended ? <Pill value="suspended" /> : null}
                    {u.verificationStatus ? <Pill value={u.verificationStatus} label={`ID ${u.verificationStatus}`} /> : null}
                  </td>
                  <td>{shortDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {openId ? <UserPanel id={openId} onClose={() => setOpenId(null)} /> : null}
    </div>
  );
}

function UserPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const u = useQuery(adminApi.userDetail, { id });
  const setSuspended = useMutation(adminApi.setSuspended);
  const [confirm, setConfirm] = useState<"suspend" | "restore" | null>(null);

  if (confirm && u) {
    return confirm === "suspend" ? (
      <NotePanel
        title="Suspend account"
        text={`${u.name} won't be able to use Handiwork until restored. Their services disappear from search. Open jobs stay as they are — settle them from Jobs & Disputes.`}
        confirmLabel="Suspend"
        danger
        noteLabel="Reason (shown to the user)"
        noteRequired
        onClose={() => setConfirm(null)}
        onConfirm={(reason) => setSuspended({ userId: u.id, suspended: true, reason })}
      />
    ) : (
      <NotePanel
        title="Restore account"
        text={`Lift the suspension on ${u.name}?`}
        confirmLabel="Restore"
        onClose={() => setConfirm(null)}
        onConfirm={(reason) => setSuspended({ userId: u.id, suspended: false, reason: reason || undefined })}
      />
    );
  }

  return (
    <SidePanel
      title={u?.name ?? "Account"}
      onClose={onClose}
      footer={
        u && !u.deleted && !u.isAdmin ? (
          u.suspended ? (
            <Button variant="primary" block onClick={() => setConfirm("restore")}>Restore Account</Button>
          ) : (
            <Button variant="secondary" block className="hw-settings__danger-btn" onClick={() => setConfirm("suspend")}>Suspend Account</Button>
          )
        ) : undefined
      }
    >
      {u === undefined ? (
        <LoadingState />
      ) : u === null ? (
        <Empty>This account no longer exists.</Empty>
      ) : (
        <div className="hw-settings__form">
          <div className="hw-admin__pills">
            <Pill value={u.role ?? "pending"} label={u.role === "vendor" ? "provider" : u.role ?? "no role"} />
            {u.isAdmin ? <Pill value="admin" /> : null}
            {u.suspended ? <Pill value="suspended" /> : null}
            {u.verificationStatus ? <Pill value={u.verificationStatus} label={`ID ${u.verificationStatus}`} /> : null}
          </div>
          {u.suspended && u.suspendedReason ? <p className="hw-settings__fielderr">Suspended: {u.suspendedReason}</p> : null}
          <dl className="hw-admin__facts">
            <div><dt>Email</dt><dd>{u.email || "—"}</dd></div>
            <div><dt>Phone</dt><dd>{u.phone || "—"}</dd></div>
            <div><dt>Location</dt><dd>{u.location || "—"}</dd></div>
            <div><dt>Address</dt><dd>{u.address || "—"}</dd></div>
            <div><dt>Signs in with</dt><dd>{u.signInMethods.join(", ") || "—"}</dd></div>
            <div><dt>Joined</dt><dd>{shortDate(u.createdAt)}</dd></div>
            {u.role === "vendor" ? (
              <>
                <div><dt>Service</dt><dd>{u.service || "—"}{u.yearsOfExperience ? ` · ${u.yearsOfExperience}` : ""}</dd></div>
                <div><dt>Active services</dt><dd>{u.services}</dd></div>
                <div><dt>Earned (released)</dt><dd>{naira(u.earnedTotal)}</dd></div>
                {u.verificationNote ? <div><dt>ID note</dt><dd>{u.verificationNote}</dd></div> : null}
              </>
            ) : (
              <div><dt>Paid (held + released)</dt><dd>{naira(u.paidTotal)}</dd></div>
            )}
            <div><dt>Jobs</dt><dd>{u.jobs.asCustomer} as customer · {u.jobs.asVendor} as provider · {u.jobs.open} open</dd></div>
          </dl>
          {u.bio ? <p className="hw-settings__row-desc">{u.bio}</p> : null}
          {u.isAdmin ? <p className="hw-admin__muted">Admins can only be removed from the CLI (admin:grantAdmin with revoke).</p> : null}
        </div>
      )}
    </SidePanel>
  );
}

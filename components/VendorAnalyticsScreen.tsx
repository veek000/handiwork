"use client";

import { useState } from "react";
import type { Job, User, Wallet } from "@/types";
import { PageNav } from "@/components/PageNav";
import { StatTile } from "@/components/StatTile";
import { SortSelect } from "@/components/SortSelect";
import { RevenueChart } from "@/components/RevenueChart";
import { JobCard } from "@/components/JobCard";
import { formatNaira } from "@/lib/time";

type Range = "year" | "half";

/**
 * Vendor Analytics (Figma desktop 6619:32291, mobile 6619:43823): Active Job / Service
 * Request / Total Job Done tiles (derived from jobs, like Vendor Home), Total Revenue with
 * a Yearly / Last 6 Months switch, the revenue bars, and Job History (finished, cancelled
 * and rejected jobs, newest first, with their date). Amounts are NGN (project convention;
 * Figma mocks "$"). `currentMonth` is 0-based (mock reference date → September).
 */
export function VendorAnalyticsScreen({
  jobs,
  customers,
  wallet,
  currentMonth,
}: {
  jobs: Job[];
  customers: User[];
  wallet: Wallet;
  currentMonth: number;
}) {
  const [range, setRange] = useState<Range>("year");
  const count = (statuses: Job["status"][]) => jobs.filter((j) => statuses.includes(j.status)).length;

  const months = wallet.revenueByMonth;
  const start = range === "year" ? 0 : Math.max(0, currentMonth - 5);
  const values = range === "year" ? months : months.slice(start, currentMonth + 1);
  const total = values.reduce((a, b) => a + b, 0);
  const yearToDate = months.reduce((a, b) => a + b, 0);
  const change = wallet.lastYearRevenue ? ((yearToDate - wallet.lastYearRevenue) / wallet.lastYearRevenue) * 100 : null;

  const history = jobs
    .filter((j) => ["completed", "cancelled", "rejected"].includes(j.status))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const icon = (name: string) => <hw-icon suppressHydrationWarning name={name} variant="filled" size="16"></hw-icon>;

  return (
    <div className="hw-jobs hw-analytics">
      <PageNav backHref="/vendor" crumbs={[{ label: "Home", href: "/vendor" }, { label: "Analytics" }]} />
      <h1 className="hw-jobs__title">Analysis</h1>

      <div className="hw-analysis-grid">
        <StatTile icon={icon("clipboard")} label="Active Job" value={count(["in_progress", "marked_completed"])} />
        <StatTile icon={icon("inbox")} label="Service Request" value={count(["pending", "quoted"])} />
        <StatTile icon={icon("target-arrow")} label="Total Job Done" value={count(["completed"])} />
      </div>

      <section className="hw-revenue" aria-labelledby="hw-revenue-title">
        <div className="hw-revenue__head">
          <h2 id="hw-revenue-title" className="hw-revenue__title">
            {icon("chart-pie")}
            Total Revenue
          </h2>
          <div className="hw-orders-sort">
            <SortSelect
              value={range}
              onChange={(v) => setRange(v as Range)}
              options={[
                { value: "year", label: "Yearly Revenue" },
                { value: "half", label: "Last 6 Months" },
              ]}
            />
          </div>
        </div>
        <p className="hw-revenue__total">{formatNaira(total)}</p>
        {range === "year" && change != null ? (
          <p className="hw-revenue__change">
            <span className={"hw-revenue__delta" + (change < 0 ? " is-down" : "")}>
              <hw-icon suppressHydrationWarning name="arrow-up" variant="filled" size="12"></hw-icon>
              {Math.abs(Math.round(change))}%
            </span>
            vs last year
          </p>
        ) : null}
        <RevenueChart key={range} values={values} startMonth={start} initialIndex={currentMonth - start} />
      </section>

      <section className="hw-jobs" aria-labelledby="hw-history-title">
        <h2 id="hw-history-title" className="hw-jobs__title">Job History</h2>
        {history.length ? (
          <div className="hw-jobs__list">
            {history.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                compact
                party={{ label: "Requested by", name: customers.find((c) => c.id === job.customerId)?.fullName ?? "—" }}
                stamp={job.createdAt.slice(0, 10)}
              >
                <></>
              </JobCard>
            ))}
          </div>
        ) : (
          <p className="hw-searchpage__emptysub">No finished jobs yet.</p>
        )}
      </section>
    </div>
  );
}

export default VendorAnalyticsScreen;

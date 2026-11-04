"use client";

import { useState } from "react";
import { formatNaira } from "@/lib/time";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

/**
 * RevenueChart — monthly revenue bars (Figma Analytics 6619:32291 "Total Revenue"):
 * one series, so no legend; neutral bars with the selected month in brand dark green and
 * its value pinned above it; a dashed average reference line with an "Avg" tag; month
 * labels with the selected one in a pill. Bars are buttons (hover/click selects, focusable,
 * aria-labelled) and a visually-hidden table carries the same numbers. On narrow screens
 * the plot scrolls sideways rather than squashing 12 bars. Styling: .hw-rchart*.
 *
 * Figma tags the average as "Avg 6.8%" — a percentage on a currency axis; the average
 * monthly amount is shown instead.
 */
export function RevenueChart({ values, startMonth = 0, initialIndex }: { values: number[]; startMonth?: number; initialIndex?: number }) {
  const [active, setActive] = useState(initialIndex ?? values.length - 1);
  const max = Math.max(1, ...values);
  const earning = values.filter((v) => v > 0);
  const avg = earning.length ? earning.reduce((a, b) => a + b, 0) / earning.length : 0;
  const label = (i: number) => MONTHS[(startMonth + i) % 12];
  const short = (n: number) => (n >= 1000 ? `NGN${Math.round(n / 1000)}k` : formatNaira(n));

  return (
    <div className="hw-rchart">
      <div className="hw-rchart__scroll">
        <div className="hw-rchart__plot" style={{ ["--hw-rchart-cols" as string]: values.length }}>
          {avg > 0 ? (
            <div className="hw-rchart__avg" style={{ bottom: `${(avg / max) * 100}%` }} aria-hidden="true">
              <span className="hw-rchart__avgtag">Avg {short(avg)}</span>
            </div>
          ) : null}
          {values.map((v, i) => (
            <button
              key={i}
              type="button"
              className={"hw-rchart__col" + (i === active ? " is-active" : "")}
              aria-label={`${label(i)}: ${formatNaira(v)}`}
              aria-pressed={i === active}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              <span className="hw-rchart__bar" style={{ height: `${Math.max(2, (v / max) * 100)}%` }}>
                {i === active && v > 0 ? <span className="hw-rchart__val">{short(v)}</span> : null}
              </span>
            </button>
          ))}
        </div>
        <div className="hw-rchart__axis" aria-hidden="true" style={{ ["--hw-rchart-cols" as string]: values.length }}>
          {values.map((_, i) => (
            <span key={i} className={"hw-rchart__month" + (i === active ? " is-active" : "")}>{label(i)}</span>
          ))}
        </div>
      </div>
      <table className="hw-sr-only">
        <caption>Revenue by month</caption>
        <thead>
          <tr><th scope="col">Month</th><th scope="col">Revenue</th></tr>
        </thead>
        <tbody>
          {values.map((v, i) => (
            <tr key={i}><th scope="row">{label(i)}</th><td>{formatNaira(v)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RevenueChart;

import type { Wallet } from "@/types";
import { formatNaira } from "@/lib/time";
import { Button } from "./Button";

/**
 * BalanceCard — vendor Total Balance (Figma 305:8538).
 *
 * Layers (bottom → top), matching the frame:
 *  1. brand-900 surface
 *  2. Handiwork Pattern Tile (illustration/) — brick hand marks, SVG already @ 20%
 *  3. soft brand-900 blur band (140px / ~40px blur) behind the totals
 *  4. content: title + amount, white Withdrawable / Escrow strip
 *  5. actions row sits outside the dark body
 *
 * Styling: .hw-balance* in dashboard.css.
 */
export function BalanceCard({ wallet }: { wallet: Wallet }) {
  return (
    <div className="hw-balance">
      <div className="hw-balance__body">
        {/* Figma "Background" rounded-rect with blur — centre soft glow */}
        <div className="hw-balance__glow" aria-hidden="true" />

        <div className="hw-balance__content">
          <div className="hw-balance__head">
            <h2 className="hw-balance__title">Total Balance</h2>
            <span className="hw-balance__total">
              {formatNaira(wallet.totalBalance)}
            </span>
          </div>

          <div className="hw-balance__breakdown">
            <div className="hw-balance__item">
              <span className="hw-balance__label">Withdrawable Balance</span>
              <span className="hw-balance__value hw-balance__value--withdrawable">
                {formatNaira(wallet.withdrawableBalance)}
              </span>
            </div>
            <div className="hw-balance__divider" aria-hidden="true" />
            <div className="hw-balance__item">
              <span className="hw-balance__label">Held in Escrow</span>
              <span className="hw-balance__value hw-balance__value--escrow">
                {formatNaira(wallet.heldInEscrow)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="hw-balance__actions">
        {/* Payouts (Flutterwave transfers) aren't connected yet — shown, not clickable. */}
        <Button variant="secondary" block disabled title="Transaction history is coming soon">
          Transaction History
        </Button>
        <Button variant="primary" block disabled title="Withdrawals open once payouts are connected">
          Withdraw
        </Button>
      </div>
    </div>
  );
}

export default BalanceCard;

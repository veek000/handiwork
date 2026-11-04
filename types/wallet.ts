// Wallet — vendor-only earnings summary shown at the top of the vendor Home screen.
// All amounts are whole-number naira (NGN); format at render.

export interface Wallet {
  totalBalance: number; // "Total Balance"
  withdrawableBalance: number; // "Withdrawable Balance"
  heldInEscrow: number; // "Held in Escrow"
  // Analytics "Total Revenue" (Figma 6619:32291): earnings per month of the current year,
  // Jan → Dec (future months 0), plus last year's total for the "↑ 12% vs last year" badge.
  revenueByMonth: number[];
  lastYearRevenue: number;
}

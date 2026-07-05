// Wallet — vendor-only earnings summary shown at the top of the vendor Home screen.
// All amounts are whole-number naira (NGN); format at render.

export interface Wallet {
  totalBalance: number; // "Total Balance"
  withdrawableBalance: number; // "Withdrawable Balance"
  heldInEscrow: number; // "Held in Escrow"
}

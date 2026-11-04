import type { Wallet } from "@/types";
import { wallets } from "@/mocks/wallets";

// Vendor earnings summary, keyed by vendorId (see mocks/wallets.ts). Returns
// undefined for a vendor with no wallet on record. Used by Vendor Home (balance card)
// and Analytics (revenue chart) — part of the standing data-access seam.
export function useWallet(vendorId: string): Wallet | undefined {
  return wallets[vendorId];
}

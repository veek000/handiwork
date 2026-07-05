import type { Wallet } from "@/types";
import { wallets } from "@/mocks/wallets";

// Vendor earnings summary, keyed by vendorId (see mocks/wallets.ts). Returns
// undefined for a vendor with no wallet on record. Not yet consumed by a screen
// (vendor Home is still a placeholder) — part of the standing data-access seam.
export function useWallet(vendorId: string): Wallet | undefined {
  return wallets[vendorId];
}

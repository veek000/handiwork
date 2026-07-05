// Mock vendor wallets, keyed by vendorId (every key resolves to a vendor in
// mocks/users.ts). Amounts are whole-number naira (NGN). Grace (new vendor with
// zero completed jobs) has an all-zero wallet.
import type { Wallet } from "@/types";

export const wallets: Record<string, Wallet> = {
  usr_veek: { totalBalance: 250000, withdrawableBalance: 180000, heldInEscrow: 70000 },
  usr_tunde: { totalBalance: 420000, withdrawableBalance: 350000, heldInEscrow: 70000 },
  usr_amaka: { totalBalance: 610000, withdrawableBalance: 610000, heldInEscrow: 0 },
  usr_femi: { totalBalance: 890000, withdrawableBalance: 740000, heldInEscrow: 150000 },
  usr_grace: { totalBalance: 0, withdrawableBalance: 0, heldInEscrow: 0 },
};

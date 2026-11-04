// Mock vendor wallets, keyed by vendorId (every key resolves to a vendor in
// mocks/users.ts). Amounts are whole-number naira (NGN). Grace (new vendor with
// zero completed jobs) has an all-zero wallet.
import type { Wallet } from "@/types";

export const wallets: Record<string, Wallet> = {
  usr_veek: { totalBalance: 250000, withdrawableBalance: 180000, heldInEscrow: 70000, revenueByMonth: [42000, 88000, 61000, 125000, 99000, 157500, 72000, 68000, 54000, 0, 0, 0], lastYearRevenue: 683000 },
  usr_tunde: { totalBalance: 420000, withdrawableBalance: 350000, heldInEscrow: 70000, revenueByMonth: [90000, 75000, 110000, 95000, 120000, 130000, 98000, 105000, 70000, 0, 0, 0], lastYearRevenue: 820000 },
  usr_amaka: { totalBalance: 610000, withdrawableBalance: 610000, heldInEscrow: 0, revenueByMonth: [60000, 140000, 90000, 160000, 180000, 120000, 150000, 175000, 95000, 0, 0, 0], lastYearRevenue: 1010000 },
  usr_femi: { totalBalance: 890000, withdrawableBalance: 740000, heldInEscrow: 150000, revenueByMonth: [150000, 120000, 200000, 170000, 210000, 160000, 190000, 230000, 140000, 0, 0, 0], lastYearRevenue: 1420000 },
  usr_grace: { totalBalance: 0, withdrawableBalance: 0, heldInEscrow: 0, revenueByMonth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], lastYearRevenue: 0 },
};

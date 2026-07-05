import type { User, UserRole } from "@/types";
import { customers, vendors } from "@/mocks/users";

// The signed-in user for a role. No auth yet — mirrors the Phase-1 placeholder
// identities (customer → Jane Doe, vendor → Veek Okonkwo). At Phase 6 this returns
// the authenticated Convex user and the `role` argument is derived from it instead.
const SIGNED_IN: Record<UserRole, User> = {
  customer: customers.find((c) => c.id === "usr_jane")!,
  vendor: vendors.find((v) => v.id === "usr_veek")!,
};

export function useCurrentUser(role: UserRole): User {
  return SIGNED_IN[role];
}

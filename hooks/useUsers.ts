import type { User } from "@/types";
import { customers, vendors } from "@/mocks/users";

// All mock users (customers + vendors). Used when a screen needs to resolve a user
// by id (e.g. JobCard's customer). At Phase 6 this becomes a Convex query.
export function useUsers(): User[] {
  return [...customers, ...vendors];
}

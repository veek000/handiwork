// Data-access layer (hooks/) — the single seam between the UI and its data source.
//
// Every hook is currently a THIN synchronous wrapper returning the mocks/ fixture
// arrays, typed against the Phase 2 types. They are plain functions (no React state)
// so they can be called from both server and client components exactly like the mock
// imports they replace — the point is the *seam*, not runtime behaviour yet.
//
// STANDING RULE (see COMPONENT-BUILD-RULES.md): no component may import from mocks/
// directly. All data access goes through this layer. mocks/ is imported ONLY here.
//
// At Phase 6 (Convex) each of these becomes the real data source — client-reactive
// `useQuery(...)` for live screens, or a server-side fetch — without touching any
// consumer, because consumers already depend on the hook, not the fixture.

export { useCurrentUser } from "./useCurrentUser";
export { useServices } from "./useServices";
export { useCategories } from "./useCategories";
export { useNotifications } from "./useNotifications";
export { useJobs } from "./useJobs";
export { useReviews } from "./useReviews";
export { useConversations } from "./useConversations";
export { useWallet } from "./useWallet";

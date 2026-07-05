// Mock data for the Handiwork app layer (Phase 2.5).
//
// Plain fixture arrays matching the Phase 2 types — no Convex, no API. Kept in
// mocks/ (separate from types/) so the whole layer is swappable for a real data
// source later. All foreign keys resolve within these files:
//   Job.{customerId,vendorId,serviceId} → users / services
//   Review.{serviceId,vendorId}         → services / users
//   Service.providerId                  → users (vendors)
//   wallets keys                        → users (vendors)
//   Conversation.jobId                  → jobs (per-Job scoping)
//   Conversation.participantName        → users (the job's vendor, from Jane's side)
//
// Not mocked, on purpose:
//   • Message — flagged speculative in types/message.ts; only Conversation is mocked.

export { categories } from "./categories";
export { customers, vendors, users } from "./users";
export { services } from "./services";
export { reviews } from "./reviews";
export { jobs } from "./jobs";
export { conversations } from "./conversations";
export { wallets } from "./wallets";
export { notifications } from "./notifications";

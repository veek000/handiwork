// Data-shape types for the Handiwork app layer (Phase 2).
//
// Plain TypeScript interfaces only — no database, no mock data, no components.
// Every field is sourced from a screen in the Customer/Vendor desktop Figma flows;
// the only speculative type is `Message` (see message.ts), which is flagged inline.
//
// Domain map (one file per screen-domain):
//   user.ts         — accounts: User (customer | vendor discriminated union)
//   service.ts      — Service listings + Category tiles
//   job.ts          — Job (the customer⇄vendor transaction; "Orders" is the vendor label)
//   review.ts       — Review + the shared Rating (1–5) type
//   message.ts      — Conversation (evidenced) + Message (speculative)
//   notification.ts — Notification bell items
//   wallet.ts       — vendor earnings summary
//
// Not modelled, on purpose (no screen evidence / derivable):
//   • analytics counts (Active Job / Service Request / Total Job Done) — derived by
//     filtering Jobs on status, not stored.
//   • favourites (the service "heart") — no favourites screen exists yet.

export type {
  UserRole,
  Availability,
  BaseUser,
  CustomerUser,
  VendorUser,
  User,
} from "./user";

export type { PriceUnit, Service, Category } from "./service";

export type { JobStatus, Job } from "./job";

export type { Rating, Review } from "./review";

export type { DeliveryStatus, Conversation, Message } from "./message";

export type { NotificationType, Notification } from "./notification";

export type { Wallet } from "./wallet";

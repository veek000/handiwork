// Review — shown on the vendor's "My Reviews" screen and on the Vendor Profile /
// Service Detail screens a customer browses.

// A single star score. Per-review ratings are whole stars (1–5); this is stricter
// than `number` on purpose so an aggregate average (e.g. 4.7) can never be assigned
// to a per-review field by mistake. Aggregate averages stay typed as `number`.
export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Review {
  id: string;
  authorName: string; // "Daniel"
  authorLocation: string; // "Ikeja, Nigeria"
  authorAvatarUrl?: string;
  rating: Rating; // per-review star score
  body: string; // review text
  response?: string; // vendor's reply — "Your Response" / "Service Provider Response"
  serviceId: string; // the service being reviewed
  vendorId: string; // the vendor being reviewed
}

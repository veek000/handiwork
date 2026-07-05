// Mock services. Every `providerId` resolves to a vendor in mocks/users.ts.
// Per-service ratingAverage / reviewCount are consistent with mocks/reviews.ts.
// All images use the shared placeholder until real service photos exist.
import type { Service } from "@/types";

const PLACEHOLDER = "/assets/img/service-placeholder.png";

export const services: Service[] = [
  // Veek (usr_veek) — Cleaners
  {
    id: "svc_house_cleaning",
    title: "House Cleaning",
    description:
      "The cost of house cleaning per hour depends on the square footage being cleaned.",
    category: "Cleaners",
    price: 5000,
    priceUnit: "hr",
    images: [PLACEHOLDER],
    providerId: "usr_veek",
    ratingAverage: 4.7, // reviews: 5, 4, 5
    reviewCount: 3,
  },
  {
    id: "svc_deep_cleaning",
    title: "Deep Cleaning",
    description:
      "A thorough top-to-bottom clean for move-ins, move-outs and post-renovation flats.",
    category: "Cleaners",
    price: 15000,
    priceUnit: "day",
    images: [PLACEHOLDER],
    providerId: "usr_veek",
    ratingAverage: 4.5, // reviews: 5, 4
    reviewCount: 2,
  },
  {
    id: "svc_office_cleaning",
    title: "Office Cleaning",
    description:
      "Scheduled cleaning for small and medium offices — desks, floors and restrooms.",
    category: "Cleaners",
    price: 8000,
    priceUnit: "day",
    images: [PLACEHOLDER],
    providerId: "usr_veek",
    ratingAverage: 5.0, // reviews: 5
    reviewCount: 1,
  },

  // Tunde (usr_tunde) — Plumbing
  {
    id: "svc_drain_repair",
    title: "Plumbing Drain Repair",
    description:
      "Clearing blocked drains and fixing leaks for kitchens and bathrooms.",
    category: "Plumbing",
    price: 4500,
    priceUnit: "hr",
    images: [PLACEHOLDER],
    providerId: "usr_tunde",
    ratingAverage: 4.5, // reviews: 5, 4
    reviewCount: 2,
  },
  {
    id: "svc_pipe_install",
    title: "Pipe Installation",
    description:
      "New pipework and fittings for renovations and new-build plumbing runs.",
    category: "Plumbing",
    price: 20000,
    priceUnit: "day",
    images: [PLACEHOLDER],
    providerId: "usr_tunde",
    ratingAverage: 4.0, // reviews: 4
    reviewCount: 1,
  },

  // Amaka (usr_amaka) — Painter
  {
    id: "svc_interior_painting",
    title: "Interior Painting",
    description:
      "Clean, even interior finishes for living rooms, bedrooms and feature walls.",
    category: "Painter",
    price: 12000,
    priceUnit: "day",
    images: [PLACEHOLDER],
    providerId: "usr_amaka",
    ratingAverage: 5.0, // reviews: 5, 5
    reviewCount: 2,
  },

  // Femi (usr_femi) — Appliance Fix / Electrical
  {
    id: "svc_electrical_help",
    title: "Electrical Help",
    description:
      "Repairs, fittings and fault-finding for domestic electrical issues.",
    category: "Appliance Fix",
    price: 6000,
    priceUnit: "hr",
    images: [PLACEHOLDER],
    providerId: "usr_femi",
    ratingAverage: 4.5, // reviews: 4, 5
    reviewCount: 2,
  },
  {
    // Service with ZERO reviews (its vendor has other reviewed services).
    id: "svc_home_rewiring",
    title: "Home Rewiring",
    description:
      "Full or partial rewiring for older properties, with safety certification.",
    category: "Appliance Fix",
    price: 25000,
    priceUnit: "day",
    images: [PLACEHOLDER],
    providerId: "usr_femi",
    ratingAverage: 0,
    reviewCount: 0,
  },

  // Grace (usr_grace) — Laundry (new vendor, no reviews)
  {
    id: "svc_laundry",
    title: "Laundry Service",
    description:
      "Weekly wash, iron and fold with pickup and drop-off around Yaba.",
    category: "Laundry",
    price: 2500,
    priceUnit: "wk",
    images: [PLACEHOLDER],
    providerId: "usr_grace",
    ratingAverage: 0,
    reviewCount: 0,
  },
];

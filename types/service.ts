// Service — a listing a vendor offers. Appears in both flows: customers browse it
// (Home "Popular Services", Search, Service Detail, Vendor Profile); vendors manage
// it (My Services, Add New Service).

// Pricing cadence from the Add New Service form. Complete set per design.
export type PriceUnit = "hr" | "day" | "wk";

export interface Service {
  id: string;
  title: string; // "House Cleaners"
  description: string; // Add Service · "About Service" / Service Detail · "About Service"
  category: string; // Add Service · "Service Category"
  price: number; // whole-number naira (NGN) — e.g. 5000, never formatted here
  priceUnit: PriceUnit; // Add Service · pricing-unit selector
  images: string[]; // Add Service · "Service Images" / Service Detail gallery
  providerId: string; // owning vendor (Service Detail "About {vendor}" card)
  ratingAverage: number; // aggregate average, e.g. 4.7 (see Rating in review.ts)
  reviewCount: number; // "(20 Reviews)"
}

// Category tile shown in the Home "Browse all categories" grid. Each uses a
// colourful illustration (not an icon), per the Figma design.
export interface Category {
  id: string;
  name: string; // "Carpentry", "Plumbing", …
  illustration: string; // path to an illustration SVG (public/assets/illustration/category/*)
}

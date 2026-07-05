// User — role-discriminated union of the two account types.
// Every field is sourced from a screen in the Customer/Vendor desktop Figma flows;
// nothing is inferred. See types/index.ts for the domain map.

export type UserRole = "customer" | "vendor";

// Only "available" is ever shown (vendor profile / job-details badge). Kept as a
// single-value type deliberately — no screen shows a "busy"/"offline" state yet,
// so we don't model states with zero evidence. Widen when a screen proves otherwise.
export type Availability = "available";

// Collected on the Sign up screen (identical fields for both roles), plus the
// header identity shown on every dashboard screen.
export interface BaseUser {
  id: string;
  role: UserRole;
  fullName: string; // Sign up · "Full Name"
  email: string; // Sign up · "Email" (also shown in the dashboard header)
  phone: string; // Sign up · "Phone Number"
  countryCode: string; // Sign up · "+234" selector, stored separately from phone
  state: string; // Sign up · "State"
  area: string; // Sign up · "Area"
  address: string; // Sign up · "Address"
  location: string; // Header · "Lagos, Nigeria" / vendor profile · "Ikeja, Nigeria"
  avatarUrl?: string; // Dashboard header avatar; vendor "From" avatar on job details
}

export interface CustomerUser extends BaseUser {
  role: "customer";
}

// Extra fields all sourced from the Vendor Profile View (as a customer sees it)
// and the vendor's own dashboard.
export interface VendorUser extends BaseUser {
  role: "vendor";
  bio: string; // Vendor Profile · "I provide top-quality cleaning services…"
  yearsOfExperience: number; // Vendor Profile · "Experience — 10 Years"
  jobsCompleted: number; // Vendor Profile · "Job Completed — 20"
  ratingAverage: number; // Vendor Profile · 4.7 (aggregate average, not a per-review value)
  reviewCount: number; // Vendor Profile · "(20 Reviews)"
  availability: Availability; // Vendor Profile / Job Details · "Available" badge
}

export type User = CustomerUser | VendorUser;

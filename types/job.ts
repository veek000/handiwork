// Job — the core transaction between a customer and a vendor. The customer's flow
// labels these "My Jobs" ("Requesting from …"); the vendor's flow files them under a
// "My Orders" section but every field and action says Job (Job Details, Job
// Description, Cancel Job, Total Job Done) — so the entity is Job.

export type JobStatus =
  | "pending" // Service Request "Pending" / customer "Waiting for a quote"
  | "quoted" // My Jobs "Quoted" (vendor sent a quote back)
  | "in_progress" // "In Progress"
  | "completed" // "Marked as Completed" / Completed Jobs tab
  | "cancelled" // customer backed out — "Cancel Job" + "Job Canceled" notification
  | "rejected"; // vendor declined — Job Details "Reject Job" (distinct from cancelled)

export interface Job {
  id: string;
  title: string; // "Kitchen Sink Repair" / "Living Room Painting"
  description: string; // Job Details "Job Description" / Booking "Describe your task"
  status: JobStatus;
  serviceId: string; // Booking · "What service do you need?"
  customerId: string; // vendor side · "Requested by: Jane Doe"
  vendorId: string; // customer side · "Requesting from: Veek Design"
  preferredDate: string; // Booking · Date (ISO 8601)
  preferredTime: string; // Booking · Time
  images: string[]; // Booking · optional task photos
  // Rendered both as an absolute stamp ("2025-09-20 | 10:30 AM", Service Request list)
  // and relative ("Requested 5 min Ago", Job Details) — so store ISO, format at render.
  createdAt: string; // ISO 8601
}

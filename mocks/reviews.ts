// Mock reviews. Every serviceId + vendorId resolves to mocks/services.ts +
// mocks/users.ts. Per-vendor and per-service aggregates in those files are derived
// from these entries. Grace (usr_grace) intentionally has none (zero-review vendor).
import type { Review } from "@/types";

export const reviews: Review[] = [
  // Veek — svc_house_cleaning (5, 4, 5)
  {
    id: "rev_01",
    authorName: "Daniel Okeke",
    authorLocation: "Ikeja, Lagos",
    rating: 5,
    body:
      "Working with Veek was an excellent experience. I was a bit skeptical since it was my first time using the platform, but they quickly eased any concerns.",
    response: "Thank you Daniel — it was a pleasure, glad the flat came out spotless!",
    serviceId: "svc_house_cleaning",
    vendorId: "usr_veek",
  },
  {
    id: "rev_02",
    authorName: "Eleanor Pena",
    authorLocation: "Surulere, Lagos",
    rating: 4,
    body: "Good job overall, arrived on time and was thorough. Missed one corner but sorted it quickly when I pointed it out.",
    serviceId: "svc_house_cleaning",
    vendorId: "usr_veek",
  },
  {
    id: "rev_03",
    authorName: "Bob Johnson",
    authorLocation: "Yaba, Lagos",
    rating: 5,
    body: "Booked a same-day clean and it was flawless. Will be using Veek every month from now on.",
    serviceId: "svc_house_cleaning",
    vendorId: "usr_veek",
  },
  // Veek — svc_deep_cleaning (5, 4)
  {
    id: "rev_04",
    authorName: "Jane Doe",
    authorLocation: "Lekki, Lagos",
    rating: 5,
    body: "The deep clean after my move-out was worth every naira. The place looked brand new.",
    response: "Appreciate it Jane — wishing you well in the new apartment!",
    serviceId: "svc_deep_cleaning",
    vendorId: "usr_veek",
  },
  {
    id: "rev_05",
    authorName: "Kristin Watson",
    authorLocation: "Victoria Island, Lagos",
    rating: 4,
    body: "Solid deep clean, took a little longer than quoted but the result was great.",
    serviceId: "svc_deep_cleaning",
    vendorId: "usr_veek",
  },
  // Veek — svc_office_cleaning (5)
  {
    id: "rev_06",
    authorName: "Daniel Okeke",
    authorLocation: "Ikeja, Lagos",
    rating: 5,
    body: "Our office has never looked better. Reliable and discreet during work hours.",
    serviceId: "svc_office_cleaning",
    vendorId: "usr_veek",
  },

  // Tunde — svc_drain_repair (5, 4)
  {
    id: "rev_07",
    authorName: "Jane Doe",
    authorLocation: "Lekki, Lagos",
    rating: 5,
    body: "Fixed a stubborn kitchen blockage in under an hour. Fair price and very neat.",
    serviceId: "svc_drain_repair",
    vendorId: "usr_tunde",
  },
  {
    id: "rev_08",
    authorName: "Eleanor Pena",
    authorLocation: "Surulere, Lagos",
    rating: 4,
    body: "Knew exactly what the problem was straight away. Would call again.",
    serviceId: "svc_drain_repair",
    vendorId: "usr_tunde",
  },
  // Tunde — svc_pipe_install (4)
  {
    id: "rev_09",
    authorName: "Daniel Okeke",
    authorLocation: "Ikeja, Lagos",
    rating: 4,
    body: "Clean pipework for our bathroom reno. Tidy and professional.",
    serviceId: "svc_pipe_install",
    vendorId: "usr_tunde",
  },

  // Amaka — svc_interior_painting (5, 5)
  {
    id: "rev_10",
    authorName: "Bob Johnson",
    authorLocation: "Yaba, Lagos",
    rating: 5,
    body: "Feature wall came out perfect — crisp edges, no mess left behind.",
    response: "Thanks Bob! That deep green really suits the room.",
    serviceId: "svc_interior_painting",
    vendorId: "usr_amaka",
  },
  {
    id: "rev_11",
    authorName: "Kristin Watson",
    authorLocation: "Victoria Island, Lagos",
    rating: 5,
    body: "Repainted two bedrooms in a day and the finish is beautiful.",
    serviceId: "svc_interior_painting",
    vendorId: "usr_amaka",
  },

  // Femi — svc_electrical_help (4, 5)
  {
    id: "rev_12",
    authorName: "Daniel Okeke",
    authorLocation: "Ikeja, Lagos",
    rating: 4,
    body: "Sorted a tripping circuit that two other people couldn't. Knowledgeable.",
    serviceId: "svc_electrical_help",
    vendorId: "usr_femi",
  },
  {
    id: "rev_13",
    authorName: "Jane Doe",
    authorLocation: "Lekki, Lagos",
    rating: 5,
    body: "Installed my ceiling fans and fixed the sockets. On time and very safe about it.",
    serviceId: "svc_electrical_help",
    vendorId: "usr_femi",
  },
];

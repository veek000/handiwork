// Nigerian location reference data for the signup form.
// States: the complete, real list — 36 states + the FCT (fixed public data).
// Areas: a real (Lagos-focused) list of LGAs/neighbourhoods, consistent with the
// locations used by the mock users. NOTE: full area coverage for every state is
// out of scope for this prototype — only Lagos areas are populated here.

export const NIGERIA_STATES: string[] = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "Federal Capital Territory",
];

// Real Lagos LGAs + widely-used neighbourhoods (includes the areas the mock users
// live in: Ikeja, Lekki, Victoria Island, Surulere, Yaba). Other states would each
// need their own list — deliberately not faked here.
export const LAGOS_AREAS: string[] = [
  "Agege", "Ajah", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe",
  "Eti-Osa", "Festac", "Gbagada", "Ibeju-Lekki", "Ikeja", "Ikorodu", "Ikoyi",
  "Ilupeju", "Isolo", "Ketu", "Lagos Island", "Lagos Mainland", "Lekki",
  "Magodo", "Maryland", "Mushin", "Ogba", "Ojodu", "Ojota", "Oshodi",
  "Sangotedo", "Surulere", "Victoria Island", "Yaba",
];

// Country dialling codes for the phone field (Nigeria first). A small real subset —
// not the full ITU list, which isn't needed for this prototype.
export const DIALLING_CODES: string[] = ["+234", "+233", "+254", "+27", "+1", "+44"];

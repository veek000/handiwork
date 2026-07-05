// Mock service categories — the "Browse all categories" grid on the customer Home.
// Names + illustrations match the Figma exactly; the illustrations were exported from
// the design into public/assets/illustration/category/. Swappable fixture data.
import type { Category } from "@/types";

const DIR = "/assets/illustration/category";

export const categories: Category[] = [
  { id: "cat_carpentry", name: "Carpentry", illustration: `${DIR}/carpentry.svg` },
  { id: "cat_plumbing", name: "Plumbing", illustration: `${DIR}/plumbing.svg` },
  { id: "cat_laundry", name: "Laundry", illustration: `${DIR}/laundry.svg` },
  { id: "cat_roofing", name: "Roofing", illustration: `${DIR}/roofing.svg` },
  { id: "cat_beautician", name: "Beautician", illustration: `${DIR}/beautician.svg` },
  { id: "cat_photography", name: "Photography", illustration: `${DIR}/photography.svg` },
  { id: "cat_gardener", name: "Gardener", illustration: `${DIR}/gardener.svg` },
  { id: "cat_electrician", name: "Electrician", illustration: `${DIR}/electrician.svg` },
  { id: "cat_painter", name: "Painter", illustration: `${DIR}/painter.svg` },
  { id: "cat_appliance", name: "Appliance Fix", illustration: `${DIR}/appliance-fix.svg` },
  { id: "cat_auto", name: "Auto Repair", illustration: `${DIR}/auto-repair.svg` },
  { id: "cat_fumigation", name: "Fumigation", illustration: `${DIR}/fumigation.svg` },
];

import type { Service } from "@/types";

// Search + filter for the customer Search screen. Pure functions over the services the
// hook returns, so they keep working unchanged once useServices() is backed by Convex.

export const SORT_OPTIONS = ["Popularity", "Highest Rated", "Price: Low to High", "Price: High to Low"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const RATING_OPTIONS = ["4.5 & above", "4.0 & above", "3.0 & above"] as const;
export type RatingOption = (typeof RATING_OPTIONS)[number];

export interface SearchFilters {
  sort: SortOption | "";
  min: string; // raw input; blank = no bound
  max: string;
  rating: RatingOption | "";
}

export const EMPTY_FILTERS: SearchFilters = { sort: "", min: "", max: "", rating: "" };

export function activeFilterCount(f: SearchFilters): number {
  return [f.sort, f.min, f.max, f.rating].filter(Boolean).length;
}

const toNumber = (v: string) => {
  const n = Number(v.replace(/[^\d.]/g, ""));
  return v.trim() && Number.isFinite(n) ? n : null;
};

export function searchServices(all: Service[], query: string, f: SearchFilters): Service[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const min = toNumber(f.min);
  const max = toNumber(f.max);
  const minRating = f.rating ? parseFloat(f.rating) : null;

  const hits = all.filter((s) => {
    const haystack = `${s.title} ${s.category} ${s.description}`.toLowerCase();
    if (words.length && !words.some((w) => haystack.includes(w))) return false;
    if (min != null && s.price < min) return false;
    if (max != null && s.price > max) return false;
    if (minRating != null && s.ratingAverage < minRating) return false;
    return true;
  });

  const sorted = [...hits];
  switch (f.sort) {
    case "Highest Rated":
      sorted.sort((a, b) => b.ratingAverage - a.ratingAverage || b.reviewCount - a.reviewCount);
      break;
    case "Price: Low to High":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "Price: High to Low":
      sorted.sort((a, b) => b.price - a.price);
      break;
    default: // Popularity (and no sort chosen) — most-reviewed first
      sorted.sort((a, b) => b.reviewCount - a.reviewCount || b.ratingAverage - a.ratingAverage);
  }
  return sorted;
}

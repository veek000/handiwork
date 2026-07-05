import type { Category } from "@/types";
import { categories } from "@/mocks/categories";

export function useCategories(): Category[] {
  return categories;
}

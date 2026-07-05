import type { Review } from "@/types";
import { reviews } from "@/mocks/reviews";

export function useReviews(): Review[] {
  return reviews;
}

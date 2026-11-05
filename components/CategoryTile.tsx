import Link from "next/link";
import type { Category } from "@/types";

/**
 * CategoryTile — a browse-categories tile: illustration in a light-green square +
 * label below. Opens Search for that category. Styling: .hw-cat*.
 */
export function CategoryTile({ category }: { category: Category }) {
  return (
    <Link href={`/customer/search?q=${encodeURIComponent(category.name)}`} className="hw-cat">
      <span className="hw-cat__icon">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={category.illustration} alt="" aria-hidden="true" />
      </span>
      <span className="hw-cat__label">{category.name}</span>
    </Link>
  );
}

export default CategoryTile;

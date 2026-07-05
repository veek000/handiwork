import type { Category } from "@/types";

/**
 * CategoryTile — a browse-categories tile: illustration in a light-green square +
 * label below. Static (non-functional in this prototype). Styling: .hw-cat*.
 */
export function CategoryTile({ category }: { category: Category }) {
  return (
    <button type="button" className="hw-cat">
      <span className="hw-cat__icon">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={category.illustration} alt="" aria-hidden="true" />
      </span>
      <span className="hw-cat__label">{category.name}</span>
    </button>
  );
}

export default CategoryTile;

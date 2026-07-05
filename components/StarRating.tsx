/**
 * StarRating — numeric value + 5 stars (full / half / empty) + optional review count,
 * e.g. "4.7 ★★★★½ (20 Reviews)". Reusable: service cards, reviews, vendor profile.
 * Styling: .hw-rating*.
 */
export function StarRating({ value, count }: { value: number; count?: number }) {
  return (
    <span className="hw-rating">
      <span className="hw-rating__value">{value.toFixed(1)}</span>
      <span className="hw-rating__stars" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => {
          const full = value >= i + 1;
          const half = !full && value >= i + 0.5;
          return (
            <hw-icon
              key={i}
              suppressHydrationWarning
              name={half ? "star-half" : "star"}
              variant={full || half ? "filled" : "hollow"}
              size="12"
            ></hw-icon>
          );
        })}
      </span>
      {count != null ? <span className="hw-rating__count">({count} Reviews)</span> : null}
    </span>
  );
}

export default StarRating;

"use client";

import { useRef, useState } from "react";

/**
 * ServiceGallery — the Service Detail photo carousel (Figma 6619:3942 "Frame 427319629",
 * 772×320 desktop / full-width mobile): swipe/scroll-snap slides, a favourite heart
 * top-right, and pagination below (active = dark bar, others = small brand squares).
 * Dots only render when there is more than one photo. Favourite is a local UI toggle
 * (no Favorite model yet). Styling: .hw-gallery*.
 */
export function ServiceGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="hw-gallery">
      <div className="hw-gallery__frame">
        <div
          className="hw-gallery__track"
          ref={trackRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
          }}
        >
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} className="hw-gallery__slide" src={src} alt={`${title} photo ${i + 1}`} />
          ))}
        </div>
        <button
          type="button"
          className={"hw-gallery__fav" + (favorite ? " is-active" : "")}
          aria-pressed={favorite}
          aria-label={favorite ? `Remove ${title} from saved` : `Save ${title}`}
          onClick={() => setFavorite((f) => !f)}
        >
          <hw-icon suppressHydrationWarning name="heart" variant={favorite ? "filled" : "hollow"} size="20"></hw-icon>
        </button>
      </div>
      {images.length > 1 ? (
        <div className="hw-gallery__dots" role="tablist" aria-label="Photos">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Photo ${i + 1}`}
              className={"hw-gallery__dot" + (i === index ? " is-active" : "")}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default ServiceGallery;

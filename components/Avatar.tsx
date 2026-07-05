import type { CSSProperties } from "react";

/**
 * Avatar — round avatar showing initials derived from a name (dark brand circle,
 * light text), or an image if `src` is provided. Reusable: dashboard header, sidebar
 * drawer, messages, reviews. Styling: .hw-ava.
 */
export function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  name,
  src,
  size = 40,
  className,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  const style: CSSProperties = { width: size, height: size, fontSize: Math.round(size * 0.4) };
  return (
    <span className={"hw-ava" + (className ? " " + className : "")} style={style} aria-hidden={src ? undefined : true}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}

export default Avatar;

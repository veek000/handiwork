import type { ReactNode } from "react";

/**
 * ErrorState — the shared "something's wrong" screen body: illustration, Changa One
 * title, a plain-language line, then actions (e.g. Try Again / Go to Home). Used by the
 * route error boundaries and 404 pages. `detail` shows a small reference code (the
 * error digest) people can quote to support. Styling: .hw-errstate*.
 */
export function ErrorState({
  art = "/assets/illustration/illustration-25.svg",
  eyebrow,
  title,
  text,
  detail,
  children,
}: {
  art?: string;
  eyebrow?: string;
  title: string;
  text: string;
  detail?: string;
  children?: ReactNode;
}) {
  return (
    <section className="hw-errstate" aria-labelledby="hw-errstate-title">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hw-errstate__art" src={art} alt="" width={160} height={160} />
      {eyebrow ? <p className="hw-errstate__eyebrow">{eyebrow}</p> : null}
      <h1 id="hw-errstate-title" className="hw-errstate__title">{title}</h1>
      <p className="hw-errstate__text">{text}</p>
      {children ? <div className="hw-errstate__actions">{children}</div> : null}
      {detail ? <p className="hw-errstate__detail">Reference: {detail}</p> : null}
    </section>
  );
}

export default ErrorState;

import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Button — thin wrapper over the existing `.hw-button` markup (assets/css/button.css).
 * Props map 1:1 to the BEM modifiers; states come from the CSS (`:hover`/`:active`/
 * `:focus-visible`/`:disabled`) and the native `disabled` attribute. No new variants.
 *
 *   <Button variant="primary">Get Started</Button>
 *   <Button variant="secondary" icon={<hw-icon name="user" variant="filled" size={18} />}>Sign in</Button>
 *   <Button variant="primary" block disabled>…</Button>
 */
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  /** `.hw-button--block` — full-width layout modifier */
  block?: boolean;
  /** optional leading icon (typically an <hw-icon>) — rendered in `.hw-button__icon` */
  icon?: ReactNode;
};

export function Button({
  variant = "primary",
  block = false,
  icon,
  children,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = [
    "hw-button",
    `hw-button--${variant}`,
    block ? "hw-button--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} type={type} {...rest}>
      {icon ? (
        <>
          <span className="hw-button__icon">{icon}</span>
          <span className="hw-button__label">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;

import type { InputHTMLAttributes } from "react";

/**
 * Input — thin wrapper over the existing `.hw-input` field (assets/css/input.css).
 * All native input attributes pass through; states (`:focus-visible`, `:disabled`)
 * are handled by the CSS. Use the native `disabled` attribute for the disabled state.
 *
 *   <Input type="text" placeholder="Search by role, skills or keywords" />
 *   <Input type="email" disabled />
 */
export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...rest }: InputProps) {
  return <input className={["hw-input", className].filter(Boolean).join(" ")} {...rest} />;
}

export default Input;

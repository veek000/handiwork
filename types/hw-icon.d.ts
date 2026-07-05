import type { DetailedHTMLProps, HTMLAttributes } from "react";

/**
 * Types the <hw-icon> web component (assets/icons/hw-icons.js) as a JSX intrinsic
 * element so it's not an implicit-any / unknown-element error. Attributes mirror the
 * component's observedAttributes: name (required), variant, size, color.
 */
type HwIconAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  name: string;
  variant?: "filled" | "hollow" | "duo";
  size?: string | number;
  color?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "hw-icon": HwIconAttributes;
    }
  }
}

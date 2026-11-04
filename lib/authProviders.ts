// Which social sign-in buttons are live. Facebook needs AUTH_FACEBOOK_ID / _SECRET set on
// the Convex deployment (and the callback URL registered with Facebook) — until then the
// button is shown disabled ("coming soon") instead of failing on click. Flip it on per
// environment with NEXT_PUBLIC_AUTH_FACEBOOK=1 once the keys exist there.
export const FACEBOOK_LOGIN_ENABLED = process.env.NEXT_PUBLIC_AUTH_FACEBOOK === "1";

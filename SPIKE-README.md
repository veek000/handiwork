# Convex Spike — THROWAWAY

⚠️ Disposable scaffolding to de-risk **Convex Auth + real-time chat** before Phase 6.
NOT production code, NOT wired to the real app. Delete `convex/`, `app/spike-convex/`,
and this file when the spike is done.

## What it proves (verified 2026-07-06 — all PASS)
- **(a) Sign-up + sign-in** via Convex Auth (Password provider) — **PASS**.
- **(b) Session persistence** across page reload AND full tab close/reopen — **PASS**
  (the single biggest risk; the client session survived both without re-auth).
- **(c) Two-sender live chat** — two authenticated users in separate browser sessions saw
  each other's messages appear live via Convex reactive queries, no manual refresh — **PASS**.

## Isolation
- All UI under `app/spike-convex/` (unlinked route, not in any nav). Uses the client-side
  `@convex-dev/auth/react` provider scoped to that route — **no middleware, no root-layout
  change** — so it cannot affect any real route.
- Backend in `convex/` is spike-only (`spikeMessages.ts` + auth scaffolding). `authTables`
  are Convex Auth's OWN tables — unrelated to the real User/Conversation/Message types.
- Build-safe without a deployment: functions are referenced via `makeFunctionReference`
  (no `convex/_generated` import), and `convex/` is excluded from the root `tsconfig.json`.
  `tsc --noEmit` + `next build` pass whether or not Convex is configured.
- ⚠️ Caveat: this exercises the **client (localStorage)** auth/session flow. The Next.js
  **cookie + middleware SSR** flow the real app may adopt is NOT tested here — validate that
  separately at integration time.

## Versions (pinned — beta, may break)
- `convex` **1.42.1**
- `@convex-dev/auth` **0.0.94**
- `@auth/core` **0.41.1**

## Run it from scratch
1. `npx convex login` — interactive; opens a browser, needs a Convex account.
2. `npx convex dev` — create/select a **cloud** project (or accept the zero-friction
   anonymous local one). Writes `.env.local` (gitignored) with `NEXT_PUBLIC_CONVEX_URL`.
3. Set the Convex Auth signing keys (see friction #3/#4 — the CLI won't set them on cloud):
   generate an RS256 keypair (via `jose`, per the Convex Auth manual-setup doc) then
   - `npx convex env set SITE_URL http://localhost:3000`
   - `npx convex env set JWT_PRIVATE_KEY -- "<pkcs8 with newlines→spaces>"`  ← the `--` is required (the PEM starts with `-----`)
   - `npx convex env set JWKS -- '<{"keys":[{"use":"sig",...}]}>'`
4. `npm run dev`; open `http://localhost:3000/spike-convex` in two separate sessions
   (one normal, one incognito) and run the a/b/c checks above.

## Beta friction hit during the logged-in cloud setup (weigh for the no-fallback-vendor call)
1. `convex login` can't run in a non-interactive shell ("Device name:" prompt) — needs a
   TTY, or `--login-flow poll --no-open` (device-code URL you approve in a browser).
2. First cloud deploy failed typecheck — `process` untyped in `auth.config.ts`; fixed by
   adding `"types": ["node"]` to `convex/tsconfig.json`.
3. `npx @convex-dev/auth` **silently skipped key generation** on the cloud deployment (set
   `SITE_URL` only, no keys) — had to generate + set `JWT_PRIVATE_KEY`/`JWKS` manually.
4. `convex env set JWT_PRIVATE_KEY` rejected the PEM (starts with `-----`, parsed as a CLI
   flag) — needs a `--` end-of-options guard.

The anonymous **local** deployment (`npx convex dev`, no account) had **zero** friction — all
four rough edges were specific to the logged-in **cloud** path.

## Cleanup when the spike is retired
Delete `convex/`, `app/spike-convex/`, `SPIKE-README.md`; `npm rm convex @convex-dev/auth
@auth/core`; remove the `convex` entry from `tsconfig.json` `exclude` and the Convex block
from `.gitignore`; delete the `handiwork-spike` project in the Convex dashboard.

# Runbook — Wire Vercel Production → Convex Production

**Goal:** point Vercel **Production (master)** at the Convex **prod** deployment
(`effervescent-poodle-398`) while Vercel **Preview (dev + branches)** keeps using the Convex
**dev** deployment (`proper-wolf-657`). This is the canonical Convex + Vercel setup.

**Status (2026-07-07):** **COMPLETE + ACTIVATED + VERIFIED.** Both sides wired (Convex prod Steps 1–4 +
backend deploy; Vercel Step 5), then activated by merging `dev → master` (fast-forward) and pushing. The
resulting production deploy ran `npx convex deploy --cmd 'npm run build'` successfully (● Ready, ~32s vs the
~25s of prior `next build`-only deploys — the delta is the backend push). **Build-level verify passed:** the
production `/login` bundle contains the prod URL `effervescent-poodle-398` and NOT `proper-wolf-657` or
`auth-not-configured`. Only the human functional pass remains (signup → OTP email → Google login on
`handiworkv1.vercel.app`).

**Done so far (this session):**
- Step 1 — prod deploy key generated (you) ✅
- Step 2 — prod OAuth callbacks registered (you); **Google only — Facebook is NOT configured** (no
  `AUTH_FACEBOOK_*` on dev to copy, so the Facebook callback you registered is dormant) ✅
- Step 3 — **fresh** `JWT_PRIVATE_KEY`/`JWKS` keypair generated + set on prod (dev keypair untouched) ✅
- Step 4 — `AUTH_RESEND_KEY`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` copied dev→prod; **`SITE_URL` set to
  `https://handiworkv1.vercel.app`** (NOT copied — dev's is `http://localhost:3000`) ✅
- Backend deployed to prod (`convex deploy` → `effervescent-poodle-398`) so the auth/OAuth endpoints are
  live on the prod `.site` domain ✅
- Step 5 — Vercel build command + env vars reconfigured via the REST API (env-branching build command,
  `CONVEX_DEPLOY_KEY` on Production, removed the Production `NEXT_PUBLIC_CONVEX_URL` + dead
  `NEXT_PUBLIC_CONVEX_SITE_URL`, kept Preview's) ✅ — **applies on the next production deploy**

**Topology (confirmed 2026-07-07):** ONE Convex project, two deployments —
`proper-wolf-657` (dev) + `effervescent-poodle-398` (prod, same project's default production).
See the tracked-debt note in `PROJECT.md` for how this was verified.

---

## Target end state

| Vercel env               | Convex deployment                | How `NEXT_PUBLIC_CONVEX_URL` is set                     |
|--------------------------|----------------------------------|--------------------------------------------------------|
| Production (`master`)    | prod — `effervescent-poodle-398` | auto-injected by `convex deploy --cmd` at build time   |
| Preview (`dev` + branches)| dev — `proper-wolf-657`         | Vercel env var, already scoped to Preview (unchanged)  |

---

## Legend

- **[YOU]** = console-only, requires your accounts (Convex dashboard, Google/Facebook consoles, Vercel).
- **[ME]** = I can run it (Convex CLI via the cached session, repo edits) once you've handed me the
  output of the [YOU] steps it depends on.

Nothing here should be run until you've decided **Step 3** (JWT keypair) — see the ⚠ below.

---

## Prerequisites / things to know before starting

- **Not urgent.** Nothing is on prod yet, so there's no live traffic to break. Do it as one deliberate
  sitting, not a quick flip.
- **Test users won't carry over.** The dev accounts created against `proper-wolf-657` do **not** exist in
  `effervescent-poodle-398`. Expected — you'll re-create a test account on prod to verify.
- **This does NOT fix the welcome-email-image debt.** That's Vercel SSO on previews (see PROJECT.md),
  unrelated to Convex.
- **The local footgun narrows but persists.** After this, `convex deploy` is the correct *CI* prod-push,
  but a bare **local** `npx convex deploy` still targets prod. Keep using `npx convex dev --once` to push
  to the dev deployment during local work.

---

## Step 1 — Generate a prod deploy key  **[YOU]**

1. Open the prod deployment dashboard: `npx convex dashboard --prod --no-open` prints the URL
   (→ `effervescent-poodle-398`), or go to the Convex dashboard → project → **Production** deployment.
2. **Settings → Deploy Keys → Generate a Production Deploy Key.**
3. Copy it. This single key is what Vercel's prod build uses AND what lets me set prod env vars in Step 4/5
   without switching my local config off dev.

> Hand me the key (or set it yourself in the [ME] steps). Treat it as a secret — it grants deploy + env
> write on prod.

---

## Step 2 — Register prod OAuth callback URLs  **[YOU]**

The callbacks registered today only cover the **dev** `.site` domain. Prod uses a different domain:
`https://effervescent-poodle-398.convex.site`.

- **Google Cloud Console** → the OAuth 2.0 Client → **Authorized redirect URIs** → add:
  `https://effervescent-poodle-398.convex.site/api/auth/callback/google`
- **Facebook (Meta for Developers)** → the app → Facebook Login → Settings → **Valid OAuth Redirect URIs**
  → add:
  `https://effervescent-poodle-398.convex.site/api/auth/callback/facebook`

Leave the existing dev callbacks in place — both dev and prod need to keep working.

(Apple stays scaffolded/commented — paid account, out of scope, unchanged.)

---

## Step 3 — JWT signing keypair on prod  **[ME, needs Step 1 key]** — LOCKED: fresh keypair (Option B)

**Why this step exists (correction to an earlier assumption):** `CONVEX_SITE_URL` auto-generates per
deployment, but **`JWT_PRIVATE_KEY` and `JWKS` do NOT.** They are explicitly generated (the `jose` keygen
step) and set as env vars. A prod deployment that has **never had auth configured** almost certainly has
neither. If skipped, the **first** sign-in attempt on prod fails with:

```
Missing environment variable JWT_PRIVATE_KEY
```

**Decision (2026-07-07): generate a FRESH keypair for prod** — dev keeps its own, for true dev/prod
isolation (a dev key leak can't forge prod tokens). Do **not** copy dev's values.

1. Generate a new RS256 keypair — the same jose-based method `@convex-dev/auth` used when dev was first set
   up. Standalone script (no deployment side effects; run with the `jose` dep already in the tree):
   ```js
   // keygen-prod.mjs — throwaway, do not commit
   import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
   const keys = await generateKeyPair("RS256", { extractable: true });
   const JWT_PRIVATE_KEY = (await exportPKCS8(keys.privateKey)).trimEnd().replace(/\n/g, " ");
   const JWKS = JSON.stringify({ keys: [{ use: "sig", ...(await exportJWK(keys.publicKey)) }] });
   console.log("JWT_PRIVATE_KEY=" + JWT_PRIVATE_KEY);
   console.log("JWKS=" + JWKS);
   ```
   ```bash
   node keygen-prod.mjs        # prints the two fresh values; delete the script after
   ```
2. Set the **fresh** values on **prod only**, via the Step 1 prod deploy key:
   ```bash
   CONVEX_DEPLOY_KEY=<prod-key> npx convex env set JWT_PRIVATE_KEY '<fresh-private-key>'
   CONVEX_DEPLOY_KEY=<prod-key> npx convex env set JWKS '<fresh-jwks>'
   ```
3. Leave dev's `proper-wolf-657` keypair untouched. Never commit the generated values or the script.

---

## Step 4 — Re-provision the auth secrets on prod  **[ME] ✅ DONE**

These are **not** auto-copied to prod. Values were pulled from dev (`npx convex env get`) and set on
`effervescent-poodle-398` via the prod deploy key, without printing the secrets:

```bash
CONVEX_DEPLOY_KEY=<prod-key> npx convex env set AUTH_RESEND_KEY    -- "$(from dev)"
CONVEX_DEPLOY_KEY=<prod-key> npx convex env set AUTH_GOOGLE_ID     -- "$(from dev)"
CONVEX_DEPLOY_KEY=<prod-key> npx convex env set AUTH_GOOGLE_SECRET -- "$(from dev)"
# SITE_URL is per-ENVIRONMENT — set fresh to the prod domain, NOT copied from dev:
CONVEX_DEPLOY_KEY=<prod-key> npx convex env set SITE_URL https://handiworkv1.vercel.app
```

- `AUTH_RESEND_KEY` — same Resend key as dev (Resend is account-level, not per-deployment).
- `AUTH_GOOGLE_ID/SECRET` — same OAuth **app** credentials as dev; the only per-env difference is the
  **callback URL** (Step 2), not the client id/secret.
- **`AUTH_FACEBOOK_ID/SECRET` — NOT set** (they don't exist on dev either; Facebook OAuth was never
  configured). The `Facebook` provider in `convex/auth.ts` stays listed but dormant — proven harmless
  because dev runs the same way. Set these on **both** dev and prod if/when Facebook login is turned on.
- **`SITE_URL`** — the app URL Convex Auth redirects to after OAuth / for magic links. Dev = localhost,
  prod = the production domain. **Must not be copied** dev→prod.
- **Did NOT set** `CONVEX_SITE_URL` (Convex auto-injects it per deployment) or
  `NEXT_PUBLIC_CONVEX_SITE_URL` (dead config — see Step 5 cleanup).
- Note: the `-- ` before the value is required — `JWT_PRIVATE_KEY` begins with `-----BEGIN`, which the CLI
  otherwise parses as an option flag (`error: unknown option '-----BEGIN…'`).

**Verified:** `CONVEX_DEPLOY_KEY=<prod-key> npx convex env list` on prod shows JWT_PRIVATE_KEY, JWKS,
AUTH_RESEND_KEY, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, SITE_URL — matching dev's set (minus the Facebook
pair neither has).

---

## Step 5 — Vercel configuration  **[ME, via Vercel REST API] ✅ DONE 2026-07-07**

Applied against project `handiwork` (`prj_THp85FvSStMuC3Yk4smNDLZYA3DD`, team
`team_2eCud4vYFzqxwVYZIgGW9f6J`) using the Vercel CLI's cached token + the REST API.

1. **Build command — environment-branching** (NOT a plain swap). Vercel has **one** project-wide build
   command; it can't be "production-only", so a naive change to `npx convex deploy …` would break preview
   builds (no prod deploy key on preview, and preview must stay on the fixed dev deployment). Set instead to:
   ```sh
   if [ "$VERCEL_ENV" = "production" ]; then npx convex deploy --cmd 'npm run build'; else npm run build; fi
   ```
   → Production runs `convex deploy` (deploys backend to prod + injects prod `NEXT_PUBLIC_CONVEX_URL`);
   Preview/Development fall through to plain `npm run build` and keep using the Preview-scoped
   `NEXT_PUBLIC_CONVEX_URL` (`proper-wolf-657`). Set via `PATCH /v9/projects/{id}` `{"buildCommand": …}`.
2. **Added** `CONVEX_DEPLOY_KEY` (the Step 1 prod key), **target `["production"]`, type `sensitive`** — via
   `POST /v10/projects/{id}/env`.
3. **Deleted** the Production-scoped `NEXT_PUBLIC_CONVEX_URL` (env id `nL4t1Fr1T2wYGG58`) — the deploy
   command now provides it. **Kept** the Preview/dev `NEXT_PUBLIC_CONVEX_URL` (`proper-wolf-657`) and the
   Development one (local `vercel dev` only, harmless).
4. **Deleted** `NEXT_PUBLIC_CONVEX_SITE_URL` (env id `YBk2D6DNhJiIQVX2`) — confirmed dead config.

**Verified final state** (`GET /v9/projects/{id}/env`): `CONVEX_DEPLOY_KEY` (production, sensitive) +
`NEXT_PUBLIC_CONVEX_URL` (preview/dev) + `NEXT_PUBLIC_CONVEX_URL` (development); build command as above.

> ✅ **Activated 2026-07-07** by a `dev → master` fast-forward merge (4 commits: vendor signup, logout fix,
> document icon, convex footgun record) + push. The production deploy ran the env-branching build command's
> production path (`npx convex deploy --cmd 'npm run build'`) and went ● Ready. Docs were kept off that merge
> (committed to `dev` afterward) so the merge carried only real app code. This was a true fast-forward
> (`dev` was 4 ahead, zero divergence).

---

## Step 6 — Verify

- **Build-level ✅ DONE (2026-07-07):** grepped the **live** production bundle instead of a local rebuild —
  fetched `https://handiworkv1.vercel.app/login`, pulled every `/_next/static/chunks/*.js`, and counted
  Convex URLs: `effervescent-poodle-398` **present (1)**, `proper-wolf-657` **absent (0)**,
  `auth-not-configured` **absent (0)**. Confirms the prod build injected the prod URL and neither the dev URL
  nor the fallback leaked in.
- **Functional (you), on `handiworkv1.vercel.app` — STILL TODO:**
  1. Sign up a fresh account → confirm the OTP email arrives (proves `AUTH_RESEND_KEY` + JWT on prod).
  2. Complete OTP → lands in the app (proves JWT_PRIVATE_KEY/JWKS present — Step 3 worked).
  3. Google sign-in completes without redirect-uri-mismatch (proves Step 2). *(Facebook is dormant — not
     configured; skip.)*
  - Note: prod is a **fresh database** — your dev test accounts don't exist here; create a new one.

---

## Step 7 — Record + code cleanup  **[ME]**

- Update the **PROJECT.md progress log** with the wiring (dated), and flip the tracked-debt note from
  "resolution direction / not executed" to done.
- Optional: tidy `app/(auth)/AuthConvexProvider.tsx` — the `auth-not-configured` fallback comment can note
  prod now gets its URL via `convex deploy` injection. (Keep the fallback; it's harmless.)
- Remove the now-dead `NEXT_PUBLIC_CONVEX_SITE_URL` line from `.env.local`.

---

## Rollback

Fast revert if prod misbehaves: in Vercel, set the Production build command back to `next build` and
re-add the Production `NEXT_PUBLIC_CONVEX_URL=https://proper-wolf-657.convex.cloud`. That points prod back
at the dev deployment (the current state) with no code change. The prod deployment's env vars can be left
in place — harmless when unused.

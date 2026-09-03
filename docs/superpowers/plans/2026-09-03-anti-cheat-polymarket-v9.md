# HolyMarket Anti-Cheat + Polymarket V9 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a review-oriented anti-cheat risk engine and replace the loaded HolyMarket frontend with a Polymarket-reference V9 interface while preserving auth, oath, Talents, comments, bookmarks, and Scripture resolution.

**Architecture:** Server integrity logic lives in a dedicated module and is called from authenticated event-open, outcome-change, prediction, and Scripture routes. The frontend moves to new V9 JS/CSS entry assets so visual work is isolated from the legacy v8/auth CSS stack and remains one render path.

**Tech Stack:** Node 22, Express 5, express-session, bcryptjs, vanilla ES modules, CSS/SVG, node:test, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-03-anti-cheat-polymarket-v9-design.md`

## Global Constraints

- Risk scoring flags for review only; no automatic bans.
- No cameras, microphones, third-party fingerprinting, or invasive surveillance.
- Preserve Bible-truth oath, auth/session flow, virtual-only Talents, comments, bookmarks, and Scripture reveal.
- Keep server authoritative for balance, predictions, integrity, and account data.
- V9 frontend must be the only loaded UI entry point after migration.
- Match the supplied iPad reference geometry at 1024×648 while remaining responsive.

---

### Task 1: Integrity scoring module

**Files:**
- Create: `server/anti-cheat.mjs`
- Test: `tests/anti-cheat.test.mjs`

**Interfaces:**
- Produces: `createIntegrityState()`, `recordIntegrityEvent(integrity,event)`, `publicIntegrity(integrity)`, `adminIntegrity(integrity)`.

- [ ] Write tests for normal behavior, repeated sub-2s answers, pre-resolution Scripture access, burst predictions, capped signals, and no `banned` field.
- [ ] Run `node --test tests/anti-cheat.test.mjs` and confirm failure because module is missing.
- [ ] Implement deterministic weighted scoring with normal/watch/high-risk thresholds.
- [ ] Re-run the anti-cheat tests and confirm pass.
- [ ] Commit `feat: add review-oriented integrity scoring engine`.

### Task 2: Persist integrity and wire protected telemetry

**Files:**
- Modify: `server/user-repository.mjs`
- Modify: `server/app.mjs`
- Test: `tests/auth-api.test.mjs`
- Create: `tests/integrity-api.test.mjs`

**Interfaces:**
- Consumes: anti-cheat exports from Task 1.
- Produces: `POST /api/integrity/market-open`, `POST /api/integrity/outcome-change`, `GET /api/me/integrity`, `GET /api/admin/integrity`.

- [ ] Add failing API tests for event-open latency tracking, early Scripture probing, burst scoring, safe user response, and admin-key protection.
- [ ] Add `integrity` to new users and normalize legacy users on read/update.
- [ ] Record session market-open timestamps and calculate prediction latency server-side.
- [ ] Instrument Scripture access only when a `marketId` query is present and no prediction exists.
- [ ] Add admin review endpoint gated by `ADMIN_KEY`.
- [ ] Run full server tests and confirm pass.
- [ ] Commit `feat: wire HolyMarket integrity telemetry`.

### Task 3: V9 frontend source regression tests

**Files:**
- Create: `tests/v9-ui-source.test.mjs`
- Modify: `index.html`

**Interfaces:**
- Produces assertions requiring `/src/app-v9.js` and `/src/styles-v9.css` as the loaded frontend assets.

- [ ] Write source tests for V9 entry assets, distinct market-card renderers, Featured markets heading, probability-range controls, integrity badge, and absence of MutationObserver/runtime repair layers.
- [ ] Run test and confirm failure before V9 assets exist.
- [ ] Update `index.html` only after V9 files are implemented in Tasks 4–6.

### Task 4: Polymarket-reference shell, homepage, and market feed

**Files:**
- Create: `src/app-v9.js`
- Create: `src/styles-v9.css`

**Interfaces:**
- Produces: single-render `render()`, route parsing, auth restoration, mixed market-card family renderers, home and all-markets routes.

- [ ] Implement 60px primary header + 44px category rail, fixed brand/search/account geometry, auth modal, oath form, and account dropdown.
- [ ] Implement explicit Featured markets heading, hero chart/outcomes/comments/volume, carousel controls, and Breaking News/Hot Topics rail.
- [ ] Implement multi, binary, live Up/Down, matchup, and resolved card renderers.
- [ ] Implement All markets filters/topic rail and 318px 3-column iPad grid.
- [ ] Add restrained Polymarket-like hover/press, price-flash, chart-draw, live gauge and activity animation.
- [ ] Run V9 source tests for these component requirements.
- [ ] Commit `feat: rebuild HolyMarket home and markets UI as v9`.

### Task 5: Event page and order-ticket parity

**Files:**
- Modify: `src/app-v9.js`
- Modify: `src/styles-v9.css`

**Interfaces:**
- Consumes: market data, auth state and integrity telemetry API.
- Produces: event route, history controls, tabs, comments, Scripture, Rules/Market Context, sticky ticket, mobile sheet.

- [ ] Implement breadcrumb/title/meta/action header and event-specific scoreboard/outcome block.
- [ ] Implement probability chart plus `1H / 1D / 1W / 1M / Max` controls.
- [ ] Implement Comments / Activity / Scripture / Rules / Market Context tabs.
- [ ] Implement sticky ticket with Predict/Review, outcome selection, stake, quick-add, projected return, and lock action.
- [ ] Send market-open and outcome-change telemetry; send `marketId` on Scripture fetch.
- [ ] Keep Scripture hidden until server confirms prediction.
- [ ] Implement mobile bottom ticket sheet.
- [ ] Run V9 source tests and syntax checks.
- [ ] Commit `feat: add Polymarket-style v9 event experience`.

### Task 6: Profile and fair-play status

**Files:**
- Modify: `src/app-v9.js`
- Modify: `src/styles-v9.css`

**Interfaces:**
- Consumes: `GET /api/me/integrity` and authenticated public user object.
- Produces: fair-play status in account dropdown/profile without exposing scoring thresholds.

- [ ] Fetch public integrity state after auth restoration/login/register.
- [ ] Render `Fair play`, `Fair play review`, or `Fair play check` neutral status copy.
- [ ] Expand profile with balance, prediction/bookmark/comment counts, recent activity, oath date and fair-play status.
- [ ] Run source tests.
- [ ] Commit `feat: surface neutral fair-play account status`.

### Task 7: Switch entry point and full CI verification

**Files:**
- Modify: `index.html`
- Modify: `.github/workflows/test.yml` only if needed for new syntax checks.

**Interfaces:**
- Consumes: completed V9 assets.

- [ ] Change `index.html` to load only `/src/styles-v9.css` and `/src/app-v9.js`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Run `node --check server.mjs && node --check server/app.mjs && node --check server/anti-cheat.mjs && node --check src/app-v9.js`.
- [ ] Verify GitHub Actions passes on the feature branch.
- [ ] Commit `chore: make HolyMarket v9 the production frontend`.

### Task 8: Browser and visual regression pass

**Files:**
- No production-file changes unless defects are found.

**Interfaces:**
- Verifies rendered app at 1024×648, 1440×900, 390×844.

- [ ] Exercise signup/oath/login, event open, outcome switch, prediction, Scripture reveal, bookmark, comment, profile, fair-play display and logout.
- [ ] Confirm zero console/page errors.
- [ ] Capture Home, All Markets, Event and mobile screenshots from the exact GitHub build.
- [ ] Compare geometry and component anatomy against supplied Polymarket screenshots and current live Polymarket reference; fix only concrete mismatches.
- [ ] Re-run CI after any fixes.
- [ ] Fast-forward `main` to the verified branch so Render deploys it.
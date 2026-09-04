# HolyMarket V13 Leaderboard + Streak Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add server-trusted consecutive-correct streaks, a public leaderboard, highest-streak announcement, and Inter Tight typography to HolyMarket.

**Architecture:** Resolution truth and streak mutation live on the Express server. The public leaderboard is derived from normalized user records and consumed by the existing single-page V9 frontend through a new `#/leaderboard` route; announcement state is ephemeral browser UI only.

**Tech Stack:** Node.js 22, Express, JSON UserRepository, vanilla JS SPA, CSS, Playwright smoke tests, Google Fonts Inter Tight.

**Spec:** `docs/superpowers/specs/2026-09-04-holymarket-leaderboard-streak-design.md`

## Global Constraints
- The client must never be able to submit or forge `correct`, `currentStreak`, or `bestStreak` values.
- Unknown market resolutions do not affect streak counters.
- Leaderboard responses expose no email, oath identity, password, integrity evidence, or session data.
- The highest-streak banner uses the exact pattern: `{name} has the highest streak of: {streak} 🔥`.
- Existing users and predictions remain valid.
- Preserve the existing measured Polymarket-style layout outside the new leaderboard/profile additions.

---

### Task 1: Resolution and streak domain logic

**Files:**
- Create: `server/resolutions.mjs`
- Create: `server/streaks.mjs`
- Create: `tests/streaks.test.mjs`

**Interfaces:**
- Produces: `resolvedOutcomeIndex(marketId): number|null`, `resolveOutcome(marketId,outcomeIndex): boolean|null`, `normalizeStreak(value): StreakState`, `applyStreakResult(streak,correct,at): StreakState`.

- [ ] **Step 1: Write failing tests** covering a correct result increment, best-streak update, wrong-result reset, unknown market returning `null`, and safe normalization.
- [ ] **Step 2: Run** `node --test tests/streaks.test.mjs` and confirm the new modules are missing/failing.
- [ ] **Step 3: Implement** all current HolyMarket market resolution indexes and pure streak helpers.
- [ ] **Step 4: Run** `node --test tests/streaks.test.mjs` and confirm pass.

### Task 2: Persist streaks and expose leaderboard API

**Files:**
- Modify: `server/user-repository.mjs`
- Modify: `server/app.mjs`
- Modify: existing API/repository tests under `tests/`

**Interfaces:**
- `publicUser(user)` includes `streak`.
- `POST /api/me/predictions` stores `prediction.correct` from server resolution and mutates user streak.
- `GET /api/leaderboard?limit=100` returns `{leaders, highestStreak}`.

- [ ] **Step 1: Add failing tests** proving legacy-user normalization, correct/wrong streak mutation through prediction API, unforgeability, and leaderboard public-field/sort behavior.
- [ ] **Step 2: Run** `npm test` and confirm targeted failures.
- [ ] **Step 3: Update repository normalization/public projection** with zero-default streak state.
- [ ] **Step 4: Integrate resolution + streak helpers into prediction locking**; store `correct` on locked prediction.
- [ ] **Step 5: Add public leaderboard endpoint** with deterministic ranking: best streak, current streak, accuracy, resolved count, username.
- [ ] **Step 6: Run** `npm test` and confirm pass.

### Task 3: Typography and leaderboard frontend

**Files:**
- Modify: `index.html`
- Modify: `src/app-v9.js`
- Modify: `src/styles-v9.css`
- Modify: `src/desktop-v9.css` only if wide leaderboard geometry needs a breakpoint override.
- Modify: frontend regression tests under `tests/`.

**Interfaces:**
- New route: `#/leaderboard`.
- Frontend state: `leaderboard:{ready:false,loading:false,leaders:[],highestStreak:null,query:''}` and `streakAnnouncement`.
- New fetch helper: `loadLeaderboard({announce=false}={})`.

- [ ] **Step 1: Add failing frontend regression assertions** for Inter Tight link/family, leaderboard route/nav/footer/account access, streak profile fields, and announcement copy.
- [ ] **Step 2: Run** `npm test` and confirm failures.
- [ ] **Step 3: Load Inter Tight** with Google Fonts preconnect/link and set the root family to `"Inter Tight",Inter,...`; apply tabular numerals to data UI.
- [ ] **Step 4: Add leaderboard route/state/rendering** with title, compact filters, search, top-three cards, ranked rows, and current-user highlight.
- [ ] **Step 5: Add profile streak stats and prediction result markers** using server-provided values only.
- [ ] **Step 6: Add highest-streak announcement** with sessionStorage dedupe and ~4 second auto-dismiss.
- [ ] **Step 7: Refresh leaderboard after successful prediction** so record changes can announce immediately.
- [ ] **Step 8: Run** `npm test` and confirm pass.

### Task 4: Browser verification and production promotion

**Files:**
- Create or modify: `scripts/streak-leaderboard-smoke.mjs`
- Modify: `.github/workflows/visual.yml`

**Interfaces:**
- Browser smoke verifies actual Express API + SPA behavior at desktop and mobile widths.

- [ ] **Step 1: Add Playwright smoke** that creates two unique test accounts, locks known correct/wrong markets, verifies current/best streak behavior, opens leaderboard, verifies ranking, and checks the bottom announcement text.
- [ ] **Step 2: Add the smoke script to visual CI.**
- [ ] **Step 3: Push branch and run normal CI + visual CI.**
- [ ] **Step 4: Inspect failures and fix root causes; rerun full suites.**
- [ ] **Step 5: After both workflows succeed on the exact branch commit, fast-forward `main` to that commit.**
- [ ] **Step 6: Re-run normal and visual workflows on exact `main` SHA before claiming completion.**

# HolyMarket Anti-Cheat + Polymarket V9 Design

Date: 2026-09-03
Status: Approved by user via “stop asking me for permission, just do it”

## Goal

Add a non-invasive server-side anti-cheat risk engine and rebuild HolyMarket’s visible frontend to match the current Polymarket information architecture and interaction density much more closely while preserving HolyMarket branding, Bible content, virtual Talents, auth, oath, comments, bookmarks, and Scripture reveal.

## Reference findings

Current Polymarket uses a two-tier navigation, a `Featured markets` homepage section, mixed market-card families in one dense feed, dedicated live Up/Down cards, sports/esports score cards, multi-outcome cards, volume/status metadata, event pages with probability/history views, Rules/Market Context, comments/positions/activity-style tabs, and a persistent right-side order ticket. The HolyMarket v8/auth build remains too templated and uses custom header/account geometry that diverges from the reference.

## Anti-cheat design

The detector is a review-risk engine, not an automatic banning system. It only uses HolyMarket behavior relevant to answer integrity.

Signals:

- market-open-to-prediction latency below 2 seconds repeatedly;
- many predictions in a short burst;
- repeated Scripture-resolution requests before a prediction is locked;
- very high accuracy combined with consistently implausibly low answer latency after enough resolved answers exist;
- repeated invalid/duplicate prediction attempts;
- repeated switching between outcomes immediately before submission is recorded as context but carries low weight by itself.

No cameras, microphones, third-party fingerprinting, invasive browser surveillance, or automatic accusation language.

Each user stores `integrity`:

```json
{
  "score": 0,
  "level": "normal",
  "signals": [],
  "events": [],
  "updatedAt": "ISO timestamp"
}
```

Risk levels:

- `normal`: 0–29
- `watch`: 30–59
- `high-risk`: 60+

Signals decay in importance by using capped contribution counts, so one behavior cannot increase risk forever. The API returns the user their integrity status only as a neutral `Fair play` status without exposing exact detection thresholds. Full signal details are available only from an admin endpoint protected by `ADMIN_KEY`.

### Telemetry API

`POST /api/integrity/market-open`

Authenticated. Body: `{ "marketId": "..." }`. Stores an open timestamp in the session and a lightweight event on the user.

`POST /api/integrity/outcome-change`

Authenticated. Body: `{ "marketId": "...", "outcomeIndex": 0 }`. Records context, capped to avoid log spam.

The existing prediction endpoint reads the session open timestamp and calculates latency server-side.

The Scripture endpoint checks the authenticated session. If the requested market has not been predicted yet and the request includes `marketId`, it records a strong pre-resolution-access signal before returning Scripture. The frontend itself never asks for Scripture until a prediction is locked, so this primarily catches direct API probing.

`GET /api/me/integrity`

Authenticated. Returns `{ level, label }` only.

`GET /api/admin/integrity`

Requires `x-admin-key` matching `ADMIN_KEY`; returns flagged users and signal details.

## Frontend V9

Create a new `src/app-v9.js` and `src/styles-v9.css`; update `index.html` to load only these V9 frontend assets plus no legacy auth stylesheet. Old source remains temporarily for rollback but is no longer loaded.

### Header

- 60px primary bar and 44px category bar at iPad/desktop reference scale.
- fixed HolyMarket brand slot;
- large centered search surface;
- logged-out `Log in` and blue `Sign up` controls occupying the same right-side visual region as Polymarket account controls;
- logged-in balance + avatar control with compact dropdown;
- horizontally scrollable category rail using the current Polymarket sequence pattern translated to Bible categories after the utility categories.

### Homepage

- explicit `Featured markets` heading;
- large featured panel with market identity, outcomes, live comments, volume/cadence and animated chart;
- featured carousel controls;
- Breaking News / Hot Topics rail at layouts where the supplied screenshots show it;
- dense `All markets` section immediately below using mixed card families.

### Market cards

Separate renderers for:

- multi-outcome cards;
- binary cards;
- live Up/Down cards with gauge/activity;
- matchup/score cards;
- compact resolved/status cards.

Cards use the current Polymarket anatomy: compact title + image, outcome/price rows, small Yes/No controls, terse volume/status footer, and bookmark control. Motion is restricted to price flashes, subtle hover/press, gauge/chart updates, and live activity bursts.

### All markets

- `All markets` title + utility icons;
- horizontally scrolling topic rail;
- search + `24hr Volume` + `All` + `Active` controls;
- 3-column 318px iPad grid at the supplied reference size;
- responsive 4-column desktop where space allows and one-column mobile;
- FAQ/footer discovery content below the grid.

### Event page

- breadcrumb, market title/actions, volume/status;
- event-specific score/outcome block when relevant;
- probability history chart with `1H / 1D / 1W / 1M / Max` controls;
- Comments / Activity / Scripture / Rules / Market Context sections;
- comments form uses authenticated account;
- Scripture remains hidden until prediction;
- sticky right-side prediction ticket with Predict/Review, outcome pills, amount, quick-add, potential return, and action button;
- mobile uses a bottom prediction sheet.

### Account and integrity UI

- auth modal remains oath-gated;
- account dropdown adds a small `Fair play` status derived from `/api/me/integrity`;
- profile page includes balance, prediction count, bookmark count, comments, recent activity, oath date, and integrity status;
- exact risk score/signals are never shown to normal users.

## Data flow

1. App restores session with `/api/auth/me`.
2. Opening an event calls `/api/integrity/market-open` if logged in.
3. Outcome changes optionally call `/api/integrity/outcome-change`.
4. Prediction endpoint calculates server-side latency, stores prediction, deducts Talents, and updates integrity.
5. Scripture loads only after successful prediction; direct early Scripture API probing is risk-scored.
6. Browser UI rerenders from the authoritative server user object.

## Testing

Server tests cover risk thresholds, latency signals, pre-resolution Scripture access, burst behavior, admin endpoint authorization, and no automatic ban behavior.

Source/regression tests ensure V9 is the only loaded frontend, mixed card renderers exist, reference geometry remains explicit, auth/oath flows remain present, and legacy runtime repair layers are not loaded.

CI runs `npm install`, `npm test`, `npm run build`, and Node syntax checks. Browser smoke testing covers 1024×648 iPad geometry, desktop, and mobile; signup/oath/login; event open telemetry; prediction; Scripture reveal; bookmark; comment; integrity badge; profile; logout; and zero console/page errors.

## Deployment

After green CI and browser verification, fast-forward `main` to the verified feature branch so the existing Render service auto-deploys it. `SESSION_SECRET` remains required. `ADMIN_KEY` is optional but required to use `/api/admin/integrity`.
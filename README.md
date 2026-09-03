# HolyMarket — Scripture prediction markets

HolyMarket is a virtual-only Bible learning concept with a Polymarket-reference market UX, prototype accounts, virtual Talents, Scripture resolution, bookmarks, comments, activity, profiles, and a review-oriented fair-play detector. Talents have no cash value.

## Install and run

```bash
npm install
npm start
```

Open `http://localhost:4173`.

Routes:
- `#/` featured homepage
- `#/markets` all markets
- `#/event/david-goliath` event detail + prediction ticket
- `#/profile` authenticated profile

## Accounts and sessions

HolyMarket uses Express + `express-session` with a server-side `hm.sid` cookie.

Registration requires username, email, password, and the Bible-truth oath shown in the sign-up modal. The server records the oath version, signed name, and acceptance timestamp. Passwords are hashed with bcryptjs.

Set a strong secret in production:

```bash
SESSION_SECRET=replace-with-a-long-random-secret
```

Prototype user data is written to `DATA_DIR/users.json`. Locally, `DATA_DIR` defaults to `./data`.

### Render warning

Render services use an ephemeral filesystem by default. Without Render Postgres, Key Value, or a paid persistent disk, local `users.json` data can disappear on a deploy or restart. The default `express-session` MemoryStore also resets when the process restarts. This is intentionally temporary for this prototype phase.

For a paid persistent disk you can point:

```bash
DATA_DIR=/var/data/holymarket
```

For the next production persistence phase, migrate users to Postgres and sessions to Postgres/Key Value without changing the frontend API contract.

## Fair-play / anti-cheat detector

HolyMarket has a server-side review-risk engine. It does **not** automatically ban or accuse users. It records limited quiz-integrity signals such as repeated implausibly fast predictions, large rapid-fire prediction bursts, repeated invalid/duplicate prediction attempts, extreme outcome switching, and attempts to request the resolving Scripture before a prediction is locked.

Normal users see only a neutral status such as `Fair play`, `Fair play review`, or `Fair play check`. Exact scores and signals are not exposed to regular accounts.

Optional admin review endpoint:

```text
GET /api/admin/integrity
x-admin-key: <ADMIN_KEY>
```

Enable it by setting:

```bash
ADMIN_KEY=replace-with-another-long-random-secret
```

The detector does not use cameras, microphones, third-party fingerprinting, or invasive device surveillance.

## Scripture

Without YouVersion configuration, the server falls back to the public-domain World English Bible through bible-api.com when networking is available.

For YouVersion:

```bash
YVP_APP_KEY=your_key
YVP_BIBLE_VERSION=3034
```

The YouVersion key stays server-side.

## V9 frontend

Production `index.html` loads only:

```text
/src/styles-v9.css
/src/app-v9.js
```

The older frontend files remain in the repository temporarily for rollback but are not loaded.

V9 includes distinct multi-outcome, binary, live Up/Down, matchup/score and resolved market-card families; Featured markets + Breaking News/Hot Topics; All Markets controls; event probability history ranges; Rules/Market Context; Comments/Activity/Scripture; a sticky desktop prediction ticket; and a mobile bottom sheet.

## Tests

```bash
npm test
npm run build
node --check server.mjs
node --check server/app.mjs
node --check server/anti-cheat.mjs
node --check src/app-v9.js
```

GitHub Actions runs the full test/build/syntax suite on `main` and the V9 feature branch.

## Important

HolyMarket is not real-money betting. There are no deposits, withdrawals, crypto wallets, or cash-value prizes. Talents are virtual learning points only.

# HolyMarket — Scripture prediction markets

HolyMarket is a virtual-only Bible learning concept with Polymarket-style market UX, real prototype accounts, virtual Talents, Scripture resolution, bookmarks, comments, activity, and profiles. Talents have no cash value.

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

Registration requires username, email, password, and the Bible-truth oath shown in the sign-up modal. The server records the oath version, signed name, and acceptance timestamp. Passwords are hashed with bcryptjs in the deployed app.

Set a strong secret in production:

```bash
SESSION_SECRET=replace-with-a-long-random-secret
```

Prototype user data is written to `DATA_DIR/users.json`. Locally, `DATA_DIR` defaults to `./data`.

### Render warning

Render services use an ephemeral filesystem by default. Without Render Postgres, Key Value, or a paid persistent disk, local `users.json` data can disappear on a deploy or restart. The default `express-session` MemoryStore also resets when the process restarts. This is intentionally temporary for this prototype auth phase.

For a paid persistent disk you can point:

```bash
DATA_DIR=/var/data/holymarket
```

For the next production persistence phase, migrate users to Postgres and sessions to Postgres/Key Value without changing the frontend API contract.

## Scripture

Without YouVersion configuration, the server falls back to the public-domain World English Bible through bible-api.com when networking is available.

For YouVersion:

```bash
YVP_APP_KEY=your_key
YVP_BIBLE_VERSION=3034
```

The YouVersion key stays server-side.

## Tests

```bash
npm test
npm run build
node --check server.mjs
node --check server/app.mjs
node --check src/app.js
```

## Important

HolyMarket is not real-money betting. There are no deposits, withdrawals, crypto wallets, or cash-value prizes. Talents are virtual learning points only.

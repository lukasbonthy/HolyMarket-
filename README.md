# BibleBet — Polymarket-style Scripture prediction concept

A virtual-only Bible learning concept rebuilt as a modular browser app with a dependency-free Node server. The UI is tuned against current Polymarket layout patterns and the supplied 2048×1536 iPad screenshots, while using BibleBet branding and virtual Talents only.

## Run

```bash
node server.mjs
```

Open `http://localhost:4173`.

Routes:
- `#/` featured homepage
- `#/markets` all markets
- `#/event/david-goliath` event detail + prediction ticket

## Scripture

Without configuration, the server falls back to the public-domain World English Bible via bible-api.com when networking is available.

For YouVersion, set:

```bash
YVP_APP_KEY=your_key YVP_BIBLE_VERSION=3034 node server.mjs
```

The key stays server-side.

## Tests

```bash
npm test
npm run build
```

## Important

Talents are virtual learning points with no cash value. No deposits, withdrawals, wallet, or real-money trade execution is included.

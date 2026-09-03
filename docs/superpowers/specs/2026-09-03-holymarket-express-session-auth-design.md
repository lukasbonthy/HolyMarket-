# HolyMarket Express Session Auth — Design

Date: 2026-09-03
Status: Approved for implementation

## Goal

Add a real prototype account system to HolyMarket without introducing Supabase or another managed auth provider yet. The auth experience should feel native to the existing Polymarket-style UI while keeping HolyMarket virtual-only.

## Scope

This phase adds:

- Register with username, email, and password.
- Mandatory Bible-truth oath during registration.
- Log in with email + password.
- Log out.
- Session restoration on refresh through a server-side session cookie.
- Logged-in header state with username/avatar and Talent balance.
- Logged-out header state with Log in and Sign up actions.
- Polymarket-style auth modal.
- Authenticated user profile data.
- Server-owned Talents balance.
- Server-owned predictions.
- Server-owned bookmarks.
- Server-owned comments/activity records.
- Session-protected APIs for user state.

This phase intentionally does not add Google OAuth, wallet login, password reset email, email verification, admin moderation, or a durable production database.

## Architecture

### Server

Replace the current raw `node:http` request router with Express while preserving the existing static-site serving and Scripture API behavior.

Dependencies:

- `express`
- `express-session`
- `bcryptjs`

The server is responsible for authentication, user data, Talents, predictions, bookmarks, comments, Scripture proxying, and static files.

### Sessions

Use `express-session`.

Configuration:

- Cookie name: `hm.sid`
- `httpOnly: true`
- `sameSite: 'lax'`
- `secure: true` in production
- `maxAge`: 30 days
- `resave: false`
- `saveUninitialized: false`
- `app.set('trust proxy', 1)` in production so secure cookies work behind Render.
- Secret read from `SESSION_SECRET`.

For this prototype, the default in-process session store is acceptable only as an explicit temporary limitation. Session state resets when the Render process restarts.

## Prototype user storage

Store account records in a JSON file under:

`DATA_DIR/users.json`

Default local value:

`./data/users.json`

Each user record:

```json
{
  "id": "uuid",
  "username": "Luke",
  "email": "user@example.com",
  "passwordHash": "...",
  "avatar": "L",
  "talents": 2450,
  "createdAt": "ISO timestamp",
  "oath": {
    "version": "2026-09-03-v1",
    "accepted": true,
    "signedName": "Luke",
    "acceptedAt": "ISO timestamp"
  },
  "bookmarks": [],
  "predictions": [],
  "comments": [],
  "activity": []
}
```

Passwords are never stored in plaintext. `bcryptjs` hashes passwords before writing them.

The JSON datastore is wrapped in a small repository module so it can later be swapped for Postgres without changing the HTTP API or frontend.

## Bible-truth oath

Registration requires a solemn anti-cheating oath before the account can be created.

The displayed oath text is:

> With my hand on a Bible if I have one, I solemnly affirm before God that the answers I choose on HolyMarket will come from my own honest knowledge and reasoning. I will not look up the resolving verse, use answer keys, search engines, AI, or another person to discover an answer before locking my prediction. I understand HolyMarket is for learning Scripture in truth, not for pretending to know what I do not know.

The registration form requires all of the following:

- A checked `I agree to this oath` checkbox.
- The user types their name into a `Signed name` field.
- The server receives `oathAccepted: true` and the signed name.
- The server rejects registration if the oath is missing, unchecked, or the signed name is shorter than 2 characters.
- The server stores the oath version, signed name, and acceptance timestamp with the account.

The interface may invite the person to physically place a hand on a Bible while reading the oath, but HolyMarket must not claim it can verify that physical action.

A compact reminder appears in the prediction ticket for signed-in users: `On my oath: this is my honest prediction.` The account oath is the binding attestation for this prototype; users do not need to re-sign the full oath on every prediction.

## API

### Public

`POST /api/auth/register`

Body:

```json
{
  "username":"Luke",
  "email":"user@example.com",
  "password":"...",
  "oathAccepted":true,
  "oathSignedName":"Luke"
}
```

Creates a user, records the oath, starts a session, returns the public user object.

`POST /api/auth/login`

Body:

```json
{"email":"user@example.com","password":"..."}
```

Validates credentials, regenerates the session ID, returns the public user object.

`POST /api/auth/logout`

Destroys the session and clears `hm.sid`.

`GET /api/auth/me`

Returns `{ "user": null }` when logged out or the current public user object when logged in.

### Authenticated state

`GET /api/me/state`

Returns current balance, bookmarks, predictions, comments, and activity.

`POST /api/me/predictions`

Body includes market id, outcome index, side, and Talent stake. The server validates balance, deducts the stake, records the prediction, and returns the updated user state.

`POST /api/me/bookmarks/:marketId`

Toggles the bookmark.

`POST /api/markets/:marketId/comments`

Creates a comment owned by the authenticated user and records activity.

All protected endpoints return HTTP 401 when no valid session exists.

## Validation and security

- Normalize emails to lowercase.
- Reject duplicate emails.
- Username length: 2–24 characters.
- Password minimum: 8 characters.
- Oath must be accepted and signed during registration.
- Reject malformed JSON with a 400 response.
- Use generic login failure messaging so the API does not reveal whether an email exists.
- Regenerate session IDs after successful login/register.
- Do not expose password hashes in API responses.
- Add `express.json({ limit: '32kb' })`.
- Disable `x-powered-by`.
- Cookie secret must come from `SESSION_SECRET` in production.

## Frontend behavior

### Logged out

Header right side shows:

- `Log in`
- blue `Sign up`

Clicking either opens an auth modal rather than navigating away.

### Auth modal

The modal visually follows the Polymarket-style account dialog:

- Dark centered panel.
- HolyMarket mark and heading.
- Login / Sign up state.
- Email and password inputs.
- Username input only for registration.
- Mandatory Bible-truth oath card only for registration.
- Oath agreement checkbox and signed-name field.
- Primary blue submit button.
- Inline validation/error text.
- Escape/backdrop close.
- Loading state during requests.

### Logged in

Header shows:

- Talent balance.
- Circular avatar.
- Username.
- Dropdown with Profile and Log out.

The frontend calls `/api/auth/me` at startup before rendering account-dependent UI.

### Predictions

When logged in, `Lock prediction` sends the prediction to the server and the returned server balance becomes authoritative. The ticket shows `On my oath: this is my honest prediction.`

When logged out, pressing the prediction action opens the login modal instead of storing a fake prediction locally.

### Bookmarks and comments

These require login. Logged-out clicks open the auth modal. Logged-in actions use the API and update from the server response.

## Data flow

1. Browser loads HolyMarket.
2. Frontend requests `/api/auth/me`.
3. Express resolves `hm.sid` and returns user state.
4. Frontend renders either guest or authenticated header.
5. User actions call protected API endpoints.
6. Server validates session and writes user state.
7. Server returns authoritative updated state.
8. Frontend rerenders only from returned state.

This preserves the v8 single-render principle and avoids a second DOM-mutating enhancement layer.

## Error handling

Frontend auth/API errors are shown inline and do not destroy the current route.

Expected API error envelope:

```json
{"error":"Readable error message"}
```

Server logs unexpected errors and returns a generic 500 response.

## Render limitations

Render Free uses an ephemeral filesystem, so `users.json` can disappear on restart, spin-down, or deploy. In-process sessions also disappear when the process restarts.

This is accepted for this prototype phase. The API and datastore boundary are intentionally designed so the next migration can replace JSON/session storage with Render Postgres or another persistent store without redesigning the frontend.

## Testing

### Server tests

- Register creates a user and session.
- Registration rejects a missing oath.
- Registration stores oath version, signed name, and timestamp.
- Duplicate registration rejected.
- Password hash differs from plaintext password.
- Login rejects wrong password.
- Login starts authenticated session.
- `/api/auth/me` reflects login/logout correctly.
- Protected routes reject unauthenticated requests.
- Prediction deducts correct Talent amount.
- Prediction cannot exceed balance.
- Bookmark toggle persists in user state.
- Comment records author and activity.
- Password hash is never returned.

### Browser smoke tests

At 1024×648 and mobile width:

- Guest header shows Log in / Sign up.
- Sign up modal opens/closes.
- Registration requires the oath checkbox and signed name.
- Registration transitions header to authenticated state.
- Refresh restores the session while process is alive.
- Prediction ticket shows oath reminder.
- Prediction locks and balance changes.
- Bookmark toggles.
- Comment posts.
- Profile dropdown opens.
- Logout restores guest UI.

## Environment variables

Required in production:

`SESSION_SECRET=<long-random-secret>`

Optional:

`DATA_DIR=/var/data/holymarket`

Existing YouVersion variables continue to work:

`YVP_APP_KEY`
`YVP_BIBLE_VERSION`

## Migration path

The next persistence upgrade replaces only two boundaries:

1. UserRepository JSON implementation → Postgres implementation.
2. Express MemoryStore → database/Redis-backed session store.

The auth endpoints and frontend API contract stay unchanged.

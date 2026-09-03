# HolyMarket Express Session Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real prototype accounts, Express sessions, a required Bible-truth oath, and server-owned HolyMarket user state without breaking the v8 single-render frontend.

**Architecture:** Replace the raw Node HTTP router with a testable Express app. Keep account persistence behind a JSON `UserRepository`, keep browser auth/state behind one API helper inside the existing v8 app, and preserve one frontend renderer/one stylesheet. `express-session` owns login state; the JSON repository owns users, Talents, predictions, bookmarks, comments, activity, and oath records.

**Tech Stack:** Node.js ESM, Express, express-session, bcryptjs, node:test, existing vanilla-JS v8 frontend.

**Spec:** `docs/superpowers/specs/2026-09-03-holymarket-express-session-auth-design.md`

## Global Constraints

- Cookie name is `hm.sid`; `httpOnly: true`; `sameSite: 'lax'`; 30-day max age.
- Production secure cookies use `app.set('trust proxy', 1)` and `secure: true`.
- `SESSION_SECRET` is required in production.
- Passwords are hashed with bcryptjs and never returned.
- Registration requires oath acceptance and a signed name.
- Oath version is `2026-09-03-v1`.
- Starting Talent balance is 2450.
- Protected APIs return 401 when logged out.
- Preserve v8's one app script / one stylesheet / no DOM observer architecture.

---

### Task 1: Express app + JSON user repository

**Files:**
- Create: `server/user-repository.mjs`
- Create: `server/app.mjs`
- Modify: `server.mjs`
- Modify: `package.json`
- Test: `tests/auth-api.test.mjs`

**Interfaces:**
- Produces `createApp({dataDir, sessionSecret, production}) -> Express app`.
- Produces `UserRepository` with `createUser`, `findByEmail`, `findById`, `updateUser`, `publicUser`.

- [ ] **Step 1: Write failing repository/API tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { UserRepository } from '../server/user-repository.mjs';

test('new user stores hashed password and oath metadata', async () => {
  const repo = new UserRepository(tempDir);
  const user = await repo.createUser({username:'Luke',email:'luke@example.com',password:'password123',oathSignedName:'Luke'});
  assert.notEqual(user.passwordHash, 'password123');
  assert.equal(user.oath.version, '2026-09-03-v1');
  assert.equal(user.oath.signedName, 'Luke');
});
```

- [ ] **Step 2: Run `npm test` and verify RED**
- [ ] **Step 3: Add `express`, `express-session`, `bcryptjs`; implement repository and `createApp`**
- [ ] **Step 4: Run `npm test` and verify GREEN**
- [ ] **Step 5: Commit**

### Task 2: Register/login/logout/session APIs + oath enforcement

**Files:**
- Modify: `server/app.mjs`
- Test: `tests/auth-api.test.mjs`

**Interfaces:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

- [ ] **Step 1: Add failing tests for oath rejection, duplicate email, wrong password, session restoration, logout**

```js
test('register rejects missing oath', async () => {
  const r = await request(app,'POST','/api/auth/register',{username:'Luke',email:'l@example.com',password:'password123'});
  assert.equal(r.status, 400);
});
```

- [ ] **Step 2: Verify RED**
- [ ] **Step 3: Implement validation, session regeneration, generic login errors, public-user response**
- [ ] **Step 4: Verify GREEN**
- [ ] **Step 5: Commit**

### Task 3: Server-owned Talents, predictions, bookmarks, comments/activity

**Files:**
- Modify: `server/app.mjs`
- Modify: `server/user-repository.mjs`
- Test: `tests/user-state-api.test.mjs`

**Interfaces:**
- `GET /api/me/state`
- `POST /api/me/predictions`
- `POST /api/me/bookmarks/:marketId`
- `POST /api/markets/:marketId/comments`

- [ ] **Step 1: Add failing tests for 401, balance deduction, insufficient funds, bookmark toggle, comment author/activity**
- [ ] **Step 2: Verify RED**
- [ ] **Step 3: Implement protected endpoints with repository writes**
- [ ] **Step 4: Verify GREEN and assert passwordHash never appears in responses**
- [ ] **Step 5: Commit**

### Task 4: Polymarket-style auth header and modal with oath

**Files:**
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Test: `tests/frontend-auth.test.mjs`

**Interfaces:**
- Browser startup `GET /api/auth/me`.
- Guest header: `Log in`, `Sign up`.
- Auth header: Talent balance, avatar, username, account dropdown.
- Modal modes: login/signup.

- [ ] **Step 1: Add failing source-level regression tests for auth actions and oath fields**

```js
test('signup modal includes oath acceptance and signed name',()=>{
  assert.match(app,/oathAccepted/);
  assert.match(app,/oathSignedName/);
  assert.match(app,/With my hand on a Bible/);
});
```

- [ ] **Step 2: Verify RED**
- [ ] **Step 3: Implement one-render auth state, modal, loading/error states, Escape/backdrop close**
- [ ] **Step 4: Verify GREEN**
- [ ] **Step 5: Commit**

### Task 5: Wire prediction/bookmark/comment behavior to authenticated server state

**Files:**
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Test: `tests/frontend-auth.test.mjs`

**Interfaces:**
- Logged-out protected action opens login modal.
- Logged-in prediction posts to `/api/me/predictions`.
- Ticket displays `On my oath: this is my honest prediction.`
- Bookmark/comment calls use protected APIs.

- [ ] **Step 1: Add failing tests proving localStorage prediction ownership is removed and protected API paths are present**
- [ ] **Step 2: Verify RED**
- [ ] **Step 3: Implement server-authoritative balance/state updates and protected-action gating**
- [ ] **Step 4: Verify GREEN**
- [ ] **Step 5: Commit**

### Task 6: Deployment and full regression verification

**Files:**
- Modify: `README.md`
- Test: all `tests/*.test.mjs`

**Interfaces:**
- Render env: `SESSION_SECRET`; optional `DATA_DIR`; existing YouVersion env stays unchanged.

- [ ] **Step 1: Add README deployment/auth instructions and explicit ephemeral-storage warning**
- [ ] **Step 2: Run `npm test`**
- [ ] **Step 3: Run `node --check server.mjs`, `node --check server/app.mjs`, `node --check src/app.js`**
- [ ] **Step 4: Start server locally and smoke-test register → oath → refresh/me → prediction → bookmark/comment → logout at 1024×648 and mobile**
- [ ] **Step 5: Verify `GET /api/status` and Scripture API still work**
- [ ] **Step 6: Commit final docs/verification changes**

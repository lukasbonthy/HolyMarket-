import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');

test('server has Express session auth and integrity endpoints',()=>{
  const server=read('server/app.mjs');
  assert.match(server,/express-session/);
  for(const route of ['/api/auth/register','/api/auth/login','/api/auth/logout','/api/auth/me','/api/me/predictions','/api/me/bookmarks/:marketId','/api/me/integrity','/api/integrity/market-open']) assert.ok(server.includes(route),route);
});

test('registration requires and stores Bible oath',()=>{
  const repo=read('server/user-repository.mjs');
  const server=read('server/app.mjs');
  assert.match(server,/oathAccepted/);
  assert.match(server,/oathSignedName/);
  assert.match(repo,/2026-09-03-v1/);
});

test('v9 frontend includes auth modal, protected state, oath reminder and fair-play status',()=>{
  const app=read('src/app-v9.js');
  assert.match(app,/With my hand on a Bible/);
  assert.match(app,/Bible-truth oath/);
  assert.match(app,/By predicting, you affirm your Bible-truth oath/);
  assert.match(app,/\/api\/auth\/me/);
  assert.match(app,/\/api\/me\/predictions/);
  assert.match(app,/\/api\/me\/integrity/);
  assert.doesNotMatch(app,/localStorage\.setItem\('hm_predictions'/);
});

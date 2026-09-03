import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');

test('server has Express session auth endpoints',()=>{
  const server=read('server/app.mjs');
  assert.match(server,/express-session/);
  for(const route of ['/api/auth/register','/api/auth/login','/api/auth/logout','/api/auth/me','/api/me/predictions','/api/me/bookmarks/:marketId']) assert.ok(server.includes(route),route);
});

test('registration requires and stores Bible oath',()=>{
  const repo=read('server/user-repository.mjs');
  const server=read('server/app.mjs');
  assert.match(server,/oathAccepted/);
  assert.match(server,/oathSignedName/);
  assert.match(repo,/2026-09-03-v1/);
});

test('frontend includes auth modal, protected state, and oath reminder',()=>{
  const app=read('src/app.js');
  assert.match(app,/With my hand on a Bible/);
  assert.match(app,/On my oath: this is my honest prediction/);
  assert.match(app,/\/api\/auth\/me/);
  assert.match(app,/\/api\/me\/predictions/);
  assert.doesNotMatch(app,/localStorage\.setItem\('hm_predictions'/);
});

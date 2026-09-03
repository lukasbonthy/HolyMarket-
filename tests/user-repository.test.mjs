import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { UserRepository, OATH_VERSION } from '../server/user-repository.mjs';
import { verifyPassword } from '../server/passwords.mjs';

async function temp(){return fs.mkdtemp(path.join(os.tmpdir(),'hm-auth-'))}

test('creates user with hashed password, oath, and starting Talents',async()=>{
  const repo=new UserRepository(await temp());
  const user=await repo.createUser({username:'Luke',email:'Luke@Example.com',password:'password123',oathSignedName:'Luke'});
  assert.notEqual(user.passwordHash,'password123');
  assert.equal(await verifyPassword('password123',user.passwordHash),true);
  assert.equal(user.email,'luke@example.com');
  assert.equal(user.talents,2450);
  assert.equal(user.oath.version,OATH_VERSION);
  assert.equal(user.oath.signedName,'Luke');
  assert.equal('passwordHash' in repo.publicUser(user),false);
});

test('updateUser persists predictions and balance',async()=>{
  const dir=await temp();
  const repo=new UserRepository(dir);
  const user=await repo.createUser({username:'Luke',email:'l@example.com',password:'password123',oathSignedName:'Luke'});
  await repo.updateUser(user.id,u=>{u.talents-=25;u.predictions.push({marketId:'david-goliath',stake:25})});
  const repo2=new UserRepository(dir);
  const again=await repo2.findById(user.id);
  assert.equal(again.talents,2425);
  assert.equal(again.predictions[0].marketId,'david-goliath');
});

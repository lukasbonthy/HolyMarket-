import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { UserRepository, OATH_VERSION } from '../server/user-repository.mjs';
import { verifyPassword } from '../server/passwords.mjs';

async function temp(){return fs.mkdtemp(path.join(os.tmpdir(),'hm-auth-'))}

test('creates user with hashed password, oath, starting Talents and zeroed streak',async()=>{
  const repo=new UserRepository(await temp());
  const user=await repo.createUser({username:'Luke',email:'Luke@Example.com',password:'password123',oathSignedName:'Luke'});
  assert.notEqual(user.passwordHash,'password123');
  assert.equal(await verifyPassword('password123',user.passwordHash),true);
  assert.equal(user.email,'luke@example.com');
  assert.equal(user.talents,2450);
  assert.equal(user.oath.version,OATH_VERSION);
  assert.equal(user.oath.signedName,'Luke');
  assert.deepEqual(user.streak,{current:0,best:0,correct:0,resolved:0,updatedAt:null});
  assert.deepEqual(repo.publicUser(user).streak,user.streak);
  assert.equal('passwordHash' in repo.publicUser(user),false);
});

test('updateUser persists predictions, balance and streak',async()=>{
  const dir=await temp();
  const repo=new UserRepository(dir);
  const user=await repo.createUser({username:'Luke',email:'l@example.com',password:'password123',oathSignedName:'Luke'});
  await repo.updateUser(user.id,u=>{u.talents-=25;u.predictions.push({marketId:'david-goliath',stake:25});u.streak.current=1;u.streak.best=1});
  const repo2=new UserRepository(dir);
  const again=await repo2.findById(user.id);
  assert.equal(again.talents,2425);
  assert.equal(again.predictions[0].marketId,'david-goliath');
  assert.equal(again.streak.current,1);
  assert.equal(again.streak.best,1);
});

test('legacy users are normalized with safe streak defaults',async()=>{
  const dir=await temp();
  const now=new Date().toISOString();
  await fs.writeFile(path.join(dir,'users.json'),JSON.stringify([{id:'legacy',username:'Legacy',email:'legacy@example.com',passwordHash:'x',avatar:'L',talents:10,createdAt:now,oath:{},bookmarks:[],predictions:[],comments:[],activity:[]}]),'utf8');
  const repo=new UserRepository(dir);
  const legacy=await repo.findById('legacy');
  assert.deepEqual(legacy.streak,{current:0,best:0,correct:0,resolved:0,updatedAt:null});
});

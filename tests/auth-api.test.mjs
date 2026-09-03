import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server/app.mjs';

async function temp(){return fs.mkdtemp(path.join(os.tmpdir(),'hm-api-'))}
async function withServer(fn){
  const app=createApp({rootDir:process.cwd(),dataDir:await temp(),sessionSecret:'test-secret',production:false});
  const server=app.listen(0,'127.0.0.1');
  await new Promise(r=>server.once('listening',r));
  const base=`http://127.0.0.1:${server.address().port}`;
  try{await fn(base)}finally{await new Promise(r=>server.close(r))}
}
async function request(base,pathName,{method='GET',body,cookie}={}){
  const headers={}; if(body!==undefined)headers['content-type']='application/json'; if(cookie)headers.cookie=cookie;
  const r=await fetch(base+pathName,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
  let data={}; try{data=await r.json()}catch{}
  return{status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0]||cookie};
}
const registration={username:'Luke',email:'luke@example.com',password:'password123',oathAccepted:true,oathSignedName:'Luke'};

test('register requires oath and restores user through session',async()=>withServer(async base=>{
  const noOath=await request(base,'/api/auth/register',{method:'POST',body:{username:'Luke',email:'x@example.com',password:'password123'}});
  assert.equal(noOath.status,400);
  const registered=await request(base,'/api/auth/register',{method:'POST',body:registration});
  assert.equal(registered.status,201);
  assert.equal(registered.data.user.oath.signedName,'Luke');
  assert.equal('passwordHash' in registered.data.user,false);
  const me=await request(base,'/api/auth/me',{cookie:registered.cookie});
  assert.equal(me.data.user.email,'luke@example.com');
}));

test('prediction, bookmark, comment and logout use authenticated state',async()=>withServer(async base=>{
  const registered=await request(base,'/api/auth/register',{method:'POST',body:registration});
  const cookie=registered.cookie;
  const prediction=await request(base,'/api/me/predictions',{method:'POST',cookie,body:{marketId:'david-goliath',outcomeIndex:0,side:'yes',stake:25}});
  assert.equal(prediction.status,201); assert.equal(prediction.data.user.talents,2425);
  const bookmark=await request(base,'/api/me/bookmarks/david-goliath',{method:'POST',cookie,body:{}});
  assert.equal(bookmark.data.bookmarked,true);
  const comment=await request(base,'/api/markets/david-goliath/comments',{method:'POST',cookie,body:{text:'My honest prediction.'}});
  assert.equal(comment.status,201); assert.equal(comment.data.comment.username,'Luke');
  const logout=await request(base,'/api/auth/logout',{method:'POST',cookie,body:{}}); assert.equal(logout.status,200);
  const me=await request(base,'/api/auth/me',{cookie}); assert.equal(me.data.user,null);
}));

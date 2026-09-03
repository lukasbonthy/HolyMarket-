import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server/app.mjs';

async function temp(){return fs.mkdtemp(path.join(os.tmpdir(),'hm-integrity-'))}
async function withServer(fn){
  const fakeFetch=async()=>new Response(JSON.stringify({reference:'John 11:43-44',text:'Jesus called Lazarus out.'}),{status:200,headers:{'content-type':'application/json'}});
  const app=createApp({rootDir:process.cwd(),dataDir:await temp(),sessionSecret:'test-secret',production:false,adminKey:'admin-secret',fetchImpl:fakeFetch});
  const server=app.listen(0,'127.0.0.1');
  await new Promise(r=>server.once('listening',r));
  const base=`http://127.0.0.1:${server.address().port}`;
  try{await fn(base)}finally{await new Promise(r=>server.close(r))}
}
async function request(base,pathName,{method='GET',body,cookie,headers={}}={}){
  const h={...headers}; if(body!==undefined)h['content-type']='application/json'; if(cookie)h.cookie=cookie;
  const r=await fetch(base+pathName,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)});
  let data={}; try{data=await r.json()}catch{}
  return{status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0]||cookie};
}
const registration={username:'Luke',email:'integrity@example.com',password:'password123',oathAccepted:true,oathSignedName:'Luke'};

async function register(base){return request(base,'/api/auth/register',{method:'POST',body:registration})}

test('market-open telemetry makes server calculate answer latency and public status hides score',async()=>withServer(async base=>{
  const reg=await register(base); const cookie=reg.cookie;
  assert.equal((await request(base,'/api/integrity/market-open',{method:'POST',cookie,body:{marketId:'david-goliath'}})).status,200);
  const prediction=await request(base,'/api/me/predictions',{method:'POST',cookie,body:{marketId:'david-goliath',outcomeIndex:0,side:'yes',stake:5}});
  assert.equal(prediction.status,201);
  const integrity=await request(base,'/api/me/integrity',{cookie});
  assert.equal(integrity.status,200);
  assert.equal(integrity.data.integrity.level,'normal');
  assert.equal('score' in integrity.data.integrity,false);
  assert.equal('signals' in integrity.data.integrity,false);
}));

test('early Scripture API access is recorded and can move account into review',async()=>withServer(async base=>{
  const reg=await register(base); const cookie=reg.cookie;
  for(let i=0;i<2;i++){
    const r=await request(base,`/api/scripture?ref=${encodeURIComponent('John 11:43-44')}&marketId=lazarus`,{cookie});
    assert.equal(r.status,200);
  }
  const integrity=await request(base,'/api/me/integrity',{cookie});
  assert.equal(integrity.data.integrity.level,'watch');
}));

test('outcome-change endpoint is authenticated and extreme churn can be reviewed',async()=>withServer(async base=>{
  const unauth=await request(base,'/api/integrity/outcome-change',{method:'POST',body:{marketId:'m1',outcomeIndex:0}});
  assert.equal(unauth.status,401);
  const reg=await register(base); const cookie=reg.cookie;
  for(let i=0;i<12;i++) await request(base,'/api/integrity/outcome-change',{method:'POST',cookie,body:{marketId:'m1',outcomeIndex:i%2}});
  const integrity=await request(base,'/api/me/integrity',{cookie});
  assert.equal(integrity.data.integrity.level,'normal');
}));

test('admin integrity endpoint requires key and returns detailed flagged accounts',async()=>withServer(async base=>{
  const reg=await register(base); const cookie=reg.cookie;
  for(let i=0;i<2;i++) await request(base,`/api/scripture?ref=${encodeURIComponent('John 11:43-44')}&marketId=lazarus`,{cookie});
  const denied=await request(base,'/api/admin/integrity');
  assert.equal(denied.status,403);
  const allowed=await request(base,'/api/admin/integrity',{headers:{'x-admin-key':'admin-secret'}});
  assert.equal(allowed.status,200);
  assert.equal(allowed.data.users.length,1);
  assert.equal(allowed.data.users[0].integrity.level,'watch');
  assert.ok(allowed.data.users[0].integrity.score>=30);
  assert.ok(Array.isArray(allowed.data.users[0].integrity.signals));
}));

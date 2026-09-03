import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server/app.mjs';

async function temp(){return fs.mkdtemp(path.join(os.tmpdir(),'hm-scripture-'))}

test('Scripture endpoint returns a usable local fallback when providers are unavailable',async()=>{
  const fetchImpl=async()=>({ok:false,status:503,json:async()=>({})});
  const app=createApp({rootDir:process.cwd(),dataDir:await temp(),sessionSecret:'test-secret',production:false,fetchImpl});
  const server=app.listen(0,'127.0.0.1');
  await new Promise(r=>server.once('listening',r));
  try{
    const base=`http://127.0.0.1:${server.address().port}`;
    const response=await fetch(`${base}/api/scripture?ref=${encodeURIComponent('John 11:43–44')}&marketId=lazarus`);
    const data=await response.json();
    assert.equal(response.status,200);
    assert.equal(data.provider,'local-fallback');
    assert.equal(data.reference,'John 11:43–44');
    assert.match(data.content,/temporarily unavailable/i);
  }finally{
    await new Promise(r=>server.close(r));
  }
});

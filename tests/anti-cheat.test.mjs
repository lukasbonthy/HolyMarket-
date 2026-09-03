import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createIntegrityState,
  recordIntegrityEvent,
  publicIntegrity,
  adminIntegrity
} from '../server/anti-cheat.mjs';

test('new integrity state is normal and never contains a ban field',()=>{
  const state=createIntegrityState();
  assert.equal(state.score,0);
  assert.equal(state.level,'normal');
  assert.deepEqual(state.signals,[]);
  assert.equal('banned' in state,false);
  assert.deepEqual(publicIntegrity(state),{level:'normal',label:'Fair play'});
});

test('one fast answer does not accuse a user',()=>{
  const state=createIntegrityState();
  recordIntegrityEvent(state,{type:'prediction-latency',latencyMs:1300,marketId:'m1',at:'2026-09-03T18:00:00.000Z'});
  assert.equal(state.score,12);
  assert.equal(state.level,'normal');
});

test('repeated implausibly fast answers can reach review level but contributions are capped',()=>{
  const state=createIntegrityState();
  for(let i=0;i<20;i++) recordIntegrityEvent(state,{type:'prediction-latency',latencyMs:900,marketId:`m${i}`,at:`2026-09-03T18:${String(i).padStart(2,'0')}:00.000Z`});
  assert.equal(state.score,60);
  assert.equal(state.level,'high-risk');
  const instant=state.signals.find(s=>s.code==='instant-answer');
  assert.equal(instant.count,20);
  assert.equal(instant.scoredCount,5);
  assert.equal(instant.points,60);
});

test('pre-resolution Scripture access is a strong signal and rapid burst adds review risk',()=>{
  const state=createIntegrityState();
  recordIntegrityEvent(state,{type:'pre-resolution-scripture',marketId:'m1'});
  assert.equal(state.score,25);
  assert.equal(state.level,'normal');
  recordIntegrityEvent(state,{type:'rapid-burst',marketId:'m6',countInWindow:6});
  assert.equal(state.score,40);
  assert.equal(state.level,'watch');
});

test('outcome changes are context unless churn is extreme',()=>{
  const state=createIntegrityState();
  recordIntegrityEvent(state,{type:'outcome-change',marketId:'m1',changeCount:4});
  assert.equal(state.score,0);
  recordIntegrityEvent(state,{type:'outcome-change',marketId:'m1',changeCount:13});
  assert.equal(state.score,2);
});

test('admin view contains reasons while public view exposes only neutral status',()=>{
  const state=createIntegrityState();
  recordIntegrityEvent(state,{type:'pre-resolution-scripture',marketId:'m1'});
  recordIntegrityEvent(state,{type:'rapid-burst',countInWindow:8});
  const pub=publicIntegrity(state);
  assert.equal('score' in pub,false);
  assert.equal('signals' in pub,false);
  const admin=adminIntegrity(state);
  assert.equal(admin.score,40);
  assert.ok(admin.signals.some(s=>s.code==='pre-resolution-scripture'));
});

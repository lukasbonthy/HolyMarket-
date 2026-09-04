import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvedOutcomeIndex, resolveOutcome } from '../server/resolutions.mjs';
import { normalizeStreak, applyStreakResult } from '../server/streaks.mjs';

test('Bible market resolutions stay server-owned',()=>{
  assert.equal(resolvedOutcomeIndex('david-goliath'),0);
  assert.equal(resolveOutcome('david-goliath',0),true);
  assert.equal(resolveOutcome('david-goliath',1),false);
  assert.equal(resolveOutcome('not-a-market',0),null);
});

test('correct answers build current and best streaks',()=>{
  let streak=normalizeStreak();
  streak=applyStreakResult(streak,true,'2026-09-04T12:00:00.000Z');
  assert.deepEqual(streak,{current:1,best:1,correct:1,resolved:1,updatedAt:'2026-09-04T12:00:00.000Z'});
  streak=applyStreakResult(streak,true,'2026-09-04T12:01:00.000Z');
  assert.equal(streak.current,2);
  assert.equal(streak.best,2);
  assert.equal(streak.correct,2);
  assert.equal(streak.resolved,2);
});

test('wrong answers reset current streak but preserve best',()=>{
  let streak={current:4,best:4,correct:4,resolved:4,updatedAt:null};
  streak=applyStreakResult(streak,false,'2026-09-04T12:02:00.000Z');
  assert.equal(streak.current,0);
  assert.equal(streak.best,4);
  assert.equal(streak.correct,4);
  assert.equal(streak.resolved,5);
});

test('normalization safely repairs legacy streak data',()=>{
  assert.deepEqual(normalizeStreak(null),{current:0,best:0,correct:0,resolved:0,updatedAt:null});
  assert.deepEqual(normalizeStreak({current:3,best:2,correct:7,resolved:6,updatedAt:'x'}),{current:3,best:3,correct:7,resolved:7,updatedAt:'x'});
});

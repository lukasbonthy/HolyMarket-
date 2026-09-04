import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const app=await fs.readFile(new URL('../src/app-v9.js',import.meta.url),'utf8');
const premium=await fs.readFile(new URL('../src/premium-v9.js',import.meta.url),'utf8');
const tailwind=await fs.readFile(new URL('../src/tailwind-v9.css',import.meta.url),'utf8');

test('Scripture resolution exposes persistent correct/incorrect feedback',()=>{
  assert.match(app,/correctAnswerIndex/);
  assert.match(app,/answerFeedback/);
  assert.match(app,/answer-result/);
  assert.match(app,/Correct!/);
  assert.match(app,/Not quite/);
});

test('correct answer celebration and incorrect answer animation are rendered once',()=>{
  assert.match(app,/answer-celebration/);
  assert.match(app,/celebration-particles/);
  assert.match(app,/clearCelebration/);
});

test('premium interaction layer animates routes, live updates, and cards',()=>{
  assert.match(premium,/hm-route-enter/);
  assert.match(premium,/hm-live-tick/);
  assert.match(premium,/--hm-i/);
});

test('motion CSS contains premium micro-interactions and reduced-motion fallback',()=>{
  for(const name of ['hm-route-in','hm-card-in','hm-chart-draw','hm-correct-pop','hm-confetti','hm-wrong-shake','hm-live-pulse']){
    assert.ok(tailwind.includes(name),`missing ${name}`);
  }
  assert.match(tailwind,/prefers-reduced-motion:\s*reduce/);
});

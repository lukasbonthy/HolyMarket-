import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const entry=await fs.readFile(new URL('../src/app-v9-entry.js',import.meta.url),'utf8');
const premium=await fs.readFile(new URL('../src/premium-v9.js',import.meta.url),'utf8');
const tailwind=await fs.readFile(new URL('../src/tailwind-v9.css',import.meta.url),'utf8');
let motion='';
try{motion=await fs.readFile(new URL('../src/motion-v10.js',import.meta.url),'utf8')}catch{}

test('V10 motion module is loaded through the single frontend entry point',()=>{
  assert.match(entry,/motion-v10\.js/);
});

test('Scripture resolution exposes persistent correct/incorrect feedback',()=>{
  assert.match(motion,/correctAnswerIndex/);
  assert.match(motion,/answer-result/);
  assert.match(motion,/Correct!/);
  assert.match(motion,/Not quite/);
});

test('correct answer celebration and incorrect answer animation are rendered once',()=>{
  assert.match(motion,/answer-celebration/);
  assert.match(motion,/celebration-particles/);
  assert.match(motion,/clearCelebration/);
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

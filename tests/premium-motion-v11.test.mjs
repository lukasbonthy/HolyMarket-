import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const entry=await fs.readFile(new URL('../src/app-v9-entry.js',import.meta.url),'utf8');
const css=await fs.readFile(new URL('../src/premium-motion-v11.css',import.meta.url),'utf8');
const motion=await fs.readFile(new URL('../src/premium-motion-v11.js',import.meta.url),'utf8');
const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');

test('v11 premium motion assets are loaded without replacing the v9 app',()=>{
  assert.match(entry,/premium-motion-v11\.js/);
  assert.match(html,/premium-motion-v11\.css/);
});

test('v11 adds pointer reactive cards and premium click feedback',()=>{
  assert.match(motion,/pointermove/);
  assert.match(motion,/--hm-pointer-x/);
  assert.match(motion,/hm-card-tilt/);
  assert.match(motion,/hm-press-wave/);
  assert.match(motion,/hm-bookmark-pop/);
});

test('v11 adds premium semantic motion for search, scripture, tabs and numbers',()=>{
  assert.match(motion,/hm-search-focus/);
  assert.match(motion,/hm-scripture-reveal/);
  assert.match(motion,/hm-tab-shift/);
  assert.match(motion,/hm-number-tick/);
});

test('v11 uses view transitions progressively and respects reduced motion',()=>{
  assert.match(motion,/startViewTransition/);
  assert.match(motion,/prefers-reduced-motion/);
  assert.match(css,/hm-v11-route-old/);
  assert.match(css,/hm-v11-route-new/);
  assert.match(css,/hm-card-tilt/);
  assert.match(css,/hm-scripture-reveal/);
  assert.match(css,/hm-bookmark-pop/);
  assert.match(css,/hm-number-tick/);
  assert.match(css,/prefers-reduced-motion:\s*reduce/);
});

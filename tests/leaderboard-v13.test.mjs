import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const [html,entry,v13,css]=await Promise.all([
  fs.readFile('index.html','utf8'),
  fs.readFile('src/app-v9-entry.js','utf8'),
  fs.readFile('src/leaderboard-v13.js','utf8'),
  fs.readFile('src/leaderboard-v13.css','utf8')
]);

test('v13 loads Inter Tight with safe fallbacks',()=>{
  assert.match(html,/fonts\.googleapis\.com/);
  assert.match(html,/Inter\+Tight/);
  assert.match(html,/leaderboard-v13\.css/);
  assert.match(css,/font-family:"Inter Tight",Inter/);
  assert.match(css,/font-variant-numeric:tabular-nums/);
});

test('v13 is loaded through the existing single frontend entry point',()=>{
  assert.match(entry,/leaderboard-v13\.js/);
  assert.match(v13,/#\/leaderboard/);
  assert.match(v13,/renderLeaderboard/);
  assert.match(v13,/\/api\/leaderboard/);
});

test('profile decoration renders trusted server streak stats and result state',()=>{
  assert.match(v13,/Current streak/);
  assert.match(v13,/Best streak/);
  assert.match(v13,/Accuracy/);
  assert.match(v13,/prediction-result/);
});

test('highest streak announcement uses requested copy and session dedupe',()=>{
  assert.match(v13,/has the highest streak of:/);
  assert.match(v13,/sessionStorage/);
  assert.match(v13,/streakAnnouncement/);
  assert.match(css,/\.streak-announcement/);
});

test('leaderboard has dense ranked rows and top three treatment',()=>{
  assert.match(css,/\.leaderboard-page/);
  assert.match(css,/\.leaderboard-podium/);
  assert.match(css,/\.leaderboard-row/);
  assert.match(css,/\.leaderboard-rank/);
});

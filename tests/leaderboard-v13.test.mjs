import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const [html,app,css]=await Promise.all([
  fs.readFile('index.html','utf8'),
  fs.readFile('src/app-v9.js','utf8'),
  fs.readFile('src/styles-v9.css','utf8')
]);

test('v13 loads Inter Tight with safe fallbacks',()=>{
  assert.match(html,/fonts\.googleapis\.com/);
  assert.match(html,/Inter\+Tight/);
  assert.match(css,/font-family:"Inter Tight",Inter/);
  assert.match(css,/font-variant-numeric:tabular-nums/);
});

test('v13 exposes a first-class leaderboard route and navigation',()=>{
  assert.match(app,/h\.startsWith\('\/leaderboard'\)/);
  assert.match(app,/function renderLeaderboard\(/);
  assert.match(app,/#\/leaderboard/);
  assert.match(app,/Leaderboard/);
  assert.match(app,/\/api\/leaderboard/);
});

test('profile renders server streak stats and prediction result state',()=>{
  assert.match(app,/Current streak/);
  assert.match(app,/Best streak/);
  assert.match(app,/Accuracy/);
  assert.match(app,/prediction-result/);
});

test('highest streak announcement uses requested copy and session dedupe',()=>{
  assert.match(app,/has the highest streak of:/);
  assert.match(app,/sessionStorage/);
  assert.match(app,/streakAnnouncement/);
  assert.match(css,/\.streak-announcement/);
});

test('leaderboard has dense ranked rows and top three treatment',()=>{
  assert.match(css,/\.leaderboard-page/);
  assert.match(css,/\.leaderboard-podium/);
  assert.match(css,/\.leaderboard-row/);
  assert.match(css,/\.leaderboard-rank/);
});

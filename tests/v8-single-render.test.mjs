import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const entry=fs.readFileSync('src/app-v9-entry.js','utf8');
const app=fs.readFileSync('src/app-v9.js','utf8');
const css=fs.readFileSync('src/styles-v9.css','utf8');

test('v9 keeps one module entry point and no repair scripts',()=>{
  assert.match(index,/src\/app-v9-entry\.js/);
  assert.match(index,/src\/styles-v9\.css/);
  assert.doesNotMatch(index,/src\/app\.js|auth\.css|enhance|v6|v7/i);
  assert.equal((index.match(/type="module"/g)||[]).length,1);
  assert.match(entry,/import '\.\/app-v9\.js'/);
  assert.match(entry,/import '\.\/desktop-controls-v9\.js'/);
});

test('v9 main renderer has no DOM observer repair layer',()=>assert.doesNotMatch(app,/MutationObserver/));

test('core routes and controls exist in v9',()=>{
  for(const name of ['renderHome','renderMarkets','renderEvent','renderProfile','openMarket','setOutcome','quickAdd','lockPrediction']) assert.match(app,new RegExp(`function ${name}`));
  for(const action of ['ticket-outcome','quick-add','section-tab','discussion','lock-prediction','open-auth','bookmark']) assert.match(app,new RegExp(action));
});

test('reference geometry remains explicit in v9 stylesheet',()=>{
  assert.match(css,/--shell:\s*1024px/);
  assert.match(css,/grid-template-columns:\s*678px\s+270px/);
  assert.match(css,/grid-template-columns:\s*repeat\(3,\s*318px\)/);
  assert.match(css,/grid-template-columns:\s*610px\s+325px/);
  assert.match(css,/height:\s*172px/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const hasV9=fs.existsSync('src/app-v9.js')&&fs.existsSync('src/styles-v9.css');
const app=hasV9?fs.readFileSync('src/app-v9.js','utf8'):'';
const css=hasV9?fs.readFileSync('src/styles-v9.css','utf8'):'';

test('production entry loads only v9 frontend assets',()=>{
  assert.match(index,/src\/app-v9\.js/);
  assert.match(index,/src\/styles-v9\.css/);
  assert.doesNotMatch(index,/src\/app\.js/);
  assert.doesNotMatch(index,/auth\.css/);
});

test('v9 has distinct Polymarket-style market card families',()=>{
  for(const name of ['renderMultiCard','renderBinaryCard','renderLiveCard','renderMatchupCard','renderResolvedCard'])assert.match(app,new RegExp(`function ${name}`));
  assert.match(app,/Featured markets/);
  assert.match(app,/Breaking News/);
  assert.match(app,/Hot Topics/);
});

test('event experience includes probability ranges and full content tabs',()=>{
  for(const range of ['1H','1D','1W','1M','Max'])assert.match(app,new RegExp(`['\"]${range}['\"]`));
  for(const tab of ['Comments','Activity','Scripture','Rules','Market Context'])assert.match(app,new RegExp(tab));
  assert.match(app,/Potential return/);
  assert.match(app,/Build a combo/);
});

test('v9 integrates auth oath and fair-play status without DOM repair layers',()=>{
  assert.match(app,/Bible-truth oath/);
  assert.match(app,/Fair play/);
  assert.match(app,/\/api\/me\/integrity/);
  assert.match(app,/\/api\/integrity\/market-open/);
  assert.doesNotMatch(app,/MutationObserver/);
});

test('reference geometry remains explicit in v9 css',()=>{
  assert.match(css,/--shell:\s*1024px/);
  assert.match(css,/grid-template-columns:\s*678px\s+270px/);
  assert.match(css,/grid-template-columns:\s*repeat\(3,\s*318px\)/);
  assert.match(css,/grid-template-columns:\s*610px\s+325px/);
  assert.match(css,/height:\s*172px/);
});

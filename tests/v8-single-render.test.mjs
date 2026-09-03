import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('src/app.js','utf8');
const css=fs.readFileSync('src/styles.css','utf8');

test('v8 keeps one module entry point and no repair scripts',()=>{
  assert.match(index,/src\/app\.js/);
  assert.match(index,/src\/styles\.css/);
  assert.match(index,/src\/auth\.css/);
  assert.doesNotMatch(index,/enhance|v6|v7/i);
  assert.equal((index.match(/type="module"/g)||[]).length,1);
});

test('v8 has no DOM observer repair layer',()=>assert.doesNotMatch(app,/MutationObserver/));

test('core routes and controls still exist',()=>{
  for(const name of ['renderHome','renderMarkets','renderEvent','renderProfile','openMarket','setTicketOutcome','quickAdd','lockPrediction']) assert.match(app,new RegExp(`function ${name}`));
  for(const action of ['ticket-outcome','quick-add','event-tab','ticket-tab','lock-prediction','open-auth','bookmark']) assert.match(app,new RegExp(action));
});

test('reference geometry remains explicit in base stylesheet',()=>{
  assert.match(css,/--shell:1024px/);
  assert.match(css,/grid-template-columns:678px 270px/);
  assert.match(css,/grid-template-columns:repeat\(3,318px\)/);
  assert.match(css,/grid-template-columns:610px 325px/);
  assert.match(css,/height:172px/);
});

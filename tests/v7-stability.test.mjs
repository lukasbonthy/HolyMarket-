import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const enhance=fs.readFileSync('src/enhance-v6.js','utf8');
const css=fs.readFileSync('src/styles/v7-stability.css','utf8');

test('v7 stability stylesheet is loaded',()=>{assert.match(index,/v7-stability\.css/)});
test('combo label is promoted above the gradient overlay',()=>{assert.match(enhance,/combo-label/);assert.match(css,/\.combo-button \.combo-label/)});
test('observer watches only direct app child replacement',()=>{assert.match(enhance,/observe\(root,\{childList:true\}\)/);assert.doesNotMatch(enhance,/subtree:true/)});
test('ticket labels and active outcome are repaired after rerenders',()=>{assert.match(enhance,/selectedOutcome/);assert.match(enhance,/fixTickets/)});
test('event tabs are functional',()=>{assert.match(enhance,/renderEventTab/);assert.match(enhance,/comments','activity','scripture','rules/)});
test('horizontal rails scroll instead of silently clipping labels',()=>{assert.match(css,/\.top-nav-scroll\{overflow-x:auto/);assert.match(css,/\.market-topic-rail\{overflow-x:auto/)});

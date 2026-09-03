import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('src/styles/v6.css','utf8');
const ipad=fs.readFileSync('src/styles/v6-exact-ipad.css','utf8');
const app=fs.readFileSync('src/app-v6.js','utf8');

test('v6 entry point is active',()=>{
  assert.match(index,/src\/app-v6\.js/);
  assert.match(index,/src\/styles\/v6\.css/);
  assert.match(index,/v6-exact-ipad\.css/);
});

test('iPad shell matches measured Polymarket reference geometry',()=>{
  assert.match(css,/\.site-header\{height:104px/);
  assert.match(css,/\.topbar\{height:60px/);
  assert.match(css,/\.top-nav\{height:44px/);
  assert.match(css,/\.noticebar\{height:38px/);
  assert.match(ipad,/left:190px;top:11px;width:542px/);
});

test('featured hero and discovery rail use measured widths',()=>{
  assert.match(css,/grid-template-columns:678px 270px/);
  assert.match(css,/\.featured-hero\{height:440px/);
});

test('all markets uses exact three column iPad card geometry',()=>{
  assert.match(css,/grid-template-columns:repeat\(3,318px\)/);
  assert.match(css,/\.market-card\{height:172px/);
});

test('event page and ticket use measured split',()=>{
  assert.match(css,/grid-template-columns:610px 325px/);
  assert.match(css,/\.trade-ticket\{height:368px/);
  assert.match(ipad,/\.scoreboard\{padding-left:149px\}/);
});

test('Polymarket card families are independently rendered',()=>{
  assert.match(app,/function multiCard/);
  assert.match(app,/function binaryCard/);
  assert.match(app,/function liveCard/);
  assert.match(app,/function matchupCard/);
  assert.match(app,/Breaking News/);
  assert.match(app,/Hot topics/);
  assert.match(app,/Build a combo/);
});

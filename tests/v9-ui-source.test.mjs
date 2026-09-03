import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const hasV9=fs.existsSync('src/app-v9.js')&&fs.existsSync('src/styles-v9.css');
const app=hasV9?fs.readFileSync('src/app-v9.js','utf8'):'';
const css=hasV9?fs.readFileSync('src/styles-v9.css','utf8'):'';
const entry=fs.readFileSync('src/app-v9-entry.js','utf8');
const desktop=fs.readFileSync('src/desktop-controls-v9.js','utf8');
const desktopCss=fs.readFileSync('src/desktop-v9.css','utf8');

test('production entry loads only V9 frontend assets through one module',()=>{
  assert.match(index,/src\/app-v9-entry\.js/);
  assert.match(index,/src\/styles-v9\.css/);
  assert.match(index,/src\/desktop-v9\.css/);
  assert.equal((index.match(/type="module"/g)||[]).length,1);
  assert.match(entry,/import '\.\/app-v9\.js'/);
  assert.match(entry,/import '\.\/desktop-controls-v9\.js'/);
  assert.doesNotMatch(index,/src\/app\.js|auth\.css|enhance|v6|v7/i);
});

test('v9 has distinct Polymarket-style market card families',()=>{
  for(const name of ['renderMultiCard','renderBinaryCard','renderLiveCard','renderMatchupCard','renderResolvedCard'])assert.match(app,new RegExp(`function ${name}`));
  assert.match(app,/Featured markets/);
  assert.match(app,/Breaking News/);
  assert.match(app,/Hot Topics/);
});

test('desktop controls provide two-line menu and working popovers',()=>{
  assert.match(desktop,/site-menu-popover/);
  assert.match(desktop,/M4 8h16/);
  assert.match(desktop,/M4 16h16/);
  assert.match(desktop,/toggle-filters/);
  assert.match(desktop,/bookmarks-only/);
  assert.match(desktop,/share-market/);
  assert.match(desktopCss,/@media\(min-width:1200px\)/);
  assert.match(desktopCss,/repeat\(4,minmax\(0,1fr\)\)/);
});

test('event experience includes probability ranges and full content tabs',()=>{
  for(const range of ['1H','1D','1W','1M','Max'])assert.match(app,new RegExp(`['\"]${range}['\"]`));
  for(const tab of ['Comments','Activity','Scripture','Rules','Market Context'])assert.match(app,new RegExp(tab));
  assert.match(app,/Potential return/);
  assert.match(app,/Build a combo/);
});

test('v9 integrates auth oath and fair-play status without renderer repair layers',()=>{
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

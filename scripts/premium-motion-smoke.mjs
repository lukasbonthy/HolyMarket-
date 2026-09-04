import { chromium } from 'playwright';

const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const errors=[];

const ctx=await browser.newContext({viewport:{width:1440,height:900}});
const page=await ctx.newPage();
page.on('console',msg=>{if(msg.type()==='error')errors.push(`console: ${msg.text()}`)});
page.on('pageerror',err=>errors.push(`pageerror: ${err.message}`));
await page.goto(`${base}/#/markets`,{waitUntil:'networkidle'});

const first=page.locator('.market-card').first();
const box=await first.boundingBox();
if(!box)throw new Error('first desktop market card missing');
await page.mouse.move(box.x+box.width*.72,box.y+box.height*.28);
await page.waitForTimeout(80);
if(!await first.evaluate(el=>el.classList.contains('hm-card-tilt')))throw new Error('pointer-reactive card tilt did not activate');
const pointerX=await first.evaluate(el=>el.style.getPropertyValue('--hm-pointer-x'));
if(!pointerX||pointerX==='50%')throw new Error(`card pointer light did not update (${pointerX})`);
const transform=await first.evaluate(el=>getComputedStyle(el).transform);
if(transform==='none')throw new Error('card tilt transform was not rendered');

const search=page.locator('.global-search input').first();
await search.focus();
if(!await page.locator('.global-search.hm-search-focus').count())throw new Error('search focus bloom class missing');

await first.evaluate(el=>{
  const r=el.getBoundingClientRect();
  el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:r.left+40,clientY:r.top+30,pointerType:'mouse'}));
});
if(!await first.evaluate(el=>el.classList.contains('hm-press-wave')))throw new Error('premium press feedback missing');

const bookmark=page.locator('.card-bookmark,[data-action="bookmark"]').first();
if(await bookmark.count()){
  await bookmark.evaluate(el=>el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})));
  if(!await bookmark.evaluate(el=>el.classList.contains('hm-bookmark-pop')))throw new Error('bookmark spring feedback missing');
}

await page.screenshot({path:'visual-artifacts/premium-motion-desktop.png',fullPage:true});
await ctx.close();

const reduced=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const reducedPage=await reduced.newPage();
await reducedPage.goto(`${base}/#/markets`,{waitUntil:'networkidle'});
const reducedCard=reducedPage.locator('.market-card').first();
const reducedBox=await reducedCard.boundingBox();
if(!reducedBox)throw new Error('reduced-motion market card missing');
await reducedPage.mouse.move(reducedBox.x+reducedBox.width*.8,reducedBox.y+40);
await reducedPage.waitForTimeout(80);
if(await reducedCard.evaluate(el=>el.classList.contains('hm-card-tilt')))throw new Error('card tilt must stay disabled for reduced motion');
await reduced.close();

await browser.close();
if(errors.length)throw new Error(`browser errors:\n${errors.join('\n')}`);
console.log('Premium motion smoke passed');

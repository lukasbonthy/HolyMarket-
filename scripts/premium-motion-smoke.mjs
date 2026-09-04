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
// Anonymous bookmark clicks intentionally open auth. Close it before the chart-specific
// assertions so the modal cannot sit above the event plot and steal pointer events.
const authModal=page.locator('.auth-modal');
if(await authModal.count()){
  await page.locator('.modal-close[data-action="close-auth"]').click();
  await authModal.waitFor({state:'detached'});
}

await page.goto(`${base}/#/event/red-sea`,{waitUntil:'networkidle'});
const chart=page.locator('.event-chart').first();
await chart.waitFor({state:'visible'});
await page.waitForFunction(()=>document.querySelector('.event-chart')?.classList.contains('hm-chart-v12'));
if(!await chart.locator('svg defs #hm-chart-primary-gradient').count())throw new Error('chart gradient definition missing');
if(!await chart.locator('.hm-chart-area').count())throw new Error('chart area fill missing');
if(!await chart.locator('.hm-chart-hit-area').count())throw new Error('chart hit area missing');
if(!await chart.locator('.hm-chart-crosshair').count())throw new Error('chart crosshair missing');
if(!await chart.locator('.hm-chart-hover-dot').count())throw new Error('chart hover point missing');
if(!await chart.locator('.hm-chart-tooltip').count())throw new Error('chart tooltip missing');

const hitBox=await chart.locator('.hm-chart-hit-area').boundingBox();
if(!hitBox)throw new Error('chart hit area box missing');
await page.mouse.move(hitBox.x+hitBox.width*.62,hitBox.y+hitBox.height*.52);
await page.waitForTimeout(120);
const tooltip=chart.locator('.hm-chart-tooltip');
if(!await tooltip.evaluate(el=>el.classList.contains('show')))throw new Error('chart tooltip did not show on desktop hover');
if(!/%/.test((await tooltip.textContent())||''))throw new Error('chart tooltip did not report probability');
const crosshairOpacity=await chart.locator('.hm-chart-crosshair').evaluate(el=>getComputedStyle(el).opacity);
if(Number(crosshairOpacity)<=0)throw new Error('chart crosshair remained hidden during hover');

await page.locator('[data-action="chart-range"][data-range="1W"]').click();
await page.waitForFunction(()=>document.querySelector('.event-chart')?.dataset.hmChartRange==='1W');
const refreshed=page.locator('.event-chart').first();
if(!await refreshed.evaluate(el=>el.classList.contains('hm-chart-v12')))throw new Error('V12 chart enhancement did not survive range rerender');
if(!await refreshed.evaluate(el=>el.classList.contains('hm-chart-range-in')))throw new Error('range-change chart entrance animation missing');
if((await refreshed.getAttribute('data-hm-chart-range'))!=='1W')throw new Error('range-change chart state not recorded');

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

await reducedPage.goto(`${base}/#/event/red-sea`,{waitUntil:'networkidle'});
const reducedChart=reducedPage.locator('.event-chart').first();
await reducedChart.waitFor({state:'visible'});
await reducedPage.waitForFunction(()=>document.querySelector('.event-chart')?.classList.contains('hm-chart-v12'));
const reducedAnimation=await reducedChart.locator('.event-line.primary').evaluate(el=>getComputedStyle(el).animationName);
if(reducedAnimation!=='none')throw new Error(`chart line animation must be disabled for reduced motion (${reducedAnimation})`);
await reduced.close();

await browser.close();
if(errors.length)throw new Error(`browser errors:\n${errors.join('\n')}`);
console.log('Premium motion smoke passed');

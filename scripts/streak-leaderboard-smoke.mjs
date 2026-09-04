import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const out=process.env.VISUAL_DIR||'visual-artifacts';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const ctx=await browser.newContext({viewport:{width:1440,height:900}});
const page=await ctx.newPage();
const errors=[];
page.on('console',msg=>{if(msg.type()==='error')errors.push(`console: ${msg.text()}`)});
page.on('pageerror',err=>errors.push(`pageerror: ${err.message}`));

// The main visual smoke creates VisualTester, answers one wrong and one correct,
// leaving a trusted current/best streak of 1. A fresh context should see the
// public leaderboard and the short highest-streak announcement.
await page.goto(`${base}/#/leaderboard`,{waitUntil:'networkidle'});
await page.waitForSelector('.leaderboard-page',{timeout:8000});
await page.waitForFunction(()=>[...document.querySelectorAll('.leaderboard-row')].some(el=>el.textContent.includes('VisualTester')));
const leader=page.locator('.leaderboard-row').filter({hasText:'VisualTester'}).first();
const initialText=await leader.innerText();
if(!initialText.includes('🔥 1'))throw new Error(`initial best streak missing: ${initialText}`);
if(!initialText.includes('50%'))throw new Error(`initial accuracy should be 50% after one correct and one wrong: ${initialText}`);
const announcement=page.locator('.streak-announcement');
await announcement.waitFor({state:'visible',timeout:5000});
if(!(await announcement.innerText()).includes('VisualTester has the highest streak of: 1'))throw new Error('initial highest-streak announcement copy missing');
const family=await page.locator('.leaderboard-page').evaluate(el=>getComputedStyle(el).fontFamily);
if(!family.includes('Inter Tight'))throw new Error(`Inter Tight family not applied: ${family}`);
await page.screenshot({path:`${out}/leaderboard-v13-desktop.png`,fullPage:true});

// Log in and confirm profile stats are decorated from trusted server streak state.
await page.goto(`${base}/#/`,{waitUntil:'networkidle'});
await page.locator('[data-action="open-auth"][data-mode="login"]').click();
await page.locator('input[name="email"]').fill('visual@example.com');
await page.locator('input[name="password"]').fill('password123');
await page.locator('#auth-form').evaluate(form=>form.requestSubmit());
await page.waitForSelector('.account-wrap',{timeout:8000});
await page.goto(`${base}/#/profile`,{waitUntil:'networkidle'});
await page.waitForSelector('.profile-streak-v13',{timeout:5000});
const profileStats=await page.locator('.profile-streak-v13').innerText();
for(const expected of ['Current streak','Best streak','Accuracy','50%'])if(!profileStats.includes(expected))throw new Error(`profile streak stats missing ${expected}`);

// A correct Daniel prediction should raise the record to 2 and announce it.
await page.goto(`${base}/#/event/daniel-lions`,{waitUntil:'networkidle'});
const ticket=page.locator('.ticket-side');
await ticket.locator('[data-action="ticket-outcome"][data-index="0"]').click();
await ticket.locator('[data-action="lock-prediction"]').click();
await page.waitForSelector('.answer-result.correct',{timeout:8000});
await page.waitForFunction(()=>document.querySelector('.streak-announcement')?.textContent.includes('highest streak of: 2'),null,{timeout:5000});
await page.screenshot({path:`${out}/streak-record-v13.png`,fullPage:true});

await page.goto(`${base}/#/leaderboard`,{waitUntil:'networkidle'});
await page.waitForFunction(()=>[...document.querySelectorAll('.leaderboard-row')].some(el=>el.textContent.includes('VisualTester')&&el.textContent.includes('🔥 2')));
const raisedText=await page.locator('.leaderboard-row').filter({hasText:'VisualTester'}).first().innerText();
if(!raisedText.includes('100%')&& !raisedText.includes('66.7%'))throw new Error(`leaderboard accuracy did not refresh: ${raisedText}`);

// A known wrong Abraham outcome resets current streak but must preserve best=2.
await page.goto(`${base}/#/event/abraham`,{waitUntil:'networkidle'});
const navDiag=await page.evaluate(()=>({
  url:location.href,
  hash:location.hash,
  htmlClass:document.documentElement.className,
  appDisplay:getComputedStyle(document.querySelector('#app')).display,
  appText:(document.querySelector('#app')?.innerText||'').slice(0,180),
  eventPages:document.querySelectorAll('.event-page').length,
  ticketSides:document.querySelectorAll('.ticket-side').length,
  activeLeaderboard:document.querySelectorAll('#leaderboard-v13-root.active').length,
  leaderboardPages:document.querySelectorAll('.leaderboard-page').length
}));
console.log('ABRAHAM_NAV_DIAG',JSON.stringify(navDiag));
await page.screenshot({path:`${out}/abraham-navigation-diag.png`,fullPage:true});
const wrongTicket=page.locator('.ticket-side');
await wrongTicket.locator('[data-action="ticket-outcome"][data-index="0"]').click({timeout:5000});
await wrongTicket.locator('[data-action="lock-prediction"]').click();
await page.waitForSelector('.answer-result.incorrect',{timeout:8000});
await page.waitForTimeout(1000);
await page.goto(`${base}/#/leaderboard`,{waitUntil:'networkidle'});
await page.waitForFunction(()=>[...document.querySelectorAll('.leaderboard-row')].some(el=>el.textContent.includes('VisualTester')));
const resetText=await page.locator('.leaderboard-row').filter({hasText:'VisualTester'}).first().innerText();
if(!resetText.includes('🔥 2'))throw new Error(`best streak was not preserved: ${resetText}`);
const rowParts=resetText.split('\n').map(x=>x.trim()).filter(Boolean);
if(!rowParts.includes('0'))throw new Error(`current streak did not reset to zero: ${resetText}`);

// Mobile leaderboard must remain usable and not expose a desktop-only table viewport.
await page.setViewportSize({width:390,height:844});
await page.reload({waitUntil:'networkidle'});
await page.waitForSelector('.leaderboard-page');
const mobilePage=await page.locator('.leaderboard-page').boundingBox();
if(!mobilePage||mobilePage.width>390)throw new Error(`mobile leaderboard overflowed viewport: ${mobilePage?.width}`);
await page.screenshot({path:`${out}/leaderboard-v13-mobile.png`,fullPage:true});

await browser.close();
if(errors.length)throw new Error(`browser errors:\n${errors.join('\n')}`);
console.log('V13 streak/leaderboard smoke passed');

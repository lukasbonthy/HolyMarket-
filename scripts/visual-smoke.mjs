import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const out=process.env.VISUAL_DIR||'visual-artifacts';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[];

async function context(viewport){
  const ctx=await browser.newContext({viewport});
  const page=await ctx.newPage();
  page.on('console',msg=>{if(msg.type()==='error')errors.push(`console: ${msg.text()}`)});
  page.on('pageerror',err=>errors.push(`pageerror: ${err.message}`));
  return{ctx,page};
}

const ipad=await context({width:1024,height:648});
await ipad.page.goto(`${base}/#/`,{waitUntil:'networkidle'});
await ipad.page.screenshot({path:`${out}/home-ipad.png`,fullPage:true});
const topbar=await ipad.page.locator('.topbar').boundingBox();
const category=await ipad.page.locator('.category-bar').boundingBox();
const hero=await ipad.page.locator('.hero-grid').boundingBox();
if(Math.round(topbar?.height||0)!==60)throw new Error(`topbar height ${topbar?.height}`);
if(Math.round(category?.height||0)!==44)throw new Error(`category height ${category?.height}`);
if(Math.round(hero?.width||0)<970)throw new Error(`hero width ${hero?.width}`);

await ipad.page.goto(`${base}/#/markets`,{waitUntil:'networkidle'});
await ipad.page.screenshot({path:`${out}/markets-ipad.png`,fullPage:true});
const cards=ipad.page.locator('.market-card');
if(await cards.count()<12)throw new Error('expected at least 12 market cards');
const first=await cards.nth(0).boundingBox();
const second=await cards.nth(1).boundingBox();
const third=await cards.nth(2).boundingBox();
if(!first||!second||!third)throw new Error('missing first market row');
if(Math.abs(first.width-318)>2)throw new Error(`first card width ${first.width}`);
if(Math.abs(second.x-first.x-330)>3)throw new Error(`column gap ${second.x-first.x}`);
if(Math.abs(third.x-second.x-330)>3)throw new Error(`third column gap ${third.x-second.x}`);

await ipad.page.locator('[data-action="open-auth"][data-mode="signup"]').click();
await ipad.page.locator('input[name="username"]').fill('VisualTester');
await ipad.page.locator('input[name="email"]').fill('visual@example.com');
await ipad.page.locator('input[name="password"]').fill('password123');
await ipad.page.locator('input[name="oathAccepted"]').check();
await ipad.page.locator('input[name="oathSignedName"]').fill('Visual Tester');
await ipad.page.locator('#auth-form').evaluate(form=>form.requestSubmit());
await ipad.page.waitForSelector('.account-wrap',{timeout:8000});

await ipad.page.goto(`${base}/#/event/david-goliath`,{waitUntil:'networkidle'});
await ipad.page.screenshot({path:`${out}/event-ipad-before.png`,fullPage:true});
const main=await ipad.page.locator('.event-main').boundingBox();
const ticket=await ipad.page.locator('.ticket-side').boundingBox();
if(!main||!ticket)throw new Error('event columns missing');
if(Math.abs(main.width-610)>2)throw new Error(`event main width ${main.width}`);
if(Math.abs(ticket.width-325)>2)throw new Error(`ticket width ${ticket.width}`);
const desktopTicket=ipad.page.locator('.ticket-side');
await desktopTicket.locator('[data-action="ticket-outcome"][data-index="1"]').click();
await desktopTicket.locator('[data-action="quick-add"][data-value="5"]').click();
await desktopTicket.locator('[data-action="lock-prediction"]').click();
await ipad.page.waitForTimeout(300);
await ipad.page.locator('[data-action="bookmark"][data-market="david-goliath"]').first().click();
await ipad.page.locator('[data-action="discussion"][data-tab="comments"]').click();
await ipad.page.locator('#comment-input').fill('Honest visual smoke test.');
await ipad.page.locator('[data-action="post-comment"]').click();
await ipad.page.locator('[data-action="discussion"][data-tab="scripture"]').click();
await ipad.page.waitForTimeout(600);
await ipad.page.screenshot({path:`${out}/event-ipad-after.png`,fullPage:true});

await ipad.page.goto(`${base}/#/profile`,{waitUntil:'networkidle'});
await ipad.page.screenshot({path:`${out}/profile-ipad.png`,fullPage:true});
if(!await ipad.page.locator('.fair-stat').count())throw new Error('fair play profile status missing');
await ipad.page.locator('[data-action="account-menu"]').last().click();
await ipad.page.locator('[data-action="logout"]').click();
await ipad.ctx.close();

const desktop=await context({width:1440,height:900});
await desktop.page.goto(`${base}/#/`,{waitUntil:'networkidle'});
await desktop.page.screenshot({path:`${out}/home-desktop.png`,fullPage:true});
await desktop.ctx.close();

const mobile=await context({width:390,height:844});
await mobile.page.goto(`${base}/#/markets`,{waitUntil:'networkidle'});
await mobile.page.screenshot({path:`${out}/markets-mobile.png`,fullPage:true});
if(await mobile.page.locator('.market-card').count()<12)throw new Error('mobile market cards missing');
await mobile.page.locator('.market-card').first().click();
await mobile.page.waitForSelector('.mobile-trade');
await mobile.page.locator('.mobile-trade').click();
if(!await mobile.page.locator('.mobile-sheet-wrap.open').count())throw new Error('mobile prediction sheet did not open');
await mobile.page.screenshot({path:`${out}/event-mobile-sheet.png`,fullPage:true});
await mobile.ctx.close();

await browser.close();
if(errors.length)throw new Error(`browser errors:\n${errors.join('\n')}`);
console.log('Visual smoke passed');

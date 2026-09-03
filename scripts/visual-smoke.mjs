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
if(!(await cards.first().getAttribute('class'))?.includes('hm-premium-card'))throw new Error('Tailwind premium card utilities were not applied');

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
await ipad.page.locator('[data-action="discussion"][data-tab="comments"]').first().click();
await ipad.page.locator('#comment-input').fill('Honest visual smoke test.');
await ipad.page.locator('[data-action="post-comment"]').click();
await ipad.page.locator('.discussion-tabs [data-action="discussion"][data-tab="scripture"]').click();
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
const desktopShell=await desktop.page.locator('.topbar').boundingBox();
if((desktopShell?.width||0)<1320)throw new Error(`desktop shell too narrow ${desktopShell?.width}`);
const menuButton=desktop.page.locator('[data-action="site-menu"]');
if(await menuButton.count()!==1)throw new Error('desktop site menu action missing');
if(await menuButton.locator('svg path').count()!==2)throw new Error('site menu icon must contain exactly two lines');
await menuButton.hover();
await desktop.page.waitForSelector('.site-menu-popover',{state:'visible'});
const menuText=await desktop.page.locator('.site-menu-popover').innerText();
for(const expected of ['Markets','Leaderboard','Rewards','Help'])if(!menuText.includes(expected))throw new Error(`menu missing ${expected}`);
await desktop.page.locator('.site-menu-popover').hover();
if(!await desktop.page.locator('.site-menu-popover').isVisible())throw new Error('menu should stay open while hovered');
await desktop.page.locator('[data-action="help"]').click();
if(!await desktop.page.locator('.toast').isVisible())throw new Error('help button did not respond');

await desktop.page.goto(`${base}/#/markets`,{waitUntil:'networkidle'});
const desktopCards=desktop.page.locator('.market-card');
const d1=await desktopCards.nth(0).boundingBox();
const d2=await desktopCards.nth(1).boundingBox();
const d3=await desktopCards.nth(2).boundingBox();
const d4=await desktopCards.nth(3).boundingBox();
if(!d1||!d2||!d3||!d4)throw new Error('desktop first market row missing');
if(!(d1.y===d2.y&&d2.y===d3.y&&d3.y===d4.y))throw new Error('desktop markets should render four columns');
if(d1.width<300||d1.width>330)throw new Error(`desktop card width ${d1.width}`);
await desktop.page.locator('[data-action="rewards-info"]').first().click();
if(!await desktop.page.locator('.toast').isVisible())throw new Error('rewards button did not respond');
const unfilteredCount=await desktopCards.count();
await desktop.page.locator('[data-nav-topic="History"]').click();
await desktop.page.waitForURL(/#\/markets/);
await desktop.page.waitForTimeout(150);
if(!await desktop.page.locator('[data-nav-topic="History"].active').count())throw new Error('header History category did not stay active');
const historyCount=await desktop.page.locator('.market-card').count();
if(historyCount<1||historyCount>=unfilteredCount)throw new Error(`History category did not filter markets (${historyCount}/${unfilteredCount})`);
await desktop.page.locator('[data-action="toggle-filters"]').click();
if(!await desktop.page.locator('.filters-popover').isVisible())throw new Error('filter button did not open filters');
await desktop.page.locator('[data-action="bookmarks-only"]').click();
if(!await desktop.page.locator('[data-action="bookmarks-only"].active').count())throw new Error('bookmark-only toggle did not activate');

await desktop.page.goto(`${base}/#/event/david-goliath`,{waitUntil:'networkidle'});
await desktop.page.locator('[data-action="event-info"]').click();
if(!await desktop.page.locator('.toast').isVisible())throw new Error('event info button did not respond');
await desktop.page.locator('[data-action="share-market"]').first().click();
if(!await desktop.page.locator('.toast').isVisible())throw new Error('share button did not respond');
await desktop.page.screenshot({path:`${out}/event-desktop.png`,fullPage:true});
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

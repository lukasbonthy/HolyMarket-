const MARKET_INFO={
  'david-goliath':{labels:['David wins 83¢','Goliath wins 17¢'],volume:'82K',reference:'1 Samuel 17:38–51',rule:'This market resolves from 1 Samuel 17:50–51.',scores:[['13','12'],['5','11']]},
  'lazarus-live':{labels:['Lazarus 51¢','Remains 49¢'],volume:'19K',reference:'John 11:43–44',rule:'This market resolves from John 11:43–44.'},
  'resurrection':{labels:['No 78¢','Yes 22¢'],volume:'18K',reference:'John 20:24–29',rule:'This market resolves from John 20:24–29.'},
  'jericho':{labels:['Israel 82¢','Jericho 18¢'],volume:'514K',reference:'Joshua 6:20',rule:'This market resolves from Joshua 6:20.'},
  'samson':{labels:['Samson 87¢','Philistines 13¢'],volume:'300K',reference:'Judges 16:28–30',rule:'This market resolves from Judges 16:28–30.'},
  'paul-rome':{labels:['Yes 99¢','No 1¢'],volume:'726K',reference:'Acts 28:14–16',rule:'This market resolves from Acts 28:14–16.'},
  'abraham-isaac':{labels:['Yes 14¢','No 86¢'],volume:'1.8M',reference:'Genesis 22:9–13',rule:'This market resolves from Genesis 22:9–13.'},
  'red-sea':{labels:['Yes 95¢','No 5¢'],volume:'962K',reference:'Exodus 14:21–22',rule:'This market resolves from Exodus 14:21–22.'},
  'elijah-fire':{labels:['Yes 93¢','No 7¢'],volume:'542K',reference:'1 Kings 18:36–38',rule:'This market resolves from 1 Kings 18:36–38.'},
  'peter-water':{labels:['Yes 88¢','No 12¢'],volume:'411K',reference:'Matthew 14:28–29',rule:'This market resolves from Matthew 14:28–29.'},
  'jonah':{labels:['Tarshish 91¢','Nineveh 9¢'],volume:'318K',reference:'Jonah 1:1–3',rule:'This market resolves from Jonah 1:1–3.'},
  'good-samaritan':{labels:['Samaritan 93¢','Priest 4¢'],volume:'250K',reference:'Luke 10:30–37',rule:'This market resolves from Luke 10:30–37.'}
};

let activeEventTab='comments';
let currentEvent='';
let ticketView='predict';
const selectedOutcome=new Map();
const scriptureCache=new Map();
let decorateQueued=false;

function route(){
  const h=location.hash||'#/';
  if(h.startsWith('#/markets'))return'markets';
  if(h.startsWith('#/event/'))return'event';
  return'home';
}
function eventId(){return decodeURIComponent(location.hash.split('/')[2]||'david-goliath')}
function info(){return MARKET_INFO[eventId()]||MARKET_INFO['david-goliath']}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function homeExtra(){return `<section class="home-below pm-extra"><div class="home-below-head"><h2>All markets</h2><a href="#/markets">Explore all ›</a></div><div class="below-topic-strip"><span class="active">All</span><span>Jesus</span><span>David</span><span>Gospels</span><span>Torah</span><span>Miracles</span><span>Acts</span></div><div class="home-preview-grid"><a href="#/event/peter-water"><strong>Will Peter walk toward Jesus?</strong><span>88%</span><small>411K Vol.</small></a><a href="#/event/red-sea"><strong>Will the Red Sea divide?</strong><span>95%</span><small>962K Vol.</small></a><a href="#/event/elijah-fire"><strong>Will fire consume Elijah’s offering?</strong><span>93%</span><small>542K Vol.</small></a></div></section>`}
function marketsExtra(){return `<section class="market-longform pm-extra"><div class="long-divider"></div><h2>Frequently Asked Questions</h2><div class="faq-list"><details><summary>What is HolyMarket?</summary><p>HolyMarket is a Scripture prediction learning concept. Community percentages represent virtual picks, and every market resolves from a cited Bible passage.</p></details><details><summary>How do HolyMarket odds work?</summary><p>Percentages show the share of virtual community predictions for each answer. Talents are learning points and have no cash value.</p></details><details><summary>How are Scripture markets resolved?</summary><p>Each market cites the passage used to resolve it. After a prediction is locked, HolyMarket reveals the resolving passage.</p></details><details><summary>Where can I see the Scripture behind a market?</summary><p>Open a market, lock a virtual prediction, then choose Scripture below the chart.</p></details></div><div class="popular-block"><h3>Popular HolyMarket topics</h3><div><a href="#/markets">Jesus</a><a href="#/markets">David</a><a href="#/markets">Moses</a><a href="#/markets">Miracles</a><a href="#/markets">Prophecy</a><a href="#/markets">Acts</a><a href="#/markets">Parables</a></div></div><footer class="site-footer"><strong>HolyMarket</strong><p>Scripture prediction markets for learning. Virtual Talents only.</p><nav><a href="#/">Home</a><a href="#/markets">Markets</a><a href="#/markets">About</a><a href="#/markets">Help</a></nav><small>© 2026 HolyMarket · Talents have no cash value.</small></footer></section>`}

function fixComboButtons(){
  document.querySelectorAll('.combo-button').forEach(el=>{
    if(!el.querySelector('.combo-label')) el.innerHTML='<span class="combo-icon">◫</span><span class="combo-label">Build a combo</span>';
  });
}

function fixScoreboard(){
  if(route()!=='event')return;
  const scores=info().scores;
  if(!scores)return;
  const rows=document.querySelectorAll('.score-line');
  rows.forEach((row,i)=>{
    const cells=row.querySelectorAll(':scope > span');
    if(cells[0])cells[0].textContent=scores[i]?.[0]||cells[0].textContent;
    if(cells[1])cells[1].textContent=scores[i]?.[1]||cells[1].textContent;
  });
}

function renderTicketView(ticket){
  const tabs=ticket.querySelectorAll('.ticket-tabs button');
  if(tabs[0])tabs[0].classList.toggle('active',ticketView==='predict');
  if(tabs[1])tabs[1].classList.toggle('active',ticketView==='review');
  ticket.classList.toggle('runtime-reviewing',ticketView==='review');
  ticket.querySelector('.runtime-review')?.remove();
  if(ticketView==='review'){
    const buttons=ticket.querySelectorAll('.ticket-outcomes button');
    const idx=selectedOutcome.get(eventId())??0;
    const amount=ticket.querySelector('[data-amount-input]')?.value||'0';
    const review=document.createElement('div');
    review.className='runtime-review';
    review.innerHTML=`<div><span>Outcome</span><strong>${esc(buttons[idx]?.textContent||info().labels[idx])}</strong></div><div><span>Stake</span><strong>◈${esc(amount||'0')}</strong></div><div><span>Market</span><strong>${esc(info().reference)}</strong></div>`;
    ticket.querySelector('.trade-button')?.before(review);
  }
}

function fixTickets(){
  if(route()!=='event')return;
  const labels=info().labels;
  const idx=selectedOutcome.get(eventId())??0;
  document.querySelectorAll('.trade-ticket').forEach(ticket=>{
    const buttons=ticket.querySelectorAll('.ticket-outcomes button');
    if(buttons[0]&&buttons[0].textContent!==labels[0])buttons[0].textContent=labels[0];
    if(buttons[1]&&buttons[1].textContent!==labels[1])buttons[1].textContent=labels[1];
    buttons.forEach((b,i)=>b.classList.toggle('active',i===idx));
    renderTicketView(ticket);
  });
}

function runtimeTabHtml(tab,scriptureHtml=''){
  const i=info();
  if(tab==='comments')return `<div class="runtime-tab-content runtime-comments"><div class="runtime-comment"><span class="avatar"></span><div><strong>HolyMarket</strong><p>Lock a prediction, then compare your pick with the cited passage.</p></div></div><div class="runtime-comment"><span class="avatar av1"></span><div><strong>BereanReader</strong><p>The Scripture reference makes the resolution easy to verify.</p></div></div></div>`;
  if(tab==='activity')return `<div class="runtime-tab-content runtime-activity"><div><span>ShepherdKing</span><strong>Placed a virtual prediction</strong><small>◈25 · just now</small></div><div><span>ScriptureDaily</span><strong>Viewed this market</strong><small>3m</small></div><div><span>BereanReader</span><strong>Opened the rules</strong><small>7m</small></div></div>`;
  if(tab==='rules')return `<div class="runtime-tab-content runtime-rules"><h3>Rules</h3><p>${esc(i.rule)}</p><div class="runtime-facts"><div><small>Volume</small><strong>◈ ${esc(i.volume)}</strong></div><div><small>Status</small><strong>Active</strong></div><div><small>Resolution source</small><strong>${esc(i.reference)}</strong></div><div><small>Points</small><strong>Virtual only</strong></div></div></div>`;
  return scriptureHtml||`<div class="runtime-tab-content runtime-locked"><strong>Scripture stays hidden until you predict.</strong><p>Lock a virtual prediction to reveal ${esc(i.reference)} and see how this market resolves.</p></div>`;
}

function renderEventTab(){
  if(route()!=='event')return;
  const below=document.querySelector('.below-event');
  if(!below)return;
  const existing=below.querySelector('.scripture-panel,.scripture-loading');
  if(existing)scriptureCache.set(eventId(),existing.outerHTML);
  const tabs=below.querySelectorAll('.event-tabs button');
  tabs.forEach(btn=>btn.classList.toggle('active',btn.textContent.trim().toLowerCase()===activeEventTab));
  [...below.children].slice(1).forEach(el=>el.remove());
  below.insertAdjacentHTML('beforeend',runtimeTabHtml(activeEventTab,activeEventTab==='scripture'?scriptureCache.get(eventId())||'':''));
}

function decorate(){
  decorateQueued=false;
  const root=document.querySelector('#app');
  if(!root)return;
  const r=route();
  if(r==='event'){
    const id=eventId();
    if(id!==currentEvent){currentEvent=id;activeEventTab='comments';ticketView='predict';selectedOutcome.set(id,0)}
    const coreScripture=root.querySelector('.scripture-panel,.scripture-loading');
    if(coreScripture){scriptureCache.set(id,coreScripture.outerHTML);activeEventTab='scripture'}
  }
  if(!root.querySelector('.pm-extra')){
    if(r==='home')root.querySelector('.home-shell')?.insertAdjacentHTML('beforeend',homeExtra());
    if(r==='markets')root.querySelector('.all-shell')?.insertAdjacentHTML('beforeend',marketsExtra());
  }
  fixComboButtons();
  fixScoreboard();
  fixTickets();
  renderEventTab();
}
function scheduleDecorate(){
  if(decorateQueued)return;
  decorateQueued=true;
  queueMicrotask(decorate);
}

const root=document.querySelector('#app');
if(root)new MutationObserver(scheduleDecorate).observe(root,{childList:true});

document.addEventListener('click',event=>{
  const hero=event.target.closest?.('[data-featured-market]');
  if(hero&&!event.target.closest('a,button')){
    const id=hero.dataset.featuredMarket;
    if(id)location.hash=`#/event/${encodeURIComponent(id)}`;
  }
  const outcome=event.target.closest?.('[data-ticket-outcome]');
  if(outcome){selectedOutcome.set(eventId(),Number(outcome.dataset.ticketOutcome)||0);scheduleDecorate()}
  const tabButton=event.target.closest?.('.event-tabs button');
  if(tabButton){
    const name=tabButton.textContent.trim().toLowerCase();
    if(['comments','activity','scripture','rules'].includes(name)){activeEventTab=name;renderEventTab()}
  }
  const ticketTab=event.target.closest?.('.ticket-tabs button');
  if(ticketTab){
    const name=ticketTab.textContent.trim().toLowerCase();
    if(name==='predict'||name==='review'){ticketView=name;document.querySelectorAll('.trade-ticket').forEach(renderTicketView)}
  }
  scheduleDecorate();
});

document.addEventListener('input',scheduleDecorate);
window.addEventListener('hashchange',()=>{currentEvent='';scheduleDecorate()});
window.addEventListener('pageshow',scheduleDecorate);
requestAnimationFrame(decorate);

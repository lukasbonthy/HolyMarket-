import { markets, featured, marketTopics } from './data.js';
import { filterMarkets, hashRoute, formatPercent, formatNumber } from './core.js';
import { header, notice } from './components/header.js';
import { cardFor } from './components/cards.js';
import { featuredMarket, discoveryRail } from './components/featured.js';
import { ticket } from './components/ticket.js';
import { eventChart } from './components/charts.js';
import { icon, thumb } from './components/icons.js';
import { scriptureReveal } from './components/scripture.js';

const app=document.querySelector('#app');
const state={
 route:hashRoute(location.hash), query:'', topic:'All', featuredIndex:0,
 ticket:{marketId:'david-goliath',outcomeIndex:0,side:'yes',amount:25},
 balance:Number(localStorage.getItem('bb_balance')||2450), predictions:JSON.parse(localStorage.getItem('bb_predictions')||'{}'),
 scripture:{}, mobileTicket:false
};

function marketById(id){ return markets.find(m=>m.id===id)||markets[0]; }
function save(){ localStorage.setItem('bb_balance',String(state.balance)); localStorage.setItem('bb_predictions',JSON.stringify(state.predictions)); }
function sanitize(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function homePage(){
 const f=featured[state.featuredIndex];
 return `${header('home')}${notice()}<main class="home-shell"><div class="home-grid"><div>${featuredMarket(f,state.featuredIndex)}<div class="featured-under"><div class="carousel-dots">${featured.map((_,i)=>`<button class="dot ${i===state.featuredIndex?'active':''}" data-carousel="${i}"></button>`).join('')}</div><div class="feature-pills"><a href="#/markets">‹ Bible stories</a><a href="#/markets">Scripture ›</a></div></div></div>${discoveryRail()}</div><section class="home-market-strip"><h2>Trending markets</h2><div class="compact-grid">${markets.slice(0,3).map(cardFor).join('')}</div></section></main>`;
}

function marketsPage(){
 const visible=filterMarkets(markets,state.query,state.topic);
 return `${header('markets')}<main class="markets-shell"><div class="markets-title-row"><h1>All markets</h1><div class="markets-icons">${icon('search')}${icon('sliders')}${icon('bookmark')}</div></div><div class="market-topic-row">${marketTopics.map(t=>`<button class="market-topic ${state.topic===t?'active':''}" data-topic="${t}">${t}</button>`).join('')}<span>›</span></div><div class="market-toolbar"><label>${icon('search')}<input id="market-search" placeholder="Search" value="${sanitize(state.query)}"></label><button>24hr Volume⌄</button><button class="toolbar-active">All</button><button>Active</button></div><div class="all-grid">${visible.map(cardFor).join('')}</div>${visible.length?'':'<p class="empty">No markets found.</p>'}</main>`;
}

function eventPage(m){
 const [a,b]=m.teams||[{name:m.outcomes[0]?.label||'Yes',abbr:'YES',score:13,probability:m.outcomes[0]?.probability||.6},{name:m.outcomes[1]?.label||'No',abbr:'NO',score:5,probability:1-(m.outcomes[0]?.probability||.6)}];
 const pred=state.predictions[m.id]; const passage=state.scripture[m.id]?.data;
 return `${header('event')}${notice()}<main class="event-shell"><section class="event-main"><div class="event-breadcrumb">${m.category} · ${m.reference.split(':')[0].replace(/\d+$/,'').trim()} · ${m.tag||'Scripture'}</div><div class="event-title-row"><h1>${m.title}</h1><div>${icon('settings')}${icon('code')}${icon('bookmark')}${icon('link')}</div></div><div class="event-meta"><span class="red-dot">●</span> Story 2 of 3 <span>${m.activity}</span></div><div class="scoreboard"><div class="score-head"><span></span><span>V1</span><span class="hot-col">V2</span><span>V3</span><span>ODDS</span></div><div class="score-row">${thumb(m.thumb,'sm')}<strong>${a.name}</strong><span>13</span><span>12</span><span>–</span><b>${formatPercent(a.probability)}</b></div><div class="score-row">${thumb(m.thumb==='david'?'walls':'armor','sm')}<strong>${b.name}</strong><span>5</span><span>11</span><span>–</span><b>${formatPercent(b.probability)}</b></div></div><div class="event-chart-wrap"><div class="event-chart-label label-a"><i></i><span>${a.name}</span><strong>${formatPercent(a.probability)}</strong></div><div class="event-chart-label label-b"><i></i><span>${b.name}</span><strong>${formatPercent(b.probability)}</strong></div>${eventChart()}<div class="chart-time">9:00 AM</div></div><div class="event-tabs"><button class="active">Comments</button><button>Activity</button><button>Scripture</button><button>Rules</button></div>${scriptureReveal(m,pred,passage)}</section><aside class="event-side" data-ticket-host>${ticket(m,state.ticket)}</aside></main><button class="mobile-trade" data-mobile-ticket>Predict</button><div class="mobile-ticket-wrap ${state.mobileTicket?'open':''}" data-mobile-wrap><div class="mobile-backdrop" data-close-ticket></div><div class="mobile-sheet"><button class="sheet-close" data-close-ticket>×</button>${ticket(m,state.ticket)}</div></div>`;
}

function render(){
 state.route=hashRoute(location.hash);
 if(state.route.name==='markets') app.innerHTML=marketsPage();
 else if(state.route.name==='event') { const m=marketById(state.route.id); state.ticket.marketId=m.id; app.innerHTML=eventPage(m); }
 else app.innerHTML=homePage();
 bind();
}

async function fetchScripture(m){
 if(state.scripture[m.id]?.status==='loading'||state.scripture[m.id]?.status==='ready')return;
 state.scripture[m.id]={status:'loading'}; render();
 try{
   let data;
   try{ const r=await fetch(`/api/scripture?ref=${encodeURIComponent(m.reference)}`); if(r.ok)data=await r.json(); }catch{}
   if(!data){ const r=await fetch(`https://bible-api.com/${encodeURIComponent(m.reference)}?translation=web`); if(!r.ok)throw new Error('Scripture unavailable'); const d=await r.json(); data={provider:'web',reference:d.reference||m.reference,content:d.text||'',version_title:'World English Bible',attribution:'World English Bible — public domain'}; }
   state.scripture[m.id]={status:'ready',data};
 }catch(e){ state.scripture[m.id]={status:'error',data:{reference:m.reference,content:'Passage could not be loaded in this environment.',version_title:'Scripture reference',attribution:''}}; }
 render();
}

function lockPrediction(){
 const m=marketById(state.ticket.marketId); if(state.predictions[m.id]) return;
 const amount=Math.max(1,Math.min(Number(state.ticket.amount)||0,state.balance));
 state.balance-=amount; state.predictions[m.id]={amount,side:state.ticket.side,outcomeIndex:state.ticket.outcomeIndex}; save(); fetchScripture(m);
}

function bind(){
 document.querySelectorAll('[data-open-event]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation(); const id=el.dataset.openEvent; if(!id)return; state.ticket.marketId=id; state.ticket.outcomeIndex=Number(el.dataset.index||0); state.ticket.side=el.dataset.side||'yes'; location.hash=`#/event/${encodeURIComponent(id)}`;}));
 document.querySelectorAll('[data-topic]').forEach(el=>el.addEventListener('click',()=>{state.topic=el.dataset.topic; render();}));
 document.querySelector('#market-search')?.addEventListener('input',e=>{state.query=e.target.value; render(); queueMicrotask(()=>{const x=document.querySelector('#market-search');x?.focus();x?.setSelectionRange(state.query.length,state.query.length);});});
 document.querySelectorAll('[data-carousel]').forEach(el=>el.addEventListener('click',()=>{state.featuredIndex=Number(el.dataset.carousel);render();}));
 document.querySelector('[data-featured-market]')?.addEventListener('click',()=>{location.hash=`#/event/${document.querySelector('[data-featured-market]').dataset.featuredMarket}`;});
 document.querySelectorAll('[data-ticket-outcome]').forEach(el=>el.addEventListener('click',()=>{state.ticket.outcomeIndex=Number(el.dataset.ticketOutcome);render();}));
 document.querySelectorAll('[data-amount-input]').forEach(el=>el.addEventListener('input',e=>{state.ticket.amount=Math.max(0,Number(e.target.value)||0);}));
 document.querySelectorAll('[data-add]').forEach(el=>el.addEventListener('click',()=>{state.ticket.amount=Math.min(state.balance,state.ticket.amount+Number(el.dataset.add));render();}));
 document.querySelector('[data-max]')?.addEventListener('click',()=>{state.ticket.amount=state.balance;render();});
 document.querySelectorAll('[data-lock]').forEach(el=>el.addEventListener('click',lockPrediction));
 document.querySelector('[data-mobile-ticket]')?.addEventListener('click',()=>{state.mobileTicket=true;render();});
 document.querySelectorAll('[data-close-ticket]').forEach(el=>el.addEventListener('click',()=>{state.mobileTicket=false;render();}));
 document.querySelector('#global-search')?.addEventListener('keydown',e=>{if(e.key==='Enter'){state.query=e.target.value;location.hash='#/markets';}});
}

window.addEventListener('hashchange',render);
window.addEventListener('keydown',e=>{if(e.key==='/'&&!/input|textarea/i.test(document.activeElement?.tagName||'')){e.preventDefault();document.querySelector('#global-search')?.focus();}});
setInterval(()=>{
 if(state.route.name==='home') { state.featuredIndex=(state.featuredIndex+1)%featured.length; render(); }
 const live=document.querySelector('[data-live-percent]'); if(live){ const n=48+Math.floor(Math.random()*8); live.textContent=`${n}%`; live.classList.add('tick'); setTimeout(()=>live.classList.remove('tick'),400); }
},6000);
render();

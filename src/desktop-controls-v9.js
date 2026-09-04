const appRoot=document.querySelector('#app');
let menuCloseTimer=null;
let filtersOpen=false;
let bookmarksOnly=false;
let activeNavTopic='';
const clientFilters={matchups:false,live:false,resolved:false};

function controlToast(message){
  document.querySelector('.control-toast')?.remove();
  const el=document.createElement('div');
  el.className='toast control-toast';
  el.textContent=message;
  document.body.append(el);
  setTimeout(()=>el.remove(),2200);
}

function menuMarkup(){return`<div class="menu-section"><span class="menu-section-title">HolyMarket</span><div class="menu-grid"><a href="#/markets">Markets</a><a href="#/leaderboard">Leaderboard</a><a href="#/profile">Rewards</a><a href="#/profile">Activity</a></div></div><div class="menu-section"><span class="menu-section-title">Support & learn</span><button data-menu-action="learn">Learn</button><button data-menu-action="help">Help</button><button data-menu-action="integrity">Market integrity</button></div><div class="menu-foot"><a href="#/markets">Terms</a><a href="#/markets">Privacy</a><a href="#/markets">Docs</a></div>`}

function ensureMenu(){
  let menu=document.querySelector('.site-menu-popover');
  if(!menu){
    menu=document.createElement('div');
    menu.className='site-menu-popover';
    menu.setAttribute('role','menu');
    menu.innerHTML=menuMarkup();
    document.body.append(menu);
    menu.addEventListener('pointerenter',()=>clearTimeout(menuCloseTimer));
    menu.addEventListener('pointerleave',scheduleMenuClose);
  }
  return menu;
}

function showMenu(button=document.querySelector('[data-action="site-menu"]')){
  if(!button)return;
  const menu=ensureMenu();
  clearTimeout(menuCloseTimer);
  const r=button.getBoundingClientRect();
  const width=310;
  menu.style.left=`${Math.max(10,Math.min(innerWidth-width-10,r.right-width))}px`;
  menu.style.top=`${Math.min(innerHeight-20,r.bottom+8)}px`;
  menu.classList.add('open');
  button.setAttribute('aria-expanded','true');
}
function hideMenu(){
  document.querySelector('.site-menu-popover')?.classList.remove('open');
  document.querySelector('[data-action="site-menu"]')?.setAttribute('aria-expanded','false');
}
function scheduleMenuClose(){clearTimeout(menuCloseTimer);menuCloseTimer=setTimeout(hideMenu,140)}

function ensureFilters(){
  const controls=document.querySelector('.market-controls');
  if(!controls)return null;
  let panel=document.querySelector('.filters-popover');
  if(!panel){
    panel=document.createElement('div');
    panel.className='filters-popover';
    panel.innerHTML=`<label><input type="checkbox" data-client-filter="matchups">Hide matchups</label><label><input type="checkbox" data-client-filter="live">Hide live</label><label><input type="checkbox" data-client-filter="resolved">Hide resolved</label>`;
    controls.insertAdjacentElement('afterend',panel);
  }
  panel.classList.toggle('open',filtersOpen);
  panel.querySelector('[data-client-filter="matchups"]').checked=clientFilters.matchups;
  panel.querySelector('[data-client-filter="live"]').checked=clientFilters.live;
  panel.querySelector('[data-client-filter="resolved"]').checked=clientFilters.resolved;
  return panel;
}

function applyClientFilters(){
  document.querySelectorAll('.market-grid .market-card').forEach(card=>{
    const hide=(clientFilters.matchups&&card.classList.contains('matchup-card'))||(clientFilters.live&&card.classList.contains('live-card'))||(clientFilters.resolved&&card.classList.contains('resolved-card'))||(bookmarksOnly&&!card.querySelector('.card-bookmark.active'));
    card.classList.toggle('control-hidden',Boolean(hide));
  });
  document.querySelector('[data-action="bookmarks-only"]')?.classList.toggle('active',bookmarksOnly);
}

function hydrateControls(){
  const menuButton=document.querySelector('button[aria-label="Menu"]');
  if(menuButton){
    menuButton.dataset.action='site-menu';
    menuButton.classList.add('site-menu-toggle');
    menuButton.setAttribute('aria-haspopup','menu');
    menuButton.setAttribute('aria-expanded',document.querySelector('.site-menu-popover.open')?'true':'false');
    menuButton.innerHTML='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16"/><path d="M4 16h16"/></svg>';
  }
  const help=document.querySelector('button[aria-label="Help"]');
  if(help)help.dataset.action='help';

  document.querySelectorAll('[data-nav-topic]').forEach(link=>{
    if(activeNavTopic)link.classList.toggle('active',link.dataset.navTopic===activeNavTopic);
  });

  const titleButtons=document.querySelectorAll('.markets-title>div>button');
  if(titleButtons[1]){titleButtons[1].dataset.action='toggle-filters';titleButtons[1].setAttribute('aria-label','Filters')}
  if(titleButtons[2]){titleButtons[2].dataset.action='bookmarks-only';titleButtons[2].setAttribute('aria-label','Bookmarked markets')}

  document.querySelectorAll('.card-gift').forEach(btn=>btn.dataset.action='rewards-info');
  document.querySelectorAll('.featured-icons button:nth-child(2)').forEach(btn=>btn.dataset.action='share-market');
  const eventButtons=document.querySelectorAll('.event-actions>button');
  if(eventButtons[0])eventButtons[0].dataset.action='event-info';
  if(eventButtons[2])eventButtons[2].dataset.action='share-market';

  ensureFilters();
  applyClientFilters();
}

function dispatchMarketSearch(value){
  const input=document.querySelector('#market-search');
  if(!input)return false;
  input.value=value;
  input.dispatchEvent(new Event('input',{bubbles:true}));
  return true;
}

function activateHeaderTopic(topic){
  activeNavTopic=topic;
  const broad={Trending:'All',Combos:'All',Breaking:'All',New:'All'};
  const directTopic=broad[topic]||topic;
  const direct=document.querySelector(`[data-action="topic"][data-topic="${CSS.escape(directTopic)}"]`);
  if(direct){
    dispatchMarketSearch('');
    queueMicrotask(()=>document.querySelector(`[data-action="topic"][data-topic="${CSS.escape(directTopic)}"]`)?.click());
    return;
  }
  dispatchMarketSearch(topic==='Letters'?'Paul':topic);
}

if(appRoot){
  new MutationObserver(()=>queueMicrotask(hydrateControls)).observe(appRoot,{childList:true});
}
queueMicrotask(hydrateControls);
setTimeout(hydrateControls,0);

document.addEventListener('pointerover',e=>{
  const btn=e.target.closest?.('[data-action="site-menu"]');
  if(btn)showMenu(btn);
});
document.addEventListener('pointerout',e=>{
  const btn=e.target.closest?.('[data-action="site-menu"]');
  if(btn&&!e.relatedTarget?.closest?.('.site-menu-popover'))scheduleMenuClose();
});

document.addEventListener('click',async e=>{
  const menuAction=e.target.closest?.('[data-menu-action]')?.dataset.menuAction;
  if(menuAction){
    if(menuAction==='help')controlToast('Help: choose honestly, lock your prediction, then reveal Scripture.');
    else if(menuAction==='learn')controlToast('HolyMarket uses virtual Talents only. No cash value.');
    else controlToast('Fair-play review protects honest Scripture predictions.');
    hideMenu();
    return;
  }

  const nav=e.target.closest?.('[data-nav-topic]');
  if(nav){
    e.preventDefault();
    const topic=nav.dataset.navTopic||'All';
    activeNavTopic=topic;
    if(location.hash!=='#/markets')location.hash='#/markets';
    setTimeout(()=>{hydrateControls();activateHeaderTopic(topic)},0);
    return;
  }

  const el=e.target.closest?.('[data-action]');
  if(!el)return;
  switch(el.dataset.action){
    case 'site-menu':
      e.preventDefault();e.stopPropagation();
      document.querySelector('.site-menu-popover.open')?hideMenu():showMenu(el);
      break;
    case 'help':
      e.preventDefault();e.stopPropagation();
      controlToast('Choose honestly, lock your prediction, then reveal the cited Scripture.');
      break;
    case 'event-info':
      e.preventDefault();e.stopPropagation();
      controlToast('Percentages show simulated community confidence. Talents have no cash value.');
      break;
    case 'share-market':
      e.preventDefault();e.stopPropagation();
      controlToast('Market link copied');
      try{await navigator.clipboard?.writeText(location.href)}catch{}
      break;
    case 'rewards-info':
      e.preventDefault();e.stopPropagation();
      controlToast('Rewards use virtual Talents and learning streaks only.');
      break;
    case 'toggle-filters':
      e.preventDefault();e.stopPropagation();
      filtersOpen=!filtersOpen;ensureFilters();
      break;
    case 'bookmarks-only':
      e.preventDefault();e.stopPropagation();
      bookmarksOnly=!bookmarksOnly;applyClientFilters();
      break;
  }
});

document.addEventListener('change',e=>{
  const type=e.target?.dataset?.clientFilter;
  if(!type)return;
  clientFilters[type]=Boolean(e.target.checked);
  applyClientFilters();
});

document.addEventListener('click',e=>{
  if(!e.target.closest?.('[data-action="site-menu"]')&&!e.target.closest?.('.site-menu-popover'))hideMenu();
});
window.addEventListener('resize',()=>{if(document.querySelector('.site-menu-popover.open'))showMenu()});
window.addEventListener('hashchange',()=>setTimeout(hydrateControls,0));

const root=document.querySelector('#app');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer=window.matchMedia('(pointer: fine)');
const boundCards=new WeakSet();
const lastNumberText=new WeakMap();
let queued=false;
let pendingBookmarkMarket='';

function motionAllowed(){return !reduceMotion.matches}

function restartClass(el,name){
  if(!el||!motionAllowed())return;
  el.classList.remove(name);
  void el.offsetWidth;
  el.classList.add(name);
}

function bindCard(card){
  if(boundCards.has(card))return;
  boundCards.add(card);
  card.addEventListener('pointermove',event=>{
    if(!motionAllowed()||!finePointer.matches)return;
    const rect=card.getBoundingClientRect();
    const px=Math.min(1,Math.max(0,(event.clientX-rect.left)/rect.width));
    const py=Math.min(1,Math.max(0,(event.clientY-rect.top)/rect.height));
    const tiltY=(px-.5)*3.2;
    const tiltX=(.5-py)*2.4;
    card.style.setProperty('--hm-pointer-x',`${(px*100).toFixed(1)}%`);
    card.style.setProperty('--hm-pointer-y',`${(py*100).toFixed(1)}%`);
    card.style.setProperty('--hm-tilt-x',`${tiltX.toFixed(2)}deg`);
    card.style.setProperty('--hm-tilt-y',`${tiltY.toFixed(2)}deg`);
    card.classList.add('hm-card-tilt');
  },{passive:true});
  card.addEventListener('pointerleave',()=>{
    card.style.setProperty('--hm-tilt-x','0deg');
    card.style.setProperty('--hm-tilt-y','0deg');
    card.style.setProperty('--hm-pointer-x','50%');
    card.style.setProperty('--hm-pointer-y','0%');
    card.classList.remove('hm-card-tilt');
  },{passive:true});
}

function decorateCards(){
  document.querySelectorAll('.market-card,.featured-panel').forEach(bindCard);
}

function decorateScripture(){
  document.querySelectorAll('.scripture-reveal:not(.hm-scripture-reveal)').forEach(el=>el.classList.add('hm-scripture-reveal'));
}

function decorateFeatured(){
  document.querySelectorAll('.featured-panel:not([data-hm-motion])').forEach(el=>{
    el.dataset.hmMotion='1';
    el.classList.add('hm-featured-swap');
  });
}

function decorateActiveTabs(){
  document.querySelectorAll('.discussion-tabs .active,.section-tabs .active,.ticket-tabs .active,.ticket-mode .active').forEach(el=>{
    if(el.dataset.hmTabActive==='1')return;
    el.parentElement?.querySelectorAll('[data-hm-tab-active="1"]').forEach(old=>{old.dataset.hmTabActive='0'});
    el.dataset.hmTabActive='1';
    restartClass(el,'hm-tab-shift');
  });
}

function decorateNumbers(){
  const selectors=['.gauge b','.probability-big','.account-balance','.balance-value','.market-percent','.outcome-pct','.ticket-balance'];
  document.querySelectorAll(selectors.join(',')).forEach(el=>{
    const text=(el.textContent||'').trim();
    if(!text)return;
    const previous=lastNumberText.get(el);
    if(previous!==undefined&&previous!==text)restartClass(el,'hm-number-tick');
    lastNumberText.set(el,text);
  });
}

function decoratePendingBookmark(){
  if(!pendingBookmarkMarket)return;
  const selector=`[data-action="bookmark"][data-market="${CSS.escape(pendingBookmarkMarket)}"]`;
  const current=document.querySelector(selector);
  if(!current)return;
  restartClass(current,'hm-bookmark-pop');
  pendingBookmarkMarket='';
}

function decorate(){
  decorateCards();
  decorateScripture();
  decorateFeatured();
  decorateActiveTabs();
  decorateNumbers();
  decoratePendingBookmark();
}

function schedule(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;decorate()});
}

function pressWave(target,event){
  if(!motionAllowed())return;
  const el=target.closest('button,.trade-button,.signup-btn,.login-btn,.market-card,[role="button"]');
  if(!el)return;
  const rect=el.getBoundingClientRect();
  el.style.setProperty('--hm-press-x',`${event.clientX-rect.left}px`);
  el.style.setProperty('--hm-press-y',`${event.clientY-rect.top}px`);
  restartClass(el,'hm-press-wave');
}

document.addEventListener('pointerdown',event=>pressWave(event.target,event),{passive:true});

document.addEventListener('click',event=>{
  const bookmark=event.target.closest('[data-action="bookmark"],.card-bookmark');
  if(!bookmark)return;
  pendingBookmarkMarket=bookmark.dataset.market||'';
  restartClass(bookmark,'hm-bookmark-pop');
},true);

document.addEventListener('focusin',event=>{
  const search=event.target.closest('.global-search');
  if(search)search.classList.add('hm-search-focus');
});
document.addEventListener('focusout',event=>{
  const search=event.target.closest('.global-search');
  if(search&&!search.contains(event.relatedTarget))search.classList.remove('hm-search-focus');
});

// Progressive same-document transitions for plain hash links. App-owned data-action
// controls keep their existing navigation path and receive the CSS route fallback.
document.addEventListener('click',event=>{
  if(event.defaultPrevented||!motionAllowed()||!document.startViewTransition)return;
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest('a[href^="#/"]:not([data-action])');
  if(!link)return;
  const href=link.getAttribute('href');
  if(!href||href===location.hash)return;
  event.preventDefault();
  document.documentElement.classList.add('hm-view-transitioning');
  const transition=document.startViewTransition(()=>{location.hash=href});
  transition.finished.finally(()=>document.documentElement.classList.remove('hm-view-transitioning'));
},true);

window.addEventListener('hashchange',()=>{
  if(!motionAllowed())return;
  const main=document.querySelector('main');
  restartClass(main,'hm-v11-route-new');
  schedule();
});

reduceMotion.addEventListener?.('change',()=>{
  document.documentElement.classList.toggle('hm-reduce-motion',reduceMotion.matches);
  if(reduceMotion.matches)document.querySelectorAll('.hm-card-tilt').forEach(el=>el.classList.remove('hm-card-tilt'));
});

if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true,characterData:true});
queueMicrotask(schedule);

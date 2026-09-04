const appRoot=document.querySelector('#app');
const leaderboardRoot=document.createElement('div');
leaderboardRoot.id='leaderboard-v13-root';
document.body.append(leaderboardRoot);

const boardState={loading:false,ready:false,leaders:[],highestStreak:null,query:'',user:null};
let streakAnnouncement=null;
let announcementTimer=null;
let decorateQueued=false;

function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]||ch))}
function isLeaderboardRoute(){return location.hash==='#/leaderboard'||location.hash.startsWith('#/leaderboard?')}
function accuracy(value){const n=Math.max(0,Math.min(100,Number(value)||0));return `${Number.isInteger(n)?n:n.toFixed(1)}%`}
function avatar(user,large=false){return`<span class="leader-avatar ${large?'large':''}">${esc(user?.avatar||user?.username?.[0]||'H')}</span>`}
function logo(){return`<svg class="leader-logo" viewBox="0 0 36 36" aria-hidden="true"><path d="M4 9 18 3v30L4 27z"/><path d="M18 3 32 9v18l-14 6"/><path d="M9 12 18 8v20l-9-4z"/></svg>`}

async function getJSON(url){
  const response=await fetch(url,{credentials:'same-origin'});
  if(!response.ok)throw new Error(`Request failed (${response.status})`);
  return response.json();
}

async function refreshCurrentUser(){
  try{const data=await getJSON('/api/auth/me');boardState.user=data.user||null}catch{boardState.user=null}
  scheduleDecorate();
}

function announcementKey(top){return top?`${top.id||top.username}:${top.streak}`:''}
function showHighestStreak(top){
  if(!top||Number(top.streak)<=0)return;
  const key=announcementKey(top);
  try{
    if(sessionStorage.getItem('hm.v13.highest-streak')===key)return;
    sessionStorage.setItem('hm.v13.highest-streak',key);
  }catch{}
  streakAnnouncement={key,text:`${top.username} has the highest streak of: ${top.streak} 🔥`};
  clearTimeout(announcementTimer);
  document.querySelector('.streak-announcement')?.remove();
  const el=document.createElement('div');
  el.className='streak-announcement';
  el.setAttribute('role','status');
  el.innerHTML=`<span class="streak-fire">🔥</span><span>${esc(streakAnnouncement.text)}</span>`;
  document.body.append(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  announcementTimer=setTimeout(()=>{
    if(streakAnnouncement?.key!==key)return;
    el.classList.remove('show');
    setTimeout(()=>el.remove(),260);
    streakAnnouncement=null;
  },4200);
}

async function loadLeaderboard({announce=false}={}){
  if(boardState.loading)return;
  boardState.loading=true;
  if(isLeaderboardRoute())renderLeaderboard();
  try{
    const data=await getJSON('/api/leaderboard?limit=100');
    boardState.leaders=Array.isArray(data.leaders)?data.leaders:[];
    boardState.highestStreak=data.highestStreak||null;
    boardState.ready=true;
    if(announce)showHighestStreak(boardState.highestStreak);
  }catch{
    boardState.ready=true;
  }finally{
    boardState.loading=false;
    if(isLeaderboardRoute())renderLeaderboard();
  }
}

function podiumCard(row,index){
  if(!row)return'';
  const medals=['🥇','🥈','🥉'];
  return`<article class="podium-card place-${index+1} ${row.id===boardState.user?.id?'is-me':''}"><div class="podium-rank">${medals[index]}</div>${avatar(row,true)}<b>${esc(row.username)}</b><strong>🔥 ${row.bestStreak}</strong><span>Best streak</span><small>${accuracy(row.accuracy)} accuracy · ${row.predictions} predictions</small></article>`;
}

function leaderboardRow(row){
  return`<div class="leaderboard-row ${row.id===boardState.user?.id?'is-me':''}">
    <div class="leaderboard-rank">${row.rank}</div>
    <div class="leaderboard-user">${avatar(row)}<div><b>${esc(row.username)}</b>${row.id===boardState.user?.id?'<small>You</small>':''}</div></div>
    <div class="leaderboard-best"><b>🔥 ${row.bestStreak}</b><small>best</small></div>
    <div><b>${row.currentStreak}</b><small>current</small></div>
    <div><b>${accuracy(row.accuracy)}</b><small>${row.correctAnswers}/${row.resolvedAnswers} correct</small></div>
    <div><b>${row.predictions}</b><small>predictions</small></div>
  </div>`;
}

function renderLeaderboard(){
  if(!isLeaderboardRoute())return;
  document.documentElement.classList.add('v13-leaderboard-open');
  leaderboardRoot.classList.add('active');
  const q=boardState.query.trim().toLowerCase();
  const shown=boardState.leaders.filter(row=>!q||String(row.username).toLowerCase().includes(q));
  const top=boardState.leaders.slice(0,3);
  leaderboardRoot.innerHTML=`
    <div class="leaderboard-screen">
      <header class="leaderboard-site-header">
        <div class="leaderboard-topbar leaderboard-shell">
          <a class="leaderboard-brand" href="#/">${logo()}<span>HolyMarket</span></a>
          <label class="leaderboard-global-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg><input id="leaderboard-global-search" placeholder="Search leaderboard" value="${esc(boardState.query)}"></label>
          <nav><a href="#/markets">Markets</a><a class="active" href="#/leaderboard">Leaderboard</a><a href="#/profile">Profile</a></nav>
          <div class="leaderboard-account">${boardState.user?`${avatar(boardState.user)}<span>${esc(boardState.user.username)}</span>`:`<a href="#/">Log in</a>`}</div>
        </div>
      </header>
      <main class="leaderboard-page leaderboard-shell">
        <div class="leaderboard-heading"><div><h1>Leaderboard</h1><p>Longest honest Bible-answer streaks on HolyMarket.</p></div>${boardState.highestStreak?`<div class="record-chip"><span>🔥</span><div><small>Highest streak</small><b>${esc(boardState.highestStreak.username)} · ${boardState.highestStreak.streak}</b></div></div>`:''}</div>
        <div class="leaderboard-toolbar"><div class="leaderboard-tabs"><button class="active">Predictions</button><button>All time</button><button>All categories</button></div><label class="leaderboard-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg><input id="leaderboard-search" placeholder="Search" value="${esc(boardState.query)}"></label></div>
        ${boardState.loading&&!boardState.ready?`<div class="leaderboard-loading"><span></span><span></span><span></span></div>`:boardState.leaders.length?`
          <section class="leaderboard-podium">${top.map(podiumCard).join('')}</section>
          <section class="leaderboard-table"><div class="leaderboard-row leaderboard-header"><div>Rank</div><div>User</div><div>Streak</div><div>Current</div><div>Accuracy</div><div>Predictions</div></div>${shown.map(leaderboardRow).join('')}${shown.length?'':'<div class="leaderboard-empty">No users match that search.</div>'}</section>
        `:`<div class="leaderboard-empty large"><span>🔥</span><h2>No streaks yet</h2><p>Lock honest Bible predictions to become the first streak leader.</p><a href="#/markets">Explore markets</a></div>`}
      </main>
      <footer class="leaderboard-footer leaderboard-shell"><span>HolyMarket © 2026</span><span>Virtual Talents only · No cash value</span></footer>
    </div>`;
}

function closeLeaderboard(){
  document.documentElement.classList.remove('v13-leaderboard-open');
  leaderboardRoot.classList.remove('active');
  leaderboardRoot.innerHTML='';
}

function syncRoute(){
  if(isLeaderboardRoute()){
    renderLeaderboard();
    if(!boardState.ready&&!boardState.loading)loadLeaderboard();
    refreshCurrentUser().then(()=>{if(isLeaderboardRoute())renderLeaderboard()});
  }else closeLeaderboard();
  scheduleDecorate();
}

function decorateChrome(){
  const rail=document.querySelector('.category-scroll');
  if(rail&&!rail.querySelector('.v13-leaderboard-link')){
    const link=document.createElement('a');
    link.className='category-link v13-leaderboard-link';
    link.href='#/leaderboard';
    link.textContent='Leaderboard';
    rail.insertBefore(link,rail.querySelector('.category-next'));
  }
  document.querySelectorAll('.site-footer span').forEach(span=>{
    if(span.textContent.trim()!=='Leaderboard')return;
    const link=document.createElement('a');link.href='#/leaderboard';link.textContent='Leaderboard';span.replaceWith(link);
  });
  const accountMenu=document.querySelector('.account-menu');
  if(accountMenu&&!accountMenu.querySelector('.v13-account-leaderboard')){
    const link=document.createElement('a');link.className='v13-account-leaderboard';link.href='#/leaderboard';link.textContent='Leaderboard';
    accountMenu.insertBefore(link,accountMenu.querySelector('[data-action="logout"]'));
  }
}

function decorateProfile(){
  if(location.hash!=='#/profile'||!boardState.user)return;
  const stats=document.querySelector('.profile-stats');
  if(stats&&!document.querySelector('.profile-streak-v13')){
    const streak=boardState.user.streak||{current:0,best:0,correct:0,resolved:0};
    const pct=streak.resolved?Math.round(streak.correct/streak.resolved*100):0;
    const extra=document.createElement('div');
    extra.className='profile-streak-v13';
    extra.innerHTML=`<div><small>Current streak</small><b>🔥 ${streak.current||0}</b></div><div><small>Best streak</small><b>${streak.best||0}</b></div><div><small>Accuracy</small><b>${pct}%</b></div>`;
    stats.insertAdjacentElement('afterend',extra);
  }
  const predictions=boardState.user.predictions||[];
  document.querySelectorAll('.profile-row[href^="#/event/"]').forEach(row=>{
    if(row.querySelector('.prediction-result'))return;
    const id=decodeURIComponent((row.getAttribute('href')||'').split('/')[2]||'');
    const prediction=predictions.find(p=>p.marketId===id);
    if(!prediction||prediction.correct===null||prediction.correct===undefined)return;
    const badge=document.createElement('span');
    badge.className=`prediction-result ${prediction.correct?'correct':'wrong'}`;
    badge.textContent=prediction.correct?'✓ Correct':'✕ Miss';
    row.append(badge);
  });
}

function decorateApp(){
  decorateQueued=false;
  if(isLeaderboardRoute())return;
  decorateChrome();
  decorateProfile();
}
function scheduleDecorate(){
  if(decorateQueued)return;
  decorateQueued=true;
  requestAnimationFrame(decorateApp);
}

if(appRoot)new MutationObserver(scheduleDecorate).observe(appRoot,{childList:true});
window.addEventListener('hashchange',syncRoute);

document.addEventListener('input',event=>{
  if(event.target.id!=='leaderboard-search'&&event.target.id!=='leaderboard-global-search')return;
  boardState.query=event.target.value;
  renderLeaderboard();
  queueMicrotask(()=>{
    const input=document.querySelector(`#${event.target.id}`);
    input?.focus();
    input?.setSelectionRange(boardState.query.length,boardState.query.length);
  });
});

document.addEventListener('click',event=>{
  const leaderboardText=event.target.closest?.('.site-footer span');
  if(leaderboardText?.textContent?.trim()==='Leaderboard'){event.preventDefault();location.hash='#/leaderboard';return}
  if(event.target.closest?.('[data-action="lock-prediction"]')){
    setTimeout(async()=>{
      await refreshCurrentUser();
      await loadLeaderboard({announce:true});
    },700);
  }
});

queueMicrotask(()=>{
  scheduleDecorate();
  refreshCurrentUser();
  loadLeaderboard({announce:true});
  syncRoute();
});

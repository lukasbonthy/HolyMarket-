const app=document.querySelector('#app');

const OATH_TEXT='With my hand on a Bible if I have one, I solemnly affirm before God that the answers I choose on HolyMarket will come from my own honest knowledge and reasoning. I will not look up the resolving verse, use answer keys, search engines, AI, or another person to discover an answer before locking my prediction. I understand HolyMarket is for learning Scripture in truth, not for pretending to know what I do not know.';

const markets=[
{id:'david-goliath',type:'multi',category:'History',sub:'1 Samuel',reference:'1 Samuel 17:38–51',title:'Will David defeat Goliath?',volume:'82K',period:'Monthly',image:'david',outcomes:[['David wins',.83],['Goliath wins',.17]],rule:'Resolves Yes for David if 1 Samuel 17 records David defeating Goliath.',context:'David enters the confrontation after hearing Goliath challenge Israel. The resolving passage is hidden until a prediction is locked.',scores:[['13','12'],['5','11']]},
{id:'lazarus',type:'live',category:'Gospels',sub:'John',reference:'John 11:43–44',title:'Lazarus: comes out or stays in the tomb?',volume:'19K',period:'Live',image:'lazarus',outcomes:[['Comes out',.51],['Stays in',.49]],rule:'Resolves from John 11:43–44.',context:'Jesus has arrived at Lazarus’s tomb and called for the stone to be removed.'},
{id:'thomas',type:'multi',category:'Gospels',sub:'John',reference:'John 20:24–29',title:'Will Thomas believe before seeing Jesus?',volume:'18K',period:'Weekly',image:'tomb',outcomes:[['No',.78],['Yes',.22]],rule:'Resolves from John 20:24–29.',context:'Thomas has heard the disciples say they saw the risen Jesus.'},
{id:'jericho',type:'matchup',category:'History',sub:'Joshua',reference:'Joshua 6:20',title:'Israel — Jericho',volume:'514K',period:'Story 2',image:'walls',outcomes:[['Israel',.82],['Jericho',.18]],teams:[['Israel',1,.82],['Jericho',0,.18]],scores:[['13','12'],['5','11']],stage:'STORY 2',rule:'Resolves from Joshua 6:20.',context:'Israel has marched around Jericho according to the command given to Joshua.'},
{id:'samson',type:'matchup',category:'History',sub:'Judges',reference:'Judges 16:28–30',title:'Samson — Philistines',volume:'300K',period:'Story 2',image:'samson',outcomes:[['Samson',.87],['Philistines',.13]],teams:[['Samson',1,.87],['Philistines',0,.13]],scores:[['12','13'],['11','5']],stage:'STORY 2',rule:'Resolves from Judges 16:28–30.',context:'Samson has been brought into the Philistine gathering and stands between the pillars.'},
{id:'paul-rome',type:'multi',category:'Acts',sub:'Paul',reference:'Acts 28:14–16',title:'Will Paul eventually reach Rome?',volume:'726K',period:'Monthly',image:'paul',outcomes:[['Yes',.99],['No',.01]],rule:'Resolves from Acts 28:14–16.',context:'Paul has appealed to Caesar and is traveling under guard.'},
{id:'abraham',type:'binary',category:'Torah',sub:'Genesis',reference:'Genesis 22:9–13',title:'Will Abraham ultimately sacrifice Isaac?',volume:'1.8M',period:'Monthly',image:'mountain',outcomes:[['Yes',.14],['No',.86]],rule:'Resolves from Genesis 22:9–13.',context:'Abraham and Isaac have reached the place God showed him.'},
{id:'red-sea',type:'multi',category:'Torah',sub:'Exodus',reference:'Exodus 14:21–22',title:'What happens at the Red Sea?',volume:'962K',period:'Monthly',image:'sea',outcomes:[['Sea divides',.95],['Israel turns back',.03],['Egypt wins',.02]],rule:'Resolves from Exodus 14:21–22.',context:'Israel is trapped between the sea and Pharaoh’s approaching army.'},
{id:'elijah',type:'binary',category:'Prophets',sub:'1 Kings',reference:'1 Kings 18:36–38',title:'Will fire consume Elijah’s offering?',volume:'542K',period:'Weekly',image:'fire',outcomes:[['Yes',.93],['No',.07]],rule:'Resolves from 1 Kings 18:36–38.',context:'Elijah has prepared the altar on Mount Carmel and prayed before Israel.'},
{id:'peter-water',type:'binary',category:'Miracles',sub:'Matthew',reference:'Matthew 14:28–31',title:'Will Peter keep walking on the water?',volume:'411K',period:'Daily',image:'water',outcomes:[['Yes',.31],['No',.69]],rule:'Resolves from Matthew 14:28–31.',context:'Peter has stepped out of the boat toward Jesus.'},
{id:'jonah',type:'multi',category:'Prophets',sub:'Jonah',reference:'Jonah 1:1–3',title:'Where does Jonah go after God tells him to go to Nineveh?',volume:'318K',period:'Weekly',image:'ship',outcomes:[['Tarshish',.91],['Nineveh',.09]],rule:'Resolves from Jonah 1:1–3.',context:'The word of the Lord has come to Jonah with a command to go to Nineveh.'},
{id:'samaritan',type:'multi',category:'Parables',sub:'Luke',reference:'Luke 10:30–37',title:'Who stops to help the wounded man?',volume:'250K',period:'Weekly',image:'road',outcomes:[['A Samaritan',.93],['A priest',.04],['A Levite',.03]],rule:'Resolves from Luke 10:30–37.',context:'Jesus is answering the question, “Who is my neighbor?”'},
{id:'joseph-egypt',type:'multi',category:'Torah',sub:'Genesis',reference:'Genesis 41:39–43',title:'What position will Pharaoh give Joseph?',volume:'206K',period:'Monthly',image:'crown',outcomes:[['Second in command',.88],['Prison keeper',.07],['Army captain',.05]],rule:'Resolves from Genesis 41:39–43.',context:'Joseph has interpreted Pharaoh’s dreams and proposed a plan for the famine.'},
{id:'daniel-lions',type:'binary',category:'Prophets',sub:'Daniel',reference:'Daniel 6:19–23',title:'Will Daniel survive the lions’ den?',volume:'671K',period:'Monthly',image:'lion',outcomes:[['Yes',.96],['No',.04]],rule:'Resolves from Daniel 6:19–23.',context:'Daniel has spent the night in the den after continuing to pray to God.'},
{id:'pentecost',type:'multi',category:'Acts',sub:'Acts',reference:'Acts 2:1–4',title:'What happens when Pentecost arrives?',volume:'383K',period:'Monthly',image:'flame',outcomes:[['Spirit fills them',.94],['They scatter',.04],['Nothing happens',.02]],rule:'Resolves from Acts 2:1–4.',context:'The disciples are together in one place on the day of Pentecost.'},
{id:'empty-tomb',type:'binary',category:'Gospels',sub:'Luke',reference:'Luke 24:1–6',title:'Will the women find Jesus in the tomb?',volume:'1.2M',period:'Monthly',image:'tomb',outcomes:[['Yes',.08],['No',.92]],rule:'Resolves from Luke 24:1–6.',context:'The women arrive early with spices after the Sabbath.'},
{id:'noah-rain',type:'binary',category:'Torah',sub:'Genesis',reference:'Genesis 7:10–12',title:'Will the flood begin after Noah enters the ark?',volume:'299K',period:'Weekly',image:'ark',outcomes:[['Yes',.91],['No',.09]],rule:'Resolves from Genesis 7:10–12.',context:'Noah, his family, and the animals have entered the ark.'},
{id:'white-horse',type:'resolved',category:'Revelation',sub:'Revelation',reference:'Revelation 19:11–16',title:'Who rides the white horse?',volume:'144K',period:'Resolved',image:'horse',outcomes:[['Faithful and True',1],['An angel',0]],resolved:'Faithful and True',rule:'Resolved from Revelation 19:11–16.',context:'This market is already resolved and available for review.'}
];

const featured=['david-goliath','red-sea','paul-rome'];
const navTopics=['Trending','Combos','Breaking','New','Gospels','History','Torah','Prophets','Acts','Letters','Miracles','Parables','Revelation'];
const topics=['All','Jesus','David','Moses','Paul','Peter','Genesis','Gospels','Miracles','Prophecy','Resurrection','Kings','Parables','Acts'];
const timeRanges=['1H','1D','1W','1M','Max'];

const state={
  route:parseRoute(location.hash),query:'',topic:'All',statusFilter:'all',featuredIndex:0,range:'1M',
  ticket:{marketId:'david-goliath',outcomeIndex:0,amount:25,mode:'predict'},
  auth:{ready:false,user:null,mode:null,loading:false,error:'',accountOpen:false,draft:{}},
  integrity:null,comments:{},commentsLoading:{},scripture:{},section:'rules',discussion:'comments',mobileTicket:false,
  toast:'',lastRouteKey:'',openedTelemetryKey:'',livePercent:51
};

function parseRoute(hash){const h=(hash||'#/').replace(/^#/,'');if(h.startsWith('/markets'))return{name:'markets'};if(h.startsWith('/event/'))return{name:'event',id:decodeURIComponent(h.split('/')[2]||'david-goliath')};if(h.startsWith('/profile'))return{name:'profile'};return{name:'home'}}
function market(id){return markets.find(m=>m.id===id)||markets[0]}
function pct(v){const n=Math.round(Number(v)*100);return n<1?'<1%':`${n}%`}
function cents(v){const n=Math.round(Number(v)*100);return n<1?'<1¢':`${n}¢`}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function currentBalance(){return state.auth.user?.talents||0}
function syncUser(user){state.auth.user=user||null}
function predictionFor(id){return state.auth.user?.predictions?.find(p=>p.marketId===id)||null}
function isBookmarked(id){return Boolean(state.auth.user?.bookmarks?.includes(id))}
function fmtDate(value){if(!value)return'—';try{return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(new Date(value))}catch{return'—'}}
function marketVolume(m){return `◈${m.volume} Vol.`}
function toast(text){state.toast=text;render();setTimeout(()=>{if(state.toast===text){state.toast='';render()}},2400)}

async function api(url,options={}){
  const headers={...(options.headers||{})};
  if(options.body!==undefined)headers['content-type']='application/json';
  const response=await fetch(url,{credentials:'same-origin',...options,headers});
  let data={};try{data=await response.json()}catch{}
  if(!response.ok)throw new Error(data.error||`Request failed (${response.status})`);
  return data;
}

const icon=name=>{
  const paths={
    search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.6 2.1c-1 .6-1.4 1.1-1.4 2.1"/><path d="M12 17h.01"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    trend:'<path d="M3 16l5-5 4 3 7-8"/><path d="M14 6h5v5"/>',
    bookmark:'<path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z"/>',
    sliders:'<path d="M4 6h8M16 6h4M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="14" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    share:'<path d="M8 12v7h10V9h-4"/><path d="M11 13 19 5M14 5h5v5"/>',
    gift:'<path d="M4 10h16v11H4zM2.5 7h19v4h-19zM12 7v14"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 4 3 14 0 18M12 3c-3 4-3 14 0 18"/>',
    chevron:'<path d="m9 18 6-6-6-6"/>',
    close:'<path d="M6 6l12 12M18 6 6 18"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  return`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||''}</svg>`;
};

function logo(){return`<svg class="logo-mark" viewBox="0 0 36 36" aria-hidden="true"><path d="M4 9 18 3v30L4 27z"/><path d="M18 3 32 9v18l-14 6"/><path d="M9 12 18 8v20l-9-4z"/></svg>`}
function thumb(key,small=false){const map={david:['#5d3a20','#e3a551','D'],lazarus:['#155f58','#7bc4b1','L'],tomb:['#294762','#e6dfbb','✦'],walls:['#594b3c','#b09a79','J'],samson:['#553257','#c57cc5','S'],paul:['#245766','#7db8c6','P'],mountain:['#5b5548','#c4b58c','A'],sea:['#125b77','#5ac3dc','≈'],fire:['#7b2f1d','#f09138','F'],water:['#285e76','#80c8dd','W'],ship:['#3f5c68','#b2ccd4','J'],road:['#69573e','#d2b47c','S'],crown:['#645126','#d7bd60','J'],lion:['#6c4d22','#dcaa59','D'],flame:['#7e3422','#f2a052','✦'],ark:['#55442f','#ba9365','N'],horse:['#4e5861','#c9d1d7','R']};const[a,b,t]=map[key]||['#3b4650','#75828b','✦'];return`<span class="thumb ${small?'small':''}" style="--a:${a};--b:${b}">${t}</span>`}

function authHeader(){
  if(!state.auth.ready)return`<div class="auth-pending"><span></span></div>`;
  if(!state.auth.user)return`<div class="auth-actions"><button class="login-btn" data-action="open-auth" data-mode="login">Log in</button><button class="signup-btn" data-action="open-auth" data-mode="signup">Sign up</button></div>`;
  const u=state.auth.user;
  return`<div class="account-wrap"><button class="balance-button" data-action="account-menu"><span>Cash</span><strong>◈${u.talents.toLocaleString()}</strong></button><button class="account-button" data-action="account-menu"><span class="avatar">${esc(u.avatar)}</span><span class="account-name">${esc(u.username)}</span><b>⌄</b></button>${state.auth.accountOpen?renderAccountMenu():''}</div>`;
}
function renderAccountMenu(){const u=state.auth.user;const integrity=state.integrity||{label:'Fair play',level:'normal'};return`<div class="account-menu"><div class="account-menu-head"><span class="avatar large">${esc(u.avatar)}</span><div><b>${esc(u.username)}</b><small>${esc(u.email)}</small></div></div><div class="fair-row ${esc(integrity.level)}">${icon('check')}<span>${esc(integrity.label||'Fair play')}</span></div><a href="#/profile">Profile</a><button data-action="logout">Log out</button></div>`}
function header(active){return`<header class="site-header"><div class="topbar shell"><a class="brand" href="#/">${logo()}<span>HolyMarket</span></a><label class="global-search">${icon('search')}<input id="global-search" placeholder="Search HolyMarket" value="${esc(state.query)}"><kbd>/</kbd></label>${authHeader()}<button class="round-icon" aria-label="Help">${icon('help')}</button><button class="round-icon" aria-label="Menu">${icon('menu')}</button></div><nav class="category-bar"><div class="category-scroll shell">${navTopics.map((n,i)=>`<a class="category-link ${active==='home'&&i===0?'active':''}" href="#/markets" data-nav-topic="${esc(n)}">${i===0?icon('trend'):''}${esc(n)}</a>${i===3?'<i class="category-sep"></i>':''}`).join('')}<span class="category-next">›</span></div></nav></header>`}
function notice(){return`<div class="notice"><span>${icon('globe')} HolyMarket uses virtual Talents only. Predict first, then reveal the Scripture.</span><button data-action="notice-info">How it works ↗</button></div>`}

function authModal(){
  if(!state.auth.mode)return'';
  const signup=state.auth.mode==='signup';
  const d=state.auth.draft||{};
  return`<div class="modal-backdrop" data-action="close-auth"><section class="auth-modal" data-auth-panel role="dialog" aria-modal="true"><button class="modal-close" data-action="close-auth">${icon('close')}</button><div class="modal-brand">${logo()}<b>HolyMarket</b></div><h2>${signup?'Sign up':'Log in'}</h2><p>${signup?'Create your HolyMarket account and make the honesty oath before predicting.':'Welcome back to HolyMarket.'}</p><form id="auth-form">${signup?`<label>Username<input name="username" autocomplete="username" value="${esc(d.username||'')}" minlength="2" maxlength="24" required></label>`:''}<label>Email<input name="email" type="email" autocomplete="email" value="${esc(d.email||'')}" required></label><label>Password<input name="password" type="password" autocomplete="${signup?'new-password':'current-password'}" minlength="8" required></label>${signup?`<div class="oath-card"><div class="oath-title">✝ <b>Bible-truth oath</b></div><p>${esc(OATH_TEXT)}</p><small>Place your hand on a Bible while reading this oath if you have one.</small><label class="oath-check"><input name="oathAccepted" type="checkbox" ${d.oathAccepted?'checked':''}><span>I agree to this oath.</span></label><label>Signed name<input name="oathSignedName" value="${esc(d.oathSignedName||'')}" minlength="2" required></label></div>`:''}${state.auth.error?`<div class="form-error">${esc(state.auth.error)}</div>`:''}<button class="modal-primary" type="submit" ${state.auth.loading?'disabled':''}>${state.auth.loading?'Please wait…':signup?'Agree & create account':'Log in'}</button></form><div class="auth-switch">${signup?'Already have an account?':'New to HolyMarket?'} <button data-action="switch-auth" data-mode="${signup?'login':'signup'}">${signup?'Log in':'Sign up'}</button></div></section></div>`;
}

function featuredChart(m){return`<div class="featured-chart"><div class="featured-legend">${m.outcomes.slice(0,3).map((o,i)=>`<span><i class="series-${i}"></i>${esc(o[0])} <b>${pct(o[1])}</b></span>`).join('')}</div><svg viewBox="0 0 430 248" preserveAspectRatio="none"><g class="chart-grid"><line x1="0" y1="28" x2="402" y2="28"/><line x1="0" y1="84" x2="402" y2="84"/><line x1="0" y1="140" x2="402" y2="140"/><line x1="0" y1="196" x2="402" y2="196"/></g><path class="hero-line line-a" d="M8 160L40 151L70 156L101 122L134 130L165 96L198 104L230 78L260 88L292 81L324 104L355 82L398 69"/><path class="hero-line line-b" d="M8 198L45 190L82 181L117 188L151 173L185 178L220 168L255 175L290 163L326 169L360 158L398 161"/><circle class="endpoint ep-a" cx="398" cy="69" r="5"/><circle class="endpoint ep-b" cx="398" cy="161" r="5"/></svg><div class="chart-y"><span>80%</span><span>60%</span><span>40%</span><span>20%</span><span>0%</span></div><div class="trade-bursts"><span>+ ◈6</span><span>+ ◈4</span><span>+ ◈124</span><span>+ ◈1,963</span></div></div>`}
function featuredPanel(m){return`<article class="featured-panel" data-action="open-market" data-market="${m.id}"><div class="featured-left"><div class="featured-title-row">${thumb(m.image)}<div><small>${esc(m.category)} · ${esc(m.sub)}</small><h2>${esc(m.title)}</h2></div><div class="featured-icons"><button data-action="bookmark" data-market="${m.id}">${icon('bookmark')}</button><button>${icon('share')}</button></div></div><div class="featured-outcomes">${m.outcomes.slice(0,4).map((o,i)=>`<button data-action="open-market" data-market="${m.id}" data-outcome="${i}"><span>${esc(o[0])}</span><b>${pct(o[1])}</b></button>`).join('')}</div><div class="featured-comments"><p><i></i><span><b>BibleScholar</b> I’m locking my answer before opening the passage.</span></p><p><i class="alt"></i><span><b>BereanReader</b> This one is harder than it looks.</span></p></div><div class="featured-meta"><span>${marketVolume(m)}</span><span>${esc(m.period)}</span></div></div><div class="featured-right">${featuredChart(m)}<div class="featured-chart-foot"><span>Community probability</span><span>HolyMarket</span></div></div></article>`}
function discoveryRail(){const news=[['Will Peter deny Jesus three times?','93%','+20%'],['Will Jonah go straight to Nineveh?','9%','-14%'],['Will Daniel survive the lions?','96%','+5%']];const hot=[['David','◈942K today'],['Paul','◈3M today'],['Moses','◈4M today'],['Peter','◈4M today'],['Jonah','◈16K today']];return`<aside class="discovery"><h3>Breaking News <span>›</span></h3>${news.map((n,i)=>`<div class="news-row"><span>${i+1}</span><p>${n[0]}</p><div><b>${n[1]}</b><small class="${n[2].startsWith('-')?'negative':''}">${n[2]}</small></div></div>`).join('')}<div class="rail-divider"></div><h3>Hot Topics <span>›</span></h3>${hot.map((h,i)=>`<div class="hot-row"><span>${i+1}</span><b>${h[0]}</b><small>${h[1]}</small><em>›</em></div>`).join('')}<a class="rail-more" href="#/markets">Explore all</a></aside>`}

function renderMultiCard(m){return`<article class="market-card" data-action="open-market" data-market="${m.id}"><div class="card-head">${thumb(m.image)}<h3>${esc(m.title)}</h3></div><div class="card-outcomes">${m.outcomes.slice(0,2).map((o,i)=>`<div class="card-outcome"><span>${esc(o[0])}</span><b>${pct(o[1])}</b><button class="yes-price" data-action="open-market" data-market="${m.id}" data-outcome="${i}">Yes ${pct(o[1])}</button><button class="no-price" data-action="open-market" data-market="${m.id}" data-outcome="${i}">No ${pct(1-o[1])}</button></div>`).join('')}</div>${cardFooter(m)}</article>`}
function renderBinaryCard(m){const y=m.outcomes[0][1];return`<article class="market-card binary-card" data-action="open-market" data-market="${m.id}"><div class="card-head">${thumb(m.image)}<h3>${esc(m.title)}</h3></div><div class="binary-prob"><strong>${pct(y)}</strong><span>chance</span></div><div class="binary-buttons"><button class="yes-price" data-action="open-market" data-market="${m.id}" data-outcome="0">Yes ${pct(y)}</button><button class="no-price" data-action="open-market" data-market="${m.id}" data-outcome="1">No ${pct(1-y)}</button></div>${cardFooter(m)}</article>`}
function renderLiveCard(m){return`<article class="market-card live-card" data-action="open-market" data-market="${m.id}"><div class="card-head live-title">${thumb(m.image)}<h3>${esc(m.title)}</h3><div class="gauge"><svg viewBox="0 0 76 46"><path class="gauge-bg" d="M7 39a31 31 0 0 1 62 0"/><path class="gauge-fill" d="M7 39a31 31 0 0 1 62 0"/></svg><b>${state.livePercent}%</b><small>${esc(m.outcomes[0][0])}</small></div></div><div class="live-bursts"><span>+◈5</span><span>+◈49</span><span>+◈15</span><span>+◈186</span></div><div class="live-buttons"><button class="up-btn" data-action="open-market" data-market="${m.id}" data-outcome="0">${esc(m.outcomes[0][0])}</button><button class="down-btn" data-action="open-market" data-market="${m.id}" data-outcome="1">${esc(m.outcomes[1][0])}</button></div>${cardFooter(m,true)}</article>`}
function renderMatchupCard(m){return`<article class="market-card matchup-card" data-action="open-market" data-market="${m.id}">${m.teams.map((t,i)=>`<div class="match-team">${thumb(i? 'samson':m.image,true)}<span class="team-score">${t[1]}</span><b>${esc(t[0])}</b><strong>${pct(t[2])}</strong></div>`).join('')}<div class="match-buttons"><button data-action="open-market" data-market="${m.id}" data-outcome="0">${esc(m.outcomes[0][0])}</button><button data-action="open-market" data-market="${m.id}" data-outcome="1">${esc(m.outcomes[1][0])}</button></div>${cardFooter(m)}</article>`}
function renderResolvedCard(m){return`<article class="market-card resolved-card" data-action="open-market" data-market="${m.id}"><div class="card-head">${thumb(m.image)}<h3>${esc(m.title)}</h3></div><div class="resolved-result"><span>${icon('check')}</span><div><small>Resolved</small><b>${esc(m.resolved)}</b></div></div><div class="resolved-ref">${esc(m.reference)}</div>${cardFooter(m)}</article>`}
function renderCard(m){return m.type==='live'?renderLiveCard(m):m.type==='matchup'?renderMatchupCard(m):m.type==='binary'?renderBinaryCard(m):m.type==='resolved'?renderResolvedCard(m):renderMultiCard(m)}
function cardFooter(m,live=false){return`<footer><span class="${live?'live-state':''}">${live?'<i></i>LIVE':marketVolume(m)}</span>${!live?`<span>${esc(m.period)}</span>`:''}<span class="footer-spacer"></span><button class="card-gift" aria-label="Rewards">${icon('gift')}</button><button class="card-bookmark ${isBookmarked(m.id)?'active':''}" data-action="bookmark" data-market="${m.id}" aria-label="Bookmark">${icon('bookmark')}</button></footer>`}

function filteredMarkets(){const q=state.query.trim().toLowerCase();return markets.filter(m=>{const hay=[m.title,m.category,m.sub,m.reference,...m.outcomes.map(o=>o[0])].join(' ').toLowerCase();const topic=state.topic==='All'||hay.includes(state.topic.toLowerCase());const status=state.statusFilter==='all'||(state.statusFilter==='active'&&m.type!=='resolved')||(state.statusFilter==='resolved'&&m.type==='resolved');return topic&&status&&(!q||hay.includes(q))})}

function footer(){return`<footer class="site-footer shell"><div><div class="footer-brand">${logo()}<b>HolyMarket</b></div><p>Scripture prediction markets for learning. Talents are virtual points with no cash value.</p></div><div><h4>HolyMarket</h4><a href="#/markets">Markets</a><a href="#/profile">Profile</a><span>Leaderboard</span><span>Integrity</span></div><div><h4>Learn</h4><span>How it works</span><span>Scripture sources</span><span>Fair play</span><span>Help</span></div><div><h4>Legal</h4><span>Privacy</span><span>Terms</span><span>Virtual only</span></div><small>HolyMarket © 2026 · No deposits · No withdrawals · No cash value</small></footer>`}

function renderHome(){const m=market(featured[state.featuredIndex]);return`${header('home')}${notice()}<main class="home shell"><h1 class="featured-heading">Featured markets</h1><div class="hero-grid">${featuredPanel(m)}${discoveryRail()}</div><div class="carousel-row"><div class="carousel-dots">${featured.map((id,i)=>`<button class="${i===state.featuredIndex?'active':''}" data-action="carousel" data-index="${i}" aria-label="Featured ${i+1}"></button>`).join('')}</div><div><button data-action="carousel-prev">‹</button><button data-action="carousel-next">›</button></div></div><section class="home-markets"><div class="section-head"><h2>All markets</h2><a href="#/markets">View all ›</a></div><div class="market-grid">${markets.slice(0,9).map(renderCard).join('')}</div></section></main>${footer()}`}

function renderMarkets(){const list=filteredMarkets();return`${header('markets')}<main class="markets-page shell"><div class="markets-title"><h1>All markets</h1><div><button data-action="focus-market-search">${icon('search')}</button><button>${icon('sliders')}</button><button>${icon('bookmark')}</button></div></div><div class="topic-rail">${topics.map(t=>`<button class="${state.topic===t?'active':''}" data-action="topic" data-topic="${esc(t)}">${esc(t)}</button>`).join('')}<span>›</span></div><div class="market-controls"><label class="market-search">${icon('search')}<input id="market-search" placeholder="Search" value="${esc(state.query)}"></label><button class="sort-control">24hr Volume⌄</button><button class="${state.statusFilter==='all'?'active':''}" data-action="status-filter" data-filter="all">All</button><button class="${state.statusFilter==='active'?'active':''}" data-action="status-filter" data-filter="active">Active</button><button class="${state.statusFilter==='resolved'?'active':''}" data-action="status-filter" data-filter="resolved">Resolved</button><label><input type="checkbox">Hide matchups</label><label><input type="checkbox">Hide live</label></div><div class="market-grid">${list.map(renderCard).join('')}</div>${list.length?'':'<div class="empty-state">No Scripture markets found.</div>'}<section class="faq"><h2>Frequently Asked Questions</h2>${[['What is HolyMarket?','HolyMarket is a virtual-only Scripture prediction learning concept.'],['How do the percentages work?','They represent simulated community confidence and are not real-money prices.'],['How are questions resolved?','Each question cites a Bible passage. The passage stays hidden until you lock your answer.'],['What are Talents?','Talents are learning points with no cash value and cannot be deposited or withdrawn.']].map(([q,a])=>`<details><summary>${q}<span>+</span></summary><p>${a}</p></details>`).join('')}</section></main>${footer()}`}

function eventChart(m){const paths={
  '1H':'M20 176L65 160L110 166L150 132L195 139L240 116L286 122L330 96L378 102L430 81L482 90L540 72',
  '1D':'M20 182L60 176L102 149L143 158L186 129L228 139L270 111L316 119L360 91L405 99L455 75L502 82L548 69',
  '1W':'M20 195L62 180L106 184L150 155L194 165L240 128L286 142L330 104L374 120L420 89L462 97L505 74L548 80',
  '1M':'M20 188L64 166L108 172L150 139L194 148L238 118L282 126L326 98L370 109L414 84L458 92L502 72L548 76',
  'Max':'M20 212L68 200L116 204L164 178L212 184L260 153L308 162L356 126L404 138L452 102L500 111L548 76'
};const first=m.outcomes[0];const second=m.outcomes[1]||['Other',1-first[1]];return`<div class="event-chart"><div class="chart-range">${timeRanges.map(r=>`<button class="${state.range===r?'active':''}" data-action="chart-range" data-range="${r}">${r}</button>`).join('')}</div><svg viewBox="0 0 610 260" preserveAspectRatio="none"><g class="chart-grid event-grid"><line x1="0" y1="32" x2="565" y2="32"/><line x1="0" y1="92" x2="565" y2="92"/><line x1="0" y1="152" x2="565" y2="152"/><line x1="0" y1="212" x2="565" y2="212"/></g><path class="event-line primary" d="${paths[state.range]}"/><path class="event-line secondary" d="M20 220L88 218L156 220L224 216L292 219L360 216L428 218L496 215L548 216"/><circle class="event-dot primary" cx="548" cy="76" r="5"/><circle class="event-dot secondary" cx="548" cy="216" r="5"/></svg><div class="event-axis"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div class="event-label label-primary"><i></i><span>${esc(first[0])}</span><b>${pct(first[1])}</b></div><div class="event-label label-secondary"><i></i><span>${esc(second[0])}</span><b>${pct(second[1])}</b></div></div>`}

function scoreboard(m){const teams=m.teams||[[m.outcomes[0][0],13,m.outcomes[0][1]],[m.outcomes[1]?.[0]||'Other',5,m.outcomes[1]?.[1]||.1]];const scores=m.scores||[['13','12'],['5','11']];return`<div class="scoreboard"><div class="score-head"><span></span><span></span><span>M1</span><span class="current">M2</span><span>M3</span><span>ODDS</span></div>${teams.map((t,i)=>`<div class="score-row">${thumb(i? 'samson':m.image,true)}<b>${esc(t[0])}</b><span>${scores[i]?.[0]||'–'}</span><span>${scores[i]?.[1]||'–'}</span><span>–</span><strong>${pct(t[2])}</strong></div>`).join('')}</div>`}

function renderRulesBlock(m){if(state.section==='context')return`<section class="rules-block"><h3>Market Context</h3><p>${esc(m.context)}</p><div class="context-note">HolyMarket intentionally hides the resolving verses until you lock a prediction.</div></section>`;return`<section class="rules-block"><h3>Rules</h3><p>${esc(m.rule)}</p><div class="market-facts"><div><small>Volume</small><b>${marketVolume(m)}</b></div><div><small>Status</small><b>${m.type==='resolved'?'Resolved':'Active'}</b></div><div><small>Resolution source</small><b>${esc(m.reference)}</b></div><div><small>Points</small><b>Virtual only</b></div></div></section>`}

function renderDiscussion(m){
  if(state.discussion==='activity'){
    const rows=(state.auth.user?.activity||[]).filter(a=>!a.marketId||a.marketId===m.id).slice(0,12);
    return`<div class="discussion-body activity-list">${rows.length?rows.map(a=>`<div><span class="activity-icon">${a.type==='prediction'?'↗':'•'}</span><p><b>${esc(state.auth.user.username)}</b> ${esc(a.type.replaceAll('-',' '))}</p><small>${a.stake?`◈${a.stake} · `:''}${fmtDate(a.createdAt)}</small></div>`).join(''):'<p class="muted">No account activity for this market yet.</p>'}</div>`;
  }
  if(state.discussion==='scripture'){
    const pred=predictionFor(m.id);const s=state.scripture[m.id];
    if(!pred)return`<div class="discussion-body scripture-locked">${icon('lock')}<h4>Scripture is hidden</h4><p>Lock a virtual prediction before revealing ${esc(m.reference)}.</p></div>`;
    if(!s||s.status==='loading')return`<div class="discussion-body loading-lines"><span></span><span></span><span></span></div>`;
    return`<div class="discussion-body scripture-reveal"><div><b>${esc(s.data.reference||m.reference)}</b><small>${esc(s.data.version_title||'Bible')}</small></div><p>${esc(s.data.content||'')}</p><small>${esc(s.data.attribution||s.data.copyright||'')}</small></div>`;
  }
  const comments=state.comments[m.id]||[];
  return`<div class="discussion-body"><div class="comment-compose">${state.auth.user?`<span class="avatar">${esc(state.auth.user.avatar)}</span><input id="comment-input" maxlength="500" placeholder="Add a comment"><button data-action="post-comment" data-market="${m.id}">Post</button>`:`<button class="login-comment" data-action="open-auth" data-mode="login">Log in to comment</button>`}</div>${state.commentsLoading[m.id]?'<div class="comment-skeleton"></div>':comments.length?comments.map(c=>`<div class="comment-row"><span class="avatar">${esc(c.avatar||c.username?.[0]||'H')}</span><div><b>${esc(c.username)}</b><small>${fmtDate(c.createdAt)}</small><p>${esc(c.text)}</p></div></div>`).join(''):`<p class="muted">Be the first to share an honest prediction thought.</p>`}</div>`;
}

function ticket(m){const pred=predictionFor(m.id);const idx=pred?pred.outcomeIndex:Math.min(state.ticket.outcomeIndex,m.outcomes.length-1);const outcome=m.outcomes[idx]||m.outcomes[0];const price=Math.max(.01,Number(outcome[1])||.01);const amount=Math.max(0,Number(state.ticket.amount)||0);const potential=Math.floor(amount/price);return`<div class="combo-row"><span>▱</span><b>Build a combo</b><small>›</small></div><div class="ticket"><div class="ticket-tabs"><button class="${state.ticket.mode==='predict'?'active':''}" data-action="ticket-mode" data-mode="predict">Predict</button><button class="${state.ticket.mode==='review'?'active':''}" data-action="ticket-mode" data-mode="review">Review</button><span>Market⌄</span></div><div class="ticket-market">${thumb(m.image,true)}<div><small>${esc(m.title)}</small><b>${esc(outcome[0])}</b></div></div>${state.ticket.mode==='predict'?`<div class="ticket-outcomes">${m.outcomes.slice(0,2).map((o,i)=>`<button class="${idx===i?'active':''}" data-action="ticket-outcome" data-index="${i}"><span>${esc(o[0])}</span><b>${cents(o[1])}</b></button>`).join('')}</div><div class="amount-row"><label>Amount</label><div><span>◈</span><input id="amount-input" type="number" inputmode="numeric" min="0" value="${amount||''}" placeholder="0"></div></div><div class="quick-add">${[1,5,10,100].map(n=>`<button data-action="quick-add" data-value="${n}">+◈${n}</button>`).join('')}<button data-action="max-amount">Max</button></div><div class="return-row"><span>Potential return</span><b>◈${potential.toLocaleString()}</b></div><button class="trade-button" data-action="lock-prediction" ${m.type==='resolved'?'disabled':''}>${pred?'Prediction locked':m.type==='resolved'?'Resolved':'Predict'}</button><p class="ticket-note">By predicting, you affirm your Bible-truth oath.</p>`:`<div class="review-ticket">${pred?`<div><span>Outcome</span><b>${esc(m.outcomes[pred.outcomeIndex]?.[0]||'—')}</b></div><div><span>Stake</span><b>◈${pred.stake}</b></div><div><span>Locked</span><b>${fmtDate(pred.createdAt)}</b></div><button data-action="discussion" data-tab="scripture">View Scripture</button>`:'<p>No prediction is locked on this market yet.</p>'}</div>`}</div>`}

function renderEvent(m){return`${header('event')}${notice()}<main class="event-page shell"><section class="event-main"><div class="breadcrumb">${esc(m.category)} · ${esc(m.sub)} · ${esc(m.reference.split(':')[0])}</div><div class="event-heading"><div><h1>${esc(m.title)}</h1><div class="event-meta"><span class="status-dot"></span><b>${m.type==='resolved'?'Resolved':m.stage||'Active'}</b><span>${marketVolume(m)}</span></div></div><div class="event-actions"><button>${icon('info')}</button><button class="${isBookmarked(m.id)?'active':''}" data-action="bookmark" data-market="${m.id}">${icon('bookmark')}</button><button>${icon('share')}</button></div></div>${m.type==='matchup'?scoreboard(m):`<div class="big-prob"><strong>${pct(m.outcomes[0][1])}</strong><span>chance</span></div>`}${eventChart(m)}<div class="section-tabs"><button class="${state.section==='rules'?'active':''}" data-action="section-tab" data-section="rules">Rules</button><button class="${state.section==='context'?'active':''}" data-action="section-tab" data-section="context">Market Context</button></div>${renderRulesBlock(m)}<section class="discussion"><div class="discussion-tabs"><button class="${state.discussion==='comments'?'active':''}" data-action="discussion" data-tab="comments">Comments</button><button class="${state.discussion==='activity'?'active':''}" data-action="discussion" data-tab="activity">Activity</button><button class="${state.discussion==='scripture'?'active':''}" data-action="discussion" data-tab="scripture">Scripture</button></div>${renderDiscussion(m)}</section></section><aside class="ticket-side">${ticket(m)}</aside></main><button class="mobile-trade" data-action="open-mobile-ticket">Predict</button><div class="mobile-sheet-wrap ${state.mobileTicket?'open':''}"><div class="mobile-backdrop" data-action="close-mobile-ticket"></div><section class="mobile-sheet"><button class="sheet-close" data-action="close-mobile-ticket">${icon('close')}</button>${ticket(m)}</section></div>${footer()}`}

function renderProfile(){if(!state.auth.user)return`${header('profile')}<main class="profile shell"><div class="profile-guest"><h1>Profile</h1><p>Log in to see your predictions, activity and fair-play status.</p><button data-action="open-auth" data-mode="login">Log in</button></div></main>${footer()}`;const u=state.auth.user;const integrity=state.integrity||{label:'Fair play',level:'normal'};return`${header('profile')}<main class="profile shell"><div class="profile-head"><span class="profile-avatar">${esc(u.avatar)}</span><div><h1>${esc(u.username)}</h1><p>Joined ${fmtDate(u.createdAt)}</p></div><div class="profile-balance"><small>Balance</small><b>◈${u.talents.toLocaleString()}</b></div></div><div class="profile-stats"><div><small>Predictions</small><b>${u.predictions.length}</b></div><div><small>Bookmarks</small><b>${u.bookmarks.length}</b></div><div><small>Comments</small><b>${u.comments.length}</b></div><div class="fair-stat ${esc(integrity.level)}"><small>Integrity</small><b>${esc(integrity.label)}</b></div></div><section class="profile-panel"><h2>Bible-truth oath</h2><p>Accepted ${fmtDate(u.oath?.acceptedAt)} as <b>${esc(u.oath?.signedName||u.username)}</b>.</p></section><section class="profile-panel"><h2>Recent predictions</h2>${u.predictions.length?u.predictions.slice(0,10).map(p=>`<a class="profile-row" href="#/event/${encodeURIComponent(p.marketId)}"><b>${esc(market(p.marketId).title)}</b><span>${esc(market(p.marketId).outcomes[p.outcomeIndex]?.[0]||'—')}</span><small>◈${p.stake}</small></a>`).join(''):'<p class="muted">No predictions yet.</p>'}</section><section class="profile-panel"><h2>Recent activity</h2>${u.activity.slice(0,12).map(a=>`<div class="profile-row"><b>${esc(a.type.replaceAll('-',' '))}</b><span>${a.marketId?esc(market(a.marketId).sub):''}</span><small>${fmtDate(a.createdAt)}</small></div>`).join('')}</section></main>${footer()}`}

function render(){
  state.route=parseRoute(location.hash);
  let body='';
  if(state.route.name==='markets')body=renderMarkets();
  else if(state.route.name==='event'){const m=market(state.route.id);state.ticket.marketId=m.id;body=renderEvent(m)}
  else if(state.route.name==='profile')body=renderProfile();
  else body=renderHome();
  app.innerHTML=`${body}${authModal()}${state.toast?`<div class="toast">${esc(state.toast)}</div>`:''}`;
  queueMicrotask(routeEffects);
}

async function routeEffects(){
  const key=state.route.name==='event'?`event:${state.route.id}`:state.route.name;
  if(key!==state.lastRouteKey){state.lastRouteKey=key;if(state.route.name!=='event')state.openedTelemetryKey=''}
  if(state.route.name==='event'){
    const id=state.route.id;
    if(!state.comments[id]&&!state.commentsLoading[id])loadComments(id);
    if(state.auth.user){
      const telemetryKey=`${state.auth.user.id}:${id}:${key}`;
      if(state.openedTelemetryKey!==telemetryKey){state.openedTelemetryKey=telemetryKey;api('/api/integrity/market-open',{method:'POST',body:JSON.stringify({marketId:id})}).catch(()=>{});}
    }
  }
}

function openMarket(id,outcomeIndex=0){state.ticket={marketId:id,outcomeIndex:Number(outcomeIndex)||0,amount:25,mode:'predict'};state.section='rules';state.discussion='comments';state.mobileTicket=false;state.openedTelemetryKey='';location.hash=`#/event/${encodeURIComponent(id)}`}
function setOutcome(index){state.ticket.outcomeIndex=Number(index)||0;const m=market(state.ticket.marketId);if(state.auth.user)api('/api/integrity/outcome-change',{method:'POST',body:JSON.stringify({marketId:m.id,outcomeIndex:state.ticket.outcomeIndex})}).catch(()=>{});render()}
function quickAdd(n){state.ticket.amount=Math.min(currentBalance(),Math.max(0,Number(state.ticket.amount)||0)+Number(n||0));render()}
function openAuth(mode='login'){state.auth.mode=mode;state.auth.error='';state.auth.loading=false;state.auth.draft={};render()}
function closeAuth(){state.auth.mode=null;state.auth.error='';render()}
async function restoreAuth(){try{const d=await api('/api/auth/me');syncUser(d.user);state.integrity=d.integrity||null}catch{syncUser(null);state.integrity=null}finally{state.auth.ready=true;state.openedTelemetryKey='';render()}}
async function refreshIntegrity(){if(!state.auth.user){state.integrity=null;return}try{const d=await api('/api/me/integrity');state.integrity=d.integrity}catch{}}
async function logout(){try{await api('/api/auth/logout',{method:'POST',body:'{}'})}catch{}syncUser(null);state.integrity=null;state.auth.accountOpen=false;state.openedTelemetryKey='';render();toast('Logged out')}

async function submitAuth(form){
  const fd=new FormData(form);const signup=state.auth.mode==='signup';
  const body={email:String(fd.get('email')||''),password:String(fd.get('password')||'')};
  if(signup){body.username=String(fd.get('username')||'');body.oathAccepted=fd.get('oathAccepted')==='on';body.oathSignedName=String(fd.get('oathSignedName')||'')}
  state.auth.loading=true;state.auth.error='';state.auth.draft=body;render();
  try{const d=await api(signup?'/api/auth/register':'/api/auth/login',{method:'POST',body:JSON.stringify(body)});syncUser(d.user);state.integrity=d.integrity||null;state.auth.mode=null;state.auth.loading=false;state.openedTelemetryKey='';render();await refreshIntegrity();render();toast(signup?'Account created':'Logged in')}
  catch(err){state.auth.loading=false;state.auth.error=err.message;render()}
}

async function bookmark(id){if(!state.auth.user)return openAuth('login');try{const d=await api(`/api/me/bookmarks/${encodeURIComponent(id)}`,{method:'POST',body:'{}'});syncUser(d.user);render()}catch(err){toast(err.message)}}
async function loadComments(id){state.commentsLoading[id]=true;render();try{const d=await api(`/api/markets/${encodeURIComponent(id)}/comments`);state.comments[id]=d.comments||[]}catch{state.comments[id]=[]}finally{state.commentsLoading[id]=false;render()}}
async function postComment(id){if(!state.auth.user)return openAuth('login');const input=document.querySelector('#comment-input');const text=String(input?.value||'').trim();if(!text)return;try{const d=await api(`/api/markets/${encodeURIComponent(id)}/comments`,{method:'POST',body:JSON.stringify({text})});syncUser(d.user);state.comments[id]=[d.comment,...(state.comments[id]||[])];render()}catch(err){toast(err.message)}}

async function lockPrediction(){
  const m=market(state.ticket.marketId);if(!state.auth.user)return openAuth('login');
  const existing=predictionFor(m.id);if(existing){state.discussion='scripture';render();if(!state.scripture[m.id])loadScripture(m);return}
  const stake=Math.floor(Number(state.ticket.amount)||0);if(stake<1)return toast('Enter at least 1 Talent');
  try{const d=await api('/api/me/predictions',{method:'POST',body:JSON.stringify({marketId:m.id,outcomeIndex:state.ticket.outcomeIndex,side:'yes',stake})});syncUser(d.user);state.integrity=d.integrity||state.integrity;state.ticket.mode='review';state.discussion='scripture';render();loadScripture(m)}catch(err){toast(err.message)}
}
async function loadScripture(m){state.scripture[m.id]={status:'loading'};render();try{const d=await api(`/api/scripture?ref=${encodeURIComponent(m.reference)}&marketId=${encodeURIComponent(m.id)}`);state.scripture[m.id]={status:'ready',data:d}}catch(err){state.scripture[m.id]={status:'ready',data:{reference:m.reference,version_title:'Scripture',content:'The Scripture provider is temporarily unavailable. Open the cited passage directly to resolve this market.',attribution:err.message}}}render()}

app.addEventListener('click',e=>{
  const el=e.target.closest('[data-action]');if(!el)return;const action=el.dataset.action;
  if(action==='open-market'){e.preventDefault();e.stopPropagation();openMarket(el.dataset.market,el.dataset.outcome)}
  else if(action==='bookmark'){e.preventDefault();e.stopPropagation();bookmark(el.dataset.market)}
  else if(action==='carousel'){state.featuredIndex=Number(el.dataset.index)||0;render()}
  else if(action==='carousel-prev'){state.featuredIndex=(state.featuredIndex+featured.length-1)%featured.length;render()}
  else if(action==='carousel-next'){state.featuredIndex=(state.featuredIndex+1)%featured.length;render()}
  else if(action==='topic'){state.topic=el.dataset.topic||'All';render()}
  else if(action==='status-filter'){state.statusFilter=el.dataset.filter||'all';render()}
  else if(action==='focus-market-search')document.querySelector('#market-search')?.focus();
  else if(action==='chart-range'){state.range=el.dataset.range;render()}
  else if(action==='ticket-outcome')setOutcome(el.dataset.index);
  else if(action==='quick-add')quickAdd(el.dataset.value);
  else if(action==='max-amount'){state.ticket.amount=currentBalance();render()}
  else if(action==='ticket-mode'){state.ticket.mode=el.dataset.mode;render()}
  else if(action==='section-tab'){state.section=el.dataset.section;render()}
  else if(action==='discussion'){state.discussion=el.dataset.tab;render();if(state.discussion==='scripture'&&predictionFor(state.ticket.marketId)&&!state.scripture[state.ticket.marketId])loadScripture(market(state.ticket.marketId))}
  else if(action==='lock-prediction')lockPrediction();
  else if(action==='post-comment')postComment(el.dataset.market);
  else if(action==='open-auth')openAuth(el.dataset.mode);
  else if(action==='switch-auth')openAuth(el.dataset.mode);
  else if(action==='close-auth'){if(e.target.closest('[data-auth-panel]')&&!e.target.closest('.modal-close'))return;closeAuth()}
  else if(action==='account-menu'){state.auth.accountOpen=!state.auth.accountOpen;render()}
  else if(action==='logout')logout();
  else if(action==='open-mobile-ticket'){state.mobileTicket=true;render()}
  else if(action==='close-mobile-ticket'){state.mobileTicket=false;render()}
  else if(action==='notice-info')toast('Choose honestly, lock your prediction, then reveal the cited Scripture.')
});

app.addEventListener('input',e=>{
  if(e.target.id==='market-search'){state.query=e.target.value;render();queueMicrotask(()=>{const x=document.querySelector('#market-search');if(x){x.focus();x.setSelectionRange(state.query.length,state.query.length)}})}
  else if(e.target.id==='amount-input')state.ticket.amount=Math.max(0,Number(e.target.value)||0);
  else if(e.target.closest('#auth-form')){const form=e.target.form;if(form){const fd=new FormData(form);state.auth.draft={username:String(fd.get('username')||''),email:String(fd.get('email')||''),oathAccepted:fd.get('oathAccepted')==='on',oathSignedName:String(fd.get('oathSignedName')||'')}}}
});
app.addEventListener('change',e=>{if(e.target.closest('#auth-form')){const fd=new FormData(e.target.form);state.auth.draft={...state.auth.draft,oathAccepted:fd.get('oathAccepted')==='on'}}});
app.addEventListener('submit',e=>{if(e.target.id==='auth-form'){e.preventDefault();submitAuth(e.target)}});
app.addEventListener('keydown',e=>{if(e.target.id==='global-search'&&e.key==='Enter'){state.query=e.target.value;location.hash='#/markets'}if(e.target.id==='comment-input'&&e.key==='Enter'){e.preventDefault();postComment(state.ticket.marketId)}});
window.addEventListener('hashchange',()=>{state.openedTelemetryKey='';render()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.auth.mode)closeAuth();if(e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement?.tagName||'')){e.preventDefault();document.querySelector('#global-search')?.focus()}});

setInterval(()=>{state.livePercent=48+Math.floor(Math.random()*8);const gauge=document.querySelector('.gauge b');if(gauge)gauge.textContent=`${state.livePercent}%`},3200);
render();
restoreAuth();

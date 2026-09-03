const app = document.querySelector('#app');

const COLORS = {
  blue: '#2e5cff', green: '#21b66f', red: '#ff3b45', card: '#1e2428', page: '#15191d'
};

const TOPICS = ['Trending','Combos','Perps','Breaking','New','Gospels','History','Torah','Prophets','Acts','Letters','Miracles','Parables','Revelation'];
const MARKET_TOPICS = ['All','Jesus','David','Moses','Paul','Peter','Genesis','Gospels','Miracles','Prophecy','Resurrection','Kings','Parables','Acts'];

const markets = [
  {
    id:'david-goliath', type:'multi', category:'History', sub:'1 Samuel', reference:'1 Samuel 17:38–51',
    title:'Will David defeat Goliath?', activity:'82K predictions', thumb:'david',
    outcomes:[{label:'David wins',probability:.83},{label:'Goliath wins',probability:.17}],
    volume:'82K', comments:864, rule:'This market resolves from 1 Samuel 17:50–51.',
  },
  {
    id:'lazarus-live', type:'live', category:'Gospels', sub:'John', reference:'John 11:43–44',
    title:'What happens next: Lazarus comes out?', activity:'LIVE', thumb:'lazarus', probability:.51, volume:'19K',
    outcomes:[{label:'Lazarus comes out',probability:.51},{label:'He remains in the tomb',probability:.49}],
    rule:'This market resolves from John 11:43–44.'
  },
  {
    id:'resurrection', type:'multi', category:'Gospels', sub:'Resurrection', reference:'John 20:24–29',
    title:'Will Thomas believe before seeing Jesus?', activity:'18K predictions', thumb:'tomb',
    outcomes:[{label:'No',probability:.78},{label:'Yes',probability:.22}], volume:'18K',
    rule:'This market resolves from John 20:24–29.'
  },
  {
    id:'jericho', type:'matchup', category:'History', sub:'Joshua', reference:'Joshua 6:20', title:'Jericho — Israel', thumb:'walls', activity:'514K predictions', stage:'STORY 2',
    teams:[{name:'Israel',short:'Israel',score:1,probability:.82},{name:'Jericho',short:'Jericho',score:0,probability:.18}],
    outcomes:[{label:'Israel',probability:.82},{label:'Jericho',probability:.18}], volume:'514K', rule:'This market resolves from Joshua 6:20.'
  },
  {
    id:'samson', type:'matchup', category:'History', sub:'Judges', reference:'Judges 16:28–30', title:'Samson — Philistines', thumb:'samson', activity:'300K predictions', stage:'STORY 2',
    teams:[{name:'Samson',short:'Samson',score:1,probability:.87},{name:'Philistines',short:'Philistines',score:0,probability:.13}],
    outcomes:[{label:'Samson',probability:.87},{label:'Philistines',probability:.13}], volume:'300K', rule:'This market resolves from Judges 16:28–30.'
  },
  {
    id:'paul-rome', type:'multi', category:'Acts', sub:'Paul', reference:'Acts 28:14–16', title:'Will Paul eventually reach Rome?', thumb:'paul', activity:'726K predictions',
    outcomes:[{label:'Yes',probability:.99},{label:'No',probability:.01}], volume:'726K', rule:'This market resolves from Acts 28:14–16.'
  },
  {
    id:'abraham-isaac', type:'binary', category:'Torah', sub:'Genesis', reference:'Genesis 22:9–13', title:'Will Abraham ultimately sacrifice Isaac?', thumb:'mountain', activity:'1.8M predictions',
    outcomes:[{label:'Yes',probability:.14},{label:'No',probability:.86}], volume:'1.8M', rule:'This market resolves from Genesis 22:9–13.'
  },
  {
    id:'red-sea', type:'binary', category:'Torah', sub:'Exodus', reference:'Exodus 14:21–22', title:'Will the Red Sea divide for Israel?', thumb:'sea', activity:'962K predictions',
    outcomes:[{label:'Yes',probability:.95},{label:'No',probability:.05}], volume:'962K', rule:'This market resolves from Exodus 14:21–22.'
  },
  {
    id:'elijah-fire', type:'binary', category:'Prophets', sub:'1 Kings', reference:'1 Kings 18:36–38', title:'Will fire consume Elijah’s offering?', thumb:'fire', activity:'542K predictions',
    outcomes:[{label:'Yes',probability:.93},{label:'No',probability:.07}], volume:'542K', rule:'This market resolves from 1 Kings 18:36–38.'
  },
  {
    id:'peter-water', type:'binary', category:'Miracles', sub:'Matthew', reference:'Matthew 14:28–29', title:'Will Peter step out and walk toward Jesus?', thumb:'water', activity:'411K predictions',
    outcomes:[{label:'Yes',probability:.88},{label:'No',probability:.12}], volume:'411K', rule:'This market resolves from Matthew 14:28–29.'
  },
  {
    id:'jonah', type:'multi', category:'Prophets', sub:'Jonah', reference:'Jonah 1:1–3', title:'Where does Jonah go after God tells him to go to Nineveh?', thumb:'ship', activity:'318K predictions',
    outcomes:[{label:'Tarshish',probability:.91},{label:'Nineveh',probability:.09}], volume:'318K', rule:'This market resolves from Jonah 1:1–3.'
  },
  {
    id:'good-samaritan', type:'multi', category:'Parables', sub:'Luke', reference:'Luke 10:30–37', title:'Who stops to help the wounded man?', thumb:'road', activity:'250K predictions',
    outcomes:[{label:'A Samaritan',probability:.93},{label:'A priest',probability:.04}], volume:'250K', rule:'This market resolves from Luke 10:30–37.'
  }
];

const featured = [
  {
    id:'david-goliath', category:'History', tag:'1 Samuel', title:'Will David defeat Goliath?', thumb:'david', volume:'82K predictions',
    outcomes:[{label:'David wins',probability:.83,color:'#63b3ff'},{label:'Goliath wins',probability:.17,color:'#ffad1f'},{label:'David flees',probability:.01,color:'#ffca10'},{label:'Saul fights',probability:.01,color:'#ff7f1f'}],
    comments:[['ShepherdKing','The sling changes everything.'],['Acts238','Read the passage before you answer.']]
  },
  {
    id:'red-sea', category:'Torah', tag:'Exodus', title:'Will the sea divide for Israel?', thumb:'sea', volume:'63K predictions',
    outcomes:[{label:'Yes',probability:.95,color:'#63b3ff'},{label:'No',probability:.05,color:'#ffad1f'},{label:'Before dawn',probability:.72,color:'#ffca10'},{label:'After dawn',probability:.28,color:'#ff7f1f'}],
    comments:[['MosesFan','Dry ground is the key detail.'],['TorahDaily','Exodus 14 resolves this one.']]
  },
  {
    id:'paul-rome', category:'Acts', tag:'Paul', title:'Will Paul eventually reach Rome?', thumb:'paul', volume:'44K predictions',
    outcomes:[{label:'Yes',probability:.92,color:'#63b3ff'},{label:'No',probability:.08,color:'#ffad1f'},{label:'By ship',probability:.88,color:'#ffca10'},{label:'By land',probability:.12,color:'#ff7f1f'}],
    comments:[['RoadToRome','Acts 28 has the answer.'],['Berean','Lock first, then read.']]
  }
];

const state = {
  route: parseRoute(location.hash),
  marketTopic:'All',
  query:'', featuredIndex:0,
  ticket:{marketId:'david-goliath', outcomeIndex:0, side:'yes', amount:0, mode:'buy'},
  balance:Number(localStorage.getItem('hm_balance')||2450),
  predictions:JSON.parse(localStorage.getItem('hm_predictions')||'{}'),
  scripture:{},
  mobileTicket:false,
  livePercent:51
};

function parseRoute(hash){
  const clean=(hash||'#/').replace(/^#/,'');
  if(clean.startsWith('/markets')) return {name:'markets'};
  if(clean.startsWith('/event/')) return {name:'event', id:decodeURIComponent(clean.split('/')[2]||'david-goliath')};
  return {name:'home'};
}
function marketById(id){return markets.find(m=>m.id===id)||markets[0];}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function pct(v){const n=Math.round(Number(v)*100);return n<1?'<1%':`${n}%`;}
function cents(v){const n=Math.round(Number(v)*100);return n<1?'<1¢':`${n}¢`;}
function save(){localStorage.setItem('hm_balance',String(state.balance));localStorage.setItem('hm_predictions',JSON.stringify(state.predictions));}

const ico = (name,cls='') => {
  const icons={
    search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.6 2.6 0 0 1 5 1c0 2-2.7 2.2-2.7 4"/><path d="M12 17.5h.01"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    trend:'<path d="M3 16l5-5 4 3 7-8"/><path d="M14 6h5v5"/>',
    sliders:'<path d="M4 6h8M16 6h4M8 12H4M12 12h8M4 18h12M20 18h0"/><circle cx="14" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    bookmark:'<path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z"/>',
    gift:'<path d="M4 10h16v11H4zM2.5 7h19v4h-19zM12 7v14"/><path d="M12 7H8.5A2.5 2.5 0 1 1 11 4.5V7Zm0 0h3.5A2.5 2.5 0 1 0 13 4.5V7Z"/>',
    link:'<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/>',
    code:'<path d="m9 18-6-6 6-6M15 6l6 6-6 6"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    chevron:'<path d="m9 18 6-6-6-6"/>'
  };
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${icons[name]||''}</svg>`;
};

function mark(){
  return `<svg class="holy-mark" viewBox="0 0 34 34" aria-hidden="true"><path d="M3 8.2 17 3v28L3 25.8V8.2Z"/><path d="M17 3 31 8.2v17.6L17 31"/><path d="M8 11.3 17 8v18l-9-3.3V11.3Z"/></svg>`;
}
function miniThumb(key,size='normal'){
  const map={
    david:['#5c321b','#d79a55','D'], lazarus:['#1b6b64','#7cc9b7','L'], tomb:['#24486f','#f0f1d5','✦'], walls:['#6c533a','#b89c72','J'], samson:['#512f5e','#bd78c4','S'], paul:['#2c5c65','#77b7c1','P'], mountain:['#635847','#c2b28f','A'], sea:['#145a77','#5db6d6','≈'], fire:['#7b2e1d','#f08a35','F'], water:['#265b78','#7cc8df','W'], ship:['#3b5d70','#b1cbd7','J'], road:['#6a563a','#c8ac78','S']
  };
  const [a,b,t]=map[key]||['#39434c','#6d7a84','✦'];
  return `<span class="thumb ${size==='sm'?'thumb-sm':''}" style="--ta:${a};--tb:${b}"><span>${t}</span></span>`;
}

function header(active='home'){
  return `<header class="site-header">
    <div class="topbar exact-width">
      <a href="#/" class="brand">${mark()}<span>HolyMarket</span></a>
      <label class="global-search">${ico('search')}<input id="global-search" placeholder="Search HolyMarket..." autocomplete="off"><kbd>/</kbd></label>
      <a class="primary-cta" href="#/markets">Explore Scripture <span>↗</span></a>
      <button class="round-icon" aria-label="Help">${ico('help')}</button>
      <button class="round-icon menu-icon" aria-label="Menu">${ico('menu')}</button>
    </div>
    <nav class="top-nav">
      <div class="top-nav-scroll exact-width">
        <a class="nav-link ${active==='home'?'active':''}" href="#/">${ico('trend')}Trending</a>
        <a class="nav-link" href="#/markets"><span class="nav-special">◫</span>Combos</a>
        <a class="nav-link" href="#/markets"><span class="nav-special">♮</span>Perps</a>
        <a class="nav-link" href="#/markets">Breaking</a>
        <a class="nav-link" href="#/markets">New</a><span class="nav-divider"></span>
        ${['Gospels','History','Torah','Prophets','Acts','Letters','Miracles','Parables','Revelation'].map(x=>`<a class="nav-link" href="#/markets">${x}</a>`).join('')}
        <button class="nav-more">${ico('chevron')}</button>
      </div>
    </nav>
  </header>`;
}
function notice(){return `<div class="noticebar">${ico('globe')}<span>HolyMarket uses virtual Talents. Predict first, then reveal the Scripture.</span><span class="notice-link">Learn more ↗</span></div>`;}

function outcomeRows(m){
  const rows=m.outcomes.slice(0,2);
  return rows.map((o,i)=>`<div class="market-outcome-row"><span class="outcome-label">${esc(o.label)}</span><strong>${pct(o.probability)}</strong><button class="mini mini-yes" data-open-event="${m.id}" data-index="${i}" data-side="yes">Yes</button><button class="mini mini-no" data-open-event="${m.id}" data-index="${i}" data-side="no">No</button></div>`).join('');
}
function multiCard(m){
 return `<article class="market-card multi-card" data-open-card="${m.id}">
   <div class="market-card-title">${miniThumb(m.thumb)}<h3>${esc(m.title)}</h3></div>
   <div class="market-card-rows">${outcomeRows(m)}</div>
   <div class="market-card-footer"><span>${esc(m.volume)} Vol.</span><span class="swap">⇄</span><span class="spacer"></span>${ico('gift')}${ico('bookmark')}</div>
 </article>`;
}
function binaryCard(m){
 const o=m.outcomes[0];
 return `<article class="market-card binary-card" data-open-card="${m.id}">
   <div class="market-card-title">${miniThumb(m.thumb)}<h3>${esc(m.title)}</h3></div>
   <div class="binary-middle"><div><span class="binary-date">${esc(m.reference.split(':')[0])}</span><strong>${pct(o.probability)}</strong></div><div class="binary-actions"><button class="mini mini-yes" data-open-event="${m.id}" data-index="0" data-side="yes">Yes</button><button class="mini mini-no" data-open-event="${m.id}" data-index="0" data-side="no">No</button></div></div>
   <div class="market-card-footer"><span>${esc(m.volume)} Vol.</span><span class="spacer"></span>${ico('gift')}${ico('bookmark')}</div>
 </article>`;
}
function liveCard(m){
 return `<article class="market-card live-card" data-open-card="${m.id}">
   <div class="live-title">${miniThumb(m.thumb)}<h3>${esc(m.title)}</h3><div class="gauge"><svg viewBox="0 0 76 47"><path class="gauge-base" d="M7 41a31 31 0 0 1 62 0"/><path class="gauge-progress" d="M7 41a31 31 0 0 1 62 0"/></svg><strong data-live-percent>${state.livePercent}%</strong><span>Up</span></div></div>
   <div class="live-floats"><i>+ ◈5</i><i>+ ◈49</i><i>+ ◈10</i><i>+ ◈186</i></div>
   <div class="live-buttons"><button class="live-up" data-open-event="${m.id}" data-index="0" data-side="yes">Up</button><button class="live-down" data-open-event="${m.id}" data-index="1" data-side="yes">Down</button></div>
   <div class="market-card-footer"><span class="live-meta"><b></b>LIVE <em>· ${esc(m.category)}</em></span><span class="spacer"></span>${ico('bookmark')}</div>
 </article>`;
}
function matchupCard(m){
 const [a,b]=m.teams;
 return `<article class="market-card matchup-card" data-open-card="${m.id}">
   <div class="teamline">${miniThumb(m.thumb,'sm')}<span class="score">${a.score}</span><span class="teamname">${esc(a.name)}</span><strong>${pct(a.probability)}</strong></div>
   <div class="teamline">${miniThumb(m.thumb==='samson'?'walls':'samson','sm')}<span class="score">${b.score}</span><span class="teamname">${esc(b.name)}</span><strong>${pct(b.probability)}</strong></div>
   <div class="match-buttons"><button class="team-a" data-open-event="${m.id}" data-index="0" data-side="yes">${esc(a.short)}</button><button class="team-b" data-open-event="${m.id}" data-index="1" data-side="yes">${esc(b.short)}</button></div>
   <div class="market-card-footer"><span class="story-live"><b></b>${esc(m.stage)}</span><span>${esc(m.volume)} Vol.</span><span>· ${esc(m.sub)}</span><span class="spacer"></span>${ico('bookmark')}</div>
 </article>`;
}
function card(m){return m.type==='live'?liveCard(m):m.type==='matchup'?matchupCard(m):m.type==='binary'?binaryCard(m):multiCard(m);}

function featuredChart(f){
 const paths=[
   'M14 86 L37 77 L52 67 L67 70 L82 64 L96 74 L114 50 L129 53 L141 36 L160 40 L178 38 L194 54 L212 46 L232 48 L250 62 L267 60 L284 66 L304 58 L321 61 L338 70 L356 66 L374 74 L392 54 L410 58 L425 46',
   'M14 119 L38 125 L56 104 L70 110 L87 114 L105 82 L123 90 L141 96 L160 113 L179 107 L196 100 L214 104 L232 102 L248 96 L268 91 L286 105 L306 98 L325 90 L342 97 L359 78 L377 82 L395 69 L425 102',
   'M14 163 L60 161 L102 164 L140 162 L184 164 L228 163 L272 164 L315 162 L365 164 L425 163',
   'M14 166 L60 166 L110 166 L160 165 L210 166 L260 166 L310 165 L360 166 L425 165'
 ];
 return `<div class="hero-chart"><div class="chart-legend">${f.outcomes.map(o=>`<span><i style="background:${o.color}"></i>${esc(o.label)} ${pct(o.probability)}</span>`).join('')}</div><svg viewBox="0 0 460 190" preserveAspectRatio="none"><g class="grid-lines"><line x1="0" y1="32" x2="430" y2="32"/><line x1="0" y1="79" x2="430" y2="79"/><line x1="0" y1="126" x2="430" y2="126"/><line x1="0" y1="173" x2="430" y2="173"/></g>${paths.map((d,i)=>`<path class="hero-line line-${i}" d="${d}" style="--line:${f.outcomes[i]?.color||'#fff'}"/>`).join('')}<circle class="end-dot" cx="425" cy="54" r="5" fill="#63b3ff"/><circle class="end-dot dot2" cx="425" cy="102" r="5" fill="#2e96ff"/><circle cx="425" cy="163" r="5" fill="#ffad1f"/></svg><div class="axis-labels"><span>80%</span><span>60%</span><span>40%</span><span>20%</span><span>0%</span></div><div class="trade-bursts"><span>+ ◈6</span><span>+ ◈4</span><span>+ ◈124</span><span>+ ◈1,963</span><span>+ ◈2</span></div></div>`;
}
function featuredCard(f){
 return `<section class="featured-hero" data-featured-market="${f.id}">
   <div class="featured-left">
     <div class="featured-heading">${miniThumb(f.thumb)}<div><div class="featured-meta">${esc(f.category)} · ${esc(f.tag)}</div><h1>${esc(f.title)}</h1></div><span class="hero-actions">${ico('link')}${ico('bookmark')}</span></div>
     <div class="featured-outcomes">${f.outcomes.map(o=>`<div><span>${esc(o.label)}</span><strong>${pct(o.probability)}</strong></div>`).join('')}</div>
     <div class="comment-list">${f.comments.map(([u,t],i)=>`<div class="comment"><span class="avatar av${i}"></span><div><strong>${esc(u)}</strong><p>${esc(t)}</p></div></div>`).join('')}</div>
     <div class="featured-volume">◈${esc(f.volume)}</div>
   </div>
   <div class="featured-right">${featuredChart(f)}<div class="chart-footer"><span>⇄ Monthly</span><span>◁ HolyMarket</span></div></div>
 </section>`;
}
function discoveryRail(){
 const news=[['Will Jesus calm the storm?','95%','↗ 77%','up'],['Will Jonah go directly to Nineveh?','12%','↘ 65%','down'],['Will Peter deny Jesus three times?','93%','↗ 20%','up']];
 const hot=[['David','◈942K today'],['Paul','◈3M today'],['Moses','◈4M today'],['Peter','◈4M today'],['Jonah','◈16.1K today']];
 return `<aside class="discovery"><section><h2>Breaking News <span>›</span></h2>${news.map((n,i)=>`<div class="news-row"><span class="rank">${i+1}</span><p>${n[0]}</p><div><strong>${n[1]}</strong><small class="${n[3]}">${n[2]}</small></div></div>`).join('')}</section><section class="hot-section"><h2>Hot topics <span>›</span></h2>${hot.map((h,i)=>`<div class="hot-row"><span class="rank">${i+1}</span><strong>${h[0]}</strong><small>${h[1]} <b>♦</b></small><span>›</span></div>`).join('')}</section><a class="explore-all" href="#/markets">Explore all</a></aside>`;
}
function homePage(){
 const f=featured[state.featuredIndex];
 return `${header('home')}${notice()}<main class="home-shell exact-width"><div class="hero-layout">${featuredCard(f)}${discoveryRail()}</div><div class="carousel-under"><div class="carousel-dots"><span class="pill"></span>${[0,1,2,3,4,5].map((_,i)=>`<button class="dot ${i===state.featuredIndex?'active':''}" data-carousel="${i%featured.length}"></button>`).join('')}</div><div class="carousel-tags"><a href="#/markets">‹ Gospels</a><a href="#/markets">History ›</a></div></div></main>`;
}
function marketsPage(){
 let visible=markets.filter(m=>state.marketTopic==='All'||`${m.title} ${m.category} ${m.sub} ${m.reference}`.toLowerCase().includes(state.marketTopic.toLowerCase()));
 if(state.query.trim()) visible=visible.filter(m=>`${m.title} ${m.category} ${m.sub} ${m.reference}`.toLowerCase().includes(state.query.trim().toLowerCase()));
 return `${header('markets')}<main class="all-shell exact-width"><div class="all-title"><h1>All markets</h1><div class="all-tools"><button data-focus-search>${ico('search')}</button><button>${ico('sliders')}</button><button>${ico('bookmark')}</button></div></div><div class="market-topic-rail">${MARKET_TOPICS.map(t=>`<button class="market-topic ${state.marketTopic===t?'active':''}" data-topic="${t}">${esc(t)}</button>`).join('')}<span class="rail-arrow">›</span></div><div class="desktop-filterbar"><label>${ico('search')}<input id="market-search" value="${esc(state.query)}" placeholder="Search"></label><button>24hr Volume⌄</button><button class="active">All</button><button>Active</button><label><span></span>Hide sports</label><label><span></span>Hide crypto</label><label><span></span>Hide earnings</label></div><div class="all-grid">${visible.map(card).join('')}</div>${visible.length?'':'<div class="empty-state">No Scripture markets found.</div>'}</main>`;
}

function eventChart(m,a,b){
 return `<div class="event-chart"><svg viewBox="0 0 610 250" preserveAspectRatio="none"><g class="event-grid"><line x1="0" y1="25" x2="570" y2="25"/><line x1="0" y1="87" x2="570" y2="87"/><line x1="0" y1="149" x2="570" y2="149"/><line x1="0" y1="211" x2="570" y2="211"/></g><path class="event-line a" d="M30 142 L70 126 L105 131 L140 115 L170 120 L205 108 L245 111 L282 98 L320 103 L360 96 L405 93 L445 85 L480 82 L520 73"/><path class="event-line b" d="M30 211 L90 208 L150 210 L210 209 L270 210 L330 208 L390 209 L450 207 L520 209"/><circle cx="520" cy="73" r="5" class="event-dot a"/><circle cx="520" cy="209" r="5" class="event-dot b"/></svg><div class="event-axis"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div class="event-time">9:00 AM</div><div class="event-label event-label-a"><i></i><span>${esc(a.name)}</span><strong>${pct(a.probability)}</strong></div><div class="event-label event-label-b"><i></i><span>${esc(b.name)}</span><strong>${pct(b.probability)}</strong></div></div>`;
}
function ticket(m){
 const outcomes=m.outcomes||[];
 const selected=outcomes[state.ticket.outcomeIndex]||outcomes[0]||{label:'Yes',probability:.5};
 const other=outcomes[1]||{label:'No',probability:1-selected.probability};
 const amt=Number(state.ticket.amount)||0;
 return `<div class="combo-button"><span>◫</span>Build a combo</div><div class="trade-ticket">
   <div class="ticket-market">${miniThumb(m.thumb,'sm')}<div><span>${esc(m.title)}</span><strong>${esc(selected.label)}</strong></div></div>
   <div class="ticket-tabs"><button class="active">Predict</button><button>Review</button><button class="ticket-market-type">Market⌄</button></div>
   <div class="ticket-outcomes"><button class="active" data-ticket-outcome="0">${esc(selected.label.slice(0,10))} ${cents(selected.probability)}</button><button data-ticket-outcome="1">${esc(other.label.slice(0,10))} ${cents(other.probability)}</button></div>
   <div class="amount-row"><label>Amount</label><div class="amount-field"><span>◈</span><input data-amount-input inputmode="numeric" type="number" value="${amt||''}" placeholder="0"></div></div>
   <div class="quick-add"><button data-add="1">+◈1</button><button data-add="5">+◈5</button><button data-add="10">+◈10</button><button data-add="100">+◈100</button></div>
   <button class="trade-button" data-lock>${state.predictions[m.id]?'Prediction locked':'Predict'}</button>
 </div>`;
}
function scripturePanel(m){
 const pred=state.predictions[m.id];
 const s=state.scripture[m.id];
 if(!pred) return `<section class="below-event"><div class="event-tabs"><button class="active">Comments</button><button>Activity</button><button>Scripture</button><button>Rules</button></div><div class="comment-placeholder"><span class="avatar"></span><div><strong>HolyMarket</strong><p>Lock a prediction to reveal the passage that resolves this market.</p></div></div></section>`;
 if(!s || s.status==='loading') return `<section class="below-event"><div class="event-tabs"><button>Comments</button><button>Activity</button><button class="active">Scripture</button><button>Rules</button></div><div class="scripture-loading"><span></span><span></span><span></span><span></span></div></section>`;
 const d=s.data||{};
 return `<section class="below-event"><div class="event-tabs"><button>Comments</button><button>Activity</button><button class="active">Scripture</button><button>Rules</button></div><div class="scripture-panel"><div><strong>${esc(d.reference||m.reference)}</strong><small>${esc(d.version_title||'Bible')}</small></div><p>${esc(d.content||'')}</p><small>${esc(d.attribution||d.copyright||'')}</small></div></section>`;
}
function eventPage(m){
 const teams=m.teams||[{name:m.outcomes[0]?.label||'Yes',score:1,probability:m.outcomes[0]?.probability||.5},{name:m.outcomes[1]?.label||'No',score:0,probability:m.outcomes[1]?.probability||.5}];
 const [a,b]=teams;
 return `${header('event')}${notice()}<main class="event-shell exact-width"><section class="event-main"><div class="event-breadcrumb">${esc(m.category)} · ${esc(m.sub)} · ${esc(m.reference.split(':')[0])}</div><div class="event-title"><h1>${esc(m.title)}</h1><div class="event-tools">${ico('sliders')}${ico('code')}${ico('bookmark')}${ico('link')}</div></div><div class="event-meta"><span class="event-red">● ${m.stage||'Story 2 of 3'}</span><span>${esc(m.volume)} Vol.</span></div><div class="scoreboard"><div class="score-header"><span></span><span></span><span>V1</span><span class="hot">V2</span><span>V3</span><span>ODDS</span></div><div class="score-line">${miniThumb(m.thumb,'sm')}<strong>${esc(a.name)}</strong><span>${a.score===undefined?'13':a.score}</span><span>${a.score===undefined?'12':Math.max(0,a.score-1)}</span><span>–</span><b>${pct(a.probability)}</b></div><div class="score-line">${miniThumb(m.thumb==='david'?'walls':'samson','sm')}<strong>${esc(b.name)}</strong><span>${b.score===undefined?'5':b.score}</span><span>${b.score===undefined?'11':Math.max(0,b.score)}</span><span>–</span><b>${pct(b.probability)}</b></div></div>${eventChart(m,a,b)}${scripturePanel(m)}</section><aside class="ticket-side">${ticket(m)}</aside></main><button class="mobile-predict" data-mobile-ticket>Predict</button><div class="mobile-ticket ${state.mobileTicket?'open':''}"><div class="mobile-backdrop" data-close-ticket></div><div class="mobile-sheet"><button class="sheet-close" data-close-ticket>×</button>${ticket(m)}</div></div>`;
}

function render(){
 state.route=parseRoute(location.hash);
 if(state.route.name==='markets') app.innerHTML=marketsPage();
 else if(state.route.name==='event') { const m=marketById(state.route.id); state.ticket.marketId=m.id; app.innerHTML=eventPage(m); }
 else app.innerHTML=homePage();
 bind();
}
function openEvent(id,index=0,side='yes'){
 state.ticket.marketId=id; state.ticket.outcomeIndex=Number(index)||0; state.ticket.side=side; state.ticket.amount=0; location.hash=`#/event/${encodeURIComponent(id)}`;
}
async function loadScripture(m){
 if(state.scripture[m.id]?.status==='loading'||state.scripture[m.id]?.status==='ready')return;
 state.scripture[m.id]={status:'loading'};render();
 try{
   let d; try{const r=await fetch(`/api/scripture?ref=${encodeURIComponent(m.reference)}`);if(r.ok)d=await r.json();}catch{}
   if(!d){const r=await fetch(`https://bible-api.com/${encodeURIComponent(m.reference)}?translation=web`);if(r.ok){const x=await r.json();d={provider:'web',reference:x.reference||m.reference,content:x.text||'',version_title:'World English Bible',attribution:'World English Bible — public domain'};}}
   if(!d)throw new Error('Scripture unavailable'); state.scripture[m.id]={status:'ready',data:d};
 }catch{state.scripture[m.id]={status:'ready',data:{reference:m.reference,content:'Open the passage to see how Scripture resolves this market.',version_title:'Scripture',attribution:''}};}
 render();
}
function lockPrediction(){
 const m=marketById(state.ticket.marketId); if(state.predictions[m.id])return;
 const amount=Math.max(0,Math.min(Number(state.ticket.amount)||0,state.balance));
 state.predictions[m.id]={amount,outcomeIndex:state.ticket.outcomeIndex,side:state.ticket.side}; state.balance=Math.max(0,state.balance-amount); save(); loadScripture(m);
}
function bind(){
 document.querySelectorAll('[data-open-event]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();openEvent(el.dataset.openEvent,el.dataset.index,el.dataset.side);}));
 document.querySelectorAll('[data-open-card]').forEach(el=>el.addEventListener('click',()=>openEvent(el.dataset.openCard)));
 document.querySelectorAll('[data-carousel]').forEach(el=>el.addEventListener('click',()=>{state.featuredIndex=Number(el.dataset.carousel)%featured.length;render();}));
 document.querySelector('[data-featured-market]')?.addEventListener('dblclick',()=>openEvent(document.querySelector('[data-featured-market]').dataset.featuredMarket));
 document.querySelectorAll('[data-topic]').forEach(el=>el.addEventListener('click',()=>{state.marketTopic=el.dataset.topic;render();}));
 document.querySelector('[data-focus-search]')?.addEventListener('click',()=>{const x=document.querySelector('#market-search');x?.focus();});
 document.querySelector('#market-search')?.addEventListener('input',e=>{state.query=e.target.value;render();queueMicrotask(()=>{const x=document.querySelector('#market-search');if(x){x.focus();x.setSelectionRange(state.query.length,state.query.length);}})});
 document.querySelector('#global-search')?.addEventListener('keydown',e=>{if(e.key==='Enter'){state.query=e.target.value;location.hash='#/markets';}});
 document.querySelectorAll('[data-ticket-outcome]').forEach(el=>el.addEventListener('click',()=>{state.ticket.outcomeIndex=Number(el.dataset.ticketOutcome);render();}));
 document.querySelectorAll('[data-amount-input]').forEach(el=>el.addEventListener('input',e=>{state.ticket.amount=Math.max(0,Number(e.target.value)||0);}));
 document.querySelectorAll('[data-add]').forEach(el=>el.addEventListener('click',()=>{state.ticket.amount=Math.min(state.balance,(Number(state.ticket.amount)||0)+Number(el.dataset.add));render();}));
 document.querySelectorAll('[data-lock]').forEach(el=>el.addEventListener('click',lockPrediction));
 document.querySelector('[data-mobile-ticket]')?.addEventListener('click',()=>{state.mobileTicket=true;render();});
 document.querySelectorAll('[data-close-ticket]').forEach(el=>el.addEventListener('click',()=>{state.mobileTicket=false;render();}));
}

window.addEventListener('hashchange',render);
window.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement?.tagName||'')){e.preventDefault();document.querySelector('#global-search')?.focus();}});
setInterval(()=>{
 state.livePercent=48+Math.floor(Math.random()*8);
 const node=document.querySelector('[data-live-percent]');if(node){node.textContent=`${state.livePercent}%`;node.classList.add('flash');setTimeout(()=>node.classList.remove('flash'),380);}
},2600);
setInterval(()=>{if(parseRoute(location.hash).name==='home'){state.featuredIndex=(state.featuredIndex+1)%featured.length;render();}},11000);
render();

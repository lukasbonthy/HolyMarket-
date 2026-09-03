const MARKET_LABELS={
  'david-goliath':['David wins 83¢','Goliath wins 17¢'],
  'lazarus-live':['Lazarus 51¢','Remains 49¢'],
  'resurrection':['No 78¢','Yes 22¢'],
  'jericho':['Israel 82¢','Jericho 18¢'],
  'samson':['Samson 87¢','Philistines 13¢'],
  'paul-rome':['Yes 99¢','No 1¢'],
  'abraham-isaac':['Yes 14¢','No 86¢'],
  'red-sea':['Yes 95¢','No 5¢'],
  'elijah-fire':['Yes 93¢','No 7¢'],
  'peter-water':['Yes 88¢','No 12¢'],
  'jonah':['Tarshish 91¢','Nineveh 9¢'],
  'good-samaritan':['Samaritan 93¢','Priest 4¢']
};

function route(){
  const h=location.hash||'#/';
  if(h.startsWith('#/markets'))return'markets';
  if(h.startsWith('#/event/'))return'event';
  return'home';
}
function eventId(){return decodeURIComponent(location.hash.split('/')[2]||'david-goliath')}

function homeExtra(){return `<section class="home-below pm-extra"><div class="home-below-head"><h2>All markets</h2><a href="#/markets">Explore all ›</a></div><div class="below-topic-strip"><span class="active">All</span><span>Jesus</span><span>David</span><span>Gospels</span><span>Torah</span><span>Miracles</span><span>Acts</span></div><div class="home-preview-grid"><a href="#/event/peter-water"><strong>Will Peter walk toward Jesus?</strong><span>88%</span><small>411K Vol.</small></a><a href="#/event/red-sea"><strong>Will the Red Sea divide?</strong><span>95%</span><small>962K Vol.</small></a><a href="#/event/elijah-fire"><strong>Will fire consume Elijah’s offering?</strong><span>93%</span><small>542K Vol.</small></a></div></section>`}
function marketsExtra(){return `<section class="market-longform pm-extra"><div class="long-divider"></div><h2>Frequently Asked Questions</h2><div class="faq-list"><details><summary>What is HolyMarket?</summary><p>HolyMarket is a Scripture prediction learning concept. Community percentages represent virtual picks, and every market resolves from a cited Bible passage.</p></details><details><summary>How do HolyMarket odds work?</summary><p>Percentages show the share of virtual community predictions for each answer. Talents are learning points and have no cash value.</p></details><details><summary>How are Scripture markets resolved?</summary><p>Each market cites the passage used to resolve it. After a prediction is locked, the site reveals that passage and the market result.</p></details><details><summary>Where can I see the Scripture behind a market?</summary><p>Open a market, lock a prediction, then use the Scripture section below the chart.</p></details></div><div class="popular-block"><h3>Popular HolyMarket topics</h3><div><a href="#/markets">Jesus</a><a href="#/markets">David</a><a href="#/markets">Moses</a><a href="#/markets">Miracles</a><a href="#/markets">Prophecy</a><a href="#/markets">Acts</a><a href="#/markets">Parables</a></div></div><footer class="site-footer"><strong>HolyMarket</strong><p>Scripture prediction markets for learning. Virtual Talents only.</p><nav><a href="#/">Home</a><a href="#/markets">Markets</a><a href="#/markets">About</a><a href="#/markets">Help</a></nav><small>© 2026 HolyMarket · Talents have no cash value.</small></footer></section>`}
function eventExtra(){return `<section class="event-longform pm-extra"><div class="event-context-tabs"><button class="active">Rules</button><button>Market Context</button></div><div class="rules-box"><h3>Rules</h3><p>This market resolves according to the cited Scripture passage. HolyMarket reveals the passage after a user locks a virtual prediction.</p></div><div class="market-facts"><div><small>Volume</small><strong>◈ 82K</strong></div><div><small>Market status</small><strong>Active</strong></div><div><small>Resolution source</small><strong>Scripture</strong></div><div><small>Points</small><strong>Virtual only</strong></div></div><div class="event-comments"><h2>Comments</h2><div class="compose-row"><span></span><input placeholder="Add a comment"><button>Post</button></div><div class="comment-row"><span></span><div><strong>BereanReader</strong><p>I like that the verse stays hidden until after the prediction.</p><small>12m</small></div></div><div class="comment-row"><span></span><div><strong>ScriptureDaily</strong><p>The cited passage makes the resolution clear.</p><small>24m</small></div></div></div></section>`}

function refineTicket(){
  if(route()!=='event')return;
  const labels=MARKET_LABELS[eventId()]||MARKET_LABELS['david-goliath'];
  document.querySelectorAll('.ticket-outcomes').forEach(row=>{
    const buttons=row.querySelectorAll('button');
    if(buttons[0]&&buttons[0].textContent!==labels[0])buttons[0].textContent=labels[0];
    if(buttons[1]&&buttons[1].textContent!==labels[1])buttons[1].textContent=labels[1];
  });
}

function decorate(){
  const root=document.querySelector('#app');
  if(!root)return;
  const r=route();
  if(!root.querySelector('.pm-extra')){
    if(r==='home')root.querySelector('.home-shell')?.insertAdjacentHTML('beforeend',homeExtra());
    if(r==='markets')root.querySelector('.all-shell')?.insertAdjacentHTML('beforeend',marketsExtra());
    if(r==='event')root.querySelector('.event-main')?.insertAdjacentHTML('beforeend',eventExtra());
  }
  refineTicket();
}

function scheduleDecorate(){setTimeout(decorate,0)}

document.addEventListener('click',event=>{
  const hero=event.target.closest?.('[data-featured-market]');
  if(hero&&!event.target.closest('a,button')){
    const id=hero.dataset.featuredMarket;
    if(id)location.hash=`#/event/${encodeURIComponent(id)}`;
  }
  scheduleDecorate();
});

document.addEventListener('input',scheduleDecorate);
window.addEventListener('hashchange',scheduleDecorate);
window.addEventListener('pageshow',scheduleDecorate);
requestAnimationFrame(decorate);

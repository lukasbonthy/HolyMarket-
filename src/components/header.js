import { icon } from './icons.js';
export function header(route='home'){
  return `<header class="site-header">
    <div class="topbar">
      <a class="brand" href="#/" aria-label="BibleBet home"><span class="brand-mark"><svg viewBox="0 0 32 32"><path d="M4 7.5 16 3v26L4 24.5V7.5Zm12-4.5 12 4.5v17L16 29"/><path d="M8 10.5 16 8v16l-8-2.5v-11Z"/></svg></span><span class="brand-name">BibleBet</span></a>
      <label class="header-search">${icon('search')}<input id="global-search" placeholder="Search Bible markets..."/><kbd>/</kbd></label>
      <button class="us-cta">Explore Scripture <span>↗</span></button>
      <button class="top-icon">${icon('help')}</button><button class="top-icon">${icon('menu')}</button>
    </div>
    <div class="topicbar"><div class="topicbar-scroll">
      <a class="topic primary ${route==='home'?'active':''}" href="#/">${icon('arrowUp')}Trending</a>
      <a class="topic" href="#/markets"><span class="combo-icon">◫</span>Combos</a>
      <a class="topic" href="#/markets"><span class="perp-icon">☷</span>Perps</a>
      <a class="topic" href="#/markets">Breaking</a><a class="topic" href="#/markets">New</a><span class="divider"></span>
      ${['Gospels','History','Torah','Prophets','Acts','Letters','Miracles','Parables','Revelation','Theology'].map(x=>`<a class="topic" href="#/markets">${x}</a>`).join('')}
      <span class="topic-next">›</span>
    </div></div>
  </header>`;
}
export function notice(){ return `<div class="noticebar">${icon('globe')}<span>BibleBet uses virtual Talents only. Predict first, then reveal the Scripture.</span><span class="notice-arrow">↗</span></div>`; }

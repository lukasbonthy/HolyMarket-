import { icon, thumb } from './icons.js';
import { formatPercent } from '../core.js';
const yesNo=(outcome,i,marketId)=>`<div class="outcome-row"><span class="outcome-name">${outcome.label}</span><strong>${formatPercent(outcome.probability)}</strong><button class="yes-mini" data-open-event="${marketId}" data-index="${i}" data-side="yes">Yes</button><button class="no-mini" data-open-event="${marketId}" data-index="${i}" data-side="no">No</button></div>`;
export function standardCard(m){
 return `<article class="market-card standard-card" data-open-event="${m.id}"><div class="card-title">${thumb(m.thumb)}<h3>${m.title}</h3></div><div class="card-outcomes">${m.outcomes.slice(0,2).map((x,i)=>yesNo(x,i,m.id)).join('')}</div><footer><span>${m.activity}</span><span class="footer-icons">${icon('gift')}${icon('bookmark')}</span></footer></article>`;
}
export function liveCard(m){
 return `<article class="market-card live-card" data-open-event="${m.id}"><div class="live-head">${thumb(m.thumb)}<h3>${m.title}</h3><div class="gauge" style="--p:${Math.round(m.probability*100)}"><svg viewBox="0 0 64 38"><path class="gauge-bg" d="M7 33a25 25 0 0 1 50 0"/><path class="gauge-fg" d="M7 33a25 25 0 0 1 50 0"/></svg><strong data-live-percent>${formatPercent(m.probability)}</strong><small>Up</small></div></div><div class="float-activity"><span>+ ◈5</span><span>+ ◈5</span><span>+ ◈15</span></div><div class="updown"><button class="up-button" data-open-event="${m.id}">Up</button><button class="down-button" data-open-event="${m.id}">Down</button></div><footer><span class="live-label"><i></i> LIVE <b>· ${m.category}</b></span>${icon('bookmark')}</footer></article>`;
}
export function matchupCard(m){
 const [a,b]=m.teams;
 return `<article class="market-card matchup-card" data-open-event="${m.id}"><div class="team-row">${thumb(m.thumb,'sm')}<span class="team-score">${a.score}</span><span class="team-name">${a.name}</span><strong>${formatPercent(a.probability)}</strong></div><div class="team-row">${thumb(m.thumb==='david'?'walls':'armor','sm')}<span class="team-score">${b.score}</span><span class="team-name">${b.name}</span><strong>${formatPercent(b.probability)}</strong></div><div class="matchup-buttons"><button class="team-a">${a.name}</button><button class="team-b">${b.name}</button></div><footer><span class="game-label"><i></i> STORY</span><span>${m.activity}</span>${icon('bookmark')}</footer></article>`;
}
export function cardFor(m){ return m.type==='live'?liveCard(m):m.type==='matchup'?matchupCard(m):standardCard(m); }

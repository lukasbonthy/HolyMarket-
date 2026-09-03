import { breaking, hotTopics } from '../data.js';
import { thumb, icon } from './icons.js';
import { featuredChart } from './charts.js';
import { formatPercent } from '../core.js';
export function featuredMarket(f,index=0){
 return `<section class="featured-card" data-featured-market="${f.marketId}"><div class="featured-header"><div class="featured-titleline">${thumb(f.thumb,'lg')}<div><div class="featured-kicker">${f.category}</div><h1>${f.title}</h1></div></div><div class="featured-actions">${icon('link')}${icon('bookmark')}</div></div>
 <div class="featured-body"><div class="featured-left"><div class="featured-outcomes">${f.outcomes.map(([label,p])=>`<div><span>${label}</span><strong>${formatPercent(p)}</strong></div>`).join('')}</div><div class="featured-comments">${f.comments.map(([u,c],i)=>`<div class="comment"><span class="avatar av${i}"></span><div><strong>${u}</strong><p>${c}</p></div></div>`).join('')}</div><div class="feature-volume">${f.volume}</div></div><div class="featured-chart-area"><div class="legend"><span><i class="l1"></i>${f.outcomes[0][0]} ${formatPercent(f.outcomes[0][1])}</span><span><i class="l2"></i>${f.outcomes[1][0]} ${formatPercent(f.outcomes[1][1])}</span><span><i class="l3"></i>${f.outcomes[2][0]} ${formatPercent(f.outcomes[2][1])}</span></div>${featuredChart(index)}<div class="chart-bottom"><span>↔ Monthly</span><span class="pm-watermark">◁ BibleBet</span></div></div></div></section>`;
}
export function discoveryRail(){
 return `<aside class="discovery-rail"><section><h2>Breaking News <span>›</span></h2><ol>${breaking.map(([t,p,d],i)=>`<li><span class="rank">${i+1}</span><p>${t}</p><div><strong>${formatPercent(p)}</strong><small class="${d>=0?'up':'down'}">${d>=0?'↗':'↘'} ${Math.round(Math.abs(d)*100)}%</small></div></li>`).join('')}</ol></section><section class="hot"><h2>Hot topics <span>›</span></h2><ol>${hotTopics.map(([t,v],i)=>`<li><span class="rank">${i+1}</span><strong>${t}</strong><small>${v} <b>🔥</b> ›</small></li>`).join('')}</ol><button class="explore">Explore all</button></section></aside>`;
}

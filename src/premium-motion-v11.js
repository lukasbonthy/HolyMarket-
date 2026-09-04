const root=document.querySelector('#app');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer=window.matchMedia('(pointer: fine)');
const boundCards=new WeakSet();
const boundCharts=new WeakSet();
const lastNumberText=new WeakMap();
let queued=false;
let pendingBookmarkMarket='';
let pendingChartRange=null;

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

function smoothPath(d){
  const values=(d.match(/-?\d*\.?\d+/g)||[]).map(Number);
  const points=[];
  for(let i=0;i+1<values.length;i+=2)points.push({x:values[i],y:values[i+1]});
  if(points.length<3)return d;
  let out=`M${points[0].x} ${points[0].y}`;
  for(let i=0;i<points.length-1;i++){
    const p0=points[i-1]||points[i];
    const p1=points[i];
    const p2=points[i+1];
    const p3=points[i+2]||p2;
    const c1x=p1.x+(p2.x-p0.x)/6;
    const c1y=p1.y+(p2.y-p0.y)/6;
    const c2x=p2.x-(p3.x-p1.x)/6;
    const c2y=p2.y-(p3.y-p1.y)/6;
    out+=` C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x} ${p2.y}`;
  }
  return out;
}

function svgEl(name,attrs={}){
  const el=document.createElementNS('http://www.w3.org/2000/svg',name);
  Object.entries(attrs).forEach(([key,value])=>el.setAttribute(key,String(value)));
  return el;
}

function closestPointAtX(path,targetX){
  const length=path.getTotalLength();
  let low=0;
  let high=length;
  for(let i=0;i<18;i++){
    const mid=(low+high)/2;
    const point=path.getPointAtLength(mid);
    if(point.x<targetX)low=mid;else high=mid;
  }
  return path.getPointAtLength((low+high)/2);
}

function chartPointerPoint(svg,event){
  const ctm=svg.getScreenCTM();
  if(!ctm)return null;
  const point=svg.createSVGPoint();
  point.x=event.clientX;
  point.y=event.clientY;
  return point.matrixTransform(ctm.inverse());
}

function bindChart(chart){
  if(boundCharts.has(chart))return;
  boundCharts.add(chart);
  chart.classList.add('hm-chart-v12');

  const svg=chart.querySelector('svg');
  const primary=svg?.querySelector('.event-line.primary');
  const secondary=svg?.querySelector('.event-line.secondary');
  if(!svg||!primary)return;

  const primaryRaw=primary.getAttribute('d')||'';
  const secondaryRaw=secondary?.getAttribute('d')||'';
  const primarySmooth=smoothPath(primaryRaw);
  const secondarySmooth=smoothPath(secondaryRaw);
  primary.setAttribute('d',primarySmooth);
  if(secondary&&secondarySmooth)secondary.setAttribute('d',secondarySmooth);

  const defs=svgEl('defs');
  const gradient=svgEl('linearGradient',{id:'hm-chart-primary-gradient',x1:'0',y1:'0',x2:'0',y2:'1'});
  gradient.append(
    svgEl('stop',{offset:'0%','stop-color':'#62b3ff','stop-opacity':'.28'}),
    svgEl('stop',{offset:'48%','stop-color':'#3b82f6','stop-opacity':'.11'}),
    svgEl('stop',{offset:'100%','stop-color':'#2e5cff','stop-opacity':'0'})
  );
  defs.append(gradient);
  svg.insertBefore(defs,svg.firstChild);

  const area=svgEl('path',{class:'hm-chart-area',d:`${primarySmooth} L548 258 L20 258 Z`,fill:'url(#hm-chart-primary-gradient)'});
  const grid=svg.querySelector('.event-grid');
  svg.insertBefore(area,grid||primary);

  const hitArea=svgEl('rect',{class:'hm-chart-hit-area',x:'20',y:'32',width:'528',height:'226',fill:'transparent','pointer-events':'all'});
  const crosshair=svgEl('line',{class:'hm-chart-crosshair',x1:'20',x2:'20',y1:'32',y2:'258'});
  const hoverDot=svgEl('circle',{class:'hm-chart-hover-dot',cx:'20',cy:'258',r:'5'});
  svg.append(hitArea,crosshair,hoverDot);

  const tooltip=document.createElement('div');
  tooltip.className='hm-chart-tooltip';
  tooltip.innerHTML='<strong>—</strong><span>Probability</span>';
  chart.append(tooltip);

  const range=chart.querySelector('.chart-range');
  const active=range?.querySelector('button.active');
  const activeRange=active?.dataset.range||'';
  chart.dataset.hmChartRange=activeRange;
  if(range&&active){
    const indicator=document.createElement('span');
    indicator.className='hm-chart-range-indicator';
    const left=active.offsetLeft;
    const width=active.offsetWidth;
    range.style.setProperty('--hm-range-left',`${left}px`);
    range.style.setProperty('--hm-range-width',`${width}px`);
    range.style.setProperty('--hm-range-from-left',`${pendingChartRange?.fromLeft??left}px`);
    range.style.setProperty('--hm-range-from-width',`${pendingChartRange?.fromWidth??width}px`);
    range.append(indicator);
  }

  const lineLength=primary.getTotalLength();
  primary.style.setProperty('--hm-chart-path-length',lineLength.toFixed(2));
  if(secondary){
    secondary.style.setProperty('--hm-chart-path-length',secondary.getTotalLength().toFixed(2));
  }

  if(pendingChartRange&&pendingChartRange.range===activeRange)chart.classList.add('hm-chart-range-in');
  else chart.classList.add('hm-chart-enter');
  pendingChartRange=null;

  const label=(chart.querySelector('.label-primary span')?.textContent||'Probability').trim();
  const chartRect=()=>chart.getBoundingClientRect();
  const updateHover=event=>{
    const local=chartPointerPoint(svg,event);
    if(!local)return;
    const x=Math.max(20,Math.min(548,local.x));
    const point=closestPointAtX(primary,x);
    const probability=Math.max(0,Math.min(100,100-((point.y-32)/228)*100));
    crosshair.setAttribute('x1',point.x.toFixed(2));
    crosshair.setAttribute('x2',point.x.toFixed(2));
    hoverDot.setAttribute('cx',point.x.toFixed(2));
    hoverDot.setAttribute('cy',point.y.toFixed(2));

    const svgRect=svg.getBoundingClientRect();
    const rect=chartRect();
    const screenX=svgRect.left+(point.x/610)*svgRect.width;
    const screenY=svgRect.top+(point.y/260)*svgRect.height;
    const left=Math.max(58,Math.min(rect.width-58,screenX-rect.left));
    const top=Math.max(62,screenY-rect.top);
    tooltip.style.left=`${left}px`;
    tooltip.style.top=`${top}px`;
    tooltip.innerHTML=`<strong>${Math.round(probability)}%</strong><span>${label}</span>`;
    tooltip.classList.add('show');
    crosshair.classList.add('show');
    hoverDot.classList.add('show');
  };
  const clearHover=()=>{
    tooltip.classList.remove('show');
    crosshair.classList.remove('show');
    hoverDot.classList.remove('show');
  };

  hitArea.addEventListener('pointermove',event=>{
    if(!finePointer.matches)return;
    updateHover(event);
  },{passive:true});
  hitArea.addEventListener('pointerleave',clearHover,{passive:true});
  hitArea.addEventListener('pointerdown',event=>{
    if(finePointer.matches)return;
    updateHover(event);
    window.setTimeout(clearHover,1800);
  },{passive:true});
}

function decorateCharts(){
  document.querySelectorAll('.event-chart').forEach(bindChart);
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
  decorateCharts();
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
  const rangeButton=event.target.closest('[data-action="chart-range"]');
  if(rangeButton){
    const rail=rangeButton.closest('.chart-range');
    const current=rail?.querySelector('button.active');
    pendingChartRange={
      range:rangeButton.dataset.range||'',
      fromLeft:current?.offsetLeft??rangeButton.offsetLeft,
      fromWidth:current?.offsetWidth??rangeButton.offsetWidth
    };
  }
},true);

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

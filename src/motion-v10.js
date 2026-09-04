const root=document.querySelector('#app');

const correctAnswerIndex={
  'david-goliath':0,
  lazarus:0,
  thomas:0,
  jericho:0,
  samson:0,
  'paul-rome':0,
  abraham:1,
  'red-sea':0,
  elijah:0,
  'peter-water':1,
  jonah:0,
  samaritan:0,
  'joseph-egypt':0,
  'daniel-lions':0,
  pentecost:0,
  'empty-tomb':1,
  'noah-rain':0,
  'white-horse':0
};

const correctAnswerText={
  'david-goliath':'David wins',
  lazarus:'Comes out',
  thomas:'No',
  jericho:'Israel',
  samson:'Samson',
  'paul-rome':'Yes',
  abraham:'No',
  'red-sea':'Sea divides',
  elijah:'Yes',
  'peter-water':'No',
  jonah:'Tarshish',
  samaritan:'A Samaritan',
  'joseph-egypt':'Second in command',
  'daniel-lions':'Yes',
  pentecost:'Spirit fills them',
  'empty-tomb':'No',
  'noah-rain':'Yes',
  'white-horse':'Faithful and True'
};

const celebrated=new Set();
let queued=false;
let celebrationTimer=0;

function eventId(){
  const match=(location.hash||'').match(/^#\/event\/([^/?#]+)/);
  return match?decodeURIComponent(match[1]):null;
}

function selectedAnswer(){
  const review=document.querySelector('.ticket-side .review-ticket')||document.querySelector('.review-ticket');
  if(review){
    const rows=[...review.querySelectorAll('div')];
    const outcome=rows.find(row=>row.querySelector('span')?.textContent.trim()==='Outcome');
    const value=outcome?.querySelector('b')?.textContent.trim();
    if(value)return value;
  }
  return document.querySelector('.ticket-side .ticket-market b')?.textContent.trim()||document.querySelector('.ticket-market b')?.textContent.trim()||'';
}

function particleMarkup(){
  const pieces=18;
  return Array.from({length:pieces},(_,i)=>{
    const angle=(i/pieces)*Math.PI*2;
    const distance=90+(i%5)*18;
    const x=Math.round(Math.cos(angle)*distance);
    const y=Math.round(Math.sin(angle)*distance+60);
    const rotation=(i*47)%260-130;
    const delay=(i%6)*22;
    return`<i style="--x:${x}px;--y:${y}px;--r:${rotation}deg;--delay:${delay}ms;--c:${i%4}"></i>`;
  }).join('');
}

export function clearCelebration(){
  clearTimeout(celebrationTimer);
  document.querySelectorAll('.answer-celebration').forEach(el=>el.remove());
}

function showCelebration(correct,selected,correctText,key){
  if(celebrated.has(key))return;
  celebrated.add(key);
  clearCelebration();
  const layer=document.createElement('div');
  layer.className=`answer-celebration ${correct?'correct':'incorrect'}`;
  layer.setAttribute('aria-hidden','true');
  layer.innerHTML=`${correct?`<div class="celebration-particles">${particleMarkup()}</div>`:''}<div class="celebration-card"><span>${correct?'✓':'×'}</span><div><strong>${correct?'Correct!':'Not quite'}</strong><small>${correct?'Great call — now read the passage.':`${selected||'Your answer'} → ${correctText}`}</small></div></div>`;
  document.body.append(layer);
  celebrationTimer=setTimeout(clearCelebration,correct?2100:1350);
}

function answerFeedback(){
  const id=eventId();
  const reveal=document.querySelector('.scripture-reveal');
  if(!id||!reveal)return;
  const correctText=correctAnswerText[id];
  if(correctText===undefined)return;
  const selected=selectedAnswer();
  if(!selected)return;
  const correct=selected.toLocaleLowerCase()===correctText.toLocaleLowerCase();
  let result=reveal.querySelector('.answer-result');
  if(!result){
    result=document.createElement('div');
    result.className=`answer-result ${correct?'correct':'incorrect'}`;
    result.innerHTML=`<span class="answer-result-icon">${correct?'✓':'×'}</span><div><strong>${correct?'Correct!':'Not quite'}</strong><p>${correct?`You chose ${selected}. Scripture confirms it.`:`You chose ${selected}. The passage resolves to ${correctText}.`}</p></div>`;
    reveal.prepend(result);
  }
  const key=`${id}:${selected}:${correctAnswerIndex[id]}`;
  showCelebration(correct,selected,correctText,key);
}

function decorateMotion(){
  answerFeedback();
}

function schedule(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;decorateMotion()});
}

if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',()=>{clearCelebration();schedule()});
queueMicrotask(schedule);

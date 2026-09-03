const MAX_EVENTS=160;

const RULES={
  'instant-answer':{points:12,maxCount:5,label:'Repeated answers under 2 seconds'},
  'very-fast-answer':{points:4,maxCount:5,label:'Repeated answers under 3.5 seconds'},
  'pre-resolution-scripture':{points:25,maxCount:3,label:'Resolution source accessed before prediction'},
  'rapid-burst':{points:15,maxCount:2,label:'Many predictions submitted in a short window'},
  'invalid-prediction':{points:3,maxCount:5,label:'Repeated invalid or duplicate prediction attempts'},
  'outcome-churn':{points:2,maxCount:3,label:'Unusually high outcome switching before submission'},
  'fast-perfect-streak':{points:20,maxCount:2,label:'High accuracy combined with implausibly fast answers'}
};

function nowIso(){return new Date().toISOString()}

export function createIntegrityState(){
  return {score:0,level:'normal',signals:[],events:[],updatedAt:nowIso()};
}

export function normalizeIntegrity(value){
  const source=value&&typeof value==='object'?value:{};
  const state={
    score:Number(source.score)||0,
    level:['normal','watch','high-risk'].includes(source.level)?source.level:'normal',
    signals:Array.isArray(source.signals)?source.signals.map(s=>({...s})):[],
    events:Array.isArray(source.events)?source.events.map(e=>({...e})):[],
    updatedAt:source.updatedAt||nowIso()
  };
  recalc(state);
  return state;
}

function signalForEvent(event){
  if(event.type==='prediction-latency'){
    const ms=Number(event.latencyMs);
    if(Number.isFinite(ms)&&ms>=0&&ms<2000)return'instant-answer';
    if(Number.isFinite(ms)&&ms>=2000&&ms<3500)return'very-fast-answer';
    return null;
  }
  if(event.type==='pre-resolution-scripture')return'pre-resolution-scripture';
  if(event.type==='rapid-burst'&&Number(event.countInWindow)>=6)return'rapid-burst';
  if(event.type==='invalid-prediction')return'invalid-prediction';
  if(event.type==='outcome-change'&&Number(event.changeCount)>=12)return'outcome-churn';
  if(event.type==='fast-perfect-streak')return'fast-perfect-streak';
  return null;
}

function recalc(state){
  state.score=state.signals.reduce((sum,s)=>sum+(Number(s.points)||0),0);
  state.level=state.score>=60?'high-risk':state.score>=30?'watch':'normal';
  state.updatedAt=nowIso();
}

export function recordIntegrityEvent(integrity,event={}){
  const state=integrity&&typeof integrity==='object'?integrity:createIntegrityState();
  if(!Array.isArray(state.signals))state.signals=[];
  if(!Array.isArray(state.events))state.events=[];
  const safeEvent={...event,at:event.at||nowIso()};
  state.events.unshift(safeEvent);
  if(state.events.length>MAX_EVENTS)state.events.length=MAX_EVENTS;
  const code=signalForEvent(safeEvent);
  if(code){
    const rule=RULES[code];
    let signal=state.signals.find(s=>s.code===code);
    if(!signal){
      signal={code,label:rule.label,count:0,scoredCount:0,points:0,lastAt:safeEvent.at,lastMarketId:safeEvent.marketId||null};
      state.signals.push(signal);
    }
    signal.count+=1;
    signal.scoredCount=Math.min(signal.count,rule.maxCount);
    signal.points=signal.scoredCount*rule.points;
    signal.lastAt=safeEvent.at;
    signal.lastMarketId=safeEvent.marketId||signal.lastMarketId||null;
  }
  recalc(state);
  return state;
}

export function publicIntegrity(integrity){
  const state=normalizeIntegrity(integrity);
  const label=state.level==='normal'?'Fair play':state.level==='watch'?'Fair play review':'Fair play check';
  return {level:state.level,label};
}

export function adminIntegrity(integrity){
  const state=normalizeIntegrity(integrity);
  return {
    score:state.score,
    level:state.level,
    signals:state.signals.map(s=>({...s})),
    events:state.events.slice(0,80).map(e=>({...e})),
    updatedAt:state.updatedAt
  };
}

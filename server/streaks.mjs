const int=value=>Math.max(0,Math.floor(Number(value)||0));

export function normalizeStreak(value={}){
  const current=int(value?.current);
  const correct=int(value?.correct);
  const resolved=Math.max(int(value?.resolved),correct);
  return {
    current,
    best:Math.max(int(value?.best),current),
    correct,
    resolved,
    updatedAt:value?.updatedAt?String(value.updatedAt):null
  };
}

export function applyStreakResult(value,correct,at=new Date().toISOString()){
  const streak=normalizeStreak(value);
  if(correct===null||correct===undefined)return streak;
  streak.resolved+=1;
  if(correct===true){
    streak.current+=1;
    streak.correct+=1;
    if(streak.current>streak.best)streak.best=streak.current;
  }else{
    streak.current=0;
  }
  streak.updatedAt=String(at);
  return streak;
}

export function streakAccuracy(value){
  const streak=normalizeStreak(value);
  return streak.resolved?streak.correct/streak.resolved:0;
}

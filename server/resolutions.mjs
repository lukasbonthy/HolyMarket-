const RESOLVED_OUTCOMES=Object.freeze({
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
});

export function resolvedOutcomeIndex(marketId){
  const id=String(marketId||'');
  return Object.prototype.hasOwnProperty.call(RESOLVED_OUTCOMES,id)?RESOLVED_OUTCOMES[id]:null;
}

export function resolveOutcome(marketId,outcomeIndex){
  const expected=resolvedOutcomeIndex(marketId);
  if(expected===null)return null;
  const chosen=Number(outcomeIndex);
  if(!Number.isInteger(chosen))return false;
  return chosen===expected;
}

export function knownResolutions(){return {...RESOLVED_OUTCOMES};}

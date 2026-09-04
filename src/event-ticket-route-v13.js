// V13 route guard: a Review tab from a previously answered market must not
// leak into a fresh event and hide its prediction choices.
let lastEventId=null;

function currentEventId(){
  const match=location.hash.match(/^#\/event\/([^/?#]+)/);
  if(!match)return null;
  try{return decodeURIComponent(match[1])}catch{return match[1]}
}

function repairFreshEventTicket(){
  const id=currentEventId();
  if(!id){lastEventId=null;return}
  if(id===lastEventId)return;
  lastEventId=id;

  const ticket=document.querySelector('.ticket-side');
  if(!ticket)return;
  const review=ticket.querySelector('[data-action="ticket-mode"][data-mode="review"]');
  const predict=ticket.querySelector('[data-action="ticket-mode"][data-mode="predict"]');
  const emptyReview=ticket.querySelector('.review-ticket p');
  if(review?.classList.contains('active')&&predict&&/No prediction is locked/i.test(emptyReview?.textContent||'')){
    predict.click();
  }
}

window.addEventListener('hashchange',repairFreshEventTicket);
queueMicrotask(repairFreshEventTicket);

const root=document.querySelector('#app');

const groups=[
  ['.market-card',['hm-premium-card','transition-[transform,box-shadow,border-color]','duration-200','ease-out','hover:-translate-y-[1px]','hover:shadow-[0_16px_44px_rgba(0,0,0,0.24)]']],
  ['.featured-panel',['hm-premium-card','transition-[box-shadow,border-color]','duration-200','hover:shadow-[0_18px_54px_rgba(0,0,0,0.26)]']],
  ['.ticket',['hm-premium-card','shadow-[0_18px_55px_rgba(0,0,0,0.22)]']],
  ['.combo-row',['transition-[border-color,box-shadow,transform]','duration-200','hover:shadow-[0_10px_30px_rgba(46,92,255,0.10)]']],
  ['.auth-modal',['hm-glass','shadow-[0_30px_100px_rgba(0,0,0,0.62)]','ring-1','ring-white/[0.045]']],
  ['.account-menu',['hm-glass','shadow-[0_24px_70px_rgba(0,0,0,0.52)]','ring-1','ring-white/[0.04]']],
  ['.global-search',['transition-[box-shadow,border-color,background-color]','duration-200','focus-within:ring-1','focus-within:ring-[#2e5cff]/45','focus-within:border-[#3b65ff]']],
  ['.signup-btn',['hm-blue-glow','transition-[filter,transform,box-shadow]','duration-150','hover:brightness-110','active:scale-[0.985]']],
  ['.trade-button',['hm-blue-glow','transition-[filter,transform,box-shadow]','duration-150','hover:brightness-110','active:scale-[0.99]']],
  ['.login-btn',['transition-[background-color,color,transform]','duration-150','hover:bg-white/[0.055]','active:scale-[0.985]']],
  ['.round-icon',['transition-[background-color,color,transform]','duration-150','hover:bg-white/[0.055]','hover:text-white','active:scale-[0.94]']],
  ['.category-link',['transition-colors','duration-150','hover:text-white']],
  ['.topic-rail button',['transition-[background-color,color,transform]','duration-150','active:scale-[0.98]']],
  ['.market-controls button',['transition-[background-color,color,border-color,transform]','duration-150','active:scale-[0.98]']],
  ['.ticket-outcomes button',['transition-[background-color,border-color,box-shadow,transform]','duration-150','active:scale-[0.99]']],
  ['.quick-add button',['transition-[background-color,color,transform]','duration-150','hover:bg-white/[0.075]','active:scale-[0.96]']],
  ['.event-actions button',['transition-[background-color,color,transform]','duration-150','hover:bg-white/[0.055]','active:scale-[0.94]']],
  ['.card-bookmark',['transition-[background-color,color,transform]','duration-150','hover:bg-white/[0.055]','active:scale-[0.92]']],
  ['.card-gift',['transition-[background-color,color,transform]','duration-150','hover:bg-white/[0.055]','active:scale-[0.92]']],
  ['.mobile-sheet',['hm-glass','shadow-[0_-24px_70px_rgba(0,0,0,0.48)]']],
  ['.filters-popover',['hm-glass','shadow-[0_18px_55px_rgba(0,0,0,0.45)]','ring-1','ring-white/[0.035]']]
];

export function applyPremiumV9(){
  for(const [selector,classes] of groups){
    document.querySelectorAll(selector).forEach(el=>el.classList.add(...classes));
  }
  document.querySelector('.site-menu-popover')?.classList.add('hm-glass','shadow-[0_24px_70px_rgba(0,0,0,0.52)]','ring-1','ring-white/[0.04]');
}

let queued=false;
function schedule(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;applyPremiumV9()});
}

if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
window.addEventListener('hashchange',schedule);
window.addEventListener('resize',schedule);
queueMicrotask(schedule);

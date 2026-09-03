export function scriptureReveal(m,prediction,passage){
 if(!prediction) return `<div class="scripture-gate"><strong>Predict before revealing Scripture</strong><p>${m.reference} stays hidden until you lock a choice.</p></div>`;
 if(!passage) return `<div class="scripture-gate loading"><strong>Loading ${m.reference}…</strong></div>`;
 return `<article class="scripture-reveal"><header><div><strong>${passage.reference||m.reference}</strong><small>${passage.version_title||passage.version||'World English Bible'}</small></div><span>${passage.provider==='youversion'?'YouVersion':'WEB'}</span></header><p>${passage.content||''}</p><footer>${passage.copyright||passage.attribution||'World English Bible — public domain'}</footer></article>`;
}

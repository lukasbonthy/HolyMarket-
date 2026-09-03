function pointsToPath(points, width, height, pad=12){
  if(!points.length) return '';
  const innerW=width-pad*2, innerH=height-pad*2;
  return points.map((p,i)=>{
    const x=pad+(i/(points.length-1))*innerW;
    const y=pad+(1-p)*innerH;
    return `${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}
export function featuredChart(seed=0){
  const sets=[
    [0.48,.57,.55,.66,.69,.63,.72,.68,.61,.58,.62,.51,.59,.56,.63],
    [.39,.43,.36,.33,.29,.24,.28,.31,.34,.29,.27,.43,.47,.36,.41],
    [.01,.01,.012,.009,.011,.014,.013,.01,.011,.009,.012,.011,.01,.01,.009]
  ];
  const shifted=sets.map((s,idx)=>s.map((v,i)=>Math.max(.01,Math.min(.98,v+Math.sin(i+seed+idx)*.018))));
  const colors=['#74b8f8','#1598ff','#ff8a18'];
  return `<svg class="probability-chart" viewBox="0 0 420 248" preserveAspectRatio="none">
    <g class="chart-grid">${[.2,.4,.6,.8].map(v=>`<line x1="0" x2="386" y1="${248-v*220}" y2="${248-v*220}"/>`).join('')}</g>
    <g class="chart-labels">${[80,60,40,20].map((v,i)=>`<text x="394" y="${248-(v/100)*220+3}">${v}%</text>`).join('')}</g>
    ${shifted.map((s,i)=>`<path class="chart-line chart-line-${i}" d="${pointsToPath(s,386,240,3)}" style="--line-color:${colors[i]}"/>`).join('')}
    ${shifted.slice(0,2).map((s,i)=>{const y=3+(1-s.at(-1))*234;return `<circle class="chart-end chart-end-${i}" cx="383" cy="${y}" r="4.2" style="--line-color:${colors[i]}"/>`}).join('')}
  </svg>`;
}
export function eventChart(){
  const a=[.42,.53,.52,.62,.57,.72,.73,.68,.7,.64,.63,.58,.61,.44,.53,.49,.59,.51,.63,.83];
  const b=[.36,.32,.33,.47,.42,.36,.28,.24,.29,.32,.31,.34,.37,.21,.24,.28,.26,.22,.19,.20];
  return `<svg class="event-chart" viewBox="0 0 620 245" preserveAspectRatio="none">
    <g class="chart-grid">${[0,.25,.5,.75,1].map(v=>`<line x1="0" x2="572" y1="${240-v*220}" y2="${240-v*220}"/>`).join('')}</g>
    <g class="chart-labels">${[100,75,50,25,0].map((v,i)=>`<text x="584" y="${20+i*55}">${v}%</text>`).join('')}</g>
    <path class="chart-line chart-line-0" d="${pointsToPath(a,570,240,3)}" style="--line-color:#2e5cff"/>
    <path class="chart-line chart-line-1" d="${pointsToPath(b,570,240,3)}" style="--line-color:#3b3f45"/>
    <circle class="chart-end chart-end-0" cx="567" cy="${3+(1-a.at(-1))*234}" r="4.2" style="--line-color:#2e5cff"/>
    <circle class="chart-end chart-end-1" cx="567" cy="${3+(1-b.at(-1))*234}" r="4.2" style="--line-color:#4d5156"/>
  </svg>`;
}

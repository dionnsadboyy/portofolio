(() => {
  'use strict';
  function initialize() {
  if (!document.body.classList.contains('theme-both')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  const splash = document.getElementById('perspectiveSplash');

  let heroPlayed = false;
  let revealObserver;
  let depthObserver;
  let frame=0;
  const activeDepth=new Set();
  const desktop=matchMedia('(min-width: 800px)');
  const board=document.getElementById('journeyBoard');
  const thread=document.getElementById('journeyThread');
  const sound=kind=>document.dispatchEvent(new CustomEvent('portfolio-sfx',{detail:{kind}}));
  let threadLength=0;
  let measureFrame=0;
  const revealed=new WeakSet();
  const ease = 'cubic-bezier(.16,1,.3,1)';
  function play(el, frames, opts={}) {
    if (!el || reduced.matches || !el.animate || document.hidden) return;
    const a=el.animate(frames,{duration:800,easing:ease,fill:'backwards',...opts});
    running.add(a); a.finished.then(()=>running.delete(a),()=>running.delete(a));
    return a;
  }
  function reveal(el) {
    if(revealed.has(el) || reduced.matches || splash?.open) return;
    revealed.add(el);
    el.dataset.bwRevealed='true';
    const kind=el.dataset.bwReveal;
    if(kind==='thread'){const length=el.getTotalLength();play(el,[{strokeDasharray:String(length),strokeDashoffset:String(length)},{strokeDasharray:String(length),strokeDashoffset:'0'}],{duration:1800});return;}
    if(kind==='puzzle'){sound('snap');play(el,[{transform:'translate(150px,100px) rotate(-24deg) scale(.7)',opacity:0,offset:0},{transform:'translate(-9px,-4px) rotate(3deg) scale(1.02)',opacity:1,offset:.76},{transform:'translate(3px,0) rotate(-1deg)',opacity:1,offset:.9},{transform:'none',opacity:1}],{duration:1600,delay:120});return;}
    const mobile=innerWidth<700;
    const from=kind==='text'?'translateY(110%) rotate(1deg)':kind==='phone'?'perspective(1100px) translate3d(-120px,180px,0) rotateY(42deg) rotate(-22deg) scale(.72)':kind==='left'?`translate3d(-${mobile?48:150}px,60px,0) rotate(-9deg) scale(.85)`:kind==='right'?`translate3d(${mobile?48:150}px,60px,0) rotate(8deg) scale(.88)`:kind==='object'?'translate3d(0,110px,0) rotate(-12deg) scale(.72)':'translateY(36px)';
    const physical=['object','left','right','phone'].includes(kind);
    const frames=physical?[{transform:from,opacity:0,offset:0},{transform:'translateY(-5px) rotate(1deg) scale(1.015)',opacity:1,offset:.78},{transform:'none',opacity:1}]:[{transform:from,opacity:kind==='text'?1:0},{transform:'none',opacity:1}];
    play(el,frames,{duration:physical?1350:950,delay:Math.min(Number(el.dataset.bwDelay)||0,500)});
  }
  function observeReveals() {
    revealObserver?.disconnect();
    if(reduced.matches || !('IntersectionObserver' in window)) return;
    revealObserver=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting&&!splash?.open){reveal(e.target);revealObserver.unobserve(e.target);}}},{threshold:.06});
    document.querySelectorAll('[data-bw-reveal]').forEach(el=>{if(!revealed.has(el))revealObserver.observe(el);});
  }
  function updateScroll() {
    frame=0;
    if(document.hidden)return;
    if(reduced.matches){updateThread();return;}
    const positions=new Map();const writes=[];
    for(const el of activeDepth){const section=el.closest('.bw-project, .bw-browser-project, section');if(!positions.has(section))positions.set(section,section.getBoundingClientRect());const r=positions.get(section);const p=Math.max(-.7,Math.min(.7,(innerHeight/2-r.top-r.height/2)/(innerHeight+r.height)));writes.push([el,desktop.matches?p*Number(el.dataset.bwDepth):0]);}
    writes.forEach(([el,y])=>el.style.translate=`0 ${y.toFixed(2)}px`);
    updateThread();
  }
  function updateThread() {
    if(!board||!threadLength) return;
    const r=board.getBoundingClientRect();
    if(r.top>innerHeight+100||r.bottom< -100)return;
    const progress=reduced.matches?1:Math.max(0,Math.min(1,(innerHeight*.72-r.top)/r.height));
    thread.style.strokeDashoffset=String(threadLength*(1-progress));
  }
  function measureJourney() {
    measureFrame=0;
    if(!board||!thread)return;
    const width=board.clientWidth,height=board.clientHeight;
    const nodes=[...board.querySelectorAll('.bw-journey-node')];
    const points=nodes.map(node=>({x:node.offsetLeft+36,y:node.offsetTop-2}));
    if(!points.length||!width||!height)return;
    let d=`M ${points[0].x-18} 0 Q ${points[0].x-70} 8 ${points[0].x} ${points[0].y}`;
    for(let i=1;i<points.length;i++){const prev=points[i-1],p=points[i];const between=(prev.y+p.y)/2;const side=innerWidth<701?width-24:i%2?width-65:65;d+=` C ${side} ${prev.y+70}, ${side} ${between-20}, ${(prev.x+p.x)/2} ${between} S ${p.x-65} ${p.y-65}, ${p.x} ${p.y}`;}
    const last=points.at(-1);d+=` C ${width*.8} ${last.y+80}, ${width*.8} ${height-30}, ${width*.58} ${height}`;
    board.querySelector('svg').setAttribute('viewBox',`0 0 ${width} ${height}`);
    board.querySelectorAll('path').forEach(p=>p.setAttribute('d',d));
    threadLength=thread.getTotalLength();thread.style.strokeDasharray=String(threadLength);
    board.classList.add('bw-path-ready');updateThread();
  }
  function requestMeasure(){if(!measureFrame)measureFrame=requestAnimationFrame(measureJourney);}
  function requestUpdate() { if(!frame&&!document.hidden)frame=requestAnimationFrame(updateScroll); }
  function observeDepth() {
    depthObserver?.disconnect();activeDepth.clear();
    document.querySelectorAll('[data-bw-depth]').forEach(el=>el.style.removeProperty('translate'));
    if(reduced.matches || !('IntersectionObserver' in window))return;
    depthObserver=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting)activeDepth.add(e.target);else {activeDepth.delete(e.target);e.target.style.removeProperty('translate');}}requestUpdate();},{rootMargin:'100px'});
    document.querySelectorAll('[data-bw-depth]').forEach(el=>depthObserver.observe(el));
  }
  function cover() {
    if(heroPlayed || splash?.open || reduced.matches) return;
    heroPlayed=true;
    if(location.hash && !['#top','#cover','#heroTitle'].includes(location.hash)) return;
    document.querySelectorAll('.bw-cover-title > span').forEach((el,i)=>play(el,[{transform:'translateY(75%) rotate(5deg)',opacity:0},{transform:'translateY(0) rotate(0)',opacity:1}],{duration:1050,delay:i*48}));
    play(document.querySelector('.bw-cover-photo'),[{transform:'translate3d(45px,280px,0) scale(.68) rotate(-11deg)',opacity:0,offset:0},{transform:'translate3d(-3px,-12px,0) scale(1.02) rotate(1deg)',opacity:1,offset:.76},{transform:'none',opacity:1}],{duration:1400,delay:120});
    play(document.querySelector('.bw-cover-script'),[{clipPath:'inset(0 100% 0 0)',opacity:0},{clipPath:'inset(-30% -10% -30% -10%)',opacity:1}],{duration:900,delay:600});
    document.querySelectorAll('[data-cover-copy],.bw-cover-top,.bw-cover-bottom,.bw-cover-edition').forEach((el,i)=>play(el,[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'none'}],{duration:700,delay:900+i*45}));
  }
  function configure() {
    document.documentElement.dataset.motion=reduced.matches?'reduced':'enabled';
    if(reduced.matches){running.forEach(a=>a.cancel());running.clear();revealObserver?.disconnect();cancelAnimationFrame(frame);frame=0;}else {cover();observeReveals();}
    observeDepth();requestUpdate();requestMeasure();
    if(reduced.matches&&thread)thread.style.strokeDashoffset='0';
  }
  splash?.addEventListener('close',()=>{cover();observeReveals();});
  function openHashDetails(){let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{return;}if(!target)return;let parent=target;while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}}
  openHashDetails();
  addEventListener('hashchange',openHashDetails);
  reduced.addEventListener('change',configure);
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',()=>{requestUpdate();requestMeasure();},{passive:true});
  desktop.addEventListener('change',requestUpdate);
  document.addEventListener('visibilitychange',()=>{running.forEach(a=>document.hidden?a.pause():a.play());if(document.hidden){cancelAnimationFrame(frame);frame=0;}else {requestUpdate();}});
  let resizeObserver;
  if(board&&'ResizeObserver' in window){resizeObserver=new ResizeObserver(requestMeasure);resizeObserver.observe(board);}
  document.fonts?.ready.then(requestMeasure);
  addEventListener('pagehide',()=>{revealObserver?.disconnect();depthObserver?.disconnect();resizeObserver?.disconnect();running.forEach(a=>a.cancel());running.clear();cancelAnimationFrame(frame);cancelAnimationFrame(measureFrame);frame=measureFrame=0;});
  addEventListener('pageshow',e=>{if(e.persisted){configure();if(board)resizeObserver?.observe(board);}});
  configure();
  }
  // Shared navigation opens the first-visit splash in its DOMContentLoaded handler.
  // Waiting here lets it establish that state before cover/reveal animations start.
  if(document.readyState!=='complete')addEventListener('DOMContentLoaded',initialize,{once:true});
  else initialize();
})();

(() => {
 'use strict';
 if(!document.body.classList.contains('theme-welcome'))return;
 const preference=matchMedia('(prefers-reduced-motion: reduce)'),running=new Set();
 window[Symbol.for('dion.welcome.motion')]=preference;
 function play(el,frames,options={}){if(!el||preference.matches||!el.animate)return;const animation=el.animate(frames,{duration:650,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards',...options});running.add(animation);animation.finished.then(()=>running.delete(animation),()=>running.delete(animation));}
 function stop(){running.forEach(a=>a.cancel());running.clear();}
 document.querySelectorAll('.welcome-intro h1>span').forEach((el,i)=>play(el,[{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'none'}],{delay:i*65}));
 play(document.querySelector('.welcome-intro>p'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{delay:100});
 document.querySelectorAll('[data-welcome-enter]').forEach((el,i)=>{const x=el.dataset.welcomeEnter==='left'?-32:el.dataset.welcomeEnter==='right'?32:0;play(el,[{opacity:0,transform:`translate(${x}px,28px) rotate(${x/20}deg)`},{opacity:1,transform:'none'}],{duration:720,delay:100+i*75});});
 play(document.querySelector('.welcome-portrait'),[{opacity:0,transform:'translateY(64px) rotate(-2deg) scale(.96)'},{opacity:1,transform:'none'}],{duration:850,delay:180});
 play(document.querySelector('.welcome-both-caption'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:500,delay:300});
 preference.addEventListener('change',()=>{if(preference.matches)stop();});
 addEventListener('pagehide',stop);
})();

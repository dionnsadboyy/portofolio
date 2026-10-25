(() => {
  'use strict';
  const lastKey = 'dion-perspective-last-v1';
  const routes = {both:'/?view=both',developer:'/developer/',manufacturing:'/manufacturing/'};
  const readLast = () => {try {const value=localStorage.getItem(lastKey);return Object.hasOwn(routes,value)?value:null;} catch {return null;}};
  const remember = id => {if(!Object.hasOwn(routes,id))return;try {localStorage.setItem(lastKey,id);localStorage.setItem('dion-perspective-visited-v1','yes');} catch { /* Semantic navigation also works with blocked storage. */ }};
  // A direct project hash or explicit Both Worlds URL always takes precedence.
  // Replace keeps the routing-only root entry out of Back/Forward history.
  if (['/','/index.html'].includes(location.pathname) && !location.hash && new URLSearchParams(location.search).get('view') !== 'both') {
    location.replace(routes[readLast()] || '/welcome/');
    return;
  }
  document.documentElement.classList.add('js-navigation');
  const initialize = () => {
  const rememberPage = () => {const current=document.body.classList.contains('theme-both')?'both':document.body.classList.contains('theme-developer')?'developer':document.body.classList.contains('theme-manufacturing')?'manufacturing':null;if(current)remember(current);};
  rememberPage();addEventListener('pageshow',rememberPage);
  document.querySelectorAll('[data-perspective]').forEach(link => link.addEventListener('click',()=>remember(link.dataset.perspective)));
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', initialize, {once:true});
  else initialize();
})();

/* Shared motion: hero, scroll, pointer depth, and reduced-motion lifecycle. */
(() => {
  'use strict';

  function initialize() {
    if (!document.body) return; // A head redirect can finish before the body is parsed.
    // Both Worlds owns its collage motion; other modes retain this implementation.
    if (document.body.classList.contains('theme-both') || document.body.classList.contains('mode-story') || document.body.classList.contains('theme-welcome')) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1000px)');
    const quiet = document.body.classList.contains('theme-manufacturing');
    const ease = 'cubic-bezier(.2,.7,.2,1)';
    const running = new Set();
    const hero = document.querySelector('.both-hero, .mfg-hero, .dev-hero');
    const portrait = document.querySelector('.both-portrait, .mfg-portrait');
    const splash = document.getElementById('perspectiveSplash');
    const revealSelector = [
      '.section-heading > *', '.world-panel', '.selected-copy', '.selected-visual',
      '.journey article', '.experience-entry', '.competency-grid article',
      '.education-grid article', '.project-title-row', '.project-summary > *',
      '.project-shot', '.project-story article', '.skill-proof article',
      '.dev-process li', '.archive-entry', '.archive-preview',
      '.contact-layout > *', '.footer-top > *', '.armature-statement', '.case-text article',
    ].join(', ');
    const driftTargets = [...document.querySelectorAll('.selected-project, .world-glyph, .journey article, .experience-entry, .project-shot, .dev-process li')];
    let observer;
    let heroPlayed = false;
    let frame = 0;
    let pointerFrame = 0;
    let lastY = scrollY;
    let velocity = 0;
    let targetVelocity = 0;
    let enabled = false;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    function play(element, keyframes, options = {}) {
      if (!enabled || !element?.animate) return;
      const animation = element.animate(keyframes, {duration: quiet ? 420 : 560, easing: ease, ...options});
      running.add(animation);
      animation.finished.then(() => running.delete(animation), () => running.delete(animation));
      return animation;
    }

    function titleCharacters(title) {
      if (title.dataset.motionTitle) return [...title.querySelectorAll('.motion-char')];
      const label = title.cloneNode(true);
      label.querySelectorAll('br').forEach(br => br.replaceWith(document.createTextNode(' ')));
      title.setAttribute('aria-label', label.textContent.replace(/\s+/g, ' ').trim());
      const texts = [];
      const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) texts.push(walker.currentNode);
      texts.forEach(node => {
        const fragment = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { fragment.append(document.createTextNode(part)); return; }
          const word = document.createElement('span');
          word.className = 'motion-word';
          word.setAttribute('aria-hidden', 'true');
          [...part].forEach(character => {
            const span = document.createElement('span');
            span.className = 'motion-char';
            span.textContent = character;
            word.append(span);
          });
          fragment.append(word);
        });
        node.replaceWith(fragment);
      });
      title.dataset.motionTitle = 'true';
      return [...title.querySelectorAll('.motion-char')];
    }

    function animateHero() {
      if (!enabled || heroPlayed || !hero || splash?.open) return;
      heroPlayed = true;
      if (location.hash && !['#top', '#heroTitle'].includes(location.hash)) return;
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const title = hero.querySelector('h1');
      if (title) {
        const characters = titleCharacters(title);
        characters.forEach((character, index) => play(character, [
          {opacity: .35, transform: 'translateY(.23em)', filter: 'blur(2px)'},
          {opacity: 1, transform: 'translateY(0)', filter: 'blur(0)'},
        ], {duration: quiet ? 360 : 440, delay: Math.min(index * (quiet ? 8 : 13), 220)}));
      }
      play(hero.querySelector('.hero-register'), [{opacity: .6, transform: 'translateY(-8px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 380});
      play(portrait, [{opacity: .5, transform: 'translate3d(14px,18px,0) scale(.98)'}, {opacity: 1, transform: 'translate3d(0,0,0) scale(1)'}], {duration: quiet ? 520 : 700});
      hero.querySelectorAll('.both-intro, .hero-description, .dev-hero-bottom p, .actions > *, .dev-hero-bottom .button').forEach((element, index) => {
        play(element, [{opacity: .7, transform: 'translateY(12px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 420, delay: Math.min(index * 45, 140)});
      });
    }

    function observeSections() {
      if (!('IntersectionObserver' in window)) return;
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting || !enabled) return;
          const element = entry.target;
          observer.unobserve(element);
          if (element.dataset.motionRevealed) return;
          element.dataset.motionRevealed = 'true';
          const siblings = [...element.parentElement.children].filter(child => child.matches(revealSelector));
          const index = Math.max(0, siblings.indexOf(element));
          play(element, [{opacity: .55, transform: `translateY(${quiet ? 12 : 23}px)`}, {opacity: 1, transform: 'translateY(0)'}], {delay: Math.min(index, 3) * 45});
        });
      }, {threshold: .1, rootMargin: '0px 0px -3% 0px'});
      document.querySelectorAll(revealSelector).forEach(element => observer.observe(element));
    }

    function animateSplash() {
      if (!enabled || !splash?.open) return;
      play(splash.querySelector('.splash-inner'), [{opacity: .7, transform: 'translateY(16px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 360});
      splash.querySelectorAll('.perspective-choice').forEach((choice, index) => {
        play(choice, [{transform: 'translateY(12px)'}, {transform: 'translateY(0)'}], {duration: 420, delay: index * 55});
      });
    }

    function drift() {
      velocity += (targetVelocity - velocity) * .2;
      targetVelocity *= .8;
      driftTargets.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top > innerHeight + 50 || rect.bottom < -50) return;
        element.style.setProperty('--motion-drift', `${(velocity * (quiet ? .45 : .8)).toFixed(2)}px`);
      });
      if (Math.abs(velocity) > .03 || Math.abs(targetVelocity) > .03) frame = requestAnimationFrame(drift);
      else { frame = 0; driftTargets.forEach(element => element.style.removeProperty('--motion-drift')); }
    }

    addEventListener('scroll', () => {
      if (!enabled || splash?.open) return;
      targetVelocity = clamp(scrollY - lastY, -32, 32) * .18;
      lastY = scrollY;
      if (!frame) frame = requestAnimationFrame(drift);
    }, {passive: true});

    function resetPointer() {
      cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      portrait?.style.removeProperty('--motion-x');
      portrait?.style.removeProperty('--motion-y');
    }
    portrait?.addEventListener('pointermove', event => {
      if (!enabled || !pointer.matches || event.pointerType === 'touch' || pointerFrame) return;
      const {clientX, clientY} = event;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        const rect = portrait.getBoundingClientRect();
        const strength = quiet ? 3 : 7;
        portrait.style.setProperty('--motion-x', `${clamp((clientX - rect.left) / rect.width - .5, -.5, .5) * strength * 2}px`);
        portrait.style.setProperty('--motion-y', `${clamp((clientY - rect.top) / rect.height - .5, -.5, .5) * strength * 2}px`);
      });
    }, {passive:true});
    portrait?.addEventListener('pointerleave', resetPointer);
    pointer.addEventListener('change', resetPointer);

    function configure() {
      enabled = !preference.matches && typeof Element.prototype.animate === 'function';
      document.documentElement.dataset.motion = enabled ? 'enabled' : 'reduced';
      document.documentElement.classList.toggle('has-motion', enabled);
      observer?.disconnect();
      if (enabled) {
        lastY = scrollY;
        observeSections();
        animateSplash();
        animateHero();
      } else {
        running.forEach(animation => animation.cancel());
        running.clear();
        cancelAnimationFrame(frame);
        frame = 0;
        velocity = targetVelocity = 0;
        driftTargets.forEach(element => element.style.removeProperty('--motion-drift'));
        resetPointer();
      }
    }
    // Hero starts when the visitor has finished choosing, including native Escape.
    splash?.addEventListener('close', animateHero);
    preference.addEventListener('change', configure);
    configure();
  }
  if (document.readyState !== 'complete') addEventListener('DOMContentLoaded', initialize, {once:true});
  else initialize();
})();

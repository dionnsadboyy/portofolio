(() => {
  'use strict';
  let dispose = () => {};
  function initialize() {
    dispose();
    const bar = document.querySelector('[data-reading-bar]');
    if (!bar) return;
    const controller = new AbortController(), signal = controller.signal;
    const chapter = document.getElementById('readerChapter'), progress = bar.querySelector('.reading-bar__progress');
    const sections = [...document.querySelectorAll('#main > section[id]')];
    const labels = {cover:'cover',hero:'cover',intro:'kenalan',profile:'kenalan',perspectives:'dua sisi',work:'potongan karya',about:'perjalanan',learning:'arsip belajar',tools:'tools',experience:'pengalaman produksi',teamcut:'TEAMcut','bagong-lapar':'Bagong Lapar',armature:'Armature Monitoring','jidan-quest':'Jidan Quest','project-index':'indeks proyek',certificates:'sertifikat',contact:'sampai ketemu'};
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    let context, buffers, preparing, lastSound = -1000;
    let frame = 0, current = null, lastColor = '', alive = true;
    const sources = new Set();
    function stopSounds() {
      sources.forEach(source => { try { source.stop(); } catch { /* Already ended. */ } });
      sources.clear();
    }
    function sound(kind, preview = false) {
      if (!alive || !buffers || context?.state !== 'running' || document.hidden || (!preview && performance.now() - lastSound < 900)) return;
      lastSound = performance.now();
      const source = context.createBufferSource(), gain = context.createGain();
      source.buffer = buffers[kind === 'snap' ? 'snap' : 'swipe'];
      gain.gain.value = .28;
      source.connect(gain).connect(context.destination); sources.add(source);
      source.addEventListener('ended',() => {sources.delete(source);source.disconnect();gain.disconnect();},{once:true});
      source.start();
    }
    async function armAudio(preview = false) {
      if (!alive || !AudioContextClass || document.hidden) return;
      if (preparing) return preparing;
      // Creation/resume happen synchronously inside the gesture; fetching follows.
      try {
        context ||= new AudioContextClass();
        const resumed = context.resume();
        preparing = (async () => {
          await resumed;
          if (!buffers) {
            const decoded = await Promise.all(['page-swipe','paper-snap'].map(async name => {
              const response = await fetch('/assets/both-worlds/' + name + '.wav',{signal});
              if (!response.ok) throw Error('Audio unavailable');
              return context.decodeAudioData(await response.arrayBuffer());
            }));
            buffers = {swipe:decoded[0],snap:decoded[1]};
          }
          if (!alive) return;
          if (preview) sound('snap',true);
        })().catch(() => { /* Retry on the next gesture if audio is blocked or unavailable. */ }).finally(() => {preparing = null;});
        return preparing;
      } catch { /* Audio failure must not interrupt browsing. */ }
    }
    function unlock(event) {
      if (context?.state === 'running' && buffers) return;
      if (event.type === 'keydown' && (event.isComposing || event.ctrlKey || event.metaKey || event.altKey)) return;
      armAudio(true);
    }
    if (AudioContextClass) {
      document.addEventListener('pointerdown',unlock,{capture:true,passive:true,signal});
      document.addEventListener('keydown',unlock,{capture:true,signal});
    }
    document.addEventListener('portfolio-sfx',event => sound(event.detail?.kind),{signal});
    function background(element) {
      for (let node = element; node; node = node.parentElement) {
        const color = getComputedStyle(node).backgroundColor;
        if (color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)' && !/^rgba\(.*?,\s*0\s*\)$/.test(color)) return color;
      }
      return 'rgb(244, 234, 221)';
    }
    function update() {
      frame = 0;
      if (!alive || document.hidden) return;
      let active = sections[0], index = 0;
      const edge = bar.getBoundingClientRect().bottom + 2;
      sections.forEach((section,i) => {if (section.getBoundingClientRect().top <= edge) {active = section;index = i;}});
      if (active && current !== active.id) {
        const previous = current; current = active.id;
        const register = active.querySelector('.mode-register > span')?.textContent.match(/^(\d+)\s*\//)?.[1];
        chapter.textContent = (register || String(index).padStart(2,'0')) + ' / ' + (labels[active.id] || 'cerita');
        chapter.href = '#' + active.id;
        if (previous) sound('swipe');
      }
      const color = background(active || document.querySelector('#main') || document.body);
      if (color !== lastColor) {
        lastColor = color;
        const rgb = color.match(/[\d.]+/g)?.slice(0,3).map(Number) || [244,234,221];
        const linear = rgb.map(n => {const c = n / 255;return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;});
        const dark = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722 < .22;
        bar.style.setProperty('--reader-bg',color);
        bar.style.setProperty('--reader-ink',dark ? '#F4EADD' : '#302339');
        bar.style.setProperty('--reader-accent',dark ? '#CEB9E9' : '#7850a7');
        bar.style.setProperty('--reader-line',dark ? '#CEB9E940' : '#30233926');
      }
      const extent = document.documentElement.scrollHeight - innerHeight;
      const value = extent > 0 ? Math.max(0,Math.min(1,scrollY / extent)) : 0;
      progress.style.transform = `scaleX(${value})`;
      bar.dataset.progress = value.toFixed(3);
      bar.dataset.chapter = active?.id || 'welcome';
    }
    function schedule() {if (!frame && alive) frame = requestAnimationFrame(update);}
    addEventListener('scroll',schedule,{passive:true,signal});
    addEventListener('resize',schedule,{passive:true,signal});
    addEventListener('hashchange',schedule,{signal});
    document.addEventListener('visibilitychange',() => {
      if (document.hidden) {stopSounds();context?.suspend().catch(() => {});}
      else {schedule();context?.resume().catch(() => {});}
    },{signal});
    const observer = 'ResizeObserver' in window ? new ResizeObserver(schedule) : null;
    observer?.observe(document.querySelector('#main') || document.body);
    document.fonts?.ready.then(schedule);
    update();
    dispose = () => {
      alive = false;controller.abort();observer?.disconnect();cancelAnimationFrame(frame);stopSounds();
      context?.close().catch(() => {});
    };
  }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded',initialize,{once:true}); else initialize();
  addEventListener('pagehide',() => dispose());
  addEventListener('pageshow',event => {if (event.persisted) initialize();});
})();

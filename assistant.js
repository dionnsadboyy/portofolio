(() => {
  'use strict';
  const root = document.querySelector('[data-assistant-root]');
  if (!root) return;
  const byId = id => document.getElementById(id);
  const panel = byId('assistantPanel'), launcher = byId('assistantLauncher');
  // Leave native welcome navigation available if the dialog API is unavailable.
  if (typeof panel.showModal !== 'function') return;
  const messages = byId('assistantMessages'), thread = byId('assistantThread');
  const input = byId('assistantInput'), form = byId('assistantForm'), send = byId('assistantSend');
  const status = byId('assistantStatus'), reconnect = byId('assistantReconnect');
  const localLinks = byId('assistantLocalLinks'), latest = byId('assistantLatest');
  const announcement = byId('assistantAnnouncement'), curiosity = byId('assistantCuriosity');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  window[Symbol.for('dion.yon.motion')] = preference;
  const animations = new Set(), storageKey = 'dion-yon-conversation-v1';
  let available = false, busy = false, checking = false, closing = false, stick = true;
  let capabilityRequest, chatRequest, viewportFrame = 0, activeSection = document.body.classList.contains('theme-welcome') ? 'welcome' : 'hero';
  let turns = [], savedScroll = null, scrollLock, epoch = 0;
  function restore() { try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey));
    if (saved && Array.isArray(saved.turns)) {
      turns = saved.turns.filter(t => t && typeof t.message === 'string' && t.message.length <= 600)
        .slice(-40).map(t => ({message:t.message, answer:typeof t.answer === 'string' ? t.answer : '',
          error:t.answer ? '' : 'Pengiriman sebelumnya belum selesai. Coba kirim lagi.',
          section:typeof t.section === 'string' ? t.section : '', project:typeof t.project === 'string' ? t.project : ''}));
      input.value = typeof saved.draft === 'string' ? saved.draft.slice(0,600) : '';
    }
  } catch { /* Storage is optional, including in privacy mode. */ } }
  restore();

  function persist() {
    try { sessionStorage.setItem(storageKey, JSON.stringify({turns:turns.slice(-40).map(({message,answer,error,section,project}) => ({message,answer,error,section,project})), draft:input.value})); } catch { /* Keep the in-memory conversation. */ }
  }
  function historyBefore(turn) {
    const history = [];
    for (const item of turns) {
      if (item === turn) break;
      if (item.answer) history.push({role:'user',content:item.message}, {role:'assistant',content:item.answer.slice(0,600)});
    }
    return history.slice(-6);
  }
  function play(element, frames, delay = 0, duration = 300) {
    if (preference.matches || !element.animate) return null;
    const animation = element.animate(frames, {duration, delay, easing:'cubic-bezier(.2,.75,.2,1)', fill:'backwards'});
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    return animation;
  }
  function stopMotion() { animations.forEach(a => a.cancel()); animations.clear(); }
  preference.addEventListener('change', () => { if (preference.matches) stopMotion(); });
  function growInput() {
    input.style.height = 'auto';
    input.style.height = Math.min(112, Math.max(44,input.scrollHeight)) + 'px';
  }
  function updateViewport() {
    cancelAnimationFrame(viewportFrame);
    viewportFrame = requestAnimationFrame(() => {
      const viewport = window.visualViewport;
      root.style.setProperty('--yon-vh', (viewport?.height || innerHeight) + 'px');
      root.style.setProperty('--yon-keyboard', Math.max(0,innerHeight - (viewport?.height || innerHeight) - (viewport?.offsetTop || 0)) + 'px');
      growInput();
      if (stick && turns.length) scrollToLatest();
    });
  }
  function scrollToLatest() { messages.scrollTop = messages.scrollHeight; stick = true; latest.hidden = true; }
  function afterContentChange() {
    if (!turns.length) return;
    if (stick && panel.open) scrollToLatest();
    else if (!stick) latest.hidden = false;
  }
  messages.addEventListener('scroll', () => {
    stick = messages.scrollHeight - messages.clientHeight - messages.scrollTop < 72;
    if (stick) latest.hidden = true;
  }, {passive:true});
  latest.addEventListener('click', scrollToLatest);

  // Render provider text as text. Only explicit http(s)/mailto URLs become links;
  // HTML, markdown markup and code cannot inject DOM or overflow the column.
  function appendText(element, text) {
    let offset = 0;
    for (const match of text.matchAll(/https?:\/\/[^\s<>"`]+|mailto:[^\s<>"`]+/g)) {
      const url = match[0].replace(/[.,;!?)]+$/, '');
      element.append(document.createTextNode(text.slice(offset,match.index)));
      const link = document.createElement('a'); link.href = url; link.textContent = url;
      if (url.startsWith('http')) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      element.append(link); offset = match.index + url.length;
    }
    element.append(document.createTextNode(text.slice(offset)));
  }
  function message(text, role) {
    const el = document.createElement('p'), label = document.createElement('span');
    el.className = 'assistant-message assistant-message--' + role;
    label.className = 'assistant-message-label'; label.textContent = role === 'user' ? 'kamu' : 'Yon';
    el.append(label); appendText(el,text); return el;
  }
  function renderTurn(turn) {
    const el = turn.element || document.createElement('div');
    el.className = 'assistant-turn'; el.replaceChildren(message(turn.message,'user'));
    if (turn.answer) el.append(message(turn.answer,'assistant'));
    else if (turn.error) {
      const error = document.createElement('div'), text = document.createElement('p'), retry = document.createElement('button');
      error.className = 'assistant-error'; text.textContent = turn.error;
      retry.type = 'button'; retry.textContent = 'coba lagi ↗'; retry.dataset.assistantRetry = '';
      retry.disabled = busy; retry.addEventListener('click', () => requestAnswer(turn));
      error.append(text,retry); el.append(error);
    }
    if (!turn.element) thread.append(el);
    turn.element = el;
    panel.toggleAttribute('data-conversation',true);
    afterContentChange();
  }
  turns.forEach(renderTurn);
  function setBusy(value) {
    busy = value; send.disabled = value; form.setAttribute('aria-busy',String(value));
    thread.querySelectorAll('[data-assistant-retry]').forEach(button => {button.disabled = value;});
    // Keep the textarea usable so the next draft can be written while waiting.
  }
  function setAvailability(value, text = '') {
    available = value; form.hidden = !value;
    localLinks.hidden = value || !turns.length;
    reconnect.hidden = value;
    status.textContent = text || (value ? '' : 'chat AI belum tersedia. Pilihan di atas tetap bisa dipakai.');
    byId('assistantFootnote').textContent = (value ? 'asisten AI' : 'panduan lokal') + ' • tentang Dion & portfolionya';
    if (value) growInput();
  }
  async function checkCapability() {
    if (checking || busy) return;
    checking = true; reconnect.disabled = true;
    status.textContent = 'Memeriksa ketersediaan chat…';
    const controller = new AbortController(), currentEpoch = epoch; capabilityRequest = controller;
    const timeout = setTimeout(() => controller.abort(),4000);
    try {
      const response = await fetch('/api/portfolio-assistant', {headers:{Accept:'application/json'},cache:'no-store',signal:controller.signal});
      const data = response.ok ? await response.json() : null;
      if (currentEpoch === epoch) setAvailability(data?.success === true && data.available === true);
    } catch { if (currentEpoch === epoch) setAvailability(false); }
    finally { clearTimeout(timeout); if (currentEpoch === epoch) {checking = false; reconnect.disabled = false;} if (capabilityRequest === controller) capabilityRequest = null; }
  }
  reconnect.addEventListener('click',checkCapability);

  function lockPage() {
    const html = document.documentElement;
    scrollLock = {overflow:html.style.overflow,gutter:html.style.scrollbarGutter};
    html.style.scrollbarGutter = 'stable'; html.style.overflow = 'hidden';
  }
  function unlockPage() {
    if (!scrollLock) return;
    document.documentElement.style.overflow = scrollLock.overflow;
    document.documentElement.style.scrollbarGutter = scrollLock.gutter; scrollLock = null;
  }
  const extraOpeners = [...document.querySelectorAll('[data-assistant-open]')];
  for (const opener of extraOpeners) {
    opener.setAttribute('aria-controls','assistantPanel'); opener.setAttribute('aria-haspopup','dialog'); opener.setAttribute('aria-expanded','false');
    opener.addEventListener('click', event => {event.preventDefault();openPanel();});
  }
  function expanded(value) { [launcher,...extraOpeners].forEach(el => el.setAttribute('aria-expanded',String(value))); }
  function openPanel() {
    if (panel.open) return;
    closing = false; stopMotion(); root.setAttribute('data-open',''); expanded(true); curiosity.hidden = true;
    try { localStorage.setItem('dion-yon-hint-v1','opened'); } catch { /* Optional hint only. */ }
    updateViewport(); lockPage(); panel.showModal();
    window.visualViewport?.addEventListener('resize',updateViewport);
    window.visualViewport?.addEventListener('scroll',updateViewport);
    window.addEventListener('resize',updateViewport);
    if (savedScroll !== null && !stick) messages.scrollTop = savedScroll;
    play(panel,[{opacity:0,transform:'translate(22px,30px)'},{opacity:1,transform:'translate(0,0)'}]);
    [panel.querySelector('.assistant-panel__head'),messages,panel.querySelector('.assistant-bottom')].forEach((el,i) => play(el,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],40+i*35,230));
    if (!available && !busy) checkCapability();
  }
  function finishClose() {
    if (!panel.open) return;
    savedScroll = messages.scrollTop; panel.close();
  }
  function closePanel() {
    if (!panel.open || closing) return;
    closing = true; persist(); stopMotion();
    const animation = play(panel,[{opacity:1,transform:'translate(0,0)'},{opacity:0,transform:'translate(22px,30px)'}],0,260);
    if (animation) animation.finished.then(finishClose,finishClose); else finishClose();
  }
  launcher.addEventListener('click',openPanel);
  byId('assistantClose').addEventListener('click',closePanel);
  panel.addEventListener('cancel',event => {event.preventDefault();closePanel();});
  panel.addEventListener('close',() => {
    closing = false; stopMotion(); root.removeAttribute('data-open'); expanded(false); unlockPage();
    window.visualViewport?.removeEventListener('resize',updateViewport);
    window.visualViewport?.removeEventListener('scroll',updateViewport);
    window.removeEventListener('resize',updateViewport); cancelAnimationFrame(viewportFrame);
    launcher.focus({preventScroll:true});
    // An explicit user request can finish while hidden. Never erase or resend it.
  });
  panel.addEventListener('click',event => {
    if (event.target !== panel) return;
    const rect = panel.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closePanel();
  });
  panel.addEventListener('keydown',event => {
    if (event.key !== 'Tab') return;
    const stops = [...panel.querySelectorAll('a[href],button:not(:disabled),textarea,[tabindex="0"]')].filter(el => el.getClientRects().length);
    const first = stops[0], last = stops.at(-1);
    if (event.shiftKey && document.activeElement === first) {event.preventDefault();last.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
  });
  input.addEventListener('input',() => {const keep = stick;growInput();stick = keep;afterContentChange();persist();});
  let composing = false;
  input.addEventListener('compositionstart',() => {composing = true;});
  input.addEventListener('compositionend',() => {composing = false;});
  input.addEventListener('keydown',event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && !composing && event.keyCode !== 229 && matchMedia('(pointer:fine)').matches) {
      event.preventDefault(); form.requestSubmit();
    }
  });
  byId('assistantSuggestions').addEventListener('click',event => {
    const link = event.target.closest('[data-assistant-prompt]');
    if (!link || !available || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); if (!busy) startTurn(link.dataset.assistantPrompt);
  });
  form.addEventListener('submit',event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!available || busy || !text || text.length > 600 || composing) return;
    input.value = ''; growInput(); startTurn(text);
  });
  function startTurn(text) {
    const project = document.querySelector('.archive-entry.is-active[data-project-id]')?.dataset.projectId || '';
    const turn = {message:text, answer:'', error:'', section:activeSection, project};
    turns.push(turn); stick = true; renderTurn(turn); persist(); requestAnswer(turn);
  }
  async function requestAnswer(turn) {
    if (busy) return;
    const controller = new AbortController(), currentEpoch = epoch; chatRequest = controller;
    turn.error = ''; setBusy(true); renderTurn(turn);
    status.textContent = 'Mengirim pertanyaan…';
    const timeout = setTimeout(() => controller.abort(),25000);
    try {
      const response = await fetch('/api/portfolio-assistant',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:turn.message,section:turn.section,project:turn.project || undefined,history:historyBefore(turn)}),signal:controller.signal});
      const data = await response.json();
      if (currentEpoch !== epoch) return;
      if (!response.ok || data?.success !== true || typeof data.answer !== 'string' || !data.answer.trim()) {
        if (response.status === 503) setAvailability(false);
        throw new Error('response');
      }
      setAvailability(true);
      const outOfScope = "I'm here to help you explore Dion's portfolio. Try asking about his background, projects, skills, or experience.";
      turn.answer = data.answer === outOfScope ? 'Aku khusus membantu menjelaskan Dion dan portfolio ini. Coba tanya soal latar belakang, proyek, skill, atau pengalaman.' : data.answer;
      status.textContent = available ? '' : 'chat AI belum tersedia. Gunakan bantuan navigasi.';
      announcement.textContent = 'Jawaban Yon tersedia. ' + turn.answer;
    } catch {
      if (currentEpoch !== epoch) return;
      turn.error = controller.signal.aborted ? 'Waktu tunggu habis. Pertanyaan belum mendapat jawaban.' : 'Pertanyaan belum berhasil dijawab. Coba lagi atau hubungi Dion.';
      status.textContent = available ? 'Pengiriman gagal. Kamu bisa mencoba lagi.' : 'chat AI belum tersedia. Gunakan bantuan navigasi.';
      announcement.textContent = turn.error;
    } finally {
      clearTimeout(timeout);
      if (currentEpoch === epoch) {chatRequest = null; setBusy(false); renderTurn(turn); persist();}
      // Keep focus where the visitor left it, even while a response arrives.
    }
  }
  const sections = [...document.querySelectorAll('main section[id]')];
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) activeSection = entry.target.id;
  },{threshold:.32}) : null;
  sections.forEach(section => observer?.observe(section));
  addEventListener('pagehide',() => {
    persist(); epoch++; stopMotion(); capabilityRequest?.abort(); chatRequest?.abort();
    capabilityRequest = chatRequest = null; checking = false; setBusy(false);
    observer?.disconnect();
    if (panel.open) panel.close(); unlockPage();
  });
  addEventListener('pageshow',event => {
    if (!event.persisted) return;
    restore(); thread.replaceChildren(); panel.removeAttribute('data-conversation');
    turns.forEach(turn => {delete turn.element; renderTurn(turn);}); savedScroll = null; stick = true;
    sections.forEach(section => observer?.observe(section));
  });
  try {
    if (!localStorage.getItem('dion-yon-hint-v1')) {curiosity.hidden = false;localStorage.setItem('dion-yon-hint-v1','seen');}
  } catch { /* Do not repeat a hint if storage is unavailable. */ }
  document.documentElement.classList.add('js-assistant-ready');
})();

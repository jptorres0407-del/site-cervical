/* autonoME — interações do site. Depende de motion.js (window.Motion), carregado antes. */
(() => {
  // Dados de contato: preencha aqui quando estiverem disponíveis (veja README → Pendências).
  // Enquanto o WhatsApp estiver vazio, os botões de contato abrem um e-mail com a mesma mensagem.
  const CONFIG = {
    whatsapp: '', // só números, com DDI e DDD. Ex.: '5511999999999'
    email: 'getyourautonome@gmail.com',
    instagram: '', // URL completa do perfil
    privacyPolicy: '', // URL da política de privacidade, quando publicada
    terms: '', // URL dos termos de uso, quando publicados
    message: 'Olá! Conheci a Autonome pelo site e gostaria de conversar sobre a criação de um site para minha empresa.',
    emailSubject: 'Quero criar o site da minha empresa',
  };

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reduceMq = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => (window.Motion ? window.Motion.reduced() : reduceMq.matches);
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  // ---------- Contato ----------
  const phone = CONFIG.whatsapp.replace(/\D/g, '');
  const whatsappUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(CONFIG.message)}` : '';
  const mailUrl = `mailto:${CONFIG.email}?subject=${encodeURIComponent(CONFIG.emailSubject)}&body=${encodeURIComponent(CONFIG.message)}`;
  $$('[data-contact]').forEach((a) => {
    if (whatsappUrl) {
      a.href = whatsappUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    } else {
      a.href = mailUrl;
    }
  });
  const hint = $('[data-contact-hint]');
  if (hint && whatsappUrl) hint.textContent = 'Abre uma conversa no WhatsApp com uma mensagem pronta.';
  if (whatsappUrl) $$('[data-channel="whatsapp"]').forEach((li) => { li.hidden = false; });
  if (CONFIG.instagram) {
    $$('[data-instagram]').forEach((a) => { a.href = CONFIG.instagram; });
    $$('[data-channel="instagram"]').forEach((li) => { li.hidden = false; });
  }
  Object.entries({ privacy: CONFIG.privacyPolicy, terms: CONFIG.terms }).forEach(([key, url]) => {
    const li = url && $(`[data-doc="${key}"]`);
    if (!li) return;
    li.querySelector('a').href = url;
    li.hidden = false;
    li.closest('[data-docs]').hidden = false;
  });
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // ---------- Menu móvel ----------
  const header = $('.site-header');
  const toggle = $('.menu-toggle');
  const menu = $('#menu');
  const outside = [$('main'), $('.site-footer'), $('.skip-link')];
  let closeTimer;
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    root.classList.toggle('menu-open', open);
    outside.forEach((el) => { if (el) el.inert = open; });
    clearTimeout(closeTimer);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      menu.querySelector('a').focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-open');
      closeTimer = setTimeout(() => { menu.hidden = true; }, reduced() ? 0 : 360);
    }
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !root.classList.contains('menu-open')) return;
    setMenu(false);
    toggle.focus();
  });
  matchMedia('(min-width: 1100px)').addEventListener('change', (e) => {
    if (e.matches && root.classList.contains('menu-open')) setMenu(false);
  });

  // ---------- Hero: anatomia de um site ----------
  const hero = $('.hero');
  const anatomy = $('.anatomy');
  const small = matchMedia('(max-width: 639px)');
  const fitAnatomy = () => anatomy.setAttribute('viewBox', small.matches ? '26 28 458 574' : '0 0 660 630');
  fitAnatomy();
  small.addEventListener('change', fitAnatomy);
  if (reduced()) {
    anatomy.classList.add('is-built', 'is-live');
  } else {
    setTimeout(() => anatomy.classList.add('is-built'), 380);
    setTimeout(() => anatomy.classList.add('is-live'), 2400);
  }
  hero.addEventListener('pointermove', (e) => {
    if (!fine.matches || reduced()) return;
    const r = hero.getBoundingClientRect();
    anatomy.style.setProperty('--px', (((e.clientX - r.left) / r.width - 0.5) * 16).toFixed(2));
  });
  hero.addEventListener('pointerleave', () => anatomy.style.setProperty('--px', '0'));

  // ---------- Serviços: placa fixa com a ilustração ativa ----------
  const services = $$('.service');
  const stageVisuals = $('.stage-visuals');
  const stageIndex = $('.stage-index');
  const stageName = $('.stage-name');
  services.forEach((li, i) => {
    $$('[pathLength]', li).forEach((el, j) => {
      el.classList.add('draw');
      el.style.setProperty('--d', j);
    });
    const wrap = document.createElement('div');
    wrap.className = i === 0 ? 'stage-visual is-active' : 'stage-visual';
    wrap.appendChild($('.service-visual svg', li).cloneNode(true));
    stageVisuals.appendChild(wrap);
  });
  const stageItems = $$('.stage-visual', stageVisuals);
  let activeService = 0;
  const setService = (i) => {
    if (i === activeService) return;
    activeService = i;
    services.forEach((li, j) => li.classList.toggle('is-active', j === i));
    stageItems.forEach((el, j) => el.classList.toggle('is-active', j === i));
    stageIndex.textContent = String(i + 1).padStart(2, '0');
    stageName.textContent = $('h3', services[i]).textContent;
  };
  services.forEach((li, i) => li.addEventListener('pointerenter', () => { if (fine.matches) setService(i); }));

  // ---------- Quem somos: engrenagens acopladas à rolagem ----------
  const mechanism = $('.mechanism-svg');
  const gears = $$('.gear-rot', mechanism).map((g) => ({ g, ratio: parseFloat(g.dataset.ratio) }));

  // ---------- Processo: pinhão (engrenagem da logo) rolando na cremalheira ----------
  const track = $('.process-track');
  const pinion = $('.pinion', track);
  const rack = $('.rack', track);
  const steps = $$('.step', track);
  const stepNow = $('[data-step-current]');

  // ---------- Conversão: marcações do mostrador ----------
  const dial = $('.cta-dial');
  const ticks = $('.dial-ticks', dial);
  for (let i = 0; i < 120; i += 1) {
    const a = (i / 120) * Math.PI * 2;
    const r2 = i % 10 === 0 ? 270 : 284;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', (Math.cos(a) * 296).toFixed(1));
    line.setAttribute('y1', (Math.sin(a) * 296).toFixed(1));
    line.setAttribute('x2', (Math.cos(a) * r2).toFixed(1));
    line.setAttribute('y2', (Math.sin(a) * r2).toFixed(1));
    ticks.appendChild(line);
  }

  const enters = $$('[data-enter]');

  // ---------- Laço de rolagem: lê tudo primeiro, escreve depois ----------
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    const motion = !reduced();
    const heroRect = hero.getBoundingClientRect();
    const mechRect = mechanism.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const pin = pinion.getBoundingClientRect().height;
    const stepTops = steps.map((s) => s.getBoundingClientRect().top);
    const serviceTops = services.map((s) => s.getBoundingClientRect().top);
    const enterTops = enters.map((el) => el.getBoundingClientRect().top);
    const dialRect = dial.parentElement.getBoundingClientRect();

    header.classList.toggle('is-scrolled', scrollY > 12);

    if (motion && heroRect.bottom > 0) {
      const p = clamp(-heroRect.top / (heroRect.height * 0.75), 0, 1);
      anatomy.style.setProperty('--scroll-gap', (96 - p * 36).toFixed(1));
    }

    if (motion && mechRect.bottom > 0 && mechRect.top < vh) {
      const turn = ((vh - mechRect.top) / (vh + mechRect.height)) * 150;
      gears.forEach(({ g, ratio }) => g.setAttribute('transform', `rotate(${(turn * ratio).toFixed(2)})`));
    }

    let current = -1;
    serviceTops.forEach((top, i) => { if (top < vh * 0.52) current = i; });
    if (serviceTops[0] < vh && serviceTops[serviceTops.length - 1] > -vh) setService(Math.max(current, 0));

    const travel = Math.max(trackRect.height - pin, 0);
    const y = motion ? clamp(vh * 0.55 - trackRect.top - pin / 2, 0, travel) : travel;
    const pitchRadius = pin * (100 / 230); // raio primitivo da engrenagem pequena da logo
    pinion.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) rotate(${((y / pitchRadius) * 57.2958).toFixed(2)}deg)`;
    rack.style.setProperty('--fill', trackRect.height ? ((y + pin / 2) / trackRect.height).toFixed(4) : '1');
    let reachedIndex = 0;
    steps.forEach((step, i) => {
      const reached = !motion || stepTops[i] - trackRect.top <= y + pin / 2 + 2;
      step.classList.toggle('is-reached', reached);
      if (reached) reachedIndex = i;
    });
    stepNow.textContent = String(reachedIndex + 1).padStart(2, '0');

    enters.forEach((el, i) => {
      const e = motion ? clamp((vh - enterTops[i]) / (vh * 0.6), 0, 1) : 1;
      el.style.setProperty('--enter', e.toFixed(3));
    });

    if (motion && dialRect.bottom > 0 && dialRect.top < vh) {
      dial.style.setProperty('--dial', `${((vh - dialRect.top) * 0.025).toFixed(2)}deg`);
    }
  };
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate);
  reduceMq.addEventListener('change', requestUpdate);
  update();

  // ---------- Perguntas frequentes ----------
  root.classList.add('js-acc');
  $$('.acc-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.closest('.acc-item').classList.toggle('is-open', open);
    });
  });
})();

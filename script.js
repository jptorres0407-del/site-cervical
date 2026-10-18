/* autonoME — interações do site (v2). Depende de motion.js (window.Motion), carregado antes. */
(() => {
  // Dados de contato: preencha quando estiverem disponíveis (veja README → Pendências).
  // Enquanto o WhatsApp estiver vazio, os botões de contato abrem um e-mail com a mesma mensagem.
  const CONFIG = {
    whatsapp: '', // só números, com DDI e DDD. Ex.: '5511999999999'
    email: 'getyourautonome@gmail.com',
    instagram: '', // URL completa do perfil
    privacyPolicy: '', // URL da política de privacidade, quando publicada
    message: 'Olá! Conheci a Autonome pelo site e gostaria de conversar sobre a criação de um site para minha empresa.',
    emailSubject: 'Quero criar o site da minha empresa',
  };

  const root = document.documentElement;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reduceMq = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => (window.Motion ? window.Motion.reduced() : reduceMq.matches);
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const ease = {
    expoOut: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    cubicOut: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  };
  const progress = (t, start, duration) => clamp((t - start) / duration, 0, 1);
  const toUser = (svg, x, y) => new DOMPoint(x, y).matrixTransform(svg.getScreenCTM().inverse());

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
  if (whatsappUrl) $$('[data-channel="whatsapp"]').forEach((el) => { el.hidden = false; });
  if (CONFIG.instagram) {
    $$('[data-instagram]').forEach((a) => { a.href = CONFIG.instagram; a.hidden = false; });
  }
  if (CONFIG.privacyPolicy) {
    $$('[data-doc="privacy"]').forEach((a) => { a.href = CONFIG.privacyPolicy; a.hidden = false; });
  }
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // ---------- Botões: o preenchimento nasce do ponto onde o cursor entra ----------
  $$('.btn').forEach((btn) => {
    const spot = (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--bx', `${e.clientX - r.left}px`);
      btn.style.setProperty('--by', `${e.clientY - r.top}px`);
    };
    btn.addEventListener('pointerenter', spot);
    btn.addEventListener('pointerleave', spot);
  });

  // ---------- Hero: engrenagens da logo, giráveis com o dedo ou o mouse ----------
  const gearsSvg = $('.gears-svg');
  const gears = (() => {
    const BC = [683.4, 193.6];
    const SC = [487.5, 275.3];
    const big = $('.g-big', gearsSvg);
    const small = $('.g-small', gearsSvg);
    const clipBig = $('.clip-big', gearsSvg);
    const clipBig2 = $('.clip-big2', gearsSvg);
    const outline = $('.g-outline', gearsSvg);
    const clipSmall = $('.clip-small', gearsSvg);
    const ripples = $('.g-ripples', gearsSvg);
    const readout = $('.readout-deg');
    let angle = 0;
    let vel = 0;
    let last = 0;
    let running = false;
    let drag = null;
    let settle = 0;
    // O traçado branco só existe com as engrenagens paradas: some ao mover e volta a desenhar ao assentar
    const setStatic = (on) => gearsSvg.classList.toggle('is-static', on);
    const scheduleStatic = (delay = 650) => {
      clearTimeout(settle);
      settle = setTimeout(() => setStatic(true), delay);
    };
    const moving = () => {
      clearTimeout(settle);
      setStatic(false);
    };

    const render = () => {
      const tb = `rotate(${angle.toFixed(2)} ${BC[0]} ${BC[1]})`;
      const ts = `rotate(${((-angle * 4) / 3).toFixed(2)} ${SC[0]} ${SC[1]})`; // 12 dentes x 9 dentes
      big.setAttribute('transform', tb);
      clipBig.setAttribute('transform', tb);
      clipBig2.setAttribute('transform', tb);
      small.setAttribute('transform', ts);
      outline.setAttribute('transform', ts);
      clipSmall.setAttribute('transform', ts);
      readout.textContent = `${String(Math.round(((angle % 360) + 360) % 360)).padStart(3, '0')}°`;
    };
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      if (!drag) {
        angle += vel * dt;
        vel *= Math.exp(-1.4 * dt);
      }
      render();
      if (drag || Math.abs(vel) > 1.2) {
        requestAnimationFrame(tick);
      } else {
        vel = 0;
        running = false;
        scheduleStatic();
      }
    };
    const run = () => {
      moving();
      if (running) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(tick);
    };
    const kick = (v) => {
      if (!v) return;
      vel = clamp(vel + v, -1800, 1800);
      run();
    };
    const ripple = (p) => {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', p.x.toFixed(1));
      c.setAttribute('cy', p.y.toFixed(1));
      c.setAttribute('r', '46');
      ripples.appendChild(c);
      const a = c.animate([{ transform: 'scale(.15)', opacity: 0.9 }, { transform: 'scale(2.4)', opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)' });
      a.finished.then(() => c.remove(), () => c.remove());
    };
    const angleAt = (p, c) => (Math.atan2(p.y - c[1], p.x - c[0]) * 180) / Math.PI;

    gearsSvg.addEventListener('pointerdown', (e) => {
      const p = toUser(gearsSvg, e.clientX, e.clientY);
      const dS = Math.hypot(p.x - SC[0], p.y - SC[1]);
      const dB = Math.hypot(p.x - BC[0], p.y - BC[1]);
      if (dS > 125 && dB > 195) return;
      const onSmall = dS < 120 && dS < dB;
      drag = { small: onSmall, a: angleAt(p, onSmall ? SC : BC), t: performance.now(), moved: 0, p };
      vel = 0;
      gearsSvg.setPointerCapture(e.pointerId);
      gearsSvg.classList.add('is-dragging');
      run();
    });
    gearsSvg.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const p = toUser(gearsSvg, e.clientX, e.clientY);
      const c = drag.small ? SC : BC;
      if (Math.hypot(p.x - c[0], p.y - c[1]) < 24) return; // perto do eixo o ângulo é instável
      const a = angleAt(p, c);
      let d = a - drag.a;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      drag.a = a;
      const dBig = drag.small ? (-d * 3) / 4 : d;
      angle += dBig;
      const now = performance.now();
      const dt = Math.max(8, now - drag.t) / 1000;
      drag.t = now;
      drag.moved += Math.abs(d);
      vel = vel * 0.5 + (dBig / dt) * 0.5;
    });
    const release = (e) => {
      if (!drag) return;
      const { moved, p, small: onSmall } = drag;
      drag = null;
      gearsSvg.classList.remove('is-dragging');
      if (e.type === 'pointerup' && moved < 3) {
        ripple(p);
        const c = onSmall ? SC : BC;
        const dir = p.x >= c[0] ? 1 : -1;
        vel = 0;
        kick((onSmall ? -dir * 0.75 : dir) * (reduced() ? 0 : 520));
        if (reduced()) { angle += onSmall ? -dir * 30 : dir * 30; render(); }
      } else if (reduced()) {
        vel = 0;
      } else {
        vel = clamp(vel, -1800, 1800);
      }
      run();
    };
    gearsSvg.addEventListener('pointerup', release);
    gearsSvg.addEventListener('pointercancel', release);
    render();
    scheduleStatic(reduced() ? 0 : 2600);
    return { kick, setStatic, moving };
  })();

  // ---------- Abertura ----------
  let isReady = false;
  const heroTitle = $('.hero-title');
  if (window.Motion) window.Motion.split(heroTitle);
  const ready = () => {
    if (isReady) return;
    isReady = true;
    root.classList.remove('intro-playing');
    root.classList.add('is-ready');
    if (!reduced()) setTimeout(() => gears.kick(380), 250);
  };

  const intro = $('#intro');
  if (root.classList.contains('js-intro') && intro) {
    const svg = $('.intro-logo', intro);
    const big = $('#i-big', svg);
    const small = $('#i-small', svg);
    const outline = $('.i-outline', svg);
    const letters = $$('.i-letter', svg);
    const me = $('.i-me', svg);
    const shine = $('.i-shine', svg);
    const glow = $('.i-glow', svg);
    const BC = [683.4, 193.6];
    const SC = [487.5, 275.3];
    const MEC = [1115, 527];
    const EXIT = 4000;
    // As engrenagens partem de fora dos cantos opostos da tela
    const b0 = toUser(svg, 1.2 * innerWidth, -0.2 * innerHeight);
    const s0 = toUser(svg, -0.2 * innerWidth, 1.2 * innerHeight);
    const bOff = [b0.x - BC[0], b0.y - BC[1]];
    const sOff = [s0.x - SC[0], s0.y - SC[1]];
    let start = 0;
    let raf = 0;
    let leaving = false;

    const place = (el, off, c, p, angle, curve) => {
      const e = ease.expoOut(p);
      const bend = Math.sin(Math.PI * p) * curve * (1 - e);
      const x = off[0] * (1 - e) - off[1] * bend;
      const y = off[1] * (1 - e) + off[0] * bend;
      const s = 0.5 + 0.5 * ease.cubicOut(p);
      el.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)} ${c[0]} ${c[1]}) translate(${c[0]} ${c[1]}) scale(${s.toFixed(4)}) translate(${-c[0]} ${-c[1]})`);
      el.setAttribute('opacity', Math.min(1, p * 4).toFixed(3));
    };
    const frame = (now) => {
      if (!start) start = now;
      const t = now - start;
      // Giro contínuo e acoplado: 480° na grande = 16 dentes; a pequena gira 4/3 no sentido oposto
      const spin = -480 * (1 - ease.cubicOut(progress(t, 60, 2300)));
      const fly = progress(t, 60, 1500);
      place(big, bOff, BC, fly, spin, 0.22);
      place(small, sOff, SC, fly, (-spin * 4) / 3, -0.22);
      letters.forEach((el, i) => {
        const p = progress(t, 1300 + i * 70, 950);
        el.setAttribute('transform', `translate(0 ${((1 - ease.expoOut(p)) * 170).toFixed(2)})`);
        el.setAttribute('opacity', Math.min(1, p * 2.4).toFixed(3));
      });
      const pm = progress(t, 1860, 1000);
      const em = ease.expoOut(pm);
      const ms = 1 + 0.3 * (1 - em);
      me.setAttribute('transform', `translate(${((1 - em) * 150).toFixed(2)} 0) translate(${MEC[0]} ${MEC[1]}) scale(${ms.toFixed(4)}) translate(${-MEC[0]} ${-MEC[1]})`);
      me.setAttribute('opacity', Math.min(1, pm * 2.2).toFixed(3));
      shine.setAttribute('transform', `translate(${(-420 + ease.inOut(progress(t, 2300, 800)) * 2400).toFixed(1)} 0) skewX(-18)`);
      glow.setAttribute('opacity', (Math.sin(Math.PI * progress(t, 2200, 1000)) * 0.85).toFixed(3));
      // com a logo parada (depois do brilho), o traçado branco desenha o contorno que separa as camadas
      outline.setAttribute('stroke-dashoffset', (1 - ease.inOut(progress(t, 3100, 800))).toFixed(4));
      if (t >= EXIT) {
        leave();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    const finish = () => {
      cancelAnimationFrame(raf);
      try { sessionStorage.setItem('autonome-intro', '1'); } catch (e) { /* armazenamento bloqueado */ }
      root.classList.remove('js-intro');
      intro.remove();
    };
    const leave = () => {
      if (leaving) return;
      leaving = true;
      intro.classList.add('is-leaving');
      const to = $('.brand img').getBoundingClientRect();
      const from = svg.getBoundingClientRect();
      const fly = svg.animate(
        [{ transform: 'translate(0, 0) scale(1)' }, { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})` }],
        { duration: 1100, easing: 'cubic-bezier(.83, 0, .17, 1)', fill: 'forwards' },
      );
      $('.intro-bg', intro).animate([{ opacity: 1 }, { opacity: 0 }], { duration: 950, delay: 280, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards' });
      setTimeout(ready, 420);
      fly.finished.then(finish, finish);
    };
    // Qualquer gesto adianta a abertura para o estado final
    const skip = () => {
      if (leaving) return;
      start = performance.now() - EXIT;
    };
    $('.intro-skip', intro).addEventListener('click', skip);
    intro.addEventListener('pointerdown', skip);
    addEventListener('keydown', skip, { once: true });
    addEventListener('wheel', skip, { once: true, passive: true });
    raf = requestAnimationFrame(frame);
  } else {
    requestAnimationFrame(() => requestAnimationFrame(ready));
  }

  // ---------- Cabeçalho e menu móvel ----------
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
      $('a', menu).focus({ preventScroll: true });
    } else {
      menu.classList.remove('is-open');
      closeTimer = setTimeout(() => { menu.hidden = true; }, reduced() ? 0 : 400);
    }
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !root.classList.contains('menu-open')) return;
    setMenu(false);
    toggle.focus();
  });
  matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches && root.classList.contains('menu-open')) setMenu(false);
  });

  // ---------- Fundo esfumaçado ----------
  const smoke = $('.smoke');
  const smokeState = { x: 0, y: 0, tx: 0, ty: 0, on: false };
  const smokeTick = () => {
    smokeState.x += (smokeState.tx - smokeState.x) * 0.05;
    smokeState.y += (smokeState.ty - smokeState.y) * 0.05;
    smoke.style.setProperty('--mx', smokeState.x.toFixed(4));
    smoke.style.setProperty('--my', smokeState.y.toFixed(4));
    if (Math.abs(smokeState.tx - smokeState.x) + Math.abs(smokeState.ty - smokeState.y) > 0.002) requestAnimationFrame(smokeTick);
    else smokeState.on = false;
  };
  addEventListener('pointermove', (e) => {
    if (!fine.matches || reduced()) return;
    smokeState.tx = e.clientX / innerWidth - 0.5;
    smokeState.ty = e.clientY / innerHeight - 0.5;
    if (!smokeState.on) {
      smokeState.on = true;
      requestAnimationFrame(smokeTick);
    }
  }, { passive: true });

  // ---------- Missão: palavras acendem conforme a leitura ----------
  const scrub = $('[data-scrub]');
  const words = (() => {
    const text = scrub.textContent.trim();
    scrub.textContent = '';
    return text.split(/\s+/).map((word, i, all) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = word;
      scrub.appendChild(span);
      if (i < all.length - 1) scrub.appendChild(document.createTextNode(' '));
      return span;
    });
  })();
  scrub.setAttribute('aria-label', words.map((w) => w.textContent).join(' '));

  // ---------- O que fazemos: mapa por regiões ----------
  const ZONES = {
    norte: ['Zona Norte', 'Santana · Tucuruvi · Casa Verde · Vila Maria · Freguesia do Ó'],
    oeste: ['Zona Oeste', 'Pinheiros · Lapa · Butantã · Perdizes · Vila Leopoldina'],
    centro: ['Centro', 'Sé · República · Bela Vista · Consolação · Liberdade'],
    leste: ['Zona Leste', 'Tatuapé · Mooca · Penha · Itaquera · São Mateus'],
    sul: ['Zona Sul', 'Santo Amaro · Vila Mariana · Jabaquara · Campo Limpo · Interlagos'],
  };
  const map = $('.map');
  const mapSvg = $('.map-svg', map);
  const hexes = $$('.hex', mapSvg).map((el) => ({ el, zone: el.dataset.zone, x: +el.dataset.x, y: +el.dataset.y }));
  const mapLabels = $$('.map-labels text', mapSvg);
  const zoneBtns = $$('.zone-btn', map);
  const zoneInfo = $('.zone-info', map);
  const centroid = (zone) => {
    const list = hexes.filter((h) => h.zone === zone);
    return [list.reduce((s, h) => s + h.x, 0) / list.length, list.reduce((s, h) => s + h.y, 0) / list.length];
  };
  let currentZone = '';
  const selectZone = (zone, ox, oy) => {
    const first = !currentZone;
    currentZone = zone;
    hexes.forEach((h) => {
      h.el.style.setProperty('--d', Math.round(Math.hypot(h.x - ox, h.y - oy) * 2.2));
      h.el.classList.toggle('is-on', h.zone === zone);
      h.el.classList.remove('is-pop');
    });
    if (!reduced()) {
      void mapSvg.getBoundingClientRect();
      hexes.forEach((h) => { if (h.zone === zone) h.el.classList.add('is-pop'); });
    }
    mapLabels.forEach((t) => t.classList.toggle('is-on', t.dataset.for === zone));
    zoneBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.zone === zone)));
    $('.zone-name', zoneInfo).textContent = ZONES[zone][0];
    $('.zone-list', zoneInfo).textContent = ZONES[zone][1];
    if (!first) {
      zoneInfo.classList.remove('is-swap');
      void zoneInfo.offsetWidth;
      zoneInfo.classList.add('is-swap');
    }
  };
  mapSvg.addEventListener('click', (e) => {
    const el = e.target.closest('.hex');
    if (el) selectZone(el.dataset.zone, +el.dataset.x, +el.dataset.y);
  });
  mapSvg.addEventListener('pointerover', (e) => {
    if (!fine.matches) return;
    const el = e.target.closest('.hex');
    hexes.forEach((h) => h.el.classList.toggle('is-hover', !!el && h.zone === el.dataset.zone && h.zone !== currentZone));
  });
  mapSvg.addEventListener('pointerleave', () => hexes.forEach((h) => h.el.classList.remove('is-hover')));
  zoneBtns.forEach((b) => b.addEventListener('click', () => selectZone(b.dataset.zone, ...centroid(b.dataset.zone))));
  const revealMap = () => {
    const [cx, cy] = centroid('centro');
    hexes.forEach((h) => h.el.style.setProperty('--d', Math.round(Math.hypot(h.x - cx, h.y - cy) * 3)));
    map.classList.add('is-seen');
    setTimeout(() => selectZone('centro', cx, cy), reduced() ? 0 : 900);
  };
  if (reduced() || !('IntersectionObserver' in window)) {
    revealMap();
  } else {
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      revealMap();
    }, { threshold: 0.35 });
    io.observe(mapSvg);
  }

  // ---------- Como fazemos: pinhão (engrenagem da logo) sobre a cremalheira ----------
  const rackWrap = $('.rack-wrap');
  const pinion = $('.pinion', rackWrap);
  const steps = $$('.step');
  const STEP_NAMES = steps.map((s) => $('.step-title', s).textContent);
  const wide = matchMedia('(min-width: 768px)');
  const pin = { x: 0, v: 0, target: 0, size: 76, stops: [0, 0, 0, 0], active: 0, drag: null, on: false };
  const measure = () => {
    pin.size = pinion.offsetWidth;
    const w = rackWrap.clientWidth;
    const left = rackWrap.getBoundingClientRect().left;
    pin.stops = steps.map((s, i) => (wide.matches ? s.getBoundingClientRect().left - left + pin.size / 2 + 16 : pin.size / 2 + (i * (w - pin.size)) / 3));
  };
  const renderPin = () => {
    const pitchRadius = (pin.size * 100) / 230; // raio primitivo da engrenagem pequena da logo
    pinion.style.transform = `translate3d(${(pin.x - pin.size / 2).toFixed(2)}px, 0, 0) rotate(${((pin.x - pin.stops[0]) / pitchRadius).toFixed(4)}rad)`;
    rackWrap.style.setProperty('--fill', clamp(pin.x / rackWrap.clientWidth, 0, 1).toFixed(4));
  };
  const setActive = (i) => {
    if (i === pin.active && steps[i].classList.contains('is-active')) return;
    pin.active = i;
    steps.forEach((s, j) => {
      s.classList.toggle('is-active', j === i);
      if (j === i) s.setAttribute('aria-current', 'step');
      else s.removeAttribute('aria-current');
    });
    pinion.setAttribute('aria-valuenow', String(i + 1));
    pinion.setAttribute('aria-valuetext', `Etapa ${i + 1} de 4: ${STEP_NAMES[i]}`);
  };
  const nearest = (x) => pin.stops.reduce((best, s, i) => (Math.abs(s - x) < Math.abs(pin.stops[best] - x) ? i : best), 0);
  const springLoop = () => {
    if (pin.on) return;
    pin.on = true;
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      if (!pin.drag) {
        const k = 160;
        const c = 2 * Math.sqrt(k) * 0.72;
        pin.v += (k * (pin.target - pin.x) - c * pin.v) * dt;
        pin.x += pin.v * dt;
      }
      renderPin();
      if (pin.drag || Math.abs(pin.v) > 0.4 || Math.abs(pin.target - pin.x) > 0.3) {
        requestAnimationFrame(step);
      } else {
        pin.x = pin.target;
        pin.v = 0;
        renderPin();
        pin.on = false;
      }
    };
    requestAnimationFrame(step);
  };
  const goTo = (i, { focus = false } = {}) => {
    setActive(i);
    pin.target = pin.stops[i];
    if (reduced()) {
      pin.x = pin.target;
      pin.v = 0;
      renderPin();
    } else {
      springLoop();
    }
    if (focus) pinion.focus({ preventScroll: true });
  };
  rackWrap.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const left = rackWrap.getBoundingClientRect().left;
    const onPin = e.target.closest('.pinion');
    pin.drag = { offset: onPin ? e.clientX - left - pin.x : 0, t: performance.now(), left };
    if (!onPin) pin.x = clamp(e.clientX - left, pin.stops[0], pin.stops[3]);
    pin.v = 0;
    rackWrap.setPointerCapture(e.pointerId);
    rackWrap.classList.add('is-dragging');
    springLoop();
  });
  rackWrap.addEventListener('pointermove', (e) => {
    if (!pin.drag) return;
    const now = performance.now();
    const x = clamp(e.clientX - pin.drag.left - pin.drag.offset, pin.stops[0], pin.stops[3]);
    pin.v = (x - pin.x) / Math.max(0.008, (now - pin.drag.t) / 1000);
    pin.drag.t = now;
    pin.x = x;
    setActive(nearest(x));
  });
  const releasePin = () => {
    if (!pin.drag) return;
    pin.drag = null;
    rackWrap.classList.remove('is-dragging');
    goTo(nearest(pin.x + clamp(pin.v, -2400, 2400) * 0.12));
  };
  rackWrap.addEventListener('pointerup', releasePin);
  rackWrap.addEventListener('pointercancel', releasePin);
  steps.forEach((s, i) => s.addEventListener('click', () => goTo(i)));
  pinion.addEventListener('keydown', (e) => {
    const keys = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    let i = pin.active;
    if (e.key in keys) i = clamp(i + keys[e.key], 0, 3);
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = 3;
    else return;
    e.preventDefault();
    goTo(i);
  });
  const placePin = () => {
    measure();
    pin.x = pin.stops[pin.active];
    pin.target = pin.x;
    renderPin();
  };
  placePin();
  addEventListener('resize', placePin);
  if (document.fonts) document.fonts.ready.then(placePin);
  // Na primeira vez, o pinhão ensaia um passo e volta: mostra que dá para arrastar
  if (!reduced() && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      setTimeout(() => {
        if (pin.drag || pin.active !== 0) return;
        pin.target = pin.stops[0] + (pin.stops[1] - pin.stops[0]) * 0.42;
        springLoop();
        setTimeout(() => { if (!pin.drag && pin.active === 0) goTo(0); }, 650);
      }, 350);
    }, { threshold: 0.6 });
    io.observe(rackWrap);
  }

  // ---------- Contato: engrenagens de fundo acompanham a rolagem ----------
  const contact = $('.contact');
  const cgBig = $('.cg-big', contact);
  const cgSmall = $('.cg-small', contact);

  // ---------- Laço de rolagem: lê tudo primeiro, escreve depois ----------
  let lastY = scrollY;
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    const y = scrollY;
    const dy = y - lastY;
    lastY = y;
    const motion = !reduced();
    const heroBottom = gearsSvg.getBoundingClientRect().bottom;
    const scrubRect = scrub.getBoundingClientRect();
    const contactRect = contact.getBoundingClientRect();
    const docMax = root.scrollHeight - vh;

    header.classList.toggle('is-scrolled', y > 24);
    if (motion) smoke.style.setProperty('--sy', (docMax > 0 ? (y / docMax) * 4 : 0).toFixed(4));
    if (motion && isReady && heroBottom > 0 && dy) gears.kick(clamp(dy, -80, 80) * 2.4);

    if (scrubRect.bottom > 0 && scrubRect.top < vh) {
      const p = motion ? clamp((vh * 0.88 - scrubRect.top) / (scrubRect.height + vh * 0.38), 0, 1) : 1;
      const n = words.length;
      words.forEach((w, i) => w.style.setProperty('--o', clamp(p * n * 1.2 - i, 0.22, 1).toFixed(3)));
    }

    if (motion && contactRect.bottom > 0 && contactRect.top < vh) {
      const a = (vh - contactRect.top) * 0.12;
      cgBig.setAttribute('transform', `rotate(${a.toFixed(2)} 683.4 193.6)`);
      cgSmall.setAttribute('transform', `rotate(${((-a * 4) / 3).toFixed(2)} 487.5 275.3)`);
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
})();

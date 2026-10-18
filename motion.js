/* premium-motion — kit de movimento (assets/motion.js)
   API por data-attributes; catálogo em references/motion-patterns.md.
   Expõe window.Motion = { reduced(), split(el) }. */
(() => {
  const root = document.documentElement;
  const reduceMq = matchMedia('(prefers-reduced-motion: reduce)');
  const fineMq = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = () => reduceMq.matches;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  root.classList.add('motion-ready');

  // Divide o texto em palavras, preservando <em>, <strong> etc. Leitores de tela leem o texto normalmente.
  function split(el) {
    if (el.dataset.splitDone) return;
    let w = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) { walk(child); return; }
        if (child.nodeType !== Node.TEXT_NODE) return;
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const outer = document.createElement('span');
          const inner = document.createElement('span');
          outer.className = 'split-word';
          inner.textContent = part;
          inner.style.setProperty('--w', w++);
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        child.replaceWith(frag);
      });
    };
    walk(el);
    el.dataset.splitDone = 'true';
  }
  $$('[data-split]').forEach(split);

  // Stagger: índice automático para filhos diretos com data-reveal
  $$('[data-stagger]').forEach((parent) => {
    $$(':scope > [data-reveal]', parent).forEach((child, i) => child.style.setProperty('--i', i));
  });

  // Reveal: depois da transição o atributo sai, devolvendo ao elemento as próprias transições (hover etc.)
  const settle = (el) => {
    if (!el.hasAttribute('data-reveal')) return;
    el.removeAttribute('data-reveal');
    el.style.removeProperty('--i');
  };
  const show = (el) => {
    el.classList.add('is-inview');
    if (!el.hasAttribute('data-reveal')) return;
    if (reduced()) { settle(el); return; }
    const onEnd = (e) => { if (e.target === el && e.propertyName === 'opacity') { el.removeEventListener('transitionend', onEnd); settle(el); } };
    el.addEventListener('transitionend', onEnd);
    setTimeout(() => settle(el), 2500);
  };
  const revealTargets = $$('[data-reveal], [data-split], [data-inview]');
  if (!('IntersectionObserver' in window) || reduced()) {
    revealTargets.forEach(show);
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach((el) => io.observe(el));
  }
  reduceMq.addEventListener?.('change', () => { if (reduced()) $$('[data-reveal], [data-split], [data-inview]').forEach(show); });

  // Scroll: progresso da página, progresso por elemento (--p) e parallax. Lê tudo primeiro, escreve depois.
  const pageBars = $$('[data-page-progress]');
  const progressEls = $$('[data-progress]');
  const parallaxEls = $$('[data-parallax]');
  const hideEls = $$('[data-hide-on-scroll]');
  let lastY = scrollY;
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    const y = scrollY;
    const max = root.scrollHeight - vh;
    const progressRects = progressEls.map((el) => el.getBoundingClientRect());
    // parallax mede o pai, porque o próprio elemento já está deslocado
    const parallaxRects = parallaxEls.map((el) => el.parentElement.getBoundingClientRect());

    pageBars.forEach((bar) => bar.style.setProperty('--progress', (max > 0 ? y / max : 0).toFixed(4)));
    progressEls.forEach((el, i) => {
      const r = progressRects[i];
      const start = vh * 0.85;
      const end = vh * 0.45;
      const p = clamp((start - r.top) / (r.height + start - end), 0, 1);
      el.style.setProperty('--p', p.toFixed(4));
    });
    if (!reduced()) {
      parallaxEls.forEach((el, i) => {
        const r = parallaxRects[i];
        if (r.bottom < -200 || r.top > vh + 200) return;
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        el.style.translate = `0 ${((r.top + r.height / 2 - vh / 2) * -speed).toFixed(1)}px`;
      });
    }
    hideEls.forEach((el) => {
      const locked = el.matches(':focus-within') || el.querySelector('[aria-expanded="true"]');
      const down = y > lastY + 4;
      const up = y < lastY - 4;
      if (locked || y < 120 || up) el.classList.remove('is-hidden');
      else if (down) el.classList.add('is-hidden');
    });
    lastY = y;
  };
  const requestUpdate = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate);
  update();

  // Efeitos de cursor: só com mouse/trackpad e sem movimento reduzido
  const pointerOk = () => fineMq.matches && !reduced();

  $$('[data-spotlight]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      if (!pointerOk()) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
      el.classList.add('is-lit');
    });
    el.addEventListener('pointerleave', () => el.classList.remove('is-lit'));
  });

  $$('[data-tilt]').forEach((el) => {
    const maxDeg = parseFloat(el.dataset.tilt) || 6;
    el.addEventListener('pointermove', (e) => {
      if (!pointerOk()) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.classList.add('is-tilting');
      el.style.setProperty('--ry', `${(x * maxDeg * 2).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(-y * maxDeg * 2).toFixed(2)}deg`);
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('is-tilting');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });

  $$('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.3;
    el.addEventListener('pointermove', (e) => {
      if (!pointerOk()) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mgx', `${((e.clientX - r.left - r.width / 2) * strength).toFixed(1)}px`);
      el.style.setProperty('--mgy', `${((e.clientY - r.top - r.height / 2) * strength).toFixed(1)}px`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--mgx', '0px');
      el.style.setProperty('--mgy', '0px');
    });
  });

  // Marquee: duplica o conteúdo para o loop e liga o botão de pausa (WCAG 2.2.2)
  $$('[data-marquee]').forEach((el) => {
    const track = el.querySelector('.marquee-track');
    if (!track || track.dataset.cloned) return;
    [...track.children].forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
    track.dataset.cloned = 'true';
  });
  $$('[data-marquee-toggle]').forEach((btn) => {
    const target = document.getElementById(btn.getAttribute('aria-controls'));
    if (!target) return;
    const labels = { pause: btn.dataset.labelPause || 'Pausar animação', play: btn.dataset.labelPlay || 'Retomar animação' };
    const set = (paused) => {
      target.classList.toggle('is-paused', paused);
      btn.setAttribute('aria-pressed', String(paused));
      btn.setAttribute('aria-label', paused ? labels.play : labels.pause);
    };
    set(reduced());
    btn.addEventListener('click', () => set(!target.classList.contains('is-paused')));
  });

  // Scrollspy: marca o link da seção visível com aria-current
  $$('[data-scrollspy]').forEach((nav) => {
    const links = $$('a[href^="#"]', nav).filter((a) => a.getAttribute('href').length > 1);
    const map = new Map();
    links.forEach((a) => {
      const section = document.querySelector(a.getAttribute('href'));
      if (section) map.set(section, a);
    });
    if (!('IntersectionObserver' in window) || !map.size) return;
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.removeAttribute('aria-current'));
        map.get(entry.target)?.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, section) => spy.observe(section));
  });

  window.Motion = { reduced, split };
})();

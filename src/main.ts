interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  speed: number;
  hue: number;
}

// ─── 1. LOADING SCREEN ───
(function () {
  const screen = document.getElementById('loadingScreen');
  if (!screen) return;
  if (sessionStorage.getItem('visited')) {
    screen.remove();
    return;
  }
  sessionStorage.setItem('visited', '1');

  setTimeout(() => {
    screen.classList.add('hidden');
    setTimeout(() => {
      screen.remove();
    }, 600);
  }, 2000);
})();

// ─── Toast helper ───
function showToast(msg: string, duration: number = 3000): void {
  const el = document.getElementById('toastNotif') as HTMLElement | null;
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout((el as HTMLElement & { _hide?: number })._hide);
  (el as HTMLElement & { _hide?: number })._hide = window.setTimeout(() => el.classList.remove('show'), duration);
}

// ─── 2. STARFIELD (Canvas) ───
(function () {
  const canvas = document.getElementById('starfield') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const stars: Star[] = [];
  let w = 0, h = 0;

  function resize(): void {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const STAR_COUNT = 400;
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random(),
      speed: 0.005 + Math.random() * 0.015,
      hue: 220 + Math.random() * 40,
    });
  }

  function draw(): void {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.alpha += (Math.random() - 0.5) * s.speed;
      s.alpha = Math.max(0.2, Math.min(1, s.alpha));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 60%, 80%, ${s.alpha})`;
      ctx.fill();
    }
    for (const s of stars) {
      s.x += (Math.random() - 0.5) * 0.3;
      s.y += (Math.random() - 0.5) * 0.3;
      if (s.x < 0) s.x = w;
      if (s.x > w) s.x = 0;
      if (s.y < 0) s.y = h;
      if (s.y > h) s.y = 0;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ─── 1b. ENHANCED STARFIELD with mouse parallax ───
let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', (e: MouseEvent) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});
(function () {
  const canvas = document.getElementById('starfield') as HTMLCanvasElement;
  const origDraw = canvas.getContext('2d')!;
  const origStars = (window._stars || []) as unknown[];
  const origRAF = window._starRAF;
  if (origRAF) cancelAnimationFrame(origRAF);
})();

// ─── 3. LENIS SMOOTH SCROLL ───
let lenis: LenisInstance | null = null;
if (window.Lenis) {
  lenis = new window.Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    preventBodyScroll: false,
  });
  function raf(time: number): void {
    lenis!.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// ─── 4. CUSTOM CURSOR (Spring physics) ───
(function () {
  const dot = document.createElement('div');
  dot.id = 'cursor-dot';
  const ring = document.createElement('div');
  ring.id = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let x = 0, y = 0;
  let rx = 0, ry = 0;
  const spring = 0.12;

  document.addEventListener('mousemove', (e: MouseEvent) => {
    x = e.clientX;
    y = e.clientY;
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
  });

  function animateRing(): void {
    rx += (x - rx) * spring;
    ry += (y - ry) * spring;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .flip-card, .orbit-btn, .rewind-btn, [role="button"]').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });

  document.addEventListener('mousedown', () => ring.classList.add('click'));
  document.addEventListener('mouseup', () => ring.classList.remove('click'));

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

// ─── 5. MAGNETIC BUTTONS ───
(function () {
  document.querySelectorAll('.orbit-btn, .rewind-btn, .magnetic').forEach(btn => {
    const el = btn as HTMLElement;
    el.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - rect.left - rect.width / 2;
      const dy = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${dx * 0.2}px, ${dy * 0.2}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
})();

// ─── 6. TEXT SCRAMBLE EFFECT ───
(function () {
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  const elements = document.querySelectorAll('[data-scramble]');

  elements.forEach(el => {
    const original = el.textContent || '';
    let frame = 0;
    let interval: number | null = null;
    let isScrambling = false;

    const startScramble = () => {
      if (isScrambling) return;
      isScrambling = true;
      frame = 0;
      clearInterval(interval!);
      interval = window.setInterval(() => {
        let output = '';
        const progress = frame / 25;
        for (let i = 0; i < original.length; i++) {
          if (original[i] === ' ') { output += ' '; continue; }
          if (progress > i / original.length) {
            output += original[i];
          } else {
            output += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        el.textContent = output;
        frame++;
        if (frame > 28) {
          clearInterval(interval!);
          el.textContent = original;
          isScrambling = false;
        }
      }, 40);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startScramble();
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(el);
  });
})();

// ─── 7. HORIZONTAL TIMELINE (scroll-sync + drag) ───
(function () {
  const track = document.getElementById('timelineTrack') as HTMLElement;
  const progressBar = document.getElementById('timelineProgressBar') as HTMLElement | null;
  const section = document.getElementById('bitacora') as HTMLElement;
  if (!track || !section) return;

  let maxTranslate = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragTranslate = 0;
  let currentTranslate = 0;

  function calcMaxTranslate(): void {
    maxTranslate = track!.scrollWidth - section!.offsetWidth;
    if (maxTranslate < 0) maxTranslate = 0;
  }

  function clamp(v: number): number {
    return Math.max(-maxTranslate, Math.min(0, v));
  }

  function updateProgress(): void {
    const p = maxTranslate > 0 ? Math.abs(currentTranslate) / maxTranslate : 0;
    if (progressBar) progressBar.style.width = `${p * 100}%`;
  }

  function render(): void {
    track!.style.transform = `translateX(${currentTranslate}px)`;
    updateProgress();
  }

  function updateFromScroll(): void {
    if (isDragging) return;
    calcMaxTranslate();
    const scrollY = lenis ? (lenis.actualScroll || lenis.targetScroll || 0) as number : window.scrollY;
    const sectionAbsTop = section!.offsetTop;
    const windowH = window.innerHeight;
    const scrollStart = sectionAbsTop - windowH;
    const scrollEnd = sectionAbsTop + section!.offsetHeight;
    const scrollRange = scrollEnd - scrollStart;

    let progress = scrollRange > 0 ? (scrollY - scrollStart) / scrollRange : 0;
    progress = Math.max(0, Math.min(1, progress));

    currentTranslate = -progress * maxTranslate;
    render();
  }

  calcMaxTranslate();

  if (lenis) {
    lenis.on('scroll', updateFromScroll);
  } else {
    window.addEventListener('scroll', updateFromScroll, { passive: true });
  }

  track!.addEventListener('touchstart', (e: TouchEvent) => {
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragTranslate = currentTranslate;
    track!.style.transition = 'none';
  }, { passive: true });

  track!.addEventListener('touchmove', (e: TouchEvent) => {
    if (!isDragging) return;
    currentTranslate = clamp(dragTranslate + (e.touches[0].clientX - dragStartX));
    render();
  }, { passive: true });

  track!.addEventListener('touchend', () => {
    isDragging = false;
    track!.style.transition = '';
  }, { passive: true });

  track!.addEventListener('mousedown', (e: MouseEvent) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragTranslate = currentTranslate;
    track!.style.transition = 'none';
    track!.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e: MouseEvent) => {
    if (!isDragging) return;
    currentTranslate = clamp(dragTranslate + (e.clientX - dragStartX));
    render();
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    track!.style.transition = '';
    track!.style.cursor = '';
  });

  window.addEventListener('resize', () => { calcMaxTranslate(); currentTranslate = clamp(currentTranslate); render(); });
  setTimeout(updateFromScroll, 150);
})();

// ─── 8. BACKGROUND AUDIO ───
(function () {
  const audio = document.getElementById('bgAudio') as HTMLAudioElement;
  const toggle = document.getElementById('audioToggle') as HTMLElement;
  const tooltip = document.getElementById('audioTooltip') as HTMLElement | null;
  if (!audio || !toggle) return;

  audio.volume = 0.15;
  let started = false;

  function showTooltip(duration?: number): void {
    if (!tooltip) return;
    tooltip.classList.add('visible');
    clearTimeout((tooltip as HTMLElement & { _hide?: number })._hide);
    if (duration) (tooltip as HTMLElement & { _hide?: number })._hide = window.setTimeout(() => tooltip.classList.remove('visible'), duration);
  }

  function tryPlay(): void {
    if (started) return;
    started = true;
    const p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(() => {
        showToast('♪ 寵愛「Duvet」— bôa. Volviendo a la vida ♪', 4000);
        showTooltip(3000);
      }).catch(() => {
        started = false;
        document.addEventListener('pointerdown', tryPlay, { once: true });
        document.addEventListener('touchstart', tryPlay, { once: true });
      });
    }
  }

  setTimeout(tryPlay, 2600);

  toggle.addEventListener('mouseenter', () => {
    if (tooltip) tooltip.classList.add('visible');
  });
  toggle.addEventListener('mouseleave', () => {
    if (tooltip) tooltip.classList.remove('visible');
  });

  toggle.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    if (audio.paused) {
      audio.play().catch(() => { });
      toggle.classList.remove('muted');
      showToast('♪ 寵愛「Duvet」— bôa. Volviendo a la vida ♪');
    } else {
      audio.pause();
      toggle.classList.add('muted');
      showToast('🔇 沈黙... Música silenciada, como el vacío del espacio');
    }
    if (tooltip) tooltip.classList.add('visible');
  });

  document.addEventListener('click', (e: MouseEvent) => {
    if (tooltip && !toggle.contains(e.target as Node)) {
      tooltip.classList.remove('visible');
    }
  });
})();

// ─── 9. RANDOM PHRASES ───
(function () {
  const el = document.getElementById('phraseFloat') as HTMLElement;
  if (!el) return;

  const phrases: string[] = [
    "Pasen el name de la canción: bôa — Duvet",
    "Rob controla mi mente",
    "Proyección astral en 3... 2... 1...",
    "Missandei: Dracarys",
    "Guts y Casca tenían razón",
    "Louise abrió la puerta correcta",
    "Perdón... ¿por qué era?...",
    "La Sirena nos unió",
    "Kaneki y Touka: el amor verdadero",
    "Griffith hizo todo mal",
    "Esa cerveza no era la culpable",
    "Eve Hewson lo entendería",
    "Corriendo como Louise y Rob",
    "bôa — Duvet en loop infinito",
  ];

  let idx = 0;

  function showNext(): void {
    el.textContent = phrases[idx % phrases.length];
    el.classList.add('visible');
    idx++;
    const delay = 4000 + Math.random() * 4000;
    setTimeout(() => {
      el.classList.remove('visible');
      setTimeout(showNext, 1200);
    }, delay);
  }

  setTimeout(showNext, 3000);
})();

// ─── 10. INTERSECTION OBSERVER (Scroll reveals) ───
(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target as HTMLElement;
        const delay = el.dataset.delay;
        setTimeout(() => el.classList.add('visible'), delay ? parseInt(delay) : 0);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    observer.observe(el);
  });
})();

// ─── 11. FLIP CARDS ───
(function () {
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
})();

// ─── 12. TYPEWRITER ───
(function () {
  const text = [
    'Me desesperé y me quise desquitar con la única amig@ que tengo (y tuve, cómo me duele escribir esto). No fue lo adecuado. Mal pensé las cosas.',
    '',
    'Y aunque sí me molestan algunas cosas tuyas —como a ti de mí— no estuvo bien decirlo de esas formas. Insultarte. Decirte mentirosa, hipócrita, cortante. Llamarme idiota, imbécil y perro no me hace mejor persona.',
    '',
    'Sé que lo del día de las botellas y la cerveza no es excusa, pero el estrés me está afectando más de lo que quiero admitir. Y entenderé tu decisión de alejarte de mí. Te extrañaré. Mucho, de hecho.',
    '',
    'Pero me disculpo de corazón por mi acto de aquella noche. Por lo cretino que soy a veces. Por esa vez que te dije en broma que era "tu culpa que se jodiera el motor" —broma de mal gusto— y por ser tan insoportable todo el rato.',
    '',
    'En serio: perdón, perdón, perdón.',
    '',
    'Solo te deseo éxitos a ti, mi amiga.',
    '',
    'Perdóname.',
  ].join('\n');

  const target = document.getElementById('typewriter') as HTMLElement | null;
  const cursor = document.getElementById('typewriterCursor') as HTMLElement | null;
  const letterEnd = document.getElementById('letter-end') as HTMLElement | null;
  const rewindBtn = document.getElementById('rewindBtn') as HTMLElement | null;
  const toast = document.getElementById('toastNotif') as HTMLElement | null;
  let index = 0;
  let isWriting = false;
  let isRewinding = false;
  let hasStarted = false;
  let timeoutId: number | null = null;
  let rewindCount = 0;

  const rewindMessages: string[] = [
    "¿Por qué tan indecisa? ¿Descubriste un nuevo juguete?",
    "Otra vez? Eres como Homero con el control remoto",
    "La definición de locura es rebobinar 20 veces seguidas",
    "Ya leíste la carta o solo te gusta ver cómo se borra?",
    "Te mamaste, Marianne... es la misma carta de siempre",
  ];

  function localShowToast(msg: string): void {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function writeChar(): void {
    if (!target || !cursor) return;
    if (index >= text.length) {
      cursor.classList.add('done');
      if (letterEnd) letterEnd.style.display = 'block';
      isWriting = false;
      resetBtnText();
      return;
    }
    const ch = text[index];
    target.textContent += ch;
    index++;
    const delay = (ch === '\n') ? 200 : (Math.random() * 30 + 20);
    timeoutId = window.setTimeout(writeChar, delay);
  }

  function resetBtnText(): void {
    if (!rewindBtn) return;
    rewindBtn.classList.remove('rewinding');
    const icon = rewindBtn.querySelector('.rv-icon') as HTMLElement | null;
    const spinner = rewindBtn.querySelector('.rv-spinner');
    if (icon) icon.style.display = '';
    if (spinner) spinner.remove();
  }

  function rewindChar(): void {
    if (!target || !cursor) return;
    const content = target.textContent;
    if (!content || content.length === 0) {
      isRewinding = false;
      resetBtnText();
      index = 0;
      isWriting = true;
      setTimeout(writeChar, 500);
      return;
    }
    target.textContent = content.slice(0, -1);
    if (index > 0) index--;
    timeoutId = window.setTimeout(rewindChar, Math.random() * 20 + 10);
  }

  function startRewind(): void {
    if (!target || !cursor || !letterEnd || !rewindBtn) return;
    clearTimeout(timeoutId!);
    isWriting = false;
    isRewinding = true;
    cursor.classList.remove('done');
    letterEnd.style.display = 'none';
    rewindBtn.classList.add('rewinding');
    const icon = rewindBtn.querySelector('.rv-icon') as SVGElement | null;
    if (icon) {
      icon.style.display = 'none';
      const spinner = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      spinner.setAttribute('class', 'rv-spinner');
      spinner.setAttribute('viewBox', '0 0 24 24');
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '12');
      circle.setAttribute('cy', '12');
      circle.setAttribute('r', '8');
      circle.setAttribute('stroke-dasharray', '45');
      circle.setAttribute('stroke-linecap', 'round');
      spinner.appendChild(circle);
      icon.parentNode!.insertBefore(spinner, icon.nextSibling);
    }
    rewindChar();
  }

  function fastForward(): void {
    if (!target || !cursor || !letterEnd || !rewindBtn) return;
    clearTimeout(timeoutId!);
    isWriting = true;
    isRewinding = false;
    target.textContent = '';
    index = 0;
    cursor.classList.remove('done');
    letterEnd.style.display = 'none';
    localShowToast('⟳ Carta completada al instante. ¿Tan apurada estás?');

    const total = text.length;
    function turboWrite(): void {
      if (!target || !cursor || !letterEnd) return;
      if (index >= total) {
        cursor.classList.add('done');
        letterEnd.style.display = 'block';
        isWriting = false;
        resetBtnText();
        return;
      }
      target.textContent += text[index];
      index++;
      timeoutId = window.setTimeout(turboWrite, text[index - 1] === '\n' ? 5 : 1);
    }
    turboWrite();
  }

  function snapEffect(): void {
    if (!target || !cursor || !letterEnd || !rewindBtn) return;
    clearTimeout(timeoutId!);
    isWriting = false;
    isRewinding = false;
    resetBtnText();
    const letterEl = target.closest('.letter') as HTMLElement | null;
    if (letterEl) letterEl.classList.add('snapped');
    target.classList.add('snapped');
    if (cursor) cursor.style.display = 'none';
    if (letterEnd) letterEnd.style.display = 'none';
    if (rewindBtn) {
      rewindBtn.style.opacity = '0.3';
      (rewindBtn as HTMLElement).style.pointerEvents = 'none';
    }
    localShowToast('💀 Has destruido el espacio-tiempo. Thanos estaría orgulloso.');
    setTimeout(() => {
      if (!target || !cursor || !letterEnd || !rewindBtn) return;
      target.classList.remove('snapped');
      if (letterEl) letterEl.classList.remove('snapped');
      target.textContent = '';
      target.style.animation = 'none';
      index = 0;
      if (cursor) cursor.style.display = '';
      if (letterEl) {
        letterEl.style.borderColor = 'rgba(244,114,182,0.15)';
        letterEl.style.animation = 'none';
      }
      if (rewindBtn) {
        rewindBtn.style.opacity = '1';
        (rewindBtn as HTMLElement).style.pointerEvents = '';
      }
      rewindCount = 0;
      localShowToast('🌌 El universo se ha restaurado. No vuelvas a hacerlo...');
      isWriting = true;
      setTimeout(writeChar, 800);
    }, 4000);
  }

  if (rewindBtn) {
    let clickTimer: number | null = null;

    rewindBtn.addEventListener('click', () => {
      if (isRewinding) return;

      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
        if (!hasStarted) {
          hasStarted = true;
          fastForward();
        } else if (target && target.textContent && target.textContent.length < text.length) {
          fastForward();
        }
        return;
      }

      clickTimer = window.setTimeout(() => {
        clickTimer = null;
        if (target && target.textContent && target.textContent.length > 0) {
          rewindCount++;
          if (rewindCount === 7) {
            snapEffect();
            return;
          }
          if (rewindCount > 1) {
            localShowToast(rewindMessages[(rewindCount - 2) % rewindMessages.length]);
          }
          startRewind();
        } else if (!hasStarted) {
          hasStarted = true;
          isWriting = true;
          setTimeout(writeChar, 500);
        }
      }, 280);
    });
  }

  const cartaObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!target || !cursor || !letterEnd) return;
      if (entry.isIntersecting && !hasStarted) {
        hasStarted = true;
        isWriting = true;
        setTimeout(writeChar, 800);
      }
      if (!entry.isIntersecting && isWriting) {
        clearTimeout(timeoutId!);
        isWriting = false;
      }
    });
  }, { threshold: 0.3 });
  cartaObserver.observe(document.getElementById('carta')!);
})();

// ─── 13. ORBIT ALIGNMENT ───
(function () {
  const btn = document.getElementById('alignBtn') as HTMLElement | null;
  const diego = document.getElementById('orbitDiego') as HTMLElement | null;
  const marian = document.getElementById('orbitMarian') as HTMLElement | null;
  const msg = document.getElementById('reconcileMessage') as HTMLElement | null;
  let aligned = false;

  if (!btn || !diego || !marian) return;

  btn.addEventListener('click', () => {
    if (aligned) return;

    diego.style.animationPlayState = 'paused';
    marian.style.animationPlayState = 'paused';
    diego.classList.add('aligned');
    marian.classList.add('aligned');

    diego.style.transition = 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    marian.style.transition = 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    diego.style.transform = 'translate(-50%, -50%)';
    diego.style.top = '50%';
    diego.style.left = '50%';
    diego.style.animation = 'none';
    marian.style.transform = 'translate(-50%, -50%)';
    marian.style.top = '50%';
    marian.style.left = '50%';
    marian.style.animation = 'none';

    btn.textContent = '💫 Astros alineados 💫';
    btn.style.opacity = '0.5';
    btn.style.cursor = 'default';

    setTimeout(() => {
      if (msg) msg.style.display = 'block';
      document.querySelectorAll('.constellation line').forEach((line, i) => {
        setTimeout(() => line.classList.add('drawn'), i * 200);
      });
      document.querySelectorAll('.constellation circle').forEach((circle, i) => {
        setTimeout(() => circle.classList.add('drawn'), 400 + i * 200);
      });
    }, 1600);

    aligned = true;
    showToast('✦ Misión Completa ✦ Los astros se han alineado. El cosmos está en paz.');
  });
})();

// ─── 14. HERO PARALLAX ───
if (lenis) {
  lenis.on('scroll', (e: unknown) => {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const scrolled = (e as { animatedScroll?: number; scroll?: number }).animatedScroll || (e as { scroll?: number }).scroll || 0;
    const heroContent = hero.querySelector('.inner') as HTMLElement | null;
    if (heroContent && scrolled < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
      heroContent.style.opacity = String(1 - (scrolled / (window.innerHeight * 0.8)));
    }
  });
} else {
  window.addEventListener('scroll', () => {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const scrolled = window.scrollY;
    const heroContent = hero.querySelector('.inner') as HTMLElement | null;
    if (heroContent && scrolled < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
      heroContent.style.opacity = String(1 - (scrolled / (window.innerHeight * 0.8)));
    }
  });
}

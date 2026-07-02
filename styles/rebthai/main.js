/* ================================================================
   REB-THAI — main.js
   Particles · Cursor · Reveal · Nav · Booking (EmailJS)
   ================================================================ */

'use strict';

// ── Preloader ────────────────────────────────────────────────────
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (!pre) return;
  setTimeout(() => {
    pre.classList.add('done');
    // Animate hero elements after preloader fades
    setTimeout(() => {
      document.querySelectorAll('.reveal-hero').forEach(el => el.classList.add('visible'));
    }, 200);
  }, 1400);
});


// ── Hero Frame Animation ─────────────────────────────────────────
(function initHeroFrames() {
  const canvas = document.getElementById('hero-frame-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const TOTAL = 162;
  const frames = [];
  let currentFrame = 0;

  const heroSection = document.querySelector('.hero');
  let heroLastW = window.innerWidth;

  function resize() {
    canvas.width  = canvas.clientWidth  || window.innerWidth;
    canvas.height = canvas.clientHeight || window.innerHeight;
    renderFrame(currentFrame);
  }
  resize();

  function drawCover(img) {
    const cw = canvas.width, ch = canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  function renderFrame(idx) {
    const img = frames[idx];
    if (img && img.complete && img.naturalWidth) drawCover(img);
  }

  for (let i = 0; i < TOTAL; i++) {
    const img = new Image();
    const n = String(i + 1).padStart(3, '0');
    img.onload = () => { if (i === 0) renderFrame(0); };
    img.src = `styles/rebthai/img/frames/ezgif-frame-${n}.png`;
    frames.push(img);
  }

  const darkOverlay   = document.getElementById('heroDarkOverlay');
  const heroMainTitle = document.querySelector('.hero-main-title');

  let heroScrollHeight = 0;
  function updateHeroHeight() {
    const c = document.getElementById('heroScrollContainer');
    const vh = heroSection ? heroSection.offsetHeight : window.innerHeight;
    heroScrollHeight = c ? c.offsetHeight - vh : 0;
  }
  updateHeroHeight();

  // Only re-measure the canvas on width changes (orientation). This keeps the
  // mobile address bar showing/hiding from resizing the canvas mid-scroll,
  // which otherwise makes the frame animation flicker and jump.
  window.addEventListener('resize', () => {
    if (window.innerWidth !== heroLastW) {
      heroLastW = window.innerWidth;
      resize();
    }
    updateHeroHeight();
  }, { passive: true });

  window.addEventListener('scroll', () => {
    if (heroScrollHeight <= 0) return;
    const progress = Math.max(0, Math.min(1, window.scrollY / heroScrollHeight));
    const idx = Math.round(progress * (TOTAL - 1));
    if (idx !== currentFrame) {
      currentFrame = idx;
      requestAnimationFrame(() => renderFrame(idx));
    }
    // Fade dark overlay from full (0) to gone (35% scroll)
    if (darkOverlay) {
      darkOverlay.style.opacity = Math.max(0, 1 - progress / 0.35).toFixed(3);
    }
    // Fade title out over first 18% of scroll
    if (heroMainTitle) {
      heroMainTitle.style.opacity = Math.max(0, 1 - progress / 0.18).toFixed(3);
    }
  }, { passive: true });
})();


// ── Takeaway Frame Animation ─────────────────────────────────────
(function initTakeawayFrames() {
  const canvas = document.getElementById('takeaway-frame-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const TOTAL = 122;
  const frames = [];
  let currentFrame = 0;

  const taSection = document.querySelector('.takeaway-sticky');
  let taLastW = window.innerWidth;

  function resize() {
    canvas.width  = canvas.clientWidth  || window.innerWidth;
    canvas.height = canvas.clientHeight || window.innerHeight;
    renderFrame(currentFrame);
  }
  resize();

  function drawCover(img) {
    const cw = canvas.width, ch = canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  function renderFrame(idx) {
    let img = frames[idx];
    if (!img || !img.complete || !img.naturalWidth) {
      // Fallback: nearest already-loaded frame
      for (let i = idx - 1; i >= 0; i--) {
        if (frames[i] && frames[i].complete && frames[i].naturalWidth) {
          img = frames[i];
          break;
        }
      }
    }
    if (img && img.naturalWidth) drawCover(img);
  }

  for (let i = 0; i < TOTAL; i++) {
    const img = new Image();
    const n = String(i + 1).padStart(3, '0');
    img.onload = () => { if (i === 0) renderFrame(0); };
    img.src = `styles/rebthai/img/frames-takeaway/ezgif-frame-${n}.png`;
    frames.push(img);
  }

  let taTop = 0, taRange = 0;
  function updateLayout() {
    const c = document.getElementById('takeawayScrollContainer');
    if (!c) return;
    taTop   = c.offsetTop;
    const vh = taSection ? taSection.offsetHeight : window.innerHeight;
    taRange = c.offsetHeight - vh;
  }
  updateLayout();

  // Ignore height-only resizes from the mobile browser chrome (see hero above).
  window.addEventListener('resize', () => {
    if (window.innerWidth !== taLastW) {
      taLastW = window.innerWidth;
      resize();
    }
    updateLayout();
  }, { passive: true });

  window.addEventListener('scroll', () => {
    if (taRange <= 0) return;
    const progress = Math.max(0, Math.min(1, (window.scrollY - taTop) / taRange));
    const idx = Math.round(progress * (TOTAL - 1));
    if (idx === currentFrame) return;
    currentFrame = idx;
    requestAnimationFrame(() => renderFrame(idx));
  }, { passive: true });
})();


// ── Canvas Particle System ───────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const isMobile = window.innerWidth < 768;
  const COUNT = isMobile ? 28 : 70;

  class Particle {
    constructor(randomY) {
      this.randomY = randomY;
      this.reset();
      if (randomY) this.y = Math.random() * canvas.height;
    }
    reset() {
      this.x       = Math.random() * canvas.width;
      this.y       = canvas.height + Math.random() * 60;
      this.size    = Math.random() * 1.6 + 0.3;
      this.speedX  = (Math.random() - 0.5) * 0.35;
      this.speedY  = -(Math.random() * 0.7 + 0.25);
      this.opacity = Math.random() * 0.55 + 0.1;
      this.life    = 0;
      this.maxLife = Math.random() * 180 + 80;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      if (this.y < -20 || this.life > this.maxLife) this.reset();
      const ratio = this.life / this.maxLife;
      this.currentOpacity = this.opacity * Math.sin(ratio * Math.PI);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${this.currentOpacity.toFixed(3)})`;
      ctx.fill();
    }
  }

  const particles = Array.from({ length: COUNT }, (_, i) => new Particle(i < COUNT));

  let raf;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(animate);
  }
  animate();

  // Pause when hero is off-screen (performance)
  const hero = document.getElementById('home');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) { cancelAnimationFrame(raf); }
        else { animate(); }
      });
    }).observe(hero);
  }
})();


// ── Custom Cursor ────────────────────────────────────────────────
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  if (window.matchMedia('(hover: none)').matches) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.11;
    ringY += (mouseY - ringY) * 0.11;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const interactives = 'a, button, .service-card, .menu-card, .atmo-item, .contact-card';
  document.querySelectorAll(interactives).forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width       = '52px';
      ring.style.height      = '52px';
      ring.style.borderColor = 'rgba(234,192,152,0.75)';
      dot.style.opacity      = '0.5';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width       = '34px';
      ring.style.height      = '34px';
      ring.style.borderColor = 'rgba(234,192,152,0.6)';
      dot.style.opacity      = '1';
    });
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();


// ── Header Scroll Effect ─────────────────────────────────────────
(function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  let lastScroll = window.scrollY;
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 30);
    if (y > lastScroll && y > 120) {
      header.classList.add('header-hidden');
    } else if (y < lastScroll) {
      header.classList.remove('header-hidden');
    }
    lastScroll = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// ── Floating CTA ─────────────────────────────────────────────────
(function initFloatCta() {
  const btn = document.getElementById('floatCta');
  if (!btn) return;
  const container = document.getElementById('heroScrollContainer');
  let threshold = 450;
  function updateThreshold() {
    threshold = container ? container.offsetHeight : 450;
  }
  updateThreshold();
  window.addEventListener('resize', updateThreshold, { passive: true });
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > threshold);
  }, { passive: true });
})();


// ── Mobile Navigation ────────────────────────────────────────────
(function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const overlay   = document.getElementById('mobileOverlay');
  const closeBtn  = document.getElementById('mobileClose');
  if (!hamburger || !mobileNav) return;

  function openMenu() {
    mobileNav.classList.add('active');
    overlay.classList.add('active');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }
  function closeMenu() {
    mobileNav.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  hamburger.addEventListener('click', () => {
    mobileNav.classList.contains('active') ? closeMenu() : openMenu();
  });
  if (closeBtn)  closeBtn.addEventListener('click', closeMenu);
  if (overlay)   overlay.addEventListener('click', closeMenu);

  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });
})();


// ── Smooth Scroll ────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const id = this.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = document.getElementById('header')?.offsetHeight || 80;
    window.scrollTo({ top: target.offsetTop - offset + 1, behavior: 'smooth' });
  });
});


// ── Scroll Reveal ────────────────────────────────────────────────
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    obs.observe(el);
  });
})();


// ── Hero Parallax ────────────────────────────────────────────────
(function initParallax() {
  const bg = document.getElementById('heroBg');
  if (!bg) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    bg.style.transform = `scale(1.12) translateY(${y * 0.22}px)`;
  }, { passive: true });
})();


// ── Stats Counter ────────────────────────────────────────────────
(function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const isFloat = !Number.isInteger(target);
      let current = 0;
      const duration = 1600;
      const steps    = 60;
      const inc      = target / steps;
      const interval = duration / steps;

      const timer = setInterval(() => {
        current = Math.min(current + inc, target);
        el.textContent = (isFloat ? current.toFixed(1) : Math.ceil(current)) + suffix;
        if (current >= target) {
          el.textContent = (isFloat ? target.toFixed(1) : target) + suffix;
          clearInterval(timer);
        }
      }, interval);

      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num[data-target], .stat-num-val[data-target]').forEach(el => obs.observe(el));
})();


// ── Atmosphäre Accordion ─────────────────────────────────────────
(function initAtmoAccordion() {
  const accordion = document.getElementById('atmoAccordion');
  if (!accordion) return;
  const panels = accordion.querySelectorAll('[data-panel]');

  function activatePanel(index) {
    panels.forEach((p, i) => p.classList.toggle('is-active', i === index));
  }

  panels.forEach(panel => {
    panel.addEventListener('click', e => {
      // Don't collapse when clicking a link inside the active panel
      if (e.target.closest('a')) return;
      if (panel.classList.contains('is-active')) return;
      panels.forEach(p => p.classList.remove('is-active'));
      panel.classList.add('is-active');
    });
  });

  // Service tiles → open matching atmosphere panel & scroll to it
  document.querySelectorAll('.service-tile[data-atmo-target]').forEach(tile => {
    tile.addEventListener('click', () => {
      const index = parseInt(tile.dataset.atmoTarget, 10);
      activatePanel(index);
      const section = document.getElementById('atmosphere');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


// ── Booking Form ─────────────────────────────────────────────────
window.addEventListener('load', function () {
  emailjs.init('XhDQ4t09-1GA4YZiO');

  const form = document.getElementById('booking-form');
  if (!form) return;

  // Ensure hidden date_formatted field exists
  let formattedInput = form.querySelector('input[name="date_formatted"]');
  if (!formattedInput) {
    formattedInput = document.createElement('input');
    formattedInput.type  = 'hidden';
    formattedInput.name  = 'date_formatted';
    form.appendChild(formattedInput);
  }

  // ── Popup helper ──────────────────────────────────────────────
  function createPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'rt-popup-overlay';
    overlay.innerHTML = `
      <div class="rt-popup-box">
        <div class="rt-popup-icon" id="popupIcon"></div>
        <h3 id="popupTitle"></h3>
        <div id="popupBody"></div>
        <button class="rt-popup-close" id="popupCloseBtn">Schliessen</button>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#popupCloseBtn').addEventListener('click', () => {
      overlay.classList.remove('show');
    });
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('show');
    });
    return overlay;
  }

  const popupEl = createPopup();

  function showPopup(icon, title, bodyHtml) {
    popupEl.querySelector('#popupIcon').textContent  = icon;
    popupEl.querySelector('#popupTitle').textContent = title;
    popupEl.querySelector('#popupBody').innerHTML    = bodyHtml;
    popupEl.classList.add('show');
    setTimeout(() => popupEl.classList.remove('show'), 12000);
  }

  // ── Date helpers ──────────────────────────────────────────────
  function formatDate(ds) {
    if (!ds || ds.length !== 10) return ds;
    const [y, m, d] = ds.split('-');
    return `${d}.${m}.${y}`;
  }

  function isAuffahrtClosed(ds) {
    const [y, m, d] = ds.split('-').map(Number);
    return y === 2026 && m === 5 && d === 14;
  }

  function getAuffahrtHours(ds) {
    const [y, m, d] = ds.split('-').map(Number);
    if (y === 2026 && m === 5 && (d === 15 || d === 16)) {
      return { open: 17 * 60, close: 22 * 60 };
    }
    return null;
  }

  function isChristmasClosed(ds, ts) {
    const [y, m, d] = ds.split('-').map(Number);
    const [h, min]  = ts.split(':').map(Number);
    const totalMin  = h * 60 + min;

    if (y === 2025 && m === 12 && d >= 23) return true;
    if (y === 2026 && m === 1  && d === 1)  return true;
    if (y === 2026 && m === 1  && d === 2)  return totalMin < 17 * 60;
    return false;
  }

  function isWithinOpeningHours(ds, ts) {
    const date     = new Date(ds + 'T' + ts + ':00');
    const dow      = date.getDay(); // 0=Sun, 6=Sat
    const [h, min] = ts.split(':').map(Number);
    const total    = h * 60 + min;

    // Auffahrt special hours
    const auffahrt = getAuffahrtHours(ds);
    if (auffahrt) return total >= auffahrt.open && total <= auffahrt.close;

    // Di–Fr (2–5): 11:00–14:00 & 17:30–21:00
    if (dow >= 2 && dow <= 5) {
      return (total >= 11 * 60 && total <= 14 * 60) ||
             (total >= 17 * 60 + 30 && total <= 21 * 60);
    }
    // Sa (6): 17:00–23:00
    if (dow === 6) {
      return total >= 17 * 60 && total <= 23 * 60;
    }
    return false;
  }

  // ── Auffahrt popup on page load ───────────────────────────────
  setTimeout(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    if (y === 2026 && m === 5 && d >= 13 && d <= 16) {
      showPopup('🌸', 'Auffahrt – Sonderöffnungszeiten',
        `<p>Rund um das Auffahrtswochenende gelten folgende Zeiten:</p>
         <p><strong>Do, 14. Mai:</strong> <span style="color:#E07070">Geschlossen</span></p>
         <p><strong>Fr, 15. Mai:</strong> 17:00 – 22:00 Uhr</p>
         <p><strong>Sa, 16. Mai:</strong> 17:00 – 22:00 Uhr</p>
         <p style="margin-top:12px;font-size:0.8rem;opacity:.6">Wir freuen uns auf Ihren Besuch!</p>`
      );
    }
  }, 1600);

  // ── Form submit ───────────────────────────────────────────────
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const salutation = form.querySelector('select[name="salutation"]').value;
    const fullName   = form.querySelector('input[name="full_name"]').value.trim();
    const email      = form.querySelector('input[name="email"]').value.trim();
    const phone      = form.querySelector('input[name="phone"]').value.trim();
    const guests     = form.querySelector('input[name="guests"]').value;
    const dateInput  = form.querySelector('input[name="date"]');
    const timeInput  = form.querySelector('input[name="time"]');
    const rawDate    = dateInput.value;
    const time       = timeInput.value;

    formattedInput.value = formatDate(rawDate);

    // CHECK 1: Auffahrt closed
    if (isAuffahrtClosed(rawDate)) {
      showPopup('🚫', 'Auffahrt — Ruhetag',
        `<p>Gewähltes Datum: <strong>${formatDate(rawDate)} um ${time} Uhr</strong></p>
         <p>Am <strong>Donnerstag, 14. Mai 2026</strong> (Auffahrt) bleibt Reb-Thai geschlossen.</p>
         <p>Fr, 15. & Sa, 16. Mai: <strong>17:00 – 22:00 Uhr</strong></p>`
      );
      return;
    }

    // CHECK 2: Christmas closure
    if (isChristmasClosed(rawDate, time)) {
      showPopup('🎄', 'Betriebsferien',
        `<p>Gewähltes Datum: <strong>${formatDate(rawDate)} um ${time} Uhr</strong></p>
         <p>Vom <strong>23. Dezember 2025</strong> bis <strong>2. Januar 2026 um 17:00 Uhr</strong> haben wir Betriebsferien.</p>
         <p>Ab dem <strong>2. Januar 2026, 17:00 Uhr</strong> sind wir wieder für Sie da! 🎉</p>`
      );
      return;
    }

    // CHECK 3: Outside opening hours
    if (!isWithinOpeningHours(rawDate, time)) {
      const auffahrt = getAuffahrtHours(rawDate);
      const hoursHtml = auffahrt
        ? `<p>Sonderöffnungszeit: <strong>17:00 – 22:00 Uhr</strong></p>`
        : `<p><strong>Di – Fr:</strong> 11:00–14:00 &amp; 17:30–21:00</p>
           <p><strong>Samstag:</strong> 17:00–23:00</p>`;
      showPopup('⏰', 'Ausserhalb der Öffnungszeiten',
        `<p>Gewähltes Datum: <strong>${formatDate(rawDate)} um ${time} Uhr</strong></p>
         <p>Unsere Reservierungszeiten:</p>${hoursHtml}`
      );
      return;
    }

    // ✅ Send via EmailJS
    const submitBtn = form.querySelector('button[type="submit"]');
    const origText  = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Wird gesendet…';
    submitBtn.disabled  = true;

    emailjs.sendForm('service_3xmfbcr', 'template_sba0uij', form)
      .then(() => {
        showPopup('✅', 'Reservierung gesendet!',
          `<p><strong>Name:</strong> ${salutation} ${fullName}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Telefon:</strong> ${phone}</p>
           <p><strong>Personen:</strong> ${guests}</p>
           <p><strong>Datum:</strong> ${formatDate(rawDate)}</p>
           <p><strong>Uhrzeit:</strong> ${time} Uhr</p>
           <p style="margin-top:12px;font-size:0.8rem;opacity:.6">Wir melden uns in Kürze!</p>`
        );
        form.reset();
        formattedInput.value = '';
      })
      .catch(err => {
        showPopup('❌', 'Fehler beim Senden',
          `<p>${err.text || JSON.stringify(err)}</p>
           <p style="margin-top:8px;font-size:0.8rem;opacity:.6">Bitte versuchen Sie es erneut oder rufen Sie uns an: +41 52 317 25 25</p>`
        );
      })
      .finally(() => {
        submitBtn.innerHTML = origText;
        submitBtn.disabled  = false;
      });
  });
});

/* ============================================================
   Lohith Sanju P — portfolio
   canvas physics · reveals · telemetry · modals
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ==========================================================
     1 · PARTICLE FIELD — triangular glyphs, flocking + cursor
     ========================================================== */
  var canvas = $('#fx');
  var ctx = canvas.getContext('2d', { alpha: true });
  var W = 0, H = 0, DPR = 1;
  var particles = [];
  var pointer = { x: -9999, y: -9999, px: -9999, py: -9999, speed: 0, active: false };
  var running = true;

  function sizeCanvas() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildField();
  }

  function buildField() {
    var area = W * H;
    var target = Math.round(Math.min(130, Math.max(28, area / 13500)));
    particles = [];
    for (var i = 0; i < target; i++) {
      var kind = Math.random();
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.34,
        vy: (Math.random() - 0.5) * 0.34,
        a: Math.random() * Math.PI * 2,
        size: 3.2 + Math.random() * 4.6,
        kind: kind > 0.86 ? 2 : kind > 0.62 ? 1 : 0, // 0 neutral · 1 red · 2 cyan
        phase: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02
      });
    }
  }

  function colour(p, boost) {
    if (p.kind === 1) return 'rgba(255,51,51,' + (0.42 + boost * 0.58) + ')';
    if (p.kind === 2) return 'rgba(0,255,255,' + (0.30 + boost * 0.5) + ')';
    return 'rgba(214,214,232,' + (0.20 + boost * 0.45) + ')';
  }

  function drawTriangle(p, angle, alphaBoost) {
    var s = p.size;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * s * 1.5, Math.sin(angle) * s * 1.5);
    ctx.lineTo(Math.cos(angle + 2.5) * s, Math.sin(angle + 2.5) * s);
    ctx.lineTo(Math.cos(angle - 2.5) * s, Math.sin(angle - 2.5) * s);
    ctx.closePath();
    ctx.fillStyle = colour(p, alphaBoost);
    ctx.fill();
  }

  var SEP = 26, ALIGN = 62, COH = 96, ATTRACT = 210, REPEL = 150;

  function step(t) {
    ctx.clearRect(0, 0, W, H);

    // cursor velocity decays so a flick lingers for a beat
    pointer.speed *= 0.90;

    var n = particles.length;
    for (var i = 0; i < n; i++) {
      var p = particles[i];

      var sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, sepN = 0, aliN = 0, cohN = 0;

      for (var j = 0; j < n; j++) {
        if (i === j) continue;
        var q = particles[j];
        var dx = q.x - p.x, dy = q.y - p.y;
        var d2 = dx * dx + dy * dy;
        if (d2 > COH * COH || d2 < 0.0001) continue;

        var d = Math.sqrt(d2);
        // cohesion
        cx += q.x; cy += q.y; cohN++;
        // alignment
        ax += q.vx; ay += q.vy; aliN++;
        // separation
        if (d < SEP) { sx -= dx / d; sy -= dy / d; sepN++; }
      }

      var fx = 0, fy = 0;
      if (cohN) { fx += ((cx / cohN) - p.x) * 0.00055; fy += ((cy / cohN) - p.y) * 0.00055; }
      if (aliN) { fx += ((ax / aliN) - p.vx) * 0.028; fy += ((ay / aliN) - p.vy) * 0.028; }
      if (sepN) { fx += (sx / sepN) * 0.055; fy += (sy / sepN) * 0.055; }

      // gentle wander so the field never freezes
      p.phase += 0.012;
      fx += Math.cos(p.phase * 1.21) * 0.006;
      fy += Math.sin(p.phase * 0.93) * 0.006;

      // cursor interaction
      var near = 0;
      if (pointer.active) {
        var px = pointer.x - p.x, py = pointer.y - p.y;
        var pd2 = px * px + py * py;
        if (pd2 < REPEL * REPEL && pointer.speed > 6) {
          var pd = Math.sqrt(pd2) || 1;
          var power = (1 - pd / REPEL) * Math.min(pointer.speed / 22, 2.4);
          fx -= (px / pd) * power * 0.30;
          fy -= (py / pd) * power * 0.30;
          near = Math.min(1, power);
        } else if (pd2 < ATTRACT * ATTRACT) {
          var ad = Math.sqrt(pd2) || 1;
          var pull = 1 - ad / ATTRACT;
          // orbit: tangential + slight inward
          fx += (-py / ad) * pull * 0.055 + (px / ad) * pull * 0.012;
          fy += (px / ad) * pull * 0.055 + (py / ad) * pull * 0.012;
          near = pull * 0.7;
        }
      }

      p.vx = (p.vx + fx) * 0.985;
      p.vy = (p.vy + fy) * 0.985;
      // speed clamp
      var v = Math.hypot(p.vx, p.vy);
      if (v > 1.7) { p.vx = (p.vx / v) * 1.7; p.vy = (p.vy / v) * 1.7; }
      else if (v < 0.05) { p.vx += (Math.random() - 0.5) * 0.05; p.vy += (Math.random() - 0.5) * 0.05; }

      p.x += p.vx;
      p.y += p.vy;

      // wrap
      if (p.x < -30) p.x = W + 30; else if (p.x > W + 30) p.x = -30;
      if (p.y < -30) p.y = H + 30; else if (p.y > H + 30) p.y = -30;

      // heading: velocity + slow spin
      var target = Math.atan2(p.vy, p.vx);
      var diff = ((target - p.a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      p.a += diff * 0.12 + p.spin;
      p._near = near;
    }

    // links first (behind glyphs)
    ctx.lineWidth = 1;
    for (var a = 0; a < n; a++) {
      for (var b = a + 1; b < n; b++) {
        var A = particles[a], B = particles[b];
        var lx = A.x - B.x, ly = A.y - B.y;
        var ld2 = lx * lx + ly * ly;
        if (ld2 > 11000) continue;
        var al = (1 - ld2 / 11000) * 0.10;
        var hot = (A._near || 0) + (B._near || 0);
        ctx.strokeStyle = hot > 0.55
          ? 'rgba(255,51,51,' + (al * 2.1) + ')'
          : 'rgba(140,140,170,' + al + ')';
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
      }
    }

    for (var k = 0; k < n; k++) drawTriangle(particles[k], particles[k].a, particles[k]._near || 0);

    // cursor halo
    if (pointer.active) {
      var g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 130);
      g.addColorStop(0, 'rgba(255,51,51,0.055)');
      g.addColorStop(1, 'rgba(255,51,51,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 130, 0, Math.PI * 2);
      ctx.fill();
    }

    if (running) raf = requestAnimationFrame(step);
  }

  var raf = 0;
  function startField() {
    if (reduceMotion) {
      // single static frame, no animation loop
      running = false;
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function (p) { drawTriangle(p, p.a, 0); });
      return;
    }
    if (!raf) { running = true; raf = requestAnimationFrame(step); }
  }
  function stopField() { running = false; cancelAnimationFrame(raf); raf = 0; }

  sizeCanvas();
  startField();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { sizeCanvas(); startField(); }, 180);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopField(); else startField();
  });

  /* ==========================================================
     2 · POINTER — custom cursor + canvas input + card spotlight
     ========================================================== */
  var dot = $('.cursor-dot');
  var ring = $('.cursor-ring');
  var curX = 0, curY = 0, ringX = 0, ringY = 0;

  if (finePointer && !reduceMotion) document.body.classList.add('has-cursor');

  window.addEventListener('pointermove', function (e) {
    pointer.px = pointer.x; pointer.py = pointer.y;
    pointer.x = e.clientX; pointer.y = e.clientY;
    pointer.active = true;
    var dx = pointer.x - pointer.px, dy = pointer.y - pointer.py;
    if (isFinite(dx) && isFinite(dy)) pointer.speed = Math.min(Math.hypot(dx, dy), 90);

    curX = e.clientX; curY = e.clientY;

    // spotlight vars for any card that wants them
    var card = e.target.closest ? e.target.closest('.project, .skill-card, .cert, .post, .contact, .exp-card') : null;
    if (card) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    }
  }, { passive: true });

  window.addEventListener('pointerdown', function (e) {
    pointer.speed = 90;
    if (ring) ring.classList.add('is-hot');
  }, { passive: true });
  window.addEventListener('pointerup', function () { if (ring) ring.classList.remove('is-hot'); }, { passive: true });
  window.addEventListener('pointerleave', function () { pointer.active = false; });

  function cursorLoop() {
    ringX += (curX - ringX) * 0.18;
    ringY += (curY - ringY) * 0.18;
    if (dot) dot.style.transform = 'translate3d(' + (curX - 2.5) + 'px,' + (curY - 2.5) + 'px,0)';
    if (ring) ring.style.transform = 'translate3d(' + (ringX - 17) + 'px,' + (ringY - 17) + 'px,0)';
    requestAnimationFrame(cursorLoop);
  }
  if (finePointer && !reduceMotion) cursorLoop();

  /* ==========================================================
     3 · NAV
     ========================================================== */
  var nav = $('#nav');
  var navLinks = $('#navLinks');
  var navToggle = $('#navToggle');
  var navScrim = $('#navScrim');

  function onScrollNav() {
    if (window.scrollY > 24) nav.classList.add('is-stuck');
    else nav.classList.remove('is-stuck');
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  function setNav(open) {
    if (!navLinks || !navToggle) return;
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (navScrim) navScrim.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      setNav(!navLinks.classList.contains('is-open'));
    });
    $$('.nav-link').forEach(function (a) {
      a.addEventListener('click', function () { setNav(false); });
    });
    if (navScrim) navScrim.addEventListener('click', function () { setNav(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) setNav(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && navLinks.classList.contains('is-open')) setNav(false);
    });
  }

  // active section
  var sectionEls = $$('main section[id]');
  var navMap = {};
  $$('.nav-link').forEach(function (a) { navMap[a.getAttribute('href').slice(1)] = a; });

  var activeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var id = en.target.id;
      $$('.nav-link').forEach(function (a) { a.classList.remove('is-active'); });
      if (navMap[id]) navMap[id].classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sectionEls.forEach(function (s) { activeObserver.observe(s); });

  /* ==========================================================
     4 · SCROLL PROGRESS + BACK TO TOP
     ========================================================== */
  var progressBar = $('#progressBar');
  var toTop = $('#toTop');

  function onScrollProgress() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? (window.scrollY / h) * 100 : 0;
    if (progressBar) progressBar.style.width = p.toFixed(2) + '%';
    if (toTop) toTop.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.8);
  }
  onScrollProgress();
  window.addEventListener('scroll', onScrollProgress, { passive: true });
  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ==========================================================
     5 · REVEALS (staggered)
     ========================================================== */
  var revealEls = $$('.reveal');

  function showReveal(el) {
    var sibs = el.parentElement ? $$('.reveal', el.parentElement) : [];
    var idx = Math.max(0, sibs.indexOf(el));
    el.style.transitionDelay = Math.min(idx * 55, 330) + 'ms';
    el.classList.add('is-in');
  }

  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealTick = false;
    function checkReveals() {
      revealTick = false;
      for (var i = revealEls.length - 1; i >= 0; i--) {
        var el = revealEls[i];
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.94 || el.classList.contains('is-in')) {
          showReveal(el);
          revealEls.splice(i, 1);
        }
      }
    }
    function queueReveals() {
      if (revealTick) return;
      revealTick = true;
      requestAnimationFrame(checkReveals);
    }
    checkReveals();
    window.addEventListener('scroll', queueReveals, { passive: true });
    window.addEventListener('resize', queueReveals);
    window.addEventListener('load', queueReveals);
    setTimeout(checkReveals, 400);
  }

  /* ==========================================================
     6 · COUNTERS
     ========================================================== */
  var counters = $$('[data-count]');
  if (counters.length && !reduceMotion) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var to = parseInt(el.getAttribute('data-count'), 10) || 0;
        var from = 0, t0 = performance.now(), dur = 900;
        function tick(now) {
          var k = Math.min(1, (now - t0) / dur);
          var eased = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(from + (to - from) * eased);
          if (k < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countObs.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { countObs.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute('data-count'); });
  }

  /* ==========================================================
     7 · TYPEWRITER
     ========================================================== */
  var typeEl = $('#typeRole');
  if (typeEl) {
    var phrases = ['full-stack developer', 'ai engineer', 'data engineer', 'mlops builder'];
    if (reduceMotion) {
      typeEl.textContent = phrases[0];
    } else {
      var pi = 0, ci = 0, deleting = false;
      (function typeLoop() {
        var word = phrases[pi];
        if (!deleting) {
          ci++;
          typeEl.textContent = word.slice(0, ci);
          if (ci === word.length) { deleting = true; return setTimeout(typeLoop, 1900); }
          setTimeout(typeLoop, 62);
        } else {
          ci--;
          typeEl.textContent = word.slice(0, ci);
          if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; return setTimeout(typeLoop, 320); }
          setTimeout(typeLoop, 30);
        }
      })();
    }
  }

  /* ==========================================================
     8 · TELEMETRY HUD
     ========================================================== */
  var hudFps = $('#hudFps'), hudMem = $('#hudMem'), hudPing = $('#hudPing'),
      hudNet = $('#hudNet'), hudClock = $('#hudClock');

  // FPS
  var frames = 0, fpsT0 = performance.now();
  (function fpsLoop() {
    frames++;
    var now = performance.now();
    if (now - fpsT0 >= 700) {
      if (hudFps) hudFps.textContent = Math.round((frames * 1000) / (now - fpsT0));
      frames = 0; fpsT0 = now;
    }
    requestAnimationFrame(fpsLoop);
  })();

  // memory
  function mem() {
    var m = performance.memory;
    if (m && hudMem) hudMem.textContent = (m.usedJSHeapSize / 1048576).toFixed(1) + 'MB';
    else if (hudMem) hudMem.textContent = 'n/a';
  }
  mem();
  setInterval(mem, 3000);

  // real round-trip ping to this origin
  var pinging = false;
  function ping() {
    if (pinging || !hudPing || document.hidden) return;
    pinging = true;
    var t0 = performance.now();
    fetch('site.css?ping=' + Date.now(), { method: 'HEAD', cache: 'no-store' })
      .then(function () {
        var ms = Math.round(performance.now() - t0);
        hudPing.textContent = ms + 'ms';
      })
      .catch(function () { hudPing.textContent = 'offline'; })
      .then(function () { pinging = false; });
  }
  ping();
  setInterval(ping, 9000);

  // network
  function net() {
    if (!hudNet) return;
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!navigator.onLine) hudNet.textContent = 'offline';
    else if (c && c.effectiveType) hudNet.textContent = c.effectiveType + (c.downlink ? ' · ' + Math.round(c.downlink) + 'Mb' : '');
    else hudNet.textContent = 'online';
  }
  net();
  window.addEventListener('online', net);
  window.addEventListener('offline', net);
  if (navigator.connection && navigator.connection.addEventListener) {
    navigator.connection.addEventListener('change', net);
  }

  // IST clock
  function clock() {
    if (!hudClock) return;
    var d = new Date();
    var s;
    try {
      s = d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false });
    } catch (err) { s = d.toTimeString().slice(0, 8); }
    hudClock.textContent = s;
  }
  clock();
  setInterval(clock, 1000);

  /* ==========================================================
     9 · PROJECT FILTERS
     ========================================================== */
  var filters = $$('.filter');
  var projects = $$('#projectsGrid .project');

  // derive the counts from the DOM so they can never drift from the cards
  (function syncFilterCounts() {
    if (!projects.length) return;
    filters.forEach(function (btn) {
      var f = btn.getAttribute('data-filter');
      var s = btn.querySelector('span');
      if (!s) return;
      if (f === 'all') { s.textContent = projects.length; return; }
      s.textContent = projects.filter(function (p) {
        return (p.getAttribute('data-tags') || '').split(/\s+/).indexOf(f) !== -1;
      }).length;
    });
  })();

  if (filters.length) {
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        var f = btn.getAttribute('data-filter');
        projects.forEach(function (p, i) {
          var tags = (p.getAttribute('data-tags') || '').split(/\s+/);
          var show = f === 'all' || tags.indexOf(f) !== -1;
          p.classList.toggle('is-hidden', !show);
          if (show && !reduceMotion) {
            p.style.animation = 'none';
            void p.offsetWidth;
            p.style.animation = 'fadeUp .38s cubic-bezier(.22,.61,.36,1) both';
            p.style.animationDelay = Math.min(i * 26, 220) + 'ms';
          }
        });
      });
    });
  }

  /* ==========================================================
     10 · MODALS
     ========================================================== */
  var certModal = $('#certModal');
  var postModal = $('#postModal');
  var lastFocus = null;

  function openModal(m) {
    lastFocus = document.activeElement;
    m.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var x = $('[data-close]', m);
    if (x) x.focus();
  }
  function closeModal(m) {
    m.classList.remove('is-open');
    document.body.style.overflow = '';
    if (m === certModal) {
      var em = $('#certEmbed');
      if (em) em.removeAttribute('src');
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('.modal').forEach(function (m) {
    m.addEventListener('click', function (e) {
      if (e.target === m || (e.target.closest && e.target.closest('[data-close]'))) closeModal(m);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    $$('.modal.is-open').forEach(closeModal);
  });

  // certificates
  function fillCert(title, cat, issuer, year, file) {
    var url = 'certificates/' + file;
    $('#certTitle').textContent = title;
    $('#certSub').textContent = cat;
    $('#certIssuer').textContent = issuer;
    $('#certYear').textContent = year;
    $('#certCat').textContent = cat;
    $('#certEmbed').setAttribute('src', url + '#view=FitH');
    ['#certDownload', '#certOpen', '#certOpenMobile'].forEach(function (sel) {
      var a = $(sel);
      if (a) a.setAttribute('href', url);
    });
    openModal(certModal);
  }

  $$('.cert').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var parts = (btn.getAttribute('data-cert') || '').split('|');
      fillCert(parts[0] || 'Certificate', parts[1] || '—', parts[2] || '—', parts[3] || '—', parts[4] || '');
    });
  });

  // legacy API kept for any old links
  window.openCertModal = function (title, cat, issuer, year, file) {
    fillCert(title, cat, issuer, year, file);
  };
  window.closeCertModal = function () { closeModal(certModal); };

  /* ==========================================================
     10b · CERTIFICATE VAULT (collapsed until clicked)
     ========================================================== */
  var certsToggle = $('#certsToggle');
  var certsPanel = $('#certsPanel');
  var certsHide = $('#certsHide');
  var certsLabel = certsToggle ? $('.vault-cta-label', certsToggle) : null;
  var certsOpen = false;

  if (certsPanel) {
    $$('.cert', certsPanel).forEach(function (card, i) {
      card.style.setProperty('--i', i);
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  function setCerts(open) {
    if (!certsPanel || !certsToggle) return;
    certsOpen = open;
    certsToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    certsPanel.classList.toggle('is-open', open);
    certsPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) certsPanel.removeAttribute('inert');
    else certsPanel.setAttribute('inert', '');
    if (certsLabel) certsLabel.textContent = open ? 'collapse' : 'reveal';
  }

  if (certsToggle) {
    certsToggle.addEventListener('click', function () { setCerts(!certsOpen); });
  }
  if (certsHide) {
    certsHide.addEventListener('click', function () {
      setCerts(false);
      var sec = document.getElementById('certs');
      if (sec) sec.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (certsToggle) certsToggle.focus({ preventScroll: true });
    });
  }
  setCerts(false);

  function openCertsFromHash() {
    if (location.hash === '#certs') setCerts(true);
  }
  window.addEventListener('hashchange', openCertsFromHash);
  openCertsFromHash();

  /* ==========================================================
     11 · ARTICLES
     ========================================================== */
  var articles = [
    {
      cat: 'ai & ml',
      title: "Getting started with AI development: a beginner's roadmap",
      date: 'April 15, 2026',
      read: '6 min read',
      tags: ['AI', 'Machine Learning', 'Python', 'TensorFlow', 'Beginners'],
      body: '<p>Artificial Intelligence can feel overwhelming at first, but breaking it down into manageable steps makes the journey not just possible, but genuinely exciting. When I first started exploring AI during my BE CSE (Data Science) program, I had no idea where to begin. There were frameworks, algorithms, and mathematical concepts everywhere — and it was intimidating. But looking back, the key was consistency and building from the ground up.</p>' +
        '<h4><i class="fas fa-route"></i> The roadmap that worked for me</h4>' +
        '<p>My journey began with strengthening my Python fundamentals. Before touching any ML library, I made sure I was comfortable with data structures, file handling, and object-oriented programming. This foundation proved invaluable when I started working with NumPy and Pandas for data manipulation.</p>' +
        '<p>Next, I dove into the core machine learning concepts — supervised vs unsupervised learning, regression, classification, clustering. I practiced these using scikit-learn, building small models on datasets from Kaggle. The "aha" moment came when I trained my first linear regression model and saw it predict values with reasonable accuracy.</p>' +
        '<h4><i class="fas fa-lightbulb"></i> From theory to real projects</h4>' +
        '<p>The real learning happened when I moved beyond tutorials. I started building FraudShieldAI — an end-to-end fraud detection system. This project forced me to understand data preprocessing, feature engineering, model selection, and deployment. I used Python with Flask for the backend and integrated machine learning models to detect suspicious patterns in real time.</p>' +
        '<p>My advice to anyone starting out: don\'t get stuck in "tutorial hell." Pick a problem that excites you, find a dataset, and build something. It will be messy, you\'ll face errors, but that\'s where the real growth happens.</p>' +
        '<h4><i class="fas fa-book-open"></i> Resources I recommend</h4>' +
        '<ul><li><strong>Python:</strong> Automate the Boring Stuff + the official docs</li><li><strong>ML theory:</strong> Andrew Ng\'s Machine Learning course on Coursera</li><li><strong>Practice:</strong> Kaggle competitions and datasets</li><li><strong>Deep learning:</strong> TensorFlow tutorials + the Fast.ai course</li><li><strong>Community:</strong> GitHub, r/MachineLearning, and the tech side of X</li></ul>' +
        '<p>Remember, every expert was once a beginner who refused to give up. Start small, stay consistent, and let your curiosity drive you. The AI field is vast, but you don\'t need to know everything — you just need to start.</p>'
    },
    {
      cat: 'firebase',
      title: 'Building scalable real-time applications with Firebase',
      date: 'March 28, 2026',
      read: '5 min read',
      tags: ['Firebase', 'Firestore', 'Real-time', 'Backend', 'Web'],
      body: '<p>Firebase completely changed how I approach backend development. As a frontend-focused developer, the idea of setting up servers, managing databases, and handling authentication felt daunting. Then I discovered Firebase — and suddenly I could build full-stack applications without writing a single line of backend infrastructure code.</p>' +
        '<h4><i class="fas fa-project-diagram"></i> Why I chose Firebase for Smart Dashboard</h4>' +
        '<p>When I built Smart Dashboard — a real-time student monitoring system — I needed live data updates, user authentication, and a scalable database. Firebase provided all three out of the box. Firestore\'s real-time sync meant that when a teacher updated a student\'s grade, it appeared instantly on every connected device without me writing any WebSocket code.</p>' +
        '<p>The authentication system handled Google sign-in, email/password, and even anonymous auth with a few lines of configuration. For a student project, that saved me weeks.</p>' +
        '<h4><i class="fas fa-fire"></i> Key lessons from production</h4>' +
        '<p>Structure your Firestore collections wisely from day one. I learned this the hard way when my initial nested document structure caused expensive reads. Flatten your data where possible, use subcollections for hierarchical data, and always index the fields you query frequently.</p>' +
        '<p>Security rules are non-negotiable. I initially had open rules for development, but before deploying I implemented strict rules based on authentication and role-based access. The rules simulator was a lifesaver for testing these without breaking the app.</p>' +
        '<h4><i class="fas fa-rocket"></i> The Firebase ecosystem</h4>' +
        '<ul><li><strong>Firestore:</strong> NoSQL database with real-time sync and offline persistence</li><li><strong>Authentication:</strong> multiple sign-in methods with minimal setup</li><li><strong>Cloud Functions:</strong> serverless backend logic triggered by events</li><li><strong>Hosting:</strong> fast CDN deployment with custom domains</li><li><strong>Cloud Storage:</strong> file uploads with security-rule integration</li></ul>' +
        '<p>For anyone starting out in full-stack development, Firebase is the perfect bridge. It lets you focus on building features instead of managing infrastructure. Smart Dashboard went from idea to deployment in under two weeks — something that would have taken months with a traditional backend setup.</p>'
    },
    {
      cat: 'career',
      title: 'My journey from C programming to full-stack development',
      date: 'February 10, 2026',
      read: '7 min read',
      tags: ['Career', 'Full Stack', 'React', 'Node.js', 'Learning'],
      body: '<p>My coding journey started in the most unglamorous way possible — with basic C programs in my first year of BE CSE (Data Science). I remember writing my first "Hello World" and feeling like I had unlocked a secret power. Those printf statements, loops, and pointer concepts seemed trivial at the time, but they were quietly building the logical thinking every developer needs.</p>' +
        '<h4><i class="fas fa-seedling"></i> The foundation years</h4>' +
        '<p>C taught me memory management, data structures, and algorithmic thinking. When I moved to JavaScript, the syntax felt familiar but the ecosystem was overwhelming. I spent nights debugging why a React component wouldn\'t re-render, only to realise I had mutated state directly. Those frustrating moments were the best teachers.</p>' +
        '<p>My breakthrough came when I stopped jumping between tutorials and committed to building projects. I rebuilt my college\'s attendance system as a web app. It was ugly, buggy, and slow — but it was mine. That project taught me more than any course ever could.</p>' +
        '<h4><i class="fas fa-layer-group"></i> Discovering the full stack</h4>' +
        '<p>The real magic happened when I connected my React frontend to a Node.js backend for the first time. Seeing data flow from a database, through an API, and render dynamically on screen felt like wizardry. I started exploring MongoDB for databases, Express for APIs, and eventually Firebase for serverless backends.</p>' +
        '<p>Today I architect applications that combine React frontends with Python/Node.js backends, integrate machine learning models, and deploy to the cloud. The journey from printf to production deployment has been chaotic, humbling, and incredibly rewarding.</p>' +
        '<h4><i class="fas fa-heart"></i> What I wish I knew earlier</h4>' +
        '<ul><li><strong>Consistency beats intensity:</strong> code a little every day rather than cramming on weekends</li><li><strong>Read the documentation:</strong> it\'s boring but saves hours of debugging later</li><li><strong>Build in public:</strong> share projects on GitHub and LinkedIn — opportunities find you</li><li><strong>Embrace imposter syndrome:</strong> everyone feels it; keep building anyway</li><li><strong>Community matters:</strong> join developer communities, attend hackathons, collaborate on open source</li></ul>' +
        '<p>If you\'re just starting out, trust the process. The late nights debugging, the Stack Overflow rabbit holes, the failed deployments — they all add up. Every expert you admire was once exactly where you are now. Keep coding, keep learning, and most importantly, keep building.</p>'
    }
  ];

  $$('.post-more').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = parseInt(btn.getAttribute('data-post'), 10) || 0;
      var a = articles[i];
      if (!a) return;
      $('#postCat').textContent = '// ' + a.cat;
      $('#postTitle').textContent = a.title;
      $('#postDate').textContent = a.date;
      $('#postRead').textContent = a.read;
      $('#postBody').innerHTML = a.body;
      $('#postTags').innerHTML = a.tags.map(function (t) { return '<li>' + t + '</li>'; }).join('');
      openModal(postModal);
      postModal.querySelector('.modal-card').scrollTop = 0;
    });
  });

  window.openBlogModal = function (i) {
    var n = $$('.post-more')[i];
    if (n) n.click();
  };
  window.closeBlogModal = function () { closeModal(postModal); };

  /* ==========================================================
     12 · KEYFRAME USED BY THE FILTER ANIMATION
     ========================================================== */
  var style = document.createElement('style');
  style.textContent = '@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}';
  document.head.appendChild(style);

})();


/* ============================================================
   V2 module — theme switch, project vault, cert search,
   case studies, command palette, github stats, contact form,
   deep links, service worker
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ==========================================================
     1 · THEME
     ========================================================== */
  var themeBtn = $('#themeToggle');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('lsp-theme', theme); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f4f4f7' : '#050507');
    if (themeBtn) {
      var light = theme === 'light';
      themeBtn.setAttribute('aria-pressed', light ? 'true' : 'false');
      themeBtn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
      themeBtn.title = light ? 'Dark theme' : 'Light theme';
      var i = themeBtn.querySelector('i');
      if (i) i.className = light ? 'fas fa-moon' : 'fas fa-sun';
    }
  }

  var savedTheme = 'dark';
  try { savedTheme = localStorage.getItem('lsp-theme') || 'dark'; } catch (e) {}
  applyTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
  }

  /* ==========================================================
     2 · GENERIC VAULT (projects)
     ========================================================== */
  function wireVault(toggleEl, panelEl) {
    if (!toggleEl || !panelEl) return null;
    var label = toggleEl.querySelector('.vault-cta-label');
    var open = false;
    function set(value) {
      open = value;
      toggleEl.setAttribute('aria-expanded', value ? 'true' : 'false');
      panelEl.classList.toggle('is-open', value);
      panelEl.setAttribute('aria-hidden', value ? 'false' : 'true');
      if (value) panelEl.removeAttribute('inert');
      else panelEl.setAttribute('inert', '');
      if (label) label.textContent = value ? 'collapse' : 'reveal';
    }
    toggleEl.addEventListener('click', function () { set(!open); });
    set(false);
    return { set: set, isOpen: function () { return open; }, toggle: toggleEl, panel: panelEl };
  }

  var projectVault = wireVault($('#projectsToggle'), $('#projectsPanel'));
  var projectsHide = $('#projectsHide');
  if (projectsHide && projectVault) {
    projectsHide.addEventListener('click', function () {
      projectVault.set(false);
      var sec = document.getElementById('work');
      if (sec) sec.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      var t = $('#projectsToggle');
      if (t) t.focus({ preventScroll: true });
    });
  }

  function openProjectVault() {
    if (projectVault && !projectVault.isOpen()) projectVault.set(true);
  }
  function openCertVault() {
    var t = $('#certsToggle');
    if (t && t.getAttribute('aria-expanded') !== 'true') t.click();
  }

  /* ==========================================================
     3 · PROJECT CASE STUDIES
     ========================================================== */
  var CASES = {
    'Insurance Cross-Sell MLOps': {
      tag: 'mlops · production ml',
      problem: 'An insurer wants to know which policyholders will buy vehicle insurance, but the outreach list is untargeted so sales teams burn calls on people who never convert.',
      built: [
        'Config-driven training package (xsell) with pydantic config, feature builder, threshold tuning and a versioned model artifact.',
        'FastAPI service exposing /health, /model/info, /predict and /predict/batch with schema validation and a graceful 503 when the model is missing.',
        'MLflow tracking plus a registry entry, a Docker image that runs as a non-root user, and a healthcheck that fails when the artifact disappears.'
      ],
      metrics: [['0.7978', 'roc_auc'], ['0.3856', 'f1 @ 0.59'], ['2.5x', 'top-decile lift'], ['47', 'pytest tests']],
      next: 'Drift monitoring, registry-driven promotion instead of an env var, and a CI retrain gate before any further feature work.'
    },
    'IGNITE 2026': {
      tag: 'react · product site',
      problem: 'A four-week industry prototyping sprint for a college needed a real registration product: countdown, eligibility, payments and legally-required policy pages, live before launch week.',
      built: [
        'Single source of truth in eventConfig.ts so every page renders from one data file.',
        'Registration flow, countdown, FAQ, prize structure and eight info/legal pages with a generic policy renderer.',
        'Playwright end-to-end suite covering navigation, forms and the mobile breakpoints.'
      ],
      metrics: [['52/52', 'playwright passes'], ['8', 'info/legal pages'], ['4', 'week programme']],
      next: 'The submission side is stubbed: real registrations still route through a form link, and payment status is marked pending.'
    },
    'signbridge-isl': {
      tag: 'computer vision · accessibility',
      problem: 'Indian Sign Language has almost no real-time tooling: deaf users cannot be understood by people who do not sign.',
      built: [
        'MediaPipe Pose + Hands extract landmarks in the browser, streamed over WebSocket to a Python inference service.',
        'LSTM classifier trained on isolated signs with a confidence gate so unknown gestures are rejected instead of guessed.',
        'Sub-5ms inference per frame keeps the caption loop responsive.'
      ],
      metrics: [['49', 'isolated signs'], ['<5ms', 'inference']],
      next: 'Continuous signing is the hard part: isolated signs do not compose into grammar yet, so sentence-level recognition is the next step.'
    },
    'herald-emergency': {
      tag: 'ai · incident response',
      problem: 'Emergency coordinators drown in unstructured reports: calls, messages and documents arrive faster than anyone can read them.',
      built: [
        'Gemini-powered extraction that turns free-text incident reports into structured entities and events.',
        'Entity graph plus timeline view so responders can see who, where and when without re-reading sources.',
        'Co-pilot panel for follow-up questions scoped to the active incident.'
      ],
      metrics: [['graph', 'entity linking'], ['timeline', 'event replay']],
      next: 'Everything is a web demo: no dispatch integrations, no offline mode, and no evaluation set for extraction accuracy.'
    },
    'sentinel-prototype': {
      tag: 'accessibility · haptics',
      problem: 'Screen readers talk constantly, which is exhausting and unsafe in motion. Blind users need directional guidance, not narration.',
      built: [
        'Silence-first interaction model: obstacles are encoded as haptic direction and intensity instead of speech.',
        'Browser sensor + audio prototype proving the cue language before any hardware work.',
        'Cue grammar documented so the same pattern can be ported to a wearable.'
      ],
      metrics: [['0', 'spoken words'], ['3', 'cue axes']],
      next: 'Needs real blind participants to validate the cue language; a phone-only prototype cannot prove safety.'
    },
    'BQT-MDQW': {
      tag: 'quantum · research',
      problem: 'Quantum walk routing is usually published as maths on paper with no reproducible artefact.',
      built: [
        'Qiskit Aer implementation of coined quantum walks combined with classical MDQW routing.',
        'Deterministic seeds and exported results so the numbers can be re-run by anyone.',
        'Comparison against classical routing baselines.'
      ],
      metrics: [['qiskit', 'aer backend'], ['seeded', 'reproducible']],
      next: 'Simulator-only results do not survive noise assumptions; the next step is a noise model plus error mitigation.'
    },
    'BharatLensAI': {
      tag: 'vision · multilingual',
      problem: 'Image understanding tools assume English, so Indian users get descriptions in a language they may not read.',
      built: [
        'Vision model output piped through a translation layer into Indian languages.',
        'Caption plus explanation output instead of a bare label list.',
        'Simple upload-first interface with no signup.'
      ],
      metrics: [['vision', 'captions'], ['multi', 'language']],
      next: 'Needs a proper evaluation of translation quality and a latency budget for large images.'
    },
    'SignBridge2Vision': {
      tag: 'speech · avatar',
      problem: 'Live speech is invisible to deaf users in meetings and classrooms.',
      built: [
        'Streaming speech-to-text feeding a sign avatar so the output is signed instead of captioned.',
        'Real-time pipeline designed around a fixed frame budget.',
        'Shared vocabulary with signbridge-isl so both projects improve together.'
      ],
      metrics: [['live', 'audio in'], ['avatar', 'signed out']],
      next: 'Avatar naturalness and sign grammar are the open problems; the pipeline proves the plumbing, not the fluency.'
    },
    'FraudShieldAI': {
      tag: 'ml · mobile',
      problem: 'Fraud alerts that only say "suspicious" train users to ignore them.',
      built: [
        'On-device scoring so transaction data never leaves the phone.',
        'Per-alert explanation of the features that drove the risk score.',
        'In-app feedback loop to correct false positives.'
      ],
      metrics: [['on-device', 'scoring'], ['explained', 'every alert']],
      next: 'Needs a labelled, privacy-cleared dataset before the model can be tuned beyond prototype accuracy.'
    },
    'vision-bridge': {
      tag: 'react · firebase',
      problem: 'Student innovators have ideas but no route to mentors, funding or teams.',
      built: [
        'Firebase auth and Firestore data model for ideas, profiles and opportunities.',
        'Matching view that surfaces opportunities against a stated idea.',
        'Deployed on Vercel with live data.'
      ],
      metrics: [['live', 'deployed'], ['firebase', 'realtime']],
      next: 'Matching is still rule-based; there is no ranking model or moderation queue yet.'
    },
    'shadownet-frontend': {
      tag: 'data visualisation',
      problem: 'Intelligence analysts read narrative timelines in spreadsheets and lose the connections between actors.',
      built: [
        'Entity graph view with linked nodes for people, organisations and events.',
        'Narrative timeline that keeps sourced quotes attached to each event.',
        'Sentiment dashboard for topic drift over time.'
      ],
      metrics: [['graph', 'entities'], ['timeline', 'sourced']],
      next: 'Frontend only: the graph layout struggles past a few thousand nodes and needs clustering.'
    },
    'smart-dashboard': {
      tag: 'analytics · firebase',
      problem: 'Attendance, marks and progress live in separate spreadsheets that nobody reconciles.',
      built: [
        'Real-time Firestore-backed dashboard for attendance, grades and progress.',
        'Chart.js visualisations with per-student filters.',
        'Teacher-side entry flow instead of manual file uploads.'
      ],
      metrics: [['realtime', 'sync'], ['chart.js', 'views']],
      next: 'No role-based access control yet: staff and student views share the same data path.'
    },
    'portfolio': {
      tag: 'vanilla js · canvas',
      problem: 'Most portfolios are template-shaped: same grid, same three cards, nothing that shows how the person actually builds.',
      built: [
        'Hand-written HTML, CSS and JavaScript with no framework and no build step.',
        'Custom 2D canvas particle layer with flocking, cursor repulsion and a telemetry HUD.',
        'This v2 pass: click-to-reveal vaults, command palette, searchable credentials, case studies, light theme and a service worker for offline use.'
      ],
      metrics: [['0', 'frameworks'], ['1', 'canvas layer'], ['100', 'lighthouse-minded']],
      next: 'Wire the contact endpoint to a live form service and add per-project screenshots once captured.'
    }
  };

  var caseModal = $('#caseModal');
  var lastCaseFocus = null;

  function openCase(title) {
    var data = CASES[title];
    if (!data || !caseModal) return;
    var card = $$('.project').filter(function (p) {
      var h = p.querySelector('h3');
      return h && h.textContent.trim() === title;
    })[0];

    $('#caseTitle').textContent = title;
    $('#caseSub').textContent = data.tag + (card ? ' · project ' + card.getAttribute('data-idx') : '');

    var html = '<div class="case-block"><h4>problem</h4><p>' + data.problem + '</p></div>';
    html += '<div class="case-block"><h4>what I built</h4><ul>' + data.built.map(function (li) { return '<li>' + li + '</li>'; }).join('') + '</ul></div>';
    if (data.metrics && data.metrics.length) {
      html += '<div class="case-grid">' + data.metrics.map(function (m) {
        return '<div class="case-metric"><b>' + m[0] + '</b><span>' + m[1] + '</span></div>';
      }).join('') + '</div>';
    }
    html += '<div class="case-block"><h4>what I would fix next</h4><p>' + data.next + '</p></div>';
    if (card) {
      var links = card.querySelector('.project-links');
      if (links) html += '<div class="modal-actions">' + links.innerHTML.replace(/<a /g, '<a class="btn btn-ghost" ') + '</div>';
    }
    $('#caseBody').innerHTML = html;

    lastCaseFocus = document.activeElement;
    caseModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var x = caseModal.querySelector('[data-close]');
    if (x) x.focus();
  }

  function closeCase() {
    if (!caseModal) return;
    caseModal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastCaseFocus && lastCaseFocus.focus) lastCaseFocus.focus();
  }

  if (caseModal) {
    caseModal.addEventListener('click', function (e) {
      if (e.target === caseModal || (e.target.closest && e.target.closest('[data-close]'))) closeCase();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && caseModal.classList.contains('is-open')) closeCase();
    });
  }

  // inject a "case study" button into every project card
  $$('.project').forEach(function (card) {
    card.classList.remove('reveal');
    var h = card.querySelector('h3');
    if (!h) return;
    var title = h.textContent.trim();
    if (!CASES[title]) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'project-case';
    btn.innerHTML = 'case study <span aria-hidden="true">&#8600;</span>';
    btn.setAttribute('aria-label', 'Open case study: ' + title);
    btn.addEventListener('click', function () { openCase(title); });
    var links = card.querySelector('.project-links');
    if (links && links.nextSibling) card.insertBefore(btn, links.nextSibling);
    else card.appendChild(btn);
  });

  /* ==========================================================
     4 · CERTIFICATE SEARCH + MODAL BROWSING
     ========================================================== */
  var certCards = $$('.cert');
  var certSearch = $('#certSearch');
  var certChips = $('#certChips');
  var certCount = $('#certCount');
  var certVisible = certCards.slice();
  var certIndex = 0;
  var certFilter = 'all';

  function bucketOf(cat) {
    var c = (cat || '').toLowerCase();
    if (/artificial|analytics|thinking|\bai\b/.test(c)) return 'ai';
    if (/data|database|excel|office/.test(c)) return 'data';
    if (/aws|google|open source|cloud/.test(c)) return 'cloud';
    if (/security|cyber|hacking/.test(c)) return 'security';
    if (/web|javascript|dsa|system|operating/.test(c)) return 'systems';
    if (/design/.test(c)) return 'design';
    return 'career';
  }

  var buckets = {};
  certCards.forEach(function (card) {
    var parts = (card.getAttribute('data-cert') || '').split('|');
    var b = bucketOf(parts[1]);
    card.setAttribute('data-bucket', b);
    card.setAttribute('data-search', (card.getAttribute('data-cert') || '').toLowerCase());
    buckets[b] = (buckets[b] || 0) + 1;
  });

  var BUCKET_LABEL = { all: 'all', ai: 'ai', data: 'data', cloud: 'cloud', security: 'security', systems: 'systems', design: 'design', career: 'career' };

  function buildChips() {
    if (!certChips) return;
    var keys = ['all'].concat(Object.keys(BUCKET_LABEL).filter(function (k) { return k !== 'all' && buckets[k]; }));
    certChips.innerHTML = keys.map(function (k) {
      var n = k === 'all' ? certCards.length : buckets[k];
      return '<button type="button" class="vault-chip' + (k === 'all' ? ' is-on' : '') + '" data-bucket="' + k + '" aria-pressed="' + (k === 'all') + '">' + BUCKET_LABEL[k] + ' ' + n + '</button>';
    }).join('');
    certChips.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.vault-chip');
      if (!b) return;
      certFilter = b.getAttribute('data-bucket');
      $$('.vault-chip', certChips).forEach(function (c) {
        var on = c === b;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      filterCerts();
    });
  }

  function filterCerts() {
    var q = (certSearch && certSearch.value || '').trim().toLowerCase();
    certVisible = [];
    certCards.forEach(function (card) {
      var okQuery = !q || card.getAttribute('data-search').indexOf(q) !== -1;
      var okBucket = certFilter === 'all' || card.getAttribute('data-bucket') === certFilter;
      var show = okQuery && okBucket;
      card.classList.toggle('is-filtered', !show);
      if (show) certVisible.push(card);
    });
    if (certCount) certCount.textContent = certVisible.length + ' of ' + certCards.length + ' shown';
    var empty = $('#certEmpty');
    if (empty) empty.hidden = certVisible.length !== 0;
  }

  buildChips();
  filterCerts();
  if (certSearch) {
    certSearch.addEventListener('input', filterCerts);
    certSearch.addEventListener('search', filterCerts);
  }

  var certModal = $('#certModal');

  function certTitleOf(card) { return (card.getAttribute('data-cert') || '').split('|')[0] || 'Certificate'; }

  function showCertAt(i) {
    if (!certVisible.length) return;
    certIndex = (i + certVisible.length) % certVisible.length;
    var card = certVisible[certIndex];
    var parts = (card.getAttribute('data-cert') || '').split('|');
    if (window.openCertModal) window.openCertModal(parts[0], parts[1], parts[2], parts[3], parts[4]);
    var label = $('#certPos');
    if (label) label.textContent = (certIndex + 1) + ' / ' + certVisible.length;
  }

  certCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var i = certVisible.indexOf(card);
      if (i !== -1) certIndex = i;
      var pos = $('#certPos');
      if (pos) pos.textContent = (certIndex + 1) + ' / ' + certVisible.length;
    });
  });

  if (certModal) {
    var prev = $('#certPrev'), next = $('#certNext');
    if (prev) prev.addEventListener('click', function () { showCertAt(certIndex - 1); });
    if (next) next.addEventListener('click', function () { showCertAt(certIndex + 1); });
    document.addEventListener('keydown', function (e) {
      if (!certModal.classList.contains('is-open')) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); showCertAt(certIndex - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); showCertAt(certIndex + 1); }
    });
  }

  /* ==========================================================
     5 · COMMAND PALETTE
     ========================================================== */
  var palette = $('#palette');
  var paletteInput = $('#paletteInput');
  var paletteList = $('#paletteList');
  var paletteItems = [];
  var paletteShown = [];
  var paletteActive = 0;

  function goto(hash) {
    var el = document.querySelector(hash);
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', hash);
  }

  function buildPalette() {
    var items = [];
    $$('.nav-link').forEach(function (a) {
      items.push({
        label: a.textContent.replace(/^\d+/, '').trim(),
        hint: 'section',
        icon: 'fa-hashtag',
        run: function () { goto(a.getAttribute('href')); }
      });
    });
    $$('.project').forEach(function (card) {
      var h = card.querySelector('h3');
      if (!h) return;
      var title = h.textContent.trim();
      items.push({
        label: title,
        hint: 'project',
        icon: 'fa-cube',
        run: function () { openProjectVault(); openCase(title); }
      });
    });
    certCards.forEach(function (card) {
      var title = certTitleOf(card);
      items.push({
        label: title,
        hint: 'certificate',
        icon: 'fa-certificate',
        run: function () { openCertVault(); var i = certVisible.indexOf(card); showCertAt(i === -1 ? 0 : i); }
      });
    });
    $$('.post').forEach(function (post) {
      var h = post.querySelector('h3');
      var more = post.querySelector('.post-more');
      if (!h || !more) return;
      items.push({
        label: h.textContent.trim(),
        hint: 'article',
        icon: 'fa-pen-nib',
        run: function () { more.click(); }
      });
    });
    items.push({ label: 'email · ssanju200610@gmail.com', hint: 'contact', icon: 'fa-envelope', run: function () { location.href = 'mailto:ssanju200610@gmail.com'; } });
    items.push({ label: 'github · sanju-zxt', hint: 'contact', icon: 'fa-github', run: function () { window.open('https://github.com/sanju-zxt', '_blank', 'noopener'); } });
    items.push({ label: 'linkedin · lohith-sanju-p', hint: 'contact', icon: 'fa-linkedin', run: function () { window.open('https://www.linkedin.com/in/lohith-sanju-p', '_blank', 'noopener'); } });
    items.push({ label: 'resume (pdf)', hint: 'download', icon: 'fa-file-arrow-down', run: function () { window.open('assets/resume.pdf', '_blank', 'noopener'); } });
    items.push({ label: 'toggle light / dark theme', hint: 'theme', icon: 'fa-circle-half-stroke', run: function () { if (themeBtn) themeBtn.click(); } });
    return items;
  }

  function score(label, q) {
    var l = label.toLowerCase();
    if (!q) return 1;
    if (l.indexOf(q) === 0) return 100;
    if (l.indexOf(q) !== -1) return 60 - l.indexOf(q) / 10;
    var qi = 0;
    for (var i = 0; i < l.length && qi < q.length; i++) if (l[i] === q[qi]) qi++;
    return qi === q.length ? 20 : 0;
  }

  function renderPalette(q) {
    if (!paletteList) return;
    var scored = paletteItems.map(function (it) {
      return { it: it, s: Math.max(score(it.label, q), score(it.hint, q) * 0.8) };
    }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 12);
    paletteShown = scored.map(function (x) { return x.it; });
    paletteActive = 0;
    if (!paletteShown.length) {
      paletteList.innerHTML = '<p class="palette-empty">no matches for "' + q.replace(/</g, '&lt;') + '"</p>';
      return;
    }
    paletteList.innerHTML = paletteShown.map(function (it, i) {
      return '<button type="button" class="palette-item' + (i === 0 ? ' is-active' : '') + '" data-i="' + i + '">' +
        '<i class="' + (it.icon.indexOf('fa-brands') === 0 ? it.icon : (it.icon === 'fa-github' || it.icon === 'fa-linkedin' ? 'fab ' : 'fas ') + it.icon) + '" aria-hidden="true"></i>' +
        '<span>' + it.label + '</span><em>' + it.hint + '</em></button>';
    }).join('');
  }

  function setPaletteActive(i) {
    if (!paletteShown.length) return;
    paletteActive = (i + paletteShown.length) % paletteShown.length;
    $$('.palette-item', paletteList).forEach(function (el, idx) { el.classList.toggle('is-active', idx === paletteActive); });
  }

  function openPalette() {
    if (!palette) return;
    paletteItems = paletteItems.length ? paletteItems : buildPalette();
    palette.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (paletteInput) { paletteInput.value = ''; }
    renderPalette('');
    setTimeout(function () { if (paletteInput) paletteInput.focus(); }, 30);
  }

  function closePalette() {
    if (!palette) return;
    palette.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (palette) {
    palette.addEventListener('click', function (e) {
      if (e.target === palette) closePalette();
      var item = e.target.closest && e.target.closest('.palette-item');
      if (item) {
        var it = paletteShown[Number(item.getAttribute('data-i'))];
        closePalette();
        if (it) it.run();
      }
    });
    if (paletteInput) {
      paletteInput.addEventListener('input', function () { renderPalette(paletteInput.value.trim().toLowerCase()); });
    }
    document.addEventListener('keydown', function (e) {
      var open = palette.classList.contains('is-open');
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (open) closePalette(); else openPalette();
        return;
      }
      if (!open) return;
      if (e.key === 'Escape') { closePalette(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setPaletteActive(paletteActive + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setPaletteActive(paletteActive - 1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        var it = paletteShown[paletteActive];
        closePalette();
        if (it) it.run();
      }
    });
    var pbtn = $('#paletteBtn');
    if (pbtn) pbtn.addEventListener('click', openPalette);
  }

  /* ==========================================================
     6 · GITHUB STATS
     ========================================================== */
  (function githubStats() {
    var strip = $('#ghStrip');
    if (!strip) return;
    var USER = 'sanju-zxt';
    var KEY = 'lsp-gh-v1';
    var CACHE_MS = 60 * 60 * 1000;
    var COLORS = ['#ff3333', '#00ffff', '#2ee6a0', '#b18cff', '#ffb03a'];

    function paint(data) {
      var repos = data.repos, langs = data.langs;
      $('#ghRepos').textContent = data.publicRepos;
      $('#ghStars').textContent = data.stars;
      $('#ghFollowers').textContent = data.followers;
      $('#ghLangTop').textContent = langs[0] ? langs[0].name : 'n/a';

      var bars = $('#ghBars');
      if (bars) {
        bars.innerHTML = langs.slice(0, 5).map(function (l, i) {
          return '<i style="width:' + l.pct + '%;background:' + COLORS[i % COLORS.length] + '"></i>';
        }).join('');
      }
      var foot = $('#ghFoot');
      if (foot) {
        foot.innerHTML = langs.slice(0, 5).map(function (l, i) {
          return '<span><i style="background:' + COLORS[i % COLORS.length] + '"></i>' + l.name + ' ' + l.pct + '%</span>';
        }).join('');
      }
    }

    try {
      var cached = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (cached && Date.now() - cached.t < CACHE_MS) { paint(cached.d); return; }
    } catch (e) {}

    var jobs = [
      fetch('https://api.github.com/users/' + USER, { headers: { Accept: 'application/vnd.github+json' } }).then(function (r) { return r.json(); }),
      fetch('https://api.github.com/users/' + USER + '/repos?per_page=100&sort=updated', { headers: { Accept: 'application/vnd.github+json' } }).then(function (r) { return r.json(); })
    ];

    Promise.all(jobs).then(function (res) {
      var user = res[0], repos = res[1];
      if (!user || user.message || !Array.isArray(repos)) throw new Error('github unavailable');
      var stars = repos.reduce(function (n, r) { return n + (r.stargazers_count || 0); }, 0);
      var counts = {};
      repos.forEach(function (r) {
        if (!r.language) return;
        counts[r.language] = (counts[r.language] || 0) + 1;
      });
      var total = Object.keys(counts).reduce(function (n, k) { return n + counts[k]; }, 0) || 1;
      var langs = Object.keys(counts).map(function (k) {
        return { name: k, pct: Math.round((counts[k] / total) * 100) };
      }).sort(function (a, b) { return b.pct - a.pct; });

      var data = {
        publicRepos: user.public_repos || repos.length,
        stars: stars,
        followers: user.followers || 0,
        langs: langs
      };
      paint(data);
      try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d: data })); } catch (e) {}
    }).catch(function () {
      strip.hidden = true;
    });
  })();

  /* ==========================================================
     7 · CONTACT FORM
     ========================================================== */
  (function contactForm() {
    var form = $('#contactForm');
    if (!form) return;
    var status = $('#cfStatus');
    var btn = $('#cfSubmit');
    var endpoint = form.getAttribute('data-endpoint') || '';
    var EMAIL = 'ssanju200610@gmail.com';

    function say(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.classList.remove('is-ok', 'is-bad');
      if (kind) status.classList.add(kind);
    }

    function mailtoFallback(data) {
      var subject = encodeURIComponent('Portfolio enquiry from ' + data.name);
      var body = encodeURIComponent(data.message + '\n\n— ' + data.name + ' (' + data.email + ')');
      location.href = 'mailto:' + EMAIL + '?subject=' + subject + '&body=' + body;
      say('Opening your mail app — send the draft to reach me.', 'is-ok');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.elements.name.value || '').trim();
      var email = (form.elements.email.value || '').trim();
      var message = (form.elements.message.value || '').trim();
      var honey = (form.elements._honey.value || '').trim();

      if (honey) { say('Message sent — thanks.', 'is-ok'); form.reset(); return; }
      if (name.length < 2) { say('Add your name so I know who I am replying to.', 'is-bad'); form.elements.name.focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { say('That email address looks incomplete.', 'is-bad'); form.elements.email.focus(); return; }
      if (message.length < 12) { say('A little more detail helps — 12 characters minimum.', 'is-bad'); form.elements.message.focus(); return; }

      var data = { name: name, email: email, message: message };
      if (!endpoint) { say('No form endpoint configured yet.', 'is-bad'); mailtoFallback(data); return; }

      if (btn) { btn.disabled = true; btn.dataset.label = btn.innerHTML; btn.innerHTML = 'sending…'; }
      say('Sending…');

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message,
          _subject: 'Portfolio enquiry from ' + name,
          _template: 'table'
        })
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json().catch(function () { return {}; });
      }).then(function () {
        form.reset();
        say('Sent — I usually reply within a day.', 'is-ok');
      }).catch(function () {
        say('Form service unreachable, falling back to email.', 'is-bad');
        mailtoFallback(data);
      }).then(function () {
        if (btn) { btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label; }
      });
    });

    if (status) status.textContent = 'Sends straight to my inbox — no mail client needed.';
  })();

  /* ==========================================================
     8 · DEEP LINKS
     ========================================================== */
  function pulse(el) {
    if (!el) return;
    el.classList.add('is-target');
    setTimeout(function () { el.classList.remove('is-target'); }, 2400);
  }

  function handleHash() {
    var h = location.hash;
    if (!h) return;

    var m = h.match(/^#cert-(\d{1,2})$/);
    if (m) {
      var card = certCards[Number(m[1]) - 1];
      if (card) {
        openCertVault();
        setTimeout(function () {
          card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
          pulse(card);
          var i = certVisible.indexOf(card);
          if (i !== -1) showCertAt(i);
        }, 520);
      }
      return;
    }

    m = h.match(/^#project-(\d{1,2})$/);
    if (m) {
      var project = $$('.project')[Number(m[1]) - 1];
      if (project) {
        openProjectVault();
        var title = (project.querySelector('h3') || {}).textContent;
        setTimeout(function () {
          project.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
          pulse(project);
          if (title && CASES[title.trim()]) openCase(title.trim());
        }, 520);
      }
      return;
    }

    m = h.match(/^#post-(\d+)$/);
    if (m) {
      var more = $$('.post-more')[Number(m[1])];
      if (more) more.click();
    }
  }

  window.addEventListener('hashchange', handleHash);
  if (document.readyState === 'complete') handleHash();
  else window.addEventListener('load', function () { setTimeout(handleHash, 300); });

  /* ==========================================================
     9 · SERVICE WORKER
     ========================================================== */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();

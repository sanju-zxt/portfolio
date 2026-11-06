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

  function onScrollNav() {
    if (window.scrollY > 24) nav.classList.add('is-stuck');
    else nav.classList.remove('is-stuck');
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('.nav-link').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
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
  $$('.cert').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var parts = (btn.getAttribute('data-cert') || '').split('|');
      var title = parts[0] || 'Certificate';
      var cat = parts[1] || '—';
      var issuer = parts[2] || '—';
      var year = parts[3] || '—';
      var file = parts[4] || '';
      $('#certTitle').textContent = title;
      $('#certSub').textContent = cat;
      $('#certIssuer').textContent = issuer;
      $('#certYear').textContent = year;
      $('#certCat').textContent = cat;
      var url = 'certificates/' + file;
      $('#certEmbed').setAttribute('src', url + '#view=FitH');
      $('#certDownload').setAttribute('href', url);
      openModal(certModal);
    });
  });

  // legacy API kept for any old links
  window.openCertModal = function (title, cat, issuer, year, file) {
    $('#certTitle').textContent = title;
    $('#certSub').textContent = cat;
    $('#certIssuer').textContent = issuer;
    $('#certYear').textContent = year;
    $('#certCat').textContent = cat;
    var url = 'certificates/' + file;
    $('#certEmbed').setAttribute('src', url + '#view=FitH');
    $('#certDownload').setAttribute('href', url);
    openModal(certModal);
  };
  window.closeCertModal = function () { closeModal(certModal); };

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

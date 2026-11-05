/* =====================================================================
   script.js  —  GERAKAN & INTERAKSI website
   Isinya: running text, headline yang bergerak saat scroll, posisi "© 2026",
   dan kursor panah 3D glossy. Dipanggil dari index.html di paling bawah:
   <script src="js/script.js"></script>
   Script ini mencari elemen di index.html lewat nama class-nya
   (misalnya .marquee, .hero2, .l1), jadi kalau nama class di HTML diubah,
   nama di sini juga harus diubah.
   ===================================================================== */

/* ===== 0. Saat halaman di-refresh, selalu mulai dari headline paling atas ===== */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; /* matikan "ingat posisi scroll" bawaan browser */
if (location.hash) history.replaceState(null, '', location.pathname + location.search); /* buang #work, #about, dst dari alamat */
window.scrollTo(0, 0);
window.addEventListener('pageshow', function (e) { if (e.persisted) window.scrollTo(0, 0); }); /* tombol Back/Forward */

/* ===== 1. Membuat running text dari atribut data-text ===== */
document.querySelectorAll('.marquee').forEach(function (el) {
  var text = el.dataset.text;
  var group = '';
  for (var i = 0; i < 12; i++) group += '<span>' + text + '</span><i></i>';
  // dua kelompok identik supaya putarannya mulus tanpa putus
  el.innerHTML = '<div class="track"><div class="group">' + group + '</div><div class="group">' + group + '</div></div>';
});

/* ===== 2. Running text MELENGKUNG: teks berjalan mengikuti garis lengkung (SVG textPath) =====
   data-curve di index.html memilih bentuk garis. Mau ubah bentuk? Ubah "d" (garis) atau "size" (ukuran huruf),
   "speed" (kecepatan), dan "dir" (-1 = jalan ke kiri, 1 = ke kanan) di bawah ini. */
(function () {
  var NS = 'http://www.w3.org/2000/svg', XL = 'http://www.w3.org/1999/xlink';
  var CURVES = {
    arch:  { vb: '0 -30 1440 270', size: 92, speed: 90,  dir: -1, d: 'M -60 200 Q 720 -40 1500 200' },
    wave:  { vb: '0 -40 1440 260', size: 84, speed: 80,  dir: 1,  d: 'M -60 110 C 200 -30 460 -30 720 100 S 1240 230 1500 90' },
    swirl: { vb: '0 -90 1200 640', size: 58, speed: 110, dir: 1,  d: 'M -80 440 C 250 540 520 520 760 440 C 1000 360 1160 300 1130 160 C 1100 20 960 -60 840 -40 C 700 -20 620 120 680 250 C 740 380 960 400 1100 380 C 1230 360 1300 330 1360 290' }
  };
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches, items = [];
  document.querySelectorAll('.cmq').forEach(function (el, n) {
    var c = CURVES[el.dataset.curve] || CURVES.arch, id = 'cmqp' + n;
    var svg = document.createElementNS(NS, 'svg'), path = document.createElementNS(NS, 'path');
    var text = document.createElementNS(NS, 'text'), tp = document.createElementNS(NS, 'textPath');
    svg.setAttribute('viewBox', c.vb); path.setAttribute('id', id); path.setAttribute('d', c.d); path.setAttribute('fill', 'none');
    text.setAttribute('font-size', c.size); tp.setAttribute('href', '#' + id); tp.setAttributeNS(XL, 'xlink:href', '#' + id);
    text.appendChild(tp); svg.appendChild(path); svg.appendChild(text); el.appendChild(svg);
    var it = { el: el, tp: tp, c: c, on: true, L: 0, unit: '<tspan>' + el.dataset.text + ' </tspan><tspan class="st">\u2726 </tspan>' };
    items.push(it);
    var setup = function () {
      var m = document.createElementNS(NS, 'text'); m.setAttribute('font-size', c.size); m.innerHTML = it.unit; svg.appendChild(m);
      it.L = m.getComputedTextLength() || 400; svg.removeChild(m);
      var reps = Math.ceil(path.getTotalLength() / it.L) + 2, s = '';
      for (var i = 0; i < reps; i++) s += it.unit;
      tp.innerHTML = s; tp.setAttribute('startOffset', c.dir < 0 ? 0 : -it.L);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setup); else setup();
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { it.on = e[0].isIntersecting; }).observe(el);
  });
  if (!still && items.length) requestAnimationFrame(function tick(t) {
    items.forEach(function (it) {
      if (!it.on || !it.L) return;
      var k = (t / 1000 * it.c.speed) % it.L;
      it.tp.setAttribute('startOffset', (it.c.dir < 0 ? -k : k - it.L).toFixed(1));
    });
    requestAnimationFrame(tick);
  });
})();

/* ===== 2b. Angka pengalaman menghitung naik saat terlihat ===== */
(function () {
  var els = document.querySelectorAll('.stat b'); if (!els.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  els.forEach(function (b) { b.firstChild.textContent = '0'; });
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      var b = e.target, to = +b.dataset.to, t0 = performance.now();
      requestAnimationFrame(function f(t) {
        var p = Math.min(1, (t - t0) / 1200);
        b.firstChild.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(f);
      });
    });
  }, { threshold: .6 });
  els.forEach(function (b) { io.observe(b); });
})();

/* ===== 2c. Komputer di section Work: Flappy Bird main sendiri tanpa henti (loop) ===== */
(function () {
  var cv = document.getElementById('flappy'); if (!cv) return;
  var W = 240, H = 180, GY = 156, BX = 62, R = 8, GAP = 70, PW = 30, SP = 62, GR = 900, FL = -255, SPC = 118;
  cv.width = W; cv.height = H;
  var x = cv.getContext('2d'), bird, pipes, score, lastC, wing = 0, last = 0, raf = 0;
  function mk(px) { lastC = Math.max(GAP / 2 + 16, Math.min(GY - GAP / 2 - 16, lastC + Math.random() * 64 - 32)); return { x: px, c: lastC, s: false }; }
  function reset() { bird = { y: 78, v: 0 }; score = 0; lastC = 80; pipes = []; for (var i = 0; i < 4; i++) pipes.push(mk(170 + i * SPC)); }
  function step(dt) {
    var p = null, i;
    for (i = 0; i < pipes.length; i++) if (pipes[i].x + PW > BX - R - 2) { p = pipes[i]; break; }
    if (p && bird.y > p.c + 18 && bird.v >= 0) { bird.v = FL; wing = .18; }   /* "pemain" menekan tombol lompat */
    bird.v += GR * dt; bird.y += bird.v * dt; wing = Math.max(0, wing - dt);
    var hit = bird.y + R > GY || bird.y - R < 0;
    pipes.forEach(function (q) {
      q.x -= SP * dt;
      if (!q.s && q.x + PW < BX) { q.s = true; score = (score + 1) % 100; }
      if (BX + R > q.x && BX - R < q.x + PW && (bird.y - R < q.c - GAP / 2 || bird.y + R > q.c + GAP / 2)) hit = true;
    });
    if (pipes[0].x + PW < -4) { pipes.shift(); pipes.push(mk(pipes[pipes.length - 1].x + SPC)); }
    if (hit) reset();                                                          /* kalau menabrak, mulai lagi: loop */
  }
  function draw() {
    var g = x.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, '#14143c'); g.addColorStop(1, '#3b2d8f');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    pipes.forEach(function (q) {
      var t = q.c - GAP / 2, b = q.c + GAP / 2;
      x.fillStyle = '#C6FF3D'; x.fillRect(q.x, 0, PW, t); x.fillRect(q.x, b, PW, GY - b);
      x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(q.x + PW - 6, 0, 6, t); x.fillRect(q.x + PW - 6, b, 6, GY - b);
      x.fillStyle = '#00D4B8'; x.fillRect(q.x - 3, t - 10, PW + 6, 10); x.fillRect(q.x - 3, b, PW + 6, 10);
    });
    x.fillStyle = '#FF7A18'; x.fillRect(0, GY, W, H - GY); x.fillStyle = '#FFD60A'; x.fillRect(0, GY, W, 4);
    x.save(); x.translate(BX, Math.round(bird.y)); x.rotate(Math.max(-.5, Math.min(.9, bird.v / 420)));
    x.fillStyle = '#FFD60A'; x.beginPath(); x.arc(0, 0, R, 0, 7); x.fill();
    x.fillStyle = '#FF4D00'; x.fillRect(-6, wing > 0 ? -5 : 0, 8, 5); x.fillRect(R - 2, 0, 7, 4);
    x.fillStyle = '#fff'; x.beginPath(); x.arc(3, -3, 3, 0, 7); x.fill();
    x.fillStyle = '#0D0D0E'; x.beginPath(); x.arc(4, -3, 1.5, 0, 7); x.fill();
    x.restore();
    x.fillStyle = '#fff'; x.font = 'bold 22px monospace'; x.textAlign = 'center'; x.fillText(score, W / 2, 30);
  }
  function frame(t) { var dt = Math.min(.034, (t - last) / 1000 || .016); last = t; step(dt); draw(); raf = requestAnimationFrame(frame); }
  reset(); draw();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (e) {            /* hanya jalan saat komputernya terlihat di layar */
    if (e[0].isIntersecting) { last = performance.now(); raf = requestAnimationFrame(frame); } else cancelAnimationFrame(raf);
  }).observe(cv);
})();

/* ===== 3. Galeri karya: klik folder -> jendela berisi gambar + video TikTok =====
   Isinya diatur di js/karya.js (bukan di sini). */
(function () {
  var DIR = 'images/karya/', data = window.KARYA || {}, tt = window.TIKTOK_AKUN || '#';
  var folders = document.querySelectorAll('.folder[data-folder]'); if (!folders.length) return;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); };

  /* gambar pertama tiap folder otomatis jadi sampul folder */
  folders.forEach(function (f) {
    var d = data[f.dataset.folder], m = f.querySelector('.f-media');
    if (d && d.gambar && d.gambar.length && m) m.innerHTML = '<img src="' + DIR + esc(d.gambar[0]) + '" alt="' + esc(f.querySelector('h3').textContent) + '" loading="lazy">';
  });

  var box = document.createElement('div'); box.className = 'gal'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
  document.body.appendChild(box);
  var lastFocus = null;

  function videoCard(v) {
    var id = (String(v).match(/video\/(\d+)/) || [])[1], isTT = /^https?:/i.test(v);
    var btn = '<a class="gal-btn" href="' + esc(isTT ? v : tt) + '" target="_blank" rel="noopener">Watch on TikTok &nearr;</a>';
    if (isTT && id) return '<div class="gal-vid"><div class="gal-frame"><iframe src="https://www.tiktok.com/player/v1/' + id + '?rel=0" allow="fullscreen; encrypted-media" loading="lazy" title="TikTok video"></iframe></div>' + btn + '</div>';
    if (isTT) return '<div class="gal-vid">' + btn + '</div>';                    /* link pendek/tanpa ID: cukup tombol */
    return '<div class="gal-vid"><div class="gal-frame"><video src="' + DIR + esc(v) + '" controls playsinline preload="metadata"></video></div>' + btn + '</div>';   /* file .mp4 */
  }

  function open(f) {
    var d = data[f.dataset.folder] || {}, pics = d.gambar || [], vids = d.video || [];
    var c1 = f.style.getPropertyValue('--c1'), c2 = f.style.getPropertyValue('--c2'), fg = f.style.getPropertyValue('--fg');
    var html = '<div class="gal-bg" data-close></div><div class="gal-box"><div class="gal-top" style="background:linear-gradient(135deg,' + c1 + ',' + c2 + ');color:' + fg + '">'
      + '<div><span class="gal-n">' + esc(f.querySelector('.f-tab').textContent) + '</span><h3>' + f.querySelector('h3').innerHTML + '</h3></div>'
      + '<a class="gal-btn gal-follow" href="' + esc(tt) + '" target="_blank" rel="noopener">Follow on TikTok &nearr;</a>'
      + '<button class="gal-x" data-close aria-label="Close">&times;</button></div><div class="gal-body">';
    if (pics.length) html += '<div class="gal-pics">' + pics.map(function (p) { return '<img src="' + DIR + esc(p) + '" alt="" loading="lazy">'; }).join('') + '</div>';
    if (vids.length) html += '<h4 class="gal-h">Videos</h4><div class="gal-vids">' + vids.map(videoCard).join('') + '</div>';
    if (!pics.length && !vids.length) html += '<p class="gal-empty">New work for this folder is coming soon.</p>';
    box.innerHTML = html + '</div></div><div class="gal-zoom" hidden></div>';
    lastFocus = document.activeElement; box.hidden = false; document.documentElement.style.overflow = 'hidden';
    box.querySelector('.gal-x').focus();
  }
  function close() {
    box.hidden = true; box.innerHTML = '';                      /* video ikut berhenti */
    document.documentElement.style.overflow = ''; if (lastFocus) lastFocus.focus();
  }

  folders.forEach(function (f) { f.addEventListener('click', function (e) { e.preventDefault(); open(f); }); });
  box.addEventListener('click', function (e) {
    var z = box.querySelector('.gal-zoom');
    if (e.target.closest('.gal-zoom')) { z.hidden = true; z.innerHTML = ''; return; }
    if (e.target.closest('[data-close]')) return close();
    var im = e.target.closest('.gal-pics img');                  /* klik gambar = tampil besar */
    if (im) { z.innerHTML = '<img src="' + im.src + '" alt="">'; z.hidden = false; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || box.hidden) return;
    var z = box.querySelector('.gal-zoom'); if (z && !z.hidden) { z.hidden = true; z.innerHTML = ''; } else close();
  });
})();

/* ===== 1b. Headline bergerak saat di-scroll: hitung progress 0 sampai 1 ===== */
var hero = document.querySelector('.hero2');
if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  var updateHero = function () {
    var total = hero.offsetHeight - window.innerHeight;
    var p = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / total));
    hero.style.setProperty('--p', p.toFixed(4));
  };
  window.addEventListener('scroll', updateHero, { passive: true });
  window.addEventListener('resize', updateHero);
  updateHero();
}

/* ===== 1c. Teks © 2026 sejajar dengan ujung atas tanda seru (!) pada "hi!" ===== */
function alignYear() {
  var hi = document.querySelector('.l1 .serif'), yr = document.querySelector('.tag-year'), row = document.querySelector('.l1');
  if (!hi || !yr || !row) return;
  var c = document.createElement('canvas').getContext('2d');
  var hs = getComputedStyle(hi), ys = getComputedStyle(yr);
  c.font = hs.fontStyle + ' ' + hs.fontWeight + ' ' + hs.fontSize + ' ' + hs.fontFamily;
  var tall = c.measureText('!').actualBoundingBoxAscent;      /* tinggi tanda seru di atas garis dasar huruf */
  c.font = ys.fontStyle + ' ' + ys.fontWeight + ' ' + ys.fontSize + ' ' + ys.fontFamily;
  var small = c.measureText('2026').actualBoundingBoxAscent;  /* tinggi angka 2026 */
  row.style.setProperty('--year-lift', Math.max(0, tall - small).toFixed(1) + 'px');
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignYear); else alignYear();
window.addEventListener('resize', alignYear);

/* ===== 1d. Efek teks headline: huruf berputar seperti mesin slot lalu berhenti di huruf yang benar ===== */
var TEXT_INTRO = true;    /* true = headline muncul dengan efek huruf berputar saat halaman dibuka */
var IDLE_GLITCH = true;   /* true = sesekali huruf "i" berubah sebentar jadi "!" */
var WELCOME_FLIP = true;      /* true = huruf pada kata "welcome" terbalik-balik, berulang-ulang */
var PORTFOLIO_COLOR = false;  /* true = warna biru & pink menjalar pada kata "portfolio", berulang-ulang */
var COLOR_BLUE = '#0436C8';   /* warna yang menjalar dari kiri ke kanan */
var COLOR_PINK = '#F22DAA';   /* warna yang menjalar dari kanan ke kiri */
(function () {
  var root = document.documentElement;
  var h1 = document.querySelector('.hero2 h1');
  var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* kalau efek dimatikan / browser tidak mendukung, tampilkan headline biasa */
  if (!h1 || noMotion || !h1.animate) { root.classList.add('fx-ready'); return; }

  var CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEGHKMNRSTUVWXY'; /* huruf acak yang "berputar" sebelum berhenti */
  var CELL = .95;                                                       /* tinggi satu huruf (dalam em), harus sama dengan .ch-cell di CSS */

  function cell(c) { var d = document.createElement('span'); d.className = 'ch-cell'; d.textContent = c; return d; }

  /* 1. Pecah teks headline menjadi huruf satu per satu (teks kecil, kursi, dan Scroll to explore tidak ikut dipecah) */
  var walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT, {
    acceptNode: function (n) {
      if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return n.parentElement.closest('.tag, .obj, .hint-wrap') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });
  var nodes = [], letters = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  h1.setAttribute('aria-label', nodes.map(function (n) { return n.nodeValue.trim(); }).join(' ')); /* pembaca layar tetap membaca kalimat utuh */
  nodes.forEach(function (n) {
    var frag = document.createDocumentFragment();
    var w = 0;                                                       /* nomor kata di dalam teks ini (0 = kata pertama) */
    n.nodeValue.split('').forEach(function (c) {
      if (/\s/.test(c)) { w++; frag.appendChild(document.createTextNode(c)); return; }
      var ch = document.createElement('span'); ch.className = 'ch'; ch.dataset.c = c; ch.dataset.w = w;
      var inEl = document.createElement('span'); inEl.className = 'ch-in'; inEl.appendChild(cell(c));
      ch.appendChild(inEl); frag.appendChild(ch); letters.push(ch);
    });
    n.replaceWith(frag);
  });

  /* kelompok huruf untuk efek berulang */
  var welcomeLetters = letters.filter(function (ch) { return ch.closest('.l2') && ch.dataset.w === '0'; }); /* kata pertama di baris ke-2 = "welcome" */
  var portfolioLetters = letters.filter(function (ch) { return ch.closest('.l3 .serif'); });               /* tulisan miring di baris ke-3 = "portfolio." */

  /* 2. Mulai: tiap huruf menggulung ke atas melewati beberapa huruf acak, lalu berhenti di huruf aslinya */
  var finished = 0;
  function start() {
    root.classList.add('fx-ready');
    if (TEXT_INTRO && window.gsap) {   /* intro GSAP: huruf jatuh sambil berputar, memantul, lalu diam */
      letters.forEach(function (ch) { ch.classList.add('done'); });
      var dl = letters.map(function () { return .15 + Math.random() * .9; });   /* giliran acak tiap huruf (detik) */
      var tl = gsap.timeline({ onComplete: function () { gsap.set(letters, { clearProps: 'transform,opacity' }); afterIntro(); } });
      tl.from(letters, { y: function () { return -innerHeight * (.5 + Math.random() * .5); }, duration: 1.4, ease: 'bounce.out', delay: function (i) { return dl[i]; } }, 0)
        .from(letters, { rotation: function () { return gsap.utils.random(-160, 160); }, duration: 1.2, ease: 'power3.out', delay: function (i) { return dl[i]; } }, 0)
        .from(letters, { opacity: 0, duration: .25, delay: function (i) { return dl[i]; } }, 0);
      return;
    }
    if (!TEXT_INTRO) { letters.forEach(function (ch) { ch.classList.add('done'); }); afterIntro(); return; }
    letters.forEach(function (ch, i) {
      var inEl = ch.firstElementChild, finalCell = inEl.firstElementChild;
      var n = 4 + Math.floor(Math.random() * 4);                      /* jumlah huruf acak yang dilewati */
      for (var k = 0; k < n; k++) inEl.insertBefore(cell(CHARS.charAt(Math.floor(Math.random() * CHARS.length))), finalCell);
      var delay = 150 + (i / letters.length) * 900 + Math.random() * 450; /* giliran muncul: kira-kira dari kiri ke kanan, sedikit acak */
      var anim = inEl.animate(
        [{ transform: 'translateY(' + (CELL + .4) + 'em)' }, { transform: 'translateY(' + (-n * CELL) + 'em)' }],
        { duration: 900 + Math.random() * 500, delay: delay, easing: 'cubic-bezier(.22,.9,.28,1)', fill: 'both' }
      );
      anim.onfinish = function () {
        inEl.replaceChildren(finalCell); anim.cancel();                /* buang huruf acak, sisakan huruf asli */
        ch.classList.add('done');
        if (++finished === letters.length) afterIntro();
      };
    });
  }

  /* 3. Sesekali huruf "i" (yang bukan bagian dari tulisan miring) berubah sebentar jadi "!" lalu kembali */
  var iTargets = letters.filter(function (ch) { return ch.dataset.c === 'i' && !ch.closest('.serif'); });
  function glitch(ch) {
    var inEl = ch.firstElementChild, orig = inEl.firstElementChild, alt = cell('!');
    inEl.appendChild(alt); ch.classList.add('rolling');
    var ease = 'cubic-bezier(.7,0,.3,1)';
    var a = inEl.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(' + (-CELL) + 'em)' }], { duration: 260, easing: ease, fill: 'forwards' });
    a.onfinish = function () {
      setTimeout(function () {                                          /* tahan sebentar sebagai "!" */
        var b = inEl.animate([{ transform: 'translateY(' + (-CELL) + 'em)' }, { transform: 'translateY(0)' }], { duration: 260, easing: ease, fill: 'forwards' });
        b.onfinish = function () { a.cancel(); b.cancel(); alt.remove(); ch.classList.remove('rolling'); };
      }, 800);
    };
  }
  function glitchLoop() {
    if (!document.hidden && window.scrollY < window.innerHeight * .6 && iTargets.length) {
      glitch(iTargets[Math.floor(Math.random() * iTargets.length)]);
    }
    setTimeout(glitchLoop, 2800 + Math.random() * 2600);                /* jeda acak antar kejadian */
  }

  /* 4. Efek yang berulang selama pengunjung masih berada di halaman headline */
  var hero = document.querySelector('.hero2');
  function onHeadline() {   /* true selama halaman headline masih terlihat (belum di-scroll jauh) dan tab sedang dibuka */
    return !document.hidden && window.scrollY < (hero.offsetHeight - window.innerHeight) * .9;
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function allDone(anims) { return Promise.all(anims.map(function (a) { return a.finished.catch(function () {}); })); }

  /* "welcome": huruf terbalik satu per satu (seperti gelombang), tahan sebentar terbalik, lalu kembali tegak */
  async function flipLoop() {
    while (true) {
      if (!onHeadline()) { await wait(400); continue; }
      var E = 'cubic-bezier(.65,0,.35,1)', P = 'perspective(600px) ';
      await allDone(welcomeLetters.map(function (ch, i) {
        return ch.animate([
          { transform: P + 'rotateX(0deg)', easing: E },
          { transform: P + 'rotateX(180deg)', offset: .38, easing: 'linear' },   /* terbalik */
          { transform: P + 'rotateX(180deg)', offset: .62, easing: E },          /* ditahan sebentar */
          { transform: P + 'rotateX(360deg)' }                                   /* kembali tegak */
        ], { duration: 1500, delay: i * 110 });                                  /* 110 = jeda antar huruf (ms) */
      }));
      await wait(1400);                                                          /* istirahat sebelum gelombang berikutnya */
    }
  }

  /* "portfolio.": warna menjalar huruf demi huruf, lalu kembali ke warna semula */
  function sweep(color, fromRight) {
    var base = getComputedStyle(h1).color, n = portfolioLetters.length;
    return allDone(portfolioLetters.map(function (ch, i) {
      return ch.animate([
        { color: base },
        { color: color, offset: .3 },
        { color: color, offset: .65 },
        { color: base }
      ], { duration: 1100, delay: (fromRight ? n - 1 - i : i) * 110, easing: 'ease-in-out' });  /* 110 = kecepatan menjalar */
    }));
  }
  async function colorLoop() {
    while (true) {
      if (!onHeadline()) { await wait(400); continue; }
      await sweep(COLOR_BLUE, false);   /* biru: kiri ke kanan */
      if (onHeadline()) await sweep(COLOR_PINK, true);    /* pink: kanan ke kiri */
      await wait(900);
    }
  }
  function afterIntro() {
    if (IDLE_GLITCH) setTimeout(glitchLoop, 1500);
    if (WELCOME_FLIP) flipLoop();
    if (PORTFOLIO_COLOR) colorLoop();
  }

  /* tunggu font selesai dimuat supaya posisi huruf tidak melompat */
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
})();

/* ===== 2. Efek kursor (hanya untuk perangkat dengan mouse) =====
   Kursor panah 3D glossy yang berputar terbalik seperti kata "welcome", dengan debu/asap berwarna di belakangnya. */
var hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (hasMouse) {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ARROW_SIZE = 38;        /* ukuran kursor (px). Cukup ubah angka ini saja */
  var ARROW_FLIP = true;      /* true = kursor berputar terbalik berulang-ulang, seperti huruf pada kata "welcome" */
  var SWAY = 0.01;            /* seberapa miring kursor saat digeser */
  var DUST_AMOUNT = 1;        /* banyaknya debu/asap: 0 = mati, 1 = normal, 2 = lebat */
  /* warna debu = palet web ini: oranye, pink, biru, ungu, lime, tosca, kuning, merah aksen */
  var DUST_COLORS = ['255,122,24', '242,45,170', '43,69,255', '177,76,255', '198,255,61', '0,212,184', '255,214,10', '255,82,82'];
  var TIP = Math.round(ARROW_SIZE * 0.06);   /* ujung panah (kiri atas) = titik klik */

  /* ----- Bentuk panah: gradien warna aksen, sisi tebal (3D), kilau putih, dan cahaya tepi ungu ----- */
  var PD = 'M38.0 65.5Q24 28 61.6 41.5L454.4 182.5Q492 196 455.2 211.7L298.9 278.5Q286 284 280.4 296.8L212.0 453.3Q196 490 182.0 452.5L38.0 65.5Z';
  var ARROW_SVG = '<svg viewBox="0 0 512 512" width="' + ARROW_SIZE + '" height="' + ARROW_SIZE + '" aria-hidden="true"><defs>'
    + '<linearGradient id="caBase" x1=".05" y1="0" x2=".85" y2="1"><stop offset="0" stop-color="#FFC09A"/><stop offset=".4" stop-color="#FF5A4F"/><stop offset="1" stop-color="#F22DAA"/></linearGradient>'
    + '<linearGradient id="caSide" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C21E4B"/><stop offset="1" stop-color="#5E0E58"/></linearGradient>'
    + '<linearGradient id="caShine" x1="0" y1="0" x2=".55" y2=".9"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".55" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
    + '<radialGradient id="caRim" cx=".82" cy=".9" r=".55"><stop offset="0" stop-color="#B14CFF" stop-opacity=".85"/><stop offset="1" stop-color="#B14CFF" stop-opacity="0"/></radialGradient>'
    + '<filter id="caBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>'
    + '<clipPath id="caClip"><path d="' + PD + '"/></clipPath></defs>'
    + '<path d="' + PD + '" transform="translate(26 32)" fill="url(#caSide)"/>'      /* sisi tebal: beberapa salinan bergeser = efek 3D */
    + '<path d="' + PD + '" transform="translate(18 22)" fill="url(#caSide)"/>'
    + '<path d="' + PD + '" transform="translate(9 11)" fill="url(#caSide)"/>'
    + '<path d="' + PD + '" fill="url(#caBase)"/>'
    + '<g clip-path="url(#caClip)">'
    + '<rect width="512" height="512" fill="url(#caRim)"/>'
    + '<ellipse cx="190" cy="120" rx="230" ry="62" transform="rotate(24 190 120)" fill="url(#caShine)"/>'      /* kilau besar mengilap */
    + '<circle cx="82" cy="86" r="26" fill="#fff" opacity=".9" filter="url(#caBlur)"/>'                      /* titik pantulan terang di ujung */
    + '<path d="' + PD + '" fill="none" stroke="url(#caShine)" stroke-width="14"/>'                           /* garis cahaya di tepi */
    + '</g></svg>';

  var arrow = document.createElement('div'); arrow.className = 'arrow';
  var sway = document.createElement('div'); sway.className = 'arrow-in';
  var flip = document.createElement('div'); flip.className = 'arrow-3d';
  var org = TIP + 'px ' + TIP + 'px';
  sway.style.cssText = 'width:' + ARROW_SIZE + 'px;height:' + ARROW_SIZE + 'px;margin:' + (-TIP) + 'px 0 0 ' + (-TIP) + 'px;transform-origin:' + org;
  flip.style.transformOrigin = org; flip.innerHTML = ARROW_SVG;
  sway.appendChild(flip); arrow.appendChild(sway);
  var ring = document.createElement('div'); ring.className = 'ring'; ring.textContent = 'View';
  var dustCv = document.createElement('canvas'); dustCv.className = 'dust';
  var dctx = dustCv.getContext('2d');
  document.body.append(dustCv, ring, arrow);
  document.documentElement.classList.add('has-cursor');

  /* ----- Putar terbalik seperti "welcome": 0 -> 180 (ditahan sebentar) -> 360, lalu istirahat. Berputar pada sumbu tengah panah, ujungnya tetap di titik klik ----- */
  var shown = false;
  async function arrowFlip() {
    var E = 'cubic-bezier(.65,0,.35,1)', A = 'rotate(44deg) perspective(500px) rotateX(', Z = 'deg) rotate(-44deg)';
    var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    while (true) {
      if (!shown) { await sleep(300); continue; }
      await flip.animate([
        { transform: A + '0' + Z, easing: E },
        { transform: A + '180' + Z, offset: .38, easing: 'linear' },
        { transform: A + '180' + Z, offset: .62, easing: E },
        { transform: A + '360' + Z }
      ], { duration: 1500 }).finished.catch(function () {});
      await sleep(1400);
    }
  }
  if (ARROW_FLIP && !reduce && flip.animate) arrowFlip();

  /* ----- Debu & asap berwarna: muncul di belakang kursor saat digerakkan ----- */
  var sprites = DUST_COLORS.map(function (c) {
    var cv = document.createElement('canvas'); cv.width = cv.height = 64;
    var g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(' + c + ',1)'); gr.addColorStop(.4, 'rgba(' + c + ',.5)'); gr.addColorStop(1, 'rgba(' + c + ',0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return cv;
  });
  var parts = [], acc = 0, ci = 0;
  var x = 0, y = 0, rx = 0, ry = 0, lastX = 0, lastY = 0, svx = 0, svy = 0, ang = 0, lastT = performance.now();

  function fitCanvas() {
    var d = window.devicePixelRatio || 1;
    dustCv.width = innerWidth * d; dustCv.height = innerHeight * d; dctx.setTransform(d, 0, 0, d, 0, 0);
  }
  fitCanvas();
  window.addEventListener('resize', fitCanvas);

  function spawn(px, py) {
    var smoke = Math.random() < .68;                    /* asap lembut besar, atau butiran debu kecil */
    ci = (ci + 1 + Math.floor(Math.random() * 3)) % DUST_COLORS.length;
    parts.push({
      s: smoke, c: ci, x: px + (Math.random() - .5) * 8, y: py + (Math.random() - .5) * 8, age: 0, seed: Math.random() * 6.28,
      life: smoke ? .9 + Math.random() * .9 : .5 + Math.random() * .7,
      vx: (Math.random() - .5) * 40 - svx * .03, vy: (Math.random() - .5) * 40 - 14 - svy * .03,
      size: smoke ? 7 + Math.random() * 9 : 1.2 + Math.random() * 1.8
    });
  }

  window.addEventListener('mousemove', function (e) {
    x = e.clientX; y = e.clientY;
    if (!shown) { lastX = x; lastY = y; rx = x; ry = y; }
    shown = true;
    arrow.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    arrow.classList.add('show'); ring.classList.add('show');
  });
  document.addEventListener('mouseleave', function () {
    arrow.classList.remove('show'); ring.classList.remove('show'); shown = false;
  });

  /* ----- Loop animasi: dijalankan setiap frame ----- */
  var prevX = 0, prevY = 0;
  (function frame(now) {
    var dt = Math.min(.05, Math.max(.001, (now - lastT) / 1000)); lastT = now;
    svx += ((x - lastX) / dt - svx) * .25; svy += ((y - lastY) / dt - svy) * .25;
    var segX0 = lastX, segY0 = lastY; lastX = x; lastY = y;
    var speed = Math.hypot(svx, svy);

    rx += (x - rx) * (reduce ? 1 : 0.18); ry += (y - ry) * (reduce ? 1 : 0.18);
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';

    if (!reduce) {
      ang += (Math.max(-18, Math.min(18, svx * SWAY)) - ang) * .14;       /* panah miring sedikit mengikuti arah gerak */
      sway.style.transform = 'rotate(' + ang.toFixed(2) + 'deg)';

      dctx.clearRect(0, 0, innerWidth, innerHeight);
      if (shown && DUST_AMOUNT > 0) {
        acc += Math.min(speed, 2500) * dt * .09 * DUST_AMOUNT;
        while (acc >= 1 && parts.length < 420) { var t0 = Math.random(); spawn(segX0 + (x - segX0) * t0 + 3, segY0 + (y - segY0) * t0 + 4); acc -= 1; }
        acc = Math.min(acc, 6);
      }
      dctx.globalCompositeOperation = 'lighter';
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i]; p.age += dt;
        if (p.age >= p.life) { parts.splice(i, 1); continue; }
        var t = p.age / p.life;
        p.vx += Math.sin(now / 260 + p.seed) * 30 * dt; p.vy += (Math.cos(now / 310 + p.seed) * 22 - 10) * dt;   /* melayang berputar-putar pelan */
        p.vx *= 1 - dt * 1.4; p.vy *= 1 - dt * 1.4;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.s) {
          var s = p.size * (1 + t * 2.4);                                   /* asap makin lebar, makin pudar */
          dctx.globalAlpha = Math.pow(1 - t, 1.5) * .62;
          dctx.drawImage(sprites[p.c], p.x - s, p.y - s, s * 2, s * 2);
        } else {
          var d = p.size * (1 - t * .4);
          dctx.globalAlpha = (1 - t) * (.7 + .3 * Math.sin(now / 45 + p.seed * 5));   /* debu berkelip */
          dctx.drawImage(sprites[p.c], p.x - d * 2, p.y - d * 2, d * 4, d * 4);
        }
      }
      dctx.globalAlpha = 1; dctx.globalCompositeOperation = 'source-over';
    }
    requestAnimationFrame(frame);
  })(performance.now());

  // lingkaran berubah bentuk saat di atas link atau kartu project
  document.addEventListener('mouseover', function (e) {
    var onCard = e.target.closest('.card');
    var onLink = e.target.closest('a, button');
    ring.classList.toggle('is-view', !!onCard);
    ring.classList.toggle('is-link', !!onLink && !onCard);
  });
}

/* ===== 1e. Shape geometris: muncul (pop) lalu bergerak terus. Butuh GSAP; gerakan dipilih lewat data-m di index.html ===== */
(function () {
  var shapes = document.querySelectorAll('.shp'), hero = document.querySelector('.hero2');
  if (!window.gsap || !shapes.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var MOVE = {
    spin:  function (e) { gsap.to(e, { rotation: '+=360', duration: 16, ease: 'none', repeat: -1 }); },                          /* berputar terus */
    swing: function (e) { gsap.to(e, { rotation: 24, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }); },           /* mengayun kiri-kanan */
    pulse: function (e) { gsap.to(e, { scale: 1.18, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }); },            /* membesar-mengecil */
    pop:   function (e) { gsap.timeline({ repeat: -1, repeatDelay: 1.6 })                                                       /* meletup lalu memantul */
             .to(e, { scale: 1.3, rotation: '+=90', duration: .35, ease: 'power2.out' }).to(e, { scale: 1, duration: 1.2, ease: 'elastic.out(1,.35)' }); }
  };
  shapes.forEach(function (e, i) {
    gsap.from(e, { scale: 0, rotation: -200, opacity: 0, duration: 1.1, ease: 'back.out(2.2)', delay: .7 + i * .12,
      onComplete: function () { (MOVE[e.dataset.m] || MOVE.spin)(e); } });
  });
  /* hemat tenaga: semua animasi dijeda saat halaman headline sudah tidak terlihat */
  var resumeEl = document.querySelector('#resume'), seen = new Map();
  if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (en) { en.forEach(function (e) { seen.set(e.target, e.isIntersecting); }); gsap.globalTimeline.paused(![...seen.values()].some(Boolean)); }); [hero, resumeEl].forEach(function (t) { if (t) io.observe(t); }); }
})();

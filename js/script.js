/* =====================================================================
   script.js  —  GERAKAN & INTERAKSI website
   Isinya: running text, headline yang bergerak saat scroll, posisi "© 2026",
   dan kursor tangan api. Dipanggil dari index.html di paling bawah:
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

/* ===== 2. Efek kursor (hanya untuk perangkat dengan mouse) ===== */
var hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (hasMouse) {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ===== KURSOR TANGAN API ===== */
  var HAND_SRC = 'images/hand-fire.webp';  /* gambar kursor tangan api (ada di folder images) */
  var HAND_W = 28;                                    /* lebar kursor (px). Kursor biasa sekitar 28-32px. Cukup ubah angka ini saja */
  var HAND_H = Math.round(HAND_W * 1.592);            /* tinggi dihitung otomatis dari lebar */
  var TIP_X = Math.round(HAND_W * 0.346), TIP_Y = 0;  /* ujung jari telunjuk = titik klik (dihitung otomatis) */
  var K = HAND_W / 60;                                /* faktor skala untuk gelombang api */
  function nf(v) { return (v * 60 / HAND_W).toFixed(3); } /* frekuensi gelombang menyesuaikan ukuran kursor */
  var PAINT_TRAIL = false;        /* true = munculkan juga goresan cat biru di belakang kursor */

  /* filter SVG yang membuat api bergelombang. Besar gelombangnya (scale) dinaikkan saat kursor bergerak cepat */
  document.body.insertAdjacentHTML('beforeend',
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="flameWave" x="-25%" y="-25%" width="150%" height="150%">'
    + '<feTurbulence type="fractalNoise" baseFrequency="' + nf(.02) + ' ' + nf(.05) + '" numOctaves="2" seed="4" result="n">'
    + '<animate attributeName="baseFrequency" dur="2.4s" values="' + nf(.02) + ' ' + nf(.05) + ';' + nf(.03) + ' ' + nf(.085) + ';' + nf(.02) + ' ' + nf(.05) + '" repeatCount="indefinite"/></feTurbulence>'
    + '<feDisplacementMap id="flameDisp" in="SourceGraphic" in2="n" scale="' + (4 * K).toFixed(1) + '" xChannelSelector="R" yChannelSelector="G"/></filter></svg>');
  var dispMap = document.getElementById('flameDisp');

  var hand = document.createElement('div'); hand.className = 'hand';
  var inner = document.createElement('div'); inner.className = 'hand-in';
  inner.style.cssText = 'width:' + HAND_W + 'px;height:' + HAND_H + 'px;margin:' + (-TIP_Y) + 'px 0 0 ' + (-TIP_X) + 'px;transform-origin:' + TIP_X + 'px ' + TIP_Y + 'px';
  ['h-top', 'h-fire'].forEach(function (c) {
    var im = new Image(); im.className = c; im.alt = ''; im.src = HAND_SRC; inner.appendChild(im);
  });
  hand.appendChild(inner);
  var ring = document.createElement('div'); ring.className = 'ring'; ring.textContent = 'View';
  var fireCv = document.createElement('canvas'); fireCv.className = 'fire';
  var fctx = fireCv.getContext('2d');
  document.body.append(fireCv, ring, hand);
  document.documentElement.classList.add('has-cursor');

  /* ----- Api: lidah api panas (putih-kuning di inti, merah di ujung), bunga api, dan cahaya hangat ----- */
  var FIRE_COLORS = ['255,255,225', '255,235,130', '255,190,60', '255,130,25', '235,70,12', '170,30,10', '90,15,8']; /* dari paling panas ke paling dingin */
  var sprites = FIRE_COLORS.map(function (c) {
    var cv = document.createElement('canvas'); cv.width = cv.height = 64;
    var g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(' + c + ',1)'); gr.addColorStop(.35, 'rgba(' + c + ',.6)'); gr.addColorStop(1, 'rgba(' + c + ',0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return cv;
  });
  var FIRE_RATE = 140;    /* jumlah lidah api per detik saat kursor diam */
  var FIRE_SIZE = 1.4;    /* ukuran api: 1 kecil, 2 besar */
  var FIRE_RISE = 1;      /* tinggi kobaran: 0.6 pendek, 1.6 tinggi */
  var EMBERS = 0.1;       /* proporsi bunga api (percikan kecil yang terang dan beterbangan) */
  var GLOW = 0.3;         /* kekuatan cahaya hangat di sekeliling tangan (0 = mati) */
  var WIND = 0.35;        /* seberapa kuat api tertiup saat kursor digeser (0 = tidak tertiup) */
  var SWAY = 0.012;       /* seberapa miring tangan saat kursor digeser */
  var parts = [], acc = 0, ex = 0, ey = 0;   /* ex, ey = pusat api pada tangan */

  var x = 0, y = 0, rx = 0, ry = 0, shown = false;
  var lastX = 0, lastY = 0, svx = 0, svy = 0, ang = 0, lastT = performance.now(), lastScale = 4 * K;

  function fitCanvas(c, g) {
    var d = window.devicePixelRatio || 1;
    c.width = innerWidth * d; c.height = innerHeight * d; g.setTransform(d, 0, 0, d, 0, 0);
  }
  fitCanvas(fireCv, fctx);

  function handPoint(fx, fy) { /* titik pada tangan (pecahan lebar/tinggi), ikut miring mengikuti sudut tangan */
    var ox = fx * HAND_W - TIP_X, oy = fy * HAND_H - TIP_Y, a = ang * Math.PI / 180;
    return { x: x + ox * Math.cos(a) - oy * Math.sin(a), y: y + ox * Math.sin(a) + oy * Math.cos(a) };
  }
  function spawn() {
    var e = Math.random() < EMBERS;                                  /* bunga api atau lidah api */
    var pt = handPoint(.2 + Math.random() * .72, .55 + Math.random() * .4);
    parts.push({
      e: e, x: pt.x, y: pt.y, age: 0, seed: Math.random() * 6.28,
      life: e ? .9 + Math.random() * .9 : .5 + Math.random() * .5,
      vx: (Math.random() - .5) * (e ? 70 : 28),
      vy: -(e ? 70 + Math.random() * 90 : 45 + Math.random() * 65) * FIRE_RISE,
      size: e ? 1 + Math.random() * 1.3 : (2.4 + Math.random() * 3.8) * FIRE_SIZE
    });
  }

  /* ----- Goresan cat biru (opsional, mati secara bawaan) ----- */
  var pctx = null, pcv;
  var COLOR = '#2B45FF', BRUSH_MAX = 14, BRUSH_MIN = 3, SMOOTH = 0.35, SOFT = 3, FADE = 0.035;
  var sx = 0, sy = 0, px = null, py = null, mx0 = 0, my0 = 0, bw = BRUSH_MAX;
  if (PAINT_TRAIL) {
    pcv = document.createElement('canvas'); pcv.className = 'paint'; document.body.append(pcv);
    pctx = pcv.getContext('2d'); fitCanvas(pcv, pctx);
  }
  function paintStep() {
    if (!shown || reduce) return;
    if (px === null) { sx = px = mx0 = x; sy = py = my0 = y; return; }
    sx += (x - sx) * SMOOTH; sy += (y - sy) * SMOOTH;
    var d = Math.hypot(sx - px, sy - py);
    if (d < 0.4) return;
    bw += (Math.max(BRUSH_MIN, BRUSH_MAX - d * 0.5) - bw) * 0.25;
    var mx = (px + sx) / 2, my = (py + sy) / 2;
    pctx.strokeStyle = COLOR; pctx.shadowColor = COLOR; pctx.shadowBlur = SOFT;
    pctx.lineCap = 'round'; pctx.lineJoin = 'round'; pctx.lineWidth = bw;
    pctx.beginPath(); pctx.moveTo(mx0, my0); pctx.quadraticCurveTo(px, py, mx, my); pctx.stroke();
    mx0 = mx; my0 = my; px = sx; py = sy;
  }

  window.addEventListener('resize', function () { fitCanvas(fireCv, fctx); if (pctx) fitCanvas(pcv, pctx); });

  window.addEventListener('mousemove', function (e) {
    x = e.clientX; y = e.clientY;
    if (!shown) { lastX = x; lastY = y; rx = x; ry = y; }
    shown = true;
    hand.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    hand.classList.add('show'); ring.classList.add('show');
  });
  document.addEventListener('mouseleave', function () {
    hand.classList.remove('show'); ring.classList.remove('show'); px = null; shown = false;
  });

  /* ----- Loop animasi: dijalankan setiap frame ----- */
  (function frame(now) {
    var dt = Math.min(.05, Math.max(.001, (now - lastT) / 1000)); lastT = now;

    /* kecepatan kursor (dihaluskan) */
    svx += ((x - lastX) / dt - svx) * .25; svy += ((y - lastY) / dt - svy) * .25;
    lastX = x; lastY = y;
    var speed = Math.hypot(svx, svy);

    rx += (x - rx) * (reduce ? 1 : 0.18); ry += (y - ry) * (reduce ? 1 : 0.18);
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';

    fctx.clearRect(0, 0, innerWidth, innerHeight);

    if (!reduce) {
      /* tangan miring melawan arah gerak, api makin bergelombang kalau kursor cepat */
      ang += (Math.max(-30, Math.min(30, svx * SWAY)) - ang) * .14;
      var flutter = Math.sin(now / 90) * Math.min(3, speed / 400);
      inner.style.transform = 'rotate(' + (ang + flutter).toFixed(2) + 'deg)';
      var sc = (4 + Math.min(speed, 2500) * .005) * K;
      if (Math.abs(sc - lastScale) > .1) { dispMap.setAttribute('scale', sc.toFixed(2)); lastScale = sc; }

      var c = handPoint(.55, .78); ex = c.x; ey = c.y;   /* pusat api */

      /* lahirkan lidah api & bunga api baru; jumlahnya berdenyut sedikit supaya nyalanya hidup */
      if (shown) {
        acc += (FIRE_RATE + Math.min(speed, 2000) * .1) * (1 + .25 * Math.sin(now / 80) + .15 * Math.sin(now / 37)) * dt;
        while (acc >= 1 && parts.length < 520) { spawn(); acc -= 1; }
        acc = Math.min(acc, 4);
      }

      fctx.globalCompositeOperation = 'lighter';

      /* cahaya hangat di sekeliling tangan, berkedip */
      if (shown && GLOW > 0) {
        var gr = HAND_H * (1.05 + .1 * Math.sin(now / 130) + .06 * Math.sin(now / 53));
        fctx.globalAlpha = GLOW + .08 * Math.sin(now / 90);
        fctx.drawImage(sprites[3], ex - gr, ey - HAND_H * .15 - gr, gr * 2, gr * 2);
      }

      /* gerakkan & gambar partikel */
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i]; p.age += dt;
        if (p.age >= p.life) { parts.splice(i, 1); continue; }
        var t = p.age / p.life;
        if (p.e) {
          /* bunga api: beterbangan acak, terbawa angin, berkelip */
          p.vx += (-svx * WIND * .5 - p.vx) * Math.min(1, dt * 1.5) + Math.sin(now / 90 + p.seed) * 60 * dt;
          p.vy += (-svy * WIND * .4 - 60 - p.vy) * Math.min(1, dt * 1.2);
        } else {
          /* lidah api: menyempit ke atas, bergoyang seperti kobaran, condong ke arah angin */
          p.vx += (ex - p.x) * 14 * t * dt;
          p.vx += (-svx * WIND - p.vx) * Math.min(1, dt * 2.5) + Math.sin(now / 110 + p.seed * 3) * 55 * dt;
          p.vy += (-svy * WIND * .5 - 70 * FIRE_RISE - p.vy) * Math.min(1, dt * 2);
        }
        p.x += p.vx * dt; p.y += p.vy * dt;

        if (p.e) {
          var es = p.size * (1 - t * .3);
          fctx.globalAlpha = (1 - t) * (.65 + .35 * Math.sin(now / 40 + p.seed * 5));
          fctx.drawImage(sprites[1], p.x - es, p.y - es, es * 2, es * 2);
        } else {
          var w = p.size * (1 - t * .6) * .85, h = p.size * (1 - t * .5) * (1.3 + .4 * (1 - t));  /* memanjang ke atas seperti lidah api */
          fctx.globalAlpha = Math.pow(1 - t, 1.2) * .8;
          fctx.drawImage(sprites[Math.min(sprites.length - 1, Math.floor(t * sprites.length))], p.x - w, p.y - h, w * 2, h * 2);
        }
      }
      fctx.globalAlpha = 1; fctx.globalCompositeOperation = 'source-over';
    }

    if (pctx) {
      pctx.shadowBlur = 0; pctx.globalCompositeOperation = 'destination-out'; pctx.globalAlpha = FADE;
      pctx.fillRect(0, 0, innerWidth, innerHeight);
      pctx.globalCompositeOperation = 'source-over'; pctx.globalAlpha = 1;
      paintStep();
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

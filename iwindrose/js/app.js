/* ============================================================
   iWindRose² — Main JS
   ============================================================ */

/* ——— CONFIG ——— */
const APP_STORE_URL = 'https://itunes.apple.com/app/iwindrose/id1403142267';
const SUPPORT_URL = '../#contact';
const CACHE_VER = new URL(document.currentScript?.src || window.location.href).searchParams.get('v') || 'dev';
const IWINDROSE_HERO_VIDEO = {
  vimeoId: '349940943',
  title: 'iWindRose 3.3.0 - Promo video',
};
const IWINDROSE_GALLERY_VIDEO = {
  vimeoId: '335268506',
  title: 'iWindRose 3.0.0 preview (iPhone XS)',
};

/* ——— Feature icon colors ——— */
const FEATURE_COLORS = {
  windrose: { bg: 'rgba(232,106,51,0.12)', color: '#E86A33' },
  weather: { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6' },
  'sun-moon': { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
  tides: { bg: 'rgba(6,182,212,0.12)', color: '#06B6D4' },
  meteomar: { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
  lamma: { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
  scales: { bg: 'rgba(236,72,153,0.12)', color: '#EC4899' },
  position: { bg: 'rgba(232,106,51,0.12)', color: '#E86A33' },
  widgets: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
  shortcuts: { bg: 'rgba(236,72,153,0.12)', color: '#EC4899' },
  notifications: { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
  export: { bg: 'rgba(6,182,212,0.12)', color: '#06B6D4' },
};

const COMPAT_GRADIENTS = {
  iPhone: 'linear-gradient(135deg,#E86A33,#F59E0B)',
  iPad: 'linear-gradient(135deg,#8B5CF6,#E86A33)',
  'Apple Watch': 'linear-gradient(135deg,#EC4899,#8B5CF6)',
};

/* ============================================================
   DATA LOADER
   ============================================================ */

async function loadJSON(path) {
  try {
    const res = await fetch(`${path}?v=${CACHE_VER}`);
    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch {
    console.warn(`[iWindRose] Could not fetch ${path} – check CORS or use a static server.`);
    return null;
  }
}

/* ============================================================
   VIMEO WARMUP — apre DNS + TLS verso Vimeo on-demand
   ============================================================ */
/* Nessun contatto con Vimeo al caricamento pagina. Scaldiamo la connessione
   solo quando un video sta per servire (intenzione dell'utente sull'hero, o
   iframe della gallery in arrivo), così il primo frame parte più in fretta
   senza handshake a freddo. Il flag garantisce un solo preconnect per sessione. */
let _vimeoWarmed = false;

function warmupVimeo() {
  if (_vimeoWarmed) return;
  _vimeoWarmed = true;
  [
    'https://player.vimeo.com',
    'https://i.vimeocdn.com',
    'https://f.vimeocdn.com',
  ].forEach(origin => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/* ============================================================
   LAZY MEDIA
   ============================================================ */
let lazyMediaObserver = null;

function loadLazyMedia(el) {
  if (!el?.dataset.lazySrc) return;
  /* Se sta per caricarsi un iframe Vimeo, apri prima le connessioni: le
     risorse secondarie del player (i/f.vimeocdn) partiranno senza attesa. */
  if (el.dataset.lazySrc.includes('vimeo.com')) warmupVimeo();
  el.src = el.dataset.lazySrc;
  el.removeAttribute('data-lazy-src');
  el.dataset.lazyLoaded = 'true';
}

function observeLazyMedia(scope = document) {
  const media = scope.querySelectorAll('[data-lazy-src]:not([data-lazy-loaded])');
  if (!media.length) return;

  if (!('IntersectionObserver' in window)) {
    media.forEach(loadLazyMedia);
    return;
  }

  if (!lazyMediaObserver) {
    lazyMediaObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        loadLazyMedia(entry.target);
        lazyMediaObserver.unobserve(entry.target);
      });
    }, { rootMargin: '420px 0px', threshold: 0.01 });
  }

  media.forEach(el => lazyMediaObserver.observe(el));
}

/* ============================================================
   HERO VIDEO
   ============================================================ */
function initHeroVideo() {
  const frame = document.getElementById('hero-video-frame');
  const playButton = document.getElementById('hero-video-play');
  if (!frame || !playButton) return;

  /* Facade pattern: niente viene caricato da Vimeo finché non si preme play.
     Per rendere reattivo quel primo click, scaldiamo la connessione verso Vimeo
     (warmupVimeo, condivisa) solo quando l'utente mostra intenzione di guardare
     (hover / focus / touch sul bottone), NON al caricamento della pagina. */
  playButton.addEventListener('pointerenter', warmupVimeo, { once: true });
  playButton.addEventListener('focus', warmupVimeo, { once: true });
  playButton.addEventListener('touchstart', warmupVimeo, { once: true, passive: true });

  playButton.addEventListener('click', () => {
    if (frame.classList.contains('is-playing')) return;

    const iframe = document.createElement('iframe');
    iframe.className = 'hero-video-iframe';
    iframe.src = `https://player.vimeo.com/video/${IWINDROSE_HERO_VIDEO.vimeoId}?badge=0&autopause=0&player_id=vimeo-hero&app_id=58479&autoplay=1`;
    iframe.title = IWINDROSE_HERO_VIDEO.title;
    iframe.loading = 'eager';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;

    frame.classList.add('is-playing');
    frame.appendChild(iframe);
    playButton.remove();
  });
}

/* ============================================================
   RENDER — FEATURES
   ============================================================ */
async function renderFeatures() {
  const data = await loadJSON('data/features.json');
  const grid = document.getElementById('features-grid');
  if (!grid || !data) return;

  const isEn = _currentLang === 'en';
  grid.innerHTML = data.map((f, i) => {
    const c = FEATURE_COLORS[f.id] || { bg: 'rgba(232,106,51,0.12)', color: '#E86A33' };
    const title = (isEn && f.title_en) ? f.title_en : f.title;
    const desc = (isEn && f.description_en) ? f.description_en : f.description;
    return `
      <div class="glass-card feature-card reveal reveal-delay-${(i % 5) + 1}">
        <div class="feature-icon" style="background:${c.bg}; color:${c.color}">
          ${icon(f.icon)}
        </div>
        <div class="feature-title">${title.toUpperCase()}</div>
        <div class="feature-desc">${desc}</div>
      </div>`;
  }).join('');

  observeReveal();
}

/* ============================================================
   RENDER — COMPATIBILITY
   ============================================================ */
async function renderCompatibility() {
  const data = await loadJSON('data/compatibility.json');
  const grid = document.getElementById('compat-grid');
  if (!grid || !data) return;

  const isEn = _currentLang === 'en';
  grid.innerHTML = data.map((c, i) => {
    const grad = COMPAT_GRADIENTS[c.device] || 'linear-gradient(135deg,#E86A33,#D97706)';
    const desc = (isEn && c.description_en) ? c.description_en : c.description;
    return `
      <div class="glass-card compat-card reveal reveal-delay-${i + 1}">
        <div class="compat-icon" style="background:${grad}">
          ${icon(c.icon)}
        </div>
        <div class="compat-device">${c.device}</div>
        <div class="compat-req">${c.requirement}</div>
        <div class="compat-desc">${desc}</div>
      </div>`;
  }).join('');

  observeReveal();
}

/* ============================================================
   RENDER — GALLERY
   ============================================================ */
async function renderGallery() {
  const data = await loadJSON('data/gallery.json');
  const container = document.getElementById('gallery-container');
  const tabsEl = document.getElementById('gallery-tabs');
  if (!container || !data) return;

  const sections = Object.entries(data);

  /* build tabs */
  tabsEl.innerHTML = sections.map(([key, sec], i) => `
    <button class="gallery-tab${i === 0 ? ' active' : ''}"
            data-tab="${key}">${sec.label}</button>
  `).join('');

  /* build panels */
  container.innerHTML = sections.map(([key, sec], i) => {
    const gridClass = key === 'ipad' ? 'ipad-grid'
      : key === 'watch' ? 'watch-grid' : '';
    const ratio = key === 'ipad' ? '2560/1919'
      : key === 'watch' ? '242/296' : '499/1080';

    const thumbs = sec.screenshots.map(s => `
      <div class="gallery-thumb" style="--thumb-ratio:${ratio}" role="button"
           tabindex="0"
           aria-label="${s.alt}"
           data-src="${s.url}" data-alt="${s.alt}">
        <img data-lazy-src="${s.url}" alt="${s.alt}" loading="lazy" decoding="async">
      </div>`).join('');

    /* Anteponi la card video solo al pannello iPhone */
    const videoHtml = key === 'iphone' ? `
      <div class="gallery-thumb is-video" style="--thumb-ratio:${ratio}" aria-label="${IWINDROSE_GALLERY_VIDEO.title}">
        <div class="gallery-video-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Video
        </div>
        <div class="gallery-video-wrap">
          <iframe id="vimeo-preview"
                  data-lazy-src="https://player.vimeo.com/video/${IWINDROSE_GALLERY_VIDEO.vimeoId}?badge=0&autopause=0&player_id=vimeo-preview&app_id=58479&loop=1&muted=1"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  referrerpolicy="strict-origin-when-cross-origin"
                  title="${IWINDROSE_GALLERY_VIDEO.title}"
                  loading="lazy"></iframe>
        </div>
      </div>` : '';

    return `
      <div class="gallery-panel${i === 0 ? ' active' : ''}" data-panel="${key}">
        <div class="gallery-grid ${gridClass}">${videoHtml}${thumbs}</div>
      </div>`;
  }).join('');

  observeLazyMedia(container.querySelector('.gallery-panel.active'));

  /* tabs click */
  tabsEl.addEventListener('click', e => {
    const btn = e.target.closest('.gallery-tab');
    if (!btn) return;
    tabsEl.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const panelKey = btn.dataset.tab;
    container.querySelectorAll('.gallery-panel').forEach(p => {
      p.classList.toggle('active', p.dataset.panel === panelKey);
    });
    observeLazyMedia(container.querySelector(`.gallery-panel[data-panel="${panelKey}"]`));
  });

  /* lightbox */
  container.addEventListener('click', e => {
    const thumb = e.target.closest('.gallery-thumb');
    if (!thumb || thumb.classList.contains('is-video')) return;
    const panel = thumb.closest('.gallery-panel');
    const thumbs = Array.from(panel.querySelectorAll('.gallery-thumb:not(.is-video)'));
    const idx = thumbs.indexOf(thumb);
    openLightbox(thumbs, idx);
  });

  container.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const thumb = e.target.closest('.gallery-thumb');
      if (!thumb || thumb.classList.contains('is-video')) return;
      const panel = thumb.closest('.gallery-panel');
      const thumbs = Array.from(panel.querySelectorAll('.gallery-thumb:not(.is-video)'));
      openLightbox(thumbs, thumbs.indexOf(thumb));
    }
  });
}

/* ============================================================
   RENDER — CHANGELOG
   ============================================================ */
async function renderChangelog() {
  const data = await loadJSON('data/changelog.json');
  const list = document.getElementById('changelog-list');
  if (!list || !data) return;

  const versionSpan = document.getElementById('hero-version');
  if (versionSpan && data[0]?.version) {
    versionSpan.textContent = data[0].version;
  }

  const isEn = _currentLang === 'en';

  function buildCard(item, delay) {
    const badge = (isEn && item.badge_en !== undefined) ? item.badge_en : item.badge;
    const highlights = (isEn && item.highlights_en) ? item.highlights_en : item.highlights;
    const badgeHtml = badge
      ? `<span class="changelog-badge">${badge}</span>`
      : '';
    const highlightsHtml = highlights.map(h =>
      `<li class="changelog-highlight">${h}</li>`
    ).join('');
    return `
      <div class="glass-card changelog-item reveal reveal-delay-${delay}">
        <div class="changelog-version-col">
          <div class="changelog-version">${item.version}</div>
          ${item.date ? `<div class="changelog-date">${item.date}</div>` : ''}
          ${badgeHtml}
        </div>
        <div style="width:1px;background:var(--border);margin-inline:0.25rem;align-self:stretch"></div>
        <div class="changelog-content">
          <ul class="changelog-highlights">${highlightsHtml}</ul>
        </div>
      </div>`;
  }

  const featured = data.slice(0, 2);
  const rest = data.slice(2);

  const featuredHtml = `
    <div class="changelog-featured reveal">
      ${featured.map((item, i) => buildCard(item, i + 1)).join('')}
    </div>`;

  const expandHtml = rest.length ? `
    <div class="changelog-expand-wrap">
      <button class="changelog-expand-btn" aria-expanded="false" aria-controls="changelog-older">
        <span class="changelog-expand-label">${t('changelog.expand')}</span>
        <span class="changelog-expand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>
      <div class="changelog-older" id="changelog-older" hidden></div>
    </div>` : '';

  list.innerHTML = featuredHtml + expandHtml;

  const btn = list.querySelector('.changelog-expand-btn');
  btn?.addEventListener('click', () => {
    const older = document.getElementById('changelog-older');
    /* render differito: popola le vecchie versioni solo alla prima apertura,
       così non gonfiano il DOM iniziale e non pesano sul main thread / TBT */
    if (!older.dataset.rendered) {
      older.innerHTML = rest.map((item, i) => buildCard(item, (i % 4) + 1)).join('');
      older.dataset.rendered = 'true';
    }
    const open = !older.hidden;
    older.hidden = open;
    btn.setAttribute('aria-expanded', String(!open));
    btn.querySelector('.changelog-expand-label').textContent =
      open ? t('changelog.expand') : t('changelog.collapse');
    btn.classList.toggle('open', !open);
    if (!open) {
      observeReveal();
    }
  });

  observeReveal();
}

/* ============================================================
   RENDER — PRESS
   ============================================================ */
async function renderPress() {
  const data = await loadJSON('data/press.json');
  const grid = document.getElementById('press-grid');
  if (!grid || !data) return;

  const youtubeIcon = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.1 2.7 12 2.7 12 2.7s-4.1 0-6.8.2c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.1.7 11.3v2c0 2.1.3 4.2.3 4.2s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.3 21.7 12 21.7 12 21.7s4.1 0 6.8-.3c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.1.3-4.2v-2C23.3 9.1 23 7 23 7zM9.7 15.5V8.4l8.1 3.6-8.1 3.5z"/></svg>`;
  const articleIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;

  grid.innerHTML = data.map((item, i) => {
    const isVideo = item.type === 'video';
    const iconHtml = isVideo ? youtubeIcon : articleIcon;
    const iconStyle = isVideo
      ? 'background:rgba(255,0,0,0.1);color:#FF4444;'
      : 'background:rgba(232,106,51,0.1);color:var(--accent-orange);';
    return `
      <a href="${item.url}" target="_blank" rel="noopener"
         class="glass-card press-card reveal reveal-delay-${(i % 4) + 1}">
        <div class="press-icon" style="${iconStyle}">${iconHtml}</div>
        <div class="press-body">
          <div class="press-title">${item.title}</div>
          <div class="press-meta">
            ${item.source} · <span class="press-meta-lang">${item.lang}</span>
          </div>
        </div>
      </a>`;
  }).join('');

  observeReveal();
}

/* ============================================================
   LIGHTBOX
   ============================================================ */
let _lbThumbs = [];
let _lbIdx = 0;

function openLightbox(thumbs, idx) {
  _lbThumbs = thumbs;
  _lbIdx = idx;
  _lbRender();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function _lbRender() {
  const lb = document.getElementById('lightbox');
  const img = lb.querySelector('.lightbox-img');
  const th = _lbThumbs[_lbIdx];
  img.src = th.dataset.src;
  img.alt = th.dataset.alt;

  const hasPrev = _lbIdx > 0;
  const hasNext = _lbIdx < _lbThumbs.length - 1;
  lb.querySelector('.lightbox-prev').style.display = hasPrev ? 'grid' : 'none';
  lb.querySelector('.lightbox-next').style.display = hasNext ? 'grid' : 'none';

  lb.querySelector('.lightbox-counter').textContent =
    `${_lbIdx + 1} / ${_lbThumbs.length}`;
}

function _lbNav(dir) {
  const next = _lbIdx + dir;
  if (next < 0 || next >= _lbThumbs.length) return;
  _lbIdx = next;
  _lbRender();
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
  _lbThumbs = [];
  _lbIdx = 0;
}

/* ============================================================
   INTERSECTION OBSERVER — Scroll reveal
   ============================================================ */
let revealObserver = null;

function observeReveal() {
  if (revealObserver) {
    document.querySelectorAll('.reveal:not(.observed)').forEach(el => {
      el.classList.add('observed');
      revealObserver.observe(el);
    });
    return;
  }

  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('observed');
    revealObserver.observe(el);
  });
}

/* ============================================================
   NAV
   ============================================================ */
function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-mobile-toggle');
  const links = document.querySelector('.nav-links');

  nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  toggle?.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });

  links?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
    });
  });
}

/* ============================================================
   I18N
   ============================================================ */
let _strings = {};
let _currentLang = 'it';

async function initI18n() {
  const data = await loadJSON('data/i18n.json');
  if (!data) return;

  const saved = localStorage.getItem('site_lang');
  const browser = navigator.language?.slice(0, 2).toLowerCase();
  _currentLang = saved || (browser === 'it' ? 'it' : 'en');

  _strings = data;
  applyLang(_currentLang, false);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang === _currentLang) return;
      _currentLang = lang;
      localStorage.setItem('site_lang', lang);
      applyLang(lang);
    });
  });
}

function t(key) {
  return (_strings[_currentLang]?.[key]) ?? (_strings['it']?.[key]) ?? key;
}

function applyLang(lang, rerenderDynamic = true) {
  const strings = _strings[lang] || _strings['it'];
  document.documentElement.lang = lang;

  document.querySelectorAll('.lang-btn').forEach(btn => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = strings[key];
    if (val === undefined) return;

    if (key === 'hero.badge') {
      const ver = document.getElementById('hero-version')?.textContent || '…';
      el.innerHTML = val.replace('{version}', `<span id="hero-version">${ver}</span>`);
      return;
    }
    if (key === 'hero.rating') {
      const count = el.dataset.count || '—';
      el.textContent = val.replace('{count}', count);
      return;
    }
    el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    const val = strings[key];
    if (val) el.setAttribute('aria-label', val);
  });

  document.querySelectorAll('[data-i18n-src]').forEach(el => {
    const src = el.getAttribute('src');
    const newSrc = src.replace(/\/(it|en)\//, `/${lang}/`);
    if (newSrc !== src) el.setAttribute('src', newSrc);
  });

  if (rerenderDynamic && _strings[lang]) {
    renderFeatures();
    renderCompatibility();
    renderChangelog();
  }
}

/* ============================================================
   SET App Store Links
   ============================================================ */
function initLinks() {
  document.querySelectorAll('[data-appstore]').forEach(el => {
    el.href = APP_STORE_URL;
  });
  document.querySelectorAll('[data-support]').forEach(el => {
    el.href = SUPPORT_URL;
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  initLinks();
  initHeroVideo();
  await initI18n();

  /* Lightbox */
  const lb = document.getElementById('lightbox');
  lb?.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  lb?.querySelector('.lightbox-prev')?.addEventListener('click', () => _lbNav(-1));
  lb?.querySelector('.lightbox-next')?.addEventListener('click', () => _lbNav(+1));
  lb?.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') _lbNav(-1);
    if (e.key === 'ArrowRight') _lbNav(+1);
  });

  /* Changelog is the heaviest JSON (~15 KB) and sits below the fold. Kick it
     off now so it downloads in parallel, but don't block the critical render on
     it — it self-registers its reveal elements when done. The hero version
     badge it fills in updates as soon as the fetch resolves. */
  renderChangelog();

  /* Render the above-the-fold dynamic sections in parallel */
  await Promise.all([
    renderFeatures(),
    renderCompatibility(),
    renderGallery(),
    renderPress(),
  ]);

  /* Final observe for static reveal elements */
  observeReveal();

  /* Scroll to hash anchor after all dynamic content is rendered */
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: 'instant' });
        });
      });
    }
  }
});

/* ============================================================
   VIMEO — avvio on-scroll, loop
   ============================================================ */
function initVimeoObserver() {
  const iframe = document.getElementById('vimeo-preview');
  if (!iframe) return;

  function getPlayer() {
    if (typeof Vimeo === 'undefined' || !Vimeo.Player) return null;
    return new Vimeo.Player(iframe);
  }

  let player = null;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!player) player = getPlayer();
      if (!player) return;

      if (entry.isIntersecting) {
        player.play().catch(() => { });
      } else {
        player.pause().catch(() => { });
      }
    });
  }, { threshold: 0.3 });

  obs.observe(iframe);
}

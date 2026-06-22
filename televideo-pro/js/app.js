/* ============================================================
   Televideo² — Main JS
   ============================================================ */

/* ——— CONFIG ——— */
const SUPPORT_URL = '../#contact';
const CACHE_VER = new URL(document.currentScript?.src || window.location.href).searchParams.get('v') || 'dev';

/* ——— Feature icon colors ——— */
const FEATURE_COLORS = {
  'fast-access':    { bg: 'rgba(239,68,68,0.12)',   color: '#EF4444' },
  regions:          { bg: 'rgba(59,130,246,0.12)',   color: '#3B82F6' },
  favorites:        { bg: 'rgba(245,158,11,0.12)',   color: '#F59E0B' },
  'main-page':      { bg: 'rgba(16,185,129,0.12)',   color: '#10B981' },
  share:            { bg: 'rgba(139,92,246,0.12)',   color: '#8B5CF6' },
  subpages:         { bg: 'rgba(6,182,212,0.12)',    color: '#06B6D4' },
  'search-manual':  { bg: 'rgba(236,72,153,0.12)',   color: '#EC4899' },
  'search-text':    { bg: 'rgba(59,130,246,0.12)',   color: '#3B82F6' },
  swipe:            { bg: 'rgba(245,158,11,0.12)',   color: '#F59E0B' },
  'tap-nav':        { bg: 'rgba(139,92,246,0.12)',   color: '#8B5CF6' },
  history:          { bg: 'rgba(6,182,212,0.12)',    color: '#06B6D4' },
  icloud:           { bg: 'rgba(59,130,246,0.12)',   color: '#3B82F6' },
  rolling:          { bg: 'rgba(16,185,129,0.12)',   color: '#10B981' },
  siri:             { bg: 'rgba(236,72,153,0.12)',   color: '#EC4899' },
  zoom:             { bg: 'rgba(245,158,11,0.12)',   color: '#F59E0B' },
  'widget-nc':      { bg: 'rgba(139,92,246,0.12)',   color: '#8B5CF6' },
  'widget-home':    { bg: 'rgba(6,182,212,0.12)',    color: '#06B6D4' },
  notifications:    { bg: 'rgba(236,72,153,0.12)',   color: '#EC4899' },
  watch:            { bg: 'rgba(16,185,129,0.12)',   color: '#10B981' },
  appletv:          { bg: 'rgba(107,114,128,0.12)',  color: '#6B7280' },
};

const COMPAT_GRADIENTS = {
  iPhone:        'linear-gradient(135deg,#EF4444,#B91C1C)',
  iPad:          'linear-gradient(135deg,#3B82F6,#06B6D4)',
  'Apple Watch': 'linear-gradient(135deg,#EC4899,#8B5CF6)',
  'Apple TV':    'linear-gradient(135deg,#6B7280,#4B5563)',
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
    console.warn(`[Televideo] Could not fetch ${path} – check CORS or use a static server.`);
    return null;
  }
}

/* ============================================================
   LAZY MEDIA
   ============================================================ */
let lazyMediaObserver = null;

function loadLazyMedia(el) {
  if (!el?.dataset.lazySrc) return;
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
   RENDER — FEATURES
   ============================================================ */
async function renderFeatures() {
  const data = await loadJSON('data/features.json');
  const grid = document.getElementById('features-grid');
  if (!grid || !data) return;

  const isEn = _currentLang === 'en';
  grid.innerHTML = data.map((f, i) => {
    const c = FEATURE_COLORS[f.id] || { bg: 'rgba(239,68,68,0.12)', color: '#EF4444' };
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
    const grad = COMPAT_GRADIENTS[c.device] || 'linear-gradient(135deg,#F59E0B,#EF4444)';
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

  tabsEl.innerHTML = sections.map(([key, sec], i) => `
    <button class="gallery-tab${i === 0 ? ' active' : ''}"
            data-tab="${key}">${sec.label}</button>
  `).join('');

  const IPHONE_VIDEO = {
    vimeoId: '366494700',
    title: 'Televideo² – Video preview',
  };

  container.innerHTML = sections.map(([key, sec], i) => {
    const gridClass = key === 'ipad' || key === 'appletv' ? 'ipad-grid'
      : key === 'watch' ? 'watch-grid' : '';
    const ratio = key === 'ipad' ? '2560/1919'
      : key === 'appletv' ? '16/9'
      : key === 'watch' ? '242/296' : '499/1080';

    const thumbs = sec.screenshots.map(s => `
      <div class="gallery-thumb" style="--thumb-ratio:${ratio}" role="button"
           tabindex="0"
           aria-label="${s.alt}"
           data-src="${s.url}" data-alt="${s.alt}">
        <img data-lazy-src="${s.url}" alt="${s.alt}" loading="lazy" decoding="async">
      </div>`).join('');

    const videoHtml = key === 'iphone' ? `
      <div class="gallery-thumb is-video" style="--thumb-ratio:${ratio}" aria-label="${IPHONE_VIDEO.title}">
        <div class="gallery-video-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Video
        </div>
        <div class="gallery-video-wrap">
          <iframe id="vimeo-preview"
                  src="https://player.vimeo.com/video/${IPHONE_VIDEO.vimeoId}?badge=0&autopause=0&player_id=vimeo-preview&app_id=58479&loop=1&muted=1"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  referrerpolicy="strict-origin-when-cross-origin"
                  title="${IPHONE_VIDEO.title}"
                  loading="lazy"></iframe>
        </div>
      </div>` : '';

    return `
      <div class="gallery-panel${i === 0 ? ' active' : ''}" data-panel="${key}">
        <div class="gallery-grid ${gridClass}">${videoHtml}${thumbs}</div>
      </div>`;
  }).join('');

  observeLazyMedia(container.querySelector('.gallery-panel.active'));

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

  const iosEntry = data.find(e => e.platform === 'ios');
  const tvosEntry = data.find(e => e.platform === 'tvos');
  const versionSpan = document.getElementById('hero-version');
  if (versionSpan && iosEntry?.version) {
    versionSpan.textContent = iosEntry.version;
  }
  const versionTvosSpan = document.getElementById('hero-version-tvos');
  if (versionTvosSpan && tvosEntry?.version) {
    versionTvosSpan.textContent = tvosEntry.version;
  }

  const isEn = _currentLang === 'en';

  function buildCard(item, delay) {
    const badge = (isEn && item.badge_en !== undefined) ? item.badge_en : item.badge;
    const highlights = (isEn && item.highlights_en) ? item.highlights_en : item.highlights;
    const badgeHtml = badge
      ? `<span class="changelog-badge">${badge}</span>`
      : '';
    const platformLabel = item.platform === 'tvos' ? 'tvOS' : 'iOS';
    const highlightsHtml = highlights.map(h =>
      `<li class="changelog-highlight">${h}</li>`
    ).join('');
    return `
      <div class="glass-card changelog-item reveal reveal-delay-${delay}">
        <div class="changelog-version-col">
          <div class="changelog-version">${item.version}</div>
          <div class="changelog-platform">${platformLabel}</div>
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
      <div class="changelog-older" id="changelog-older" hidden>
        ${rest.map((item, i) => buildCard(item, (i % 4) + 1)).join('')}
      </div>
    </div>` : '';

  list.innerHTML = featuredHtml + expandHtml;

  const btn = list.querySelector('.changelog-expand-btn');
  btn?.addEventListener('click', () => {
    const older = document.getElementById('changelog-older');
    const open = !older.hidden;
    older.hidden = open;
    btn.setAttribute('aria-expanded', String(!open));
    btn.querySelector('.changelog-expand-label').textContent =
      open ? t('changelog.expand') : t('changelog.collapse');
    btn.classList.toggle('open', !open);
    if (!open) observeReveal();
  });

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
  applyLang(_currentLang);

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

function applyLang(lang) {
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
    if (key === 'hero.badge.tvos') {
      const ver = document.getElementById('hero-version-tvos')?.textContent || '…';
      el.innerHTML = val.replace('{version}', `<span id="hero-version-tvos">${ver}</span>`);
      return;
    }
    if (key === 'hero.rating') {
      const count = el.dataset.count || '459';
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

  if (_strings[lang]) {
    renderFeatures();
    renderCompatibility();
    renderChangelog();
  }
}

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
        player.play().catch(() => {});
      } else {
        player.pause().catch(() => {});
      }
    });
  }, { threshold: 0.3 });

  obs.observe(iframe);
}

/* ============================================================
   SET Links
   ============================================================ */
function initLinks() {
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
  await initI18n();

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

  await Promise.all([
    renderFeatures(),
    renderCompatibility(),
    renderGallery(),
    renderChangelog(),
  ]);

  initVimeoObserver();
  observeReveal();

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

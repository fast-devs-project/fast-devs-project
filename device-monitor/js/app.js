/* ============================================================
   Device Monitor² — Main JS
   ============================================================ */

/* ——— CONFIG ——— */
const APP_STORE_URL = 'https://apps.apple.com/app/device-monitor/id1522870046';
const SUPPORT_URL = '../#contact';
const CACHE_VER = '26.5.0';

/* ——— Feature icon colors ——— */
const FEATURE_COLORS = {
  device: { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6' },
  sensors: { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
  ram: { bg: 'rgba(6,182,212,0.12)', color: '#06B6D4' },
  storage: { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
  cpu: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
  gpu: { bg: 'rgba(236,72,153,0.12)', color: '#EC4899' },
  network: { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6' },
  battery: { bg: 'rgba(132,204,22,0.12)', color: '#84CC16' },
  display: { bg: 'rgba(6,182,212,0.12)', color: '#06B6D4' },
  camera: { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
  widgets: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
  shortcuts: { bg: 'rgba(236,72,153,0.12)', color: '#EC4899' },
  customization: { bg: 'rgba(168,85,247,0.12)', color: '#A855F7' },
  'quick-actions': { bg: 'rgba(249,115,22,0.12)', color: '#F97316' },
};

/* gradient fallback (ora viene dal JSON) */
const KIT_GRADIENTS = {};

const COMPAT_GRADIENTS = {
  iPhone: 'linear-gradient(135deg,#3B82F6,#06B6D4)',
  iPad: 'linear-gradient(135deg,#8B5CF6,#3B82F6)',
  'Apple Watch': 'linear-gradient(135deg,#EC4899,#8B5CF6)',
  Mac: 'linear-gradient(135deg,#6B7280,#4B5563)',
};

/* ============================================================
   DATA LOADER
   Falls back to inline data if fetch() is blocked by CORS
   (e.g. when opening index.html directly from filesystem).
   ============================================================ */

async function loadJSON(path) {
  try {
    const res = await fetch(`${path}?v=${CACHE_VER}`);
    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch {
    console.warn(`[DeviceMonitor] Could not fetch ${path} – check CORS or use a static server.`);
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
    const c = FEATURE_COLORS[f.id] || { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6' };
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
   RENDER — KITS
   ============================================================ */
async function renderKits() {
  const data = await loadJSON('data/kits.json');
  const grid = document.getElementById('kits-grid');
  if (!grid || !data) return;

  const isEn = _currentLang === 'en';
  grid.innerHTML = data.map((k, i) => {
    const grad = k.gradient || 'linear-gradient(135deg,#3B82F6,#8B5CF6)';
    const desc = (isEn && k.description_en) ? k.description_en : k.description;
    const features = (isEn && k.features_en) ? k.features_en : k.features;
    const badge = (isEn && k.badge_en !== undefined) ? k.badge_en : k.badge;

    const featuresHtml = features.map(f => `
      <li class="kit-feature">
        <span class="kit-feature-check">${icon('check')}</span>
        <span>${f}</span>
      </li>`).join('');

    const badgeHtml = badge
      ? `<span class="kit-badge">${badge}</span>`
      : '';

    return `
      <div class="glass-card kit-card reveal reveal-delay-${(i % 4) + 1}"
           style="--kit-gradient:${grad}">
        <div class="kit-header">
          <div class="kit-icon-img-wrap">
            <img src="${k.image}" alt="${k.name} icon" class="kit-icon-img" loading="lazy">
          </div>
          <div style="text-align:right; flex:1">
            <div class="kit-price">${k.price}</div>
            <div class="kit-price-label">${t('kits.price.label')}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div class="kit-title">${k.name}</div>
          ${badgeHtml}
        </div>
        <div class="kit-description">${desc}</div>
        <ul class="kit-features">${featuresHtml}</ul>
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
    const grad = COMPAT_GRADIENTS[c.device] || 'linear-gradient(135deg,#3B82F6,#8B5CF6)';
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

  /* video preview iPhone — prima card della griglia iPhone */
  const IPHONE_VIDEO = {
    vimeoId: '538158588',
    title: 'Device Monitor² – Video preview',
  };

  /* build panels */
  container.innerHTML = sections.map(([key, sec], i) => {
    const gridClass = key === 'ipad' ? 'ipad-grid'
      : key === 'watch' ? 'watch-grid'
        : key === 'mac' ? 'mac-grid' : '';
    const ratio = key === 'ipad' ? '720/960'
      : key === 'watch' ? '1/1'
        : key === 'mac' ? '16/10' : '499/1080';

    const thumbs = sec.screenshots.map(s => `
      <div class="gallery-thumb" style="--thumb-ratio:${ratio}" role="button"
           tabindex="0"
           aria-label="${s.alt}"
           data-src="${s.url}" data-alt="${s.alt}">
        <img data-lazy-src="${s.url}" alt="${s.alt}" loading="lazy" decoding="async">
      </div>`).join('');

    /* Anteponi la card video solo al pannello iPhone */
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

  /* lightbox — apre con indice, esclude le card video */
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

  /* Aggiorna dinamicamente il numero di versione nell'hero badge */
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

  /* prime 2 versioni affiancate */
  const featured = data.slice(0, 2);
  const rest = data.slice(2);

  const featuredHtml = `
    <div class="changelog-featured reveal">
      ${featured.map((item, i) => buildCard(item, i + 1)).join('')}
    </div>`;

  /* sezione espandibile per le versioni precedenti */
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

  /* toggle espandi/comprimi */
  const btn = list.querySelector('.changelog-expand-btn');
  btn?.addEventListener('click', () => {
    const older = document.getElementById('changelog-older');
    const open = !older.hidden;
    older.hidden = open;
    btn.setAttribute('aria-expanded', String(!open));
    btn.querySelector('.changelog-expand-label').textContent =
      open ? t('changelog.expand') : t('changelog.collapse');
    btn.classList.toggle('open', !open);
    if (!open) {
      /* rivela le card appena apparse */
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
      : 'background:rgba(59,130,246,0.1);color:var(--accent-blue);';
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
   LIGHTBOX con navigazione frecce
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
    toggle.innerHTML = open
      ? `<span></span><span></span><span></span>`
      : `<span></span><span></span><span></span>`;
  });

  /* Close mobile nav on link click */
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

  /* Rileva lingua salvata o browser */
  const saved = localStorage.getItem('site_lang');
  const browser = navigator.language?.slice(0, 2).toLowerCase();
  _currentLang = saved || (browser === 'it' ? 'it' : 'en');

  _strings = data;
  applyLang(_currentLang);

  /* Bottoni switcher */
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

  /* Aggiorna bottoni switcher */
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  /* data-i18n → textContent */
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = strings[key];
    if (val === undefined) return;

    /* Gestione token {version}, {score}, {count} */
    if (key === 'hero.badge') {
      const ver = document.getElementById('hero-version')?.textContent || '…';
      el.innerHTML = val.replace('{version}', `<span id="hero-version">${ver}</span>`);
      return;
    }
    if (key === 'hero.rating') {
      const count = el.dataset.count || '41.844';
      el.textContent = val.replace('{count}', count);
      return;
    }
    el.textContent = val;
  });

  /* data-i18n-aria → aria-label */
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    const val = strings[key];
    if (val) el.setAttribute('aria-label', val);
  });

  /* Swap immagini localizzate (banner, badge) */
  document.querySelectorAll('[data-i18n-src]').forEach(el => {
    const src = el.getAttribute('src');
    const newSrc = src.replace(/\/(it|en)\//, `/${lang}/`);
    if (newSrc !== src) el.setAttribute('src', newSrc);
  });

  /* Ri-renderizza tutte le sezioni dinamiche con testi traducibili */
  if (_strings[lang]) {
    renderFeatures();
    renderKits();
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
   STAR RATING
   ============================================================ */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  let html = '';
  for (let i = 0; i < full; i++) html += `<span class="star full">${icon('star')}</span>`;
  if (half) html += `<span class="star half" style="opacity:.6">${icon('star')}</span>`;
  return html;
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  initLinks();
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

  /* Rating */
  const starsEl = document.getElementById('hero-stars');
  if (starsEl) starsEl.innerHTML = renderStars(4.6);

  /* Render dynamic sections in parallel */
  await Promise.all([
    renderFeatures(),
    renderKits(),
    renderCompatibility(),
    renderGallery(),
    renderChangelog(),
    renderPress(),
  ]);

  /* Avvia il video Vimeo solo quando visibile, loop automatico */
  initVimeoObserver();

  /* Final observe for static reveal elements */
  observeReveal();
});

/* ============================================================
   VIMEO — avvio on-scroll, loop
   ============================================================ */
function initVimeoObserver() {
  const iframe = document.getElementById('vimeo-preview');
  if (!iframe) return;

  /* La Vimeo Player API è caricata in modo defer — aspettiamo che sia pronta */
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

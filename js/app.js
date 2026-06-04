/* ============================================================
   Fast-Devs Project — Main Site JS
   ============================================================ */

const CACHE_VER = new URL(document.currentScript?.src || window.location.href).searchParams.get('v') || 'dev';

/* ============================================================
   DATA LOADER
   ============================================================ */
async function loadJSON(path) {
  try {
    const res = await fetch(`${path}?v=${CACHE_VER}`);
    if (!res.ok) throw new Error(res.status);
    return res.json();
  } catch {
    console.warn(`[FDP] Could not fetch ${path}`);
    return null;
  }
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
    if (val !== undefined) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const val = strings[key];
    if (val) el.setAttribute('placeholder', val);
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    const val = strings[key];
    if (val) el.setAttribute('aria-label', val);
  });

  renderApps();
  renderBlog();
}

/* ============================================================
   RENDER — APPS
   ============================================================ */
async function renderApps() {
  const data = await loadJSON('data/apps.json');
  const grid = document.getElementById('apps-grid');
  if (!grid || !data) return;

  const isEn = _currentLang === 'en';

  grid.innerHTML = data.map((app, i) => {
    const tagline = isEn ? app.tagline_en : app.tagline;
    const desc = isEn ? app.description_en : app.description;
    const platforms = app.platforms.map(p =>
      `<span class="app-platform-chip">${p}</span>`
    ).join('');

    return `
      <div class="glass-card app-card reveal reveal-delay-${i + 1}" style="--app-gradient:${app.gradient}">
        <div class="app-card-header">
          <img src="${app.icon}" alt="${app.name}" class="app-card-icon" loading="lazy">
          <div>
            <div class="app-card-title">${app.name}</div>
            <div class="app-card-tagline">${tagline}</div>
          </div>
        </div>
        <div class="app-card-desc">${desc}</div>
        <div class="app-card-platforms">${platforms}</div>
        <div class="app-card-actions">
          <a href="${app.appstore}" target="_blank" rel="noopener" class="btn-app primary" style="background:${app.accent};box-shadow:0 4px 16px ${app.accent}40;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            ${t('apps.cta.store')}
          </a>
          <a href="${app.landing}" class="btn-app secondary">${t('apps.cta.landing')} <span aria-hidden="true">→</span></a>
        </div>
      </div>`;
  }).join('');

  observeReveal();
}

/* ============================================================
   RENDER — BLOG
   ============================================================ */
async function renderBlog() {
  const data = await loadJSON('data/blog.json');
  const container = document.getElementById('blog-container');
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `<div class="blog-empty reveal reveal-delay-1">${t('blog.empty')}</div>`;
    observeReveal();
    return;
  }

  function truncate(html, words) {
    const spaced = html.replace(/<\/?(p|br|div)[^>]*>/gi, ' ');
    const tmp = document.createElement('div');
    tmp.innerHTML = spaced;
    const textNodes = [];
    let wordCount = 0;
    let done = false;

    function walk(node) {
      if (done) return;
      if (node.nodeType === 3) {
        const nodeWords = node.textContent.split(/\s+/).filter(w => w);
        const remaining = words - wordCount;
        if (nodeWords.length <= remaining) {
          textNodes.push(node.textContent);
          wordCount += nodeWords.length;
        } else {
          textNodes.push(nodeWords.slice(0, remaining).join(' ') + '…');
          wordCount = words;
          done = true;
        }
      } else if (node.nodeType === 1) {
        if (node.tagName === 'A') {
          const linkWords = node.textContent.split(/\s+/).filter(w => w);
          const remaining = words - wordCount;
          if (linkWords.length <= remaining) {
            textNodes.push(node.outerHTML);
            wordCount += linkWords.length;
          } else {
            const partial = linkWords.slice(0, remaining).join(' ') + '…';
            const clone = node.cloneNode(false);
            clone.textContent = partial;
            textNodes.push(clone.outerHTML);
            wordCount = words;
            done = true;
          }
        } else {
          for (const child of node.childNodes) walk(child);
        }
      }
    }

    for (const child of tmp.childNodes) walk(child);
    return textNodes.join(' ').replace(/\s+/g, ' ').trim();
  }

  function buildCard(post, featured, idx) {
    const localizedPost = getLocalizedPost(post);
    const excerpt = truncate(localizedPost.content, 100);
    const imgHtml = post.image
      ? `<img src="${post.image}" alt="${localizedPost.title}" class="blog-card-img" loading="lazy">`
      : '';
    const cls = featured ? 'blog-card featured' : 'blog-card';
    return `
      <div class="glass-card ${cls}" data-blog-idx="${idx}" role="button" tabindex="0" style="cursor:pointer;">
        ${imgHtml}
        <div class="blog-card-body">
          <div class="blog-card-title">${localizedPost.title}</div>
          <div class="blog-card-excerpt">${excerpt}</div>
          <div class="blog-card-date">${localizedPost.date}</div>
        </div>
      </div>`;
  }

  const featured = data.slice(0, 2);
  const rest = data.slice(2);

  const featuredHtml = `
    <div class="blog-featured reveal reveal-delay-1">
      ${featured.map((post, i) => buildCard(post, true, i)).join('')}
    </div>`;

  const expandHtml = rest.length ? `
    <div class="blog-expand-wrap">
      <button class="blog-expand-btn" aria-expanded="false" aria-controls="blog-older">
        <span class="blog-expand-label">${t('blog.expand')}</span>
        <span class="blog-expand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>
      <div class="blog-older" id="blog-older" hidden>
        ${rest.map((post, i) => buildCard(post, false, i + 2)).join('')}
      </div>
    </div>` : '';

  container.innerHTML = featuredHtml + expandHtml;

  const btn = container.querySelector('.blog-expand-btn');
  btn?.addEventListener('click', () => {
    const older = document.getElementById('blog-older');
    const open = !older.hidden;
    older.hidden = open;
    btn.setAttribute('aria-expanded', String(!open));
    btn.querySelector('.blog-expand-label').textContent =
      open ? t('blog.expand') : t('blog.collapse');
    btn.classList.toggle('open', !open);
    if (!open) observeReveal();
  });

  /* Blog modal — click on card */
  container.addEventListener('click', e => {
    const card = e.target.closest('[data-blog-idx]');
    if (!card) return;
    const idx = parseInt(card.dataset.blogIdx);
    openBlogModal(data[idx]);
  });

  container.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('[data-blog-idx]');
      if (!card) return;
      const idx = parseInt(card.dataset.blogIdx);
      openBlogModal(data[idx]);
    }
  });

  observeReveal();
}

/* ============================================================
   BLOG MODAL
   ============================================================ */
function openBlogModal(post) {
  const modal = document.getElementById('blog-modal');
  const localizedPost = getLocalizedPost(post);
  modal.querySelector('.blog-modal-img').src = post.image || '';
  modal.querySelector('.blog-modal-img').alt = localizedPost.title;
  modal.querySelector('.blog-modal-title').textContent = localizedPost.title;
  modal.querySelector('.blog-modal-date').textContent = localizedPost.date;
  modal.querySelector('.blog-modal-text').innerHTML = localizedPost.content;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function getLocalizedPost(post) {
  const isEn = _currentLang === 'en';
  return {
    title: isEn && post.title_en ? post.title_en : post.title,
    date: isEn && post.date_en ? post.date_en : post.date,
    content: isEn && post.content_en ? post.content_en : post.content
  };
}

function closeBlogModal() {
  const modal = document.getElementById('blog-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const formReadyAt = Date.now();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const data = new FormData(form);
    const honey = String(data.get('_honey') || '').trim();
    const filledTooFast = Date.now() - formReadyAt < 3000;

    if (honey || filledTooFast) {
      return;
    }

    btn.disabled = true;
    btn.style.opacity = '0.6';

    try {
      const res = await fetch('https://formsubmit.co/ajax/bdc4e7d2b521be14522a9ce2ce867fb1', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      });

      if (res.ok) {
        form.reset();
        showEmailAlert();
      }
    } catch {
      /* Silently fail — form reset anyway */
    } finally {
      btn.disabled = false;
      btn.style.opacity = '';
    }
  });
}

function showEmailAlert() {
  const alert = document.getElementById('email-alert');
  if (!alert) return;
  alert.classList.add('visible');
  setTimeout(() => alert.classList.remove('visible'), 4000);
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
   SCROLL REVEAL
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
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  initContact();
  await initI18n();
  observeReveal();

  /* Scroll to hash anchor after all dynamic content is rendered */
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }

  /* Blog modal close */
  const blogModal = document.getElementById('blog-modal');
  blogModal?.querySelector('.blog-modal-close')?.addEventListener('click', closeBlogModal);
  blogModal?.querySelector('.blog-modal-backdrop')?.addEventListener('click', closeBlogModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeBlogModal();
  });
});

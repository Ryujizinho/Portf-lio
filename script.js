document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('themeToggle');
  const label = document.getElementById('themeLabel');

  // Tema inicial: localStorage > preferência do sistema > padrão (escuro)
  const saved = localStorage.getItem('theme');
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)')?.matches;
  const initialTheme = saved || (prefersLight ? 'light' : 'dark');

  applyTheme(initialTheme);

  toggle.addEventListener('change', () => {
    const theme = toggle.checked ? 'light' : 'dark';
    applyTheme(theme);
  });

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    toggle.checked = theme === 'light';
    label.textContent = theme === 'light' ? 'CLARO' : 'ESCURO';
    localStorage.setItem('theme', theme);
  }

  // ── E-mail: copiar (texto + check) ──
  const emailBtn = document.getElementById('emailBtn');
  const emailAction = document.getElementById('emailAction');
  const EMAIL_ADDRESS = 'jpss10@aluno.ifal.edu.br';
  const EMAIL_TEXT_DEFAULT = 'Clique aqui para copiar';
  const EMAIL_TEXT_COPIED = 'Copiado';
  const EMAIL_TEXT_ERROR = 'Falha ao copiar';

  let copiedTimer = null;
  let copiedActive = false;

  async function copyEmailToClipboard() {
    // Clipboard API (requer https/localhost)
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(EMAIL_ADDRESS);
        return true;
      }
    } catch (_) {}

    // Fallback
    try {
      const ta = document.createElement('textarea');
      ta.value = EMAIL_ADDRESS;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  if (emailBtn && emailAction) {
    emailAction.textContent = EMAIL_TEXT_DEFAULT;

    emailBtn.addEventListener('click', async () => {
      const ok = await copyEmailToClipboard();

      copiedActive = true;
      emailBtn.classList.add('copied');
      emailBtn.setAttribute('aria-label', ok ? 'E-mail copiado' : 'Falha ao copiar e-mail');
      emailAction.textContent = ok ? EMAIL_TEXT_COPIED : EMAIL_TEXT_ERROR;

      window.clearTimeout(copiedTimer);
      copiedTimer = window.setTimeout(() => {
        copiedActive = false;
        emailBtn.classList.remove('copied');
        emailBtn.setAttribute('aria-label', 'Copiar e-mail');
        emailAction.textContent = EMAIL_TEXT_DEFAULT;
      }, 3000);
    });
  }

// ── Carrossel ──
  const viewport = document.querySelector('.viewport');
  const track = document.querySelector('.track');
  const cards = Array.from(document.querySelectorAll('.card'));
  const prevBtn = document.querySelector('.nav-btn.prev');
  const nextBtn = document.querySelector('.nav-btn.next');
  const dotsWrap = document.getElementById('dots');
  const counter = document.getElementById('counter');

  const tabsWrap = document.getElementById('tabs');
  const menuBtn = document.getElementById('menuBtn');
  const sideNav = document.getElementById('sideNav');
  const sideOverlay = document.getElementById('sideOverlay');
  const sideClose = document.getElementById('sideClose');
  const sideLinks = document.getElementById('sideLinks');

  if (!viewport || !track || !prevBtn || !nextBtn || !dotsWrap || !counter || cards.length === 0) return;

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if (prefersReducedMotion) track.classList.add('reduced-motion');

  const mobileQuery = window.matchMedia('(max-width: 720px)');
  function isMobile() { return mobileQuery.matches; }

  // Dots
  const dots = cards.map((card, idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Ir para o card ${idx + 1}${card.dataset.title ? `: ${card.dataset.title}` : ''}`);
    b.addEventListener('click', () => goTo(idx, { focus: true }));
    dotsWrap.appendChild(b);
    return b;
  });

  // Tabs e side-links
  const tabBtns = [];
  const sideBtns = [];

  cards.forEach((card, idx) => {
    const title = card.dataset.title || `Card ${idx + 1}`;

    if (tabsWrap) {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'tab-btn';
      t.setAttribute('role', 'tab');
      t.setAttribute('aria-label', `Ir para: ${title}`);
      t.textContent = title;
      t.addEventListener('click', () => goTo(idx, { focus: true }));
      tabsWrap.appendChild(t);
      tabBtns.push(t);
    }

    if (sideLinks) {
      const s = document.createElement('button');
      s.type = 'button';
      s.className = 'side-link';
      s.setAttribute('aria-label', `Ir para: ${title}`);
      s.textContent = title;
      s.addEventListener('click', () => {
        goTo(idx, { focus: true });
        closeSidebar();
      });
      sideLinks.appendChild(s);
      sideBtns.push(s);
    }
  });

  let sidebarOpen = false;

  function openSidebar() {
    if (!sideNav || !sideOverlay || !menuBtn) return;
    sidebarOpen = true;
    sideNav.classList.add('show');
    sideOverlay.classList.add('show');
    sideNav.setAttribute('aria-hidden', 'false');
    sideOverlay.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
    (sideBtns[index] || sideBtns[0])?.focus?.();
  }

  function closeSidebar() {
    if (!sideNav || !sideOverlay || !menuBtn) return;
    sidebarOpen = false;
    sideNav.classList.remove('show');
    sideOverlay.classList.remove('show');
    sideNav.setAttribute('aria-hidden', 'true');
    sideOverlay.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }

  menuBtn?.addEventListener('click', () => { if (sidebarOpen) closeSidebar(); else openSidebar(); });
  sideOverlay?.addEventListener('click', closeSidebar);
  sideClose?.addEventListener('click', closeSidebar);

  let index = 0;
  goTo(0);

  prevBtn.addEventListener('click', () => goTo(index - 1, { focus: true }));

  nextBtn.addEventListener('click', () => goTo(index + 1, { focus: true }));

  window.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const tag = active?.tagName;
    const isTyping = active?.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (isTyping) return;

    if (e.key === 'Escape' && sidebarOpen) {
      e.preventDefault();
      closeSidebar();
      return;
    }

    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
  }, { passive: false });

  // Swipe
  let startX = null;
  let startY = null;
  let isPointerDown = false;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    isPointerDown = true;
    startX = e.clientX;
    startY = e.clientY;
    viewport.setPointerCapture?.(e.pointerId);
  });

  viewport.addEventListener('pointerup', (e) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    goTo(index + (dx < 0 ? 1 : -1));
  });

  viewport.addEventListener('pointercancel', () => { isPointerDown = false; });

  function normalize(i) {
    const total = cards.length;
    return ((i % total) + total) % total;
  }

  function goTo(i, opts = {}) {
    index = normalize(i);
    track.style.transform = `translateX(-${index * 100}%)`;
    updateUI();
    if (opts.focus) viewport.focus();
  }

  function updateUI() {
    const total = cards.length;
    counter.textContent = `${index + 1} / ${total}`;

    dots.forEach((d, idx) => {
      const active = idx === index;
      d.classList.toggle('active', active);
      d.setAttribute('aria-selected', active ? 'true' : 'false');
      d.tabIndex = active ? 0 : -1;
    });

    tabBtns.forEach((t, idx) => {
      const active = idx === index;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
      t.tabIndex = active ? 0 : -1;
    });

    tabBtns[index]?.scrollIntoView?.({
      inline: 'center',
      block: 'nearest',
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });

    sideBtns.forEach((s, idx) => {
      const active = idx === index;
      s.classList.toggle('active', active);
      if (active) s.setAttribute('aria-current', 'page');
      else s.removeAttribute('aria-current');
    });

    cards.forEach((card, idx) => {
      const active = idx === index;
      card.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
  }
});

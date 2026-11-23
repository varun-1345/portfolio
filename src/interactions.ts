import type { Theme } from './scene';

/** Material ripple on any element with `data-ripple`. */
export function initRipples(root: ParentNode = document) {
  root.addEventListener('pointerdown', (ev) => {
    const e = ev as PointerEvent;
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-ripple]');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    const r = document.createElement('span');
    r.className = 'ripple';
    r.style.width = r.style.height = `${size}px`;
    r.style.left = `${e.clientX - rect.left - size / 2}px`;
    r.style.top = `${e.clientY - rect.top - size / 2}px`;
    target.appendChild(r);
    r.addEventListener('animationend', () => r.remove(), { once: true });
  });
}

/** Reveal-on-scroll with stagger via --delay. */
export function initReveal() {
  const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
  );
  els.forEach((el) => io.observe(el));
}

/** Highlight the nav link for the section in view; add topbar shadow after scrolling. */
export function initNav() {
  const topbar = document.querySelector<HTMLElement>('.topbar')!;
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav a'));
  const sections = links
    .map((a) => document.querySelector<HTMLElement>(a.getAttribute('href')!))
    .filter((s): s is HTMLElement => !!s);

  const onScroll = () => topbar.classList.toggle('topbar--scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        const id = `#${en.target.id}`;
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
      }
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  );
  sections.forEach((s) => io.observe(s));
}

/** Track pointer within cards to drive the accent wash. */
export function initCardGlow() {
  document.querySelectorAll<HTMLElement>('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });
}

/** Theme persistence + toggle. */
export function getInitialTheme(): Theme {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
  if (meta) meta.content = theme === 'dark' ? '#131318' : '#fbf8ff';
}

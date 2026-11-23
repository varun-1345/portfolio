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
  const home = links.find((a) => a.getAttribute('href') === '#top');
  const sectionLinks = links.filter((a) => a !== home);
  const sections = sectionLinks
    .map((a) => document.querySelector<HTMLElement>(a.getAttribute('href')!))
    .filter((s): s is HTMLElement => !!s);
  const setActive = (href: string) =>
    links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === href));

  const onScroll = () => {
    topbar.classList.toggle('topbar--scrolled', window.scrollY > 24);
    if (window.scrollY < window.innerHeight * 0.5) setActive('#top');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting && window.scrollY >= window.innerHeight * 0.5) setActive(`#${en.target.id}`);
      }
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
  );
  sections.forEach((s) => io.observe(s));
  // "About" and "Skills" have no nav item; keep Work/Experience highlighted sensibly.
  const about = document.getElementById('about');
  if (about) io.observe(about);
}

/** Theme persistence: 'light' | 'dark' | 'system'. */
export type ThemePref = 'light' | 'dark' | 'system';

const mq = window.matchMedia('(prefers-color-scheme: dark)');

export function getThemePref(): ThemePref {
  const saved = localStorage.getItem('theme');
  return saved === 'dark' || saved === 'light' ? saved : 'system';
}

export function resolveTheme(pref: ThemePref): Theme {
  return pref === 'system' ? (mq.matches ? 'dark' : 'light') : pref;
}

export function applyThemePref(pref: ThemePref): Theme {
  const theme = resolveTheme(pref);
  document.documentElement.dataset.theme = theme;
  if (pref === 'system') localStorage.removeItem('theme');
  else localStorage.setItem('theme', pref);
  return theme;
}

export function onSystemThemeChange(cb: () => void) {
  mq.addEventListener('change', cb);
}

/** Hover tooltips for elements with data-tip. */
export function initTooltips() {
  const tip = document.createElement('div');
  tip.className = 'tooltip';
  tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);
  let current: HTMLElement | null = null;
  const show = (el: HTMLElement) => {
    current = el;
    tip.textContent = el.dataset.tip ?? '';
    const r = el.getBoundingClientRect();
    tip.style.left = `${r.left + r.width / 2}px`;
    tip.style.top = `${r.top - 10}px`;
    tip.classList.add('is-visible');
  };
  const hide = () => {
    current = null;
    tip.classList.remove('is-visible');
  };
  document.querySelectorAll<HTMLElement>('[data-tip]').forEach((el) => {
    el.addEventListener('pointerenter', () => show(el));
    el.addEventListener('focus', () => show(el));
    el.addEventListener('pointerleave', hide);
    el.addEventListener('blur', hide);
  });
  window.addEventListener('scroll', () => current && hide(), { passive: true });
}

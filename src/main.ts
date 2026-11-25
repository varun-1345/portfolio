import './style.css';
import { CharacterScene, type Theme } from './scene';
import { about, education, experience, profile, projects, recognition, skills } from './content';
import {
  applyThemePref,
  getThemePref,
  initNav,
  initReveal,
  initRipples,
  initExpanders,
  initTooltips,
  onSystemThemeChange,
  type ThemePref,
} from './interactions';

const icon = (name: string, filled = false) =>
  `<span class="icon${filled ? ' icon--filled' : ''}" aria-hidden="true">${name}</span>`;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const linkedinSvg = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>`;

function render() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
  <header class="topbar">
    <a class="brand" href="#top" aria-label="${esc(profile.name)} — home">Varun<span class="brand__dot">.</span></a>
    <nav class="nav" aria-label="Primary">
      <a href="#top" class="is-active" data-ripple>Home</a>
      <a href="#projects" data-ripple>Work</a>
      <a href="#experience" data-ripple>Experience</a>
      <a href="#contact" data-ripple>Contact</a>
    </nav>
    <a class="btn btn--tonal btn--sm topbar__cta" href="mailto:${esc(profile.email)}" data-ripple>Get in touch</a>
  </header>

  <main id="top">
    <section class="hero" aria-label="Introduction">
      <div class="hero__glow"></div>
      <div class="hero__canvas" id="hero-canvas" aria-hidden="true"></div>

      <div class="hero__side hero__side--left">
        <div class="availability reveal"><span class="availability__dot"></span>Available for work</div>
        <p class="hero__tagline reveal" style="--delay:80ms">
          Project / Program Manager with<br />
          ~2 years across Google Cloud &amp; enterprise IT,<br />
          <span class="muted">turning messy operations<br />into systems that ship.</span>
        </p>
        <div class="theme-switch reveal" style="--delay:160ms" role="radiogroup" aria-label="Theme">
          <button type="button" data-theme-pref="light" data-tip="Light" aria-label="Light theme">${icon('light_mode')}</button>
          <button type="button" data-theme-pref="dark" data-tip="Dark" aria-label="Dark theme">${icon('dark_mode')}</button>
          <button type="button" data-theme-pref="system" data-tip="System" aria-label="System theme">${icon('desktop_windows')}</button>
        </div>
      </div>

      <div class="hero__side hero__side--right">
        <div class="socials reveal">
          <a href="${esc(profile.linkedin)}" target="_blank" rel="noopener" data-tip="LinkedIn · varunnampally" aria-label="LinkedIn">${linkedinSvg}</a>
          <a href="mailto:${esc(profile.email)}" data-tip="${esc(profile.email)}" aria-label="Email">${icon('mail')}</a>
          <a href="${esc(profile.resume)}" target="_blank" rel="noopener" data-tip="Resume (Drive)" aria-label="Resume">${icon('description')}</a>
          <a href="#about" data-tip="Hyderabad, India" aria-label="Location">${icon('location_on')}</a>
        </div>
        <nav class="hero__links reveal" style="--delay:80ms" aria-label="Sections">
          <a href="#about" data-ripple>About</a>
          <a href="#projects" data-ripple>Work</a>
          <a href="#contact" data-ripple>Contact</a>
        </nav>
      </div>
    </section>

    <section class="section" id="about">
      <div class="section__inner">
        <div class="section__head">
          <div class="reveal">
            <div class="section__label label-md">About</div>
            <h2 class="display-sm">Calm in the middle of complex programs.</h2>
          </div>
        </div>
        <div class="about">
          <div class="about__text body-lg reveal">
            ${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
          </div>
          <div class="stats">
            ${about.stats
              .map(
                (s, i) => `
              <div class="stat reveal" style="--delay:${i * 70}ms">
                <div class="stat__value">${esc(s.value)}</div>
                <div class="stat__label">${esc(s.label)}</div>
              </div>`,
              )
              .join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="projects">
      <div class="section__inner">
        <div class="section__head">
          <div class="reveal">
            <div class="section__label label-md">Selected work</div>
            <h2 class="display-sm">Programs I’ve owned end to end.</h2>
          </div>
        </div>
        <div class="projects">
          ${projects
            .map(
              (p, i) => `
            <article class="card reveal" style="--delay:${(i % 2) * 90}ms">
              <div class="card__top">
                <div class="card__kicker label-lg">${esc(p.kicker)}</div>
                <div class="card__index mono">0${i + 1}</div>
              </div>
              <div class="metric">
                <div class="metric__value">${esc(p.metric)}</div>
                <div class="metric__label">${esc(p.metricLabel)}</div>
              </div>
              <h3 class="title-lg">${esc(p.title)}</h3>
              <p class="card__summary body-md">${esc(p.summary)}</p>
              <button class="expand-btn" type="button" aria-expanded="false" data-expand>
                Details ${icon('expand_more')}
              </button>
              <div class="expand" data-expand-panel>
                <div class="expand__inner">
                  <p class="body-md muted">${esc(p.description)}</p>
                  <ul class="card__impact">
                    ${p.impact.map((b) => `<li>${icon('arrow_forward')}<span>${esc(b)}</span></li>`).join('')}
                  </ul>
                  <div class="chips">${p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>
                </div>
              </div>
            </article>`,
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section" id="experience">
      <div class="section__inner">
        <div class="section__head">
          <div class="reveal">
            <div class="section__label label-md">Experience</div>
            <h2 class="display-sm">Where I’ve done the work.</h2>
          </div>
        </div>
        <div class="timeline">
          ${experience
            .map(
              (x, i) => `
            <div class="xp ${i === 0 ? 'is-current' : ''} reveal" style="--delay:${i * 60}ms">
              <div class="xp__dot"></div>
              <div class="xp__meta">
                <div class="period mono">${esc(x.period)}</div>
                <div class="company">${esc(x.company)}</div>
                <div class="role">${esc(x.role)}${x.team ? ` · ${esc(x.team)}` : ''}</div>
              </div>
              <div class="xp__body">
                <p class="body-md">${esc(x.summary)}</p>
                <button class="expand-btn" type="button" aria-expanded="false" data-expand>
                  More ${icon('expand_more')}
                </button>
                <div class="expand" data-expand-panel>
                  <ul class="xp__bullets body-md expand__inner">
                    ${x.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>`,
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section" id="skills">
      <div class="section__inner">
        <div class="section__head">
          <div class="reveal">
            <div class="section__label label-md">Skills</div>
            <h2 class="display-sm">Spreadsheet, terminal, and the room in between.</h2>
          </div>
        </div>
        <div class="skills reveal">
          ${skills
            .map(
              (g) => `
            <div class="skill-row">
              <div class="skill-row__label label-md">${esc(g.group)}</div>
              <div class="chips">${g.items.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>
            </div>`,
            )
            .join('')}
        </div>
        <ul class="edu reveal">
          ${education
            .map(
              (e) => `
            <li class="edu__item">
              <span class="edu__title">${esc(e.title)}</span>
              <span class="edu__meta muted">${esc(e.org)} · ${esc(e.period)}</span>
            </li>`,
            )
            .join('')}
        </ul>
        <div class="recognition">
          ${recognition
            .map(
              (r) => `
            <div class="award reveal">
              <div class="award__icon">${icon(r.icon, true)}</div>
              <div class="award__body">
                <div class="label-md award__kicker">Recognition · ${esc(r.org)}</div>
                <h3 class="title-lg">${esc(r.title)}</h3>
                <p class="body-md">${esc(r.description)}</p>
              </div>
            </div>`,
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section" id="contact">
      <div class="section__inner contact reveal">
        <div class="section__label label-md">Contact</div>
        <h2 class="display-lg">Let’s build something<br />that runs on time.</h2>
        <a class="contact__email" href="mailto:${esc(profile.email)}">${esc(profile.email)} ${icon('arrow_outward')}</a>
        <div class="contact__links">
          <a href="${esc(profile.linkedin)}" target="_blank" rel="noopener">LinkedIn ${icon('arrow_outward')}</a>
          <a href="${esc(profile.resume)}" target="_blank" rel="noopener">Resume ${icon('arrow_outward')}</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="footer__inner">
      <span>© ${new Date().getFullYear()} ${esc(profile.name)}</span>
      <span class="muted">Hyderabad, India</span>
      <a href="#top">Back to top ↑</a>
    </div>
  </footer>`;
}

function main() {
  render();

  let pref: ThemePref = getThemePref();
  let theme: Theme = applyThemePref(pref);

  const canvasHost = document.getElementById('hero-canvas')!;
  let scene: CharacterScene | null = null;
  try {
    scene = new CharacterScene(canvasHost, theme);
    scene.start();
  } catch (err) {
    console.warn('WebGL unavailable, falling back to static hero.', err);
    canvasHost.remove();
  }

  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-theme-pref]'));
  const sync = () => {
    buttons.forEach((b) => {
      const on = b.dataset.themePref === pref;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-checked', String(on));
      b.setAttribute('role', 'radio');
    });
  };
  const apply = () => {
    const next = applyThemePref(pref);
    if (next !== theme) {
      theme = next;
      scene?.setTheme(theme);
    }
    sync();
  };
  sync();
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      pref = b.dataset.themePref as ThemePref;
      const d = document as Document & { startViewTransition?: (cb: () => void) => void };
      if (d.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        d.startViewTransition(apply);
      } else {
        apply();
      }
    }),
  );
  onSystemThemeChange(() => pref === 'system' && apply());

  initRipples();
  initReveal();
  initNav();
  initTooltips();
  initExpanders();
}

main();

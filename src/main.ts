import './style.css';
import { HeroScene, type Theme } from './scene';
import { about, education, experience, profile, projects, skills } from './content';
import { applyTheme, getInitialTheme, initCardGlow, initNav, initReveal, initRipples } from './interactions';

const icon = (name: string, filled = false) =>
  `<span class="icon${filled ? ' icon--filled' : ''}" aria-hidden="true">${name}</span>`;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function render() {
  const app = document.getElementById('app')!;
  const spans = ['card--span-7', 'card--span-5', 'card--span-5', 'card--span-7'];

  app.innerHTML = `
  <header class="topbar">
    <div class="topbar__inner">
      <a class="brand" href="#top" aria-label="${esc(profile.name)} — home">
        <span class="brand__mark">V</span>
        <span>${esc(profile.shortName)}</span>
      </a>
      <nav class="nav" aria-label="Primary">
        <a href="#about" data-ripple>About</a>
        <a href="#projects" data-ripple>Projects</a>
        <a href="#experience" data-ripple>Experience</a>
        <a href="#skills" data-ripple>Skills</a>
        <a href="#contact" data-ripple>Contact</a>
      </nav>
      <button class="icon-btn" id="theme-toggle" data-ripple aria-label="Toggle dark mode" title="Toggle theme">
        ${icon('dark_mode')}
      </button>
    </div>
  </header>

  <main id="top">
    <section class="hero" aria-label="Introduction">
      <div class="hero__glow"></div>
      <div class="hero__canvas" id="hero-canvas" aria-hidden="true"></div>
      <div class="hero__inner">
        <div class="hero__copy">
          <div class="eyebrow label-lg reveal">
            <span class="eyebrow__dot">${icon('location_on', true)}</span>
            ${esc(profile.role)} · ${esc(profile.location)}
          </div>
          <h1 class="display-lg reveal" style="--delay:80ms">
            Hi, I’m <span class="accent">Varun</span>.<br />
            ${esc(profile.headline)}
          </h1>
          <p class="hero__lead body-lg reveal" style="--delay:160ms">${esc(profile.tagline)}</p>
          <div class="hero__actions reveal" style="--delay:240ms">
            <a class="btn btn--filled" href="#projects" data-ripple>${icon('arrow_downward')} See my work</a>
            <a class="btn btn--tonal" href="mailto:${esc(profile.email)}" data-ripple>${icon('mail')} Get in touch</a>
            <a class="btn btn--text" href="${esc(profile.resume)}" target="_blank" rel="noopener" data-ripple>${icon('description')} Resume</a>
          </div>
          <div class="hero__meta label-lg reveal" style="--delay:320ms">
            <span>${icon('workspace_premium')} Google PM Certified</span>
            <span>${icon('cloud')} Google Cloud S&amp;O</span>
            <span>${icon('bolt')} 0→1 builder</span>
          </div>
        </div>
      </div>
      <div class="scroll-cue" aria-hidden="true">
        <span>Scroll</span>
        ${icon('keyboard_arrow_down')}
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

    <section class="section section--tinted" id="projects">
      <div class="section__inner">
        <div class="section__head">
          <div class="reveal">
            <div class="section__label label-md">Selected work</div>
            <h2 class="display-sm">Programs I’ve owned end to end.</h2>
          </div>
          <p class="section__blurb body-lg reveal" style="--delay:80ms">
            From governance over eight-figure budgets to internal tools that managers actually use, these are the
            pieces of work I’m proudest of.
          </p>
        </div>
        <div class="projects">
          ${projects
            .map(
              (p, i) => `
            <article class="card card--${p.accent} ${spans[i % spans.length]} reveal" style="--delay:${(i % 2) * 90}ms" data-ripple>
              <div class="card__top">
                <div>
                  <div class="card__kicker label-lg">${esc(p.kicker)}</div>
                  <h3 class="title-lg">${esc(p.title)}</h3>
                </div>
                <div class="card__icon">${icon(p.icon, true)}</div>
              </div>
              <p class="card__desc body-md">${esc(p.description)}</p>
              <ul class="card__impact">
                ${p.impact.map((b) => `<li>${icon('check_circle', true)}<span>${esc(b)}</span></li>`).join('')}
              </ul>
              <div class="chips">${p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>
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
                <div class="role">${esc(x.role)} · ${esc(x.location)}</div>
                ${x.team ? `<div class="team">${esc(x.team)}</div>` : ''}
              </div>
              <ul class="xp__bullets body-md">
                ${x.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}
              </ul>
            </div>`,
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section section--tinted" id="skills">
      <div class="section__inner">
        <div class="section__head">
          <div class="reveal">
            <div class="section__label label-md">Skills</div>
            <h2 class="display-sm">Spreadsheet, terminal, and the room in between.</h2>
          </div>
        </div>
        <div class="skills">
          ${skills
            .map(
              (g, i) => `
            <div class="skill-group reveal" style="--delay:${i * 80}ms">
              <div class="skill-group__head">
                ${icon(g.icon)}
                <h3 class="title-md">${esc(g.group)}</h3>
              </div>
              <div class="chips">${g.items.map((s) => `<span class="chip chip--filled">${esc(s)}</span>`).join('')}</div>
            </div>`,
            )
            .join('')}
        </div>
        <div class="edu">
          ${education
            .map(
              (e, i) => `
            <div class="edu__item reveal" style="--delay:${i * 80}ms">
              ${icon(e.icon)}
              <div>
                <div class="title-md">${esc(e.title)}</div>
                <div class="body-md muted">${esc(e.org)}</div>
                <div class="mono muted" style="margin-top:6px">${esc(e.period)}</div>
              </div>
            </div>`,
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section" id="contact">
      <div class="section__inner">
        <div class="contact reveal">
          <div>
            <div class="label-md" style="opacity:.8;margin-bottom:14px">Contact</div>
            <h2 class="display-sm">Let’s build something that runs on time.</h2>
            <p class="body-lg">
              Open to program and project management roles, and always up for a conversation about operations,
              internal tooling, or how to make a 500-person org feel small.
            </p>
          </div>
          <div class="contact__actions">
            <a class="btn btn--filled" href="mailto:${esc(profile.email)}" data-ripple>${icon('mail')} ${esc(profile.email)}</a>
            <a class="btn btn--outlined" href="${esc(profile.linkedin)}" target="_blank" rel="noopener" data-ripple>${icon('group')} Connect on LinkedIn</a>
            <a class="btn btn--outlined" href="${esc(profile.resume)}" target="_blank" rel="noopener" data-ripple>${icon('download')} View resume</a>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="footer__inner">
      <span>© ${new Date().getFullYear()} ${esc(profile.name)}</span>
      <div class="footer__links">
        <a href="${esc(profile.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
        <a href="mailto:${esc(profile.email)}">Email</a>
        <a href="${esc(profile.resume)}" target="_blank" rel="noopener">Resume</a>
        <a href="#top">Back to top ↑</a>
      </div>
    </div>
  </footer>`;
}

function main() {
  render();

  let theme: Theme = getInitialTheme();
  applyTheme(theme);

  const canvasHost = document.getElementById('hero-canvas')!;
  let scene: HeroScene | null = null;
  try {
    scene = new HeroScene(canvasHost, theme);
    scene.start();
  } catch (err) {
    console.warn('WebGL unavailable, falling back to static hero.', err);
    canvasHost.remove();
  }

  const toggle = document.getElementById('theme-toggle')!;
  const syncIcon = () => {
    toggle.querySelector('.icon')!.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  };
  syncIcon();
  toggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    const swap = () => {
      applyTheme(theme);
      scene?.setTheme(theme);
      syncIcon();
    };
    const d = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (d.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      d.startViewTransition(swap);
    } else {
      swap();
    }
  });

  initRipples();
  initReveal();
  initNav();
  initCardGlow();
}

main();

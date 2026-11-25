/**
 * A thin vertical "road" fixed to the left edge. A small top-down car tracks
 * scroll progress along it, leaving a glowing trail whose length scales with speed.
 * Section markers along the road are clickable and show tooltips.
 */
export function initRoad(sectionIds: { id: string; label: string }[]) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const road = document.createElement('div');
  road.className = 'road';
  road.setAttribute('aria-hidden', 'true');
  road.innerHTML = `
    <canvas class="road__trail"></canvas>
    <div class="road__line"></div>
    <div class="road__marks"></div>
    <div class="road__car">
      <svg viewBox="0 0 24 44" width="24" height="44">
        <defs>
          <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="var(--car-top)"/>
            <stop offset="1" stop-color="var(--car-bottom)"/>
          </linearGradient>
        </defs>
        <!-- wheels -->
        <rect x="1" y="7" width="4" height="9" rx="1.5" fill="var(--car-wheel)"/>
        <rect x="19" y="7" width="4" height="9" rx="1.5" fill="var(--car-wheel)"/>
        <rect x="1" y="28" width="4" height="9" rx="1.5" fill="var(--car-wheel)"/>
        <rect x="19" y="28" width="4" height="9" rx="1.5" fill="var(--car-wheel)"/>
        <!-- body -->
        <rect x="3.5" y="2" width="17" height="40" rx="7" fill="url(#carBody)"/>
        <!-- windshield + rear window -->
        <rect x="6.5" y="11" width="11" height="7" rx="2.5" fill="var(--car-glass)"/>
        <rect x="6.5" y="27" width="11" height="5" rx="2" fill="var(--car-glass)" opacity=".8"/>
        <!-- roof -->
        <rect x="6.5" y="19" width="11" height="7" fill="var(--car-roof)"/>
        <!-- headlights / taillights -->
        <rect x="5.5" y="2.5" width="4" height="2" rx="1" fill="#fff6d6"/>
        <rect x="14.5" y="2.5" width="4" height="2" rx="1" fill="#fff6d6"/>
        <rect x="5.5" y="39.5" width="4" height="2" rx="1" fill="var(--car-tail)"/>
        <rect x="14.5" y="39.5" width="4" height="2" rx="1" fill="var(--car-tail)"/>
      </svg>
    </div>`;
  document.body.appendChild(road);

  const canvas = road.querySelector<HTMLCanvasElement>('.road__trail')!;
  const ctx = canvas.getContext('2d')!;
  const car = road.querySelector<HTMLElement>('.road__car')!;
  const marks = road.querySelector<HTMLElement>('.road__marks')!;
  const line = road.querySelector<HTMLElement>('.road__line')!;

  // Build section markers.
  const sections = sectionIds
    .map((s) => ({ ...s, el: document.getElementById(s.id) }))
    .filter((s): s is { id: string; label: string; el: HTMLElement } => !!s.el);
  const markEls = sections.map((s) => {
    const m = document.createElement('a');
    m.className = 'road__mark';
    m.href = `#${s.id}`;
    m.dataset.tip = s.label;
    m.setAttribute('aria-label', s.label);
    marks.appendChild(m);
    return m;
  });

  let top = 0;
  let length = 1;
  let dpr = 1;
  const progressOf = (el: HTMLElement) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(1, Math.max(0, el.offsetTop / Math.max(1, max)));
  };

  const layout = () => {
    const r = line.getBoundingClientRect();
    top = r.top;
    length = r.height;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(road.clientWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = `${road.clientWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sections.forEach((s, i) => {
      markEls[i].style.top = `${top + progressOf(s.el) * length}px`;
    });
  };
  layout();
  new ResizeObserver(layout).observe(document.body);
  window.addEventListener('resize', layout);

  // Motion state
  let targetP = 0;
  let p = 0;
  let vel = 0;
  let boost = 0;
  interface Puff {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    life: number; // 1 → 0
    decay: number;
  }
  const puffs: Puff[] = [];
  const maxPuffs = 160;
  let emitAcc = 0;

  const readScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    targetP = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  };
  readScroll();
  window.addEventListener('scroll', readScroll, { passive: true });

  // Navigation clicks (anchors) give the car a visible burst.
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (a) boost = 1;
  });

  const cx = road.clientWidth / 2;
  const smokeColor = () => getComputedStyle(road).getPropertyValue('--smoke').trim() || '150,150,160';

  let last = performance.now();
  let activeIdx = -1;
  const frame = (now: number) => {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
    last = now;

    // Spring-ish follow: smooth but quick on long jumps.
    const k = reduced ? 1 : 1 - Math.pow(0.0005, dt);
    const prev = p;
    p += (targetP - p) * k;
    vel = (p - prev) / Math.max(dt, 0.001); // progress per second
    boost = Math.max(0, boost - dt * 1.4);

    const y = top + p * length;
    const speed = Math.min(1, Math.abs(vel) * 1.4 + boost * 0.6);

    // Car transform: face direction of travel, tiny lean with speed.
    // Headlights are at the top of the SVG: face down (180°) when travelling down, up (0°) when travelling up.
    const dir = vel < -0.002 ? 0 : 180;
    car.style.transform = `translate(-50%, -50%) translateY(${y}px) rotate(${dir}deg) scale(${1 + speed * 0.08})`;
    car.classList.toggle('is-moving', speed > 0.05);

    // Smoke: emitted from the tail (opposite to direction of travel).
    if (!reduced) {
      const up = vel < 0;
      const tailY = y + (up ? -20 : 20);
      // Emission rate scales with speed; a faint idle wisp when stopped.
      emitAcc += dt * (speed > 0.03 ? 24 + speed * 170 : 1.5);
      while (emitAcc >= 1 && puffs.length < maxPuffs) {
        emitAcc -= 1;
        const side = Math.random() < 0.5 ? -1 : 1;
        puffs.push({
          x: cx + side * 5 + (Math.random() - 0.5) * 3,
          y: tailY + (Math.random() - 0.5) * 4,
          vx: side * (6 + Math.random() * 10) + (Math.random() - 0.5) * 6,
          vy: (up ? 1 : -1) * (10 + Math.random() * 20) * (0.4 + speed),
          r: 2.5 + Math.random() * 2.5 + speed * 3,
          life: 1,
          decay: 0.9 + Math.random() * 0.6,
        });
      }
      emitAcc = Math.max(0, Math.min(emitAcc, 3));

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const rgb = smokeColor();
      for (let i = puffs.length - 1; i >= 0; i--) {
        const q = puffs[i];
        q.life -= dt * q.decay;
        if (q.life <= 0) {
          puffs.splice(i, 1);
          continue;
        }
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        q.vx *= 1 - dt * 1.2;
        q.vy *= 1 - dt * 1.5;
        q.r += dt * 14; // smoke expands as it cools
        const a = Math.pow(q.life, 1.6) * 0.42;
        const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r);
        g.addColorStop(0, `rgba(${rgb},${a})`);
        g.addColorStop(0.6, `rgba(${rgb},${a * 0.45})`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Active marker
    let idx = -1;
    sections.forEach((s, i) => {
      if (p + 0.02 >= progressOf(s.el)) idx = i;
    });
    if (idx !== activeIdx) {
      activeIdx = idx;
      markEls.forEach((m, i) => m.classList.toggle('is-active', i === idx));
    }

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

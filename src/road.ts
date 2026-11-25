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
  const trail: { y: number; a: number; w: number }[] = [];
  const maxTrail = 90;

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
  const carColor = () => getComputedStyle(road).getPropertyValue('--trail').trim() || '#3451b2';

  let last = performance.now();
  let activeIdx = -1;
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
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
    const dir = vel < -0.002 ? 180 : 0;
    car.style.transform = `translate(-50%, -50%) translateY(${y}px) rotate(${dir}deg) scale(${1 + speed * 0.08})`;
    car.classList.toggle('is-moving', speed > 0.05);

    // Trail
    if (!reduced) {
      trail.unshift({ y, a: 0.1 + speed * 0.9, w: 2 + speed * 6 });
      if (trail.length > maxTrail) trail.length = maxTrail;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const color = carColor();
      ctx.lineCap = 'round';
      for (let i = 1; i < trail.length; i++) {
        const t0 = trail[i - 1];
        const t1 = trail[i];
        const fade = 1 - i / trail.length;
        const alpha = t0.a * fade * fade;
        if (alpha < 0.01) continue;
        // glow pass
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha * 0.35;
        ctx.lineWidth = t0.w * 2.2;
        ctx.beginPath();
        ctx.moveTo(cx, t0.y);
        ctx.lineTo(cx, t1.y);
        ctx.stroke();
        // core pass
        ctx.globalAlpha = alpha;
        ctx.lineWidth = t0.w * 0.7;
        ctx.beginPath();
        ctx.moveTo(cx, t0.y);
        ctx.lineTo(cx, t1.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // Decay old samples even when stationary so the trail dies out.
      for (const t of trail) t.a *= 0.97;
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

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

  // Motion state (pixels along the road)
  let targetP = 0;
  let yCar = 0; // current position (px, page-space top offset)
  let vCar = 0; // px/s, positive = down
  let aCar = 0; // px/s² last frame
  let heading = 0; // degrees: 0 faces down, 180 faces up
  let squash = 0; // -1 (braking) .. +1 (accelerating), damped
  let idleT = 0; // seconds parked
  let nextIdlePuff = 1.2;
  let initialised = false;
  const MAX_V = 2600;
  const ACCEL = 5200;
  const BRAKE = 4600;

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

  const cx = road.clientWidth / 2;
  const smokeColor = () => getComputedStyle(road).getPropertyValue('--smoke').trim() || '150,150,160';

  let last = performance.now();
  let activeIdx = -1;
  let tAll = 0;
  const frame = (now: number) => {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
    last = now;
    tAll += dt;

    const yTarget = top + targetP * length;
    if (!initialised) {
      yCar = yTarget;
      initialised = true;
    }

    // ── Drive model: accelerate toward target, brake so we stop on it.
    const dist = yTarget - yCar;
    const dir = Math.sign(dist);
    const stopDist = (vCar * vCar) / (2 * BRAKE);
    let accel = 0;
    if (reduced) {
      yCar = yTarget;
      vCar = 0;
    } else if (Math.abs(dist) < 0.6 && Math.abs(vCar) < 40) {
      // Parked.
      yCar = yTarget;
      vCar = 0;
    } else if (Math.sign(vCar) !== 0 && Math.sign(vCar) !== dir) {
      // Travelling the wrong way: brake first (this is the U-turn moment).
      accel = -Math.sign(vCar) * BRAKE;
    } else if (Math.abs(dist) <= stopDist * 1.02) {
      // Close enough that we must brake to land on the marker.
      accel = -dir * BRAKE;
    } else {
      accel = dir * ACCEL;
    }
    if (!reduced && vCar !== 0 || accel !== 0) {
      const vPrev = vCar;
      vCar = Math.max(-MAX_V, Math.min(MAX_V, vCar + accel * dt));
      // Don't let braking push us past zero into reverse.
      if (accel !== 0 && Math.sign(vPrev) !== 0 && Math.sign(vCar) !== Math.sign(vPrev) && Math.abs(dist) < 6) vCar = 0;
      yCar += vCar * dt;
      // Never overshoot by more than a hair; a tiny settle is handled by squash.
      if ((dir > 0 && yCar > yTarget + 3) || (dir < 0 && yCar < yTarget - 3)) {
        yCar = yTarget + dir * 3;
        vCar *= -0.18; // soft rebound → little settle
      }
    }
    aCar = accel;

    const p = Math.min(1, Math.max(0, (yCar - top) / length));
    const speed = Math.min(1, Math.abs(vCar) / MAX_V);
    const moving = Math.abs(vCar) > 30 || Math.abs(dist) > 2;

    // ── Heading: rotate smoothly toward direction of travel (U-turn swing).
    const wantHeading = Math.abs(dist) > 2 ? (dir > 0 ? 0 : 180) : heading > 90 ? 180 : 0;
    const turnRate = 1 - Math.pow(0.0008, dt);
    heading += (wantHeading - heading) * turnRate;
    const turnFrac = Math.min(1, Math.abs(wantHeading - heading) / 180); // 0 when aligned
    const swing = Math.sin(turnFrac * Math.PI) * 11; // lateral arc during the U-turn

    // ── Body squash/stretch from acceleration (reads as weight transfer).
    const squashTarget = Math.max(-1, Math.min(1, (aCar * Math.sign(vCar || dir || 1)) / ACCEL));
    squash += (squashTarget - squash) * (1 - Math.pow(0.001, dt));
    const sy = 1 + squash * 0.07;
    const sx = 1 - squash * 0.04;

    // ── Idle: engine tremble + occasional exhaust puff.
    let jitterX = 0;
    let jitterY = 0;
    if (!moving && !reduced) {
      idleT += dt;
      jitterX = Math.sin(tAll * 95) * 0.35 + Math.sin(tAll * 61) * 0.2;
      jitterY = Math.sin(tAll * 83) * 0.25;
    } else {
      idleT = 0;
      nextIdlePuff = 1.2 + Math.random() * 1.6;
    }

    const bob = moving ? Math.sin(tAll * 40) * speed * 0.6 : 0;
    car.style.transform =
      `translate(-50%, -50%) translate(${swing + jitterX + bob}px, ${yCar + jitterY}px) ` +
      `rotate(${heading}deg) scale(${sx}, ${sy})`;
    car.classList.toggle('is-moving', moving);

    const y = yCar;
    // Smoke: emitted from the tail (opposite to direction of travel).
    if (!reduced) {
      const up = heading > 90;
      const tailY = y + (up ? -20 : 20);
      // Emission: throttle-heavy (accelerating smokes most), plus speed; idle gives periodic puffs.
      const throttle = aCar * Math.sign(vCar || dir || 1) > 0 ? 1 : 0;
      if (moving) {
        emitAcc += dt * (14 + speed * 110 + throttle * 90);
      } else if (idleT > nextIdlePuff) {
        emitAcc += 3;
        nextIdlePuff = idleT + 1.4 + Math.random() * 2.2;
      }
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

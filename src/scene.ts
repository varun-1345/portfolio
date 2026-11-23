import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type Theme = 'light' | 'dark';

interface Palette {
  body: string;
  eye: string;
  eyeEmissive: string;
  key: string;
  rim: string;
  fill: string;
  hemiSky: string;
  hemiGround: string;
  envIntensity: number;
  rimIntensity: number;
}

const PALETTES: Record<Theme, Palette> = {
  light: {
    body: '#f3f1fa',
    eye: '#1b1b21',
    eyeEmissive: '#000000',
    key: '#ffffff',
    rim: '#b7c4ff',
    fill: '#dce1ff',
    hemiSky: '#ffffff',
    hemiGround: '#c6c5d0',
    envIntensity: 0.35,
    rimIntensity: 1.2,
  },
  dark: {
    body: '#0e0e14',
    eye: '#f2f0f7',
    eyeEmissive: '#9aa7e6',
    key: '#9aa7e6',
    rim: '#b7c4ff',
    fill: '#1f2340',
    hemiSky: '#2a2f4a',
    hemiGround: '#000000',
    envIntensity: 0.05,
    rimIntensity: 2.6,
  },
};

/**
 * A minimal stylised figure (head + shoulders) that watches the cursor.
 */
export class CharacterScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private figure = new THREE.Group();
  private head = new THREE.Group();
  private eyes: THREE.Mesh[] = [];
  private bodyMat: THREE.MeshPhysicalMaterial;
  private eyeMat: THREE.MeshStandardMaterial;
  private key: THREE.DirectionalLight;
  private rim: THREE.DirectionalLight;
  private fill: THREE.DirectionalLight;
  private hemi: THREE.HemisphereLight;

  private clock = new THREE.Clock();
  private pointer = new THREE.Vector2();
  private pointerTarget = new THREE.Vector2();
  private hasPointer = false;
  private scroll = 0;
  private running = false;
  private inView = true;
  private raf = 0;
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private ro: ResizeObserver;
  private targets = new Map<THREE.Color, THREE.Color>();

  private nextBlink = 2.5;
  private blinkT = -1;

  constructor(private container: HTMLElement, theme: Theme) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    this.camera.position.set(0, 0.2, 11.5);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const p = PALETTES[theme];
    this.hemi = new THREE.HemisphereLight(p.hemiSky, p.hemiGround, 0.6);
    this.key = new THREE.DirectionalLight(p.key, 1.2);
    this.key.position.set(3, 5, 6);
    this.fill = new THREE.DirectionalLight(p.fill, 0.5);
    this.fill.position.set(-5, 1, 4);
    this.rim = new THREE.DirectionalLight(p.rim, p.rimIntensity);
    this.rim.position.set(-2, 3, -6);
    this.scene.add(this.hemi, this.key, this.fill, this.rim);

    this.bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(p.body),
      roughness: 0.55,
      metalness: 0,
      clearcoat: 0.25,
      clearcoatRoughness: 0.5,
      sheen: 0.5,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color(p.rim),
      envMapIntensity: p.envIntensity,
    });
    this.eyeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(p.eye),
      emissive: new THREE.Color(p.eyeEmissive),
      emissiveIntensity: 0.35,
      roughness: 0.35,
      metalness: 0,
    });

    // Torso + sloping shoulders from a smooth lathe profile, flattened front-to-back.
    const profile = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, -3.6, 0),
      new THREE.Vector3(2.05, -3.6, 0),
      new THREE.Vector3(2.05, -1.7, 0),
      new THREE.Vector3(1.95, -0.9, 0),
      new THREE.Vector3(1.55, -0.35, 0),
      new THREE.Vector3(0.95, 0.05, 0),
      new THREE.Vector3(0.5, 0.28, 0),
      new THREE.Vector3(0.42, 0.42, 0),
      new THREE.Vector3(0.0, 0.42, 0),
    ]);
    const pts = profile.getPoints(64).map((v) => new THREE.Vector2(Math.max(0, v.x), v.y));
    const torsoGeo = new THREE.LatheGeometry(pts, 96);
    torsoGeo.computeVertexNormals();
    const torso = new THREE.Mesh(torsoGeo, this.bodyMat);
    torso.scale.set(1, 1, 0.62);
    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 0.9, 48, 1, true), this.bodyMat);
    neck.position.y = 0.55;
    // Head
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), this.bodyMat);
    headMesh.scale.set(0.9, 1.06, 0.92);
    this.head.add(headMesh);
    this.head.position.y = 1.85;

    // Eyes: tall ovals on the front of the head.
    const eyeGeo = new THREE.SphereGeometry(0.1, 32, 24);
    for (const sx of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, this.eyeMat);
      eye.scale.set(1, 1.45, 0.5);
      eye.position.set(sx * 0.3, 0.22, 0.84);
      eye.lookAt(sx * 0.9, 0.5, 4);
      this.head.add(eye);
      this.eyes.push(eye);
    }

    this.figure.add(torso, neck, this.head);
    this.figure.position.y = -1.1;
    this.scene.add(this.figure);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.resize();
    this.setTheme(theme, true);

    window.addEventListener('pointermove', this.onPointer, { passive: true });
    window.addEventListener('pointerleave', () => (this.hasPointer = false));
    window.addEventListener('scroll', this.onScroll, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stop();
      else if (this.inView) this.start();
    });
    new IntersectionObserver(
      ([e]) => {
        this.inView = e.isIntersecting;
        if (e.isIntersecting && !document.hidden) this.start();
        else this.stop();
      },
      { threshold: 0.02 },
    ).observe(container);
  }

  setTheme(theme: Theme, immediate = false) {
    const p = PALETTES[theme];
    const set = (c: THREE.Color, hex: string) => {
      const t = new THREE.Color(hex);
      if (immediate) c.copy(t);
      this.targets.set(c, t);
    };
    set(this.bodyMat.color, p.body);
    set(this.bodyMat.sheenColor, p.rim);
    set(this.eyeMat.color, p.eye);
    set(this.eyeMat.emissive, p.eyeEmissive);
    set(this.key.color, p.key);
    set(this.rim.color, p.rim);
    set(this.fill.color, p.fill);
    set(this.hemi.color, p.hemiSky);
    set(this.hemi.groundColor, p.hemiGround);
    this.bodyMat.envMapIntensity = p.envIntensity;
    this.rim.intensity = p.rimIntensity;
    this.key.intensity = theme === 'dark' ? 0.45 : 1.2;
    this.fill.intensity = theme === 'dark' ? 0.25 : 0.5;
    this.hemi.intensity = theme === 'dark' ? 0.35 : 0.6;
    this.bodyMat.sheen = theme === 'dark' ? 0.25 : 0.5;
    this.bodyMat.clearcoat = theme === 'dark' ? 0.4 : 0.25;
    this.eyeMat.emissiveIntensity = theme === 'dark' ? 0.5 : 0;
    if (!this.running) this.render(0);
  }

  private onPointer = (e: PointerEvent) => {
    this.hasPointer = true;
    this.pointerTarget.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  };

  private onScroll = () => {
    const h = this.container.clientHeight || window.innerHeight;
    this.scroll = Math.min(1, Math.max(0, window.scrollY / h));
  };

  private resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // Keep the figure a sensible size on narrow screens.
    const s = w < 720 ? 0.78 : Math.min(1, Math.max(0.85, (w / h) * 0.62));
    this.figure.scale.setScalar(s);
    if (!this.running) this.render(0);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    const loop = () => {
      if (!this.running) return;
      this.render(this.clock.getDelta());
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private render(dt: number) {
    const t = this.clock.elapsedTime;
    const m = this.reduced ? 0 : 1;
    const k = 1 - Math.pow(0.002, dt || 0.016);

    // Where to look: cursor, or a slow idle wander when there's no pointer.
    if (!this.hasPointer) {
      this.pointerTarget.set(Math.sin(t * 0.35) * 0.35, Math.sin(t * 0.23 + 1) * 0.15);
    }
    this.pointer.lerp(this.pointerTarget, k * 0.6);

    const px = this.pointer.x * m;
    const py = this.pointer.y * m;

    // Head turns toward the cursor; body follows a little.
    const yaw = px * 0.55;
    const pitch = -py * 0.38 + 0.02;
    this.head.rotation.y += (yaw - this.head.rotation.y) * 0.12;
    this.head.rotation.x += (pitch - this.head.rotation.x) * 0.12;
    this.head.rotation.z = -px * 0.06;
    this.figure.rotation.y += (px * 0.18 - this.figure.rotation.y) * 0.08;

    // Idle breathing + scroll drift.
    const breathe = Math.sin(t * 1.4) * 0.02 * m;
    const baseY = -1.1 + breathe - this.scroll * 1.8;
    this.figure.position.y += (baseY - this.figure.position.y) * 0.15;

    // Blink.
    if (this.blinkT < 0 && t > this.nextBlink && m) {
      this.blinkT = 0;
      this.nextBlink = t + 2.5 + Math.random() * 4;
    }
    let eyeScaleY = 1.45;
    if (this.blinkT >= 0) {
      this.blinkT += dt;
      const d = 0.16;
      const u = Math.min(1, this.blinkT / d);
      eyeScaleY = 1.45 * (1 - Math.sin(u * Math.PI) * 0.92);
      if (u >= 1) this.blinkT = -1;
    }
    for (const [i, eye] of this.eyes.entries()) {
      eye.scale.y = eyeScaleY;
      // Pupils glance slightly further than the head.
      const sx = i === 0 ? -1 : 1;
      eye.position.x = sx * 0.3 + px * 0.05;
      eye.position.y = 0.22 + py * 0.04;
    }

    // Camera parallax.
    this.camera.position.x += (px * 0.2 - this.camera.position.x) * 0.05;
    this.camera.position.y += (0.2 + py * 0.1 - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0.1, 0);

    for (const [c, target] of this.targets) if (!c.equals(target)) c.lerp(target, 0.1);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.ro.disconnect();
    window.removeEventListener('pointermove', this.onPointer);
    window.removeEventListener('scroll', this.onScroll);
    this.renderer.dispose();
  }
}

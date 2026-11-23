import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SimplexNoise } from './noise';

export type Theme = 'light' | 'dark';

interface Palette {
  blob: string;
  torus: string;
  capsule: string;
  sphereA: string;
  sphereB: string;
  key: string;
  rim: string;
  ambientSky: string;
  ambientGround: string;
  envIntensity: number;
}

const PALETTES: Record<Theme, Palette> = {
  light: {
    blob: '#97aaff',
    torus: '#f6c6e9',
    capsule: '#3451b2',
    sphereA: '#dfe1f9',
    sphereB: '#76546e',
    key: '#ffffff',
    rim: '#ffd7f2',
    ambientSky: '#ffffff',
    ambientGround: '#dce1ff',
    envIntensity: 0.4,
  },
  dark: {
    blob: '#3b58c4',
    torus: '#e5badb',
    capsule: '#b7c4ff',
    sphereA: '#434659',
    sphereB: '#ffd7f2',
    key: '#dce1ff',
    rim: '#e5badb',
    ambientSky: '#3a4d9a',
    ambientGround: '#131318',
    envIntensity: 0.3,
  },
};

interface Satellite {
  mesh: THREE.Mesh;
  radius: number;
  tilt: number;
  speed: number;
  phase: number;
  yAmp: number;
  spin: THREE.Vector3;
}

export class HeroScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private group = new THREE.Group();
  private blob: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>;
  private basePositions: Float32Array;
  private satellites: Satellite[] = [];
  private noise = new SimplexNoise(7);
  private clock = new THREE.Clock();
  private pointer = new THREE.Vector2(0, 0);
  private pointerTarget = new THREE.Vector2(0, 0);
  private pointerWorld = new THREE.Vector3();
  private scroll = 0;
  private running = false;
  private raf = 0;
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private keyLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private hemi: THREE.HemisphereLight;
  private targetColors = new Map<THREE.Material, THREE.Color>();
  private ro: ResizeObserver;

  constructor(private container: HTMLElement, theme: Theme) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    this.camera.position.set(0, 0, 11);

    // Environment for soft physically-based reflections.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Lights
    this.hemi = new THREE.HemisphereLight(0xffffff, 0xdce1ff, 0.55);
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    this.keyLight.position.set(4, 6, 6);
    this.rimLight = new THREE.DirectionalLight(0xffd7f2, 0.9);
    this.rimLight.position.set(-6, -2, -4);
    this.scene.add(this.hemi, this.keyLight, this.rimLight);

    // Main sculpture
    const geo = new THREE.SphereGeometry(1.55, 128, 96);
    this.basePositions = (geo.attributes.position.array as Float32Array).slice();
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(PALETTES[theme].blob),
      roughness: 0.42,
      metalness: 0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.4,
      sheen: 0.3,
      sheenRoughness: 0.6,
      envMapIntensity: PALETTES[theme].envIntensity,
    });
    this.blob = new THREE.Mesh(geo, mat);
    this.group.add(this.blob);

    // Satellites: layered Material-ish shapes
    const mk = (g: THREE.BufferGeometry, color: string, rough = 0.4) =>
      new THREE.Mesh(
        g,
        new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(color),
          roughness: rough,
          metalness: 0,
          clearcoat: 0.5,
          clearcoatRoughness: 0.4,
          envMapIntensity: PALETTES[theme].envIntensity,
        }),
      );
    const p = PALETTES[theme];
    this.addSatellite(mk(new THREE.TorusGeometry(0.42, 0.16, 32, 96), p.torus), 2.5, 0.55, 0.16, 0.3, 0.35);
    this.addSatellite(mk(new THREE.CapsuleGeometry(0.17, 0.6, 12, 32), p.capsule, 0.3), 2.5, -0.7, 0.22, 2.4, 0.5);
    this.addSatellite(mk(new THREE.SphereGeometry(0.26, 48, 32), p.sphereA), 2.35, 0.25, -0.19, 4.2, 0.25);
    this.addSatellite(mk(new THREE.SphereGeometry(0.14, 32, 24), p.sphereB), 2.8, -0.35, 0.28, 1.1, 0.6);

    this.scene.add(this.group);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.resize();
    this.setTheme(theme, true);

    window.addEventListener('pointermove', this.onPointer, { passive: true });
    window.addEventListener('scroll', this.onScroll, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stop();
      else if (this.inView) this.start();
    });

    const io = new IntersectionObserver(
      ([e]) => {
        this.inView = e.isIntersecting;
        if (e.isIntersecting && !document.hidden) this.start();
        else this.stop();
      },
      { threshold: 0.02 },
    );
    io.observe(container);
  }

  private inView = true;

  private addSatellite(mesh: THREE.Mesh, radius: number, tilt: number, speed: number, phase: number, yAmp: number) {
    this.group.add(mesh);
    this.satellites.push({
      mesh,
      radius,
      tilt,
      speed,
      phase,
      yAmp,
      spin: new THREE.Vector3(Math.random() * 0.6 + 0.2, Math.random() * 0.6 + 0.2, Math.random() * 0.3),
    });
  }

  setTheme(theme: Theme, immediate = false) {
    const p = PALETTES[theme];
    const set = (mat: THREE.Material, hex: string) => {
      const c = new THREE.Color(hex);
      if (immediate) (mat as THREE.MeshPhysicalMaterial).color.copy(c);
      this.targetColors.set(mat, c);
    };
    set(this.blob.material, p.blob);
    const [torus, capsule, sA, sB] = this.satellites.map((s) => s.mesh.material as THREE.MeshPhysicalMaterial);
    set(torus, p.torus);
    set(capsule, p.capsule);
    set(sA, p.sphereA);
    set(sB, p.sphereB);
    for (const m of [this.blob.material, torus, capsule, sA, sB]) m.envMapIntensity = p.envIntensity;
    this.keyLight.color.set(p.key);
    this.rimLight.color.set(p.rim);
    this.hemi.color.set(p.ambientSky);
    this.hemi.groundColor.set(p.ambientGround);
    this.hemi.intensity = theme === 'dark' ? 0.45 : 0.55;
    this.keyLight.intensity = theme === 'dark' ? 0.95 : 1.1;
    if (!this.running) this.render(0);
  }

  private onPointer = (e: PointerEvent) => {
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
    // Place the sculpture on the right on wide layouts, centred on narrow ones.
    const wide = w > 920;
    this.group.position.x = wide ? Math.min(3.2, (w / h) * 1.55) : 0.5;
    this.group.position.y = wide ? 0.1 : 1.3;
    const scale = wide ? Math.min(1, Math.max(0.8, (w / h) * 0.55)) : Math.max(0.65, Math.min(0.9, w / 700));
    this.group.scale.setScalar(scale);
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
    const motion = this.reduced ? 0 : 1;

    // Smooth pointer
    this.pointer.lerp(this.pointerTarget, 1 - Math.pow(0.001, dt || 0.016));

    // Deform blob
    const pos = this.blob.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const base = this.basePositions;
    const time = t * 0.35 * motion;
    const freq = 0.95;
    const amp = 0.17;
    // Pointer influence in blob-local space
    this.pointerWorld.set(this.pointer.x * 2.2, this.pointer.y * 1.6, 1.8).normalize();
    const v = new THREE.Vector3();
    for (let i = 0; i < arr.length; i += 3) {
      const x = base[i], y = base[i + 1], z = base[i + 2];
      v.set(x, y, z).normalize();
      let n = this.noise.noise3D(v.x * freq + time, v.y * freq + time * 0.8, v.z * freq - time * 0.6);
      n += 0.18 * this.noise.noise3D(v.x * 1.9 - time * 0.5, v.y * 1.9 + time * 0.3, v.z * 1.9 + time * 0.4);
      // gentle bulge toward the pointer
      const d = Math.max(0, v.dot(this.pointerWorld));
      const bulge = d * d * d * 0.14 * motion;
      const r = 1 + n * amp + bulge;
      arr[i] = x * r;
      arr[i + 1] = y * r;
      arr[i + 2] = z * r;
    }
    pos.needsUpdate = true;
    this.blob.geometry.computeVertexNormals();

    // Group motion: idle rotation + pointer tilt + scroll
    const targetRotX = -this.pointer.y * 0.22 + this.scroll * 0.4;
    const targetRotY = this.pointer.x * 0.3 + t * 0.08 * motion + this.scroll * 1.1;
    this.group.rotation.x += (targetRotX - this.group.rotation.x) * 0.06;
    this.group.rotation.y += (targetRotY - this.group.rotation.y) * 0.06;
    this.blob.rotation.z = t * 0.05 * motion;
    this.group.position.y += ((this.scroll * 1.6 + (this.container.clientWidth > 920 ? 0.1 : 1.3)) - this.group.position.y) * 0.08;

    // Satellites
    for (const s of this.satellites) {
      const a = s.phase + t * s.speed * motion;
      const x = Math.cos(a) * s.radius;
      const z = Math.sin(a) * s.radius;
      const y = Math.sin(a * 1.3) * s.yAmp;
      s.mesh.position.set(x, y * Math.cos(s.tilt) + z * Math.sin(s.tilt) * 0.3, z * Math.cos(s.tilt) - y * Math.sin(s.tilt));
      s.mesh.rotation.x += s.spin.x * dt * motion;
      s.mesh.rotation.y += s.spin.y * dt * motion;
    }

    // Camera parallax
    this.camera.position.x += (this.pointer.x * 0.25 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.pointer.y * 0.18 - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0.15, 0);

    // Theme colour transitions
    for (const [mat, target] of this.targetColors) {
      const c = (mat as THREE.MeshPhysicalMaterial).color;
      if (!c.equals(target)) c.lerp(target, 0.08);
    }

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

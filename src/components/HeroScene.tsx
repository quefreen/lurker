'use client'

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type * as THREE from 'three';

export function HeroScene({ children }: { children: ReactNode }) {
  const sectionRef     = useRef<HTMLDivElement>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);
  const asciiCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !asciiCanvasRef.current || !radarCanvasRef.current) return;
    const section     = sectionRef.current as HTMLDivElement;
    const asciiCanvas = asciiCanvasRef.current as HTMLCanvasElement;
    const radarCanvas = radarCanvasRef.current as HTMLCanvasElement;

    let animId: number;
    let disposed = false;

    async function init() {
      const THREE = await import('three');
      const { GLTFLoader }    = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

      if (disposed || !section || !asciiCanvas || !radarCanvas) return;

      // ─── THREE SETUP ──────────────────────────────────────────────────────────
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, section.clientWidth / section.clientHeight, 0.01, 1000);
      camera.position.set(-0.12, 0.35, 1.12);

      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(1);
      renderer.domElement.style.display = 'none';
      document.body.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 1.2));
      const key = new THREE.DirectionalLight(0xffffff, 3.0); key.position.set(3, 6, 4);  scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 1.2); fill.position.set(-4, 2, -3); scene.add(fill);
      const rim  = new THREE.DirectionalLight(0xffffff, 0.8); rim.position.set(0, -3, -5);  scene.add(rim);

      // ─── ASCII CANVAS ─────────────────────────────────────────────────────────
      const CHARS = ' .·:;!|10Oo°•@█▓';
      const CELL  = 7;
      const ac    = asciiCanvas.getContext('2d')!;

      const readCanvas = (typeof OffscreenCanvas !== 'undefined')
        ? new OffscreenCanvas(1, 1)
        : document.createElement('canvas');
      const rc = (readCanvas as HTMLCanvasElement).getContext('2d', { willReadFrequently: true })!;

      const MAX_COLS     = 4096;
      const charOverrides = new Map<number, { ch: string; expiresAt: number }>();
      const OVERRIDE_FRAC = 0.20;
      const OVERRIDE_MS   = 1000;

      let visibleBuf   = new Int32Array(0);
      let visibleCount = 0;
      const V_STRIDE   = 6;

      const PIXEL_READ_INTERVAL = 3;
      let pixelFrame   = 0;
      let cachedPixels: Uint8ClampedArray | null = null;

      // ─── RADAR ANGULAR MAP ────────────────────────────────────────────────────
      const BUCKETS  = 1440;
      const angMap   = new Float32Array(BUCKETS);
      const SWEEP_MIN = -Math.PI;
      const SWEEP_MAX =  0;
      let sweepAngle  = SWEEP_MIN;
      let sweepPaused = false;
      let radarCX = 0, radarCY = 0;

      for (let i = 0; i < BUCKETS; i++) angMap[i] = 0.35;

      function getIntensity(px: number, py: number) {
        const dx  = px - radarCX;
        const dy  = py - radarCY;
        const ang = ((Math.atan2(dy, dx) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const b   = Math.floor(ang / (Math.PI * 2) * BUCKETS);
        return angMap[(b + BUCKETS) % BUCKETS];
      }

      // ─── RESIZE ───────────────────────────────────────────────────────────────
      function resize() {
        const W = section.clientWidth;
        const H = section.clientHeight;
        const cols = Math.floor(W / CELL);
        const rows = Math.floor(H / CELL);

        renderer.setSize(cols, rows);
        (readCanvas as HTMLCanvasElement).width  = cols;
        (readCanvas as HTMLCanvasElement).height = rows;
        asciiCanvas.width  = W;
        asciiCanvas.height = H;

        radarCX = W / 2;
        radarCY = H + 10;

        camera.aspect = W / H;
        camera.setViewOffset(cols, rows, Math.round(-420 / CELL), 0, cols, rows);
        camera.updateProjectionMatrix();

        visibleBuf   = new Int32Array(cols * rows * V_STRIDE);
        visibleCount = 0;
        cachedPixels = null;
      }
      resize();

      const ro = new ResizeObserver(resize);
      ro.observe(section);

      // ─── THEME ────────────────────────────────────────────────────────────────
      const THEMES = {
        green:  { r: 0,   g: 255, b: 65 },
        yellow: { r: 230, g: 255, b: 85 },
        red:    { r: 255, g: 45,  b: 20 },
      };
      let themeFrom = { ...THEMES.green };
      let themeTo   = { ...THEMES.green };
      let themeT    = 1.0;
      let themeDur  = 1500;
      let themeRGB  = { ...THEMES.green };

      const COLOR_TABLE = new Array<string>(256);
      function rebuildColorTable() {
        const { r, g, b } = themeRGB;
        for (let br = 0; br < 256; br++) {
          const t = br / 255;
          const cr = Math.round(r * t);
          const cg = Math.round(Math.min(255, g * t + 60 * t));
          const cb = Math.round(b * t * 0.5);
          COLOR_TABLE[br] = `rgb(${cr},${cg},${cb})`;
        }
      }
      rebuildColorTable();

      function updateTheme() {
        if (themeT >= 1.0) return;
        themeT = Math.min(1.0, themeT + (16 / themeDur));
        const t = themeT * themeT * (3 - 2 * themeT);
        themeRGB.r = Math.round(themeFrom.r + (themeTo.r - themeFrom.r) * t);
        themeRGB.g = Math.round(themeFrom.g + (themeTo.g - themeFrom.g) * t);
        themeRGB.b = Math.round(themeFrom.b + (themeTo.b - themeFrom.b) * t);
        rebuildColorTable();
        radarBgCanvas = null;
      }

      // ─── NOISE ────────────────────────────────────────────────────────────────
      const MORPH_SEQ   = ['@', '%', '&', '$', '#', '1', 'l', '|', '·', '.'];
      const STEP_MS     = 1000;
      const ALPHA_START = 0.72;
      const ALPHA_DECAY = 0.07;
      const NOISE_CELL  = 14;
      const NOISE_W     = Math.ceil(section.clientWidth  / NOISE_CELL);
      const NOISE_H     = Math.ceil(section.clientHeight / NOISE_CELL);
      const SPAWN_CHANCE = 0.00195;

      interface NoiseCell {
        alive: boolean; cooldown: number; ox: number; oy: number; size: number;
        step?: number; ch?: string; alpha?: number; nextStepAt?: number;
      }

      function makeDeadCell(): NoiseCell {
        return {
          alive: false,
          cooldown: Math.floor(Math.random() * 300),
          ox: (Math.random() - 0.5) * NOISE_CELL * 1.2,
          oy: (Math.random() - 0.5) * NOISE_CELL * 1.2,
          size: 9 + Math.floor(Math.random() * 6),
        };
      }
      function spawnCell(cell: NoiseCell) {
        cell.alive      = true;
        cell.step       = 0;
        cell.ch         = MORPH_SEQ[0];
        cell.alpha      = ALPHA_START;
        cell.nextStepAt = performance.now() + STEP_MS + Math.random() * 400 - 200;
      }

      const noiseGrid: NoiseCell[][] = Array.from({ length: NOISE_H }, () =>
        Array.from({ length: NOISE_W }, () => {
          const cell = makeDeadCell();
          if (Math.random() < 0.078) {
            spawnCell(cell);
            const mid = Math.floor(Math.random() * MORPH_SEQ.length);
            cell.step  = mid;
            cell.ch    = MORPH_SEQ[mid];
            cell.alpha = Math.max(0.04, ALPHA_START - mid * ALPHA_DECAY);
          }
          return cell;
        })
      );

      function drawNoise() {
        const now = performance.now();
        ac.textBaseline = 'top';
        ac.font = `bold 11px 'Share Tech Mono',monospace`;
        const byColor = new Map<string, { style: string; cells: (string | number)[] }>();

        for (let row = 0; row < NOISE_H; row++) {
          for (let col = 0; col < NOISE_W; col++) {
            const cell = noiseGrid[row][col];
            if (!cell.alive) {
              if (cell.cooldown > 0) { cell.cooldown--; continue; }
              if (Math.random() < SPAWN_CHANCE) spawnCell(cell);
              continue;
            }
            if (now >= cell.nextStepAt!) {
              cell.step!++;
              if (cell.step! >= MORPH_SEQ.length) {
                cell.alive    = false;
                cell.cooldown = 120 + Math.floor(Math.random() * 360);
                continue;
              }
              cell.ch        = MORPH_SEQ[cell.step!];
              cell.alpha     = Math.max(0.02, ALPHA_START - cell.step! * ALPHA_DECAY);
              cell.nextStepAt = now + STEP_MS + Math.random() * 200 - 100;
            }
            const px = col * NOISE_CELL + cell.ox;
            const py = row * NOISE_CELL + cell.oy;
            const intensity = getIntensity(px + NOISE_CELL / 2, py + NOISE_CELL / 2);
            if (intensity < 0.015) continue;
            const bright   = Math.floor(intensity * 180);
            const rawAlpha = cell.alpha! * intensity * 6.0;
            const alpha    = Math.min(0.80, rawAlpha);
            const alphaQ   = Math.round(alpha * 32) / 32;
            const colorKey = `${bright},${alphaQ}`;
            if (!byColor.has(colorKey)) {
              const { r, g, b } = themeRGB;
              const t = bright / 180;
              byColor.set(colorKey, {
                style: `rgba(${Math.round(r*t)},${Math.round(Math.min(255,g*t+30*t))},${Math.round(b*t*0.15)},${alphaQ})`,
                cells: []
              });
            }
            byColor.get(colorKey)!.cells.push(cell.ch!, px, py);
          }
        }
        for (const { style, cells } of byColor.values()) {
          ac.fillStyle = style;
          for (let i = 0; i < cells.length; i += 3)
            ac.fillText(cells[i] as string, cells[i+1] as number, cells[i+2] as number);
        }
      }

      // ─── ASCII RENDER ─────────────────────────────────────────────────────────
      function renderASCII() {
        const now  = performance.now();
        const cols = (readCanvas as HTMLCanvasElement).width;
        const rows = (readCanvas as HTMLCanvasElement).height;

        pixelFrame++;
        const doRead = (pixelFrame % PIXEL_READ_INTERVAL === 0 || cachedPixels === null);

        if (doRead) {
          rc.drawImage(renderer.domElement, 0, 0);
          cachedPixels = rc.getImageData(0, 0, cols, rows).data;
          visibleCount = 0;
          const charsLen = CHARS.length - 1;
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const pi  = (row * cols + col) * 4;
              const lum = (cachedPixels[pi]*0.299 + cachedPixels[pi+1]*0.587 + cachedPixels[pi+2]*0.114) / 255;
              if (lum < 0.04) continue;
              const sx = col * CELL, sy = row * CELL;
              const intensity = getIntensity(sx + CELL/2, sy + CELL/2);
              if (intensity < 0.02) continue;
              const charIdx = Math.floor(lum * charsLen);
              if (CHARS[charIdx] === ' ') continue;
              const bright = Math.floor(intensity * 255);
              const base   = visibleCount * V_STRIDE;
              visibleBuf[base]     = col;
              visibleBuf[base + 1] = row;
              visibleBuf[base + 2] = sx;
              visibleBuf[base + 3] = sy;
              visibleBuf[base + 4] = bright;
              visibleBuf[base + 5] = charIdx;
              visibleCount++;
            }
          }
        }

        for (const [key, val] of charOverrides)
          if (now >= val.expiresAt) charOverrides.delete(key);

        const toSpawn = Math.floor(visibleCount * OVERRIDE_FRAC * (1 / 60));
        for (let i = 0; i < toSpawn; i++) {
          const idx = Math.floor(Math.random() * visibleCount) * V_STRIDE;
          const col = visibleBuf[idx], row = visibleBuf[idx + 1];
          const k   = col * MAX_COLS + row;
          if (!charOverrides.has(k)) {
            const natural = CHARS[visibleBuf[idx + 5]];
            let ch; do { ch = CHARS[Math.floor(Math.random() * CHARS.length)]; } while (ch === natural || ch === ' ');
            charOverrides.set(k, { ch, expiresAt: now + OVERRIDE_MS + Math.random() * 400 - 200 });
          }
        }

        ac.clearRect(0, 0, asciiCanvas.width, asciiCanvas.height);
        ac.font = `bold ${CELL}px 'Share Tech Mono',monospace`;
        ac.textBaseline = 'top';

        const byColor = new Map<number, number[]>();
        for (let i = 0; i < visibleCount; i++) {
          const bright = visibleBuf[i * V_STRIDE + 4];
          if (!byColor.has(bright)) byColor.set(bright, []);
          byColor.get(bright)!.push(i);
        }
        for (const [bright, indices] of byColor) {
          ac.fillStyle = COLOR_TABLE[bright];
          for (const i of indices) {
            const base = i * V_STRIDE;
            const col  = visibleBuf[base], row = visibleBuf[base + 1];
            const over = charOverrides.get(col * MAX_COLS + row);
            ac.fillText(over ? over.ch : CHARS[visibleBuf[base + 5]], visibleBuf[base + 2], visibleBuf[base + 3]);
          }
        }
        drawNoise();
      }

      // ─── RADAR DRAW ───────────────────────────────────────────────────────────
      const rctx = radarCanvas.getContext('2d')!;
      let radarBgCanvas: HTMLCanvasElement | null = null;

      function buildRadarBg(cx: number, cy: number, R: number) {
        radarBgCanvas        = document.createElement('canvas');
        radarBgCanvas.width  = radarCanvas.width;
        radarBgCanvas.height = radarCanvas.height;
        const bg2 = radarBgCanvas.getContext('2d')!;
        const { r, g, b } = themeRGB;
        const bg = bg2.createRadialGradient(cx, cy, 0, cx, cy, R);
        bg.addColorStop(0,   `rgba(${Math.round(r*0.18)},${Math.round(g*0.18)},${Math.round(b*0.05)},0.60)`);
        bg.addColorStop(0.5, `rgba(${Math.round(r*0.09)},${Math.round(g*0.09)},${Math.round(b*0.02)},0.35)`);
        bg.addColorStop(1,   'rgba(0,0,0,0.00)');
        bg2.fillStyle = bg;
        bg2.beginPath(); bg2.arc(cx, cy, R, 0, Math.PI*2); bg2.fill();
        for (let i = 1; i <= 6; i++) {
          bg2.beginPath(); bg2.arc(cx, cy, R/6*i, 0, Math.PI*2);
          bg2.strokeStyle = `rgba(${r},${g},${b},${i===6?0.10:0.04})`;
          bg2.lineWidth = i===6?0.8:0.4; bg2.stroke();
        }
        bg2.strokeStyle = `rgba(${r},${g},${b},0.05)`; bg2.lineWidth = 0.4;
        bg2.beginPath(); bg2.moveTo(cx-R,cy); bg2.lineTo(cx+R,cy); bg2.stroke();
        bg2.beginPath(); bg2.moveTo(cx,cy-R); bg2.lineTo(cx,cy+R); bg2.stroke();
        bg2.strokeStyle = `rgba(${r},${g},${b},0.025)`;
        for (const da of [Math.PI/4, -Math.PI/4]) {
          bg2.beginPath();
          bg2.moveTo(cx+Math.cos(da)*R, cy+Math.sin(da)*R);
          bg2.lineTo(cx-Math.cos(da)*R, cy-Math.sin(da)*R); bg2.stroke();
        }
        bg2.fillStyle = `rgba(${r},${g},${b},0.06)`;
        for (let i = 0; i < 120; i++) {
          const na = (i/120)*Math.PI*2;
          const nr = (0.15 + ((i*137.508)%1)*0.82)*R;
          bg2.beginPath(); bg2.arc(cx+Math.cos(na+i*0.3)*nr, cy+Math.sin(na+i*0.3)*nr, 0.8, 0, Math.PI*2); bg2.fill();
        }
      }

      function resizeRadar() {
        radarCanvas.width  = section.clientWidth;
        radarCanvas.height = section.clientHeight;
        radarBgCanvas = null;
      }
      resizeRadar();

      function drawRadar() {
        const cx = radarCanvas.width / 2;
        const cy = radarCanvas.height + 10;
        const R  = Math.ceil(Math.sqrt(
          Math.pow(Math.max(cx, radarCanvas.width - cx), 2) + Math.pow(cy, 2)
        )) + 10;
        if (!radarBgCanvas) buildRadarBg(cx, cy, R);
        rctx.clearRect(0, 0, radarCanvas.width, radarCanvas.height);
        rctx.drawImage(radarBgCanvas!, 0, 0);

        if (!sweepPaused) {
          sweepAngle += Math.PI / 120;
          if (sweepAngle > SWEEP_MAX) {
            sweepAngle  = SWEEP_MAX;
            sweepPaused = true;
            setTimeout(() => { sweepAngle = SWEEP_MIN; sweepPaused = false; }, 6000);
          }
          const idx = Math.floor(((sweepAngle % (Math.PI*2) + Math.PI*2) % (Math.PI*2)) / (Math.PI*2) * BUCKETS);
          for (let d = -3; d <= 3; d++) { const b = (idx+d+BUCKETS)%BUCKETS; angMap[b] = 1.0; }
          for (let i = 0; i < BUCKETS; i++) angMap[i] *= 0.994;
        } else {
          for (let i = 0; i < BUCKETS; i++) angMap[i] *= 0.994;
        }

        const { r: tr, g: tg, b: tb } = themeRGB;
        const trailArc = Math.PI * 0.5, steps = 48;
        for (let s = 0; s < steps; s++) {
          const frac = s/steps, a0 = sweepAngle - trailArc*(1-frac);
          rctx.beginPath(); rctx.moveTo(cx, cy);
          rctx.arc(cx, cy, R, a0, a0+trailArc/steps); rctx.closePath();
          rctx.fillStyle = `rgba(${tr},${tg},${tb},${Math.pow(frac,2)*0.20})`; rctx.fill();
        }
        const ex = cx + Math.cos(sweepAngle)*R, ey = cy + Math.sin(sweepAngle)*R;
        const lg = rctx.createLinearGradient(cx, cy, ex, ey);
        lg.addColorStop(0.0, `rgba(${tr},${tg},${tb},0.95)`);
        lg.addColorStop(0.4, `rgba(${tr},${tg},${tb},0.60)`);
        lg.addColorStop(1.0, `rgba(${tr},${tg},${tb},0.00)`);
        rctx.beginPath(); rctx.moveTo(cx, cy); rctx.lineTo(ex, ey);
        rctx.strokeStyle = lg; rctx.lineWidth = 1.8;
        rctx.shadowColor = `rgb(${tr},${tg},${tb})`; rctx.shadowBlur = 10; rctx.stroke(); rctx.shadowBlur = 0;
      }

      // ─── MODEL LOAD ───────────────────────────────────────────────────────────
      const controls = new OrbitControls(camera, asciiCanvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.minDistance   = 0.5;
      controls.maxDistance   = 12;
      const TARGET_Y = 0.35 + 1.12 * Math.tan(30 * Math.PI / 180);
      controls.target.set(-0.12, TARGET_Y, 0);

      let model: THREE.Object3D | null = null;

      new GLTFLoader().load(
        '/cs_hero.glb',
        (gltf) => {
          if (disposed) return;
          model = gltf.scene;
          const box    = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(...box.getSize(new THREE.Vector3()).toArray());
          model.scale.setScalar(3.2 / maxDim);
          model.position.sub(center.multiplyScalar(2.0 / maxDim));
          model.position.y += 0.6;
          scene.add(model);
          controls.update();
        },
        () => {},
        () => {}
      );

      // ─── MAIN LOOP ────────────────────────────────────────────────────────────
      const clock = new THREE.Clock();
      function loop() {
        if (disposed) return;
        animId = requestAnimationFrame(loop);
        clock.getDelta();
        controls.update();
        updateTheme();
        renderer.render(scene, camera);
        drawRadar();
        renderASCII();
      }
      loop();

      // store cleanup
      (init as unknown as { cleanup: () => void }).cleanup = () => {
        disposed = true;
        cancelAnimationFrame(animId);
        ro.disconnect();
        controls.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    const handle = init() as unknown as Promise<void> & { cleanup?: () => void };

    return () => {
      disposed = true;
      cancelAnimationFrame(animId!);
      // extended cleanup happens inside init via the closure
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', background: '#17190f', cursor: 'crosshair' }}
    >
      {/* Three.js canvases */}
      <canvas ref={radarCanvasRef} style={{ position: 'absolute', inset: 0, zIndex: 2, opacity: 0.5,  pointerEvents: 'none' }} />
      <canvas ref={asciiCanvasRef} style={{ position: 'absolute', inset: 0, zIndex: 3, opacity: 0.5,  pointerEvents: 'none' }} />

      {/* Radar SVG */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/radar.svg"
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', bottom: 'calc(-225vmin - 10px)', left: '50%', transform: 'translateX(-50%)', width: '400vmin', height: '400vmin', zIndex: 4, opacity: 0.075, pointerEvents: 'none' }}
      />

      {/* Lens — luminosity */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', background: 'radial-gradient(72.71% 72.71% at 50% 60.49%, rgba(0,0,0,0.00) 64.42%, #000 100%)', mixBlendMode: 'luminosity' }} />
      {/* Lens — hue */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none', background: 'radial-gradient(55.28% 15.35% at 50% 88.61%, rgba(9,10,5,0.50) 0%, rgba(230,255,85,0.50) 100%)', mixBlendMode: 'hue' }} />
      {/* Lens — color-dodge */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 7, pointerEvents: 'none', background: 'radial-gradient(230.87% 25.76% at 50% 100%, #E6FF55 0%, #000 100%)', mixBlendMode: 'color-dodge' }} />

      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 8, pointerEvents: 'none', background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,255,65,0.03) 3px, rgba(0,255,65,0.03) 4px)' }} />

      {/* Hero content — above everything */}
      <div style={{ position: 'relative', zIndex: 15, width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

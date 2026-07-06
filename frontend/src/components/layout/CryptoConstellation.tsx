'use client';
import React, { useEffect, useRef } from 'react';

/**
 * Animated background: dozens of tiny crypto symbols drift through space,
 * then converge to form the "BC" Bridge Capital mark, hold it, and disperse —
 * looping forever. Pure canvas, no dependencies.
 */

const GLYPHS = ['₿', 'Ξ', '₮', '◎', '⬡', '✕', 'Ł', 'Ð', '₳', '$', '●', '▲'];
const GOLD = '#E8B547';
const WHITE = '#E6EDF3';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number; // target x (logo formation)
  ty: number; // target y
  glyph: string;
  size: number;
  color: string;
  alpha: number;
  targetAlpha: number;
  phase: number; // for drift wobble
}

type Stage = 'drift' | 'converge' | 'hold' | 'disperse';

export function CryptoConstellation({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let stage: Stage = 'drift';
    let stageStart = performance.now();

    const STAGE_DURATION: Record<Stage, number> = {
      drift: 3500,
      converge: 3000,
      hold: 3500,
      disperse: 2000,
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      // Container hidden or collapsed (e.g. mobile breakpoints) — skip entirely.
      // Reading pixels from a 0-size canvas throws on iOS Safari.
      if (width < 40 || height < 40) {
        particles = [];
        return;
      }
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildTargets();
    };

    // Sample pixel positions from offscreen-rendered "BC" text → logo formation targets
    const buildTargets = () => {
      if (width < 40 || height < 40) return;
      const off = document.createElement('canvas');
      off.width = width;
      off.height = height;
      const octx = off.getContext('2d');
      if (!octx) return;

      const fontSize = Math.min(width, height) * 0.52;
      octx.fillStyle = '#fff';
      octx.font = `900 ${fontSize}px Arial, sans-serif`;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillText('BC', width / 2, height / 2 - fontSize * 0.02);
      // Bridge arc under the letters
      octx.lineWidth = Math.max(4, fontSize * 0.045);
      octx.strokeStyle = '#fff';
      octx.beginPath();
      octx.moveTo(width / 2 - fontSize * 0.75, height / 2 + fontSize * 0.42);
      octx.quadraticCurveTo(width / 2, height / 2 + fontSize * 0.12, width / 2 + fontSize * 0.75, height / 2 + fontSize * 0.42);
      octx.stroke();

      let img: Uint8ClampedArray;
      try {
        img = octx.getImageData(0, 0, width, height).data;
      } catch {
        particles = [];
        return;
      }
      const targets: { x: number; y: number }[] = [];
      const step = Math.max(6, Math.floor(Math.min(width, height) / 42));
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          if (img[(y * width + x) * 4 + 3] > 128) {
            targets.push({ x, y });
          }
        }
      }

      // (Re)build particles matched to target count
      const count = Math.min(targets.length, 220);
      // shuffle targets
      for (let i = targets.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [targets[i], targets[j]] = [targets[j], targets[i]];
      }

      particles = Array.from({ length: count }, (_, i) => {
        const existing = particles[i];
        const t = targets[i];
        return {
          x: existing?.x ?? Math.random() * width,
          y: existing?.y ?? Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          tx: t.x,
          ty: t.y,
          glyph: GLYPHS[i % GLYPHS.length],
          size: 7 + Math.random() * 7,
          color: Math.random() > 0.35 ? GOLD : WHITE,
          alpha: existing?.alpha ?? 0.25 + Math.random() * 0.5,
          targetAlpha: 0.3 + Math.random() * 0.55,
          phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const frame = (now: number) => {
      const elapsed = now - stageStart;
      const duration = STAGE_DURATION[stage];
      if (elapsed > duration) {
        stage = stage === 'drift' ? 'converge' : stage === 'converge' ? 'hold' : stage === 'hold' ? 'disperse' : 'drift';
        stageStart = now;
        if (stage === 'disperse') {
          particles.forEach((p) => {
            p.vx = (Math.random() - 0.5) * 1.6;
            p.vy = (Math.random() - 0.5) * 1.6;
          });
        }
      }

      ctx.clearRect(0, 0, width, height);
      const progress = Math.min(elapsed / duration, 1);

      for (const p of particles) {
        if (stage === 'drift' || stage === 'disperse') {
          p.x += p.vx + Math.sin(now / 1600 + p.phase) * 0.18;
          p.y += p.vy + Math.cos(now / 1900 + p.phase) * 0.18;
          // soft wrap
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;
        } else if (stage === 'converge') {
          const t = easeInOut(progress);
          p.x += (p.tx - p.x) * (0.02 + t * 0.12);
          p.y += (p.ty - p.y) * (0.02 + t * 0.12);
        } else {
          // hold — tiny shimmer around target
          p.x += (p.tx + Math.sin(now / 700 + p.phase) * 1.1 - p.x) * 0.2;
          p.y += (p.ty + Math.cos(now / 800 + p.phase) * 1.1 - p.y) * 0.2;
        }

        const a =
          stage === 'hold'
            ? Math.min(p.targetAlpha + 0.25, 1)
            : stage === 'converge'
            ? p.targetAlpha + progress * 0.25
            : p.targetAlpha * (stage === 'disperse' ? 1 - progress * 0.35 : 1);

        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.font = `${p.size}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.glyph, p.x, p.y);
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-hidden
    />
  );
}

"use client";

import { useEffect, useRef } from "react";

/** A quiet field of ink-like strokes that bends around the pointer. */
export function InteractiveField() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const surface = canvas.current;
    const panel = surface?.parentElement;
    const ctx = surface?.getContext("2d");
    if (!surface || !panel || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let width = 0, height = 0, frame = 0;
    let x = -500, y = -500, targetX = -500, targetY = -500;
    let strength = 0, targetStrength = 0;

    const draw = () => {
      frame = 0;
      if (!width || !height || document.hidden) return;
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      strength += (targetStrength - strength) * 0.1;
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";
      // Curved columns echo a turning page, rather than a flat dot grid.
      for (let row = -1; row < height / 28 + 1; row++) {
        for (let col = -1; col < width / 30 + 1; col++) {
          const baseY = row * 28 + (col % 2) * 10;
          const wave = Math.sin(baseY / 170 + col * 0.13);
          const baseX = col * 30 + wave * 30;
          const dx = baseX - x, dy = baseY - y;
          const distance = Math.hypot(dx, dy);
          const force = Math.pow(Math.max(0, 1 - distance / 190), 2) * strength;
          const angle = Math.sin(baseY / 180 + col * 0.15) * 0.55 + force * 1.9;
          const px = baseX + dx * force * 0.27 - dy * force * 0.12;
          const py = baseY + dy * force * 0.27 + dx * force * 0.12;
          const length = 2.2 + (wave + 1) * 1.2 + force * 6;
          // Keep the reading area quiet; give the outer edge more texture.
          const edge = 0.2 + 0.8 * Math.pow(Math.max(0, baseX / width), 1.6);
          const alpha = (0.17 + force * 0.44) * edge;
          ctx.strokeStyle = (row + col) % 5 === 0
            ? `rgba(250,177,36,${alpha})`
            : `rgba(143,159,219,${alpha * 0.85})`;
          ctx.lineWidth = 1.25 + force * 0.55;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + Math.cos(angle) * length, py + Math.sin(angle) * length);
          ctx.stroke();
        }
      }
      if (!reduced.matches && (Math.abs(strength - targetStrength) > 0.002 ||
        (strength > 0.002 && (Math.abs(x - targetX) + Math.abs(y - targetY)) > 0.1))) {
        frame = requestAnimationFrame(draw);
      }
    };
    const wake = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const resize = () => {
      const bounds = panel.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const scale = Math.min(devicePixelRatio || 1, 2);
      surface.width = Math.round(width * scale);
      surface.height = Math.round(height * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      wake();
    };
    const move = (event: PointerEvent) => {
      if (reduced.matches || !fine.matches || event.pointerType === "touch") return;
      const bounds = panel.getBoundingClientRect();
      targetX = event.clientX - bounds.left;
      targetY = event.clientY - bounds.top;
      if (!targetStrength && strength < 0.002) { x = targetX; y = targetY; }
      targetStrength = 1;
      wake();
    };
    const leave = () => { targetStrength = 0; wake(); };
    const preference = () => {
      targetStrength = strength = 0;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      wake();
    };
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else wake();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(panel);
    panel.addEventListener("pointermove", move, { passive: true });
    panel.addEventListener("pointerleave", leave);
    reduced.addEventListener("change", preference);
    fine.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      panel.removeEventListener("pointermove", move);
      panel.removeEventListener("pointerleave", leave);
      reduced.removeEventListener("change", preference);
      fine.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}

import React, { useCallback, useEffect, useRef, useState } from "react";

export interface MapView {
  k: number;
  x: number;
  y: number;
  /** Viewport width when saved; a different width falls back to fit. */
  w: number;
}

type Transform = {k: number;x: number;y: number;};

interface Options {
  contentW: number;
  contentH: number;
  /** Fill the parent's height instead of sizing to content. */
  fill?: boolean;
  initialView?: MapView | null;
  onViewChange?: (v: MapView) => void;
  onBackgroundClick?: () => void;
  onEscape?: () => void;
}

/** Automatic focus zoom stays in a gentle, readable band relative to the fitted overview. */
const FOCUS_MIN = 1.15;
const FOCUS_MAX = 1.25;
const ANIM_MS = 380;

/** Shared drag-to-pan / zoom behaviour for the organization map and the isolated workflow branch. */
export function usePanZoom({ contentW: W, contentH: H, fill = false, initialView = null, onViewChange, onBackgroundClick, onEscape }: Options) {
  const vpRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [t, setT] = useState<Transform>(() => initialView ? { k: initialView.k, x: initialView.x, y: initialView.y } : { k: 1, x: 0, y: 0 });
  const [animating, setAnimating] = useState(false);
  const tRef = useRef(t);
  tRef.current = t;
  const restore = useRef(initialView);
  const drag = useRef<{px: number;py: number;x: number;y: number;moved: boolean;} | null>(null);
  const animTimer = useRef<number>();

  const base = fill ? Math.min(size.w / W, size.h / H) || 1 : Math.max(0.62, Math.min(1, size.w / W || 1));
  const viewH = fill ? size.h : Math.round(H * base);

  const animateTo = useCallback((next: Transform) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.clearTimeout(animTimer.current);
    if (!reduce) {
      setAnimating(true);
      animTimer.current = window.setTimeout(() => setAnimating(false), ANIM_MS);
    }
    setT(next);
  }, []);
  useEffect(() => () => window.clearTimeout(animTimer.current), []);

  const fit = useCallback(() => {
    setT({ k: base, x: Math.max(0, (size.w - W * base) / 2), y: fill ? Math.max(0, (size.h - H * base) / 2) : 0 });
  }, [base, size.w, size.h, fill, W, H]);

  useEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    if (!size.w) return;
    const saved = restore.current;
    restore.current = null;
    if (saved && Math.abs(saved.w - size.w) < 2) return;
    fit();
  }, [size.w, size.h, fit]);

  const onViewRef = useRef(onViewChange);
  onViewRef.current = onViewChange;
  useEffect(() => {
    if (size.w) onViewRef.current?.({ ...t, w: size.w });
  }, [t, size.w]);

  const zoomAt = useCallback(
    (factor: number, cx?: number, cy?: number) =>
    setT((p) => {
      const k = Math.min(base * 2.5, Math.max(base * 0.7, p.k * factor));
      const px = cx ?? size.w / 2;
      const py = cy ?? viewH / 2;
      return { k, x: px - (px - p.x) * (k / p.k), y: py - (py - p.y) * (k / p.k) };
    }),
    [base, size.w, viewH]
  );

  /**
   * Gently centres a content point. Zoom only rises into a 115–125% band and never compounds:
   * selecting another node keeps the current focus zoom. A manual zoom above the band is respected.
   */
  const focusOn = useCallback(
    (cx: number, cy: number, insetRight = 0) => {
      const p = tRef.current;
      const lo = base * FOCUS_MIN;
      const hi = base * FOCUS_MAX;
      const k = p.k > hi ? p.k : Math.min(hi, Math.max(p.k, lo));
      const vw = Math.max(200, size.w - insetRight);
      animateTo({ k, x: vw / 2 - cx * k, y: viewH / 2 - cy * k });
    },
    [base, size.w, viewH, animateTo]
  );

  const getView = useCallback((): Transform => tRef.current, []);

  useEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      setAnimating(false);
      drag.current = { px: e.clientX, py: e.clientY, x: t.x, y: t.y, moved: false };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.px;
      const dy = e.clientY - d.py;
      if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
      if (d.moved) setT((p) => ({ ...p, x: d.x + dx, y: d.y + dy }));
    },
    onPointerUp: () => {
      if (drag.current && !drag.current.moved) onBackgroundClick?.();
      drag.current = null;
    },
    onPointerCancel: () => {
      drag.current = null;
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.target !== e.currentTarget) {
        if (e.key === "Escape") onEscape?.();
        return;
      }
      const step = 48;
      const moves: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
      if (moves[e.key]) {
        e.preventDefault();
        setT((p) => ({ ...p, x: p.x + moves[e.key][0], y: p.y + moves[e.key][1] }));
      } else if (e.key === "+" || e.key === "=") zoomAt(1.2);else
      if (e.key === "-") zoomAt(1 / 1.2);else
      if (e.key === "Escape") onEscape?.();
    }
  };

  return {
    vpRef,
    handlers,
    fit,
    zoomAt,
    focusOn,
    getView,
    setView: animateTo,
    width: size.w,
    pct: Math.round(t.k / base * 100),
    viewportStyle: { height: fill ? "100%" : viewH } as React.CSSProperties,
    contentStyle: {
      width: W,
      height: H,
      transform: `translate(${t.x}px, ${t.y}px) scale(${t.k})`,
      transition: animating ? `transform ${ANIM_MS}ms cubic-bezier(0.22, 1, 0.36, 1)` : undefined
    } as React.CSSProperties
  };
}
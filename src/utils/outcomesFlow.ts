import { histogramStart, monthlyVolume } from "../data/outcomesFlow";
import type { FlowEdge, RoleNode } from "../types/outcomes";

/** Stroke width for a handoff count (log scale: 10 → thin, 1,000 → thick). */
export const widthFor = (count: number) => Math.max(0.6, 0.6 + (Math.log10(Math.max(count, 1)) - 1) * 2.4);

/** Two quadratic segments meeting at the curve midpoint, so a mid-marker arrow sits on the curve. */
export function edgeGeometry(e: FlowEdge, nodes: Record<string, RoleNode>) {
  const a = nodes[e.from];
  const b = nodes[e.to];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = (a.x + b.x) / 2 + -dy / len * e.bend;
  const cy = (a.y + b.y) / 2 + dx / len * e.bend;
  const mx = 0.25 * a.x + 0.5 * cx + 0.25 * b.x;
  const my = 0.25 * a.y + 0.5 * cy + 0.25 * b.y;
  const c1 = { x: (a.x + cx) / 2, y: (a.y + cy) / 2 };
  const c2 = { x: (cx + b.x) / 2, y: (cy + b.y) / 2 };
  return {
    d: `M${a.x},${a.y} Q${c1.x},${c1.y} ${mx},${my} Q${c2.x},${c2.y} ${b.x},${b.y}`,
    mid: { x: mx, y: my }
  };
}

const monthIndex = (iso: string) => {
  const [y, m] = iso.split("-").map(Number);
  const [sy, sm] = histogramStart.split("-").map(Number);
  return (y - sy) * 12 + (m - sm);
};

/** Which histogram months fall inside a date range. */
export function monthsInRange(from: string, to: string) {
  const a = Math.max(0, monthIndex(from));
  const b = Math.min(monthlyVolume.length - 1, monthIndex(to));
  return { a, b };
}

/** Share of all permits raised inside the window (0–1). */
export function rangeShare(from: string, to: string) {
  if (!from || !to || from > to) return 0;
  const { a, b } = monthsInRange(from, to);
  const total = monthlyVolume.reduce((s, v) => s + v, 0);
  const sel = monthlyVolume.slice(a, b + 1).reduce((s, v) => s + v, 0);
  return total ? sel / total : 0;
}

export const formatCount = (n: number) => n.toLocaleString("en-US");
import type { Lane, ProcessDiff, ProcessModel, ProcessTask } from "../types/bestPractice";

export const LANE_LABEL_W = 170;
export const COL_W = 196;
export const NODE_W = 164;
export const NODE_H = 60;
export const ROW_H = 76;
const LANE_PAD = 16;

export interface LaneBox {
  lane: Lane;
  y: number;
  h: number;
}

export interface ProcessLayout {
  width: number;
  height: number;
  lanes: LaneBox[];
  pos: (t: ProcessTask) => {x: number;y: number;};
}

/** Shared grid for both models so the as-is and target maps line up exactly when overlaid. */
export function buildLayout(lanes: Lane[], models: ProcessModel[]): ProcessLayout {
  const rows: Record<string, number> = {};
  let maxCol = 0;
  models.forEach((m) => m.tasks.forEach((t) => {
    rows[t.lane] = Math.max(rows[t.lane] ?? 1, t.row + 1);
    maxCol = Math.max(maxCol, t.col);
  }));
  let y = 12;
  const boxes: LaneBox[] = lanes.map((lane) => {
    const h = (rows[lane.id] ?? 1) * ROW_H + LANE_PAD;
    const box = { lane, y, h };
    y += h + 6;
    return box;
  });
  const byLane = Object.fromEntries(boxes.map((b) => [b.lane.id, b]));
  return {
    width: LANE_LABEL_W + (maxCol + 1) * COL_W + 40,
    height: y + 6,
    lanes: boxes,
    pos: (t) => ({
      x: LANE_LABEL_W + t.col * COL_W,
      y: byLane[t.lane].y + LANE_PAD / 2 + t.row * ROW_H + (ROW_H - NODE_H) / 2
    })
  };
}

/** Orthogonal route between two nodes; backward links run underneath. */
export function edgePath(a: {x: number;y: number;}, b: {x: number;y: number;}) {
  const y1 = a.y + NODE_H / 2;
  const y2 = b.y + NODE_H / 2;
  const x1 = a.x + NODE_W;
  const x2 = b.x;
  if (x2 > x1 + 8) {
    const mid = x1 + Math.min(24, (x2 - x1) / 2);
    return { d: `M${x1},${y1} H${mid} V${y2} H${x2 - 2}`, lx: (mid + x2) / 2, ly: y2 };
  }
  if (Math.abs(a.x - b.x) < 4) {
    const gx = a.x - 12;
    return { d: `M${a.x},${y1} H${gx} V${y2} H${b.x - 2}`, lx: gx, ly: (y1 + y2) / 2 };
  }
  const low = Math.max(a.y, b.y) + NODE_H + 8;
  return { d: `M${a.x + NODE_W / 2},${a.y + NODE_H} V${low} H${b.x + NODE_W / 2} V${b.y + NODE_H + 2}`, lx: (a.x + b.x + NODE_W) / 2, ly: low };
}

export function formatWait(h?: number) {
  if (h === undefined) return null;
  if (h === 0) return "no wait";
  if (h < 1 / 60) return `${Math.max(1, Math.round(h * 3600))} s`;
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 48) return `${h.toFixed(1).replace(/\.0$/, "")} h`;
  return `${(h / 24).toFixed(1).replace(/\.0$/, "")} d`;
}

export function processCounts(m: ProcessModel) {
  const lanes = new Set(m.tasks.map((t) => t.lane));
  lanes.delete("source");
  return { tasks: m.tasks.length, transitions: m.transitions.length, departments: lanes.size };
}

/** Differences between the as-is and target designs, ordered by impact. */
export function diffProcesses(asIs: ProcessModel, target: ProcessModel, laneLabel: (id: string) => string): ProcessDiff[] {
  const tIds = new Map(target.tasks.map((t) => [t.id, t]));
  const aIds = new Map(asIs.tasks.map((t) => [t.id, t]));
  const out: ProcessDiff[] = [];
  asIs.tasks.forEach((a) => {
    if (!tIds.has(a.id)) out.push({ id: `rm-${a.id}`, kind: "removed", taskId: a.id, lane: laneLabel(a.lane), title: a.label, detail: a.kind === "hidden" ? `Hidden work removed · ${a.events.toLocaleString()} events` : `Step removed · ${a.events.toLocaleString()} events` });
  });
  target.tasks.forEach((t) => {
    if (!aIds.has(t.id)) {
      out.push({ id: `add-${t.id}`, kind: t.kind === "control" ? "controlled" : "added", taskId: t.id, lane: laneLabel(t.lane), title: t.label, detail: t.kind === "control" ? `Added control · applies to ${t.events.toLocaleString()} events` : `New step · ${t.events.toLocaleString()} events` });
      return;
    }
    const a = aIds.get(t.id)!;
    if (a.waitH !== undefined && t.targetH !== undefined && t.targetH < a.waitH) out.push({ id: `fast-${t.id}`, kind: "faster", taskId: t.id, lane: laneLabel(t.lane), title: t.label, detail: `Wait ${formatWait(a.waitH)} → target ${formatWait(t.targetH)}` });else
    if (a.status === "critical" && t.status === "verified") out.push({ id: `fix-${t.id}`, kind: "controlled", taskId: t.id, lane: laneLabel(t.lane), title: t.label, detail: "Critical gap closed in the target design" });
  });
  const order = { controlled: 0, removed: 1, faster: 2, added: 3 };
  return out.sort((x, y) => order[x.kind] - order[y.kind]);
}
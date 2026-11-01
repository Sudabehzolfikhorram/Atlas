import { periods, processMaps, timelineMonths } from "../data/processMaps";
import type {
  ChangeType,
  MapMode,
  PeriodKey,
  ProcessChange,
  ProcessDefinition,
  ProcessEdge,
  ProcessId,
  ProcessStep,
  StepVersion } from
"../types/processMap";

export const LAST_MONTH = timelineMonths.length - 1;
export const VIEW_W = 960;
export const VIEW_H = 320;

export function getProcess(id: ProcessId): ProcessDefinition {
  return processMaps.find((p) => p.id === id) ?? processMaps[0];
}

export function getPeriod(key: PeriodKey) {
  return periods.find((p) => p.key === key) ?? periods[0];
}

export function periodStart(key: PeriodKey): number {
  return getPeriod(key).start;
}

export function clampMonth(key: PeriodKey, month: number): number {
  return Math.max(periodStart(key), Math.min(LAST_MONTH, month));
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function stepWait(process: ProcessDefinition, version: StepVersion | undefined, month: number): number | null {
  if (!version || version.waitDays === undefined) return null;
  return round1(version.waitDays * process.trend[month]);
}

export function waitSeries(process: ProcessDefinition, version: StepVersion | undefined, start: number, month: number): number[] {
  const out: number[] = [];
  for (let m = start; m <= month; m++) {
    const w = stepWait(process, version, m);
    if (w !== null) out.push(w);
  }
  return out;
}

export function casesAt(process: ProcessDefinition, month: number): number {
  return process.monthlyCases[month];
}

export function casesInPeriod(process: ProcessDefinition, period: PeriodKey, month: number): number {
  let sum = 0;
  for (let m = periodStart(period); m <= month; m++) sum += process.monthlyCases[m];
  return sum;
}

export function volume(process: ProcessDefinition, share: number | undefined, month: number): number | null {
  if (share === undefined) return null;
  return Math.round(process.monthlyCases[month] * share);
}

/** One scale per process across all months and both layers so flow widths are comparable. */
export function volumeScale(process: ProcessDefinition): number {
  return Math.max(...process.monthlyCases);
}

export type Compatibility = {ok: true;} | {ok: false;reason: string;};

export function recommendationCompatibility(process: ProcessDefinition, period: PeriodKey): Compatibility {
  if (!process.recommendation) {
    return { ok: false, reason: process.unavailableReason ?? "No recommendation is available for this process yet." };
  }
  if (!process.recommendation.baselines.includes(period)) {
    const available = process.recommendation.baselines.map((k) => getPeriod(k).label).join(" or ");
    return {
      ok: false,
      reason: `${process.recommendation.version} wasn't built on the ${getPeriod(period).label} baseline, so it can't be compared on this period. Available baselines: ${available}.`
    };
  }
  return { ok: true };
}

export function edgesFor(process: ProcessDefinition, variant: "current" | "recommended"): ProcessEdge[] {
  return variant === "current" ? process.currentEdges : process.recommendation?.edges ?? [];
}

export function stepsFor(process: ProcessDefinition, variant: "current" | "recommended"): ProcessStep[] {
  return process.steps.filter((s) => variant === "current" ? s.current : s.recommended);
}

export function changeForStep(process: ProcessDefinition, stepId: string): ProcessChange | undefined {
  return process.recommendation?.changes.find((c) => c.stepIds.includes(stepId));
}

export function changeForEdge(process: ProcessDefinition, edgeId: string): ProcessChange | undefined {
  return process.recommendation?.changes.find((c) => c.edgeIds.includes(edgeId));
}

/** The change affecting a step — directly, or via a handoff-only change that ends at this step. */
export function stepChange(process: ProcessDefinition, stepId: string): ProcessChange | undefined {
  const changes = process.recommendation?.changes ?? [];
  return (
    changes.find((c) => c.stepIds.includes(stepId)) ??
    changes.find((c) => c.stepIds.length === 0 && c.edgeIds.some((id) => id.endsWith(`>${stepId}`))));

}

/** Resolve any selectable id (change, step or edge) to the change it belongs to. */
export function resolveChange(process: ProcessDefinition, id: string | null): ProcessChange | undefined {
  if (!id) return undefined;
  const changes = process.recommendation?.changes ?? [];
  return changes.find((c) => c.id === id) ?? changeForStep(process, id) ?? changeForEdge(process, id);
}

export function defaultSelection(process: ProcessDefinition, variant: "current" | "recommended"): string {
  if (variant === "recommended") {
    const firstChanged = process.recommendation?.changes.find((c) => c.stepIds.length)?.stepIds[0];
    if (firstChanged) return firstChanged;
  }
  const withIssue = process.steps.find((s) => s.current?.issue && (variant === "current" || s.recommended));
  return withIssue?.id ?? stepsFor(process, variant)[0]?.id ?? process.steps[0].id;
}

export function isValidSelection(process: ProcessDefinition, variant: "current" | "recommended", id: string | null): boolean {
  if (!id) return false;
  if (stepsFor(process, variant).some((s) => s.id === id)) return true;
  return edgesFor(process, variant).some((e) => e.id === id);
}

export const changeMeta: Record<ChangeType, {label: string;chip: string;color: string;}> = {
  added: { label: "Added", chip: "border-violet-400/40 bg-violet-400/10 text-violet-200", color: "#A78BFA" },
  removed: { label: "Removed", chip: "border-rose-400/40 bg-rose-400/10 text-rose-200", color: "#FB7185" },
  modified: { label: "Modified", chip: "border-amber-400/40 bg-amber-400/10 text-amber-200", color: "#FBBF24" },
  reordered: { label: "Reordered", chip: "border-sky-400/40 bg-sky-400/10 text-sky-200", color: "#38BDF8" }
};

/* ---------- Geometry (shared layout for every version and layer) ---------- */

export const COL_X0 = 74;
export const COL_STEP = 136;
const ROW_Y = [80, 160, 240];
export const BOX_W = 124;
export const BOX_H = 46;

export function stepPoint(step: ProcessStep): {x: number;y: number;} {
  return { x: COL_X0 + step.col * COL_STEP, y: ROW_Y[step.row] };
}

export function nodeSize(mode: MapMode, vol: number | null, scale: number): {w: number;h: number;} {
  if (mode === "relationships") return { w: BOX_W, h: BOX_H };
  return { w: 16, h: vol === null ? 40 : 18 + 52 * (vol / scale) };
}

export function edgePath(
a: {x: number;y: number;},
aSize: {w: number;h: number;},
b: {x: number;y: number;},
bSize: {w: number;h: number;},
offset = 0)
: string {
  if (Math.abs(a.x - b.x) < 1) {
    const dir = b.y > a.y ? 1 : -1;
    const y1 = a.y + dir * aSize.h / 2;
    const y2 = b.y - dir * bSize.h / 2;
    return `M${a.x + offset} ${y1} L${b.x + offset} ${y2}`;
  }
  const x1 = a.x + aSize.w / 2;
  const x2 = b.x - bSize.w / 2;
  const y1 = a.y + offset;
  const y2 = b.y + offset;
  const dx = (x2 - x1) * 0.5;
  return `M${x1} ${y1} C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`;
}

export function edgeWidth(mode: MapMode, vol: number | null, scale: number): number {
  if (mode === "relationships") return 1.6;
  if (vol === null) return 1.6;
  return Math.max(2, 20 * (vol / scale));
}
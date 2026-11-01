import type { Severity } from "../types/intel";
import type { Dimension, Finding, FindingKind, FindingStatus, MonitorEventType, ReviewDecision, Urgency } from "../types/diligence";

export const dimensionMeta: Record<Dimension, {label: string;short: string;}> = {
  strategy: { label: "Strategy", short: "Strategy" },
  execution: { label: "Strategy execution", short: "Execution" },
  process: { label: "Detailed process", short: "Detailed process" },
  outcome: { label: "Outcome", short: "Outcome" }
};
export const dimensions: Dimension[] = ["strategy", "execution", "process", "outcome"];

export const kindMeta: Record<FindingKind, {label: string;plural: string;chip: string;}> = {
  gap: { label: "Gap", plural: "Gaps", chip: "border-sky-400/30 bg-sky-400/10 text-sky-300" },
  redflag: { label: "Red flag", plural: "Red flags", chip: "border-rose-400/40 bg-rose-400/10 text-rose-300" }
};

/** Status maps onto the Locate → Validate → Fix → Verify path from the reference. */
export const statusMeta: Record<FindingStatus, {label: string;stage: string;chip: string;dot: string;}> = {
  open: { label: "Open", stage: "Locate", chip: "border-amber-400/35 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
  investigating: { label: "Investigating", stage: "Validate", chip: "border-blue-400/35 bg-blue-400/10 text-blue-300", dot: "bg-blue-400" },
  remediating: { label: "Remediating", stage: "Fix", chip: "border-violet-400/35 bg-violet-400/10 text-violet-300", dot: "bg-violet-400" },
  resolved: { label: "Resolved", stage: "Verify", chip: "border-teal-400/35 bg-teal-400/10 text-teal-300", dot: "bg-teal-400" },
  rejected: { label: "Rejected", stage: "Excluded", chip: "border-rose-400/50 bg-rose-500/15 text-rose-300 font-semibold", dot: "bg-rose-400" }
};
export const statuses: FindingStatus[] = ["open", "investigating", "remediating", "resolved", "rejected"];

export const urgencyMeta: Record<Urgency, {label: string;rank: number;}> = {
  immediate: { label: "Immediate", rank: 0 },
  week: { label: "This week", rank: 1 },
  month: { label: "This month", rank: 2 }
};

export const decisionMeta: Record<ReviewDecision, {label: string;chip: string;}> = {
  pending: { label: "Pending review", chip: "border-amber-400/35 bg-amber-400/10 text-amber-300" },
  accepted: { label: "Accepted", chip: "border-teal-400/35 bg-teal-400/10 text-teal-300" },
  rejected: { label: "Rejected", chip: "border-rose-400/50 bg-rose-500/15 text-rose-300 font-semibold tracking-wide" }
};

export const eventTypeMeta: Record<MonitorEventType, {label: string;chip: string;dot: string;hex: string;}> = {
  normal: { label: "Normal", chip: "border-white/[0.1] bg-white/[0.03] text-slate-300", dot: "bg-slate-400", hex: "#94A3B8" },
  warning: { label: "Warning", chip: "border-amber-400/35 bg-amber-400/10 text-amber-300", dot: "bg-amber-400", hex: "#FBBF24" },
  gap: { label: "Gap", chip: "border-sky-400/30 bg-sky-400/10 text-sky-300", dot: "bg-sky-400", hex: "#38BDF8" },
  redflag: { label: "Red flag", chip: "border-rose-400/40 bg-rose-400/10 text-rose-300", dot: "bg-rose-400", hex: "#FB7185" }
};

export const severityRank: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export function bySeverity(a: Finding, b: Finding): number {
  return severityRank[a.severity] - severityRank[b.severity] || urgencyMeta[a.urgency].rank - urgencyMeta[b.urgency].rank || a.id.localeCompare(b.id);
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function fmtAgo(ms: number, now: number): string {
  const m = Math.max(0, Math.round((now - ms) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}

/** Share of evidence items that are verified against a source record. */
export function evidenceCoverage(list: Finding[]): number {
  const all = list.flatMap((f) => f.evidence);
  return all.length ? Math.round(all.filter((e) => e.basis === "verified").length / all.length * 100) : 0;
}

/** Simple sample index: 100 minus weighted open findings. Not a compliance score. */
export function healthIndex(list: Finding[]): number {
  const w: Record<Severity, number> = { critical: 14, high: 8, medium: 4, low: 2 };
  const penalty = list.filter((f) => f.status !== "resolved" && f.status !== "rejected").reduce((s, f) => s + w[f.severity] * (f.kind === "redflag" ? 1.25 : 1), 0);
  return Math.max(0, Math.round(100 - penalty));
}
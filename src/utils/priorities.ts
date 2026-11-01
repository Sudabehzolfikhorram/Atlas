import type { BusinessPriority, ImpactKind, PriorityStatus, StepStatus } from "../types/priorities";

export type PrioritySort = "priority" | "impact" | "urgency" | "confidence";
export type PriorityFilter = "all" | "critical" | "pending" | "validation";

export const statusMeta: Record<PriorityStatus, {label: string;chip: string;}> = {
  needs_validation: { label: "Needs validation", chip: "border-amber-400/30 bg-amber-400/10 text-amber-200" },
  awaiting_decision: { label: "Awaiting decision", chip: "border-blue-400/30 bg-blue-400/10 text-blue-200" },
  validation_requested: { label: "Validation requested", chip: "border-amber-400/30 bg-amber-400/10 text-amber-200" },
  approved: { label: "Approved · ready to act", chip: "border-teal-400/30 bg-teal-400/10 text-teal-200" },
  task_created: { label: "Task in progress", chip: "border-violet-400/30 bg-violet-400/10 text-violet-200" },
  deferred: { label: "Deferred", chip: "border-white/10 bg-white/[0.04] text-slate-400" }
};

export const impactKindMeta: Record<ImpactKind, string> = {
  Financial: "text-amber-200",
  Operational: "text-sky-200",
  Production: "text-teal-200",
  Compliance: "text-rose-200"
};

export const stepMeta: Record<StepStatus, {label: string;dot: string;text: string;}> = {
  done: { label: "Done", dot: "bg-teal-400", text: "text-teal-300" },
  in_progress: { label: "In progress", dot: "bg-blue-400", text: "text-blue-300" },
  pending: { label: "Not started", dot: "bg-slate-500", text: "text-slate-400" },
  blocked: { label: "Blocked", dot: "bg-rose-400", text: "text-rose-300" }
};

/** Evidence confidence blends model confidence with how much of the claim is covered by records. */
export const evidenceConfidence = (p: BusinessPriority) => Math.round((p.quality.modelConfidence + p.quality.evidenceCoverage) / 2);

export function priorityScore(p: BusinessPriority, sort: PrioritySort): number {
  if (sort === "impact") return p.impactScore;
  if (sort === "urgency") return p.urgencyScore;
  if (sort === "confidence") return evidenceConfidence(p);
  const deferredPenalty = p.status === "deferred" ? 40 : 0;
  return p.impactScore * 0.45 + p.urgencyScore * 0.35 + evidenceConfidence(p) * 0.2 - deferredPenalty;
}

export const needsValidation = (p: BusinessPriority) => p.status === "needs_validation" || p.status === "validation_requested";

export function matchesFilter(p: BusinessPriority, f: PriorityFilter): boolean {
  if (f === "critical") return p.severity === "critical";
  if (f === "pending") return p.status === "awaiting_decision";
  if (f === "validation") return needsValidation(p);
  return true;
}

/** Which card actions are relevant at this maturity stage. */
export function availableActions(p: BusinessPriority) {
  return {
    review: p.status === "awaiting_decision" || p.status === "deferred",
    requestValidation: p.status === "needs_validation",
    createTask: p.status === "approved"
  };
}

export function nextOpenStep(p: BusinessPriority) {
  return p.nextSteps.find((s) => s.status !== "done");
}
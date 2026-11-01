import { demoFindingId, demoRule } from "../data/demoScenario";
import type { CheckRun, CheckSample, ExecutionState, Finding, FindingStatus, FindingWorkflow, PlanState, ReviewState, ValidationState, VerificationState } from "../types/diligence";

type Meta = {label: string;chip: string;};
const neutral = "border-white/[0.12] bg-white/[0.03] text-slate-300";
const amber = "border-amber-400/35 bg-amber-400/10 text-amber-300";
const teal = "border-teal-400/35 bg-teal-400/10 text-teal-300";
const rose = "border-rose-400/45 bg-rose-500/10 text-rose-300";
const blue = "border-blue-400/35 bg-blue-400/10 text-blue-300";
const violet = "border-violet-400/35 bg-violet-400/10 text-violet-300";

export const validationMeta: Record<ValidationState, Meta> = {
  pending: { label: "Pending review", chip: amber },
  accepted: { label: "Accepted", chip: teal },
  rejected: { label: "Rejected", chip: rose }
};
export const planMeta: Record<PlanState, Meta> = {
  not_submitted: { label: "Not submitted", chip: neutral },
  pending: { label: "Pending approval", chip: amber },
  approved: { label: "Approved", chip: teal },
  changes: { label: "Changes required", chip: rose }
};
export const executionMeta: Record<ExecutionState, Meta> = {
  not_started: { label: "Not started", chip: neutral },
  in_progress: { label: "In progress", chip: violet },
  ready: { label: "Ready for verification", chip: blue }
};
export const verificationMeta: Record<VerificationState, Meta> = {
  not_tested: { label: "Not tested", chip: neutral },
  failed: { label: "Failed", chip: rose },
  passed: { label: "Passed", chip: teal }
};

export const workflowDimensions = [
{ key: "validation", label: "Finding validation", meta: validationMeta },
{ key: "plan", label: "Remediation plan approval", meta: planMeta },
{ key: "execution", label: "Remediation execution", meta: executionMeta },
{ key: "verification", label: "Verification", meta: verificationMeta }] as
const;

const fallback: FindingWorkflow = { validation: "pending", plan: "not_submitted", execution: "not_started", verification: "not_tested", closed: false };
export const wfOf = (f: Finding): FindingWorkflow => f.workflow ?? fallback;

/**
 * Initial workflow derived from the sample register. No seeded finding is verified or closed:
 * that needs a recorded test result and a closure decision, which the sample register doesn't have.
 * A register entry marked "resolved" therefore starts as "ready for verification".
 */
export function seedWorkflow(f: Finding, review?: ReviewState): FindingWorkflow {
  if (f.id === demoFindingId) return { ...fallback };
  const s = f.status;
  const progressed = s === "remediating" || s === "resolved";
  const validation: ValidationState = review?.finding && review.finding !== "pending" ? review.finding : progressed ? "accepted" : s === "open" ? "pending" : "accepted";
  if (validation === "rejected") return { ...fallback, validation };
  const plan: PlanState = validation !== "accepted" ? "not_submitted" : progressed || review?.remediation === "accepted" ? "approved" : review?.remediation === "rejected" ? "changes" : "pending";
  return {
    validation,
    plan,
    execution: plan !== "approved" ? "not_started" : s === "resolved" ? "ready" : s === "remediating" ? "in_progress" : "not_started",
    verification: "not_tested",
    closed: false
  };
}

/** Single status, derived from the four dimensions so every page shows the same value. */
export function deriveStatus(w: FindingWorkflow): FindingStatus {
  if (w.validation === "rejected") return "rejected";
  if (w.closed) return "resolved";
  if (w.execution !== "not_started") return "remediating";
  if (w.validation === "accepted") return "investigating";
  return "open";
}

/** Closure requires: accepted finding, approved current plan, passed verification (then a reviewer approval). */
export const closureReady = (w: FindingWorkflow) => !w.closed && w.validation === "accepted" && w.plan === "approved" && w.verification === "passed";
/** Remediation work and verification are only possible on an accepted finding with an approved plan. */
export const remediationAllowed = (w: FindingWorkflow) => !w.closed && w.validation === "accepted" && w.plan === "approved";

export const isRejected = (f: Finding) => wfOf(f).validation === "rejected";
/** Open and actionable: not rejected and not closed. */
export const isActionable = (f: Finding) => !isRejected(f) && !wfOf(f).closed;

/** Diligence may edit owner and plan until it is submitted (or after changes are requested). */
export const planEditable = (f: Finding) => {
  const w = wfOf(f);
  return !w.closed && w.validation !== "rejected" && (w.plan === "not_submitted" || w.plan === "changes");
};
/** Submission additionally requires the finding to be accepted. */
export const planSubmittable = (f: Finding) => planEditable(f) && wfOf(f).validation === "accepted";

export type ReviewerTask = "finding" | "remediation" | "closure";
/** The reviewer decision a finding is waiting for, if any. Rejected findings never wait. */
export function reviewerTask(f: Finding): ReviewerTask | null {
  const w = wfOf(f);
  if (w.closed || w.validation === "rejected") return null;
  if (w.validation === "pending") return "finding";
  if (w.plan === "pending") return "remediation";
  if (closureReady(w)) return "closure";
  return null;
}

export function closureLabel(f: Finding): string {
  const w = wfOf(f);
  if (w.closed) return f.id === demoFindingId ? "Resolved in demo scenario" : "Closed after verification";
  if (w.validation === "rejected") return "Rejected · history kept";
  if (closureReady(w)) return "Awaiting closure approval";
  if (w.verification === "failed") return "Open · verification failed";
  return "Open";
}

export const pct = (n: number, d: number) => d ? Math.round(n / d * 100) : 0;

/** Evaluate the demo rule against a fixed sample. Deterministic for repeatable results. */
export function evaluateSample(sample: CheckSample, kind: CheckRun["kind"], id: string, ranAt: string): CheckRun {
  const rows = sample.records.map((r) => ({
    ...r,
    pass: new Date(r.approvedAt).getTime() <= new Date(r.sentAt).getTime(),
    // Same PO in the same sample is the same event, so repeated runs never double-count it.
    eventId: `EV-${sample.id}-${r.po.replace(/\D/g, "")}`
  }));
  return { id, area: "process", findingId: demoFindingId, kind, sampleId: sample.id, sampleLabel: sample.label, ruleId: demoRule.id, rule: demoRule.text, ranAt, rows, passed: rows.filter((r) => r.pass).length, evaluated: rows.length };
}

/** Trend points from recorded sample check results only (no preset scores). */
export function checkTrend(runs: CheckRun[]) {
  return runs.map((r) => ({
    t: r.id,
    score: pct(r.passed, r.evaluated),
    passed: r.passed,
    evaluated: r.evaluated,
    sample: r.sampleId,
    kind: r.kind === "baseline" ? "Baseline" : "Verification"
  }));
}

/** Latest run for each sample, so repeated runs don't double-count. */
export function latestPerSample(runs: CheckRun[]): CheckRun[] {
  const m = new Map<string, CheckRun>();
  runs.forEach((r) => m.set(r.sampleId, r));
  return Array.from(m.values());
}

export function diligenceKpis(list: Finding[]) {
  const accepted = list.filter((f) => wfOf(f).validation === "accepted");
  const implemented = accepted.filter((f) => wfOf(f).execution === "ready" || wfOf(f).closed).length;
  const closed = accepted.filter((f) => wfOf(f).closed).length;
  return {
    evaluated: list.length,
    awaitingValidation: list.filter((f) => wfOf(f).validation === "pending").length,
    accepted: accepted.length,
    acceptedOpen: accepted.filter((f) => !wfOf(f).closed).length,
    critical: list.filter((f) => f.severity === "critical" && isActionable(f)).length,
    nonRejected: list.filter((f) => !isRejected(f)).length,
    implemented,
    progress: pct(implemented, accepted.length),
    closed,
    closedPct: pct(closed, accepted.length)
  };
}

export function qanKpis(list: Finding[], runs: CheckRun[]) {
  const latest = latestPerSample(runs);
  const verifications = runs.filter((r) => r.kind === "verification");
  const tasks = list.map(reviewerTask);
  return {
    latest,
    evaluated: latest.reduce((s, r) => s + r.evaluated, 0),
    failed: latest.reduce((s, r) => s + r.evaluated - r.passed, 0),
    awaitingFinding: tasks.filter((t) => t === "finding").length,
    awaitingClosure: tasks.filter((t) => t === "closure").length,
    plansPending: tasks.filter((t) => t === "remediation").length,
    acceptedOpen: list.filter((f) => wfOf(f).validation === "accepted" && !wfOf(f).closed).length,
    rejected: list.filter(isRejected).length,
    verifyPassed: verifications.filter((r) => r.passed === r.evaluated).length,
    verifyFailed: verifications.filter((r) => r.passed < r.evaluated).length,
    lastVerification: verifications[verifications.length - 1]
  };
}
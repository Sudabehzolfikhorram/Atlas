import type { Severity } from "./intel";

export type DiligenceArea = "data" | "process";
/** Tabs on the QAN (quality assurance) page. */
export type QanTab = "asbuilt" | "quality" | "assurance";
export type Dimension = "strategy" | "execution" | "process" | "outcome";
export type FindingKind = "gap" | "redflag";
export type FindingStatus = "open" | "investigating" | "remediating" | "resolved" | "rejected";
export type Urgency = "immediate" | "week" | "month";
export type Basis = "verified" | "inferred";
export type Department = "Procurement" | "Operations" | "Finance";

export interface FindingEvidence {
  label: string;
  ref: string;
  basis: Basis;
}

export interface FindingEvent {
  date: string;
  label: string;
  actor: string;
}

export interface Finding {
  id: string;
  kind: FindingKind;
  /** Primary category — the page the finding is listed on. */
  area: DiligenceArea;
  /** Cross-functional findings may reference the other area. */
  alsoArea?: DiligenceArea;
  dimension: Dimension;
  title: string;
  summary: string;
  /** Short "today → target" line kept from the reference cards. */
  shift: string;
  category: string;
  team: Department;
  severity: Severity;
  urgency: Urgency;
  impact: string;
  related: string;
  systems: string[];
  dataAssets: string[];
  processes: string[];
  source: string;
  rootCause: string;
  rootCauseBasis: Basis;
  facts: string[];
  evidence: FindingEvidence[];
  dependencies: string[];
  relatedIds: string[];
  policies: string[];
  owner: string;
  ownerRole: string;
  reviewer: string;
  status: FindingStatus;
  action: string;
  alternatives: string[];
  nextSteps: string[];
  detection: {method: string;at: string;};
  identified: string;
  target: string;
  timeline: FindingEvent[];
  /** Four independent workflow dimensions. Always populated by DiligenceContext. */
  workflow?: FindingWorkflow;
}

export type ValidationState = "pending" | "accepted" | "rejected";
export type PlanState = "not_submitted" | "pending" | "approved" | "changes";
export type ExecutionState = "not_started" | "in_progress" | "ready";
export type VerificationState = "not_tested" | "failed" | "passed";

export interface FindingWorkflow {
  validation: ValidationState;
  plan: PlanState;
  execution: ExecutionState;
  verification: VerificationState;
  /** True only after a passed verification and a reviewer's closure approval. */
  closed: boolean;
}

/** Remediation plan fields that Diligence can edit before submitting for approval. */
export interface PlanFields {
  owner: string;
  ownerRole: string;
  action: string;
  target: string;
}

/** One purchase order evaluated by a demo control check. */
export interface CheckResultRow {
  po: string;
  supplier: string;
  amount: number;
  approvedAt: string;
  sentAt: string;
  pass: boolean;
  eventId: string;
}

export interface CheckSample {
  id: string;
  label: string;
  records: Omit<CheckResultRow, "pass" | "eventId">[];
}

export interface CheckRun {
  id: string;
  /** Area of the finding the check belongs to. */
  area: DiligenceArea;
  findingId: string;
  kind: "baseline" | "verification";
  sampleId: string;
  sampleLabel: string;
  ruleId: string;
  rule: string;
  ranAt: string;
  rows: CheckResultRow[];
  passed: number;
  evaluated: number;
}

/** A unique violation (check failure or monitoring event) attached to a finding as an occurrence. */
export interface LinkedEvent {
  eventId: string;
  source: "check" | "monitoring";
  /** Short description, e.g. the PO number or the monitoring event title. */
  label: string;
  runId?: string;
  sampleId?: string;
  linkedAt: string;
}

export type MonitorEventType = "normal" | "warning" | "gap" | "redflag";

export interface MonitorEventTemplate {
  area: DiligenceArea;
  type: MonitorEventType;
  severity: Severity;
  title: string;
  explanation: string;
  source: string;
  team: Department;
  recommendation: string;
  evidence: string[];
  relatedFindingId?: string;
}

export interface MonitorEvent extends MonitorEventTemplate {
  id: string;
  at: number;
}

export type ReviewDecision = "pending" | "accepted" | "rejected";
export type ReviewSubject = "finding" | "remediation" | "closure";

export interface ReviewEntry {
  subject: ReviewSubject;
  decision: ReviewDecision;
  reviewer: string;
  at: string;
  comment: string;
  /** Human label, e.g. "Changes required" or "Closure approved". */
  label?: string;
}

export interface ReviewState {
  finding: ReviewDecision;
  remediation: ReviewDecision;
  closure?: ReviewDecision;
  history: ReviewEntry[];
}
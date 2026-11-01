import type { EvidenceRecord, EvidenceRef, EvidenceStatus, Priority, Severity } from "./intel";

export type PriorityStatus =
"needs_validation" |
"awaiting_decision" |
"validation_requested" |
"approved" |
"task_created" |
"deferred";

export type ImpactKind = "Financial" | "Operational" | "Production" | "Compliance";
export type StepStatus = "done" | "in_progress" | "pending" | "blocked";
export type ActivityKind = "investigation" | "decision" | "approval" | "comment" | "action";

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  impact: string;
  cost: string;
  risk: "Low" | "Medium" | "High";
  tradeoffs: string;
  recommended?: boolean;
}

export interface PriorityTask {
  owner: string;
  due: string;
  priority: Priority;
  criteria: string;
  createdAt: string;
}

export interface ActivityEntry {
  date: string;
  actor: string;
  action: string;
  kind: ActivityKind;
}

export interface Person {
  name: string;
  role: string;
}

export interface BusinessPriority {
  id: string;
  title: string;
  summary: string;
  category: string;
  severity: Severity;
  status: PriorityStatus;
  evidenceStatus: EvidenceStatus;
  impact: {text: string;kind: ImpactKind;isEstimate: boolean;};
  affected: {
    departments: string[];
    processes: string[];
    systems: string[];
    people: (Person & {relation: string;})[];
  };
  evidence: EvidenceRef[];
  records: EvidenceRecord[];
  recommendation: {action: string;rationale: string;benefit?: string;};
  quality: {modelConfidence: number;evidenceCoverage: number;dataCompleteness: number;freshness: string;limitation?: string;};
  impactScore: number;
  urgencyScore: number;
  dueBy: string;
  analysis: {pattern: string;observed: string[];inferred: string[];causes: string[];};
  options: DecisionOption[];
  ownership: {decisionMaker: Person;stakeholders: Person[];approvals: (Person & {done: boolean;})[];dependencies: string[];};
  history: ActivityEntry[];
  nextSteps: {label: string;status: StepStatus;owner?: string;}[];
  unresolved: string[];
  completionCriteria: string;
  /** Links to the decision register used by the Executive Report. */
  decisionId?: string;
  task?: PriorityTask;
}
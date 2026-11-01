export type EvidenceStatus = "verified" | "inferred" | "proposed";
export type Severity = "critical" | "high" | "medium" | "low";

export type AuditCategory =
"Investigation" |
"Graph edit" |
"Recommendation" |
"Approval" |
"Governance" |
"Access" |
"Task";

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  category: AuditCategory;
  action: string;
  target: string;
  detail?: string;
}

export interface EvidenceRef {
  label: string;
  source: string;
  status: EvidenceStatus;
}

export interface Signal {
  id: string;
  title: string;
  severity: Severity;
  summary: string;
  evidence: EvidenceRef[];
  impact: string;
  impactIsEstimate: boolean;
  departments: string[];
  processes: string[];
  decision: string;
  confidence: number;
  freshness: string;
  evidenceStatus: EvidenceStatus;
  impactScore: number;
  urgencyScore: number;
}

export interface EvidenceRecord {
  id: string;
  system: string;
  type: string;
  date: string;
  excerpt: string;
  status: EvidenceStatus;
}

export interface AttentionItem {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  impact: string;
  process: string;
  evidenceSummary: string;
  recommendedAction: string;
  confidence: number;
  evidenceStatus: EvidenceStatus;
  sources: string[];
  records: EvidenceRecord[];
  people: {name: string;role: string;relation: string;}[];
  workflows: string[];
  reasoning: string[];
  unresolved: string[];
  resolutionPath: string[];
}

export type DecisionStatus = "pending" | "approved" | "validation_requested" | "deferred";
export type DecisionAction = "approve" | "validate" | "defer";

export interface Decision {
  id: string;
  title: string;
  type: string;
  urgency: string;
  context: string;
  evidence: EvidenceRef[];
  impact: string;
  risks: string[];
  decisionMaker: {name: string;role: string;};
  approvals: {name: string;role: string;done: boolean;}[];
  dependencies: string[];
  nextStep: string;
  confidence: number;
  actions: DecisionAction[];
}

export type TaskStatus = "planned" | "in_progress" | "blocked" | "completed" | "awaiting_approval";
export type Priority = "P1" | "P2" | "P3";

export interface PlanTask {
  id: string;
  name: string;
  description: string;
  owner: string;
  ownerRole: string;
  department: string;
  category: string;
  start: string;
  due: string;
  priority: Priority;
  status: TaskStatus;
  dependencies: string[];
  progress: number;
  recommendation: string;
}

export type SourceStatus = "synced" | "delayed" | "error" | "restricted";
export type Sensitivity = "Internal" | "Confidential" | "Restricted";

export interface DataSource {
  id: string;
  name: string;
  system: string;
  category: string;
  owner: string;
  datasets: string[];
  records: string;
  status: SourceStatus;
  lastSync: string;
  completeness: number;
  freshness: number;
  consistency: number;
  sensitivity: Sensitivity;
  retention: string;
  access: string[];
  limitations: string;
}

export type NodeKind = "process" | "person" | "team" | "system" | "data" | "decision" | "outcome";

export interface GraphEntity {
  id: string;
  label: string;
  sublabel: string;
  kind: NodeKind;
  department: string;
  processes: string[];
  status: EvidenceStatus;
  confidence: number;
  x: number;
  y: number;
  properties: Record<string, string>;
  evidence: string[];
}

export interface GraphRelation {
  id: string;
  source: string;
  target: string;
  relation: string;
  status: EvidenceStatus;
  confidence: number;
  sourceSystem: string;
  evidence: string[];
}
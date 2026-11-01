import type { EvidenceStatus } from "./intel";

export type ProcessId = "equipment-purchasing" | "maintenance-work-order" | "vendor-onboarding";
export type PeriodKey = "12m" | "6m" | "q3";
export type MapMode = "relationships" | "flow";
export type MapVariant = "current" | "recommended";
export type ChangeType = "added" | "removed" | "modified" | "reordered";
export type HandoffKind = "handoff" | "approval" | "system" | "manual";

export interface StepVersion {
  label: string;
  owner: string;
  system: string;
  /** Share of the process's monthly cases that pass through this step (0–1). */
  share: number;
  /** Observed average wait in days at the reference month; scaled by the process trend. Current version only. */
  waitDays?: number;
  issue?: string;
  evidence: {label: string;status: EvidenceStatus;}[];
}

export interface ProcessStep {
  /** Stable semantic id — identical across current and recommended versions for the same step. */
  id: string;
  /** Shared layout position used by both versions so overlays align. */
  col: number;
  row: 0 | 1 | 2;
  current?: StepVersion;
  recommended?: StepVersion;
}

export interface ProcessEdge {
  /** Stable id `from>to` — shared across versions when the same handoff exists in both. */
  id: string;
  from: string;
  to: string;
  kind: HandoffKind;
  label: string;
  /** Share of monthly cases flowing along this edge. Undefined = not modelled. */
  share?: number;
}

export interface ProcessChange {
  id: string;
  type: ChangeType;
  title: string;
  stepIds: string[];
  edgeIds: string[];
  current: string;
  proposed: string;
  why: string;
  evidence: string;
  evidenceStatus: EvidenceStatus;
  assumption?: string;
  /** Present only when the impact can be stated from measured data. `measuredStepId` pulls the observed wait. */
  impact?: {measuredStepId: string;text: string;};
  basis: "best-practice" | "ai";
}

export interface Recommendation {
  version: string;
  generatedOn: string;
  baselines: PeriodKey[];
  reference?: string;
  assumptions: string[];
  limitations: string[];
  edges: ProcessEdge[];
  changes: ProcessChange[];
}

export interface ProcessDefinition {
  id: ProcessId;
  name: string;
  department: string;
  owner: string;
  description: string;
  monthlyCases: number[];
  sources: number[];
  /** Wait-time multiplier per month (1 = reference month). */
  trend: number[];
  /** Workflow stages (shown as cards). Each lists step ids from either version, in display order. */
  stages: {id: string;label: string;stepIds: string[];}[];
  steps: ProcessStep[];
  currentEdges: ProcessEdge[];
  recommendation: Recommendation | null;
  unavailableReason?: string;
}

export interface MapViewState {
  processId: ProcessId;
  period: PeriodKey;
  month: number;
  mode: MapMode;
  selectedId: string | null;
}
import type { EvidenceStatus } from "./intel";
import type { ProcessId } from "./processMap";

export type TeamId = "hr" | "finance" | "procurement" | "operations" | "production" | "sales" | "it" | "legal" | "support" | "exec";

/** Evidence for a team ↔ workflow relationship. Proposals never appear on the org map. */
export type LinkEvidence = Exclude<EvidenceStatus, "proposed">;
export type LinkRole = "owner" | "participant";

export interface OrgTeam {
  id: TeamId;
  name: string;
  lead: string;
  headcount: number;
  description: string;
}

export interface WorkflowParticipant {
  team: TeamId;
  evidence: LinkEvidence;
  /** What the team does in this workflow. */
  role: string;
}

export interface OrgWorkflow {
  id: string;
  name: string;
  owner: TeamId;
  ownerEvidence: LinkEvidence;
  participants: WorkflowParticipant[];
  description: string;
  /** Observed monthly volume, or null when not measured. */
  volume: string | null;
  /** Share of the workflow covered by connected source records (0–100). */
  coverage: number;
  stages: string[];
  dependsOn: string[];
  /** Present when step-level process data exists, enabling Current / Best practice / Side by side. */
  processId?: ProcessId;
  note?: string;
}

export type OrgSelection = {kind: "team";id: TeamId;} | {kind: "workflow";id: string;} | null;
export type WorkflowFilter = "all" | "shared" | "comparable" | "low-evidence";

export interface LinkInfo {
  role: LinkRole;
  evidence: LinkEvidence;
}
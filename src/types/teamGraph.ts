/** Evidence / relationship health: green, amber, red, gray. */
export type Health = "verified" | "partial" | "gap" | "unknown";

export type RelationType = "ownership" | "provisioning" | "approval" | "oversight" | "evidence" | "compliance" | "handoff";

export type TeamIconKey = "crown" | "landmark" | "users" | "database" | "chart" | "shield" | "clipboard" | "server" | "factory";

export type Side = "t" | "r" | "b" | "l";

export interface TeamMember {
  name: string;
  role: string;
  assignment: string;
  raci: "Accountable" | "Responsible" | "Supporting";
  vacant?: boolean;
}

export interface TeamProcess {
  name: string;
  role: "Owns" | "Supports";
  status: Health;
  stage: "Documented" | "Operating" | "Under review" | "Proposed";
  controls: string[];
  bottleneck?: string;
}

export interface EvidenceItem {
  item: string;
  available: number;
  required: number;
  status: Health;
  lastVerified?: string;
  source: string;
  owner: string;
  note?: string;
}

export interface TeamRisk {
  title: string;
  severity: "High" | "Medium" | "Low";
  kind: "Finding" | "Missing owner" | "Dependency" | "Overdue approval" | "Evidence gap" | "Compliance";
}

export interface Team {
  id: string;
  name: string;
  category: string;
  icon: TeamIconKey;
  function: string;
  lead: {name: string;role: string;};
  members: number;
  status: Health;
  responsibilities: string[];
  people: TeamMember[];
  assets: string[];
  processes: TeamProcess[];
  evidence: EvidenceItem[];
  risks: TeamRisk[];
  avgApprovalDays?: number;
  openActions: number;
  lastActivity: string;
  lastReview?: string;
  position: {x: number;y: number;};
}

export interface TeamRelation {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  process: string;
  description: string;
  evidence: Health;
  owner: string;
  lastVerified?: string;
  risks?: string[];
  /** Handle sides used on the main organization graph. */
  sh: Side;
  th: Side;
}
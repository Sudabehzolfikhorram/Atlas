export type DocGroup = "permit" | "declaration" | "request" | "trip" | "payment" | "reminder";

export type PermitStatus = "closed" | "open" | "rejected" | "unknown";

export interface DocGroupMeta {
  id: DocGroup;
  label: string;
  color: string;
}

export interface RoleNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  group: DocGroup;
  /** Handoffs observed in the default time window. */
  count: number;
  /** Perpendicular curve offset, in graph units. */
  bend: number;
}

export interface Permit {
  id: number;
  orgUnit: number;
  status: PermitStatus;
  /** ISO date the permit was raised. */
  date: string;
  path: string[];
}

export interface OutcomeKpi {
  id: string;
  label: string;
  value: number;
  unit: "%" | "d" | "";
  /** Whether the value scales with the selected time window. */
  scales: boolean;
}
import type { NodeStatus, SupplyIconKey } from "./supplyGraph";

/** How the best-practice design resolves a node that has red flags or a broken status today. */
export interface DataFix {
  nodeId: string;
  fix: string;
  /** Target status when it differs from today. */
  status?: NodeStatus;
  /** Renamed in the target design. */
  label?: string;
  subtitle?: string;
}

/** A control or enabler that only exists in the best-practice design. */
export interface DataControl {
  id: string;
  x: number;
  y: number;
  icon: SupplyIconKey;
  label: string;
  subtitle: string;
  summary: string;
  /** Nodes whose gaps this control closes; the first one gets the dependency line. */
  controls: string[];
}

/** A connection that changes route in the best-practice design. */
export interface DataReroute {
  removeEdgeId: string;
  source: string;
  target: string;
  label: string;
  reason: string;
}

export type DataDiffKind = "fixed" | "added" | "rerouted";

export interface DataDiff {
  id: string;
  nodeId: string;
  kind: DataDiffKind;
  title: string;
  area: string;
  detail: string;
}
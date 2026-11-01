export interface LaneStep {
  id: string;
  name: string;
  /** Sample waiting time, hours */
  wait: number;
  /** Sample processing time, hours */
  work: number;
  owner: string;
}

export interface Swimlane {
  id: string;
  name: string;
  workflow: string;
  steps: LaneStep[];
}

export interface CrossLink {
  afterLane: string;
  label: string;
}

export interface StageFinding {
  severity: "High" | "Medium" | "Low";
  title: string;
  note: string;
  evidence: string;
}

export interface StrategyLayer {
  id: string;
  name: string;
  basis: "inferred" | "observed";
  workflow: string;
}

export interface MappingScope {
  id: string;
  label: string;
  meta: string;
  laneIds: string[];
}
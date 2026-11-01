export type TaskKind = "human" | "approval" | "system" | "exception" | "control" | "hidden";
export type TaskStatus = "verified" | "attention" | "critical" | "unverified";
export type EdgeKind = "flow" | "exception" | "control" | "hidden";

export interface Lane {
  id: string;
  label: string;
}

export interface ProcessTask {
  id: string;
  lane: string;
  col: number;
  row: number;
  label: string;
  events: number;
  kind: TaskKind;
  status: TaskStatus;
  /** Median wait before this task, in hours. */
  waitH?: number;
  /** Target wait in the best-practice design, in hours (0 = no wait). */
  targetH?: number;
  /** Share of cases that loop back through this task. */
  rework?: number;
  note?: string;
}

export interface ProcessTransition {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
  label?: string;
}

export interface ProcessModel {
  id: "asis" | "target";
  title: string;
  laneEvents: Record<string, number>;
  tasks: ProcessTask[];
  transitions: ProcessTransition[];
}

export type DiffKind = "removed" | "added" | "faster" | "controlled";

export interface ProcessDiff {
  id: string;
  kind: DiffKind;
  taskId: string;
  title: string;
  detail: string;
  lane: string;
}
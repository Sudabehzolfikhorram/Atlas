export type AnalysisInputKind = "document" | "source";

export interface AnalysisInput {
  id: string;
  kind: AnalysisInputKind;
  name: string;
  /** e.g. "PDF file · Uploaded 5 h ago · Internal" */
  meta: string;
  /** Short type label shown on the selected card, e.g. "PDF file · Internal". */
  shortMeta: string;
  department: string;
  ready: boolean;
  /** Why the input can't be analysed (only when not ready). */
  blockedReason?: string;
}

export interface AnalysisStat {
  label: string;
  value: string;
  note: string;
  tone: string;
  dot: string;
}

export interface GaugeSatellite {
  angle: number;
  value: string;
  unit: string;
  label: string;
  tone: string;
}

export interface RadarPoint {
  area: string;
  observed: number;
  bestPractice: number;
}

export type AnalysisItemStatus = "analyzed" | "excluded" | "failed";

/** One input listed under "Show details" for a completed analysis. */
export interface AnalysisResultItem {
  id: string;
  name: string;
  kind: AnalysisInputKind;
  typeLabel: string;
  status: AnalysisItemStatus;
  reason?: string;
}

export interface SkippedInput {
  input: AnalysisInput;
  status: Exclude<AnalysisItemStatus, "analyzed">;
}

export interface AnalysisResults {
  runId: number;
  /** Inputs behind these results, including any that were excluded or failed. */
  items?: AnalysisResultItem[];
  /** Shown in the Process Health header, e.g. "3 selected inputs". */
  inputLabel: string;
  simulated: boolean;
  conformance: {observed: number;target: number;};
  stats: AnalysisStat[];
  healthIndex: {value: number;label: string;};
  satellites: GaugeSatellite[];
  radar: RadarPoint[];
  notAnalyzed: string[];
  cycle: {
    days: number;
    target: number;
    pctAbove: number;
    barPct: number;
    trend: {month: string;days: number;}[];
    /** True when procurement wasn't part of the run and the previous values are carried over. */
    carriedOver: boolean;
  };
  statusLabel: "Needs attention" | "On track";
  description: string;
  footnote: string;
}

export interface AnalysisStage {
  id: string;
  title: string;
  description: string;
  activeText: string;
}

export type AnalysisRunStatus = "running" | "completed";

export interface AnalysisRun {
  runId: number;
  inputs: AnalysisInput[];
  startedAt: string;
  progress: number;
  status: AnalysisRunStatus;
  /** One completion summary per stage. */
  summaries: string[];
  results: AnalysisResults;
  /** Inputs that were part of this request but couldn't be analysed. */
  skipped?: SkippedInput[];
  /** Run whose results stay visible until this one completes. */
  previousRunId: number;
}
export interface ProcessVariant {
  id: string;
  /** Activity sequence from first to last event. */
  path: string[];
  cases: number;
  /** Median case duration in days. */
  medianDays: number;
  finalState: string;
  /** True when the variant contains a flagged time or sequence deviation. */
  deviation: boolean;
}

export interface OutcomeHeadline {
  id: "completed" | "duration" | "deviation" | "stopped";
  label: string;
  value: string;
  tone: "teal" | "white" | "amber";
  info: string;
}

export interface OutcomeCount {
  label: string;
  value: number;
  info: string;
}
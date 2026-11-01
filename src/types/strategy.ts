import type { Health } from "./teamGraph";

export type InsightType = "misalignment" | "execution-gap" | "bottleneck" | "ownership-conflict" | "strategic-risk";

/** "evidence": backed by verified source records. "hypothesis": AI-inferred, not yet confirmed. */
export type InsightBasis = "evidence" | "hypothesis";

export type Severity = "High" | "Medium" | "Low";

export interface StrategicObjective {
  id: string;
  title: string;
  short: string;
  owner: string;
  kpi: string;
  current: string;
  target: string;
  /** 0–100: how well teams, processes and dependencies support this objective today. */
  alignment: number;
  /** Alignment if the linked recommendations are delivered. */
  projected: number;
  status: "on-track" | "at-risk" | "off-track";
  teams: string[];
}

export interface InsightEvidence {
  label: string;
  source: string;
  status: Health;
}

export interface ObjectiveImpact {
  objective: string;
  effect: string;
  /** Alignment points lost to this issue. */
  delta: number;
}

export interface StrategyInsight {
  id: string;
  type: InsightType;
  title: string;
  summary: string;
  basis: InsightBasis;
  confidence: number;
  severity: Severity;
  teams: string[];
  relations: string[];
  /** A dependency the strategy needs but the map does not have. */
  missingLink?: {from: string;to: string;label: string;};
  objectives: string[];
  evidence: InsightEvidence[];
  /** For hypotheses: what would confirm or reject it. */
  validate?: string;
  impact: ObjectiveImpact[];
  outcome: string;
  recommendation: string;
}

export interface StrategyRecommendation {
  id: string;
  priority: 1 | 2 | 3;
  title: string;
  rationale: string;
  owner: string;
  effort: "Low" | "Medium" | "High";
  expectedImpact: string;
  alignmentGain: number;
  insights: string[];
  steps: string[];
}

export interface AssistantAnswer {
  keywords: string[];
  answer: string;
  basis: InsightBasis;
  insights: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  basis?: InsightBasis;
  insights?: string[];
}
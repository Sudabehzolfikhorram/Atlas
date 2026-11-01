import type { EvidenceStatus } from "./intel";

export interface WorkflowStep {
  label: string;
  owner: string;
  duration: string;
  kind: "ok" | "bottleneck" | "manual" | "proposed";
}

export type MetricTone = "neutral" | "rose" | "amber" | "teal" | "blue";

/** Rich, expandable content cards rendered inside an assistant answer. */
export type ResponseBlock =
{
  kind: "documents";
  title: string;
  /** Ids from the Organization Catalog (data/catalog.ts). */
  documents: {id: string;usedFor: string;}[];
  /** Connected systems (catalog source ids) that also fed the analysis. */
  systems?: {id: string;usedFor: string;}[];
  /** Catalog documents that were not used, with the reason. */
  excluded?: {id: string;reason: string;}[];
} |
{kind: "metrics";title: string;items: {label: string;value: string;note?: string;tone?: MetricTone;}[];} |
{kind: "chart";title: string;unit: string;data: {label: string;value: number;target?: number;}[];note?: string;} |
{kind: "report";title: string;sections: {heading: string;body: string;}[];link?: {label: string;to: string;focus?: string;};};

export interface AssistantResponse {
  title: string;
  summary: string;
  blocks?: ResponseBlock[];
  workflow?: WorkflowStep[];
  compareWorkflow?: WorkflowStep[];
  evidence: {label: string;source: string;status: EvidenceStatus;}[];
  issues: string[];
  recommendations: {text: string;impact: string;}[];
  confidence: number;
}

export interface BlockedNotice {
  title: string;
  explanation: string;
  actionLabel: string;
  actionTo: string;
}

export type ModelStatus = "connected" | "not_connected" | "pending";
export type ProviderKey = "atlas" | "anthropic" | "openai" | "azure" | "custom";

export interface AiModel {
  id: string;
  name: string;
  provider: string;
  providerKey: ProviderKey;
  description: string;
  status: ModelStatus;
  custom?: boolean;
}

export type ChatMessage =
{id: string;role: "user";text: string;createdAt: string;} |
{
  id: string;
  role: "assistant";
  prompt: string;
  modelId: string;
  createdAt: string;
  status: "generating" | "done" | "error" | "blocked";
  response?: AssistantResponse;
  blocked?: BlockedNotice;
};
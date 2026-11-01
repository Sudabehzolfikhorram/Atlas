import { assistantAnswers } from "../data/strategy";
import type { AssistantAnswer, InsightType, Severity, StrategicObjective } from "../types/strategy";

export const insightTypeMeta: Record<InsightType, {label: string;chip: string;}> = {
  misalignment: { label: "Misalignment", chip: "border-violet-400/30 bg-violet-400/10 text-violet-300" },
  "execution-gap": { label: "Execution gap", chip: "border-rose-400/30 bg-rose-400/10 text-rose-300" },
  bottleneck: { label: "Bottleneck", chip: "border-amber-400/30 bg-amber-400/10 text-amber-300" },
  "ownership-conflict": { label: "Ownership conflict", chip: "border-orange-400/30 bg-orange-400/10 text-orange-300" },
  "strategic-risk": { label: "Strategic risk", chip: "border-sky-400/30 bg-sky-400/10 text-sky-300" }
};

export const severityHex: Record<Severity, string> = { High: "#FB7185", Medium: "#FBBF24", Low: "#94A3B8" };

export const objectiveStatusMeta: Record<StrategicObjective["status"], {label: string;chip: string;bar: string;}> = {
  "on-track": { label: "On track", chip: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", bar: "bg-emerald-400" },
  "at-risk": { label: "At risk", chip: "border-amber-400/30 bg-amber-400/10 text-amber-300", bar: "bg-amber-400" },
  "off-track": { label: "Off track", chip: "border-rose-400/30 bg-rose-400/10 text-rose-300", bar: "bg-rose-400" }
};

const fallback: AssistantAnswer = {
  keywords: [],
  basis: "hypothesis",
  insights: [],
  answer: "I couldn't match that to an objective, team or process on the map. Try asking about cost-to-serve, audit readiness, data ownership, KPI certification, or a team such as Business Operations."
};

/** Simple keyword match standing in for the model in this prototype. */
export function answerFor(question: string): AssistantAnswer {
  const q = question.toLowerCase();
  let best = fallback;
  let score = 0;
  for (const a of assistantAnswers) {
    const s = a.keywords.filter((k) => q.includes(k)).length;
    if (s > score) {
      best = a;
      score = s;
    }
  }
  return best;
}
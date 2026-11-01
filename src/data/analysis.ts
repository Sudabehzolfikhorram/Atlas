import type { AnalysisResults, AnalysisStage } from "../types/analysis";
import { conformanceStrip, healthIndex, healthSatellites, maturityRadar, overviewStats, p2pTrend } from "./overview";

/** The six steps every (simulated) analysis run goes through. */
export const analysisStages: AnalysisStage[] = [
{ id: "prepare", title: "Prepare catalog and documents", description: "Check access, formats and freshness of each selected input.", activeText: "Preparing the selected catalog sources and documents…" },
{ id: "build", title: "Build current processes", description: "Reconstruct steps, participants, approvals and handoffs.", activeText: "Finding processes the evidence describes…" },
{ id: "connect", title: "Organize and connect the data", description: "Link systems, documents, owners and evidence to each process.", activeText: "Linking systems, documents and owners to each step…" },
{ id: "gaps", title: "Identify gaps against best practice", description: "Compare with references; separate confirmed findings from assumptions.", activeText: "Comparing current steps with the references…" },
{ id: "propose", title: "Create a proposed new version", description: "Draft an improved version, keeping the observed one intact.", activeText: "Drafting an improved version of each process…" },
{ id: "publish", title: "Publish results to Overview", description: "Update the Overview charts, summaries and comparisons.", activeText: "Publishing results to the Overview…" }];


/** Simulated duration of a full run. */
export const ANALYSIS_DURATION_MS = 15_000;

/** Completed results already on the Overview before any new run (Run 2). */
export const baselineResults: AnalysisResults = {
  runId: 2,
  inputLabel: "9 enterprise sources",
  simulated: true,
  conformance: { observed: conformanceStrip.observed, target: conformanceStrip.target },
  stats: overviewStats,
  healthIndex: { value: healthIndex.value, label: healthIndex.label },
  satellites: healthSatellites,
  radar: maturityRadar,
  notAnalyzed: [],
  cycle: { days: 11.4, target: 7, pctAbove: 63, barPct: 61, trend: p2pTrend, carriedOver: false },
  statusLabel: "Needs attention",
  description: "How closely actual operations match documented, best-practice workflows across six value chains.",
  footnote: `Up ${healthIndex.value - healthIndex.previous} pts vs Q2 · computed from 9 sources · verified inputs 81%`
};

/** Workflows in the organization map — the denominator for "processes analyzed". */
export const MAPPED_PROCESSES = 13;
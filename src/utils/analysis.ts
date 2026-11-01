import { MAPPED_PROCESSES, baselineResults } from "../data/analysis";
import type { AnalysisInput, AnalysisItemStatus, AnalysisResultItem, AnalysisResults } from "../types/analysis";
import type { CatalogDocument, CatalogSource } from "../types/catalog";
import { relativeTime } from "./catalog";

const areaOfDepartment: Record<string, string> = {
  Procurement: "Procurement",
  Finance: "Finance",
  Maintenance: "Maintenance",
  Production: "Production",
  Operations: "Supply Chain",
  HSE: "HSE"
};

export function documentToInput(d: CatalogDocument): AnalysisInput {
  const sessionFile = !d.sample && d.status === "awaiting_index";
  const blockedReason =
  d.status === "failed" ?
  d.error ?? "This file failed to upload." :
  d.access === "Restricted" ?
  "You need an access grant before this document can be analysed." :
  d.status === "processing" ?
  `Still processing (${d.progress}%). It can be analysed once indexing finishes.` :
  d.status === "uploading" ?
  "Uploading…" :
  d.status === "awaiting_index" && !sessionFile ?
  "Waiting to be indexed." :
  undefined;
  const type = d.format === "Unknown" ? "Unknown file" : `${d.format} file`;
  return {
    id: d.id,
    kind: "document",
    name: d.name,
    meta: `${type} · Uploaded ${relativeTime(d.uploadedAt).toLowerCase()} · ${d.access}`,
    shortMeta: `${type} · ${d.access}${sessionFile ? " · this session" : ""}`,
    department: d.department,
    ready: !blockedReason,
    blockedReason
  };
}

export function sourceToInput(s: CatalogSource): AnalysisInput {
  const blockedReason = s.restricted ?
  "You need access to this source's details before it can be analysed." :
  s.status !== "connected" ?
  s.statusNote :
  undefined;
  return {
    id: s.id,
    kind: "source",
    name: s.name,
    meta: `${s.identity} · ${s.permission}`,
    shortMeta: `${s.category[0].toUpperCase()}${s.category.slice(1)} source · ${s.permission}`,
    department: s.department,
    ready: !blockedReason,
    blockedReason
  };
}

export function toResultItem(i: AnalysisInput, status: AnalysisItemStatus, reason?: string): AnalysisResultItem {
  return { id: i.id, name: i.name, kind: i.kind, typeLabel: i.shortMeta, status, reason };
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round1 = (n: number) => Math.round(n * 10) / 10;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * Deterministic, SIMULATED results for a set of inputs. Values vary with the
 * inputs chosen so the flow is demonstrable; they are not real analysis output.
 */
export function simulateAnalysis(runId: number, inputs: AnalysisInput[]): {results: AnalysisResults;summaries: string[];} {
  const n = inputs.length;
  const seed = inputs.reduce((sum, i) => sum + [...i.id].reduce((a, c) => a + c.charCodeAt(0), 0), 0);
  const covered = Array.from(new Set(inputs.map((i) => areaOfDepartment[i.department]).filter(Boolean)));
  const base = baselineResults.radar;

  const radar = base.map((r, i) => ({
    area: r.area,
    bestPractice: r.bestPractice,
    observed: covered.includes(r.area) ? clamp(r.observed + (seed + i * 7) % 9 - 4, 20, 95) : 0
  }));
  const coveredPoints = radar.filter((r) => covered.includes(r.area));
  const observed = coveredPoints.length ? Math.round(coveredPoints.reduce((s, r) => s + r.observed, 0) / coveredPoints.length) : baselineResults.conformance.observed;
  const target = coveredPoints.length ? Math.round(coveredPoints.reduce((s, r) => s + r.bestPractice, 0) / coveredPoints.length) : baselineResults.conformance.target;

  const coverage = clamp(46 + n * 4 + seed % 7, 40, 92);
  const processes = Math.max(1, covered.length);
  const confirmed = processes + 1 + seed % 3;
  const needValidation = n * 3 + seed % 5 + 2;
  const critical = Math.max(1, Math.round(confirmed / 3));
  const versions = Math.max(1, Math.ceil(processes / 2));
  const improvements = confirmed * 2 + seed % 4;

  const hasP2P = covered.includes("Procurement");
  const baseCycle = baselineResults.cycle;
  const days = hasP2P ? round1(clamp(baseCycle.days + (seed % 9 - 4) / 2.5, 7.4, 12.8)) : baseCycle.days;
  const trend = baseCycle.trend.map((p) => ({ month: p.month, days: hasP2P ? round1(p.days * (days / baseCycle.days)) : p.days }));
  const pctAbove = Math.round((days / baseCycle.target - 1) * 100);
  const health = Math.round(observed * 0.65 + coverage * 0.35);

  const steps = processes * 5 + seed % 5;
  const approvals = processes + 1 + seed % 3;
  const links = n * 7 + seed % 6;
  const systems = Math.min(16, n * 3 + seed % 4 + 2);
  const owners = processes * 3 + 1;

  const results: AnalysisResults = {
    runId,
    inputLabel: plural(n, "selected input"),
    simulated: true,
    conformance: { observed, target },
    stats: [
    { label: "Critical Findings", value: String(critical), note: `${needValidation} need validation`, tone: "text-rose-300", dot: "bg-rose-400" },
    { label: "Processes Analyzed", value: String(processes), note: `of ${MAPPED_PROCESSES} mapped`, tone: "text-blue-300", dot: "bg-blue-400" },
    { label: "Evidence Coverage", value: `${coverage}%`, note: "from selected inputs", tone: "text-teal-300", dot: "bg-teal-400" },
    { label: "Improvement Opportunities", value: String(improvements), note: `in ${plural(versions, "proposed version")}`, tone: "text-amber-300", dot: "bg-amber-400" }],

    healthIndex: { value: health, label: "Process Health Index" },
    satellites: [
    { angle: 162, value: String(days), unit: "d", label: "P2P cycle time", tone: days > baseCycle.target ? "#FBBF24" : "#2DD4BF" },
    { angle: 126, value: String(confirmed), unit: "", label: "Confirmed findings", tone: "#60A5FA" },
    { angle: 90, value: String(needValidation), unit: "", label: "Need validation", tone: "#A78BFA" },
    { angle: 54, value: String(processes), unit: "", label: "Processes", tone: "#60A5FA" },
    { angle: 18, value: String(coverage), unit: "%", label: "Evidence coverage", tone: coverage < 70 ? "#FBBF24" : "#2DD4BF" }],

    radar,
    notAnalyzed: base.map((r) => r.area).filter((a) => !covered.includes(a)),
    cycle: { days, target: baseCycle.target, pctAbove, barPct: clamp(Math.round(days / 13 * 100), 5, 100), trend, carriedOver: !hasP2P },
    statusLabel: health >= 75 ? "On track" : "Needs attention",
    description: `How closely actual operations match documented, best-practice workflows for the ${plural(processes, "process", "processes")} in this analysis.`,
    footnote: `Computed from ${plural(n, "selected input")} · ${plural(processes, "process", "processes")} · ${coverage}% evidence coverage`
  };

  const summaries = [
  `${plural(n, "input")} prepared`,
  `${plural(processes, "current process", "current processes")} · ${steps} steps · ${plural(approvals, "approval")}`,
  `${links} evidence links · ${plural(systems, "system")} · ${plural(owners, "owner")}`,
  `${confirmed} confirmed · ${needValidation} need validation`,
  `${plural(improvements, "improvement")} in ${plural(versions, "proposed version")}`,
  "Overview updated"];

  return { results, summaries };
}
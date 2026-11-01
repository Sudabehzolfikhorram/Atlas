import type { PyramidLayer, PyramidLink, PyramidNode } from "../types/strategyPyramid";

/** Total catalog records traced through every layer of the pyramid. */
export const pyramidRecords = 421;

export const pyramidLayers: {id: PyramidLayer;title: string;plural: string;}[] = [
{ id: "strategy", title: "Corporate Strategies", plural: "Strategies" },
{ id: "policy", title: "Corporate Policies", plural: "Policies" },
{ id: "program", title: "Corporate Programs", plural: "Programs" },
{ id: "project", title: "Corporate Projects (processes)", plural: "Projects" },
{ id: "action", title: "Operational Actions (activities)", plural: "Actions" }];


const strategies = [
["s-tdf", "Trusted Data Foundation"],
["s-pi", "Process Intelligence"],
["s-agci", "Accountable Governance & Continuous Improvement"]] as
const;

const policies = [
["p-contract", "Contract & Dependency Governance"],
["p-dq", "Data Quality Gate"],
["p-flow", "Controlled Data Flow & Lineage"],
["p-faithful", "Faithful Process Modeling"],
["p-metric", "Metric-Driven Performance Measurement"],
["p-owner", "Ownership & Accountability"],
["p-findings", "Findings-to-Action Loop"],
["p-audit", "Auditability & Executive Oversight"]] as
const;

const programs = [
["g-dqf", "Data Quality Framework"],
["g-steward", "Stewardship & Access Roles"],
["g-onboard", "Source Onboarding & Registration"],
["g-contracts", "Contracts, Audit & Reference Governance"],
["g-ingest", "Ingestion & Analysis Runs"],
["g-decision", "Human Decision & Approval Records"],
["g-kpi", "Performance KPI Publishing"],
["g-handover", "Role Hand-over Model"],
["g-discovery", "Process Discovery & Analytics"],
["g-activity", "Activity-Level Operations & Remediation"],
["g-delay", "Delay & Unresolved-Flow Review"],
["g-anomaly", "Bottleneck & Anomaly Detection"]] as
const;

/** Strategy → policy records, as traced in the catalog. */
const strategyPolicy: [string, string, number][] = [
["s-pi", "p-faithful", 179],
["s-tdf", "p-flow", 82],
["s-tdf", "p-contract", 47],
["s-agci", "p-findings", 44],
["s-pi", "p-metric", 25],
["s-agci", "p-owner", 22],
["s-tdf", "p-dq", 19],
["s-agci", "p-audit", 3]];


/** Programs each policy is delivered through, most records first. */
const policyPrograms: Record<string, string[]> = {
  "p-contract": ["g-contracts", "g-onboard", "g-steward", "g-ingest"],
  "p-dq": ["g-dqf", "g-ingest", "g-anomaly"],
  "p-flow": ["g-ingest", "g-onboard", "g-contracts", "g-discovery", "g-dqf"],
  "p-faithful": ["g-discovery", "g-activity", "g-handover", "g-decision", "g-delay", "g-anomaly", "g-ingest"],
  "p-metric": ["g-kpi", "g-discovery", "g-anomaly", "g-delay"],
  "p-owner": ["g-steward", "g-handover", "g-decision", "g-activity"],
  "p-findings": ["g-activity", "g-delay", "g-anomaly", "g-decision"],
  "p-audit": ["g-contracts", "g-decision"]
};

/** Splits a total across weights with the largest-remainder method; every slot gets at least `min`. */
function proportional(total: number, weights: number[], min = 1): number[] {
  const n = weights.length;
  const floor = Math.min(min, Math.floor(total / n));
  const rest = total - floor * n;
  const sum = weights.reduce((s, w) => s + w, 0) || 1;
  const raw = weights.map((w) => w / sum * rest);
  const out = raw.map((r) => Math.floor(r) + floor);
  let left = total - out.reduce((s, v) => s + v, 0);
  raw.
  map((r, i) => ({ i, f: r - Math.floor(r) })).
  sort((a, b) => b.f - a.f).
  forEach(({ i }) => {
    if (left > 0) {
      out[i] += 1;
      left -= 1;
    }
  });
  return out;
}
const descending = (n: number) => Array.from({ length: n }, (_, i) => 1 / (i + 1.4));

const strategyLinks: PyramidLink[] = strategyPolicy.map(([from, to, records]) => ({ id: `${from}>${to}`, from, to, layer: "strategy", records }));

const policyLinks: PyramidLink[] = strategyPolicy.flatMap(([, policy, records]) => {
  const targets = policyPrograms[policy];
  const split = proportional(records, descending(targets.length));
  return targets.map((to, i) => ({ id: `${policy}>${to}`, from: policy, to, layer: "policy" as const, records: split[i] })).filter((l) => l.records > 0);
});

const programRecords = new Map<string, number>();
policyLinks.forEach((l) => programRecords.set(l.to, (programRecords.get(l.to) ?? 0) + l.records));

const projectCounts = proportional(84, programs.map(([id]) => programRecords.get(id) ?? 0));
const projectNodes: PyramidNode[] = [];
const programLinks: PyramidLink[] = [];
programs.forEach(([gid, glabel], gi) => {
  const recs = proportional(programRecords.get(gid) ?? 0, descending(projectCounts[gi]));
  recs.forEach((records, k) => {
    const id = `j-${gid.slice(2)}-${k + 1}`;
    projectNodes.push({ id, layer: "project", label: `${glabel} · project ${k + 1}`, records });
    programLinks.push({ id: `${gid}>${id}`, from: gid, to: id, layer: "program", records });
  });
});

const actionCounts = proportional(224, projectNodes.map((p) => p.records));
const actionNodes: PyramidNode[] = [];
const projectLinks: PyramidLink[] = [];
let actionNo = 0;
projectNodes.forEach((p, pi) => {
  proportional(p.records, descending(actionCounts[pi]), 0).forEach((records) => {
    actionNo += 1;
    const id = `a-${actionNo}`;
    actionNodes.push({ id, layer: "action", label: `Action ${actionNo} · ${p.label}`, records });
    projectLinks.push({ id: `${p.id}>${id}`, from: p.id, to: id, layer: "project", records });
  });
});

const sumBy = (links: PyramidLink[], key: "from" | "to", id: string) => links.filter((l) => l[key] === id).reduce((s, l) => s + l.records, 0);

export const pyramidNodes: PyramidNode[] = [
...strategies.map(([id, label]) => ({ id, label, layer: "strategy" as const, records: sumBy(strategyLinks, "from", id) })),
...policies.map(([id, label]) => ({ id, label, layer: "policy" as const, records: sumBy(strategyLinks, "to", id) })),
...programs.map(([id, label]) => ({ id, label, layer: "program" as const, records: programRecords.get(id) ?? 0 })),
...projectNodes,
...actionNodes];


export const pyramidLinks: PyramidLink[] = [...strategyLinks, ...policyLinks, ...programLinks, ...projectLinks];
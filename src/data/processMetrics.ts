export type ProcessKey = "all" | "p2p" | "maint" | "hse";

export const processOptions: {key: ProcessKey;label: string;}[] = [
{ key: "all", label: "All processes" },
{ key: "p2p", label: "Procure-to-Pay" },
{ key: "maint", label: "Maintenance WO" },
{ key: "hse", label: "HSE Permit-to-Work" }];


export interface Kpi {
  label: string;
  value: string;
  unit: string;
  delta: string;
  good: boolean;
  target: string;
  source: string;
  records: string;
  method: string;
  spark: number[];
}

export const processKpis: Record<ProcessKey, Kpi[]> = {
  all: [
  { label: "Avg. cycle time", value: "8.9", unit: "days", delta: "+12%", good: false, target: "6.5 d", source: "ERP · CMMS · HSE", records: "63,914 cases", method: "Average (mean) start→close across all cases", spark: [7.6, 7.9, 8.1, 8.4, 8.2, 8.8, 8.9] },
  { label: "Approval delay", value: "3.1", unit: "days", delta: "+18%", good: false, target: "1.5 d", source: "ERP · CMMS", records: "48,320 approvals", method: "Wait time in approval states", spark: [2.2, 2.4, 2.6, 2.7, 2.9, 3.0, 3.1] },
  { label: "Throughput", value: "1,284", unit: "/wk", delta: "+4%", good: true, target: "1,250", source: "ERP · CMMS", records: "Weekly closures", method: "Closed cases per week", spark: [1180, 1210, 1240, 1220, 1260, 1270, 1284] },
  { label: "Rework rate", value: "8.6", unit: "%", delta: "-0.8 pt", good: true, target: "5%", source: "ERP · CMMS", records: "5,497 loops", method: "Cases revisiting a completed stage", spark: [10.1, 9.8, 9.6, 9.3, 9.0, 8.8, 8.6] },
  { label: "SLA compliance", value: "71", unit: "%", delta: "-3 pt", good: false, target: "90%", source: "ERP · CMMS · HSE", records: "63,914 cases", method: "Cases closed within documented SLA", spark: [76, 75, 74, 74, 72, 72, 71] }],

  p2p: [
  { label: "Avg. cycle time", value: "11.4", unit: "days", delta: "+21%", good: false, target: "7 d", source: "ERP", records: "41,208 PR/POs", method: "Average (mean) of PR created → PO released", spark: [9.1, 9.6, 10.4, 10.9, 11.8, 11.9, 11.4] },
  { label: "Approval delay", value: "4.3", unit: "days", delta: "+26%", good: false, target: "1.5 d", source: "ERP", records: "36,110 approvals", method: "Tier-1 + Tier-2 wait time", spark: [3.0, 3.2, 3.6, 3.8, 4.1, 4.4, 4.3] },
  { label: "Throughput", value: "642", unit: "/wk", delta: "+2%", good: true, target: "600", source: "ERP", records: "POs released", method: "POs released per week", spark: [610, 620, 615, 630, 628, 640, 642] },
  { label: "Rework rate", value: "11.2", unit: "%", delta: "+1.1 pt", good: false, target: "5%", source: "ERP", records: "4,615 returns", method: "PRs returned for correction", spark: [9.8, 10.1, 10.4, 10.6, 10.9, 11.0, 11.2] },
  { label: "SLA compliance", value: "58", unit: "%", delta: "-6 pt", good: false, target: "90%", source: "ERP", records: "41,208 PR/POs", method: "PRs converted within 7 days", spark: [66, 64, 63, 61, 60, 59, 58] }],

  maint: [
  { label: "Avg. cycle time", value: "6.8", unit: "days", delta: "+9%", good: false, target: "5 d", source: "CMMS", records: "6,412 WOs", method: "Average (mean) of WO raised → completed", spark: [6.0, 6.1, 6.3, 6.6, 6.4, 6.9, 6.8] },
  { label: "Approval delay", value: "2.9", unit: "days", delta: "+14%", good: false, target: "1 d", source: "CMMS", records: "6,412 WOs", method: "Planner review wait", spark: [2.3, 2.4, 2.5, 2.6, 2.8, 3.0, 2.9] },
  { label: "Throughput", value: "412", unit: "/wk", delta: "+6%", good: true, target: "400", source: "CMMS", records: "WOs closed", method: "Closed WOs per week", spark: [370, 380, 390, 395, 400, 405, 412] },
  { label: "Rework rate", value: "6.1", unit: "%", delta: "-1.4 pt", good: true, target: "4%", source: "CMMS", records: "391 repeat WOs", method: "Repeat failure within 30 days", spark: [8.0, 7.6, 7.1, 6.9, 6.5, 6.3, 6.1] },
  { label: "SLA compliance", value: "74", unit: "%", delta: "-2 pt", good: false, target: "90%", source: "CMMS", records: "6,412 WOs", method: "Completed within priority SLA", spark: [78, 77, 76, 76, 75, 74, 74] }],

  hse: [
  { label: "Avg. cycle time", value: "1.6", unit: "days", delta: "-5%", good: true, target: "2 d", source: "HSE system", records: "2,980 permits", method: "Average (mean) of permit request → issued", spark: [1.8, 1.8, 1.7, 1.7, 1.6, 1.6, 1.6] },
  { label: "Approval delay", value: "0.7", unit: "days", delta: "-8%", good: true, target: "1 d", source: "HSE system", records: "2,980 permits", method: "Area authority sign-off wait", spark: [0.9, 0.8, 0.8, 0.8, 0.7, 0.7, 0.7] },
  { label: "Throughput", value: "230", unit: "/wk", delta: "+1%", good: true, target: "220", source: "HSE system", records: "Permits issued", method: "Permits issued per week", spark: [220, 224, 226, 225, 228, 229, 230] },
  { label: "Rework rate", value: "3.4", unit: "%", delta: "-0.3 pt", good: true, target: "3%", source: "HSE system", records: "101 resubmissions", method: "Permits resubmitted", spark: [4.0, 3.9, 3.8, 3.6, 3.5, 3.5, 3.4] },
  { label: "SLA compliance", value: "93", unit: "%", delta: "+1 pt", good: true, target: "90%", source: "HSE system", records: "2,980 permits", method: "Issued within SLA", spark: [90, 91, 91, 92, 92, 93, 93] }]

};

export const cycleTrend = [
{ week: "W27", all: 8.1, p2p: 10.2, maint: 6.3, hse: 1.7 },
{ week: "W28", all: 8.0, p2p: 10.0, maint: 6.2, hse: 1.7 },
{ week: "W29", all: 8.3, p2p: 10.6, maint: 6.4, hse: 1.7 },
{ week: "W30", all: 8.6, p2p: 11.3, maint: 6.6, hse: 1.6 },
{ week: "W31", all: 8.4, p2p: 10.9, maint: 6.5, hse: 1.6 },
{ week: "W32", all: 8.8, p2p: 11.8, maint: 6.9, hse: 1.6 },
{ week: "W33", all: 9.2, p2p: 12.4, maint: 7.1, hse: 1.7 },
{ week: "W34", all: 8.9, p2p: 11.6, maint: 6.9, hse: 1.6 },
{ week: "W35", all: 9.0, p2p: 11.9, maint: 6.8, hse: 1.6 },
{ week: "W36", all: 8.7, p2p: 11.2, maint: 6.7, hse: 1.5 },
{ week: "W37", all: 8.9, p2p: 11.5, maint: 6.9, hse: 1.6 },
{ week: "W38", all: 8.9, p2p: 11.4, maint: 6.8, hse: 1.6 }];


export const trendTargets: Record<ProcessKey, number> = { all: 6.5, p2p: 7, maint: 5, hse: 2 };

export const stageDelays = [
{ stage: "PR created", hours: 4 },
{ stage: "Dept review", hours: 18 },
{ stage: "Tier-2 approval", hours: 103 },
{ stage: "Sourcing", hours: 31 },
{ stage: "PO release", hours: 12 },
{ stage: "Goods receipt", hours: 22 },
{ stage: "Invoice match", hours: 49 }];


export const bottleneckFindings = [
{ type: "Approval queue", text: "Tier-2 approvals batch at month-end; average queue 4.3 days", cases: "14,802 cases", status: "verified" as const },
{ type: "Duplicated activity", text: "Vendor due-diligence performed by both Procurement and Finance", cases: "2,104 cases", status: "verified" as const },
{ type: "Manual handoff", text: "Field material requests re-keyed from email into ERP", cases: "46% of PRs", status: "inferred" as const },
{ type: "Unnecessary dependency", text: "HSE sign-off requested for non-hazardous catalog items", cases: "1,318 cases", status: "inferred" as const }];


export const sankeyData = {
  nodes: [
  { name: "Field Operations" },
  { name: "Maintenance" },
  { name: "Production" },
  { name: "Procurement" },
  { name: "Finance · Tier-2" },
  { name: "Returned / rework" },
  { name: "PO issued" },
  { name: "Supply Chain" },
  { name: "Delivered to site" }],

  links: [
  { source: 0, target: 3, value: 420 },
  { source: 1, target: 3, value: 610 },
  { source: 2, target: 3, value: 180 },
  { source: 3, target: 4, value: 520 },
  { source: 3, target: 6, value: 510 },
  { source: 3, target: 5, value: 180 },
  { source: 4, target: 6, value: 430 },
  { source: 4, target: 5, value: 90 },
  { source: 6, target: 7, value: 940 },
  { source: 7, target: 8, value: 940 }]

};

export const complianceRows = [
{ process: "HSE Permit-to-Work", conformance: 93, deviations: 7, coverage: 96 },
{ process: "Finance Close", conformance: 82, deviations: 24, coverage: 71 },
{ process: "Production Reporting", conformance: 79, deviations: 12, coverage: 64 },
{ process: "Maintenance WO", conformance: 68, deviations: 211, coverage: 88 },
{ process: "Procure-to-Pay", conformance: 61, deviations: 1240, coverage: 94 }];


export const departments = ["Field Ops", "Maintenance", "Procurement", "Finance", "Supply Chain", "HSE"];

export const dependencyMatrix: number[][] = [
[0, 14, 22, 6, 4, 3],
[9, 0, 31, 4, 12, 7],
[26, 34, 0, 18, 21, 1],
[3, 6, 41, 0, 2, 0],
[19, 24, 8, 2, 0, 1],
[12, 16, 5, 0, 1, 0]];


export const dependencyNotes: Record<string, string> = {
  "2-1": "Late POs from Procurement delay 34 maintenance hours/week — mostly spare parts for corrective WOs.",
  "3-2": "Tier-2 approvals in Finance add 41 hours/week to Procurement turnaround.",
  "2-0": "Material shortages from Procurement idle field crews ~26 hours/week.",
  "1-2": "Incomplete WO material lists cause 31 hours/week of Procurement rework."
};

export const anomalies = [
{ id: "ANM-52", kind: "Communication pattern", title: "Approval requests escalated via chat instead of ERP", detail: "Teams escalation volume to Finance approvers up 3.2× in August (metadata only).", status: "inferred" as const, confidence: 74, when: "Aug 4 – Sep 2" },
{ id: "ANM-49", kind: "Process deviation", title: "POs released before requisition approval", detail: "86 POs created ahead of PR approval timestamp — possible emergency procurement path.", status: "verified" as const, confidence: 91, when: "Q3" },
{ id: "ANM-47", kind: "Operational risk", title: "Single planner handles 41% of critical WOs", detail: "Key-person dependency for North Basin compressor maintenance.", status: "verified" as const, confidence: 88, when: "Jan – Sep" },
{ id: "ANM-44", kind: "Process deviation", title: "Invoice price variances cleared by requester", detail: "Segregation-of-duties concern on 23 invoices; may reflect delegated authority.", status: "inferred" as const, confidence: 62, when: "Sep" }];
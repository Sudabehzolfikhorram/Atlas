import type { AssistantResponse, BlockedNotice, WorkflowStep } from "../types/assistant";

export const overviewSuggestions = [
"What needs attention?",
"Identify process bottlenecks",
"Show improvement opportunities",
"Summarize operational risks",
"Analyze business performance",
"Which processes need optimization?",
"Which documents did you use as sources to analyze the organizational structure?"];


/** Topic shortcuts on the Overview assistant card; each sends its prompt to AI Chat. */
export const overviewTopics = [
{ label: "Priority actions", prompt: "What needs attention?" },
{ label: "Workflow bottlenecks", prompt: "Identify process bottlenecks" },
{ label: "Improvement opportunities", prompt: "Show improvement opportunities" },
{ label: "Operational risks", prompt: "Summarize operational risks" },
{ label: "Business performance", prompt: "Analyze business performance" }];


export const investigationPrompts = [
"Which documents did you use as sources to analyze the organizational structure?",
"Map the procurement approval workflow across departments.",
"Identify delays in maintenance work order approvals.",
"Compare our current purchasing process with industry best practices.",
"Show how operational decisions flow between the field teams, procurement, and finance.",
"Design an optimized workflow that reduces approval delays and improves accountability."];


export const followUpPrompts = [
"What evidence supports this?",
"Who owns this process?",
"Turn this into an action plan"];


export const recentInvestigations = [
{ title: "Procurement approval workflow", when: "Today, 08:41", status: "Complete" },
{ title: "Asset Register completeness", when: "Oct 8", status: "Complete" },
{ title: "Vendor master conflicts", when: "Oct 6", status: "Needs validation" },
{ title: "Permit-to-Work exceptions", when: "Oct 2", status: "Complete" }];


const p2pCurrent: WorkflowStep[] = [
{ label: "Field request", owner: "Field Ops", duration: "1.6 d", kind: "manual" },
{ label: "PR created", owner: "Procurement", duration: "0.2 d", kind: "ok" },
{ label: "Dept review", owner: "Procurement", duration: "0.8 d", kind: "ok" },
{ label: "Tier-2 approval", owner: "Finance", duration: "4.3 d", kind: "bottleneck" },
{ label: "Sourcing", owner: "Procurement", duration: "1.3 d", kind: "ok" },
{ label: "PO issued", owner: "Procurement", duration: "0.5 d", kind: "ok" }];


export const responses: Record<string, AssistantResponse> = {
  sources: {
    title: "Sources used to analyze the organizational structure",
    summary: "The organizational structure was built from 5 indexed documents in the Organization Catalog plus 3 connected systems. Two catalog files were not used: one is still being indexed and one failed to process.",
    blocks: [
    {
      kind: "documents",
      title: "Source documents",
      documents: [
      { id: "DOC-2041", usedFor: "Approval roles and thresholds linking Procurement, Finance and Field Ops" },
      { id: "DOC-2040", usedFor: "Maintenance roles, planner review step and handoffs to Procurement" },
      { id: "DOC-2035", usedFor: "Asset ownership by department and criticality responsibilities" },
      { id: "DOC-2037", usedFor: "HSE permit reviewers and escalation contacts" },
      { id: "DOC-2034", usedFor: "Data Governance ownership and retention responsibilities" }],

      systems: [
      { id: "SRC-09", usedFor: "Org chart and role titles (yesterday's snapshot — sync failed)" },
      { id: "SRC-01", usedFor: "Approver roles and release-strategy membership" },
      { id: "SRC-04", usedFor: "Cross-team communication patterns (metadata only)" }],

      excluded: [
      { id: "DOC-2039", reason: "Still processing — not yet indexed" },
      { id: "DOC-2036", reason: "Failed: file is password-protected" }]

    }],

    evidence: [],
    issues: [],
    recommendations: [],
    confidence: 86
  },
  summary: {
    title: "What needs attention now · North Basin",
    summary: "Three items carry the most business impact in the demo dataset: the Tier-2 procurement approval queue, maintenance work orders stalling at planner review, and an undocumented step in the production allocation lineage. Two of the five open decisions can be made today.",
    blocks: [
    {
      kind: "metrics",
      title: "Key indicators",
      items: [
      { label: "Tier-2 approval wait", value: "4.3 d", note: "Target 1.5 d", tone: "rose" },
      { label: "Corrective WOs waiting >72h", value: "38%", note: "Target < 15%", tone: "amber" },
      { label: "Open decisions", value: "5", note: "2 can be made today", tone: "blue" },
      { label: "Undocumented lineage steps", value: "1", note: "Regulatory filing", tone: "amber" }]

    },
    {
      kind: "report",
      title: "Attention summary",
      sections: [
      { heading: "Procurement", body: "The Tier-2 budget approval in Finance is the single largest delay in requisition-to-PO, adding 4.3 days per request." },
      { heading: "Maintenance", body: "Corrective work orders stall at planner review; one planner handles 41% of critical work orders." },
      { heading: "Governance", body: "The production allocation lineage includes an undocumented transform that a regulatory filing depends on." }],

      link: { label: "Open Executive Report", to: "/reports", focus: "report-summary" }
    }],

    evidence: [
    { label: "SIG-014 · Procurement approvals exceed target", source: "ERP", status: "verified" },
    { label: "SIG-011 · Planner review delays", source: "CMMS", status: "verified" },
    { label: "ATN-101 · Allocation lineage gap", source: "Documents", status: "verified" },
    { label: "SIG-009 · Asset Register dependency", source: "Lineage", status: "inferred" }],

    issues: ["Tier-2 approval adds 4.3 days per requisition", "38% of corrective WOs wait >72h", "Regulatory filing depends on an undocumented transform"],
    recommendations: [
    { text: "Decide on the procurement workflow redesign", impact: "Largest single delay reduction (estimate)" },
    { text: "Assign an owner to the Asset Register", impact: "Unblocks 4 governance tasks" }],

    confidence: 88
  },
  procurement: {
    title: "Procurement approval workflow · North Basin",
    summary: "Requisitions pass through 6 stages and 3 departments. The Tier-2 budget approval in Finance accounts for 62% of total elapsed time, and 46% of requests start as emails that are re-keyed into the ERP.",
    blocks: [
    {
      kind: "chart",
      title: "Average time per stage",
      unit: "days",
      data: p2pCurrent.map((s) => ({ label: s.label, value: parseFloat(s.duration) })),
      note: "From 41,208 PR/PO event records in the ERP (sample data)."
    }],

    workflow: p2pCurrent,
    evidence: [
    { label: "41,208 PR/PO event records", source: "ERP", status: "verified" },
    { label: "Release strategy R2 membership", source: "ERP", status: "verified" },
    { label: "Email-to-PR similarity match", source: "Email (metadata)", status: "inferred" }],

    issues: ["Tier-2 queue batches at month-end", "Manual re-keying of field requests", "Vendor check duplicated in Finance"],
    recommendations: [
    { text: "Raise Tier-2 threshold to $25k for catalog items", impact: "−4.0 d cycle time (estimate)" },
    { text: "Introduce structured field request form", impact: "−1.4 d per request (estimate)" }],

    confidence: 92
  },
  maintenance: {
    title: "Maintenance work order approval delays",
    summary: "Corrective WOs wait an average of 2.9 days at Planner Review. 38% wait more than 72 hours, concentrated on one planner who handles 41% of critical WOs.",
    blocks: [
    {
      kind: "metrics",
      title: "Work order indicators",
      items: [
      { label: "Avg. planner review wait", value: "2.9 d", tone: "rose" },
      { label: "Waiting more than 72h", value: "38%", tone: "amber" },
      { label: "Critical WOs on one planner", value: "41%", tone: "amber" },
      { label: "Status histories analyzed", value: "6,412", tone: "neutral" }]

    }],

    workflow: [
    { label: "WO raised", owner: "Field Ops", duration: "0.1 d", kind: "ok" },
    { label: "Planner review", owner: "Maintenance", duration: "2.9 d", kind: "bottleneck" },
    { label: "Parts reservation", owner: "Procurement", duration: "1.8 d", kind: "manual" },
    { label: "Scheduled", owner: "Maintenance", duration: "1.2 d", kind: "ok" },
    { label: "Completed", owner: "Field Ops", duration: "0.8 d", kind: "ok" }],

    evidence: [
    { label: "6,412 corrective WO status histories", source: "CMMS", status: "verified" },
    { label: "Planner workload distribution", source: "CMMS", status: "verified" },
    { label: "Escalations via chat (metadata)", source: "Chat", status: "inferred" }],

    issues: ["Key-person dependency on one planner", "All WOs require review regardless of risk", "CMMS data currently 3h delayed"],
    recommendations: [
    { text: "Auto-release low-risk WOs (criticality C/D, < $8k)", impact: "72h → ~24h wait (estimate)" },
    { text: "Rebalance critical WO assignments across planners", impact: "Reduced key-person risk" }],

    confidence: 84
  },
  compare: {
    title: "Current purchasing vs industry best practice",
    summary: "Compared with benchmark set BP-P2P-07 (peer upstream operators), Meridian applies a single low threshold for budget approval and lacks catalog-based auto-release.",
    workflow: p2pCurrent,
    compareWorkflow: [
    { label: "Structured request", owner: "Field Ops", duration: "0.2 d", kind: "proposed" },
    { label: "PR auto-created", owner: "ERP", duration: "0.1 d", kind: "proposed" },
    { label: "Auto budget check", owner: "ERP", duration: "< 1 h", kind: "proposed" },
    { label: "Sourcing", owner: "Procurement", duration: "1.3 d", kind: "ok" },
    { label: "PO issued", owner: "Procurement", duration: "0.5 d", kind: "ok" }],

    evidence: [
    { label: "Benchmark BP-P2P-07 (12 operators)", source: "Benchmark library", status: "inferred" },
    { label: "Policy PRC-004 v3.2", source: "Documents", status: "verified" }],

    issues: ["Threshold $10k vs peer average $25k", "No catalog auto-release", "Approvals tracked partly by email"],
    recommendations: [{ text: "Adopt tiered thresholds $5k / $25k / $250k", impact: "Peer-average cycle 6.8 d (benchmark, not validated)" }],
    confidence: 78
  },
  flow: {
    title: "Decision flow: Field teams → Procurement → Finance",
    summary: "Operational decisions originate with field supervisors, pass to procurement for sourcing and to finance for budget release. Two inferred off-system channels (email accrual estimates, chat escalations) carry decisions outside the ERP.",
    workflow: [
    { label: "Field need identified", owner: "Field Ops", duration: "—", kind: "ok" },
    { label: "Email request", owner: "Field Ops", duration: "1.6 d", kind: "manual" },
    { label: "Procurement sourcing", owner: "Procurement", duration: "2.1 d", kind: "ok" },
    { label: "Budget release", owner: "Finance", duration: "4.3 d", kind: "bottleneck" },
    { label: "Accrual estimate (email)", owner: "Finance", duration: "—", kind: "manual" }],

    evidence: [
    { label: "Org relationships from ERP roles", source: "ERP", status: "verified" },
    { label: "Periodic field→accruals email pattern", source: "Email (metadata)", status: "inferred" }],

    issues: ["Undocumented accrual dependency", "Decision rights unclear for urgent requests"],
    recommendations: [{ text: "Validate the Field Ops → Finance accrual dependency", impact: "Clarifies a control gap" }],
    confidence: 71
  },
  design: {
    title: "Optimized procurement workflow (proposed)",
    summary: "A redesigned flow that routes low-risk catalog purchases through automated budget checks, adds a named accountable owner at each stage and replaces email requests with a structured form.",
    workflow: [
    { label: "Structured request", owner: "Field Ops", duration: "0.2 d", kind: "proposed" },
    { label: "Risk routing", owner: "ERP", duration: "auto", kind: "proposed" },
    { label: "Auto budget check (< $25k)", owner: "ERP", duration: "< 1 h", kind: "proposed" },
    { label: "Tier-2 approval (≥ $25k)", owner: "Finance", duration: "1.5 d SLA", kind: "proposed" },
    { label: "PO issued", owner: "Procurement", duration: "0.5 d", kind: "ok" }],

    evidence: [
    { label: "97.8% of sub-$25k Tier-2 approvals unchanged", source: "ERP", status: "verified" },
    { label: "Benchmark BP-P2P-07", source: "Benchmark library", status: "inferred" }],

    issues: ["Requires ERP budget-check configuration", "Post-audit sampling needed to maintain control"],
    recommendations: [
    { text: "Pilot for 60 days in North Basin", impact: "11.4 → ~7.2 d (estimate)" },
    { text: "Assign stage owners in RACI", impact: "Clear accountability" }],

    confidence: 82
  }
};

export function matchResponse(prompt: string): AssistantResponse {
  const p = prompt.toLowerCase();
  if (/\bsources?\b|documents?|\bfiles?\b|catalog|organi[sz]ational structure|org structure/.test(p)) return responses.sources;
  if (p.includes("design") || p.includes("optimi") || p.includes("improvement")) return responses.design;
  if (p.includes("compare") || p.includes("best practice")) return responses.compare;
  if (p.includes("maintenance") || p.includes("work order")) return responses.maintenance;
  if (p.includes("flow between") || p.includes("decisions flow")) return responses.flow;
  if (p.includes("attention") || p.includes("risk") || p.includes("performance") || p.includes("summar")) return responses.summary;
  return responses.procurement;
}

const restrictedTerms = ["salary", "salaries", "message content", "private chat", "read emails", "email content", "individual performance", "personal performance"];

export function checkRestricted(prompt: string): BlockedNotice | null {
  const p = prompt.toLowerCase();
  if (!restrictedTerms.some((t) => p.includes(t))) return null;
  return {
    title: "This question needs data I can't access",
    explanation:
    "Answering would require message content or individual-level personal data. Atlas only analyses communication metadata and never scores individual performance. A Data Governance Officer can review whether a scoped exception is appropriate.",
    actionLabel: "Review data permissions",
    actionTo: "/trust"
  };
}
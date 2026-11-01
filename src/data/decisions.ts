import type { Decision } from "../types/intel";

export const decisions: Decision[] = [
{
  id: "DEC-031",
  title: "Approve the proposed procurement approval workflow redesign",
  type: "Workflow change",
  urgency: "Decide this week",
  context: "Catalog purchases under $25k would skip Tier-2 budget approval and move to automated budget checks, with monthly post-audit sampling.",
  evidence: [
  { label: "62% of P2P delay sits at Tier-2 approval (ERP, 41k records)", status: "verified" },
  { label: "97.8% of Tier-2 catalog requests under $25k approved unchanged", status: "verified" },
  { label: "Peer benchmark: 3-tier thresholds at $5k / $25k / $250k", status: "inferred" }],

  impact: "Cycle time 11.4 → ~7.2 days; ~$1.4M quarterly savings",
  risks: ["Reduced pre-spend control on catalog items", "Requires budget-check rules to be live in ERP", "Change management for 34 approvers"],
  decisionMaker: { name: "Thomas Reid", role: "Operations Director" },
  approvals: [
  { name: "Layla Haddad", role: "Procurement Manager", done: true },
  { name: "Elena Vasquez", role: "Finance Controller", done: false },
  { name: "Thomas Reid", role: "Operations Director", done: false }],

  dependencies: ["Budget-check rules configured (T-104)", "Internal audit sign-off on post-audit sampling"],
  nextStep: "Approve redesign for a 60-day controlled rollout in North Basin",
  confidence: 86,
  actions: ["approve", "validate", "defer"]
},
{
  id: "DEC-029",
  title: "Assign an owner to the ungoverned Asset Register data domain",
  type: "Ownership",
  urgency: "Decide today",
  context: "No accountable owner is recorded for the Asset Register, yet three departments make decisions using it.",
  evidence: [
  { label: "Ownership field empty in data catalogue", status: "verified" },
  { label: "3 departments consume register in reports", status: "inferred" }],

  impact: "Unblocks 4 governance tasks and criticality backfill",
  risks: ["Owner capacity — backfill effort ~6 weeks", "Requires cross-department agreement"],
  decisionMaker: { name: "Dana Whitfield", role: "VP, Operational Excellence" },
  approvals: [{ name: "Dana Whitfield", role: "VP, Operational Excellence", done: false }],
  dependencies: ["None — can be made immediately"],
  nextStep: "Assign Marcus Okafor (Maintenance) as interim domain owner",
  confidence: 90,
  actions: ["approve", "defer"]
},
{
  id: "DEC-027",
  title: "Authorize a pilot to reduce maintenance approval delays",
  type: "Pilot",
  urgency: "Decide this week",
  context: "Low-risk corrective work orders (criticality C/D, < $8k) would auto-release from Planner Review for 2 assets over 6 weeks.",
  evidence: [
  { label: "38% of WOs wait >72h at Planner Review", status: "verified" },
  { label: "Planner escalations correlate with backlog spikes", status: "inferred" }],

  impact: "Planner wait 72h → ~24h on pilot assets",
  risks: ["Criticality data incomplete for 14% of assets", "Must exclude safety-critical equipment"],
  decisionMaker: { name: "Thomas Reid", role: "Operations Director" },
  approvals: [
  { name: "Marcus Okafor", role: "Maintenance Operations Lead", done: true },
  { name: "Ahmed Al-Sayed", role: "HSE Manager", done: false }],

  dependencies: ["Asset criticality confirmed for pilot assets", "HSE exclusion list"],
  nextStep: "Authorize pilot on Compressor Station 4 and Separator Train B",
  confidence: 79,
  actions: ["approve", "validate", "defer"]
},
{
  id: "DEC-025",
  title: "Request validation of the inferred Field Ops → Finance dependency",
  type: "Validation",
  urgency: "Within 2 weeks",
  context: "AI infers that field cost estimates sent by email feed Finance accrual calculations without a system record.",
  evidence: [
  { label: "Recurring email pattern: field supervisor → accruals team", status: "inferred" },
  { label: "No matching ERP interface found", status: "verified" }],

  impact: "Confirms or rules out an undocumented control dependency",
  risks: ["Validation requires 5 interviews and sample reconciliation"],
  decisionMaker: { name: "Sofia Lindqvist", role: "Data Governance Officer" },
  approvals: [{ name: "Sofia Lindqvist", role: "Data Governance Officer", done: false }],
  dependencies: ["Access to accrual workpapers (restricted)"],
  nextStep: "Request validation from Finance Controller with 10-sample reconciliation",
  confidence: 64,
  actions: ["validate", "defer"]
},
{
  id: "DEC-022",
  title: "Prioritize remediation of the production allocation lineage gap",
  type: "Remediation",
  urgency: "Within 30 days",
  context: "The daily production report's allocation step uses a spreadsheet transformation with no documented lineage or validation checkpoint.",
  evidence: [
  { label: "Spreadsheet transformation located in document repository", status: "verified" },
  { label: "Report feeds regulatory production filings", status: "verified" }],

  impact: "Closes a high-visibility regulatory reporting risk",
  risks: ["Engineering effort to migrate logic", "Temporary dual-running"],
  decisionMaker: { name: "Priya Raman", role: "Enterprise Data Lead" },
  approvals: [
  { name: "Priya Raman", role: "Enterprise Data Lead", done: false },
  { name: "Thomas Reid", role: "Operations Director", done: false }],

  dependencies: ["Production engineering availability (Q4)"],
  nextStep: "Prioritize as P1 and schedule lineage documentation sprint",
  confidence: 88,
  actions: ["approve", "defer"]
}];
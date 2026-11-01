export const dataUsage = [
{ analysis: "Process mining (cycle times, bottlenecks)", categories: ["ERP transactions", "CMMS work orders", "HSE permits"], why: "Event timestamps reconstruct actual process paths and wait times.", excluded: "Personal performance scoring" },
{ analysis: "Organizational workflow mapping", categories: ["Email metadata", "Chat metadata", "HR roles"], why: "Who-hands-off-to-whom patterns reveal informal handoffs between teams.", excluded: "Message content, private chats" },
{ analysis: "Data lineage & quality", categories: ["Historian tags", "Document repository", "Data platform logs"], why: "Trace critical data from origin to reports and filings.", excluded: "—" },
{ analysis: "Best-practice comparison", categories: ["Policies & SOPs", "Benchmark library"], why: "Compare documented and observed workflows to peer practices.", excluded: "Competitor confidential data" }];


export const accessRoles = ["Executives", "Process analysts", "Governance officers", "Dept. managers", "AI agent"];

export const accessMatrix: {resource: string;levels: ("full" | "masked" | "aggregate" | "none")[];}[] = [
{ resource: "ERP transactions", levels: ["aggregate", "full", "full", "full", "full"] },
{ resource: "Email & chat metadata", levels: ["aggregate", "masked", "masked", "none", "masked"] },
{ resource: "Named individuals in findings", levels: ["full", "masked", "full", "masked", "masked"] },
{ resource: "HR roles & org chart", levels: ["full", "aggregate", "full", "aggregate", "aggregate"] },
{ resource: "AI recommendations", levels: ["full", "full", "full", "full", "full"] },
{ resource: "Audit trail", levels: ["full", "aggregate", "full", "none", "none"] }];


export const privacyControls = [
{ title: "Communication content masking", detail: "Email and chat bodies are never ingested. Only sender, recipient role, timing and channel.", active: true },
{ title: "Pseudonymised individuals", detail: "Individuals appear as roles in analyst views; names visible to executives and governance officers only.", active: true },
{ title: "No individual performance scoring", detail: "Findings describe processes and teams, not personal productivity.", active: true },
{ title: "Retention enforcement", detail: "Communication metadata purged after 12 months; derived models retained 3 years.", active: true },
{ title: "Works council review", detail: "Next review of communication analysis scope scheduled Nov 18, 2026.", active: false }];


export const traceChains = [
{
  insight: "SIG-014 · Procurement approvals exceed 7-day target",
  chain: [
  { level: "Insight", label: "Avg. PR→PO 11.4 d vs 7 d target", status: "verified" as const },
  { level: "Metric", label: "Average of 41,208 PR→PO durations, Jan–Sep", status: "verified" as const },
  { level: "Dataset", label: "ERP EBAN / EKKO tables · release log", status: "verified" as const },
  { level: "Record sample", label: "PR-2026-0418823 · Tier-2 pending 6.2 d", status: "verified" as const },
  { level: "Policy", label: "PRC-004 v3.2 — 7-day target, $10k Tier-2", status: "verified" as const }]

},
{
  insight: "SIG-007 · Manual handoffs Field Ops → Procurement",
  chain: [
  { level: "Insight", label: "46% of PRs re-keyed from email", status: "inferred" as const },
  { level: "Method", label: "Text similarity of email subject vs PR description (≥0.82)", status: "inferred" as const },
  { level: "Dataset", label: "Email metadata + attachment names; ERP PR text", status: "verified" as const },
  { level: "Limitation", label: "Bodies excluded — match uses subject lines only", status: "inferred" as const }]

}];
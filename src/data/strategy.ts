import type { AssistantAnswer, StrategicObjective, StrategyInsight, StrategyRecommendation } from "../types/strategy";

/**
 * Strategy analysis for Meridian Energy, mapped onto the team graph in data/teamGraph.ts.
 * Teams, relationships and evidence come from that graph; objectives, scores and financial
 * figures are illustrative sample data.
 */
export const objectives: StrategicObjective[] = [
{ id: "o1", title: "Reduce cost-to-serve 12% across upstream operations", short: "Cost-to-serve −12%", owner: "Laila Haddad", kpi: "Cost per BOE", current: "$14.20", target: "$12.50", alignment: 54, projected: 78, status: "off-track", teams: ["exec", "ops", "owners", "eng", "bi"] },
{ id: "o2", title: "Certified data behind every executive KPI by Q2 2027", short: "Certified executive KPIs", owner: "Hannah Ortiz", kpi: "KPIs on certified data", current: "18 / 26", target: "26 / 26", alignment: 68, projected: 88, status: "at-risk", teams: ["bi", "eng", "owners", "gov"] },
{ id: "o3", title: "Close all high-severity control gaps before the FY27 audit", short: "Audit-ready controls", owner: "Victor Alvarez", kpi: "Open high-severity gaps", current: "5", target: "0", alignment: 47, projected: 81, status: "off-track", teams: ["sec", "audit", "it", "gov", "exec"] },
{ id: "o4", title: "Accountable owner for every data domain", short: "Full data ownership", owner: "Sofia Mendes", kpi: "Domains with an owner", current: "18 / 24", target: "24 / 24", alignment: 72, projected: 94, status: "at-risk", teams: ["gov", "owners", "exec"] }];


export const insights: StrategyInsight[] = [
{
  id: "i1", type: "ownership-conflict", severity: "High", basis: "evidence", confidence: 92,
  title: "Supplier master data has no accountable owner",
  summary: "Data Governance assigns owners, but supplier master data has been unassigned for 47 days. Procurement and Production Accounting both edit it; neither is accountable.",
  teams: ["gov", "owners"], relations: ["r2"], objectives: ["o4", "o1"],
  evidence: [
  { label: "Ownership register: 18 of 24 domains have a named owner", source: "Data catalog · verified 9 Oct", status: "partial" },
  { label: "Supplier master owner role marked vacant", source: "Data Owners roster", status: "gap" },
  { label: "Owner assignment open for 47 days", source: "GOV-03 ownership register", status: "gap" }],

  impact: [
  { objective: "o4", effect: "Blocks 1 of the 6 remaining domains", delta: 9 },
  { objective: "o1", effect: "Duplicate supplier records inflate procurement cost", delta: 4 }],

  outcome: "An estimated $0.6M a year in duplicate supplier spend stays unaddressed (sample estimate).",
  recommendation: "rec1"
},
{
  id: "i2", type: "execution-gap", severity: "High", basis: "evidence", confidence: 88,
  title: "Production volumes bypass the governed pipeline",
  summary: "Operations enters daily volumes in an ungoverned spreadsheet using a shared account. Cost-to-serve is calculated from those volumes, so the headline KPI cannot be trusted.",
  teams: ["ops", "owners", "eng"], relations: ["r8", "r3"], objectives: ["o1", "o2"],
  evidence: [
  { label: "Volume submissions: 12 of 30 recorded with history", source: "Allocation spreadsheet · 1 Oct", status: "gap" },
  { label: "Edits made by a shared account, no change history", source: "Business Operations evidence", status: "gap" },
  { label: "6 quality rules not yet confirmed by owners", source: "Owners → Data Engineering", status: "partial" }],

  impact: [
  { objective: "o1", effect: "Cost per BOE is calculated on unverified volumes", delta: 11 },
  { objective: "o2", effect: "Production KPIs cannot be certified", delta: 6 }],

  outcome: "The cost-to-serve target cannot be evidenced to the board until volumes flow through the pipeline.",
  recommendation: "rec2"
},
{
  id: "i3", type: "bottleneck", severity: "Medium", basis: "evidence", confidence: 84,
  title: "Dataset access approvals take 6.8 days against a 3-day target",
  summary: "Data Owners approve access, and Data Governance re-checks each approval. 9 requests have waited more than 5 days; 11 approvals were given in chat and never recorded.",
  teams: ["owners", "gov"], relations: ["r9"], objectives: ["o2"],
  evidence: [
  { label: "Average approval time 6.8 days", source: "IAM ticketing · 12 Oct", status: "partial" },
  { label: "41 of 52 approvals recorded", source: "Access approval records", status: "partial" }],

  impact: [{ objective: "o2", effect: "Slows onboarding of certified sources for BI", delta: 5 }],
  outcome: "Each week of delay pushes back roughly 2 KPI certifications (sample estimate).",
  recommendation: "rec4"
},
{
  id: "i4", type: "strategic-risk", severity: "High", basis: "evidence", confidence: 81,
  title: "Failing historian feed makes cost forecasts stale",
  summary: "Historian ingestion has failed since 07:40. Curated datasets used by BI, and the executive scorecard built on them, now show yesterday's production.",
  teams: ["eng", "bi", "exec"], relations: ["r5", "r6"], objectives: ["o1", "o2"],
  evidence: [
  { label: "Historian sync failing since 07:40", source: "DQ-05 freshness alert", status: "gap" },
  { label: "Data completeness 87% against a 95% target", source: "Validation suite", status: "partial" }],

  impact: [
  { objective: "o1", effect: "Leadership decides on stale cost forecasts", delta: 5 },
  { objective: "o2", effect: "Scorecard freshness check fails", delta: 4 }],

  outcome: "Monthly executive review risks acting on forecasts that are a day or more out of date.",
  recommendation: "rec3"
},
{
  id: "i5", type: "execution-gap", severity: "High", basis: "evidence", confidence: 90,
  title: "Control evidence expired ahead of the FY27 audit",
  summary: "Q3 access recertification is 21 days overdue and 3 control test results have expired. Internal Audit cannot rely on the evidence Security shares.",
  teams: ["sec", "audit", "eng"], relations: ["r12", "r11"], objectives: ["o3"],
  evidence: [
  { label: "Q3 access recertification not completed", source: "IAM ticketing · last 30 Jun", status: "gap" },
  { label: "9 of 12 control test results current", source: "GRC tool · 15 Sep", status: "partial" }],

  impact: [{ objective: "o3", effect: "2 of the 5 open high-severity gaps", delta: 14 }],
  outcome: "Without action, the FY27 audit is likely to raise repeat findings on access control.",
  recommendation: "rec5"
},
{
  id: "i6", type: "misalignment", severity: "Medium", basis: "hypothesis", confidence: 64,
  title: "No accountability path from cost-to-serve to field operations",
  summary: "Leadership owns the cost-to-serve objective, but the map has no oversight relationship to Business Operations, the team that drives most of the cost. Accountability may stop at the scorecard.",
  teams: ["exec", "ops", "bi"], relations: ["r6", "r7"], objectives: ["o1"],
  missingLink: { from: "exec", to: "ops", label: "Expected: cost-to-serve oversight" },
  evidence: [
  { label: "No oversight or approval relation between Executive Leadership and Business Operations", source: "Inferred from the organization map", status: "unknown" },
  { label: "Operations last reviewed 29 Aug, the oldest review on the map", source: "Team review dates", status: "unknown" }],

  validate: "Confirm with the COO whether cost targets are cascaded to the Operations Director, and where that is recorded.",
  impact: [{ objective: "o1", effect: "Targets may not translate into field decisions", delta: 6 }],
  outcome: "If confirmed, cost reductions depend on dashboards rather than owned targets.",
  recommendation: "rec6"
},
{
  id: "i7", type: "strategic-risk", severity: "Low", basis: "hypothesis", confidence: 55,
  title: "Unverified access-log handoff could weaken audit readiness",
  summary: "IT shares access logs with Security, but the transfer has only been observed, never verified. If logs are incomplete, access-control evidence for the audit may be too.",
  teams: ["it", "sec", "audit"], relations: ["r15", "r12"], objectives: ["o3"],
  evidence: [{ label: "Access-log transfer observed, not verified", source: "IT → Security relationship", status: "unknown" }],
  validate: "Reconcile one month of IT access logs against the logs Security received.",
  impact: [{ objective: "o3", effect: "Possible additional evidence gap", delta: 3 }],
  outcome: "Low likelihood, but it would surface late — during audit fieldwork.",
  recommendation: "rec5"
}];


export const recommendations: StrategyRecommendation[] = [
{ id: "rec2", priority: 1, title: "Move daily volume entry into the governed pipeline", rationale: "Removes the largest source of error in cost-to-serve and unblocks KPI certification.", owner: "Diego Ramos · Jonas Weber", effort: "Medium", expectedImpact: "+11 pts cost-to-serve alignment", alignmentGain: 11, insights: ["i2"], steps: ["Replace the shared account with named users this week", "Add a governed entry form feeding the allocation pipeline", "Have Data Owners confirm the 6 pending quality rules"] },
{ id: "rec5", priority: 1, title: "Complete Q3 recertification and refresh control tests", rationale: "Closes 2 of 5 high-severity gaps before audit fieldwork starts.", owner: "Victor Alvarez", effort: "Low", expectedImpact: "+14 pts audit readiness", alignmentGain: 14, insights: ["i5", "i7"], steps: ["Run the overdue Q3 recertification", "Re-test the 3 expired controls", "Verify one month of IT access logs with Security"] },
{ id: "rec1", priority: 1, title: "Appoint an accountable owner for supplier master data", rationale: "A single named owner resolves the conflict between Procurement and Production Accounting.", owner: "Sofia Mendes", effort: "Low", expectedImpact: "+9 pts ownership coverage", alignmentGain: 9, insights: ["i1"], steps: ["Propose Elena Petrova as owner at the next council", "Record the decision in the ownership register", "Start supplier de-duplication"] },
{ id: "rec3", priority: 2, title: "Restore the historian feed and add a freshness gate", rationale: "Stops stale data reaching the executive scorecard.", owner: "Jonas Weber", effort: "Low", expectedImpact: "+5 pts cost-to-serve, +4 pts certified KPIs", alignmentGain: 9, insights: ["i4"], steps: ["Fix the sync failure and backfill", "Block scorecard refresh when data is more than 24 h old"] },
{ id: "rec4", priority: 2, title: "Set an approval SLA and record approvals in one place", rationale: "Cuts approval time towards the 3-day target and closes the chat-approval evidence gap.", owner: "Elena Petrova", effort: "Medium", expectedImpact: "+5 pts certified KPIs", alignmentGain: 5, insights: ["i3"], steps: ["Publish a 3-day SLA with auto-escalation", "Stop accepting approvals in chat"] },
{ id: "rec6", priority: 3, title: "Validate how cost targets cascade to Operations", rationale: "AI hypothesis — confirm before restructuring accountability.", owner: "Laila Haddad", effort: "Low", expectedImpact: "Up to +6 pts if confirmed", alignmentGain: 6, insights: ["i6"], steps: ["Interview the COO and Operations Director", "If confirmed, add an oversight relationship with a quarterly target review"] }];


export const assistantAnswers: AssistantAnswer[] = [
{ keywords: ["cost", "cost-to-serve", "boe", "o1"], basis: "evidence", insights: ["i2", "i4", "i6"], answer: "Cost-to-serve is off track (alignment 54/100). The main blocker is evidence-backed: production volumes bypass the governed pipeline, so cost per BOE is calculated on unverified numbers. A stale historian feed adds forecast risk. A further AI hypothesis — not yet confirmed — is that cost targets never reach Business Operations." },
{ keywords: ["audit", "control", "fy27", "security", "recert"], basis: "evidence", insights: ["i5", "i7"], answer: "Audit readiness is the weakest objective (47/100). Q3 access recertification is 21 days overdue and 3 control tests have expired — both verified. Completing them is the highest-impact single action (+14 pts). The unverified access-log handoff is a lower-confidence hypothesis worth checking." },
{ keywords: ["owner", "ownership", "supplier", "governance"], basis: "evidence", insights: ["i1"], answer: "18 of 24 data domains have an owner. Supplier master data is the most consequential gap: unassigned for 47 days and edited by two teams. Appointing one accountable owner is low effort and lifts ownership alignment by about 9 points." },
{ keywords: ["kpi", "certif", "bi", "analytics", "dashboard", "scorecard"], basis: "evidence", insights: ["i2", "i3", "i4"], answer: "18 of 26 executive KPIs run on certified data. Three things hold back the rest: uncertified production volumes, a 6.8-day access-approval bottleneck, and a failing historian feed that makes the scorecard stale." },
{ keywords: ["operations", "ops", "field"], basis: "hypothesis", insights: ["i2", "i6"], answer: "Business Operations is involved in the two cost-to-serve issues. One is evidence-backed (the ungoverned volume spreadsheet). The other is an AI hypothesis: there is no oversight link from leadership to Operations on the map, so cost targets may not be owned in the field. Validate this with the COO before acting." },
{ keywords: ["first", "priorit", "start", "next", "recommend"], basis: "evidence", insights: ["i2", "i5", "i1"], answer: "Start with the three priority-1 actions: move volume entry into the pipeline (+11 pts), complete recertification and refresh control tests (+14 pts), and appoint a supplier master owner (+9 pts). All three are backed by verified evidence, and two of them are low effort." }];


export const assistantSuggestions = [
"Why is cost-to-serve off track?",
"Are we ready for the FY27 audit?",
"What should we fix first?",
"Which issues involve Business Operations?"];
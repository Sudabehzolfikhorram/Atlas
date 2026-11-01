import type { BusinessPriority } from "../types/priorities";

/** ILLUSTRATIVE DEMO DATA — Meridian Energy (fictitious). People, records and figures are synthetic. */
export const priorities: BusinessPriority[] = [
{
  id: "PRI-014",
  title: "Procurement approvals exceed the 7-day target",
  summary: "Average requisition-to-PO cycle is 11.4 days against a 7-day target. 62% of the delay accrues at the Tier-2 budget approval stage.",
  category: "Workflow bottleneck",
  severity: "critical",
  status: "awaiting_decision",
  evidenceStatus: "verified",
  impact: { text: "≈ $2.1M per quarter in expedited freight and idle crew time", kind: "Financial", isEstimate: true },
  affected: {
    departments: ["Procurement", "Finance", "Field Operations"],
    processes: ["Procure-to-Pay"],
    systems: ["ERP (S/4)", "Email", "Policy repository"],
    people: [
    { name: "Layla Haddad", role: "Procurement Manager", relation: "Process owner" },
    { name: "Elena Vasquez", role: "Finance Controller", relation: "Tier-2 approver lead" },
    { name: "Jonas Berg", role: "Field Supervisor", relation: "Most frequent requester" }]

  },
  evidence: [
  { label: "41,208 PR/PO records, Jan–Sep", source: "ERP", status: "verified" },
  { label: "97.8% of Tier-2 catalog requests < $25k approved unchanged", source: "ERP", status: "verified" },
  { label: "Peer benchmark: 3-tier thresholds at $5k / $25k / $250k", source: "Benchmark BP-P2P-07", status: "inferred" }],

  records: [
  { id: "PR-2026-0418823", system: "ERP", type: "Purchase requisition", date: "2026-09-14", excerpt: "Pump seal kit, $6,420 — Tier-2 approval pending 6.2 days", status: "verified" },
  { id: "PR-2026-0420117", system: "ERP", type: "Purchase requisition", date: "2026-09-18", excerpt: "Valve actuator, $14,900 — 3 reminders before approval", status: "verified" },
  { id: "EML-88214", system: "Email", type: "Approval reminder", date: "2026-09-19", excerpt: "\"Need this PO released before the rig crew rotation…\"", status: "verified" },
  { id: "DOC-PRC-004", system: "Documents", type: "Policy", date: "2025-03-02", excerpt: "Tier-2 approval required for all requisitions > $10,000", status: "verified" }],

  recommendation: {
    action: "Approve the procurement workflow redesign for a 60-day controlled rollout",
    rationale: "Tier-2 approvals rarely change outcomes for catalog items, but add a measured 4.3-day wait.",
    benefit: "Cycle time 11.4 → ~7.2 days; ~$1.4M quarterly savings"
  },
  quality: { modelConfidence: 92, evidenceCoverage: 88, dataCompleteness: 94, freshness: "4 min ago" },
  impactScore: 95,
  urgencyScore: 88,
  dueBy: "Oct 16, 2026",
  analysis: {
    pattern: "Requisitions between $10k and $25k queue at Tier-2 budget approval, with peaks at month-end close.",
    observed: ["Tier-2 stage average wait is 4.3 days vs 0.6 days for Tier-1.", "97.8% of Tier-2 catalog requests under $25k were approved without modification.", "1,930 reminder emails reference pending Tier-2 approvals."],
    inferred: ["Month-end close capacity in Finance likely drives the queue peaks.", "Peer operators use a $25k Tier-2 threshold for catalog items."],
    causes: ["Threshold set in 2019 and not indexed to inflation", "Single approver group shared with month-end close", "No automated budget check before approval"]
  },
  options: [
  { id: "a", title: "Raise Tier-2 threshold to $25k for catalog items", description: "Automated budget checks replace Tier-2 approval; monthly post-audit sampling.", impact: "Est. cycle time −4 days on 62% of requisitions", cost: "Low · ERP rule change (T-104)", risk: "Medium", tradeoffs: "Less pre-spend control on catalog items", recommended: true },
  { id: "b", title: "Add a second Tier-2 approver group", description: "Split approvals between two Finance teams.", impact: "Est. queue wait −40%", cost: "Medium · 2 FTE time", risk: "Low", tradeoffs: "Doesn't address unchanged approvals" },
  { id: "c", title: "Keep current process", description: "Monitor and revisit next quarter.", impact: "None", cost: "None", risk: "High", tradeoffs: "Delay costs continue" }],

  ownership: {
    decisionMaker: { name: "Thomas Reid", role: "Operations Director" },
    stakeholders: [{ name: "Layla Haddad", role: "Procurement Manager" }, { name: "Elena Vasquez", role: "Finance Controller" }, { name: "Internal Audit", role: "Assurance" }],
    approvals: [
    { name: "Layla Haddad", role: "Procurement Manager", done: true },
    { name: "Elena Vasquez", role: "Finance Controller", done: false },
    { name: "Thomas Reid", role: "Operations Director", done: false }],

    dependencies: ["Budget-check rules configured (T-104)", "Internal audit sign-off on post-audit sampling"]
  },
  history: [
  { date: "Oct 2, 2026", actor: "Atlas AI", action: "Detected Tier-2 queue pattern from ERP stage durations", kind: "investigation" },
  { date: "Oct 6, 2026", actor: "Layla Haddad", action: "Approved redesign proposal (Procurement)", kind: "approval" },
  { date: "Oct 9, 2026", actor: "Elena Vasquez", action: "Asked for post-audit sampling details", kind: "comment" }],

  nextSteps: [
  { label: "Finance Controller approval", status: "in_progress", owner: "Elena Vasquez" },
  { label: "Operations Director decision", status: "pending", owner: "Thomas Reid" },
  { label: "Configure budget-check rules (T-104)", status: "pending", owner: "Enterprise Data Team" }],

  unresolved: ["Are there off-system (verbal) approvals not visible in ERP?"],
  completionCriteria: "Threshold live in ERP for North Basin; weekly cycle-time and post-audit exception report in place.",
  decisionId: "DEC-031"
},
{
  id: "PRI-011",
  title: "Maintenance work orders stall at planner sign-off",
  summary: "38% of corrective work orders in North Basin wait more than 72 hours at Planner Review before scheduling.",
  category: "Workflow bottleneck",
  severity: "high",
  status: "awaiting_decision",
  evidenceStatus: "verified",
  impact: { text: "≈ 1,840 bbl/day deferred production during peak backlog weeks", kind: "Production", isEstimate: true },
  affected: {
    departments: ["Maintenance", "Production", "Field Operations"],
    processes: ["Maintenance Work Order"],
    systems: ["CMMS", "Teams (metadata)"],
    people: [
    { name: "Marcus Okafor", role: "Maintenance Operations Lead", relation: "Process owner" },
    { name: "Ahmed Al-Sayed", role: "HSE Manager", relation: "Safety exclusions" }]

  },
  evidence: [
  { label: "6,412 corrective WOs with status history", source: "CMMS", status: "verified" },
  { label: "Planner queue snapshots (daily)", source: "CMMS", status: "verified" },
  { label: "Teams escalation pattern (metadata only)", source: "Chat", status: "inferred" }],

  records: [
  { id: "WO-77120", system: "CMMS", type: "Work order", date: "2026-09-21", excerpt: "Separator level transmitter — Planner Review 96h", status: "verified" },
  { id: "WO-77341", system: "CMMS", type: "Work order", date: "2026-09-24", excerpt: "Compressor vibration alarm — Planner Review 81h", status: "verified" }],

  recommendation: {
    action: "Authorize a 6-week fast-track pilot for low-risk corrective WOs",
    rationale: "92% of criticality C/D work orders under $8k are approved unchanged at Planner Review.",
    benefit: "Planner wait 72h → ~24h on pilot assets"
  },
  quality: { modelConfidence: 84, evidenceCoverage: 76, dataCompleteness: 86, freshness: "3 h ago (CMMS delayed)", limitation: "Criticality ratings missing for 14% of assets." },
  impactScore: 90,
  urgencyScore: 82,
  dueBy: "Oct 17, 2026",
  analysis: {
    pattern: "Planner Review is a single queue; one planner handles 41% of critical work orders.",
    observed: ["38% of WOs wait more than 72h at Planner Review.", "92% of C/D WOs under $8k approved unchanged."],
    inferred: ["Planner escalations in Teams correlate with backlog spikes."],
    causes: ["No risk-based routing", "Key-person dependency on one planner"]
  },
  options: [
  { id: "a", title: "6-week fast-track pilot on 2 assets", description: "Auto-release C/D WOs under $8k on Compressor Station 4 and Separator Train B.", impact: "Est. planner wait −48h on pilot assets", cost: "Low · CMMS rule", risk: "Medium", tradeoffs: "Requires HSE exclusion list", recommended: true },
  { id: "b", title: "Add a second planner", description: "Hire or second a planner for North Basin.", impact: "Est. queue −35%", cost: "High · 1 FTE", risk: "Low", tradeoffs: "Slow to staff; cost recurring" }],

  ownership: {
    decisionMaker: { name: "Thomas Reid", role: "Operations Director" },
    stakeholders: [{ name: "Marcus Okafor", role: "Maintenance Operations Lead" }, { name: "Ahmed Al-Sayed", role: "HSE Manager" }],
    approvals: [
    { name: "Marcus Okafor", role: "Maintenance Operations Lead", done: true },
    { name: "Ahmed Al-Sayed", role: "HSE Manager", done: false }],

    dependencies: ["Asset criticality confirmed for pilot assets", "HSE exclusion list"]
  },
  history: [
  { date: "Sep 29, 2026", actor: "Atlas AI", action: "Flagged planner queue as top maintenance bottleneck", kind: "investigation" },
  { date: "Oct 3, 2026", actor: "Marcus Okafor", action: "Endorsed pilot scope", kind: "approval" }],

  nextSteps: [
  { label: "HSE exclusion list", status: "in_progress", owner: "Ahmed Al-Sayed" },
  { label: "Operations Director decision", status: "pending", owner: "Thomas Reid" },
  { label: "Configure CMMS auto-release rule", status: "pending" }],

  unresolved: ["Is criticality accurate for the two pilot assets?"],
  completionCriteria: "Pilot live on 2 assets; weekly wait-time report; zero safety-critical WOs auto-released.",
  decisionId: "DEC-027"
},
{
  id: "PRI-101",
  title: "Production allocation lineage gap",
  summary: "The daily production report's allocation step uses a spreadsheet with no documented lineage or validation checkpoint, and it feeds regulatory filings.",
  category: "Data lineage gap",
  severity: "critical",
  status: "approved",
  evidenceStatus: "verified",
  impact: { text: "Regulatory production filing depends on an undocumented transform", kind: "Compliance", isEstimate: false },
  affected: {
    departments: ["Production", "Enterprise Data", "Regulatory"],
    processes: ["Production Reporting", "Regulatory filing"],
    systems: ["Historian", "Document repository", "Reporting"],
    people: [{ name: "Priya Raman", role: "Enterprise Data Lead", relation: "Lineage owner" }]
  },
  evidence: [
  { label: "Spreadsheet transformation located in document repository", source: "Documents", status: "verified" },
  { label: "Report feeds regulatory production filings", source: "Reporting", status: "verified" }],

  records: [
  { id: "DOC-ALLOC-V14.xlsx", system: "Documents", type: "Spreadsheet", date: "2026-10-10", excerpt: "Allocation factors hard-coded for 6 wells; last edited by shared account", status: "verified" }],

  recommendation: {
    action: "Schedule a lineage documentation sprint and add a reconciliation checkpoint",
    rationale: "The decision was approved; the gap now needs an owner-driven remediation task."
  },
  quality: { modelConfidence: 88, evidenceCoverage: 91, dataCompleteness: 82, freshness: "1 h ago" },
  impactScore: 86,
  urgencyScore: 80,
  dueBy: "Nov 12, 2026",
  analysis: {
    pattern: "Lineage trace breaks between the historian export and the report load.",
    observed: ["Spreadsheet identified via file access logs.", "Allocation factors hard-coded for 6 wells."],
    inferred: ["Factors may not be reviewed by production engineering."],
    causes: ["Manual workaround never migrated", "Shared account edits"]
  },
  options: [
  { id: "a", title: "Document, then migrate to governed pipeline", description: "Two-phase remediation with interim reconciliation.", impact: "Closes regulatory reporting risk", cost: "Medium · engineering sprint", risk: "Low", tradeoffs: "Temporary dual-running", recommended: true }],

  ownership: {
    decisionMaker: { name: "Priya Raman", role: "Enterprise Data Lead" },
    stakeholders: [{ name: "Thomas Reid", role: "Operations Director" }],
    approvals: [
    { name: "Priya Raman", role: "Enterprise Data Lead", done: true },
    { name: "Thomas Reid", role: "Operations Director", done: true }],

    dependencies: ["Production engineering availability (Q4)"]
  },
  history: [
  { date: "Sep 30, 2026", actor: "Atlas AI", action: "Detected broken lineage trace", kind: "investigation" },
  { date: "Oct 8, 2026", actor: "Thomas Reid", action: "Approved remediation as P1", kind: "decision" }],

  nextSteps: [
  { label: "Remediation approved", status: "done" },
  { label: "Create remediation task with owner", status: "pending" },
  { label: "Add reconciliation checkpoint", status: "pending" }],

  unresolved: ["Are allocation factors reviewed by engineering?"],
  completionCriteria: "Transformation logic documented; daily reconciliation checkpoint active; spreadsheet retired.",
  decisionId: "DEC-022"
},
{
  id: "PRI-009",
  title: "Asset Register has no accountable owner",
  summary: "14% of asset records lack criticality ratings, and no owner is recorded — yet maintenance scheduling, HSE risk scoring and depreciation all rely on it.",
  category: "Missing ownership",
  severity: "high",
  status: "awaiting_decision",
  evidenceStatus: "verified",
  impact: { text: "Risk-based maintenance and HSE scoring may under-prioritise critical equipment", kind: "Operational", isEstimate: false },
  affected: {
    departments: ["Maintenance", "HSE", "Finance"],
    processes: ["Asset Management", "HSE Risk"],
    systems: ["Data catalogue", "ERP (S/4)"],
    people: [
    { name: "Marcus Okafor", role: "Maintenance Operations Lead", relation: "Heaviest consumer" },
    { name: "Priya Raman", role: "Enterprise Data Lead", relation: "Catalogue administrator" }]

  },
  evidence: [
  { label: "Ownership field empty in data catalogue", source: "Data catalogue", status: "verified" },
  { label: "2,184 of 15,602 assets missing criticality", source: "ERP", status: "verified" },
  { label: "3 departments consume register in reports", source: "Lineage", status: "inferred" }],

  records: [
  { id: "CAT-ASSET-REG", system: "Data catalogue", type: "Domain entry", date: "2026-10-01", excerpt: "Owner: — · Steward: — · Last review: none", status: "verified" },
  { id: "SCAN-2210", system: "ERP", type: "Completeness scan", date: "2026-10-11", excerpt: "2,184 of 15,602 assets missing criticality rating", status: "verified" }],

  recommendation: {
    action: "Assign Marcus Okafor (Maintenance) as interim domain owner",
    rationale: "Maintenance is the heaviest consumer and already maintains most criticality ratings.",
    benefit: "Unblocks 4 governance tasks and criticality backfill"
  },
  quality: { modelConfidence: 90, evidenceCoverage: 72, dataCompleteness: 86, freshness: "1 h ago", limitation: "Downstream consumers inferred from report query logs." },
  impactScore: 78,
  urgencyScore: 74,
  dueBy: "Oct 12, 2026",
  analysis: {
    pattern: "A shared data domain without ownership; quality is decaying without a steward.",
    observed: ["Ownership field empty.", "14% of assets lack criticality."],
    inferred: ["Three departments make decisions using the register."],
    causes: ["Ownership lost in 2024 reorganisation"]
  },
  options: [
  { id: "a", title: "Interim owner: Maintenance", description: "Marcus Okafor owns the domain for 2 quarters.", impact: "Unblocks backfill", cost: "Low", risk: "Low", tradeoffs: "Owner capacity ~6 weeks backfill", recommended: true },
  { id: "b", title: "Owner: Enterprise Data", description: "Central data team owns the domain.", impact: "Consistent governance", cost: "Medium", risk: "Medium", tradeoffs: "Further from asset expertise" }],

  ownership: {
    decisionMaker: { name: "Dana Whitfield", role: "VP, Operational Excellence" },
    stakeholders: [{ name: "Marcus Okafor", role: "Maintenance Operations Lead" }, { name: "Priya Raman", role: "Enterprise Data Lead" }],
    approvals: [{ name: "Dana Whitfield", role: "VP, Operational Excellence", done: false }],
    dependencies: ["None — can be made immediately"]
  },
  history: [{ date: "Oct 1, 2026", actor: "Atlas AI", action: "Flagged ungoverned domain in catalogue scan", kind: "investigation" }],
  nextSteps: [
  { label: "Your decision on interim owner", status: "pending", owner: "Dana Whitfield" },
  { label: "Backfill criticality for critical equipment classes", status: "pending" }],

  unresolved: ["Who historically maintained criticality ratings?"],
  completionCriteria: "Owner recorded in catalogue; criticality backfilled for all class A/B assets.",
  decisionId: "DEC-029"
},
{
  id: "PRI-109",
  title: "Vendor bank details conflict between ERP and Procurement suite",
  summary: "312 vendors have mismatched bank details across the two systems, creating payment-fraud and misdirected-payment exposure.",
  category: "Conflicting records",
  severity: "high",
  status: "awaiting_decision",
  evidenceStatus: "verified",
  impact: { text: "312 vendors exposed to misdirected payments (≈ $4.6M monthly spend)", kind: "Financial", isEstimate: false },
  affected: {
    departments: ["Finance", "Procurement"],
    processes: ["Vendor onboarding", "Payment run"],
    systems: ["ERP (S/4)", "Procurement suite"],
    people: [{ name: "Elena Vasquez", role: "Finance Controller", relation: "Payment control owner" }]
  },
  evidence: [{ label: "Record-level comparison of 8,940 vendor records", source: "ERP + Procurement suite", status: "verified" }],
  records: [
  { id: "VEN-004812", system: "ERP", type: "Vendor master", date: "2026-10-09", excerpt: "Bank account ending 4471 — updated by batch job", status: "verified" },
  { id: "SUP-004812", system: "Procurement suite", type: "Supplier profile", date: "2026-08-22", excerpt: "Bank account ending 9902 — supplier self-service", status: "verified" }],

  recommendation: {
    action: "Hold payments to the 312 mismatched vendors pending review",
    rationale: "Bank-detail conflicts are a known fraud vector; a hold is reversible and low-cost."
  },
  quality: { modelConfidence: 88, evidenceCoverage: 95, dataCompleteness: 91, freshness: "2 h ago" },
  impactScore: 80,
  urgencyScore: 86,
  dueBy: "Oct 14, 2026",
  analysis: {
    pattern: "Supplier self-service updates aren't synchronised back to the ERP vendor master.",
    observed: ["312 mismatches in bank, tax ID or address fields."],
    inferred: ["The Procurement suite is likely the more recent source for 70% of mismatches."],
    causes: ["No agreed system of record for bank details", "One-way sync job"]
  },
  options: [
  { id: "a", title: "Hold payments pending review", description: "Temporary payment block for 312 vendors.", impact: "Removes exposure immediately", cost: "Low", risk: "Medium", tradeoffs: "May delay legitimate payments", recommended: true },
  { id: "b", title: "Review without holding", description: "Finance reviews mismatches over 3 weeks.", impact: "Gradual", cost: "Low", risk: "High", tradeoffs: "Exposure remains during review" }],

  ownership: {
    decisionMaker: { name: "Elena Vasquez", role: "Finance Controller" },
    stakeholders: [{ name: "Layla Haddad", role: "Procurement Manager" }],
    approvals: [{ name: "Elena Vasquez", role: "Finance Controller", done: false }],
    dependencies: ["Agreed system of record for bank details"]
  },
  history: [{ date: "Oct 9, 2026", actor: "Atlas AI", action: "Completed cross-system vendor comparison", kind: "investigation" }],
  nextSteps: [
  { label: "Confirm system of record", status: "pending", owner: "Elena Vasquez" },
  { label: "Review 312 mismatches", status: "pending" },
  { label: "Implement sync validation control", status: "pending" }],

  unresolved: ["Which system is the agreed system of record for bank details?"],
  completionCriteria: "All 312 mismatches resolved; sync validation control live."
},
{
  id: "PRI-104",
  title: "Inferred Field Ops → Finance accrual dependency",
  summary: "Field cost estimates appear to reach Finance accruals by email, with no system interface or documented control.",
  category: "Unverified critical dependency",
  severity: "medium",
  status: "needs_validation",
  evidenceStatus: "inferred",
  impact: { text: "Possible undocumented input to month-end accruals", kind: "Compliance", isEstimate: true },
  affected: {
    departments: ["Field Operations", "Finance"],
    processes: ["Finance Close", "Field cost estimation"],
    systems: ["Email (metadata)", "ERP (S/4)"],
    people: [
    { name: "Jonas Berg", role: "Field Supervisor", relation: "Sender" },
    { name: "Elena Vasquez", role: "Finance Controller", relation: "Recipient team lead" }]

  },
  evidence: [
  { label: "Recurring email pattern: field supervisor → accruals team", source: "Email", status: "inferred" },
  { label: "No matching ERP interface found", source: "ERP", status: "verified" }],

  records: [
  { id: "EML-PAT-0091", system: "Email", type: "Communication pattern", date: "2026-09-30", excerpt: "Field supervisors → accruals mailbox, 3 days before close, 9 of 9 months", status: "inferred" }],

  recommendation: {
    action: "Request validation with a 10-sample reconciliation",
    rationale: "The pattern is strong but message bodies were not analysed (privacy restriction)."
  },
  quality: { modelConfidence: 64, evidenceCoverage: 41, dataCompleteness: 58, freshness: "1 day ago", limitation: "Email content excluded by policy; metadata only." },
  impactScore: 62,
  urgencyScore: 48,
  dueBy: "Oct 26, 2026",
  analysis: {
    pattern: "Strongly periodic emails from field supervisors to the accruals mailbox before each close.",
    observed: ["No ERP interface carries field cost estimates."],
    inferred: ["Attachments named 'accrual estimate' feed accrual entries."],
    causes: ["Informal workaround predating ERP rollout"]
  },
  options: [
  { id: "a", title: "Validate with sample reconciliation", description: "Interview accruals team and reconcile 10 entries.", impact: "Confirms or rules out the dependency", cost: "Low · ~5 interviews", risk: "Low", tradeoffs: "Needs restricted workpaper access", recommended: true }],

  ownership: {
    decisionMaker: { name: "Sofia Lindqvist", role: "Data Governance Officer" },
    stakeholders: [{ name: "Elena Vasquez", role: "Finance Controller" }],
    approvals: [{ name: "Sofia Lindqvist", role: "Data Governance Officer", done: false }],
    dependencies: ["Access to accrual workpapers (restricted)"]
  },
  history: [{ date: "Sep 30, 2026", actor: "Atlas AI", action: "Inferred dependency from email metadata", kind: "investigation" }],
  nextSteps: [
  { label: "Request validation", status: "pending" },
  { label: "Document or retire the dependency", status: "pending" }],

  unresolved: ["Are these estimates actually used in accrual entries?", "Is there a documented control?"],
  completionCriteria: "Dependency confirmed and documented, or ruled out with evidence.",
  decisionId: "DEC-025"
},
{
  id: "PRI-007",
  title: "Repeated manual handoffs between Field Ops and Procurement",
  summary: "Material requests appear to be re-keyed from email into the ERP in 46% of cases, adding an average of 1.6 days per request.",
  category: "Manual handoff",
  severity: "medium",
  status: "needs_validation",
  evidenceStatus: "inferred",
  impact: { text: "≈ 3,100 analyst hours per year of avoidable re-keying", kind: "Operational", isEstimate: true },
  affected: {
    departments: ["Field Operations", "Procurement"],
    processes: ["Procure-to-Pay"],
    systems: ["Email", "ERP (S/4)"],
    people: [{ name: "Jonas Berg", role: "Field Supervisor", relation: "Requester" }]
  },
  evidence: [
  { label: "Email-to-PR text similarity match", source: "Email", status: "inferred" },
  { label: "PR creation timestamps vs request email", source: "ERP", status: "verified" }],

  records: [{ id: "PR-2026-0419902", system: "ERP", type: "Purchase requisition", date: "2026-09-16", excerpt: "Created 1.8 days after matching request email", status: "verified" }],
  recommendation: {
    action: "Validate the re-keying rate before funding a structured request form",
    rationale: "Text-similarity matching may over-count requests that were legitimately revised."
  },
  quality: { modelConfidence: 68, evidenceCoverage: 55, dataCompleteness: 74, freshness: "4 min ago" },
  impactScore: 58,
  urgencyScore: 46,
  dueBy: "Oct 30, 2026",
  analysis: {
    pattern: "Requests start as emails and are re-keyed by Procurement.",
    observed: ["PRs are created on average 1.6 days after a matching email."],
    inferred: ["46% of PRs originate as email requests."],
    causes: ["No mobile request form for field teams"]
  },
  options: [
  { id: "a", title: "Validate on a 50-request sample", description: "Procurement confirms origin of sampled PRs.", impact: "Confirms the business case", cost: "Low", risk: "Low", tradeoffs: "2-week delay before funding", recommended: true }],

  ownership: {
    decisionMaker: { name: "Layla Haddad", role: "Procurement Manager" },
    stakeholders: [{ name: "Jonas Berg", role: "Field Supervisor" }],
    approvals: [{ name: "Layla Haddad", role: "Procurement Manager", done: false }],
    dependencies: []
  },
  history: [{ date: "Oct 11, 2026", actor: "Atlas AI", action: "Detected email-to-PR similarity pattern", kind: "investigation" }],
  nextSteps: [
  { label: "Request validation", status: "pending" },
  { label: "Fund structured field request form", status: "blocked" }],

  unresolved: ["How many matched PRs were legitimately revised?"],
  completionCriteria: "Re-keying rate validated on a 50-request sample."
},
{
  id: "PRI-097",
  title: "HSE permit exceptions closed without second review",
  summary: "7 permit-to-work exceptions in Q3 were closed by a single approver, against policy HSE-011's dual-review requirement.",
  category: "Governance exception",
  severity: "medium",
  status: "task_created",
  evidenceStatus: "verified",
  impact: { text: "7 Q3 exceptions lacked dual sign-off (policy HSE-011)", kind: "Compliance", isEstimate: false },
  affected: {
    departments: ["HSE", "Field Operations"],
    processes: ["HSE Permit-to-Work"],
    systems: ["HSE system"],
    people: [{ name: "Ahmed Al-Sayed", role: "HSE Manager", relation: "Control owner" }]
  },
  evidence: [{ label: "HSE system audit log", source: "HSE", status: "verified" }],
  records: [{ id: "PTW-EXC-3381", system: "HSE", type: "Permit exception", date: "2026-08-17", excerpt: "Hot work exception closed by single approver", status: "verified" }],
  recommendation: {
    action: "Enforce dual approval in the HSE system",
    rationale: "System enforcement removes reliance on offline paper review."
  },
  quality: { modelConfidence: 81, evidenceCoverage: 70, dataCompleteness: 88, freshness: "6 h ago", limitation: "Paper-based second reviews may exist offline." },
  impactScore: 60,
  urgencyScore: 58,
  dueBy: "Oct 24, 2026",
  analysis: {
    pattern: "Exception closures recorded with one approver.",
    observed: ["Audit log shows one approver for 7 exception closures."],
    inferred: ["Second reviews may have happened on paper."],
    causes: ["Dual approval not enforced in system workflow"]
  },
  options: [
  { id: "a", title: "Enforce dual approval in system", description: "Configuration change in HSE system.", impact: "Policy compliance enforced", cost: "Low", risk: "Low", tradeoffs: "Slightly slower closures", recommended: true }],

  ownership: {
    decisionMaker: { name: "Ahmed Al-Sayed", role: "HSE Manager" },
    stakeholders: [{ name: "Jonas Berg", role: "Field Supervisor" }],
    approvals: [{ name: "Ahmed Al-Sayed", role: "HSE Manager", done: true }],
    dependencies: []
  },
  history: [
  { date: "Oct 3, 2026", actor: "Atlas AI", action: "Flagged single-approver closures", kind: "investigation" },
  { date: "Oct 7, 2026", actor: "Ahmed Al-Sayed", action: "Approved system enforcement", kind: "decision" },
  { date: "Oct 7, 2026", actor: "Ahmed Al-Sayed", action: "Created task: enforce dual approval", kind: "action" }],

  nextSteps: [
  { label: "Check paper records for 7 exceptions", status: "done" },
  { label: "Configure dual approval", status: "in_progress", owner: "Ahmed Al-Sayed" },
  { label: "Verify control in next audit cycle", status: "pending" }],

  unresolved: [],
  completionCriteria: "Dual approval enforced; zero single-approver closures in next 30 days.",
  task: { owner: "Ahmed Al-Sayed", due: "2026-10-24", priority: "P2", criteria: "Dual approval enforced; zero single-approver closures in next 30 days.", createdAt: "Oct 7, 2026" }
}];
import type { Team, TeamRelation } from "../types/teamGraph";

/**
 * Team-level governance graph for the fictitious Meridian Energy.
 * All names, counts, evidence and risks are illustrative sample data.
 */
export const teams: Team[] = [
{
  id: "exec", name: "Executive Leadership", category: "Leadership", icon: "crown",
  function: "Sets strategy and risk appetite, and makes the final call on escalated governance decisions.",
  lead: { name: "Laila Haddad", role: "Chief Operating Officer" }, members: 6, status: "verified",
  responsibilities: ["Approve the governance charter and risk appetite", "Decide on escalated findings and risk acceptances", "Sponsor data-quality investment"],
  people: [
  { name: "Laila Haddad", role: "Chief Operating Officer", assignment: "Approves the governance charter", raci: "Accountable" },
  { name: "Marcus Lee", role: "Chief Financial Officer", assignment: "Signs off the allocation methodology", raci: "Responsible" },
  { name: "Sofia Mendes", role: "Chief Data Officer", assignment: "Chairs the governance council", raci: "Responsible" }],

  assets: ["Risk appetite statement", "Enterprise KPI scorecard (consumer)"],
  processes: [
  { name: "Quarterly governance review", role: "Owns", status: "verified", stage: "Operating", controls: ["GOV-01 Charter review"] },
  { name: "Risk acceptance", role: "Owns", status: "partial", stage: "Under review", controls: ["SEC-07 Risk acceptance"], bottleneck: "2 risk acceptances waiting more than 30 days" }],

  evidence: [
  { item: "Governance council minutes", available: 4, required: 4, status: "verified", lastVerified: "2026-10-02", source: "Board portal", owner: "Sofia Mendes" },
  { item: "Risk acceptance records", available: 3, required: 5, status: "partial", lastVerified: "2026-09-18", source: "GRC tool", owner: "Marcus Lee", note: "2 acceptances lack a signed rationale" }],

  risks: [{ title: "2 risk acceptances overdue (more than 30 days)", severity: "Medium", kind: "Overdue approval" }],
  avgApprovalDays: 9.5, openActions: 3, lastActivity: "2026-10-15 16:20", lastReview: "2026-10-02",
  position: { x: 600, y: 0 }
},
{
  id: "audit", name: "Internal Audit", category: "Assurance", icon: "clipboard",
  function: "Gives independent assurance over data controls and tracks findings to closure.",
  lead: { name: "Karen Holt", role: "Chief Audit Executive" }, members: 4, status: "verified",
  responsibilities: ["Independent assurance over data controls", "Track audit findings to closure"],
  people: [
  { name: "Karen Holt", role: "Chief Audit Executive", assignment: "Audit plan", raci: "Accountable" },
  { name: "Ivan Novak", role: "IT Auditor", assignment: "Data controls review", raci: "Responsible" }],

  assets: ["Audit findings register"],
  processes: [
  { name: "Findings follow-up", role: "Owns", status: "partial", stage: "Operating", controls: ["AUD-02 Follow-up"], bottleneck: "4 findings past their due date" },
  { name: "Annual data controls audit", role: "Owns", status: "verified", stage: "Documented", controls: ["AUD-01 Audit plan"] }],

  evidence: [
  { item: "Findings register", available: 14, required: 18, status: "partial", lastVerified: "2026-10-06", source: "Audit tool", owner: "Ivan Novak" },
  { item: "Audit workpapers", available: 8, required: 8, status: "verified", lastVerified: "2026-09-30", source: "Audit tool", owner: "Karen Holt" }],

  risks: [{ title: "4 audit findings past due", severity: "Medium", kind: "Finding" }],
  openActions: 4, lastActivity: "2026-10-14 11:05", lastReview: "2026-09-30",
  position: { x: 150, y: 190 }
},
{
  id: "gov", name: "Data Governance", category: "Governance office", icon: "landmark",
  function: "Owns data policies, the business glossary and lineage, and makes sure every data domain has an owner.",
  lead: { name: "Sofia Mendes", role: "Chief Data Officer" }, members: 7, status: "partial",
  responsibilities: ["Maintain data policies and the business glossary", "Assign and track data owners", "Run the governance council and lineage reviews"],
  people: [
  { name: "Sofia Mendes", role: "Chief Data Officer", assignment: "Policy approval", raci: "Accountable" },
  { name: "Priya Raman", role: "Enterprise Data Lead", assignment: "Lineage and allocation pipeline design", raci: "Responsible" },
  { name: "Tom Becker", role: "Data Steward Lead", assignment: "Owner assignments and glossary", raci: "Responsible" },
  { name: "Aisha Noor", role: "Governance Analyst", assignment: "Evidence collection", raci: "Supporting" }],

  assets: ["Business glossary", "Data policy library", "Lineage register"],
  processes: [
  { name: "Data owner assignment", role: "Owns", status: "partial", stage: "Operating", controls: ["GOV-03 Ownership register"], bottleneck: "Supplier master data unassigned for 47 days" },
  { name: "Lineage review", role: "Owns", status: "partial", stage: "Under review", controls: ["GOV-05 Lineage attestation"] },
  { name: "Policy lifecycle", role: "Owns", status: "verified", stage: "Operating", controls: ["GOV-02 Annual policy review"] },
  { name: "Allocation pipeline redesign", role: "Supports", status: "unknown", stage: "Proposed", controls: ["C-01 Reconciliation checkpoint"] }],

  evidence: [
  { item: "Ownership register", available: 18, required: 24, status: "partial", lastVerified: "2026-10-09", source: "Data catalog", owner: "Tom Becker", note: "6 domains have no named owner" },
  { item: "Lineage attestations", available: 5, required: 9, status: "partial", lastVerified: "2026-09-30", source: "Lineage register", owner: "Priya Raman" },
  { item: "Policy approvals", available: 12, required: 12, status: "verified", lastVerified: "2026-10-01", source: "Policy library", owner: "Sofia Mendes" }],

  risks: [
  { title: "Supplier master data has no named owner", severity: "High", kind: "Missing owner" },
  { title: "4 lineage attestations outstanding", severity: "Medium", kind: "Evidence gap" },
  { title: "Allocation logic runs in an ungoverned spreadsheet", severity: "Medium", kind: "Finding" }],

  avgApprovalDays: 6.2, openActions: 7, lastActivity: "2026-10-16 09:12", lastReview: "2026-10-09",
  position: { x: 600, y: 190 }
},
{
  id: "sec", name: "Security & Compliance", category: "Risk & control", icon: "shield",
  function: "Sets access and encryption standards, enforces privacy and retention, and tests controls.",
  lead: { name: "Victor Alvarez", role: "Chief Information Security Officer" }, members: 6, status: "partial",
  responsibilities: ["Access control and encryption standards", "Privacy and retention compliance", "Control testing"],
  people: [
  { name: "Victor Alvarez", role: "CISO", assignment: "Access policy", raci: "Accountable" },
  { name: "Nadia Rossi", role: "Compliance Manager", assignment: "Retention and privacy", raci: "Responsible" },
  { name: "Ben Carter", role: "IAM Lead", assignment: "Access recertification", raci: "Responsible" }],

  assets: ["Access control matrix", "Retention schedule"],
  processes: [
  { name: "Access recertification", role: "Owns", status: "gap", stage: "Operating", controls: ["SEC-04 Quarterly recertification"], bottleneck: "Q3 recertification 21 days overdue" },
  { name: "Privacy impact assessments", role: "Owns", status: "verified", stage: "Operating", controls: ["PRV-01 DPIA"] },
  { name: "Control testing", role: "Supports", status: "partial", stage: "Operating", controls: ["SEC-09 Control test"] }],

  evidence: [
  { item: "Access recertifications", available: 0, required: 1, status: "gap", lastVerified: "2026-06-30", source: "IAM ticketing", owner: "Ben Carter", note: "Q3 cycle not completed" },
  { item: "DPIA records", available: 6, required: 6, status: "verified", lastVerified: "2026-09-22", source: "GRC tool", owner: "Nadia Rossi" },
  { item: "Control test results", available: 9, required: 12, status: "partial", lastVerified: "2026-09-15", source: "GRC tool", owner: "Victor Alvarez", note: "3 results expired" }],

  risks: [
  { title: "Q3 access recertification 21 days overdue", severity: "High", kind: "Overdue approval" },
  { title: "3 control test results expired", severity: "High", kind: "Evidence gap" },
  { title: "Retention not enforced on chat exports", severity: "Medium", kind: "Compliance" }],

  avgApprovalDays: 4.3, openActions: 6, lastActivity: "2026-10-15 17:30", lastReview: "2026-09-22",
  position: { x: 1050, y: 190 }
},
{
  id: "owners", name: "Data Owners", category: "Business domains", icon: "users",
  function: "Business leads who define, approve and certify the data in their domain.",
  lead: { name: "Rahul Mehta", role: "Head of Production Accounting" }, members: 12, status: "partial",
  responsibilities: ["Define and approve domain data", "Approve dataset access requests", "Certify data quality for their domain"],
  people: [
  { name: "Rahul Mehta", role: "Head of Production Accounting", assignment: "Production volume data", raci: "Accountable" },
  { name: "Elena Petrova", role: "Procurement Data Owner", assignment: "Supplier and purchasing data", raci: "Accountable" },
  { name: "Not assigned", role: "Supplier master data owner", assignment: "Supplier master data", raci: "Accountable", vacant: true },
  { name: "Grace Kim", role: "Maintenance Data Owner", assignment: "Work-order and asset data", raci: "Accountable" }],

  assets: ["Production volumes", "Purchase orders and contracts", "Asset register", "Supplier master (no owner)"],
  processes: [
  { name: "Dataset access approval", role: "Owns", status: "partial", stage: "Operating", controls: ["SEC-04 Access approval"], bottleneck: "Approvals take 6.8 days on average against a 3-day target" },
  { name: "Domain quality certification", role: "Owns", status: "gap", stage: "Documented", controls: ["DQ-02 Monthly certification"] },
  { name: "Production allocation sign-off", role: "Owns", status: "partial", stage: "Operating", controls: ["FIN-06 Allocation sign-off"] }],

  evidence: [
  { item: "Quality certifications", available: 7, required: 12, status: "partial", lastVerified: "2026-09-28", source: "DQ dashboard", owner: "Rahul Mehta" },
  { item: "Access approval records", available: 41, required: 52, status: "partial", lastVerified: "2026-10-12", source: "IAM ticketing", owner: "Elena Petrova", note: "11 approvals given in chat were not recorded" },
  { item: "Allocation sign-offs", available: 2, required: 3, status: "partial", lastVerified: "2026-10-05", source: "Finance close checklist", owner: "Rahul Mehta" }],

  risks: [
  { title: "Supplier master data — accountable owner not assigned", severity: "High", kind: "Missing owner" },
  { title: "9 access requests pending more than 5 days", severity: "Medium", kind: "Overdue approval" },
  { title: "Approvals given in chat are not recorded", severity: "Medium", kind: "Evidence gap" }],

  avgApprovalDays: 6.8, openActions: 9, lastActivity: "2026-10-16 08:40", lastReview: "2026-09-28",
  position: { x: 375, y: 390 }
},
{
  id: "eng", name: "Data Engineering", category: "Data platform", icon: "database",
  function: "Builds and runs the governed pipelines, lineage and quality checks behind every dataset.",
  lead: { name: "Jonas Weber", role: "Data Engineering Manager" }, members: 9, status: "partial",
  responsibilities: ["Build and run governed pipelines", "Implement lineage and quality checks", "Provision curated datasets"],
  people: [
  { name: "Jonas Weber", role: "Data Engineering Manager", assignment: "Pipeline operations", raci: "Accountable" },
  { name: "Mei Chen", role: "Senior Data Engineer", assignment: "Production allocation pipeline", raci: "Responsible" },
  { name: "Omar Farouk", role: "Data Engineer", assignment: "ERP and maintenance ingestion", raci: "Responsible" },
  { name: "Lucas Silva", role: "Platform Engineer", assignment: "Monitoring and alerts", raci: "Supporting" }],

  assets: ["Curated production dataset", "Cost and allocation models", "Ingestion pipelines (9 sources)"],
  processes: [
  { name: "Pipeline change management", role: "Owns", status: "verified", stage: "Operating", controls: ["DEV-02 Peer review", "DEV-04 CI tests"] },
  { name: "Data quality checks", role: "Owns", status: "partial", stage: "Operating", controls: ["DQ-01 Automated checks"], bottleneck: "Completeness 87% against a 95% target" },
  { name: "Historian ingestion", role: "Owns", status: "gap", stage: "Operating", controls: ["DQ-05 Freshness alert"], bottleneck: "Sync failing since 07:40" }],

  evidence: [
  { item: "CI test runs", available: 120, required: 120, status: "verified", lastVerified: "2026-10-16", source: "CI pipeline", owner: "Lucas Silva" },
  { item: "Data quality rule results", available: 34, required: 40, status: "partial", lastVerified: "2026-10-16", source: "Validation suite", owner: "Mei Chen" },
  { item: "Lineage metadata", available: 22, required: 30, status: "partial", lastVerified: "2026-10-10", source: "Lineage register", owner: "Omar Farouk" }],

  risks: [
  { title: "Historian feed failing — downstream forecasts stale", severity: "High", kind: "Dependency" },
  { title: "Data completeness below target", severity: "Medium", kind: "Finding" }],

  avgApprovalDays: 1.4, openActions: 5, lastActivity: "2026-10-16 09:44", lastReview: "2026-10-10",
  position: { x: 825, y: 390 }
},
{
  id: "ops", name: "Business Operations", category: "Field operations", icon: "factory",
  function: "Runs field production and maintenance, entering the operational data others depend on.",
  lead: { name: "Diego Ramos", role: "Operations Director" }, members: 40, status: "gap",
  responsibilities: ["Enter field production data", "Act on operational dashboards", "Execute and close maintenance work"],
  people: [
  { name: "Diego Ramos", role: "Operations Director", assignment: "Operational performance", raci: "Accountable" },
  { name: "Ana Lopez", role: "Production Engineer", assignment: "Daily volume entry", raci: "Responsible" },
  { name: "Kofi Mensah", role: "Maintenance Supervisor", assignment: "Work-order closure", raci: "Responsible" }],

  assets: ["Daily production reports", "Allocation spreadsheet (ungoverned)"],
  processes: [
  { name: "Daily volume reporting", role: "Owns", status: "gap", stage: "Operating", controls: ["FIN-06 Allocation sign-off"], bottleneck: "Manual spreadsheet edits by a shared account" },
  { name: "Work-order closure", role: "Owns", status: "partial", stage: "Operating", controls: ["MNT-02 Closure check"] }],

  evidence: [
  { item: "Volume submissions", available: 12, required: 30, status: "gap", lastVerified: "2026-10-01", source: "Allocation spreadsheet", owner: "Ana Lopez", note: "Edited by a shared account; no change history" },
  { item: "Work-order closures", available: 140, required: 180, status: "partial", lastVerified: "2026-10-14", source: "Maintenance system", owner: "Kofi Mensah" }],

  risks: [
  { title: "Allocation spreadsheet edited outside the governed pipeline", severity: "High", kind: "Finding" },
  { title: "Shared account used for edits", severity: "Medium", kind: "Missing owner" },
  { title: "No change history for volume edits", severity: "Medium", kind: "Evidence gap" }],

  avgApprovalDays: 3.6, openActions: 8, lastActivity: "2026-10-16 06:30", lastReview: "2026-08-29",
  position: { x: 150, y: 590 }
},
{
  id: "it", name: "IT & Infrastructure", category: "Technology", icon: "server",
  function: "Hosts the data platform, provisions identities and access, and runs backup and recovery.",
  lead: { name: "Sam Osei", role: "Head of IT Infrastructure" }, members: 15, status: "verified",
  responsibilities: ["Platform availability", "Identity and access provisioning", "Backup and recovery"],
  people: [
  { name: "Sam Osei", role: "Head of IT Infrastructure", assignment: "Platform service levels", raci: "Accountable" },
  { name: "Chloe Martin", role: "Cloud Engineer", assignment: "Data platform hosting", raci: "Responsible" },
  { name: "Raj Patel", role: "IAM Engineer", assignment: "Access provisioning", raci: "Responsible" }],

  assets: ["Data platform environment", "Identity directory", "Access logs"],
  processes: [
  { name: "Access provisioning", role: "Owns", status: "verified", stage: "Operating", controls: ["SEC-03 Joiner-mover-leaver"] },
  { name: "Backup and recovery", role: "Owns", status: "verified", stage: "Operating", controls: ["IT-05 Restore test"] }],

  evidence: [
  { item: "Provisioning tickets", available: 212, required: 215, status: "verified", lastVerified: "2026-10-15", source: "ITSM", owner: "Raj Patel" },
  { item: "Restore tests", available: 4, required: 4, status: "verified", lastVerified: "2026-09-25", source: "ITSM", owner: "Chloe Martin" }],

  risks: [{ title: "Access logs shared with Security are not yet verified", severity: "Low", kind: "Dependency" }],
  avgApprovalDays: 0.8, openActions: 1, lastActivity: "2026-10-16 07:55", lastReview: "2026-09-25",
  position: { x: 600, y: 590 }
},
{
  id: "bi", name: "Analytics & BI", category: "Insights", icon: "chart",
  function: "Turns curated data into certified KPIs, dashboards and forecasts for leaders and operations.",
  lead: { name: "Hannah Ortiz", role: "Head of Analytics" }, members: 8, status: "verified",
  responsibilities: ["Executive and operational KPI reporting", "Certified dashboards", "Forecast consumption"],
  people: [
  { name: "Hannah Ortiz", role: "Head of Analytics", assignment: "KPI definitions", raci: "Accountable" },
  { name: "Daniel Park", role: "BI Developer", assignment: "Executive scorecard", raci: "Responsible" },
  { name: "Fatima Al-Sayed", role: "Analyst", assignment: "Operations dashboards", raci: "Responsible" }],

  assets: ["Executive KPI scorecard", "Operations dashboards", "Forecast outputs"],
  processes: [
  { name: "KPI definition management", role: "Owns", status: "verified", stage: "Operating", controls: ["BI-01 KPI register"] },
  { name: "Dashboard certification", role: "Owns", status: "partial", stage: "Operating", controls: ["BI-03 Certification"], bottleneck: "3 dashboards use uncertified sources" }],

  evidence: [
  { item: "KPI register", available: 26, required: 26, status: "verified", lastVerified: "2026-10-08", source: "KPI register", owner: "Hannah Ortiz" },
  { item: "Dashboard certifications", available: 14, required: 17, status: "partial", lastVerified: "2026-10-03", source: "BI workspace", owner: "Daniel Park" }],

  risks: [{ title: "3 dashboards read uncertified data", severity: "Low", kind: "Finding" }],
  avgApprovalDays: 2.1, openActions: 2, lastActivity: "2026-10-16 10:00", lastReview: "2026-10-08",
  position: { x: 1050, y: 590 }
}];


export const teamRelations: TeamRelation[] = [
{ id: "r1", source: "exec", target: "gov", type: "oversight", process: "Governance charter & quarterly review", description: "The Executive Committee sets the charter and reviews governance performance each quarter.", evidence: "verified", owner: "Laila Haddad", lastVerified: "2026-10-02", sh: "b", th: "t" },
{ id: "r2", source: "gov", target: "owners", type: "oversight", process: "Data owner assignment", description: "Data Governance assigns an accountable owner to each data domain and tracks coverage.", evidence: "partial", owner: "Tom Becker", lastVerified: "2026-10-09", risks: ["Supplier master data has no named owner"], sh: "l", th: "t" },
{ id: "r3", source: "owners", target: "eng", type: "ownership", process: "Source data definitions & quality rules", description: "Owners define what each field means; Data Engineering implements the rules in the pipeline.", evidence: "partial", owner: "Rahul Mehta", lastVerified: "2026-10-05", risks: ["6 quality rules not yet confirmed by owners"], sh: "r", th: "l" },
{ id: "r4", source: "it", target: "eng", type: "provisioning", process: "Platform & storage provisioning", description: "IT hosts the data platform and provisions compute, storage and service accounts.", evidence: "verified", owner: "Sam Osei", lastVerified: "2026-10-15", sh: "r", th: "b" },
{ id: "r5", source: "eng", target: "bi", type: "provisioning", process: "Curated production & cost datasets", description: "Data Engineering publishes curated datasets that BI builds reports and forecasts on.", evidence: "partial", owner: "Jonas Weber", lastVerified: "2026-10-16", risks: ["Historian feed failing — forecasts stale"], sh: "r", th: "t" },
{ id: "r6", source: "bi", target: "exec", type: "handoff", process: "Executive KPI scorecard", description: "BI delivers the monthly executive scorecard used in leadership reviews.", evidence: "verified", owner: "Hannah Ortiz", lastVerified: "2026-10-08", sh: "r", th: "r" },
{ id: "r7", source: "bi", target: "ops", type: "handoff", process: "Operational dashboards", description: "Field teams use BI dashboards for daily production and maintenance decisions.", evidence: "verified", owner: "Fatima Al-Sayed", lastVerified: "2026-10-03", sh: "b", th: "b" },
{ id: "r8", source: "ops", target: "owners", type: "handoff", process: "Daily production volumes", description: "Operations enters daily volumes that Data Owners certify for allocation.", evidence: "gap", owner: "Diego Ramos", lastVerified: "2026-10-01", risks: ["Entered through an ungoverned spreadsheet", "No change history"], sh: "t", th: "l" },
{ id: "r9", source: "owners", target: "gov", type: "approval", process: "Dataset access approvals", description: "Data Owners approve access requests; Data Governance checks the approvals against policy.", evidence: "partial", owner: "Elena Petrova", lastVerified: "2026-10-12", risks: ["9 requests pending more than 5 days", "Approvals in chat are not recorded"], sh: "r", th: "b" },
{ id: "r10", source: "gov", target: "sec", type: "compliance", process: "Privacy & retention policy", description: "Data Governance sets policy; Security & Compliance enforces privacy and retention.", evidence: "verified", owner: "Nadia Rossi", lastVerified: "2026-09-22", sh: "r", th: "l" },
{ id: "r11", source: "sec", target: "eng", type: "compliance", process: "Access control & encryption standard", description: "Security sets the access and encryption standard the pipelines must meet.", evidence: "partial", owner: "Ben Carter", lastVerified: "2026-09-15", risks: ["Q3 access recertification overdue"], sh: "b", th: "t" },
{ id: "r12", source: "sec", target: "audit", type: "evidence", process: "Control test evidence", description: "Security shares control test results with Internal Audit for independent review.", evidence: "gap", owner: "Victor Alvarez", lastVerified: "2026-09-15", risks: ["3 control test results expired"], sh: "b", th: "b" },
{ id: "r13", source: "gov", target: "audit", type: "evidence", process: "Lineage & policy evidence", description: "Data Governance supplies lineage attestations and policy approvals to Internal Audit.", evidence: "partial", owner: "Aisha Noor", lastVerified: "2026-09-30", risks: ["4 lineage attestations outstanding"], sh: "l", th: "r" },
{ id: "r14", source: "audit", target: "exec", type: "oversight", process: "Audit findings & escalation", description: "Internal Audit reports findings and overdue actions to the Executive Committee.", evidence: "verified", owner: "Karen Holt", lastVerified: "2026-09-30", sh: "t", th: "l" },
{ id: "r15", source: "it", target: "sec", type: "evidence", process: "Access logs", description: "IT shares access logs with Security. The transfer has been observed but not verified.", evidence: "unknown", owner: "Raj Patel", sh: "r", th: "b" },
{ id: "r16", source: "exec", target: "sec", type: "approval", process: "Risk acceptance decisions", description: "Leadership approves or rejects risk acceptances raised by Security.", evidence: "partial", owner: "Laila Haddad", lastVerified: "2026-09-18", risks: ["2 acceptances overdue"], sh: "r", th: "t" }];
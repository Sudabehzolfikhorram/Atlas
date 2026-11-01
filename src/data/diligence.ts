import type { Department, DiligenceArea, Dimension, Finding, MonitorEventTemplate, ReviewState } from "../types/diligence";

/** Illustrative sample findings for Meridian Energy (fictional). Not real organizational facts. */
export const findings: Finding[] = [
{
  id: "F-01", kind: "redflag", area: "process", dimension: "process",
  title: "Purchase orders sent before formal approval", shift: "Chat approval → Encode controls and human gates",
  summary: "Purchase requests above the delegated limit are approved in team chat and keyed into the ERP afterwards, bypassing the formal approval step.",
  category: "Approval control", team: "Procurement", severity: "high", urgency: "week",
  impact: "Unrecorded approvals on spend above limit; audit cannot evidence who approved.",
  related: "Purchase requests", systems: ["ERP purchasing", "Team chat"], dataAssets: ["Approval log"], processes: ["Purchase requests", "Supplier selection"],
  source: "E-01 · chat export vs ERP approval log", rootCause: "The ERP approval step is slow for urgent field purchases, so managers approve informally.", rootCauseBasis: "inferred",
  facts: ["31 POs carry an ERP approval timestamp after the PO was sent", "Matching approval messages exist in the procurement chat channel"],
  evidence: [{ label: "ERP approval log extract", ref: "E-01", basis: "verified" }, { label: "Procurement chat export", ref: "E-01b", basis: "verified" }, { label: "Urgency as the driver", ref: "Interview notes", basis: "inferred" }],
  dependencies: ["Delegation-of-authority matrix", "ERP workflow configuration"], relatedIds: ["F-13", "F-10"],
  policies: ["Delegation of authority policy §4.2", "Procurement control P-07"],
  owner: "Layla Haddad", ownerRole: "Procurement Manager", reviewer: "Dana Whitfield", status: "investigating",
  action: "Encode the approval gate in the ERP and add a fast-track route with a named human approver for urgent purchases.",
  alternatives: ["Weekly retrospective approval review", "Lower the urgent-purchase limit"],
  nextSteps: ["Confirm the 31 cases with the approvers", "Draft ERP fast-track workflow", "Pilot on North Basin field purchases"],
  detection: { method: "Cross-source reconciliation (chat vs ERP timestamps)", at: "2026-09-22T09:14:00Z" },
  identified: "2026-09-22", target: "2026-11-15",
  timeline: [{ date: "2026-09-22", label: "Detected by reconciliation", actor: "Atlas" }, { date: "2026-09-24", label: "Assigned to Procurement Manager", actor: "Dana Whitfield" }, { date: "2026-10-02", label: "Status → Investigating", actor: "Layla Haddad" }]
},
{
  id: "F-02", kind: "redflag", area: "data", alsoArea: "process", dimension: "process",
  title: "Unowned data flows", shift: "Personal-drive copy → A named, accountable owner at every link",
  summary: "Supplier price files move from the ERP to a personal drive before reaching the sourcing model. No one owns the copy.",
  category: "Data ownership", team: "Procurement", severity: "high", urgency: "week",
  impact: "Sourcing decisions use an uncontrolled copy; changes are untraceable.",
  related: "Supplier price data", systems: ["ERP purchasing", "Personal drive", "Sourcing model"], dataAssets: ["Supplier price file", "Sourcing model inputs"], processes: ["Purchase requests"],
  source: "E-08 · file-access logs", rootCause: "No data owner is named for the supplier price domain, so the workaround was never challenged.", rootCauseBasis: "verified",
  facts: ["Weekly copy of the price file to a personal drive since March", "Data catalog lists no owner for supplier prices"],
  evidence: [{ label: "File-access log", ref: "E-08", basis: "verified" }, { label: "Data catalog entry", ref: "CAT-114", basis: "verified" }],
  dependencies: ["Data owner assignment", "Business Unit Heads"], relatedIds: ["F-05", "F-03"],
  policies: ["Data ownership standard DG-02"],
  owner: "Priya Raman", ownerRole: "Business Unit Heads · Enterprise Data Lead", reviewer: "Sofia Lindqvist", status: "open",
  action: "Name an accountable owner for supplier price data and replace the personal-drive copy with a governed feed.",
  alternatives: ["Move the file to a shared, permissioned folder as an interim step"],
  nextSteps: ["Nominate owner at the data council", "Build governed feed", "Remove personal-drive copy"],
  detection: { method: "File-access pattern analysis", at: "2026-09-18T14:02:00Z" },
  identified: "2026-09-18", target: "2026-11-01",
  timeline: [{ date: "2026-09-18", label: "Detected by access-log analysis", actor: "Atlas" }, { date: "2026-09-19", label: "Escalated to Business Unit Heads", actor: "Sofia Lindqvist" }]
},
{
  id: "F-03", kind: "gap", area: "data", dimension: "process",
  title: "Missing lineage", shift: "Manual uploads → Data Model / Schema",
  summary: "Daily production figures are uploaded manually to the reporting model, so lineage from meter to report breaks at the upload.",
  category: "Lineage", team: "Operations", severity: "medium", urgency: "month",
  impact: "Reported volumes cannot be traced to source readings.",
  related: "Production volumes", systems: ["Historian", "Reporting model"], dataAssets: ["Daily production file"], processes: ["Production reporting"],
  source: "E-02 · lineage scan", rootCause: "The reporting model has no schema-level connector to the historian.", rootCauseBasis: "verified",
  facts: ["Lineage scan stops at the manual upload step", "Upload done by one analyst each morning"],
  evidence: [{ label: "Lineage scan result", ref: "E-02", basis: "verified" }, { label: "Upload job history", ref: "E-02b", basis: "verified" }],
  dependencies: ["IT teams", "Data platform schema"], relatedIds: ["F-08", "F-02"],
  policies: ["Data lineage standard DG-05"],
  owner: "IT teams", ownerRole: "Data platform", reviewer: "Sofia Lindqvist", status: "remediating",
  action: "Define the production data model and schema, then replace the manual upload with a scheduled connector.",
  alternatives: ["Record upload provenance as metadata until the connector exists"],
  nextSteps: ["Approve schema design", "Build connector", "Retire manual upload"],
  detection: { method: "Automated lineage scan", at: "2026-08-30T07:40:00Z" },
  identified: "2026-08-30", target: "2026-12-01",
  timeline: [{ date: "2026-08-30", label: "Detected by lineage scan", actor: "Atlas" }, { date: "2026-09-10", label: "Status → Remediating", actor: "Priya Raman" }]
},
{
  id: "F-04", kind: "gap", area: "process", dimension: "outcome",
  title: "Rework", shift: "Excel rework → Continuous quality control",
  summary: "Plant reports are corrected in Excel after submission, adding a second review loop most weeks.",
  category: "Rework", team: "Operations", severity: "medium", urgency: "month",
  impact: "Average 1.6 days added to the weekly plant report.",
  related: "Production reporting", systems: ["Excel", "Reporting model"], dataAssets: ["Weekly plant report"], processes: ["Production reporting"],
  source: "E-04 · document version history", rootCause: "Validation happens after submission instead of at entry.", rootCauseBasis: "inferred",
  facts: ["Weekly report re-submitted in 9 of the last 12 weeks"],
  evidence: [{ label: "Version history", ref: "E-04", basis: "verified" }, { label: "Late validation as cause", ref: "Analyst review", basis: "inferred" }],
  dependencies: ["Plant Manager", "Reporting template"], relatedIds: ["F-03"],
  policies: ["Operational reporting standard OR-01"],
  owner: "Marcus Okafor", ownerRole: "Plant Manager", reviewer: "Dana Whitfield", status: "open",
  action: "Add entry-time validation rules and monitor rework through continuous quality control.",
  alternatives: ["Single reviewer sign-off before submission"],
  nextSteps: ["List the recurring corrections", "Encode validation rules", "Track rework weekly"],
  detection: { method: "Version-history analysis", at: "2026-09-05T11:20:00Z" },
  identified: "2026-09-05", target: "2026-12-15",
  timeline: [{ date: "2026-09-05", label: "Detected by version analysis", actor: "Atlas" }]
},
{
  id: "F-05", kind: "gap", area: "data", dimension: "strategy",
  title: "No data strategy owner for procurement", shift: "Unassigned domain → Named domain owner",
  summary: "The procurement data domain has no strategy owner, so priorities for supplier and spend data are not set.",
  category: "Ownership", team: "Procurement", severity: "medium", urgency: "month",
  impact: "Data investments in procurement are not prioritized.",
  related: "Data strategy 2026", systems: ["Data catalog"], dataAssets: ["Supplier master", "Spend cube"], processes: ["Purchase requests"],
  source: "Data governance register", rootCause: "Domain owners were assigned before procurement became a separate domain.", rootCauseBasis: "inferred",
  facts: ["Register shows the domain as unassigned"],
  evidence: [{ label: "Governance register", ref: "GOV-REG", basis: "verified" }],
  dependencies: ["Data council"], relatedIds: ["F-02"],
  policies: ["Data ownership standard DG-02"],
  owner: "Sofia Lindqvist", ownerRole: "Data Governance Officer", reviewer: "Dana Whitfield", status: "open",
  action: "Nominate a procurement data domain owner at the next data council.",
  alternatives: ["Temporarily extend the finance domain owner's scope"],
  nextSteps: ["Confirm charter", "Nominate owner"],
  detection: { method: "Register completeness check", at: "2026-09-12T10:00:00Z" },
  identified: "2026-09-12", target: "2026-10-30",
  timeline: [{ date: "2026-09-12", label: "Detected by register check", actor: "Atlas" }]
},
{
  id: "F-06", kind: "gap", area: "data", dimension: "execution",
  title: "Quality rules defined but not scheduled", shift: "Documented rules → Scheduled checks",
  summary: "Twelve finance data-quality rules exist in the standard but none run on a schedule.",
  category: "Data quality", team: "Finance", severity: "medium", urgency: "month",
  impact: "Errors in cost-centre data reach month-end reports.",
  related: "Finance data quality standard", systems: ["Finance ledger", "Data-quality tool"], dataAssets: ["Cost-centre master"], processes: ["Month-end close"],
  source: "Data-quality tool configuration", rootCause: "Rules were written during the standard update but never handed to the platform team.", rootCauseBasis: "inferred",
  facts: ["0 of 12 rules have a schedule"],
  evidence: [{ label: "Tool configuration export", ref: "DQ-CFG", basis: "verified" }],
  dependencies: ["Data platform team"], relatedIds: ["F-14"],
  policies: ["Finance data quality standard FQ-01"],
  owner: "Elena Vasquez", ownerRole: "Finance Controller", reviewer: "Sofia Lindqvist", status: "investigating",
  action: "Schedule the twelve rules daily and route failures to the cost-centre owner.",
  alternatives: ["Run the rules manually before close"],
  nextSteps: ["Prioritize rules", "Schedule", "Define alert routing"],
  detection: { method: "Configuration review", at: "2026-09-26T08:30:00Z" },
  identified: "2026-09-26", target: "2026-11-20",
  timeline: [{ date: "2026-09-26", label: "Detected by configuration review", actor: "Atlas" }, { date: "2026-10-01", label: "Status → Investigating", actor: "Elena Vasquez" }]
},
{
  id: "F-07", kind: "gap", area: "data", dimension: "outcome",
  title: "Duplicate supplier records", shift: "4.2% duplicates → Single supplier master",
  summary: "About 4.2% of supplier master records were duplicates, splitting spend reporting.",
  category: "Data quality", team: "Procurement", severity: "low", urgency: "month",
  impact: "Spend per supplier was understated in reports.",
  related: "Supplier master", systems: ["ERP purchasing"], dataAssets: ["Supplier master"], processes: ["Vendor onboarding"],
  source: "Duplicate-match run", rootCause: "Onboarding form did not check for existing suppliers.", rootCauseBasis: "verified",
  facts: ["Duplicate match found 212 records", "Merge completed on Oct 8"],
  evidence: [{ label: "Match report", ref: "DUP-01", basis: "verified" }, { label: "Merge log", ref: "DUP-02", basis: "verified" }],
  dependencies: ["Vendor onboarding form"], relatedIds: ["F-05"],
  policies: ["Master data standard MD-01"],
  owner: "Layla Haddad", ownerRole: "Procurement Manager", reviewer: "Sofia Lindqvist", status: "resolved",
  action: "Merge duplicates and add a duplicate check to the onboarding form.",
  alternatives: [], nextSteps: ["Monitor new duplicates monthly"],
  detection: { method: "Fuzzy-match analysis", at: "2026-08-20T09:00:00Z" },
  identified: "2026-08-20", target: "2026-10-10",
  timeline: [{ date: "2026-08-20", label: "Detected", actor: "Atlas" }, { date: "2026-09-02", label: "Status → Remediating", actor: "Layla Haddad" }, { date: "2026-10-08", label: "Status → Resolved", actor: "Layla Haddad" }]
},
{
  id: "F-08", kind: "redflag", area: "data", alsoArea: "process", dimension: "outcome",
  title: "Production volumes differ between historian and ledger", shift: "Two versions of volume → One reconciled figure",
  summary: "September oil volumes in the finance ledger are 2.8% higher than historian readings, with no reconciliation on record.",
  category: "Reconciliation", team: "Operations", severity: "critical", urgency: "immediate",
  impact: "Revenue and royalty filings may rest on unreconciled volumes.",
  related: "Regulatory volume filing", systems: ["Historian", "Finance ledger", "Allocation spreadsheet"], dataAssets: ["Allocated volumes", "Meter readings"], processes: ["Production reporting", "Month-end close"],
  source: "Ledger vs historian comparison", rootCause: "Allocation factors are applied in a spreadsheet outside any control.", rootCauseBasis: "inferred",
  facts: ["Difference of 2.8% for September", "No reconciliation sign-off for Q3"],
  evidence: [{ label: "Historian extract", ref: "HIS-09", basis: "verified" }, { label: "Ledger extract", ref: "GL-09", basis: "verified" }, { label: "Spreadsheet as cause", ref: "Lineage gap", basis: "inferred" }],
  dependencies: ["Allocation spreadsheet", "Finance Controller"], relatedIds: ["F-03", "F-14"],
  policies: ["Production reporting control PR-03", "Regulatory filing requirement"],
  owner: "Thomas Reid", ownerRole: "Operations Director", reviewer: "Dana Whitfield", status: "open",
  action: "Reconcile September volumes before the filing and move allocation into a governed pipeline with a daily check.",
  alternatives: ["Manual reconciliation sign-off each month"],
  nextSteps: ["Reconcile September", "Confirm filing figures", "Design governed allocation"],
  detection: { method: "Cross-system comparison", at: "2026-10-09T06:45:00Z" },
  identified: "2026-10-09", target: "2026-10-24",
  timeline: [{ date: "2026-10-09", label: "Detected by comparison", actor: "Atlas" }, { date: "2026-10-10", label: "Escalated to Operations Director", actor: "Dana Whitfield" }]
},
{
  id: "F-09", kind: "redflag", area: "data", dimension: "execution",
  title: "Shared account can edit vendor bank details", shift: "Shared write access → Named, approved changes",
  summary: "A shared service account has write access to the ERP vendor table, including bank details.",
  category: "Access control", team: "Finance", severity: "high", urgency: "week",
  impact: "Payment fraud risk; changes cannot be tied to a person.",
  related: "Vendor master", systems: ["ERP vendor table"], dataAssets: ["Vendor bank details"], processes: ["Vendor onboarding", "Payments"],
  source: "Access review", rootCause: "Account created for a 2024 migration and never retired.", rootCauseBasis: "verified",
  facts: ["Account used 14 times in the last 30 days"],
  evidence: [{ label: "Access review export", ref: "ACC-22", basis: "verified" }, { label: "Usage log", ref: "ACC-23", basis: "verified" }],
  dependencies: ["IT security"], relatedIds: ["F-14"],
  policies: ["Access control standard SEC-04"],
  owner: "Elena Vasquez", ownerRole: "Finance Controller", reviewer: "Dana Whitfield", status: "remediating",
  action: "Remove write access from the shared account and require dual approval for bank-detail changes.",
  alternatives: ["Restrict the account to read-only"],
  nextSteps: ["Revoke write access", "Review the 14 changes", "Add dual approval"],
  detection: { method: "Periodic access review", at: "2026-10-01T13:00:00Z" },
  identified: "2026-10-01", target: "2026-10-31",
  timeline: [{ date: "2026-10-01", label: "Detected by access review", actor: "Atlas" }, { date: "2026-10-06", label: "Status → Remediating", actor: "Elena Vasquez" }]
},
{
  id: "F-10", kind: "gap", area: "process", dimension: "strategy",
  title: "Procurement targets not cascaded to approval SLAs", shift: "Annual target → Stage-level SLAs",
  summary: "The 5-day cycle-time target is not translated into time limits for each approval stage.",
  category: "Alignment", team: "Procurement", severity: "medium", urgency: "month",
  impact: "No stage owner is accountable for the cycle-time target.",
  related: "Cost-to-serve strategy", systems: ["ERP purchasing"], dataAssets: ["Approval log"], processes: ["Purchase requests"],
  source: "Strategy document vs workflow configuration", rootCause: "Targets are set annually without a process owner review.", rootCauseBasis: "inferred",
  facts: ["No SLA fields in the approval workflow"],
  evidence: [{ label: "Workflow configuration", ref: "WF-P2P", basis: "verified" }],
  dependencies: ["Operations Director"], relatedIds: ["F-01", "F-11"],
  policies: ["Process ownership standard PO-01"],
  owner: "Thomas Reid", ownerRole: "Operations Director", reviewer: "Dana Whitfield", status: "open",
  action: "Set stage-level SLAs that add up to the 5-day target and name an owner per stage.",
  alternatives: [], nextSteps: ["Agree stage SLAs", "Configure timers"],
  detection: { method: "Document comparison", at: "2026-09-15T15:00:00Z" },
  identified: "2026-09-15", target: "2026-11-30",
  timeline: [{ date: "2026-09-15", label: "Detected", actor: "Atlas" }]
},
{
  id: "F-11", kind: "gap", area: "process", dimension: "execution",
  title: "Work orders wait at technical approval", shift: "Single approver queue → Delegated approval",
  summary: "Maintenance work orders wait an average of 4.1 days at technical approval, the longest stage.",
  category: "Bottleneck", team: "Operations", severity: "high", urgency: "week",
  impact: "Delayed maintenance on non-critical equipment.",
  related: "Maintenance work orders", systems: ["Maintenance system"], dataAssets: ["Work-order log"], processes: ["Maintenance work orders"],
  source: "Event log", rootCause: "One engineer approves all orders above a low threshold.", rootCauseBasis: "verified",
  facts: ["Average wait 4.1 days", "One approver handles 78% of orders"],
  evidence: [{ label: "Work-order event log", ref: "MWO-LOG", basis: "verified" }],
  dependencies: ["Maintenance Operations Lead"], relatedIds: ["F-10"],
  policies: ["Maintenance approval matrix"],
  owner: "Marcus Okafor", ownerRole: "Maintenance Operations Lead", reviewer: "Dana Whitfield", status: "investigating",
  action: "Delegate approval of low-risk orders to supervisors.",
  alternatives: ["Add a second approver"], nextSteps: ["Define low-risk criteria", "Pilot delegation"],
  detection: { method: "Process mining", at: "2026-09-08T09:00:00Z" },
  identified: "2026-09-08", target: "2026-11-10",
  timeline: [{ date: "2026-09-08", label: "Detected by process mining", actor: "Atlas" }, { date: "2026-09-20", label: "Status → Investigating", actor: "Marcus Okafor" }]
},
{
  id: "F-12", kind: "gap", area: "process", dimension: "process",
  title: "Goods receipt undocumented for field purchases", shift: "Informal receipt → Documented receipt step",
  summary: "Field purchases are received without a goods-receipt entry, so three-way match fails.",
  category: "Documentation", team: "Operations", severity: "low", urgency: "month",
  impact: "Invoices held for manual matching.",
  related: "Purchase requests", systems: ["ERP purchasing"], dataAssets: ["Goods receipts"], processes: ["Purchase requests"],
  source: "Invoice match exceptions", rootCause: "Field sites have no receipt step in their procedure.", rootCauseBasis: "verified",
  facts: ["41 invoices held in September"],
  evidence: [{ label: "Match exceptions report", ref: "AP-EXC", basis: "verified" }],
  dependencies: ["Field supervisors"], relatedIds: ["F-01"],
  policies: ["Three-way match control AP-02"],
  owner: "Jonas Berg", ownerRole: "Field Supervisor, North Basin", reviewer: "Dana Whitfield", status: "remediating",
  action: "Add a mobile goods-receipt step to the field procedure.",
  alternatives: [], nextSteps: ["Update procedure", "Train field staff"],
  detection: { method: "Exception analysis", at: "2026-09-03T12:00:00Z" },
  identified: "2026-09-03", target: "2026-11-05",
  timeline: [{ date: "2026-09-03", label: "Detected", actor: "Atlas" }, { date: "2026-09-29", label: "Status → Remediating", actor: "Jonas Berg" }]
},
{
  id: "F-13", kind: "redflag", area: "process", dimension: "process",
  title: "Purchase orders split below approval threshold", shift: "Split orders → Aggregated spend checks",
  summary: "Eighteen pairs of POs to the same supplier on the same day each fall just under the approval threshold.",
  category: "Control bypass", team: "Procurement", severity: "critical", urgency: "immediate",
  impact: "Possible deliberate avoidance of approval; compliance exposure.",
  related: "Purchase requests", systems: ["ERP purchasing"], dataAssets: ["Purchase orders"], processes: ["Purchase requests", "Supplier selection"],
  source: "Threshold-pattern analysis", rootCause: "Not yet established — intent is unknown.", rootCauseBasis: "inferred",
  facts: ["18 same-day PO pairs within 5% under threshold", "Concentrated in two requesters"],
  evidence: [{ label: "PO extract", ref: "PO-Q3", basis: "verified" }, { label: "Pattern suggests intent", ref: "Analysis", basis: "inferred" }],
  dependencies: ["Internal Audit", "Procurement Manager"], relatedIds: ["F-01"],
  policies: ["Delegation of authority policy §4.5", "Code of conduct"],
  owner: "Layla Haddad", ownerRole: "Procurement Manager", reviewer: "Dana Whitfield", status: "open",
  action: "Refer the 18 cases to Internal Audit and add an aggregated same-day spend check to the ERP.",
  alternatives: ["Lower the threshold temporarily"], nextSteps: ["Refer to Internal Audit", "Configure aggregated check"],
  detection: { method: "Threshold-pattern analysis", at: "2026-10-12T08:10:00Z" },
  identified: "2026-10-12", target: "2026-10-26",
  timeline: [{ date: "2026-10-12", label: "Detected by pattern analysis", actor: "Atlas" }]
},
{
  id: "F-14", kind: "redflag", area: "process", alsoArea: "data", dimension: "outcome",
  title: "Month-end close relies on manual overrides", shift: "Manual overrides → Controlled adjustments",
  summary: "Twenty-six manual journal overrides were posted in the last close without supporting documentation.",
  category: "Financial control", team: "Finance", severity: "high", urgency: "week",
  impact: "Financial statements may contain unsupported adjustments.",
  related: "Month-end close", systems: ["Finance ledger"], dataAssets: ["Journal entries"], processes: ["Month-end close"],
  source: "Journal entry analysis", rootCause: "Upstream data-quality errors are fixed by override instead of at source.", rootCauseBasis: "inferred",
  facts: ["26 overrides without attachments in September"],
  evidence: [{ label: "Journal extract", ref: "GL-JE-09", basis: "verified" }, { label: "Link to upstream quality", ref: "F-06", basis: "inferred" }],
  dependencies: ["Finance Controller", "Data-quality rules"], relatedIds: ["F-06", "F-08", "F-09"],
  policies: ["Journal entry control FC-03"],
  owner: "Elena Vasquez", ownerRole: "Finance Controller", reviewer: "Dana Whitfield", status: "investigating",
  action: "Require documentation for every override and fix the upstream causes.",
  alternatives: ["Second-person review of overrides"], nextSteps: ["Document the 26 overrides", "Add attachment check"],
  detection: { method: "Journal entry analytics", at: "2026-10-05T07:00:00Z" },
  identified: "2026-10-05", target: "2026-11-05",
  timeline: [{ date: "2026-10-05", label: "Detected", actor: "Atlas" }, { date: "2026-10-07", label: "Status → Investigating", actor: "Elena Vasquez" }]
}];


export const departments: Department[] = ["Procurement", "Operations", "Finance"];

export const dimensionBlurb: Record<DiligenceArea, Record<Dimension, string>> = {
  data: {
    strategy: "Data objectives, domain ownership and gaps against the data strategy.",
    execution: "How data standards are implemented: rules, access and blockers.",
    process: "Data flows, lineage and dependencies behind each workflow.",
    outcome: "Quality, reconciliation and risk in the data that reaches reports."
  },
  process: {
    strategy: "Business objectives, process ownership and target alignment.",
    execution: "How targets are delivered: bottlenecks, dependencies and blockers.",
    process: "Activities, controls and handoffs inside each workflow.",
    outcome: "Cycle time, rework, control results and measurable impact."
  }
};

/** Findings identified per week (illustrative). */
export const weeklyTrend: Record<DiligenceArea, {week: string;gaps: number;flags: number;}[]> = {
  data: [{ week: "W34", gaps: 1, flags: 0 }, { week: "W35", gaps: 0, flags: 0 }, { week: "W36", gaps: 1, flags: 0 }, { week: "W37", gaps: 1, flags: 0 }, { week: "W38", gaps: 0, flags: 1 }, { week: "W39", gaps: 1, flags: 0 }, { week: "W40", gaps: 0, flags: 1 }, { week: "W41", gaps: 0, flags: 1 }],
  process: [{ week: "W34", gaps: 0, flags: 0 }, { week: "W35", gaps: 0, flags: 0 }, { week: "W36", gaps: 2, flags: 0 }, { week: "W37", gaps: 2, flags: 0 }, { week: "W38", gaps: 0, flags: 0 }, { week: "W39", gaps: 0, flags: 1 }, { week: "W40", gaps: 0, flags: 1 }, { week: "W41", gaps: 0, flags: 1 }]
};

export const connectors = [
{ name: "ERP Data", team: "Procurement", owner: "Procurement Manager", areas: ["data", "process"] as DiligenceArea[] },
{ name: "Production & quality data", team: "Operations", owner: "Plant Manager", areas: ["data", "process"] as DiligenceArea[] },
{ name: "Financial Data", team: "Finance", owner: "CFO / Controller", areas: ["data", "process"] as DiligenceArea[] }];


/** Simulated monitoring events. Nothing here is read from a live system. */
export const eventPool: MonitorEventTemplate[] = [
{ area: "process", type: "redflag", severity: "high", title: "PO approved in chat before ERP approval", explanation: "An approval message was found 3 h before the ERP approval timestamp.", source: "ERP Data", team: "Procurement", recommendation: "Add the case to F-01 and confirm the approver.", evidence: ["PO 4500-8812", "Chat message 10:02"], relatedFindingId: "F-01" },
{ area: "data", type: "warning", severity: "medium", title: "Historian feed 40 min late", explanation: "Hourly meter readings arrived later than the 15-minute tolerance.", source: "Production & quality data", team: "Operations", recommendation: "Check the historian export job.", evidence: ["Feed timestamp 06:40"] },
{ area: "process", type: "normal", severity: "low", title: "Work order approved within SLA", explanation: "Technical approval completed in 1.2 days.", source: "Production & quality data", team: "Operations", recommendation: "No action needed.", evidence: ["WO-77120"] },
{ area: "data", type: "gap", severity: "medium", title: "Cost-centre field blank on 12 entries", explanation: "Mandatory field empty; rule exists but is not scheduled.", source: "Financial Data", team: "Finance", recommendation: "Link to F-06 and notify the cost-centre owner.", evidence: ["12 ledger lines"], relatedFindingId: "F-06" },
{ area: "process", type: "redflag", severity: "critical", title: "Two same-day POs just under threshold", explanation: "Same supplier, same requester, each 3% under the approval threshold.", source: "ERP Data", team: "Procurement", recommendation: "Add to F-13 and refer to Internal Audit.", evidence: ["PO 4500-8830", "PO 4500-8831"], relatedFindingId: "F-13" },
{ area: "data", type: "normal", severity: "low", title: "Supplier master duplicate check passed", explanation: "No new duplicates in today's onboarding.", source: "ERP Data", team: "Procurement", recommendation: "No action needed.", evidence: ["Match run 07:00"], relatedFindingId: "F-07" },
{ area: "process", type: "warning", severity: "medium", title: "Plant report resubmitted", explanation: "Weekly report changed after submission for the 10th time this quarter.", source: "Production & quality data", team: "Operations", recommendation: "Track under F-04.", evidence: ["Version 3 of week 41 report"], relatedFindingId: "F-04" },
{ area: "data", type: "redflag", severity: "critical", title: "Volume difference above 2%", explanation: "Ledger volume exceeds historian by 2.6% for the week.", source: "Financial Data", team: "Finance", recommendation: "Escalate under F-08 before the filing.", evidence: ["GL week 41", "Historian week 41"], relatedFindingId: "F-08" },
{ area: "data", type: "warning", severity: "high", title: "Shared account changed a vendor record", explanation: "The shared service account edited a vendor address.", source: "ERP Data", team: "Finance", recommendation: "Review the change and continue F-09 remediation.", evidence: ["Vendor 300112"], relatedFindingId: "F-09" },
{ area: "process", type: "gap", severity: "medium", title: "Goods receipt missing on field invoice", explanation: "Invoice held: no receipt recorded.", source: "ERP Data", team: "Operations", recommendation: "Link to F-12.", evidence: ["Invoice 9100-551"], relatedFindingId: "F-12" },
{ area: "process", type: "normal", severity: "low", title: "Month-end override documented", explanation: "Override posted with attachment and second review.", source: "Financial Data", team: "Finance", recommendation: "No action needed.", evidence: ["JE 2026-10-114"] },
{ area: "data", type: "gap", severity: "low", title: "Manual production upload detected", explanation: "Daily file uploaded by hand; lineage breaks at upload.", source: "Production & quality data", team: "Operations", recommendation: "Track under F-03.", evidence: ["Upload 07:12"], relatedFindingId: "F-03" }];

export const seedEventCount = 6;

/** Prior review decisions (illustrative). Rejected items are kept for traceability. */
export const reviewSeed: Record<string, ReviewState> = {
  "F-07": { finding: "accepted", remediation: "accepted", history: [
    { subject: "finding", decision: "accepted", reviewer: "Sofia Lindqvist", at: "2026-08-25T10:00:00Z", comment: "Match report confirms duplicates." },
    { subject: "remediation", decision: "accepted", reviewer: "Sofia Lindqvist", at: "2026-09-01T10:00:00Z", comment: "Merge plan and form change approved." }]
  },
  "F-12": { finding: "accepted", remediation: "pending", history: [
    { subject: "finding", decision: "accepted", reviewer: "Dana Whitfield", at: "2026-09-25T09:30:00Z", comment: "Exceptions report is clear." }]
  },
  "F-03": { finding: "accepted", remediation: "accepted", history: [
    { subject: "finding", decision: "accepted", reviewer: "Sofia Lindqvist", at: "2026-09-04T09:00:00Z", comment: "Lineage scan verified." },
    { subject: "remediation", decision: "accepted", reviewer: "Sofia Lindqvist", at: "2026-09-09T09:00:00Z", comment: "Schema-first approach agreed." }]
  },
  "F-05": { finding: "rejected", remediation: "pending", history: [
    { subject: "finding", decision: "rejected", reviewer: "Dana Whitfield", at: "2026-09-20T14:00:00Z", comment: "Q3 charter may already name an owner; the register could be out of date. Confirm against the charter before re-raising." }]
  }
};
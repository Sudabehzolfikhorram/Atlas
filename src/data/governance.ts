import type { EvidenceStatus, Severity } from "../types/intel";

export const productionKpis = [
{ label: "Deferred production", value: "1,840", unit: "bbl/d peak", note: "Estimate · linked to WO backlog", tone: "text-amber-300" },
{ label: "Maintenance-driven downtime", value: "6.2", unit: "%", note: "Verified · CMMS + Historian", tone: "text-slate-100" },
{ label: "Parts-wait share of MTTR", value: "41", unit: "%", note: "Verified · ERP reservations", tone: "text-amber-300" },
{ label: "Supply-chain exceptions", value: "27", unit: "open", note: "Verified · ERP", tone: "text-slate-100" }];


export const deferredByAsset = [
{ asset: "Compressor St. 4", maintenance: 620, supply: 310 },
{ asset: "Separator Train B", maintenance: 410, supply: 120 },
{ asset: "Wellpad 9", maintenance: 180, supply: 220 },
{ asset: "Wellpad 11", maintenance: 140, supply: 90 },
{ asset: "Water Injection 2", maintenance: 95, supply: 40 }];


export const productionHandoffs = [
{ from: "Field Operations", to: "Maintenance", text: "Failure reports → corrective WO", delay: "0.1 d", status: "verified" as EvidenceStatus },
{ from: "Maintenance", to: "Supply Chain", text: "Parts reservation → PR", delay: "1.8 d", status: "verified" as EvidenceStatus },
{ from: "Supply Chain", to: "Field Operations", text: "Delivery → crew mobilisation", delay: "0.9 d", status: "inferred" as EvidenceStatus }];


export interface LineageStep {
  id: string;
  label: string;
  system: string;
  kind: "origin" | "transform" | "store" | "report" | "decision";
  owner: string;
  status: EvidenceStatus;
  gap?: string;
}

export const lineageSteps: LineageStep[] = [
{ id: "L1", label: "Wellhead flow meters", system: "SCADA", kind: "origin", owner: "Field Operations", status: "verified" },
{ id: "L2", label: "Process historian tags", system: "Historian", kind: "store", owner: "Production Eng.", status: "verified" },
{ id: "L3", label: "Allocation spreadsheet v14", system: "Document repository", kind: "transform", owner: "Unassigned", status: "inferred", gap: "Undocumented logic · shared account edits" },
{ id: "L4", label: "Production data mart", system: "Data platform", kind: "store", owner: "Enterprise Data", status: "verified" },
{ id: "L5", label: "Daily production report", system: "Reporting", kind: "report", owner: "Production Eng.", status: "verified" },
{ id: "L6", label: "Regulatory production filing", system: "Regulatory portal", kind: "decision", owner: "Finance & Compliance", status: "verified" }];


export const lineageConsumers = [
{ element: "Allocated well volumes", consumers: ["Daily production report", "Royalty calculation", "Reserves reporting"] },
{ element: "Asset criticality", consumers: ["Maintenance scheduling", "HSE risk score", "Depreciation"] },
{ element: "Vendor bank details", consumers: ["Payment run", "Sanctions screening"] }];


export interface GovGap {
  id: string;
  type: string;
  title: string;
  area: string;
  severity: Severity;
  status: EvidenceStatus;
  controlId: string;
}

export const governanceGaps: GovGap[] = [
{ id: "G-01", type: "Incomplete lineage", title: "Allocation transform undocumented", area: "Production reporting", severity: "critical", status: "verified", controlId: "C-01" },
{ id: "G-02", type: "Missing ownership", title: "Asset Register has no owner", area: "Asset management", severity: "high", status: "verified", controlId: "C-02" },
{ id: "G-03", type: "Missing checkpoint", title: "No sync validation for vendor bank changes", area: "Procure-to-Pay", severity: "high", status: "verified", controlId: "C-03" },
{ id: "G-04", type: "Access-control weakness", title: "Shared account edits allocation spreadsheet", area: "Production reporting", severity: "high", status: "verified", controlId: "C-01" },
{ id: "G-05", type: "Unverified relationship", title: "Field estimates feed accruals off-system", area: "Finance close", severity: "medium", status: "inferred", controlId: "C-04" }];


export interface NextControl {
  id: string;
  name: string;
  description: string;
  gaps: string[];
  owner: string;
  priority: string;
  dependencies: string[];
  evidenceRequired: string[];
  outcome: string;
  verification: string;
  effort: string;
}

export type DesignStepKind = "step" | "check" | "approval";

export interface DesignStep {
  id: string;
  label: string;
  actor: string;
  kind: DesignStepKind;
  detail: string;
  /** What happens when a check or approval fails, and how it's corrected before continuing. */
  onFail?: {trigger: string;correction: string;returnsTo: string;};
}

export interface DesignCheck {
  id: string;
  name: string;
  owner: string;
  change: string;
  acceptance: string;
}

export interface ControlDesign {
  controlId: string;
  version: string;
  drafted: string;
  pilotScope: string;
  steps: DesignStep[];
  checks: DesignCheck[];
}

/** Illustrative proposed designs for each recommended control. Proposals only — not approved or live. */
export const controlDesigns: ControlDesign[] = [
{
  controlId: "C-01",
  version: "Design v0.3",
  drafted: "Oct 8, 2026",
  pilotScope: "Wellpads 9 & 11 for 30 days, run in parallel with the existing spreadsheet",
  steps: [
  { id: "s1", label: "Ingest metered volumes", actor: "Data platform (automated)", kind: "step", detail: "Historian tags load hourly into the production data mart." },
  { id: "s2", label: "Completeness check", actor: "Data platform (automated)", kind: "check", detail: "All active wells report 24 hourly readings.", onFail: { trigger: "Missing or frozen readings", correction: "Field Operations confirms meter status; gaps filled from backup meter or flagged as estimate", returnsTo: "Ingest metered volumes" } },
  { id: "s3", label: "Apply allocation factors", actor: "Data platform (automated)", kind: "step", detail: "Versioned factors replace spreadsheet v14 logic." },
  { id: "s4", label: "Reconciliation checkpoint", actor: "Data platform (automated)", kind: "check", detail: "Metered vs allocated totals within ±0.5%.", onFail: { trigger: "Variance above ±0.5%", correction: "Production Engineering investigates factors, records cause and re-runs allocation", returnsTo: "Apply allocation factors" } },
  { id: "s5", label: "Engineer sign-off", actor: "Production Engineering lead", kind: "approval", detail: "Named-user approval of daily allocated volumes.", onFail: { trigger: "Sign-off rejected", correction: "Rejection reason logged; volumes held and re-reconciled after correction", returnsTo: "Reconciliation checkpoint" } },
  { id: "s6", label: "Publish to report & filing", actor: "Reporting", kind: "step", detail: "Daily report and regulatory filing read only signed-off volumes." }],

  checks: [
  { id: "C-01.1", name: "Completeness check", owner: "Field Operations Supervisor", change: "Automated 24-reading rule per active well", acceptance: "≥ 99% of well-days complete over 30 days; every gap has a logged cause" },
  { id: "C-01.2", name: "Reconciliation checkpoint", owner: "Priya Raman · Enterprise Data Lead", change: "Allocation logic moved from spreadsheet to versioned pipeline", acceptance: "30 consecutive days within ±0.5%, or each breach resolved within 1 business day" },
  { id: "C-01.3", name: "Named-user sign-off", owner: "Production Engineering Lead", change: "Shared spreadsheet account retired; approvals by named users only", acceptance: "Access review shows 0 shared accounts; 100% of days signed off by a named user" }]

},
{
  controlId: "C-02",
  version: "Design v0.2",
  drafted: "Oct 6, 2026",
  pilotScope: "Asset Register domain only, for one quarterly attestation cycle",
  steps: [
  { id: "s1", label: "Nominate owner & steward", actor: "VP Operational Excellence", kind: "step", detail: "Owner accountable for decisions; steward for day-to-day quality." },
  { id: "s2", label: "Nominee acceptance", actor: "Nominated owner", kind: "approval", detail: "Owner confirms scope and accepts accountability.", onFail: { trigger: "Nomination declined", correction: "Reason captured; sponsor nominates an alternative within 5 days", returnsTo: "Nominate owner & steward" } },
  { id: "s3", label: "Register in data catalogue", actor: "Data Governance Office", kind: "step", detail: "Owner, steward and scope published on the catalogue entry." },
  { id: "s4", label: "Quarterly attestation", actor: "Domain owner", kind: "check", detail: "Owner attests that definitions, access and quality rules are current.", onFail: { trigger: "Attestation missed or issues declared", correction: "Escalated to sponsor; remediation actions logged and re-attested within 30 days", returnsTo: "Quarterly attestation" } }],

  checks: [
  { id: "C-02.1", name: "Named domain ownership", owner: "Dana Whitfield · VP Operational Excellence", change: "Owner and steward assigned for Asset Register", acceptance: "Catalogue shows owner and steward; nominee acceptance recorded" },
  { id: "C-02.2", name: "Quarterly attestation", owner: "Asset Register owner (to be named)", change: "Attestation task added to catalogue workflow", acceptance: "First attestation completed on time with no open findings older than 30 days" }]

},
{
  controlId: "C-03",
  version: "Design v0.4",
  drafted: "Oct 9, 2026",
  pilotScope: "One weekly payment run for North Basin vendors",
  steps: [
  { id: "s1", label: "Bank-detail change requested", actor: "Vendor master team", kind: "step", detail: "Change entered in the procurement suite with supporting document." },
  { id: "s2", label: "Cross-system match check", actor: "ERP (automated)", kind: "check", detail: "Bank details compared between ERP and procurement suite before payment.", onFail: { trigger: "Details differ between systems", correction: "Payment blocked; vendor master team confirms with vendor by call-back to a known number", returnsTo: "Bank-detail change requested" } },
  { id: "s3", label: "Dual approval", actor: "Finance Controller + AP Lead", kind: "approval", detail: "Two named approvers release the change.", onFail: { trigger: "Either approver rejects", correction: "Change reversed; vendor notified; fraud review opened if call-back failed", returnsTo: "Bank-detail change requested" } },
  { id: "s4", label: "Release for payment", actor: "Accounts Payable", kind: "step", detail: "Vendor becomes payable in the next run." }],

  checks: [
  { id: "C-03.1", name: "Cross-system match block", owner: "Elena Vasquez · Finance Controller", change: "Payment block when ERP and procurement bank details differ", acceptance: "0 payments released with mismatched details across the pilot run" },
  { id: "C-03.2", name: "Dual approval", owner: "Accounts Payable Lead", change: "Second named approver required for bank changes", acceptance: "100% of changes show two distinct approvers in the exception log" }]

},
{
  controlId: "C-04",
  version: "Design v0.1",
  drafted: "Oct 2, 2026",
  pilotScope: "One month-end close for field operations accruals",
  steps: [
  { id: "s1", label: "Submit field cost estimate", actor: "Field cost engineer", kind: "step", detail: "Estimate entered in the accrual register with basis and attachments." },
  { id: "s2", label: "Completeness check", actor: "Register (automated)", kind: "check", detail: "Cost centre, basis and period are filled in.", onFail: { trigger: "Required fields missing", correction: "Submission returned to the engineer with the missing fields highlighted", returnsTo: "Submit field cost estimate" } },
  { id: "s3", label: "Supervisor approval", actor: "Field operations supervisor", kind: "approval", detail: "Approver confirms the estimate is reasonable.", onFail: { trigger: "Estimate rejected", correction: "Engineer revises with reason; resubmitted before close cut-off", returnsTo: "Submit field cost estimate" } },
  { id: "s4", label: "Post accrual", actor: "Finance close team", kind: "step", detail: "Only approved register entries are posted." }],

  checks: [
  { id: "C-04.1", name: "Structured accrual register", owner: "Sofia Lindqvist · Data Governance Officer", change: "Email and spreadsheet estimates replaced by register entries", acceptance: "100% of field accruals in the pilot close come from the register" },
  { id: "C-04.2", name: "Supervisor approval", owner: "Field Operations Supervisor", change: "Named approval before posting", acceptance: "Every posted accrual has submitter and approver recorded" }]

}];


export const nextControls: NextControl[] = [
{ id: "C-01", name: "Governed allocation pipeline with reconciliation checkpoint", description: "Move allocation logic from spreadsheet into the data platform with a daily volume reconciliation (metered vs allocated within ±0.5%).", gaps: ["G-01", "G-04"], owner: "Priya Raman · Enterprise Data Lead", priority: "P1 · Start this sprint", dependencies: ["Production engineering sign-off on factors", "Named-user access only"], evidenceRequired: ["Documented transformation spec", "30 days of reconciliation logs", "Access review export"], outcome: "Every regulatory volume traceable to source meters", verification: "Internal audit samples 20 filings; 100% lineage traceable", effort: "6 weeks" },
{ id: "C-02", name: "Accountable data-domain ownership", description: "Assign owner and steward for Asset Register; add quarterly ownership attestation in the data catalogue.", gaps: ["G-02"], owner: "Dana Whitfield · VP Operational Excellence", priority: "P1 · Decide today", dependencies: ["DEC-029 approval"], evidenceRequired: ["Catalogue entry with owner & steward", "First quarterly attestation"], outcome: "Ownership coverage 62% → 80%", verification: "Catalogue report shows owner on all critical domains", effort: "1 week" },
{ id: "C-03", name: "Vendor bank-detail change validation", description: "Block payment when vendor bank details differ between ERP and procurement suite until dual-approved.", gaps: ["G-03"], owner: "Elena Vasquez · Finance Controller", priority: "P1", dependencies: ["System of record agreed (T-103)"], evidenceRequired: ["Control configuration screenshot", "Exception log for 1 payment cycle"], outcome: "Zero payments to unverified bank changes", verification: "Monthly exception report reviewed by Finance", effort: "3 weeks" },
{ id: "C-04", name: "Accrual input register", description: "Capture field cost estimates in a structured register with submitter and approver.", gaps: ["G-05"], owner: "Sofia Lindqvist · Data Governance Officer", priority: "P2 · After validation", dependencies: ["Validation of inferred dependency (DEC-025)"], evidenceRequired: ["Validated dependency", "Register in use for one close"], outcome: "Accrual inputs auditable", verification: "Close checklist confirms register reconciliation", effort: "4 weeks" }];
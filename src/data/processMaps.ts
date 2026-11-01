import type { PeriodKey, ProcessDefinition } from "../types/processMap";

/**
 * ILLUSTRATIVE DEMO DATA — Meridian Energy (fictitious operator), Upstream North Basin.
 * Monthly values are synthetic and interpolated; they are not genuine historical snapshots.
 */

export const timelineMonths = [
{ short: "Oct", full: "October 2025" },
{ short: "Nov", full: "November 2025" },
{ short: "Dec", full: "December 2025" },
{ short: "Jan", full: "January 2026" },
{ short: "Feb", full: "February 2026" },
{ short: "Mar", full: "March 2026" },
{ short: "Apr", full: "April 2026" },
{ short: "May", full: "May 2026" },
{ short: "Jun", full: "June 2026" },
{ short: "Jul", full: "July 2026" },
{ short: "Aug", full: "August 2026" },
{ short: "Sep", full: "September 2026" }];


export const periods: {key: PeriodKey;label: string;short: string;start: number;}[] = [
{ key: "12m", label: "Oct 2025 – Sep 2026", short: "Last 12 months", start: 0 },
{ key: "6m", label: "Apr – Sep 2026", short: "Last 6 months", start: 6 },
{ key: "q3", label: "Jul – Sep 2026", short: "Q3 2026", start: 9 }];


export const processMaps: ProcessDefinition[] = [
{
  id: "equipment-purchasing",
  name: "Equipment purchasing",
  department: "Procurement",
  owner: "Layla Haddad · Procurement Manager",
  description: "Field equipment requests from initial need to confirmed receipt at the North Basin warehouse.",
  stages: [
  { id: "intake", label: "Intake", stepIds: ["request", "completeness"] },
  { id: "approval", label: "Approval", stepIds: ["manager", "finance", "reapproval", "join"] },
  { id: "sourcing", label: "Sourcing & PO", stepIds: ["supplier", "po"] },
  { id: "fulfilment", label: "Fulfilment", stepIds: ["receipt"] }],

  monthlyCases: [1080, 1120, 960, 1150, 1190, 1240, 1210, 1280, 1330, 1290, 1360, 1410],
  sources: [5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 9],
  trend: [0.86, 0.9, 1.08, 0.92, 0.95, 0.97, 0.98, 1.0, 1.03, 1.02, 1.05, 1.0],
  steps: [
  {
    id: "request", col: 0, row: 1,
    current: { label: "Purchase request", owner: "Field Ops", system: "Email → ERP re-key", share: 1, waitDays: 1.6, issue: "46% of requests start as emails that are re-keyed into the ERP.", evidence: [{ label: "Email-to-PR similarity match", status: "inferred" }, { label: "41,208 PR event records (ERP)", status: "verified" }] },
    recommended: { label: "Structured request", owner: "Field Ops", system: "ERP request form", share: 1, evidence: [{ label: "Form fields from policy PRC-004", status: "verified" }] }
  },
  {
    id: "completeness", col: 1, row: 1,
    recommended: { label: "Completeness check", owner: "ERP (automated)", system: "ERP validation rules", share: 1, evidence: [{ label: "18% of PRs returned for missing info", status: "verified" }] }
  },
  {
    id: "manager", col: 2, row: 0,
    current: { label: "Manager review", owner: "Asset Manager", system: "ERP workflow", share: 1, waitDays: 0.8, evidence: [{ label: "ERP release strategy R1", status: "verified" }] },
    recommended: { label: "Manager review", owner: "Asset Manager", system: "ERP workflow", share: 1, evidence: [{ label: "ERP release strategy R1", status: "verified" }] }
  },
  {
    id: "finance", col: 2, row: 2,
    current: { label: "Finance review", owner: "Finance", system: "ERP workflow", share: 1, waitDays: 2.1, issue: "Starts only after manager review completes, although it checks different criteria.", evidence: [{ label: "ERP release strategy R2", status: "verified" }] },
    recommended: { label: "Finance review", owner: "Finance", system: "ERP workflow", share: 1, evidence: [{ label: "ERP release strategy R2", status: "verified" }] }
  },
  {
    id: "reapproval", col: 3, row: 2,
    current: { label: "Manual re-approval", owner: "Finance Controller", system: "Email + spreadsheet", share: 0.61, waitDays: 2.2, issue: "Repeats the recorded ERP approval; 97.8% of outcomes are unchanged.", evidence: [{ label: "Re-approval vs ERP decision match", status: "verified" }, { label: "Approval reminder emails (metadata)", status: "inferred" }] }
  },
  {
    id: "join", col: 3, row: 1,
    recommended: { label: "Approval join", owner: "ERP workflow", system: "Both approvals required", share: 1, evidence: [{ label: "Delegation of authority DOA-2.1", status: "verified" }] }
  },
  {
    id: "supplier", col: 4, row: 1,
    current: { label: "Supplier selection", owner: "Procurement", system: "Sourcing suite", share: 1, waitDays: 1.3, evidence: [{ label: "Sourcing events (suite)", status: "verified" }] },
    recommended: { label: "Supplier selection", owner: "Procurement", system: "Sourcing suite", share: 1, evidence: [{ label: "Sourcing events (suite)", status: "verified" }] }
  },
  {
    id: "po", col: 5, row: 1,
    current: { label: "Purchase order", owner: "Procurement", system: "ERP", share: 1, waitDays: 0.5, evidence: [{ label: "PO creation events (ERP)", status: "verified" }] },
    recommended: { label: "Purchase order", owner: "Procurement", system: "ERP", share: 1, evidence: [{ label: "PO creation events (ERP)", status: "verified" }] }
  },
  {
    id: "receipt", col: 6, row: 1,
    current: { label: "Receipt confirmation", owner: "Warehouse", system: "ERP goods receipt", share: 1, waitDays: 1.1, issue: "11% of receipts are recorded more than 5 days after delivery.", evidence: [{ label: "Goods-receipt timestamps (ERP)", status: "verified" }] },
    recommended: { label: "Receipt confirmation", owner: "Warehouse", system: "ERP goods receipt", share: 1, evidence: [{ label: "Goods-receipt timestamps (ERP)", status: "verified" }] }
  }],

  currentEdges: [
  { id: "request>manager", from: "request", to: "manager", kind: "manual", label: "Email request re-keyed", share: 1 },
  { id: "manager>finance", from: "manager", to: "finance", kind: "approval", label: "Sequential hand-off", share: 1 },
  { id: "finance>reapproval", from: "finance", to: "reapproval", kind: "manual", label: "Email to Controller (≥ $10k)", share: 0.61 },
  { id: "finance>supplier", from: "finance", to: "supplier", kind: "approval", label: "Released (< $10k)", share: 0.39 },
  { id: "reapproval>supplier", from: "reapproval", to: "supplier", kind: "approval", label: "Released after re-approval", share: 0.61 },
  { id: "supplier>po", from: "supplier", to: "po", kind: "system", label: "Award to PO", share: 1 },
  { id: "po>receipt", from: "po", to: "receipt", kind: "manual", label: "Email notification", share: 1 }],

  recommendation: {
    version: "v1.3",
    generatedOn: "Oct 2, 2026",
    baselines: ["12m", "6m", "q3"],
    reference: "Benchmark set BP-P2P-07 (12 peer upstream operators, demo)",
    assumptions: [
    "Manager and Finance reviews assess independent criteria and don't consume each other's output.",
    "The ERP approval records the same authority and limits as the manual re-approval.",
    "Approval requirements under DOA-2.1 stay in force; no approver is removed."],

    limitations: [
    "Recommended case volumes per path are not modelled.",
    "Off-system (verbal) approvals cannot be observed in ERP data.",
    "No cycle-time or cost savings are estimated until a pilot is measured."],

    edges: [
    { id: "request>completeness", from: "request", to: "completeness", kind: "system", label: "Form submitted" },
    { id: "completeness>manager", from: "completeness", to: "manager", kind: "system", label: "Complete → review" },
    { id: "completeness>finance", from: "completeness", to: "finance", kind: "system", label: "Complete → review" },
    { id: "manager>join", from: "manager", to: "join", kind: "approval", label: "Manager approval" },
    { id: "finance>join", from: "finance", to: "join", kind: "approval", label: "Finance approval" },
    { id: "join>supplier", from: "join", to: "supplier", kind: "approval", label: "Released when both approve" },
    { id: "supplier>po", from: "supplier", to: "po", kind: "system", label: "Award to PO" },
    { id: "po>receipt", from: "po", to: "receipt", kind: "system", label: "ERP goods-receipt task" }],

    changes: [
    {
      id: "chg-intake", type: "modified", title: "Capture requests in a structured form",
      stepIds: ["request"], edgeIds: ["request>manager"],
      current: "Field teams email requests; Procurement re-keys them into the ERP.",
      proposed: "Field teams submit a structured ERP request with the required fields at source.",
      why: "Avoidable manual handoff — re-keying adds a wait before any review can start.",
      evidence: "Email-to-PR similarity match on 46% of requisitions.", evidenceStatus: "inferred", basis: "ai",
      impact: { measuredStepId: "request", text: "Targets the measured intake wait at this step" }
    },
    {
      id: "chg-check", type: "added", title: "Add a completeness check before review",
      stepIds: ["completeness"], edgeIds: ["request>completeness", "completeness>manager", "completeness>finance"],
      current: "Incomplete requests are discovered during review and sent back.",
      proposed: "ERP validation rules block submission until mandatory fields and cost codes are present.",
      why: "Missing check — 18% of requests are returned for missing information, causing rework.",
      evidence: "ERP status history: 'returned to requester' events.", evidenceStatus: "verified", basis: "best-practice"
    },
    {
      id: "chg-parallel", type: "reordered", title: "Run Manager and Finance reviews in parallel",
      stepIds: ["manager", "finance"], edgeIds: ["manager>finance", "manager>join", "finance>join"],
      current: "Finance review starts only after the manager review completes.",
      proposed: "Both reviews start together. Both approvals remain required before release.",
      why: "Steps that can run in parallel — the reviews check operational need and budget independently.",
      evidence: "Benchmark BP-P2P-07; review comments show no cross-reference in sampled cases.", evidenceStatus: "inferred", basis: "best-practice",
      assumption: "Appropriate only when Finance doesn't rely on the manager's justification. Validate with Finance before piloting.",
      impact: { measuredStepId: "finance", text: "Finance's measured wait would overlap the manager review rather than follow it" }
    },
    {
      id: "chg-join", type: "added", title: "Add an approval join",
      stepIds: ["join"], edgeIds: ["join>supplier"],
      current: "Release follows the last sequential approval.",
      proposed: "A join step releases the request only after both approvals are recorded.",
      why: "Preserves approval requirements when reviews run in parallel.",
      evidence: "Delegation of authority DOA-2.1 requires both approvals.", evidenceStatus: "verified", basis: "ai"
    },
    {
      id: "chg-reapproval", type: "removed", title: "Remove the duplicate manual re-approval",
      stepIds: ["reapproval"], edgeIds: ["finance>reapproval", "reapproval>supplier", "finance>supplier"],
      current: "Finance Controller re-approves requests ≥ $10k by email after the ERP approval.",
      proposed: "Rely on the recorded ERP approval and keep monthly post-audit sampling.",
      why: "Redundant approval — the manual step repeats a decision already captured in ERP.",
      evidence: "97.8% of re-approvals match the ERP decision (41,208 records).", evidenceStatus: "verified", basis: "ai",
      assumption: "Keep the re-approval for exceptions above delegation limits.",
      impact: { measuredStepId: "reapproval", text: "Removes a step with this measured average wait" }
    },
    {
      id: "chg-receipt", type: "modified", title: "Trigger receipt from the PO automatically",
      stepIds: [], edgeIds: ["po>receipt"],
      current: "The warehouse is notified of incoming deliveries by email.",
      proposed: "The ERP creates a goods-receipt task for the warehouse when the PO is issued.",
      why: "Avoidable manual handoff — 11% of receipts are recorded more than 5 days late.",
      evidence: "Goods-receipt vs delivery timestamps (ERP).", evidenceStatus: "verified", basis: "ai"
    }]

  }
},
{
  id: "maintenance-work-order",
  name: "Maintenance work order",
  department: "Maintenance",
  owner: "Marcus Okafor · Maintenance Operations Lead",
  description: "Corrective work orders from field notification to completed job and closure in the CMMS.",
  stages: [
  { id: "intake", label: "Intake", stepIds: ["raised", "routing"] },
  { id: "approval", label: "Approval", stepIds: ["planner", "autorelease"] },
  { id: "materials", label: "Materials", stepIds: ["parts"] },
  { id: "execution", label: "Execution", stepIds: ["signoff", "schedule", "complete"] }],

  monthlyCases: [520, 548, 610, 590, 566, 540, 530, 512, 534, 556, 571, 560],
  sources: [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5],
  trend: [0.9, 0.94, 1.12, 1.06, 1.0, 0.97, 0.96, 0.98, 1.02, 1.04, 1.06, 1.0],
  steps: [
  {
    id: "raised", col: 0, row: 1,
    current: { label: "Work order raised", owner: "Field Ops", system: "CMMS", share: 1, waitDays: 0.1, evidence: [{ label: "WO notifications (CMMS)", status: "verified" }] },
    recommended: { label: "Work order raised", owner: "Field Ops", system: "CMMS", share: 1, evidence: [{ label: "WO notifications (CMMS)", status: "verified" }] }
  },
  {
    id: "routing", col: 1, row: 1,
    recommended: { label: "Risk-based routing", owner: "CMMS (automated)", system: "Criticality + cost rules", share: 1, evidence: [{ label: "Asset criticality ratings (86% complete)", status: "inferred" }] }
  },
  {
    id: "planner", col: 2, row: 0,
    current: { label: "Planner review", owner: "Maintenance Planner", system: "CMMS", share: 1, waitDays: 2.9, issue: "38% wait over 72h; one planner handles 41% of critical WOs.", evidence: [{ label: "6,412 WO status histories", status: "verified" }] },
    recommended: { label: "Planner review (A/B only)", owner: "Maintenance Planner", system: "CMMS", share: 1, evidence: [{ label: "6,412 WO status histories", status: "verified" }] }
  },
  {
    id: "autorelease", col: 2, row: 2,
    recommended: { label: "Auto-release (C/D < $8k)", owner: "CMMS (automated)", system: "Release rules", share: 1, evidence: [{ label: "92% of C/D WOs approved unchanged", status: "verified" }] }
  },
  {
    id: "parts", col: 3, row: 1,
    current: { label: "Parts reservation", owner: "Procurement", system: "ERP materials", share: 1, waitDays: 1.8, evidence: [{ label: "Reservation records (ERP)", status: "verified" }] },
    recommended: { label: "Parts reservation", owner: "Procurement", system: "ERP materials", share: 1, evidence: [{ label: "Reservation records (ERP)", status: "verified" }] }
  },
  {
    id: "signoff", col: 4, row: 2,
    current: { label: "Supervisor sign-off", owner: "Field Supervisor", system: "Paper form", share: 0.74, waitDays: 1.2, issue: "Repeats the planner approval for low-risk work orders.", evidence: [{ label: "Scanned sign-off forms (sample)", status: "inferred" }] }
  },
  {
    id: "schedule", col: 5, row: 1,
    current: { label: "Scheduling", owner: "Maintenance", system: "CMMS scheduler", share: 1, waitDays: 1.2, evidence: [{ label: "Schedule events (CMMS)", status: "verified" }] },
    recommended: { label: "Scheduling", owner: "Maintenance", system: "CMMS scheduler", share: 1, evidence: [{ label: "Schedule events (CMMS)", status: "verified" }] }
  },
  {
    id: "complete", col: 6, row: 1,
    current: { label: "Job completed", owner: "Field Ops", system: "Paper job card", share: 1, waitDays: 0.8, evidence: [{ label: "WO closure records (CMMS)", status: "verified" }] },
    recommended: { label: "Job completed", owner: "Field Ops", system: "Mobile CMMS", share: 1, evidence: [{ label: "WO closure records (CMMS)", status: "verified" }] }
  }],

  currentEdges: [
  { id: "raised>planner", from: "raised", to: "planner", kind: "handoff", label: "All WOs to planner", share: 1 },
  { id: "planner>parts", from: "planner", to: "parts", kind: "approval", label: "Approved WO", share: 1 },
  { id: "parts>signoff", from: "parts", to: "signoff", kind: "manual", label: "Paper sign-off", share: 0.74 },
  { id: "parts>schedule", from: "parts", to: "schedule", kind: "system", label: "Critical WOs", share: 0.26 },
  { id: "signoff>schedule", from: "signoff", to: "schedule", kind: "manual", label: "Form scanned", share: 0.74 },
  { id: "schedule>complete", from: "schedule", to: "complete", kind: "manual", label: "Paper job card", share: 1 }],

  recommendation: {
    version: "v0.9",
    generatedOn: "Sep 28, 2026",
    baselines: ["12m", "q3"],
    assumptions: [
    "Asset criticality ratings are accurate enough to route work orders (86% complete).",
    "Low-risk C/D work orders under $8k don't need planner judgement."],

    limitations: [
    "No external best-practice reference was matched — this best practice is AI-generated.",
    "Recommended case volumes per path are not modelled.",
    "No baseline is available for Apr – Sep 2026 because criticality data was re-classified in March."],

    edges: [
    { id: "raised>routing", from: "raised", to: "routing", kind: "system", label: "Auto-classified" },
    { id: "routing>planner", from: "routing", to: "planner", kind: "system", label: "Criticality A/B" },
    { id: "routing>autorelease", from: "routing", to: "autorelease", kind: "system", label: "Criticality C/D" },
    { id: "planner>parts", from: "planner", to: "parts", kind: "approval", label: "Approved WO" },
    { id: "autorelease>parts", from: "autorelease", to: "parts", kind: "system", label: "Auto-released" },
    { id: "parts>schedule", from: "parts", to: "schedule", kind: "system", label: "Parts reserved" },
    { id: "schedule>complete", from: "schedule", to: "complete", kind: "system", label: "Mobile job card" }],

    changes: [
    {
      id: "chg-routing", type: "added", title: "Route work orders by risk",
      stepIds: ["routing"], edgeIds: ["raised>routing", "routing>planner"],
      current: "Every work order goes to the planner queue.",
      proposed: "The CMMS classifies work orders by asset criticality and estimated cost.",
      why: "Bottleneck — one planner queue handles all work regardless of risk.",
      evidence: "Planner workload distribution (CMMS).", evidenceStatus: "verified", basis: "ai",
      assumption: "Depends on criticality data that is currently 86% complete."
    },
    {
      id: "chg-auto", type: "added", title: "Auto-release low-risk work orders",
      stepIds: ["autorelease"], edgeIds: ["routing>autorelease", "autorelease>parts"],
      current: "Low-risk work waits in the same queue as critical work.",
      proposed: "C/D work orders under $8k release automatically, with weekly sampling.",
      why: "Redundant approval for low-risk work — 92% are approved unchanged.",
      evidence: "WO approval outcomes by criticality (CMMS).", evidenceStatus: "verified", basis: "ai"
    },
    {
      id: "chg-planner", type: "modified", title: "Narrow planner review to critical work",
      stepIds: ["planner"], edgeIds: ["raised>planner"],
      current: "Planner reviews all work orders.",
      proposed: "Planner reviews criticality A/B work orders only.",
      why: "Reduces queue pressure and key-person dependency on one planner.",
      evidence: "38% of WOs wait over 72h at planner review.", evidenceStatus: "verified", basis: "ai",
      impact: { measuredStepId: "planner", text: "Targets the measured planner-review wait" }
    },
    {
      id: "chg-signoff", type: "removed", title: "Remove the duplicate supervisor sign-off",
      stepIds: ["signoff"], edgeIds: ["parts>signoff", "signoff>schedule"],
      current: "A field supervisor signs a paper form after parts are reserved.",
      proposed: "Rely on the planner or auto-release decision; keep sign-off for permit-to-work jobs.",
      why: "Redundant approval — the sign-off repeats the planner decision.",
      evidence: "Sampled sign-off forms (scanned).", evidenceStatus: "inferred", basis: "ai",
      assumption: "Permit-to-work jobs keep supervisor sign-off under HSE-011.",
      impact: { measuredStepId: "signoff", text: "Removes a step with this measured average wait" }
    },
    {
      id: "chg-jobcard", type: "modified", title: "Replace paper job cards",
      stepIds: ["complete"], edgeIds: ["schedule>complete"],
      current: "Technicians receive and return paper job cards.",
      proposed: "Job cards are issued and closed in the mobile CMMS.",
      why: "Avoidable manual handoff; closure data is keyed in later.",
      evidence: "Closure lag between job end and CMMS entry.", evidenceStatus: "verified", basis: "ai"
    }]

  }
},
{
  id: "vendor-onboarding",
  name: "Vendor onboarding",
  department: "Finance",
  owner: "Elena Vasquez · Finance Controller",
  description: "New supplier requests through compliance screening, bank verification and activation in the vendor master.",
  stages: [
  { id: "intake", label: "Intake", stepIds: ["vreq", "docs"] },
  { id: "screening", label: "Screening", stepIds: ["screening", "bank"] },
  { id: "activation", label: "Activation", stepIds: ["master", "activate"] }],

  monthlyCases: [64, 70, 58, 72, 75, 69, 81, 77, 74, 86, 80, 83],
  sources: [2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3],
  trend: [0.95, 0.97, 1.1, 1.0, 0.98, 1.0, 1.02, 1.0, 0.99, 1.03, 1.01, 1.0],
  steps: [
  { id: "vreq", col: 0, row: 1, current: { label: "Supplier request", owner: "Procurement", system: "Email", share: 1, waitDays: 0.9, evidence: [{ label: "Request emails (metadata)", status: "inferred" }] } },
  { id: "docs", col: 1, row: 1, current: { label: "Document collection", owner: "Procurement", system: "Email + shared drive", share: 1, waitDays: 6.4, issue: "Documents are exchanged outside connected systems.", evidence: [{ label: "Shared-drive file events", status: "inferred" }] } },
  { id: "screening", col: 2, row: 0, current: { label: "Compliance screening", owner: "Compliance", system: "Screening tool", share: 1, waitDays: 1.4, evidence: [{ label: "Screening results", status: "verified" }] } },
  { id: "bank", col: 2, row: 2, current: { label: "Bank verification", owner: "Finance", system: "Call-back log", share: 1, waitDays: 2.0, evidence: [{ label: "Call-back log (partial)", status: "inferred" }] } },
  { id: "master", col: 3, row: 1, current: { label: "Vendor master entry", owner: "Finance", system: "ERP vendor master", share: 1, waitDays: 0.7, evidence: [{ label: "Vendor master change log", status: "verified" }] } },
  { id: "activate", col: 4, row: 1, current: { label: "Activation", owner: "Finance Controller", system: "ERP", share: 1, waitDays: 0.4, evidence: [{ label: "Activation events (ERP)", status: "verified" }] } }],

  currentEdges: [
  { id: "vreq>docs", from: "vreq", to: "docs", kind: "manual", label: "Email to supplier", share: 1 },
  { id: "docs>screening", from: "docs", to: "screening", kind: "handoff", label: "Docs forwarded", share: 1 },
  { id: "docs>bank", from: "docs", to: "bank", kind: "manual", label: "Bank letter forwarded", share: 1 },
  { id: "screening>master", from: "screening", to: "master", kind: "handoff", label: "Cleared", share: 1 },
  { id: "bank>master", from: "bank", to: "master", kind: "manual", label: "Verified by phone", share: 1 },
  { id: "master>activate", from: "master", to: "activate", kind: "approval", label: "Submitted for approval", share: 1 }],

  recommendation: null,
  unavailableReason:
  "Observational coverage for vendor onboarding is 58% — supplier documents are exchanged outside connected systems, so no recommendation has been generated. Connect the supplier portal or validate the steps manually to enable one."
}];
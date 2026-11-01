import type { OrgTeam, OrgWorkflow } from "../types/orgMap";

/** Illustrative organization — Meridian Energy is fictitious. Team ↔ workflow links are inferred from sample records. */
export const organization = {
  name: "Meridian Energy",
  subtitle: "Upstream North Basin"
};

export const orgTeams: OrgTeam[] = [
{ id: "hr", name: "Human Resources", lead: "HR Operations", headcount: 64, description: "Hiring, onboarding, workforce records and performance cycles." },
{ id: "finance", name: "Finance & Accounting", lead: "Elena Vasquez", headcount: 112, description: "Budgets, payables, vendor master data and financial controls." },
{ id: "procurement", name: "Procurement", lead: "Layla Haddad", headcount: 48, description: "Purchase requests, sourcing, supplier selection and purchase orders." },
{ id: "operations", name: "Operations", lead: "Thomas Reid", headcount: 640, description: "Field operations, maintenance planning and supply logistics." },
{ id: "production", name: "Production", lead: "Production Engineering", headcount: 380, description: "Production planning, volume allocation and reporting." },
{ id: "sales", name: "Sales & Marketing", lead: "Commercial team", headcount: 72, description: "Offtake contracts, customer accounts and market activity." },
{ id: "it", name: "IT & Engineering", lead: "Priya Raman", headcount: 156, description: "Enterprise systems, data platforms and access management." },
{ id: "legal", name: "Legal & Compliance", lead: "Compliance Office", headcount: 28, description: "Contracts, regulatory filings, policy and assurance." },
{ id: "support", name: "Customer Support", lead: "Customer Service Desk", headcount: 41, description: "Customer enquiries, issues and service requests." },
{ id: "exec", name: "Executive Management", lead: "Executive Committee", headcount: 9, description: "Strategic approvals, budgets and escalations." }];


export const orgWorkflows: OrgWorkflow[] = [
{
  id: "recruitment", name: "Employee Recruitment & Onboarding", owner: "hr", ownerEvidence: "verified",
  participants: [
  { team: "exec", evidence: "verified", role: "Approves new headcount" },
  { team: "it", evidence: "verified", role: "Provisions accounts and equipment" },
  { team: "finance", evidence: "inferred", role: "Confirms budget for the role" },
  { team: "legal", evidence: "inferred", role: "Reviews contracts for specialist hires" }],

  description: "From headcount request to a new starter with working access.",
  volume: "38 hires / mo", coverage: 54,
  stages: ["Headcount request", "Sourcing", "Interviews", "Offer", "Onboarding & access"],
  dependsOn: ["it-access", "budget-planning"],
  note: "The HR directory connection is currently failing, so coverage relies on yesterday's snapshot."
},
{
  id: "performance", name: "Employee Performance Management", owner: "hr", ownerEvidence: "inferred",
  participants: [
  { team: "operations", evidence: "inferred", role: "Runs reviews for field teams" },
  { team: "exec", evidence: "inferred", role: "Calibrates ratings" }],

  description: "Review cycles, calibration and development plans.",
  volume: null, coverage: 31,
  stages: ["Goal setting", "Mid-year check-in", "Year-end review", "Calibration"],
  dependsOn: [],
  note: "Individual performance data is outside the authorized scope. Only cycle timing metadata is analysed."
},
{
  id: "invoice-payments", name: "Invoice Processing & Payments", owner: "finance", ownerEvidence: "verified",
  participants: [
  { team: "procurement", evidence: "verified", role: "Resolves PO and receipt mismatches" },
  { team: "it", evidence: "verified", role: "Runs invoice capture and matching" },
  { team: "legal", evidence: "inferred", role: "Reviews disputed supplier terms" }],

  description: "Invoice capture, three-way match, exceptions and payment runs.",
  volume: "6,900 invoices / mo", coverage: 88,
  stages: ["Invoice capture", "3-way match", "Exception handling", "Payment run"],
  dependsOn: ["procurement-requests", "vendor-onboarding"]
},
{
  id: "budget-planning", name: "Budget Planning & Approvals", owner: "finance", ownerEvidence: "verified",
  participants: [
  { team: "exec", evidence: "verified", role: "Approves the annual budget" },
  { team: "operations", evidence: "verified", role: "Submits operating budgets" },
  { team: "production", evidence: "inferred", role: "Submits capital requests" },
  { team: "procurement", evidence: "inferred", role: "Provides spend forecasts" },
  { team: "hr", evidence: "inferred", role: "Submits headcount plans" }],

  description: "Annual planning, reforecasts and in-year budget approvals.",
  volume: "2 cycles / yr", coverage: 72,
  stages: ["Guidelines", "Submissions", "Consolidation", "Review", "Approval"],
  dependsOn: []
},
{
  id: "vendor-onboarding", name: "Vendor Onboarding & Supplier Management", owner: "finance", ownerEvidence: "verified",
  participants: [
  { team: "procurement", evidence: "verified", role: "Requests and qualifies new vendors" },
  { team: "legal", evidence: "inferred", role: "Runs sanctions and contract checks" },
  { team: "it", evidence: "inferred", role: "Maintains the vendor master" }],

  description: "Vendor qualification, master-data setup and bank-detail changes.",
  volume: "120 vendors / mo", coverage: 61,
  stages: ["Vendor request", "Qualification", "Compliance checks", "Master-data setup"],
  dependsOn: [],
  processId: "vendor-onboarding"
},
{
  id: "procurement-requests", name: "Procurement & Purchase Requests", owner: "procurement", ownerEvidence: "verified",
  participants: [
  { team: "finance", evidence: "verified", role: "Reviews budget for requests over $10k" },
  { team: "operations", evidence: "verified", role: "Raises most equipment requests" },
  { team: "exec", evidence: "verified", role: "Approves requests over $250k" },
  { team: "production", evidence: "inferred", role: "Raises requests for production equipment" }],

  description: "From purchase request through approval and supplier selection to goods receipt.",
  volume: "4,800 requests / mo", coverage: 91,
  stages: ["Request", "Review", "Approval", "Supplier selection", "Purchase order", "Receipt"],
  dependsOn: ["budget-planning", "vendor-onboarding"],
  processId: "equipment-purchasing"
},
{
  id: "inventory-supply", name: "Inventory & Supply Chain Management", owner: "operations", ownerEvidence: "verified",
  participants: [
  { team: "procurement", evidence: "verified", role: "Replenishes stock" },
  { team: "production", evidence: "verified", role: "Consumes spares and materials" },
  { team: "finance", evidence: "inferred", role: "Values stock at period end" }],

  description: "Stock levels, warehouse movements and replenishment.",
  volume: "18,400 movements / mo", coverage: 79,
  stages: ["Demand signal", "Replenishment", "Receipt", "Issue to site"],
  dependsOn: ["procurement-requests"]
},
{
  id: "maintenance", name: "Maintenance & Asset Management", owner: "operations", ownerEvidence: "verified",
  participants: [
  { team: "production", evidence: "verified", role: "Raises equipment issues" },
  { team: "procurement", evidence: "verified", role: "Sources spare parts" },
  { team: "finance", evidence: "inferred", role: "Approves high-value work orders" },
  { team: "it", evidence: "inferred", role: "Supports the maintenance system" }],

  description: "Work orders from fault report through planning, parts and completion.",
  volume: "1,650 work orders / mo", coverage: 84,
  stages: ["Raise", "Route", "Plan", "Parts", "Schedule", "Complete"],
  dependsOn: ["inventory-supply"],
  processId: "maintenance-work-order"
},
{
  id: "production", name: "Product Development & Production", owner: "production", ownerEvidence: "verified",
  participants: [
  { team: "operations", evidence: "verified", role: "Operates field assets" },
  { team: "it", evidence: "inferred", role: "Runs the allocation spreadsheet" },
  { team: "legal", evidence: "inferred", role: "Files regulatory production reports" }],

  description: "Production planning, volume allocation and regulatory reporting.",
  volume: "Daily reporting", coverage: 66,
  stages: ["Plan", "Produce", "Allocate volumes", "Report"],
  dependsOn: ["maintenance", "inventory-supply"]
},
{
  id: "sales-contracts", name: "Sales & Contract Management", owner: "sales", ownerEvidence: "verified",
  participants: [
  { team: "legal", evidence: "verified", role: "Drafts and approves contracts" },
  { team: "finance", evidence: "verified", role: "Runs credit checks and invoicing" },
  { team: "exec", evidence: "inferred", role: "Approves strategic contracts" },
  { team: "production", evidence: "inferred", role: "Confirms available volumes" }],

  description: "Offtake agreements from negotiation through signature and renewal.",
  volume: "22 contracts / mo", coverage: 58,
  stages: ["Opportunity", "Negotiation", "Legal review", "Approval", "Signature"],
  dependsOn: ["production"]
},
{
  id: "it-access", name: "IT Requests & Access Management", owner: "it", ownerEvidence: "verified",
  participants: [
  { team: "hr", evidence: "verified", role: "Triggers joiner and leaver changes" },
  { team: "legal", evidence: "inferred", role: "Reviews access to restricted data" },
  { team: "support", evidence: "inferred", role: "Routes customer-system tickets" }],

  description: "Service requests, access approvals and periodic access reviews.",
  volume: "3,100 tickets / mo", coverage: 82,
  stages: ["Request", "Approval", "Provisioning", "Access review"],
  dependsOn: []
},
{
  id: "quality-compliance", name: "Quality Assurance & Compliance", owner: "legal", ownerEvidence: "verified",
  participants: [
  { team: "production", evidence: "verified", role: "Provides quality and HSE records" },
  { team: "operations", evidence: "verified", role: "Closes permits and findings" },
  { team: "exec", evidence: "inferred", role: "Signs off assurance reports" },
  { team: "it", evidence: "inferred", role: "Supplies audit logs" }],

  description: "Audits, permit-to-work assurance, findings and regulatory submissions.",
  volume: "140 findings / mo", coverage: 69,
  stages: ["Plan audit", "Collect evidence", "Findings", "Remediation", "Sign-off"],
  dependsOn: ["production"]
},
{
  id: "customer-support", name: "Customer Support & Issue Resolution", owner: "support", ownerEvidence: "inferred",
  participants: [
  { team: "sales", evidence: "verified", role: "Owns the customer relationship" },
  { team: "operations", evidence: "inferred", role: "Resolves delivery issues" },
  { team: "it", evidence: "inferred", role: "Fixes customer-portal problems" }],

  description: "Customer enquiries and issues from intake to resolution.",
  volume: null, coverage: 42,
  stages: ["Intake", "Triage", "Resolution", "Follow-up"],
  dependsOn: ["sales-contracts"],
  note: "No ticketing system is connected yet. Relationships are inferred from email metadata only."
}];
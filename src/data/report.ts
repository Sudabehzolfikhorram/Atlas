export const executiveSummary =
"North Basin's core processes are operating, but approval-heavy workflows in Procure-to-Pay and Maintenance are the main drag on performance. Evidence for these findings is strong (ERP and CMMS records). Governance foundations — data ownership and lineage — are incomplete, which limits confidence in some cross-department conclusions. Four decisions this month would address the majority of measured delay.";

export const maturity = [
{ process: "HSE Permit-to-Work", level: 4, coverage: 96 },
{ process: "Finance Close", level: 3, coverage: 71 },
{ process: "Production Reporting", level: 3, coverage: 64 },
{ process: "Maintenance Work Order", level: 2, coverage: 88 },
{ process: "Procure-to-Pay", level: 2, coverage: 94 }];


export const maturityLabels = ["", "Initial", "Repeatable", "Defined", "Managed", "Optimized"];

export const governanceStatus = [
{ label: "Data ownership coverage", value: 62, target: 80 },
{ label: "Critical lineage documented", value: 48, target: 90 },
{ label: "Access reviews current", value: 83, target: 95 },
{ label: "Controls verified", value: 53, target: 85 }];


export const verifiedFindings = [
"Tier-2 approval accounts for 62% of P2P elapsed time (41k ERP records).",
"38% of corrective WOs wait >72h at Planner Review (CMMS).",
"312 vendor records conflict between ERP and procurement suite.",
"Process ownership documented for P2P, Maintenance and HSE.",
"Production filing depends on an undocumented spreadsheet transform."];


export const evidenceGaps = [
"Finance Close observational coverage only 71% — manual steps not logged.",
"Field Ops → Finance accrual dependency inferred, not validated.",
"Asset Register ownership missing; criticality 14% incomplete.",
"HR directory sync failed — role mappings from yesterday's snapshot.",
"Possible off-system approvals cannot be observed in ERP."];


export const priorityActions = [
{ text: "Validate the inferred accrual dependency", owner: "Data Governance" },
{ text: "Assign Asset Register owner", owner: "VP Op Excellence" },
{ text: "Resolve Tier-2 approval bottleneck", owner: "Operations Director" },
{ text: "Strengthen access control on allocation spreadsheet", owner: "Enterprise Data" },
{ text: "Approve & pilot maintenance fast-track", owner: "Operations Director" }];


export const risks = [
{ id: "R1", label: "Regulatory misstatement (allocation)", impact: 3, likelihood: 2 },
{ id: "R2", label: "Deferred production from WO backlog", impact: 3, likelihood: 3 },
{ id: "R3", label: "Payment to fraudulent bank details", impact: 3, likelihood: 1 },
{ id: "R4", label: "Procurement delays idle crews", impact: 2, likelihood: 3 },
{ id: "R5", label: "Undocumented accrual inputs", impact: 2, likelihood: 2 },
{ id: "R6", label: "Key-person dependency (planner)", impact: 2, likelihood: 1 }];
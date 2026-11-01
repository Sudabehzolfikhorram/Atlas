import type { CrossLink, MappingScope, StageFinding, StrategyLayer, Swimlane } from "../types/processMapping";

export const mappingScopes: MappingScope[] = [
{ id: "pof", label: "Procurement · Operations · Finance", meta: "3 departments · 3 workflows · Meridian Energy", laneIds: ["procurement", "operations", "finance"] },
{ id: "po", label: "Procurement · Operations", meta: "2 departments · 2 workflows · Meridian Energy", laneIds: ["procurement", "operations"] },
{ id: "of", label: "Operations · Finance", meta: "2 departments · 2 workflows · Meridian Energy", laneIds: ["operations", "finance"] }];


export const swimlanes: Swimlane[] = [
{
  id: "procurement",
  name: "Procurement",
  workflow: "Purchase requests",
  steps: [
  { id: "p-req", name: "Request", wait: 0.2, work: 0.4, owner: "Requesting engineer" },
  { id: "p-erp", name: "ERP workflow", wait: 0.4, work: 1.2, owner: "ERP system (SAP)" },
  { id: "p-gate", name: "Control gate", wait: 8.4, work: 0.6, owner: "Procurement Manager" },
  { id: "p-out", name: "Outcome", wait: 0.1, work: 0.3, owner: "Buyer" }]

},
{
  id: "operations",
  name: "Operations",
  workflow: "Production",
  steps: [
  { id: "o-plan", name: "Production planning", wait: 0.8, work: 1.8, owner: "Production Planner" },
  { id: "o-prod", name: "Production", wait: 0.6, work: 3.4, owner: "Field Operations" },
  { id: "o-qc", name: "Quality control", wait: 3.2, work: 0.8, owner: "QC Lead" },
  { id: "o-out", name: "Operational outputs", wait: 0.3, work: 0.6, owner: "Operations Supervisor" }]

},
{
  id: "finance",
  name: "Finance",
  workflow: "Financial data",
  steps: [
  { id: "f-col", name: "Data Collection", wait: 0.2, work: 0.5, owner: "Finance Analyst" },
  { id: "f-proc", name: "Data Processing", wait: 1.8, work: 1.6, owner: "Finance Systems" },
  { id: "f-gate", name: "Control gate", wait: 0.8, work: 0.4, owner: "Financial Controller" },
  { id: "f-rep", name: "Reports", wait: 0.2, work: 0.3, owner: "Reporting Lead" }]

}];


export const crossLinks: CrossLink[] = [
{ afterLane: "procurement", label: "Purchase orders → Production planning" },
{ afterLane: "operations", label: "Operational outputs → Financial data" }];


export const stageFindings: Record<string, StageFinding> = {
  "p-gate": { severity: "High", title: "Shadow approvals", note: "Chat approval. Review the expected control and the observed path before taking action.", evidence: "Access logs · illustrative" },
  "o-qc": { severity: "Medium", title: "Manual re-entry", note: "Quality results are re-keyed from lab sheets before release. Confirm whether MES integration is in scope.", evidence: "MES batch records · illustrative" },
  "f-proc": { severity: "Medium", title: "Spreadsheet transformation", note: "Allocation factors are applied in a spreadsheet before reporting, with no documented lineage.", evidence: "Document repository · illustrative" },
  "p-erp": { severity: "Low", title: "Duplicate data entry", note: "Request details are typed again into ERP from email. Low impact on wait time.", evidence: "ERP change log · illustrative" }
};

export const strategyLayers: StrategyLayer[] = [
{ id: "01", name: "Strategy", basis: "inferred", workflow: "Reduce cost-to-serve across upstream operations" },
{ id: "02", name: "Strategy execution", basis: "inferred", workflow: "Procurement and production programmes for North Basin" },
{ id: "03", name: "Detailed processes", basis: "inferred", workflow: "Purchase requests · Production · Financial data" },
{ id: "04", name: "Outcomes", basis: "observed", workflow: "Approved POs, production volumes and monthly reports" }];


export const formalPath = ["Request", "ERP workflow", "Control gate"];
export const hiddenPath = ["Excel rework", "Chat approval", "Manual upload"];
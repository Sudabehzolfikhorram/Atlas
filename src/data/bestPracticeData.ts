import type { DataControl, DataFix, DataReroute } from "../types/bestPracticeData";

/**
 * Best-practice target for the supply chain data product graph (Mapping → Data).
 * The as-is side is the organization's current graph; these entries describe how the target differs.
 * Illustrative sample data for the fictitious Meridian Energy.
 */

export const dataFixes: DataFix[] = [
{ nodeId: "src-erp", fix: "Supplier bank details reconciled nightly against the vendor portal; changes need dual approval." },
{ nodeId: "src-mes", fix: "Quality results captured at source in the MES — no manual re-entry." },
{ nodeId: "src-iot", status: "completed", fix: "Historian access uses a managed service credential with automatic rotation and freshness alerts." },
{ nodeId: "src-sup", status: "completed", fix: "Supplier lead times refreshed at least every 30 days under a data contract." },
{ nodeId: "src-files", label: "Governed document intake", subtitle: "Validated uploads only", fix: "Uploads use named accounts and go through the standard collection and validation pipeline." },
{ nodeId: "pl-collect", fix: "A run only starts when all 9 source feeds have landed; a missing feed blocks the run and alerts the owner." },
{ nodeId: "pl-clean", fix: "Material code mapping maintained by data stewards; unmapped codes go to a review queue." },
{ nodeId: "pl-quality", fix: "Completeness gate at 95% blocks downstream use, and no source can skip validation." },
{ nodeId: "pl-eval", fix: "Spare-part models are only released when MAPE is under the 15% threshold." },
{ nodeId: "out-forecast", fix: "Drift monitoring per SKU group triggers retraining automatically." },
{ nodeId: "ds-auto", status: "running", fix: "Auto-release limited to documented, approved thresholds." },
{ nodeId: "fd-gov", fix: "Named owner and steward assigned for supplier master data." }];


export const dataControls: DataControl[] = [
{ id: "bp-contract", x: 300, y: 885, icon: "listChecks", label: "Data contracts", subtitle: "Schema, SLA & freshness per feed", summary: "Each source feed has an agreed schema, delivery SLA and freshness rule, monitored automatically.", controls: ["pl-collect", "src-iot", "src-sup"] },
{ id: "bp-gate", x: 515, y: 885, icon: "shieldCheck", label: "Automated quality gate", subtitle: "Blocks failing data downstream", summary: "Stops tables that fail completeness or accuracy checks from reaching models and reports.", controls: ["pl-quality", "src-files"] },
{ id: "bp-steward", x: 730, y: 885, icon: "users", label: "Master data stewardship", subtitle: "Named owners, review cadence", summary: "Named stewards own supplier and material master data and review it on a fixed cadence.", controls: ["pl-clean", "fd-gov", "src-erp"] },
{ id: "bp-approval", x: 945, y: 885, icon: "badgeCheck", label: "Decision approval thresholds", subtitle: "Limits for auto-release", summary: "Documents the value and risk limits within which replenishment orders can be released automatically.", controls: ["ds-auto"] }];


export const dataReroutes: DataReroute[] = [
{ removeEdgeId: "e-src-files-pl-quality", source: "src-files", target: "pl-collect", label: "Validated intake", reason: "Documents enter through data collection instead of skipping straight to validation." }];
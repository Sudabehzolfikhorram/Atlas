import type { AreaNode, EdgeKind, GraphNode, SupplyCategory, SupplyEdge, SupplyIconKey, SupplyNode, SupplyNodeDetails } from "../types/supplyGraph";

/**
 * Supply chain data product modeling graph — recreated from the "Graph22" reference.
 * All values are illustrative sample data for the fictitious Meridian Energy.
 */

function node(id: string, x: number, y: number, category: SupplyCategory, icon: SupplyIconKey, label: string, subtitle: string, weight: number, details: SupplyNodeDetails = {}): SupplyNode {
  return { id, type: "supply", position: { x, y }, data: { label, subtitle, icon, weight, category, details } };
}

function area(id: string, x: number, y: number, width: number, height: number, label: string): AreaNode {
  return { id, type: "area", position: { x, y }, data: { label }, style: { width, height, pointerEvents: "none" }, draggable: false, selectable: false, focusable: false, deletable: false, zIndex: -1 };
}

function edge(source: string, target: string, label: string, weight: number, kind: EdgeKind = "flow", sourceHandle = "r", targetHandle = "l"): SupplyEdge {
  return { id: `e-${source}-${target}`, source, target, sourceHandle, targetHandle, data: { label, weight, kind } };
}

const areas: AreaNode[] = [
area("area-sources", 0, 50, 210, 930, "Data sources & inputs"),
area("area-pipeline", 280, 50, 1010, 360, "Supply chain data product modeling flow"),
area("area-outputs", 1340, 50, 200, 520, "Business outputs"),
area("area-downstream", 1590, 40, 200, 620, "Downstream consumers & operations"),
area("area-foundation", 280, 730, 1510, 140, "Foundation & enablers")];


const sources: SupplyNode[] = [
node("src-erp", 30, 100, "source", "database", "ERP data", "Sales, purchasing, BOM, inventory", 0.58, {
  dataSource: "SAP S/4HANA · MM/SD tables (sample)", summary: "Transactional master and movement data: purchase orders, sales orders, bills of materials and stock levels.", duration: "14 min nightly extract", status: "completed",
  redFlags: ["312 supplier records with bank details that differ from the vendor portal"], inputs: ["Purchase orders", "Sales orders", "Material master"], outputs: ["ERP extract (Parquet)"], timestamp: "2026-10-16 02:14"
}),
node("src-wms", 30, 192, "source", "warehouse", "WMS", "Stock, location", 0.58, {
  dataSource: "Warehouse management system · inventory API (sample)", summary: "Bin-level stock positions and warehouse movements for spare parts and consumables.", duration: "6 min hourly sync", status: "completed",
  inputs: ["Bin transactions", "Cycle counts"], outputs: ["Stock-by-location feed"], timestamp: "2026-10-16 09:00"
}),
node("src-tms", 30, 284, "source", "truck", "TMS", "ETA / POD, shipping", 0.58, {
  dataSource: "Transport management system · shipment events (sample)", summary: "Shipment status, estimated arrival and proof-of-delivery events for inbound materials.", status: "running",
  inputs: ["Carrier status messages"], outputs: ["Shipment ETA feed"], timestamp: "2026-10-16 09:38"
}),
node("src-mes", 30, 376, "source", "factory", "MES", "Production, quality", 0.58, {
  dataSource: "Manufacturing execution system · batch records (sample)", summary: "Production batches, quality results and downtime events from field operations.", duration: "9 min", status: "completed",
  redFlags: ["Quality results re-entered manually for 14% of batches"], inputs: ["Batch records", "QC results"], outputs: ["Production & quality feed"], timestamp: "2026-10-16 08:55"
}),
node("src-fin", 30, 468, "source", "dollar", "Financial data", "Cost, budget", 0.58, {
  dataSource: "Finance data mart · cost centres (sample)", summary: "Actual cost, budget and accrual data used to value inventory and service levels.", duration: "11 min", status: "completed",
  inputs: ["GL postings", "Budget plan"], outputs: ["Cost & budget feed"], timestamp: "2026-10-16 03:05"
}),
node("src-iot", 30, 560, "source", "radio", "IoT / Sensors", "Telemetry, condition", 0.58, {
  dataSource: "Process historian · tag stream (sample)", summary: "Equipment condition and consumption telemetry used to anticipate parts demand.", status: "failed",
  redFlags: ["Sync failed at 07:40 — historian access token expired", "No data received for 2 hours"], inputs: ["Sensor tags"], outputs: ["Condition events"], timestamp: "2026-10-16 07:40"
}),
node("src-sup", 30, 652, "source", "users", "Suppliers & partners", "Lead times, capacity", 0.58, {
  dataSource: "Supplier portal · EDI 855/856 (sample)", summary: "Supplier order confirmations, lead times and capacity signals.", status: "pending",
  redFlags: ["Lead times for 23 suppliers not updated in 90+ days"], inputs: ["Order confirmations", "Advance shipping notices"], outputs: ["Supplier performance feed"], timestamp: "2026-10-15 18:20"
}),
node("src-ext", 30, 744, "source", "globe", "External data", "Market, weather, prices", 0.58, {
  dataSource: "Commodity price & weather APIs (sample)", summary: "Market prices and weather used as forecast drivers.", duration: "3 min", status: "completed",
  inputs: ["Brent price index", "Weather forecast"], outputs: ["External drivers table"], timestamp: "2026-10-16 06:00"
}),
node("src-files", 30, 836, "source", "file", "Files & documents", "Excel, CSV, PDF", 0.58, {
  dataSource: "SharePoint · Supply planning folder (sample)", summary: "Manually maintained planning spreadsheets and supplier documents.", status: "completed",
  redFlags: ["Planning spreadsheet edited by a shared account", "Manual upload bypasses validation"], inputs: ["Excel plans", "CSV exports", "PDF contracts"], outputs: ["Document extracts"], timestamp: "2026-10-15 16:47"
})];


const pipeline: SupplyNode[] = [
node("pl-goals", 300, 110, "pipeline", "target", "Define project goals", "KPI, scope, stakeholders", 0.54, {
  dataSource: "Project charter v2 (sample)", summary: "Agrees the business problem, target KPIs (service level, inventory turns) and stakeholders.", duration: "2 weeks", status: "completed",
  inputs: ["Business problem", "Stakeholder interviews"], outputs: ["KPI tree", "Scope statement"], timestamp: "2026-09-02 10:00"
}),
node("pl-req", 465, 110, "pipeline", "listChecks", "Requirements analysis", "Process, priority", 0.59, {
  dataSource: "Requirements workshop notes (sample)", summary: "Turns goals into prioritised data, process and functional requirements.", duration: "1 week", status: "completed",
  inputs: ["KPI tree"], outputs: ["Prioritised requirements"], timestamp: "2026-09-12 15:30"
}),
node("pl-collect", 630, 110, "pipeline", "layers", "Data collection", "Sources, connection, lake", 0.98, {
  dataSource: "Data lake · raw zone (sample)", summary: "Lands all source feeds in the raw zone of the data lake with lineage tags.", duration: "22 min per run", status: "running",
  redFlags: ["IoT feed missing from the current run"], inputs: ["9 source feeds"], outputs: ["Raw zone tables"], timestamp: "2026-10-16 09:40"
}),
node("pl-etl", 795, 110, "pipeline", "shuffle", "ETL / ELT", "Extract, transform, load", 0.59, {
  dataSource: "dbt project · supply_chain (sample)", summary: "Standardises, joins and loads source data into curated models.", duration: "18 min", status: "running",
  inputs: ["Raw zone tables"], outputs: ["Curated tables"], timestamp: "2026-10-16 09:41"
}),
node("pl-schema", 960, 110, "pipeline", "boxes", "Data model / Schema", "Dimensions, relations, ER", 0.59, {
  dataSource: "Supply chain star schema v3 (sample)", summary: "Defines entities (material, location, supplier, order) and their relationships.", status: "completed",
  inputs: ["Curated tables"], outputs: ["Fact & dimension tables"], timestamp: "2026-10-10 11:00"
}),
node("pl-clean", 1125, 110, "pipeline", "eraser", "Data cleansing", "Standardise, deduplicate", 0.59, {
  dataSource: "Cleansing rules library (sample)", summary: "Removes duplicates, fixes units and standardises supplier and material codes.", duration: "7 min", status: "completed",
  redFlags: ["4.2% of material codes unmapped"], inputs: ["Fact & dimension tables"], outputs: ["Clean model tables"], timestamp: "2026-10-16 09:12"
}),
node("pl-quality", 300, 300, "pipeline", "shieldCheck", "Data quality & validation", "Completeness, accuracy, profiling", 0.59, {
  dataSource: "Data validation suite (sample)", summary: "Profiles each table and blocks downstream use when checks fail.", duration: "5 min", status: "completed",
  redFlags: ["Completeness 87% — below the 95% target", "Files source skipped validation"], inputs: ["Clean model tables", "Document extracts"], outputs: ["Validated tables", "Quality report"], timestamp: "2026-10-16 09:18"
}),
node("pl-eda", 465, 300, "pipeline", "search", "Exploratory analysis", "Patterns, correlation, seasonality", 0.59, {
  dataSource: "Analysis notebooks (sample)", summary: "Finds demand patterns, seasonality and correlations between drivers.", status: "completed",
  inputs: ["Validated tables", "External drivers table"], outputs: ["Driver shortlist"], timestamp: "2026-10-08 14:00"
}),
node("pl-feature", 630, 300, "pipeline", "wrench", "Feature engineering", "Feature store, selection", 0.59, {
  dataSource: "Feature store · supply_v2 (sample)", summary: "Builds and selects features such as lead-time variability and consumption rates.", duration: "12 min", status: "completed",
  inputs: ["Driver shortlist", "Validated tables"], outputs: ["Feature set v2"], timestamp: "2026-10-15 22:10"
}),
node("pl-ml", 795, 300, "pipeline", "brain", "ML modelling", "Algorithms, training", 0.59, {
  dataSource: "Experiment tracking · run 41 (sample)", summary: "Trains demand and lead-time models on the feature set.", duration: "1 h 46 min", status: "completed",
  inputs: ["Feature set v2"], outputs: ["Candidate models"], timestamp: "2026-10-15 23:58"
}),
node("pl-eval", 960, 300, "pipeline", "gauge", "Model evaluation", "RMSE, MAPE, backtest", 0.59, {
  dataSource: "Backtest report · October (sample)", summary: "Backtests candidate models and compares their error with the current forecast.", duration: "24 min", status: "completed",
  redFlags: ["MAPE 18.4% on spare parts — above the 15% threshold"], inputs: ["Candidate models"], outputs: ["Selected model", "Evaluation report"], timestamp: "2026-10-16 00:30"
}),
node("pl-deploy", 1125, 300, "pipeline", "cloud", "Deployment / API / CI-CD", "Microservices, monitoring, versioning", 0.98, {
  dataSource: "Container platform · supply-forecast service (sample)", summary: "Packages the selected model as a versioned, monitored service.", duration: "9 min pipeline", status: "running",
  inputs: ["Selected model"], outputs: ["Forecast API v1.4", "Batch scores"], timestamp: "2026-10-16 09:44"
})];


const twin = node("twin", 795, -80, "twin", "copy", "Digital Twin", "What-if simulation", 0.57, {
  summary: "Simulates the supply network to test what-if scenarios before decisions are made.", status: "pending",
  inputs: ["Fact & dimension tables"], outputs: ["Simulated scenarios"]
});

const outputs: SupplyNode[] = [
node("out-forecast", 1365, 100, "output", "trendingUp", "Forecast", "Demand, sales, inventory", 0.57, {
  dataSource: "Forecast API v1.4 (sample)", summary: "Weekly demand and inventory forecast by material and location.", duration: "4 min", status: "completed",
  redFlags: ["Forecast drift detected for 37 spare-part SKUs"], inputs: ["Batch scores"], outputs: ["Weekly forecast"], timestamp: "2026-10-16 09:50"
}),
node("out-opt", 1365, 192, "output", "sliders", "Optimizer", "Allocation, recommendations", 0.57, {
  dataSource: "Optimizer service (sample)", summary: "Recommends stock allocation and reorder quantities.", duration: "6 min", status: "completed",
  inputs: ["Weekly forecast"], outputs: ["Reorder recommendations"], timestamp: "2026-10-16 09:56"
}),
node("out-scen", 1365, 284, "output", "gitCompare", "Scenario Planner", "Scenarios & comparison", 0.57, {
  summary: "Compares planning scenarios side by side.", status: "pending", inputs: ["Forecast API v1.4"], outputs: ["Scenario comparison"]
}),
node("out-dash", 1365, 376, "output", "dashboard", "Dashboard", "KPI & reporting", 0.57, {
  dataSource: "BI workspace · Supply KPIs (sample)", summary: "Shows service level, inventory turns and forecast accuracy.", duration: "2 min refresh", status: "completed",
  inputs: ["Forecast API v1.4", "Quality report"], outputs: ["KPI dashboard"], timestamp: "2026-10-16 10:00"
}),
node("out-api", 1365, 468, "output", "code", "API / Data Service", "SDK & models", 0.57, {
  dataSource: "API gateway (sample)", summary: "Exposes forecasts and features to other systems through an SDK.", status: "running",
  inputs: ["Forecast API v1.4"], outputs: ["REST endpoints"], timestamp: "2026-10-16 09:44"
})];


const downstream: SupplyNode[] = [
node("ds-ops", 1615, 90, "downstream", "package", "Supply chain operations", "Planning, buying", 0.52, {
  summary: "Planners and buyers act on forecasts and reorder recommendations.", status: "completed", inputs: ["Reorder recommendations", "Simulated scenarios"], outputs: ["Purchase requests"]
}),
node("ds-auto", 1615, 182, "downstream", "bot", "Decision automation", "Auto-release rules", 0.52, {
  summary: "Auto-releases low-risk replenishment orders within approved limits.", status: "pending", redFlags: ["No documented approval threshold for auto-release"], inputs: ["Reorder recommendations"]
}),
node("ds-report", 1615, 274, "downstream", "presentation", "Dashboards & reporting", "Management reporting", 0.52, {
  summary: "Management reporting on supply performance.", status: "completed", inputs: ["KPI dashboard"], outputs: ["Monthly supply report"]
}),
node("ds-users", 1615, 366, "downstream", "monitor", "Users & systems", "ERP, maintenance", 0.52, {
  summary: "ERP and maintenance systems consume forecasts through the API.", status: "completed", inputs: ["REST endpoints"]
}),
node("ds-partners", 1615, 458, "downstream", "handshake", "Partners & customers", "Portal, data sharing", 0.52, {
  summary: "Selected suppliers receive forecast signals through the supplier portal.", status: "pending", inputs: ["REST endpoints"]
}),
node("ds-support", 1615, 550, "downstream", "headphones", "Monitoring & support", "Monitoring, data, service", 0.52, {
  summary: "Service desk and on-call monitoring of the data product.", status: "running", inputs: ["Service health metrics"]
})];


const foundationItems: [string, SupplyIconKey, string, string, string, string[]?][] = [
["fd-gov", "landmark", "Data governance", "Ownership, policies", "Defines ownership, policies and stewardship for supply data.", ["No named owner for supplier master data"]],
["fd-sec", "lock", "Security & privacy", "Access, encryption", "Controls access to sensitive commercial and personal data."],
["fd-arch", "server", "Architecture & infrastructure", "Cloud, network", "Platform, storage and compute the data product runs on."],
["fd-mgmt", "folderCog", "Data management", "Catalog, lifecycle", "Cataloguing, retention and lifecycle of data assets."],
["fd-obs", "eye", "Observability", "Logs, metrics, alerts", "Monitors pipelines and services for failures and drift."],
["fd-devops", "infinity", "DevOps / MLOps", "CI/CD, model registry", "Automates testing, release and model versioning."],
["fd-dq", "badgeCheck", "Data quality", "Rules, monitoring", "Shared data-quality rules and monitoring across sources."]];


const foundation: SupplyNode[] = foundationItems.map(([id, icon, label, subtitle, summary, redFlags], i) =>
node(id, 300 + i * 215, 775, "foundation", icon, label, subtitle, 0.57, { summary, status: "completed", redFlags })
);

export const defaultGraphNodes: GraphNode[] = [...areas, twin, ...sources, ...pipeline, ...outputs, ...downstream, ...foundation];

const chain = ["pl-goals", "pl-req", "pl-collect", "pl-etl", "pl-schema", "pl-clean"];
const chain2 = ["pl-quality", "pl-eda", "pl-feature", "pl-ml", "pl-eval", "pl-deploy"];

export const defaultGraphEdges: SupplyEdge[] = [
...["src-erp", "src-wms", "src-tms", "src-mes", "src-fin", "src-iot", "src-sup", "src-ext"].map((s) => edge(s, "pl-collect", "Input data", 0.9)),
edge("src-files", "pl-quality", "Input data", 0.9),
...chain.slice(1).map((t, i) => edge(chain[i], t, "Process flow", 0.9)),
edge("pl-clean", "pl-quality", "Process flow", 0.9, "flow", "b", "t"),
...chain2.slice(1).map((t, i) => edge(chain2[i], t, "Process flow", 0.9)),
edge("pl-schema", "twin", "Model data", 0.6),
edge("twin", "ds-ops", "What-if scenarios", 0.9),
...["out-forecast", "out-opt", "out-scen", "out-dash", "out-api"].map((t) => edge("pl-deploy", t, "Model output", 0.9)),
edge("out-forecast", "ds-ops", "Operational consumer", 0.9),
edge("out-opt", "ds-auto", "Operational consumer", 0.9),
edge("out-scen", "ds-ops", "Operational consumer", 0.7),
edge("out-dash", "ds-report", "Operational consumer", 0.9),
edge("out-api", "ds-users", "Operational consumer", 0.9),
edge("out-api", "ds-partners", "Operational consumer", 0.7),
edge("pl-deploy", "ds-support", "Service health", 0.6),
...foundation.map((f) => edge("pl-deploy", f.id, "Enabler", 0.48, "dependency", "b", "t"))];
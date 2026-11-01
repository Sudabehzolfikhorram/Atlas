export const healthIndex = { value: 68, previous: 64, label: "Process Health Index" };

export const conformanceStrip = {
  observed: 64,
  target: 85,
  message: "Operations deviate from documented workflows",
  gap: 21
};

export const overviewStats = [
{ label: "Critical Findings", value: "7", note: "+2 this week", tone: "text-rose-300", dot: "bg-rose-400" },
{ label: "Processes Analyzed", value: "23", note: "of 27 mapped", tone: "text-blue-300", dot: "bg-blue-400" },
{ label: "Evidence Coverage", value: "81%", note: "verified inputs", tone: "text-teal-300", dot: "bg-teal-400" },
{ label: "Improvement Opportunities", value: "14", note: "≈ $3.8M est. / yr", tone: "text-amber-300", dot: "bg-amber-400" }];


export const healthSatellites = [
{ angle: 162, value: "11.4", unit: "d", label: "P2P cycle time", tone: "#FBBF24" },
{ angle: 126, value: "71", unit: "%", label: "SLA compliance", tone: "#60A5FA" },
{ angle: 90, value: "8.6", unit: "%", label: "Rework rate", tone: "#60A5FA" },
{ angle: 54, value: "62", unit: "%", label: "Ownership coverage", tone: "#FBBF24" },
{ angle: 18, value: "87", unit: "%", label: "Data quality", tone: "#2DD4BF" }];


export const maturityRadar = [
{ area: "Procurement", observed: 58, bestPractice: 85 },
{ area: "Maintenance", observed: 52, bestPractice: 82 },
{ area: "Production", observed: 74, bestPractice: 88 },
{ area: "Supply Chain", observed: 66, bestPractice: 84 },
{ area: "HSE", observed: 81, bestPractice: 90 },
{ area: "Finance", observed: 70, bestPractice: 86 }];


export const p2pTrend = [
{ month: "Jan", days: 9.1 },
{ month: "Feb", days: 9.6 },
{ month: "Mar", days: 10.4 },
{ month: "Apr", days: 10.1 },
{ month: "May", days: 10.9 },
{ month: "Jun", days: 11.8 },
{ month: "Jul", days: 11.2 },
{ month: "Aug", days: 11.9 },
{ month: "Sep", days: 11.4 }];


export const journeySteps = [
{ label: "Understand", detail: "How work flows", to: "/process" },
{ label: "Identify", detail: "What's broken", to: "/process" },
{ label: "Trace", detail: "Data & dependencies", to: "/process-mapping-graph" },
{ label: "Compare", detail: "vs best practice", to: "/assistant" },
{ label: "Recommend", detail: "Improved process", to: "/process-mapping-graph" },
{ label: "Execute", detail: "Assign & schedule", to: "/planning" },
{ label: "Verify", detail: "Govern outcomes", to: "/governance" }];
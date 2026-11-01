import type { DocGroupMeta, FlowEdge, OutcomeKpi, Permit, PermitStatus, RoleNode } from "../types/outcomes";

/**
 * Observed document flow between roles for travel permits.
 * Sample data modelled on a public travel-expense event log; not connected to a live source.
 */
export const docGroups: DocGroupMeta[] = [
{ id: "permit", label: "Permit", color: "#3B82F6" },
{ id: "declaration", label: "Declaration", color: "#E58BBE" },
{ id: "request", label: "Request For Payment", color: "#34D399" },
{ id: "trip", label: "Trip", color: "#F5B533" },
{ id: "payment", label: "Payment", color: "#7DD3FC" },
{ id: "reminder", label: "Reminder", color: "#A78BFA" }];


export const roleNodes: RoleNode[] = [
{ id: "employee", label: "EMPLOYEE", x: 60, y: 350 },
{ id: "pre", label: "PRE_APPROVER", x: 280, y: 190 },
{ id: "supervisor", label: "SUPERVISOR", x: 740, y: 190 },
{ id: "budget", label: "BUDGET_OWNER", x: 500, y: 350 },
{ id: "system", label: "SYSTEM", x: 950, y: 350 },
{ id: "admin", label: "ADMINISTRATION", x: 280, y: 510 },
{ id: "director", label: "DIRECTOR", x: 740, y: 510 },
{ id: "missing", label: "MISSING", x: 500, y: 660 }];


export const flowEdges: FlowEdge[] = [
{ id: "e1", from: "employee", to: "pre", group: "permit", count: 820, bend: -40 },
{ id: "e2", from: "pre", to: "supervisor", group: "permit", count: 640, bend: -150 },
{ id: "e3", from: "employee", to: "supervisor", group: "permit", count: 410, bend: -70 },
{ id: "e4", from: "supervisor", to: "director", group: "permit", count: 180, bend: -50 },
{ id: "e5", from: "budget", to: "supervisor", group: "permit", count: 150, bend: -60 },
{ id: "e6", from: "employee", to: "admin", group: "permit", count: 360, bend: 40 },
{ id: "e7", from: "admin", to: "budget", group: "permit", count: 120, bend: -50 },
{ id: "e8", from: "employee", to: "missing", group: "permit", count: 70, bend: 120 },
{ id: "e9", from: "director", to: "system", group: "permit", count: 45, bend: -20 },
{ id: "e10", from: "admin", to: "pre", group: "permit", count: 95, bend: 40 },
{ id: "e11", from: "employee", to: "supervisor", group: "declaration", count: 1180, bend: -30 },
{ id: "e12", from: "employee", to: "pre", group: "declaration", count: 260, bend: 60 },
{ id: "e13", from: "pre", to: "director", group: "declaration", count: 140, bend: 10 },
{ id: "e14", from: "supervisor", to: "system", group: "declaration", count: 380, bend: -12 },
{ id: "e15", from: "employee", to: "budget", group: "declaration", count: 90, bend: 25 },
{ id: "e16", from: "admin", to: "employee", group: "declaration", count: 220, bend: -40 },
{ id: "e17", from: "employee", to: "system", group: "declaration", count: 310, bend: -60 },
{ id: "e18", from: "employee", to: "admin", group: "request", count: 540, bend: 15 },
{ id: "e19", from: "admin", to: "director", group: "request", count: 210, bend: -40 },
{ id: "e20", from: "budget", to: "director", group: "request", count: 160, bend: 30 },
{ id: "e21", from: "employee", to: "director", group: "request", count: 260, bend: 10 },
{ id: "e22", from: "employee", to: "budget", group: "request", count: 140, bend: -20 },
{ id: "e23", from: "director", to: "system", group: "request", count: 120, bend: 14 },
{ id: "e24", from: "supervisor", to: "admin", group: "request", count: 70, bend: 30 },
{ id: "e25", from: "employee", to: "supervisor", group: "trip", count: 960, bend: -48 },
{ id: "e26", from: "pre", to: "supervisor", group: "trip", count: 520, bend: 6 },
{ id: "e27", from: "employee", to: "pre", group: "trip", count: 380, bend: 20 },
{ id: "e28", from: "employee", to: "missing", group: "trip", count: 420, bend: 40 },
{ id: "e29", from: "missing", to: "supervisor", group: "trip", count: 310, bend: -30 },
{ id: "e30", from: "admin", to: "supervisor", group: "trip", count: 260, bend: 4 },
{ id: "e31", from: "employee", to: "admin", group: "trip", count: 180, bend: -24 },
{ id: "e32", from: "system", to: "missing", group: "trip", count: 40, bend: -180 },
{ id: "e33", from: "missing", to: "employee", group: "trip", count: 120, bend: 50 },
{ id: "e34", from: "supervisor", to: "system", group: "payment", count: 1600, bend: 0 },
{ id: "e35", from: "director", to: "system", group: "payment", count: 230, bend: 8 },
{ id: "e36", from: "admin", to: "system", group: "payment", count: 60, bend: 70 },
{ id: "e37", from: "system", to: "employee", group: "reminder", count: 275, bend: -110 },
{ id: "e38", from: "supervisor", to: "employee", group: "reminder", count: 90, bend: 70 }];


/** Monthly permit volumes, Jan 2017 to Jan 2020 (37 months). */
export const monthlyVolume: number[] = [
6, 9, 12, 15, 18, 14, 22, 30, 41, 58, 64, 52,
72, 84, 96, 88, 79, 70, 63, 55, 49, 44, 40, 36,
31, 27, 24, 20, 18, 15, 12, 10, 8, 7, 6, 5, 4];

export const histogramStart = "2017-01-01";
export const defaultRange = { from: "2017-07-24", to: "2018-01-28" };

/** Headline outcome KPIs for the default window. */
export const outcomeKpis: OutcomeKpi[] = [
{ id: "done", label: "done with evidence", value: 82.4, unit: "%", scales: false },
{ id: "open", label: "open", value: 249, unit: "", scales: true },
{ id: "unknown", label: "unknown status", value: 7, unit: "", scales: true },
{ id: "overspent", label: "overspent", value: 26.4, unit: "%", scales: false },
{ id: "reminders", label: "with reminders", value: 275, unit: "", scales: true },
{ id: "rejection", label: "with rejection", value: 344, unit: "", scales: true },
{ id: "tripBefore", label: "trip before permit", value: 193, unit: "", scales: true },
{ id: "median", label: "median duration", value: 87, unit: "d", scales: false }];


const paths: Record<PermitStatus, string[][]> = {
  closed: [["employee", "pre", "supervisor", "system"], ["employee", "supervisor", "system"], ["employee", "admin", "director", "system"]],
  open: [["employee", "admin", "budget"], ["employee", "pre"], ["employee", "supervisor", "director"]],
  rejected: [["employee", "supervisor", "employee"], ["employee", "admin", "employee"]],
  unknown: [["employee", "missing"], ["employee", "missing", "supervisor"]]
};
const statusCycle: PermitStatus[] = ["closed", "closed", "open", "closed", "rejected", "closed", "open", "closed", "closed", "unknown", "closed", "rejected"];
const units = [654, 654, 654, 612, 654, 371, 654, 18, 520, 654];
const startMs = Date.UTC(2017, 0, 9);

/** Sample travel permits (450 records) spread across the log period. */
export const permits: Permit[] = Array.from({ length: 450 }, (_, i) => {
  const status = statusCycle[i * 7 % statusCycle.length];
  const options = paths[status];
  return {
    id: 1112 + i * 11 + i * 7 % 5,
    orgUnit: units[i * 3 % units.length],
    status,
    date: new Date(startMs + Math.round(i * 2.45 * 86400000)).toISOString().slice(0, 10),
    path: options[i % options.length]
  };
});
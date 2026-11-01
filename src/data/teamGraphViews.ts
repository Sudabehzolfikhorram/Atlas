export type GraphViewId = "processes" | "outcomes" | "strategy";

export interface GraphView {
  id: GraphViewId;
  label: string;
  hint: string;
}

/** Top-level views of the organization graph. */
export const graphViews: GraphView[] = [
{ id: "processes", label: "Detailed Processes", hint: "Teams, processes and dependencies" },
{ id: "outcomes", label: "Outcomes", hint: "Observed document flow · sample log" },
{ id: "strategy", label: "Strategy", hint: "AI analysis against the map" }];
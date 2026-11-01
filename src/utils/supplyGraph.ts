import type { GraphNode, NodeStatus, SupplyCategory, SupplyEdge, SupplyNode } from "../types/supplyGraph";

export const statusMeta: Record<NodeStatus, {label: string;dot: string;chip: string;}> = {
  completed: { label: "Completed", dot: "bg-teal-400", chip: "border-teal-400/30 bg-teal-400/10 text-teal-300" },
  running: { label: "Running", dot: "bg-blue-400", chip: "border-blue-400/30 bg-blue-400/10 text-blue-300" },
  pending: { label: "Pending", dot: "bg-slate-400", chip: "border-slate-400/30 bg-slate-400/10 text-slate-300" },
  failed: { label: "Failed", dot: "bg-rose-400", chip: "border-rose-400/30 bg-rose-400/10 text-rose-300" }
};

export const categoryMeta: Record<SupplyCategory, {label: string;tile: string;}> = {
  source: { label: "Data source", tile: "border-teal-400/25 bg-teal-400/10 text-teal-300" },
  pipeline: { label: "Modeling flow", tile: "border-blue-400/25 bg-blue-400/10 text-blue-300" },
  output: { label: "Business output", tile: "border-violet-400/25 bg-violet-400/10 text-violet-300" },
  downstream: { label: "Downstream consumer", tile: "border-sky-400/25 bg-sky-400/10 text-sky-300" },
  foundation: { label: "Foundation & enabler", tile: "border-slate-400/25 bg-slate-400/10 text-slate-300" },
  twin: { label: "Simulation", tile: "border-violet-400/25 bg-violet-400/10 text-violet-300" }
};

export const isSupplyNode = (n: GraphNode): n is SupplyNode => n.type === "supply";

export const cleanList = (list?: string[]) => (list ?? []).map((s) => s.trim()).filter(Boolean);

export function neighborIds(id: string, edges: SupplyEdge[]) {
  const up = new Set<string>();
  const down = new Set<string>();
  edges.forEach((e) => {
    if (e.target === id) up.add(e.source);
    if (e.source === id) down.add(e.target);
  });
  return { up: [...up], down: [...down] };
}
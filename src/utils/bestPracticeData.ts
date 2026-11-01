import { defaultGraphEdges, defaultGraphNodes } from "../data/supplyGraph";
import { dataControls, dataFixes, dataReroutes } from "../data/bestPracticeData";
import type { DataDiff } from "../types/bestPracticeData";
import type { AreaNode, GraphNode, SupplyEdge, SupplyNode } from "../types/supplyGraph";
import { categoryMeta, cleanList, isSupplyNode } from "./supplyGraph";

export interface DataGraph {
  nodes: GraphNode[];
  edges: SupplyEdge[];
}

/** Extra foundation height in the target so the new controls sit in their own row. */
const FOUNDATION_EXTRA = 130;

function buildTarget(): DataGraph {
  const fixes = new Map(dataFixes.map((f) => [f.nodeId, f]));
  const nodes: GraphNode[] = defaultGraphNodes.map((n) => {
    if (!isSupplyNode(n)) {
      if (n.id !== "area-foundation") return n;
      const h = Number((n as AreaNode).style?.height ?? 140);
      return { ...n, style: { ...n.style, height: h + FOUNDATION_EXTRA } };
    }
    const f = fixes.get(n.id);
    return {
      ...n,
      data: {
        ...n.data,
        label: f?.label ?? n.data.label,
        subtitle: f?.subtitle ?? n.data.subtitle,
        weight: 1,
        details: {
          ...n.data.details,
          status: f?.status ?? n.data.details.status,
          redFlags: [],
          summary: f ? `${n.data.details.summary ?? ""} Best practice: ${f.fix}`.trim() : n.data.details.summary
        }
      }
    };
  });
  const controls: SupplyNode[] = dataControls.map((c) => ({
    id: c.id,
    type: "supply",
    position: { x: c.x, y: c.y },
    data: {
      label: c.label,
      subtitle: c.subtitle,
      icon: c.icon,
      weight: 1,
      category: "foundation",
      details: { summary: c.summary, status: "completed", redFlags: [] }
    }
  }));
  const removed = new Set(dataReroutes.map((r) => r.removeEdgeId));
  const edges: SupplyEdge[] = [...defaultGraphEdges.filter((e) => !removed.has(e.id)), ...dataReroutes.map((r) => ({
    id: `e-${r.source}-${r.target}`,
    source: r.source,
    target: r.target,
    sourceHandle: "r",
    targetHandle: "l",
    data: { label: r.label, weight: 1, kind: "flow" as const }
  })), ...dataControls.map((c) => ({
    id: `e-${c.controls[0]}-${c.id}`,
    source: c.controls[0],
    target: c.id,
    sourceHandle: "b",
    targetHandle: "t",
    data: { label: "Control", weight: 0.8, kind: "dependency" as const }
  }))];
  return { nodes: [...nodes, ...controls], edges };
}

export const asIsDataGraph: DataGraph = { nodes: defaultGraphNodes, edges: defaultGraphEdges };
export const targetDataGraph: DataGraph = buildTarget();

const asIsById = new Map(defaultGraphNodes.filter(isSupplyNode).map((n) => [n.id, n]));

/** Ordered list of differences between today's graph and the best-practice target. */
export const dataDiffs: DataDiff[] = [...dataFixes.map((f) => {
  const n = asIsById.get(f.nodeId);
  const flags = cleanList(n?.data.details.redFlags);
  return {
    id: `fix-${f.nodeId}`,
    nodeId: f.nodeId,
    kind: "fixed" as const,
    title: f.label ? `${n?.data.label ?? f.nodeId} → ${f.label}` : n?.data.label ?? f.nodeId,
    area: n ? categoryMeta[n.data.category].label : "",
    detail: flags.length ? `${flags[0]}${flags.length > 1 ? ` (+${flags.length - 1})` : ""} → ${f.fix}` : f.fix
  };
}), ...dataControls.map((c) => ({
  id: `add-${c.id}`,
  nodeId: c.id,
  kind: "added" as const,
  title: c.label,
  area: categoryMeta.foundation.label,
  detail: `${c.summary} Closes gaps on ${c.controls.map((id) => asIsById.get(id)?.data.label ?? id).join(", ")}.`
})), ...dataReroutes.map((r) => ({
  id: `route-${r.source}-${r.target}`,
  nodeId: r.source,
  kind: "rerouted" as const,
  title: `${asIsById.get(r.source)?.data.label ?? r.source} → ${asIsById.get(r.target)?.data.label ?? r.target}`,
  area: "Connection",
  detail: r.reason
}))];

export function graphStats(g: DataGraph) {
  const nodes = g.nodes.filter(isSupplyNode);
  return {
    nodes: nodes.length,
    connections: g.edges.length,
    redFlags: nodes.reduce((s, n) => s + cleanList(n.data.details.redFlags).length, 0),
    notHealthy: nodes.filter((n) => n.data.details.status === "failed" || n.data.details.status === "pending").length,
    controls: nodes.filter((n) => n.data.category === "foundation").length
  };
}
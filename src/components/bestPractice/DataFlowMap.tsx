import React, { memo, useMemo } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { supplyIcons } from "../supplyGraph/supplyIcons";
import { categoryMeta, cleanList, isSupplyNode, statusMeta } from "../../utils/supplyGraph";
import type { DataGraph } from "../../utils/bestPracticeData";
import type { AreaNode, SupplyNode } from "../../types/supplyGraph";

export type DataMark = "gap" | "fixed" | "added";
export type EdgeMark = "removed" | "added";
export const MAP_W = 1820;
export const MAP_H = 1130;
export const NODE_W = 150;
export const NODE_H = 84;
/** Shifts the graph down so the Digital Twin (y −80) is inside the canvas. */
export const OFFSET_Y = 110;
const markRing: Record<DataMark, string> = {
  gap: "!border-rose-400/80 shadow-[0_0_0_3px_rgba(251,113,133,0.18)]",
  fixed: "!border-sky-400/80 shadow-[0_0_0_3px_rgba(56,189,248,0.18)]",
  added: "!border-teal-400/80 shadow-[0_0_0_3px_rgba(45,212,191,0.2)]"
};
interface Props {
  graph: DataGraph;
  marks?: Record<string, DataMark>;
  edgeMarks?: Record<string, EdgeMark>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}
type Pt = {
  x: number;
  y: number;
};
function anchor(n: SupplyNode, handle: string | null | undefined): Pt {
  const x = n.position.x;
  const y = n.position.y + OFFSET_Y;
  if (handle === "l") return { x, y: y + NODE_H / 2 };
  if (handle === "t") return { x: x + NODE_W / 2, y };
  if (handle === "b") return { x: x + NODE_W / 2, y: y + NODE_H };
  return { x: x + NODE_W, y: y + NODE_H / 2 };
}

/** Static (non-editable) rendering of a supply chain data graph for the before/after comparison. */
function DataFlowMapBase({
  graph,
  marks = {},
  edgeMarks = {},
  selectedId,
  onSelect
}: Props) {
  const nodes = useMemo(() => graph.nodes.filter(isSupplyNode), [graph]);
  const areas = useMemo(() => graph.nodes.filter((n): n is AreaNode => n.type === "area"), [graph]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const paths = useMemo(() => graph.edges.flatMap((e) => {
    const s = byId.get(e.source);
    const t = byId.get(e.target);
    if (!s || !t) return [];
    const a = anchor(s, e.sourceHandle ?? "r");
    const b = anchor(t, e.targetHandle ?? "l");
    const vertical = (e.sourceHandle ?? "r") === "b";
    const d = vertical ? Math.max(40, Math.abs(b.y - a.y) / 2) : Math.max(40, Math.abs(b.x - a.x) / 2);
    const path = vertical ? `M${a.x},${a.y} C${a.x},${a.y + d} ${b.x},${b.y - d} ${b.x},${b.y}` : `M${a.x},${a.y} C${a.x + d},${a.y} ${b.x - d},${b.y} ${b.x},${b.y}`;
    return [{
      id: e.id,
      path,
      dep: e.data?.kind === "dependency",
      mark: edgeMarks[e.id],
      hot: selectedId !== null && (e.source === selectedId || e.target === selectedId)
    }];
  }), [graph.edges, byId, edgeMarks, selectedId]);
  return <div className="relative" style={{
    width: MAP_W,
    height: MAP_H
  }}>
      {areas.map((a) => <div key={a.id} className="absolute rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015]" style={{
      left: a.position.x - 10,
      top: a.position.y + OFFSET_Y,
      width: Number(a.style?.width ?? 0) + 20,
      height: Number(a.style?.height ?? 0)
    }}>
          <span className="absolute left-3 top-2 text-[9.5px] font-medium uppercase tracking-[0.08em] text-slate-500">{a.data.label}</span>
        </div>)}

      <svg className="pointer-events-none absolute inset-0" width={MAP_W} height={MAP_H} aria-hidden>
        {paths.map((p) => {
        const stroke = p.mark === "removed" ? "#FB7185" : p.mark === "added" ? "#2DD4BF" : p.hot ? "#93C5FD" : p.dep ? "rgba(148,163,184,0.45)" : "rgba(96,165,250,0.6)";
        return <path key={p.id} d={p.path} fill="none" stroke={stroke} strokeWidth={p.mark || p.hot ? 2 : 1.4} strokeDasharray={p.dep ? "2 4" : "5 5"} opacity={selectedId && !p.hot && !p.mark ? 0.35 : 1} />;
      })}
      </svg>

      {nodes.map((n) => {
      const Icon = supplyIcons[n.data.icon] ?? supplyIcons.circle;
      const cat = categoryMeta[n.data.category] ?? categoryMeta.pipeline;
      const status = n.data.details.status ? statusMeta[n.data.details.status] : null;
      const flags = cleanList(n.data.details.redFlags).length;
      const sel = selectedId === n.id;
      const mark = marks[n.id];
      return <button key={n.id} type="button" onClick={() => onSelect(n.id)} aria-pressed={sel} aria-label={`${n.data.label}${status ? `, ${status.label}` : ""}${flags ? `, ${flags} red flag${flags > 1 ? "s" : ""}` : ""}`} className={`glass-tile absolute overflow-hidden rounded-xl border px-2.5 pb-2 pt-2 text-left transition-[box-shadow,border-color] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${sel ? "!border-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.3)]" : mark ? markRing[mark] : flags ? "!border-amber-400/45" : ""}`} style={{
        left: n.position.x,
        top: n.position.y + OFFSET_Y,
        width: NODE_W,
        height: NODE_H
      }}>
            <span className="flex min-h-[16px] items-center justify-between gap-1">
              <span className="num rounded border border-white/[0.1] bg-white/[0.04] px-1 text-[9.5px] leading-[14px] text-slate-400">W {n.data.weight.toFixed(2)}</span>
              <span className="flex items-center gap-1">
                {flags > 0 && <span className="inline-flex items-center gap-0.5 rounded bg-amber-400/15 px-1 text-[9.5px] font-semibold leading-[14px] text-amber-300">
                    <TriangleAlertIcon size={9} aria-hidden />
                    {flags}
                  </span>}
                {status && <span className={`h-2 w-2 rounded-full ${status.dot}`} />}
              </span>
            </span>
            <span className="mt-1.5 flex items-start gap-2">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${cat.tile}`}>
                <Icon size={14} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 block text-[12px] font-medium leading-tight text-slate-100">{n.data.label}</span>
                {n.data.subtitle && <span className="mt-0.5 block truncate text-[10.5px] leading-snug text-slate-400">{n.data.subtitle}</span>}
              </span>
            </span>
          </button>;
    })}
    </div>;
}
export const DataFlowMap = memo(DataFlowMapBase);
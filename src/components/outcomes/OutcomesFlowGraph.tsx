import React, { useMemo, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { MousePointerClickIcon } from "lucide-react";
import { docGroups, roleNodes } from "../../data/outcomesFlow";
import { useTheme } from "../../contexts/ThemeContext";
import { edgeGeometry, formatCount, widthFor } from "../../utils/outcomesFlow";
import type { FlowEdge } from "../../types/outcomes";
export interface VisibleEdge extends FlowEdge {
  shown: number;
}
interface Props {
  edges: VisibleEdge[];
  /** Pairs "from>to" on the selected permit's path. */
  pathPairs: Set<string> | null;
  focusNode: string | null;
  onNode: (id: string | null) => void;
}
const nodeMap = Object.fromEntries(roleNodes.map((n) => [n.id, n]));
const groupMap = Object.fromEntries(docGroups.map((g) => [g.id, g]));

/** Directed multigraph of document handoffs between roles. Edge colour is the document group, width is volume. */
export function OutcomesFlowGraph({
  edges,
  pathPairs,
  focusNode,
  onNode
}: Props) {
  const light = useTheme().resolved === "light";
  const [hover, setHover] = useState<string | null>(null);
  const geo = useMemo(() => Object.fromEntries(edges.map((e) => [e.id, edgeGeometry(e, nodeMap)])), [edges]);
  const sorted = useMemo(() => [...edges].sort((a, b) => b.shown - a.shown), [edges]);
  const hovered = edges.find((e) => e.id === hover);
  const isActive = (e: FlowEdge) => {
    if (pathPairs) return pathPairs.has(`${e.from}>${e.to}`);
    if (focusNode) return e.from === focusNode || e.to === focusNode;
    return true;
  };
  const labelFill = light ? "#475569" : "#94A3B8";
  const nodeFill = light ? "#E2E8F0" : "#334155";
  const nodeStroke = light ? "#94A3B8" : "#64748B";
  return <Box className="glass-tile relative flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-white/[0.07]">
      <svg viewBox="0 60 1010 680" className="h-full min-h-[560px] w-full flex-1" role="img" aria-label={`Document flow between ${roleNodes.length} roles with ${edges.length} visible connections`} onClick={() => onNode(null)}>
        <defs>
          {docGroups.map((g) => <marker key={g.id} id={`oc-arrow-${g.id}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill={g.color} />
            </marker>)}
        </defs>
        <g fill="none">
          {sorted.map((e) => {
          const active = isActive(e);
          const hov = hover === e.id;
          return <path key={e.id} d={geo[e.id].d} stroke={groupMap[e.group].color} strokeWidth={widthFor(e.shown) + (hov ? 1.5 : 0)} strokeOpacity={active ? hov ? 1 : 0.82 : 0.08} strokeLinecap="round" markerMid={`url(#oc-arrow-${e.group})`} className="cursor-pointer transition-[stroke-opacity] duration-200" onMouseEnter={() => setHover(e.id)} onMouseLeave={() => setHover(null)}>
                <title>{`${groupMap[e.group].label}: ${nodeMap[e.from].label} → ${nodeMap[e.to].label} · ${formatCount(e.shown)} handoffs`}</title>
              </path>;
        })}
        </g>
        <g pointerEvents="none">
          {sorted.filter((e) => e.shown >= 150 && isActive(e)).map((e) => <text key={e.id} x={geo[e.id].mid.x} y={geo[e.id].mid.y - 5} textAnchor="middle" fontSize="10" fill={labelFill}>{groupMap[e.group].label}</text>)}
        </g>
        {roleNodes.map((n) => {
        const on = focusNode === n.id;
        const dim = (focusNode || pathPairs) && !on && !(pathPairs && [...pathPairs].some((p) => p.split(">").includes(n.id)));
        return <g key={n.id} role="button" tabIndex={0} aria-pressed={on} aria-label={`${n.label} role`} className="cursor-pointer focus:outline-none" opacity={dim ? 0.45 : 1} onClick={(ev) => {
          ev.stopPropagation();
          onNode(on ? null : n.id);
        }} onKeyDown={(ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            onNode(on ? null : n.id);
          }
        }}>
              <circle cx={n.x} cy={n.y} r={on ? 17 : 14} fill={nodeFill} stroke={on ? "#60A5FA" : nodeStroke} strokeWidth={on ? 2.5 : 1.5} />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11.5" fontWeight={500} fill={light ? "#0F172A" : "#E2E8F0"} stroke={light ? "#F8FAFC" : "#0B1220"} strokeWidth={3} paintOrder="stroke">{n.label}</text>
            </g>;
      })}
      </svg>
      <Flex className="pointer-events-none absolute left-3 top-3 max-w-[70%] items-center gap-2 rounded-lg border border-white/[0.08] bg-black/30 px-2.5 py-1.5 text-[11.5px] text-slate-300" aria-live="polite">
        {hovered ? <>
            <span className="h-2 w-2 rounded-full" style={{
          background: groupMap[hovered.group].color
        }} aria-hidden />
            <Text as="span"><span className="font-medium text-slate-100">{groupMap[hovered.group].label}</span> · {nodeMap[hovered.from].label} → {nodeMap[hovered.to].label} · <span className="num">{formatCount(hovered.shown)}</span> handoffs</Text>
          </> : <Text as="span">{edges.length} connections shown{focusNode ? ` · focused on ${nodeMap[focusNode].label}` : ""}{pathPairs ? " · tracing selected permit" : ""}</Text>}
      </Flex>
      {edges.length === 0 && <Flex className="absolute inset-0 items-center justify-center">
          <Text className="rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-[12.5px] text-slate-300">No handoffs match these filters. Lower the threshold or widen the time window.</Text>
        </Flex>}
      <Flex className="pointer-events-none absolute bottom-3 right-3 items-center gap-1.5 text-[11px] text-slate-500">
        <MousePointerClickIcon size={12} aria-hidden /> Click a role to focus its handoffs · select a permit to trace it
      </Flex>
    </Box>;
}
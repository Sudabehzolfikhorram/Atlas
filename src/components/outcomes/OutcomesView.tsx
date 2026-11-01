import React, { useMemo, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { defaultRange, docGroups, flowEdges, outcomeKpis, permits } from "../../data/outcomesFlow";
import { formatCount, rangeShare } from "../../utils/outcomesFlow";
import type { DocGroup } from "../../types/outcomes";
import { OutcomesFilters } from "./OutcomesFilters";
import { OutcomesFlowGraph, type VisibleEdge } from "./OutcomesFlowGraph";
import { PermitTable } from "./PermitTable";
const defaultShare = rangeShare(defaultRange.from, defaultRange.to);

/** Outcomes: observed document handoffs between roles, with filters, KPIs and a traceable permit list. */
export function OutcomesView() {
  const [groups, setGroups] = useState<Set<DocGroup>>(() => new Set(docGroups.map((g) => g.id)));
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);
  const [minHandoffs, setMinHandoffs] = useState(10);
  const [focusNode, setFocusNode] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const scale = defaultShare ? rangeShare(from, to) / defaultShare : 0;
  const edges = useMemo<VisibleEdge[]>(() => flowEdges.filter((e) => groups.has(e.group)).map((e) => ({
    ...e,
    shown: Math.round(e.count * scale)
  })).filter((e) => e.shown >= minHandoffs), [groups, scale, minHandoffs]);
  const inWindow = useMemo(() => permits.filter((p) => p.date >= from && p.date <= to), [from, to]);
  const permit = permits.find((p) => p.id === selected);
  const pathPairs = useMemo(() => permit ? new Set(permit.path.slice(1).map((n, i) => `${permit.path[i]}>${n}`)) : null, [permit]);
  const toggleGroup = (g: DocGroup) => setGroups((prev) => {
    const next = new Set(prev);
    next.has(g) ? next.delete(g) : next.add(g);
    return next;
  });
  return <Box>
      <Flex className="mb-3 flex-wrap items-center justify-between gap-2">
        <Box>
          <Text className="text-[12px] uppercase tracking-[0.06em] text-slate-400">Outcomes · Observed document flow between roles</Text>
          <Text className="mt-0.5 text-[12.5px] text-slate-300">What actually happened to each travel permit, from request to payment.</Text>
        </Box>
        <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11.5px] text-amber-300">Sample data · travel-expense event log</span>
      </Flex>

      <ul className="flex flex-wrap gap-2.5" aria-label="Outcome indicators">
        {outcomeKpis.map((k) => {
        const v = k.scales ? Math.round(k.value * scale) : k.value;
        return <li key={k.id} className="glass-tile min-w-[120px] flex-1 rounded-xl border border-white/[0.07] px-4 py-2.5">
              <Text className="num text-[20px] font-semibold leading-tight text-white">{k.unit === "%" ? `${v.toFixed(1)}%` : k.unit === "d" ? `${v} d` : formatCount(v)}</Text>
              <Text className="text-[12px] text-slate-400">{k.label}</Text>
            </li>;
      })}
      </ul>

      <Box className="mt-3 grid gap-3 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_300px]">
        <OutcomesFilters groups={groups} onToggleGroup={toggleGroup} from={from} to={to} onFrom={setFrom} onTo={setTo} minHandoffs={minHandoffs} onMinHandoffs={setMinHandoffs} />
        <OutcomesFlowGraph edges={edges} pathPairs={pathPairs} focusNode={focusNode} onNode={(id) => {
        setSelected(null);
        setFocusNode(id);
      }} />
        <Box className="lg:col-span-2 xl:col-span-1">
          <PermitTable permits={inWindow} selectedId={selected} onSelect={(id) => {
          setFocusNode(null);
          setSelected(id);
        }} />
        </Box>
      </Box>
      <Text className="mt-2 text-[11.5px] text-slate-500">Edge colour is the document group and width is the number of handoffs. Counts and permits are sample data and update with the time window.</Text>
    </Box>;
}
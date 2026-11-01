import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ArrowRightIcon, CircleAlertIcon, FlaskConicalIcon, GitBranchIcon } from "lucide-react";
import { timelineMonths } from "../../data/processMaps";
import type { MapVariant, PeriodKey, ProcessDefinition } from "../../types/processMap";
import { EvidenceTag } from "../ui/EvidenceTag";
import { casesInPeriod, changeForEdge, changeMeta, edgesFor, periodStart, stepChange, stepWait, volume, waitSeries } from "../../utils/processMap";
interface Props {
  process: ProcessDefinition;
  variant: MapVariant;
  period: PeriodKey;
  month: number;
  selectedId: string | null;
}
function Spark({
  values


}: {values: number[];}) {
  if (values.length < 2) return <Text className="py-3 text-[11px] text-slate-500">Trend needs at least two snapshots in this period.</Text>;
  const min = Math.min(...values) * 0.9;
  const max = Math.max(...values) * 1.05;
  const pts = values.map((v, i) => [i / (values.length - 1) * 216 + 2, 40 - (v - min) / (max - min || 1) * 34]);
  const d = `M${pts.map((p) => p.join(",")).join(" L")}`;
  const last = pts[pts.length - 1];
  return <svg viewBox="0 0 220 44" className="my-2 block h-11 w-full" aria-hidden>
      <path d="M0 42H220" stroke="rgba(148,163,184,0.15)" strokeDasharray="2 3" />
      <path d={`${d} L218,44 L2,44 Z`} fill="#A78BFA" opacity="0.08" />
      <path d={d} fill="none" stroke="#A78BFA" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.6" fill="#A78BFA" />
    </svg>;
}
function Stat({
  value,
  label,
  tone = "text-white"




}: {value: string;label: string;tone?: string;}) {
  return <Box>
      <Text className={`num text-[15px] font-medium ${tone}`}>{value}</Text>
      <Text className="text-[10.5px] text-slate-500">{label}</Text>
    </Box>;
}
export function MapInspector({
  process,
  variant,
  period,
  month,
  selectedId
}: Props) {
  const monthLabel = timelineMonths[month].short + " " + timelineMonths[month].full.slice(-4);
  const step = process.steps.find((s) => s.id === selectedId);
  const edge = edgesFor(process, variant).find((e) => e.id === selectedId);
  const labelOf = (id: string) => {
    const s = process.steps.find((x) => x.id === id);
    return (variant === "current" ? s?.current?.label : s?.recommended?.label) ?? s?.current?.label ?? id;
  };
  if (edge) {
    const vol = variant === "current" ? volume(process, edge.share, month) : null;
    const ch = variant === "recommended" ? changeForEdge(process, edge.id) : undefined;
    return <Box className="space-y-3">
        <Text className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500">Handoff</Text>
        <Flex className="items-center gap-1.5 text-[15px] font-medium text-white">
          {labelOf(edge.from)} <ArrowRightIcon size={13} className="text-slate-500" /> {labelOf(edge.to)}
        </Flex>
        <Text className="text-[12.5px] text-slate-400">{edge.label} · <span className="capitalize">{edge.kind}</span></Text>
        {variant === "current" ? <Box className="grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3">
            <Stat value={vol === null ? "—" : vol.toLocaleString()} label={`Cases · ${monthLabel}`} />
            <Stat value={edge.share === undefined ? "—" : Math.round(casesInPeriod(process, period, month) * edge.share).toLocaleString()} label="Period to date" />
          </Box> : <Box className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-[12px] text-slate-400">
            {ch ? <><span className={`mr-1.5 rounded border px-1.5 py-0.5 text-[10px] font-medium ${changeMeta[ch.type].chip}`}>{changeMeta[ch.type].label}</span>{ch.why}</> : "Unchanged from the current workflow."}
            <Text className="mt-2 text-[11px] text-slate-500">Case volume on proposed paths is not modelled.</Text>
          </Box>}
      </Box>;
  }
  if (!step) return <Text className="text-[13px] text-slate-500">Select a step or handoff on the map to inspect it.</Text>;
  const incoming = edgesFor(process, variant).filter((e) => e.to === step.id);
  const outgoing = edgesFor(process, variant).filter((e) => e.from === step.id);
  if (variant === "current" && step.current) {
    const v = step.current;
    const wait = stepWait(process, v, month);
    return;
  }
  const ch = stepChange(process, step.id);
  if (variant === "current" && !step.current) {
    return <Box className="space-y-2">
        <Text className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500">Not in the current workflow</Text>
        <Text as="h4" className="text-[16px] font-semibold text-white">{step.recommended?.label}</Text>
        <Text className="text-[12.5px] leading-relaxed text-slate-400">
          This step doesn't exist today. The AI proposes adding it — see the Best practice panel for the reasoning.
        </Text>
      </Box>;
  }
  const rv = step.recommended;
  if (!rv) {
    return <Box className="space-y-3">
        <Flex className="items-center justify-between">
          <Text className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500">Proposed removal</Text>
          <EvidenceTag status="proposed" />
        </Flex>
        <Text as="h4" className="text-[16px] font-semibold text-slate-300 line-through decoration-rose-300/70">{step.current?.label}</Text>
        {ch ? <>
            <Box className="rounded-xl border border-rose-400/20 bg-rose-400/[0.05] p-3">
              <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${changeMeta.removed.chip}`}>Removed</span>
              <Text className="mt-1.5 text-[12px] leading-relaxed text-slate-300">{ch.why}</Text>
              <Text className="mt-1.5 text-[12px] leading-relaxed text-slate-400">Proposed: {ch.proposed}</Text>
            </Box>
            <Flex className="items-center justify-between gap-2 text-[11.5px] text-slate-400">{ch.evidence}<EvidenceTag status={ch.evidenceStatus} compact /></Flex>
            {ch.assumption && <Flex className="gap-2 text-[11.5px] leading-relaxed text-slate-400">
                <FlaskConicalIcon size={12} className="mt-0.5 shrink-0 text-violet-300" />Assumption: {ch.assumption}
              </Flex>}
          </> : <Text className="text-[12.5px] text-slate-500">This step isn't part of the recommended workflow.</Text>}
      </Box>;
  }
  const baseline = stepWait(process, step.current, month);
  return;
}
import React from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { XIcon } from "lucide-react";
import { teams } from "../../data/teamGraph";
import { insightTypeMeta, severityHex } from "../../utils/strategy";
import type { InsightBasis, InsightType, StrategyInsight } from "../../types/strategy";
import { BasisTag } from "./BasisTag";
import { ConfidenceMeter } from "../ui/ConfidenceMeter";
interface Props {
  items: StrategyInsight[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  type: InsightType | "all";
  onType: (t: InsightType | "all") => void;
  basis: InsightBasis | "all";
  onBasis: (b: InsightBasis | "all") => void;
  teamId: string | null;
  onClearTeam: () => void;
  loading: boolean;
}
const types = Object.keys(insightTypeMeta) as InsightType[];
const chip = (on: boolean) => `rounded-md border px-2 py-0.5 text-[11px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "border-blue-400/50 bg-blue-500/[0.12] text-white" : "border-white/[0.08] text-slate-400 hover:text-slate-200"}`;

/** AI-generated insights; selecting one highlights it on the map. */
export function InsightList({
  items,
  selectedId,
  onSelect,
  type,
  onType,
  basis,
  onBasis,
  teamId,
  onClearTeam,
  loading
}: Props) {
  const team = teams.find((t) => t.id === teamId);
  return <Box as="section" aria-labelledby="st-insights" className="glass-tile flex min-h-0 flex-col rounded-2xl border border-white/[0.07] p-4">
      <Flex className="items-center justify-between gap-2">
        <Heading as="h3" id="st-insights" className="!text-[14px] !font-semibold text-slate-100">AI insights</Heading>
        <Text className="num text-[11.5px] text-slate-500">{items.length} shown</Text>
      </Flex>
      <Flex role="group" aria-label="Filter by basis" className="mt-2.5 flex-wrap gap-1.5">
        {(["all", "evidence", "hypothesis"] as const).map((b) => <button key={b} type="button" aria-pressed={basis === b} onClick={() => onBasis(b)} className={chip(basis === b)}>
            {b === "all" ? "All" : b === "evidence" ? "Evidence-backed" : "AI hypotheses"}
          </button>)}
      </Flex>
      <Flex role="group" aria-label="Filter by type" className="mt-1.5 flex-wrap gap-1.5">
        <button type="button" aria-pressed={type === "all"} onClick={() => onType("all")} className={chip(type === "all")}>All types</button>
        {types.map((t) => <button key={t} type="button" aria-pressed={type === t} onClick={() => onType(t)} className={chip(type === t)}>{insightTypeMeta[t].label}</button>)}
      </Flex>
      {team && <Flex className="mt-2 items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[11.5px] text-slate-300">
          Team: <span className="font-medium text-slate-100">{team.name}</span>
          <button type="button" aria-label="Clear team filter" onClick={onClearTeam} className="ml-auto rounded p-0.5 text-slate-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"><XIcon size={12} /></button>
        </Flex>}

      <Box as="ul" className="mt-3 max-h-[560px] space-y-2 overflow-y-auto pr-1" aria-busy={loading}>
        {loading ? [0, 1, 2, 3].map((i) => <li key={i} className="h-[92px] animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]" />) : items.length === 0 ? <li className="rounded-xl border border-dashed border-white/[0.1] px-3 py-6 text-center text-[12px] text-slate-500">No insights match these filters.</li> : items.map((i) => {
        const on = i.id === selectedId;
        return <li key={i.id}>
                <button type="button" aria-pressed={on} onClick={() => onSelect(i.id)} className={`w-full rounded-xl border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "border-blue-400/50 bg-blue-500/[0.08]" : i.basis === "hypothesis" ? "border-dashed border-white/[0.12] hover:border-white/25" : "border-white/[0.07] hover:border-white/20"}`}>
                  <Flex className="flex-wrap items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{
                background: severityHex[i.severity]
              }} aria-label={`${i.severity} severity`} />
                    <span className={`rounded-md border px-1.5 py-0.5 text-[10.5px] ${insightTypeMeta[i.type].chip}`}>{insightTypeMeta[i.type].label}</span>
                    <BasisTag basis={i.basis} compact />
                  </Flex>
                  <Text className="mt-1.5 text-[12.5px] font-medium leading-snug text-slate-100">{i.title}</Text>
                  <Flex className="mt-2 items-center justify-between gap-2">
                    <Text className="truncate text-[11px] text-slate-500">{i.teams.length} teams · {i.objectives.length} objectives</Text>
                    <ConfidenceMeter value={i.confidence} />
                  </Flex>
                </button>
              </li>;
      })}
      </Box>
    </Box>;
}
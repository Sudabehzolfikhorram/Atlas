import React, { useMemo, useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import { insights } from "../../data/strategy";
import type { InsightBasis, InsightType } from "../../types/strategy";
import { InsightList } from "../strategy/InsightList";
import { StrategyMap } from "../strategy/StrategyMap";
import { InfoTip } from "../ui/InfoTip";
import { SectionHeader } from "./CollapsibleSection";
interface Props {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}
const sevRank = {
  High: 0,
  Medium: 1,
  Low: 2
};

/** Strategic insights list beside the organization map; selecting an insight highlights its teams. */
export function StrategicInsights({
  selectedId,
  onSelect
}: Props) {
  const [type, setType] = useState<InsightType | "all">("all");
  const [basis, setBasis] = useState<InsightBasis | "all">("all");
  const [teamId, setTeamId] = useState<string | null>(null);
  const list = useMemo(() => insights.filter((i) => (!teamId || i.teams.includes(teamId)) && (type === "all" || i.type === type) && (basis === "all" || i.basis === basis)).sort((a, b) => sevRank[a.severity] - sevRank[b.severity] || b.confidence - a.confidence), [teamId, type, basis]);
  const insight = insights.find((i) => i.id === selectedId) ?? null;
  return <Box as="section" id="strategic-insights" aria-labelledby="si-title" className="glass scroll-mt-6 overflow-hidden rounded-2xl">
      <SectionHeader id="si-title" title={<>Strategic insights<span className="num rounded-md border border-white/[0.1] px-1.5 text-[11.5px] font-medium text-slate-300">{insights.length}</span><InfoTip label="Strategic insights">AI findings about how well teams and processes support the strategy. Evidence-backed findings are verified against source records; hypotheses still need confirming.</InfoTip></>} />
      <Box className="grid gap-4 p-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <InsightList items={list} selectedId={selectedId} onSelect={onSelect} type={type} onType={setType} basis={basis} onBasis={setBasis} teamId={teamId} onClearTeam={() => setTeamId(null)} loading={false} />
        <Box className="min-w-0">
          <StrategyMap insight={insight} objective={null} teamId={teamId} onTeam={setTeamId} />
          <Text className="mt-2 text-[11.5px] text-slate-500">Organization map · source highlights</Text>
        </Box>
      </Box>
    </Box>;
}
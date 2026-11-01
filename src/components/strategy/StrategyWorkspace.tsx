import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Flex, Text, useToast } from "@chakra-ui/react";
import { GaugeIcon, NetworkIcon, RefreshCwIcon, ShieldCheckIcon, SparklesIcon, TargetIcon } from "lucide-react";
import { teamRelations, teams } from "../../data/teamGraph";
import { insights, objectives } from "../../data/strategy";
import type { InsightBasis, InsightType } from "../../types/strategy";
import { StatTile } from "../diligence/StatTile";
import { AiIcon } from "../assistant/AiIcon";
import { BasisTag } from "./BasisTag";
import { ObjectiveCards } from "./ObjectiveCards";
import { InsightList } from "./InsightList";
import { StrategyMap } from "./StrategyMap";
import { InsightPanel } from "./InsightPanel";
import { RecommendationList } from "./RecommendationList";
import { StrategyAssistant } from "./StrategyAssistant";
const sevRank = {
  High: 0,
  Medium: 1,
  Low: 2
};
const alignment = Math.round(objectives.reduce((s, o) => s + o.alignment, 0) / objectives.length);
const projected = Math.round(objectives.reduce((s, o) => s + o.projected, 0) / objectives.length);
const evidenceCount = insights.filter((i) => i.basis === "evidence").length;
const teamsAffected = new Set(insights.flatMap((i) => i.teams)).size;
const relsAffected = new Set(insights.flatMap((i) => i.relations)).size;
const offTrack = objectives.filter((o) => o.status === "off-track").length;
const atRisk = objectives.filter((o) => o.status === "at-risk").length;

/** AI workspace analysing strategic objectives against the organization map. */
export function StrategyWorkspace() {
  const toast = useToast();
  const [objectiveId, setObjectiveId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [type, setType] = useState<InsightType | "all">("all");
  const [basis, setBasis] = useState<InsightBasis | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>("i2");
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState("16 Oct 2026, 09:44");
  const [question, setQuestion] = useState<{
    id: number;
    text: string;
  } | null>(null);
  const runTimer = useRef<number>();
  useEffect(() => () => window.clearTimeout(runTimer.current), []);
  const list = useMemo(() => insights.filter((i) => (!objectiveId || i.objectives.includes(objectiveId)) && (!teamId || i.teams.includes(teamId)) && (type === "all" || i.type === type) && (basis === "all" || i.basis === basis)).sort((a, b) => sevRank[a.severity] - sevRank[b.severity] || b.confidence - a.confidence), [objectiveId, teamId, type, basis]);
  const insight = insights.find((i) => i.id === selectedId) ?? null;
  const objective = objectives.find((o) => o.id === objectiveId) ?? null;
  const showInsight = (id: string) => {
    setSelectedId(id);
    document.getElementById("st-map")?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  };
  const rerun = () => {
    setLoading(true);
    runTimer.current = window.setTimeout(() => {
      setLoading(false);
      setLastRun("Just now");
      toast({
        status: "success",
        title: "Analysis refreshed",
        description: `${insights.length} insights across ${teams.length} teams and ${objectives.length} objectives.`,
        duration: 3000
      });
    }, 1400);
  };
  const onAction = (title: string) => toast({
    status: "success",
    title: "Added to Planning",
    description: title,
    duration: 3000
  });
  return <Box className="space-y-3">
      <Flex className="glass-tile flex-wrap items-center gap-3 rounded-2xl border border-white/[0.07] px-4 py-3">
        <AiIcon size={30} />
        <Box className="min-w-0">
          <Text className="text-[14px] font-semibold text-slate-100">Strategy vs. organization — AI analysis</Text>
          <Text className="text-[11.5px] text-slate-500">
            {objectives.length} objectives · {teams.length} teams · {teamRelations.length} dependencies · last run {lastRun}
          </Text>
        </Box>
        <Flex className="ml-auto flex-wrap items-center gap-2">
          <BasisTag basis="evidence" />
          <BasisTag basis="hypothesis" />
          <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-300">Objectives & scores are sample data</span>
          <Button size="sm" variant="outline" leftIcon={<RefreshCwIcon size={13} className={loading ? "animate-spin" : ""} />} isDisabled={loading} onClick={rerun}>
            {loading ? "Analysing…" : "Re-run analysis"}
          </Button>
        </Flex>
      </Flex>

      <Box className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Strategic alignment" value={<>{alignment}<span className="text-[14px] text-slate-500">/100</span></>} tone={alignment >= 70 ? "teal" : alignment >= 50 ? "amber" : "rose"} bar={alignment} note={`Projected ${projected} after recommendations`} icon={<GaugeIcon size={14} />} />
        <StatTile label="Objectives not on track" value={offTrack + atRisk} tone="rose" note={`${offTrack} off track · ${atRisk} at risk`} icon={<TargetIcon size={14} />} />
        <StatTile label="Evidence-backed findings" value={evidenceCount} tone="teal" note="Select to filter" icon={<ShieldCheckIcon size={14} />} active={basis === "evidence"} onClick={() => setBasis(basis === "evidence" ? "all" : "evidence")} />
        <StatTile label="AI hypotheses" value={insights.length - evidenceCount} tone="blue" note="Need validation · select to filter" icon={<SparklesIcon size={14} />} active={basis === "hypothesis"} onClick={() => setBasis(basis === "hypothesis" ? "all" : "hypothesis")} />
        <StatTile label="Teams affected" value={<>{teamsAffected}<span className="text-[14px] text-slate-500"> / {teams.length}</span></>} tone="amber" bar={teamsAffected / teams.length * 100} note="Teams linked to at least one issue" />
        <StatTile label="Dependencies at risk" value={<>{relsAffected}<span className="text-[14px] text-slate-500"> / {teamRelations.length}</span></>} tone="amber" bar={relsAffected / teamRelations.length * 100} note="Relationships on an issue path" icon={<NetworkIcon size={14} />} />
      </Box>

      <ObjectiveCards active={objectiveId} onSelect={(id) => {
      setObjectiveId(id);
      if (id) {
        const first = insights.find((i) => i.objectives.includes(id));
        setSelectedId(first?.id ?? null);
      }
    }} />

      <Box className="grid gap-3 lg:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)_360px]">
        <InsightList items={list} selectedId={selectedId} onSelect={(id) => setSelectedId(id === selectedId ? null : id)} type={type} onType={setType} basis={basis} onBasis={setBasis} teamId={teamId} onClearTeam={() => setTeamId(null)} loading={loading} />
        <Box id="st-map" className="min-w-0">
          <StrategyMap insight={insight} objective={objective} teamId={teamId} onTeam={(id) => {
          setTeamId(id);
          if (id) setSelectedId(null);
        }} />
        </Box>
        <Box className="lg:col-span-2 2xl:col-span-1">
          <InsightPanel insight={insight} onAction={onAction} onAsk={(q) => setQuestion({
          id: Date.now(),
          text: q
        })} />
        </Box>
      </Box>

      <Box className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <RecommendationList selectedInsight={selectedId} onShow={showInsight} onAction={onAction} />
        <StrategyAssistant pending={question} onShow={showInsight} />
      </Box>
      <Text className="text-[11.5px] text-slate-500">Teams, relationships and evidence come from the organization map. Objectives, alignment scores and financial estimates are illustrative sample data. AI hypotheses are shown with dashed outlines and should be validated before acting.</Text>
    </Box>;
}
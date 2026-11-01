import React from "react";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { ArrowRightIcon, FlaskConicalIcon, LightbulbIcon, MessageSquareIcon, SparklesIcon } from "lucide-react";
import { teamRelations, teams } from "../../data/teamGraph";
import { objectives, recommendations } from "../../data/strategy";
import { healthMeta } from "../../utils/teamGraph";
import { insightTypeMeta, severityHex } from "../../utils/strategy";
import type { StrategyInsight } from "../../types/strategy";
import { BasisTag } from "./BasisTag";
import { ConfidenceMeter } from "../ui/ConfidenceMeter";
interface Props {
  insight: StrategyInsight | null;
  onAsk: (q: string) => void;
  onAction: (title: string) => void;
}
const section = "mt-4 border-t border-white/[0.06] pt-3.5";
const label = "text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500";

/** Contextual detail for the selected insight: evidence, impact on objectives and the recommended response. */
export function InsightPanel({
  insight,
  onAsk,
  onAction
}: Props) {
  if (!insight) return <Box className="glass-tile flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-white/[0.07] p-6 text-center">
        <SparklesIcon size={18} className="text-blue-300" aria-hidden />
        <Text className="mt-2 text-[13px] font-medium text-slate-200">Select an insight</Text>
        <Text className="mt-1 text-[12px] text-slate-500">Its evidence, impact on objectives and recommended next steps appear here.</Text>
      </Box>;
  const rec = recommendations.find((r) => r.id === insight.recommendation);
  const rels = teamRelations.filter((r) => insight.relations.includes(r.id));
  const hyp = insight.basis === "hypothesis";
  return <Box as="section" aria-labelledby="st-detail" className="glass-tile rounded-2xl border border-white/[0.07] p-4">
      <Flex className="flex-wrap items-center gap-1.5">
        <span className={`rounded-md border px-1.5 py-0.5 text-[10.5px] ${insightTypeMeta[insight.type].chip}`}>{insightTypeMeta[insight.type].label}</span>
        <BasisTag basis={insight.basis} />
        <span className="ml-auto text-[11px] font-medium" style={{
        color: severityHex[insight.severity]
      }}>{insight.severity} severity</span>
      </Flex>
      <Heading as="h3" id="st-detail" className="mt-2 !text-[15px] !font-semibold leading-snug text-slate-100">{insight.title}</Heading>
      <Text className="mt-1.5 text-[12.5px] leading-relaxed text-slate-300">{insight.summary}</Text>
      <Flex className="mt-2.5 items-center gap-2 text-[11.5px] text-slate-400">AI confidence <ConfidenceMeter value={insight.confidence} /></Flex>

      <Box className={section}>
        <Text className={label}>Affected on the map</Text>
        <Flex className="mt-2 flex-wrap gap-1.5">
          {insight.teams.map((id) => {
          const t = teams.find((x) => x.id === id);
          return t ? <span key={id} className="rounded-md border border-white/[0.1] bg-white/[0.03] px-2 py-0.5 text-[11.5px] text-slate-200">{t.name}</span> : null;
        })}
        </Flex>
        {rels.length > 0 && <ul className="mt-2 space-y-1">
            {rels.map((r) => <li key={r.id} className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${healthMeta[r.evidence].dot}`} aria-hidden />
                <span className="truncate">{r.process}</span>
              </li>)}
          </ul>}
      </Box>

      <Box className={section}>
        <Text className={label}>{hyp ? "Why AI suspects this" : "Supporting evidence"}</Text>
        <ul className="mt-2 space-y-2">
          {insight.evidence.map((e) => <li key={e.label} className="flex gap-2">
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${healthMeta[e.status].dot}`} aria-label={healthMeta[e.status].label} />
              <Box className="min-w-0">
                <Text className="text-[12px] leading-snug text-slate-200">{e.label}</Text>
                <Text className="text-[11px] text-slate-500">{e.source}</Text>
              </Box>
            </li>)}
        </ul>
        {insight.validate && <Flex className="mt-2.5 gap-2 rounded-lg border border-dashed border-blue-400/40 bg-blue-400/[0.05] px-2.5 py-2 text-[11.5px] text-blue-200">
            <FlaskConicalIcon size={13} className="mt-0.5 shrink-0" aria-hidden />
            <span><span className="font-medium">To confirm:</span> {insight.validate}</span>
          </Flex>}
      </Box>

      <Box className={section}>
        <Text className={label}>Impact on objectives</Text>
        <ul className="mt-2 space-y-2.5">
          {insight.impact.map((im) => {
          const o = objectives.find((x) => x.id === im.objective);
          if (!o) return null;
          return <li key={im.objective}>
                <Flex className="items-baseline justify-between gap-2">
                  <Text className="truncate text-[12px] font-medium text-slate-200">{o.short}</Text>
                  <Text className="num shrink-0 text-[11.5px] text-rose-300">−{im.delta} pts</Text>
                </Flex>
                <Box className="relative mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.07]" aria-hidden>
                  <Box className="absolute inset-y-0 left-0 rounded-full bg-slate-400" style={{
                width: `${o.alignment}%`
              }} />
                  <Box className="absolute inset-y-0 rounded-full bg-emerald-400/60" style={{
                left: `${o.alignment}%`,
                width: `${Math.min(im.delta, 100 - o.alignment)}%`
              }} />
                </Box>
                <Text className="mt-1 text-[11px] text-slate-500">{im.effect} · alignment {o.alignment} → {Math.min(100, o.alignment + im.delta)} if resolved</Text>
              </li>;
        })}
        </ul>
        <Text className="mt-2.5 text-[12px] leading-snug text-slate-300"><span className="text-slate-500">Expected outcome: </span>{insight.outcome}</Text>
      </Box>

      {rec && <Box className={section}>
          <Flex className="items-center gap-1.5">
            <LightbulbIcon size={13} className="text-violet-300" aria-hidden />
            <Text className={label}>Recommended response · P{rec.priority}</Text>
          </Flex>
          <Text className="mt-1.5 text-[12.5px] font-medium text-slate-100">{rec.title}</Text>
          <ol className="mt-2 space-y-1">
            {rec.steps.map((s, i) => <li key={s} className="flex gap-2 text-[12px] text-slate-300">
                <span className="num mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded border border-white/[0.12] text-[10px] text-slate-400">{i + 1}</span>{s}
              </li>)}
          </ol>
          <Text className="mt-2 text-[11.5px] text-slate-500">Expected impact: <span className="text-emerald-300">{rec.expectedImpact}</span> · Owner {rec.owner}</Text>
        </Box>}

      <Flex className="mt-4 flex-wrap gap-2">
        {rec && <Button size="sm" colorScheme="blue" rightIcon={<ArrowRightIcon size={13} />} onClick={() => onAction(rec.title)}>{hyp ? "Create validation task" : "Create action"}</Button>}
        <Button size="sm" variant="outline" leftIcon={<MessageSquareIcon size={13} />} onClick={() => onAsk(`Tell me more about: ${insight.title}`)}>Ask assistant</Button>
      </Flex>
    </Box>;
}
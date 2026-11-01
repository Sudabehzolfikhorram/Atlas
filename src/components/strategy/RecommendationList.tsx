import React, { useState } from "react";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { ChevronDownIcon } from "lucide-react";
import { insights, recommendations } from "../../data/strategy";
import { BasisTag } from "./BasisTag";
interface Props {
  selectedInsight: string | null;
  onShow: (insightId: string) => void;
  onAction: (title: string) => void;
}
const priorityChip = {
  1: "border-rose-400/40 bg-rose-400/10 text-rose-300",
  2: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  3: "border-slate-400/30 bg-slate-400/10 text-slate-300"
};

/** Prioritized AI recommendations with expected impact and next steps. */
export function RecommendationList({
  selectedInsight,
  onShow,
  onAction
}: Props) {
  const [open, setOpen] = useState<string | null>("rec2");
  return <Box as="section" aria-labelledby="st-recs" className="glass-tile rounded-2xl border border-white/[0.07] p-4">
      <Flex className="items-baseline justify-between gap-2">
        <Heading as="h3" id="st-recs" className="!text-[14px] !font-semibold text-slate-100">AI recommendations</Heading>
        <Text className="text-[11.5px] text-slate-500">Ranked by alignment gain, effort and evidence strength</Text>
      </Flex>
      <ol className="mt-3 space-y-2">
        {recommendations.map((r, idx) => {
        const linked = insights.filter((i) => r.insights.includes(i.id));
        const basis = linked.every((i) => i.basis === "evidence") ? "evidence" : "hypothesis";
        const expanded = open === r.id;
        const related = selectedInsight && r.insights.includes(selectedInsight);
        return <li key={r.id} className={`rounded-xl border transition-colors ${related ? "border-blue-400/40 bg-blue-500/[0.05]" : "border-white/[0.07]"}`}>
              <button type="button" aria-expanded={expanded} aria-controls={`st-rec-${r.id}`} onClick={() => setOpen(expanded ? null : r.id)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-xl">
                <span className="num w-4 shrink-0 text-[12px] text-slate-500">{idx + 1}</span>
                <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10.5px] font-semibold ${priorityChip[r.priority]}`}>P{r.priority}</span>
                <Box className="min-w-0 flex-1">
                  <Text className="truncate text-[12.5px] font-medium text-slate-100">{r.title}</Text>
                  <Text className="truncate text-[11px] text-slate-500">{r.owner} · {r.effort} effort</Text>
                </Box>
                <Text className="num hidden shrink-0 text-[12px] text-emerald-300 sm:block">+{r.alignmentGain} pts</Text>
                <BasisTag basis={basis} compact />
                <ChevronDownIcon size={14} className={`shrink-0 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden />
              </button>
              {expanded && <Box id={`st-rec-${r.id}`} className="border-t border-white/[0.06] px-3 pb-3 pt-2.5 pl-10">
                  <Text className="text-[12px] text-slate-300">{r.rationale}</Text>
                  <Text className="mt-1.5 text-[11.5px] text-slate-500">Expected impact: <span className="text-emerald-300">{r.expectedImpact}</span></Text>
                  <Text className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Next steps</Text>
                  <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-[12px] text-slate-300">
                    {r.steps.map((s) => <li key={s}>{s}</li>)}
                  </ol>
                  <Flex className="mt-2.5 flex-wrap items-center gap-2">
                    {linked.map((i) => <Button key={i.id} size="xs" variant="ghost" onClick={() => onShow(i.id)}>Show on map: {i.title.length > 38 ? `${i.title.slice(0, 38)}…` : i.title}</Button>)}
                    <Button size="xs" variant="outline" className="ml-auto" onClick={() => onAction(r.title)}>{basis === "hypothesis" ? "Create validation task" : "Create action"}</Button>
                  </Flex>
                </Box>}
            </li>;
      })}
      </ol>
    </Box>;
}
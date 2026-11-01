import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ArrowRightIcon } from "lucide-react";
import { recommendations } from "../../data/strategy";
import { InfoTip } from "../ui/InfoTip";
interface Props {
  /** Opens the first insight behind a recommendation. */
  onShow: (insightId: string) => void;
}
const pTone = {
  1: "border-rose-400/40 bg-rose-500/10 text-rose-300",
  2: "border-amber-400/40 bg-amber-500/10 text-amber-300",
  3: "border-white/[0.15] text-slate-300"
};
const sorted = [...recommendations].sort((a, b) => a.priority - b.priority || b.alignmentGain - a.alignmentGain);

/** Ranked AI recommendations with priority, owner, effort and expected gain. */
export function AiRecommendations({
  onShow
}: Props) {
  return <Box as="section" aria-labelledby="air-title" className="glass overflow-hidden rounded-2xl">
      <Flex className="items-center gap-2 px-6 pb-3 pt-5">
        <Text as="h2" id="air-title" className="text-[19px] font-semibold text-white">AI recommendations</Text>
        <span className="num rounded-md border border-white/[0.15] px-2 py-0.5 text-[13px] text-slate-200">{sorted.length}</span>
        <InfoTip label="AI recommendations">Ranked by priority, then by expected alignment gain. Select a recommendation to see the insight behind it on the map.</InfoTip>
        <Text className="ml-auto hidden text-[12.5px] text-slate-400 sm:block">Priority · Effort · Expected gain</Text>
      </Flex>
      <Box as="ol">
        {sorted.map((r, i) => <li key={r.id} className="border-t border-white/[0.06]">
            <button type="button" onClick={() => r.insights[0] && onShow(r.insights[0])} className="group grid w-full grid-cols-[20px_40px_minmax(0,1fr)_auto_20px] items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-white/[0.02] focus:outline-none focus-visible:bg-blue-500/[0.06]">
              <span className="num text-[13px] text-slate-500">{i + 1}</span>
              <span className={`flex h-7 w-9 items-center justify-center rounded-md border text-[12px] font-semibold ${pTone[r.priority]}`}>P{r.priority}</span>
              <span className="min-w-0">
                <span className="block text-[14px] font-medium text-slate-100 group-hover:text-white">{r.title}</span>
                <span className="mt-0.5 block text-[12.5px] text-slate-400">{r.owner} · {r.effort} effort</span>
              </span>
              <span className="num text-[14px] font-medium text-teal-300">+{r.alignmentGain} pts</span>
              <ArrowRightIcon size={16} className="text-slate-300 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          </li>)}
      </Box>
    </Box>;
}
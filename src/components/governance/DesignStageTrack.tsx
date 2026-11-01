import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { CheckIcon, FlaskConicalIcon, PencilLineIcon, RadioIcon } from "lucide-react";
export type DesignStage = "proposed" | "revise" | "pilot";
const chipMeta: Record<DesignStage, {
  label: string;
  cls: string;
}> = {
  proposed: {
    label: "Proposed design",
    cls: "border-violet-400/30 bg-violet-400/10 text-violet-200"
  },
  revise: {
    label: "Needs revision",
    cls: "border-amber-400/30 bg-amber-400/10 text-amber-200"
  },
  pilot: {
    label: "Approved for pilot",
    cls: "border-blue-400/30 bg-blue-400/10 text-blue-200"
  }
};
export function DesignStageChip({
  stage


}: {stage: DesignStage;}) {
  const m = chipMeta[stage];
  return <span className={`inline-flex whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${m.cls}`}>{m.label}</span>;
}

/** Proposed design → Approved pilot → Live implementation. Live is only reachable after a verified pilot. */
export function DesignStageTrack({
  stage


}: {stage: DesignStage;}) {
  const idx = stage === "pilot" ? 1 : 0;
  const stages = [{
    label: stage === "revise" ? "Proposed design · needs revision" : "Proposed design",
    note: "Not approved · no process changes made",
    Icon: stage === "revise" ? PencilLineIcon : FlaskConicalIcon
  }, {
    label: "Approved pilot",
    note: "Small-scale trial against acceptance criteria",
    Icon: CheckIcon
  }, {
    label: "Live implementation",
    note: "Only after the pilot meets its criteria",
    Icon: RadioIcon
  }];
  return <Box as="ol" aria-label="Design stage" className="grid gap-2 sm:grid-cols-3">
      {stages.map((s, i) => {
      const current = i === idx;
      const done = i < idx;
      return <Flex as="li" key={s.label} aria-current={current ? "step" : undefined} className={`items-start gap-2.5 rounded-xl border px-3 py-2.5 ${current ? stage === "revise" ? "border-amber-400/30 bg-amber-400/[0.06]" : i === 0 ? "border-violet-400/30 bg-violet-400/[0.06]" : "border-blue-400/30 bg-blue-500/[0.06]" : "border-white/[0.06] bg-white/[0.02]"}`}>
            <Flex className={`mt-0.5 h-6 w-6 shrink-0 items-center justify-center rounded-full ${current || done ? "bg-white/[0.1] text-white" : "bg-white/[0.04] text-slate-500"}`}>
              {done ? <CheckIcon size={12} aria-hidden /> : <s.Icon size={12} aria-hidden />}
            </Flex>
            <Box className="min-w-0">
              <Text className={`text-[12.5px] font-medium ${current ? "text-white" : done ? "text-slate-300" : "text-slate-500"}`}>{s.label}</Text>
              <Text className="text-[11px] leading-snug text-slate-500">{s.note}</Text>
            </Box>
          </Flex>;
    })}
    </Box>;
}
import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { GaugeIcon } from "lucide-react";
import type { MetricTone, ResponseBlock } from "../../../types/assistant";
import { ExpandableCard } from "./ExpandableCard";
type Block = Extract<ResponseBlock, {
  kind: "metrics";
}>;
const tone: Record<MetricTone, string> = {
  neutral: "text-white",
  rose: "text-rose-300",
  amber: "text-amber-300",
  teal: "text-teal-300",
  blue: "text-blue-300"
};

/** Grid of headline metrics; Expand shows the note behind each value. */
export function MetricsBlock({
  block


}: {block: Block;}) {
  const hasNotes = block.items.some((i) => i.note);
  return <ExpandableCard icon={GaugeIcon} title={block.title} meta={`${block.items.length} metrics`} preview={<Box className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {block.items.map((i) => <Box key={i.label} className="rounded-lg bg-white/[0.03] px-2.5 py-2">
              <Text className={`num text-[18px] font-semibold leading-tight ${tone[i.tone ?? "neutral"]}`}>{i.value}</Text>
              <Text className="text-[11px] leading-snug text-slate-400">{i.label}</Text>
            </Box>)}
        </Box>} details={hasNotes ? <ul className="space-y-1.5">
            {block.items.filter((i) => i.note).map((i) => <li key={i.label} className="flex items-baseline justify-between gap-3 text-[12px]">
                <span className="text-slate-300">{i.label}</span>
                <span className="text-slate-500">{i.value} · {i.note}</span>
              </li>)}
          </ul> : undefined} />;
}
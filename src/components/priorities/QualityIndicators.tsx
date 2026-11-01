import React from "react";
import { Box, Flex, Text, Tooltip } from "@chakra-ui/react";
import type { BusinessPriority } from "../../types/priorities";
const items = [{
  key: "modelConfidence",
  label: "Model confidence",
  short: "Model",
  help: "How confident the AI is in its interpretation of the pattern."
}, {
  key: "evidenceCoverage",
  label: "Evidence coverage",
  short: "Coverage",
  help: "Share of the claim backed by source records rather than inference."
}, {
  key: "dataCompleteness",
  label: "Data completeness",
  short: "Completeness",
  help: "Completeness of the underlying source data for this scope."
}] as const;
const tone = (v: number) => v >= 80 ? "bg-teal-400" : v >= 60 ? "bg-blue-400" : "bg-amber-400";
export function QualityIndicators({
  quality,
  compact = false



}: {quality: BusinessPriority["quality"];compact?: boolean;}) {
  return <Flex className={`items-center ${compact ? "gap-4" : "gap-6"}`} role="list" aria-label="Confidence and data quality">
      {items.map((it) => {
      const v = quality[it.key];
      return <Tooltip key={it.key} label={it.help} hasArrow openDelay={300}>
            <Box role="listitem" className={compact ? "w-[78px]" : "min-w-[110px] flex-1"} aria-label={`${it.label} ${v}%`}>
              <Flex className="items-baseline justify-between gap-2">
                <Text className="truncate text-[10.5px] text-slate-500">{compact ? it.short : it.label}</Text>
                <Text className="num text-[11.5px] font-medium text-slate-200">{v}%</Text>
              </Flex>
              <Box className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                <Box className={`h-full rounded-full ${tone(v)}`} style={{
              width: `${v}%`
            }} />
              </Box>
            </Box>
          </Tooltip>;
    })}
    </Flex>;
}
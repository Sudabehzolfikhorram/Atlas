import React from "react";
import { Flex, Text, Tooltip } from "@chakra-ui/react";
import { LightbulbIcon, ShieldCheckIcon, SparklesIcon } from "lucide-react";
import type { EvidenceStatus } from "../../types/intel";
export const evidenceStyles: Record<EvidenceStatus, {
  label: string;
  text: string;
  chip: string;
  hex: string;
  description: string;
  Icon: typeof ShieldCheckIcon;
}> = {
  verified: {
    label: "Verified",
    text: "text-teal-300",
    chip: "border-teal-400/30 bg-teal-400/10 text-teal-300",
    hex: "#2DD4BF",
    description: "Observed in source records or corroborated by independent evidence.",
    Icon: ShieldCheckIcon
  },
  inferred: {
    label: "AI-inferred",
    text: "text-blue-300",
    chip: "border-blue-400/30 bg-blue-400/10 text-blue-300",
    hex: "#60A5FA",
    description: "Suggested by AI from observed patterns. Not yet independently verified.",
    Icon: SparklesIcon
  },
  proposed: {
    label: "Proposed",
    text: "text-violet-300",
    chip: "border-violet-400/30 bg-violet-400/10 text-violet-300",
    hex: "#A78BFA",
    description: "Future-state change suggested by AI. Kept separate until explicitly approved.",
    Icon: LightbulbIcon
  }
};
export function EvidenceTag({
  status,
  compact = false



}: {status: EvidenceStatus;compact?: boolean;}) {
  const s = evidenceStyles[status];
  return <Tooltip label={s.description} hasArrow openDelay={300}>
      <Flex as="span" className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${s.chip}`}>
        <s.Icon size={11} aria-hidden />
        {!compact && <Text as="span">{s.label}</Text>}
      </Flex>
    </Tooltip>;
}
export function EvidenceLegend() {
  return;
}
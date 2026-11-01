import React from "react";
import { Flex, Text, Tooltip } from "@chakra-ui/react";
import { ShieldCheckIcon, SparklesIcon } from "lucide-react";
import type { InsightBasis } from "../../types/strategy";
const meta: Record<InsightBasis, {
  label: string;
  cls: string;
  tip: string;
  Icon: typeof ShieldCheckIcon;
}> = {
  evidence: {
    label: "Evidence-backed",
    cls: "border-teal-400/30 bg-teal-400/10 text-teal-300",
    tip: "Supported by verified source records on the organization map.",
    Icon: ShieldCheckIcon
  },
  hypothesis: {
    label: "AI hypothesis",
    cls: "border-dashed border-blue-400/50 bg-blue-400/[0.06] text-blue-300",
    tip: "Inferred by AI from patterns on the map. Not yet confirmed — validate before acting.",
    Icon: SparklesIcon
  }
};

/** Distinguishes evidence-backed findings from AI-generated hypotheses. */
export function BasisTag({
  basis,
  compact = false



}: {basis: InsightBasis;compact?: boolean;}) {
  const m = meta[basis];
  return <Tooltip label={m.tip} hasArrow openDelay={300}>
      <Flex as="span" className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${m.cls}`} aria-label={m.label}>
        <m.Icon size={11} aria-hidden />
        {!compact && <Text as="span">{m.label}</Text>}
      </Flex>
    </Tooltip>;
}
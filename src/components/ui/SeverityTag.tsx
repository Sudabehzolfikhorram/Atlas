import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import type { Severity } from "../../types/intel";
export const severityStyles: Record<Severity, {
  label: string;
  dot: string;
  text: string;
  bar: string;
  hex: string;
}> = {
  critical: {
    label: "Critical",
    dot: "bg-rose-400",
    text: "text-rose-300",
    bar: "bg-rose-400",
    hex: "#FB7185"
  },
  high: {
    label: "High",
    dot: "bg-amber-400",
    text: "text-amber-300",
    bar: "bg-amber-400",
    hex: "#FBBF24"
  },
  medium: {
    label: "Medium",
    dot: "bg-sky-400",
    text: "text-sky-300",
    bar: "bg-sky-400",
    hex: "#38BDF8"
  },
  low: {
    label: "Low",
    dot: "bg-slate-400",
    text: "text-slate-300",
    bar: "bg-slate-400",
    hex: "#94A3B8"
  }
};
export function SeverityTag({
  severity


}: {severity: Severity;}) {
  const s = severityStyles[severity];
  return <Flex as="span" className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      <Text as="span">{s.label}</Text>
    </Flex>;
}
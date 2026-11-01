import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
interface StatTileProps {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  tone?: "neutral" | "rose" | "amber" | "teal" | "blue";
  /** 0–100 progress bar under the value. */
  bar?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}
const toneText = {
  neutral: "text-white",
  rose: "text-rose-300",
  amber: "text-amber-300",
  teal: "text-teal-300",
  blue: "text-blue-300"
};
const toneBar = {
  neutral: "bg-slate-400",
  rose: "bg-rose-400",
  amber: "bg-amber-400",
  teal: "bg-teal-400",
  blue: "bg-blue-400"
};

/** Compact KPI card used across the Diligence tabs. */
export function StatTile({
  label,
  value,
  note,
  tone = "neutral",
  bar,
  icon,
  onClick,
  active
}: StatTileProps) {
  const body = <>
      <Flex className="items-center justify-between gap-2">
        <Text className="text-[12px] text-slate-400">{label}</Text>
        {icon && <span className="text-slate-500">{icon}</span>}
      </Flex>
      <Text className={`num mt-1.5 text-[26px] font-semibold leading-none tracking-tight ${toneText[tone]}`}>{value}</Text>
      {bar !== undefined && <Box className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.07]">
          <Box className={`h-full rounded-full ${toneBar[tone]}`} style={{
        width: `${Math.min(100, Math.max(0, bar))}%`
      }} />
        </Box>}
      {note && <Text className="mt-2 text-[11.5px] leading-snug text-slate-500">{note}</Text>}
    </>;
  const cls = `glass-tile rounded-2xl border px-4 py-3.5 text-left transition-colors ${active ? "border-blue-400/50 bg-blue-500/[0.07]" : "border-white/[0.07]"}`;
  return onClick ? <button type="button" onClick={onClick} aria-pressed={active} className={`${cls} hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400`}>
      {body}
    </button> : <Box className={cls}>{body}</Box>;
}
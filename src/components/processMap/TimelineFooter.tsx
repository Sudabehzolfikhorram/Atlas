import React from "react";
import { Box, Flex, IconButton, Text, Tooltip } from "@chakra-ui/react";
import { PauseIcon, PlayIcon } from "lucide-react";
import { timelineMonths } from "../../data/processMaps";
import type { PeriodKey } from "../../types/processMap";
import { LAST_MONTH, periodStart } from "../../utils/processMap";
interface Props {
  period: PeriodKey;
  month: number;
  onMonth: (m: number) => void;
  playing: boolean;
  onTogglePlay: () => void;
  playDisabledReason?: string;
  snapshotLabel: string;
  count: React.ReactNode;
  sliderLabel: string;
}
export function TimelineFooter({
  period,
  month,
  onMonth,
  playing,
  onTogglePlay,
  playDisabledReason,
  snapshotLabel,
  count,
  sliderLabel
}: Props) {
  const start = periodStart(period);
  const visible = timelineMonths.slice(start);
  const playBtn = <IconButton aria-label={playing ? "Pause monthly snapshots" : "Play monthly snapshots"} icon={playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />} onClick={onTogglePlay} isDisabled={!!playDisabledReason} size="sm" className="!h-8 !w-8 !min-w-0 !rounded-lg" />;
  return <Flex className="flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/[0.06] px-4 py-3 md:flex-nowrap md:px-5">
      {playDisabledReason ? <Tooltip label={playDisabledReason} hasArrow><span>{playBtn}</span></Tooltip> : playBtn}
      <Box className="w-[120px] shrink-0">
        <Text className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500">{snapshotLabel}</Text>
        <Text className="num text-[12.5px] font-medium text-slate-100" aria-live="polite">{timelineMonths[month].full}</Text>
      </Box>
      <Box className="order-last w-full min-w-0 md:order-none md:flex-1">
        <input type="range" min={start} max={LAST_MONTH} step={1} value={month} onChange={(e) => onMonth(Number(e.target.value))} aria-label={sliderLabel} aria-valuetext={timelineMonths[month].full} disabled={start === LAST_MONTH} className="block h-1 w-full cursor-pointer accent-violet-400" />
        <Flex className="mt-2 justify-between px-0.5" aria-hidden>
          {visible.map((m, i) => <Text key={m.full} className={`num text-[10px] ${start + i === month ? "font-medium text-violet-200" : "text-slate-500"}`}>{m.short}</Text>)}
        </Flex>
      </Box>
      <Text className="ml-auto shrink-0 whitespace-nowrap text-right text-[11.5px] text-slate-400 md:ml-0">{count}</Text>
    </Flex>;
}
import React from "react";
import { Box, Flex, Text, Tooltip } from "@chakra-ui/react";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import type { PlanTask } from "../../types/intel";
import { taskStatusMeta } from "../../utils/taskStatus";
const RANGE_START = parseISO("2026-09-28");
const RANGE_END = parseISO("2026-12-20");
const TODAY = parseISO("2026-10-12");
const TOTAL = differenceInCalendarDays(RANGE_END, RANGE_START);
function pct(iso: string | Date) {
  const d = typeof iso === "string" ? parseISO(iso) : iso;
  return differenceInCalendarDays(d, RANGE_START) / TOTAL * 100;
}
export function GanttTimeline({
  tasks


}: {tasks: PlanTask[];}) {
  const weeks = Array.from({
    length: Math.ceil(TOTAL / 7)
  }).map((_, i) => addDays(RANGE_START, i * 7));
  return <Box className="overflow-x-auto">
      <Box className="min-w-[900px]">
        <Flex className="border-b border-white/[0.06] pb-2">
          <Box className="w-[260px] shrink-0 text-[11px] uppercase tracking-wider text-slate-500">Task</Box>
          <Box className="relative h-4 flex-1">
            {weeks.map((w) => <Text key={w.toISOString()} className="absolute text-[10.5px] text-slate-500" style={{
            left: `${pct(w)}%`
          }}>
                {format(w, "MMM d")}
              </Text>)}
          </Box>
        </Flex>
        <Box className="relative">
          <Box className="pointer-events-none absolute bottom-0 top-0 z-10" style={{
          left: `calc(260px + (100% - 260px) * ${pct(TODAY) / 100})`
        }}>
            <Box className="h-full w-px bg-amber-400/70" />
            <Text className="absolute -top-0.5 left-1 rounded bg-amber-400/15 px-1 text-[10px] text-amber-300">Today</Text>
          </Box>
          {tasks.map((t) => {
          const left = pct(t.start);
          const width = Math.max(1.5, pct(t.due) - left);
          const meta = taskStatusMeta[t.status];
          return <Flex key={t.id} className="items-center border-b border-white/[0.04] py-2.5">
                <Box className="w-[260px] shrink-0 pr-4">
                  <Text className="truncate text-[13px] text-slate-200">{t.name}</Text>
                  <Text className="truncate text-[11px] text-slate-500">{t.owner}</Text>
                </Box>
                <Box className="relative h-7 flex-1">
                  {weeks.map((w) => <span key={w.toISOString()} className="absolute bottom-0 top-0 w-px bg-white/[0.03]" style={{
                left: `${pct(w)}%`
              }} />)}
                  <Tooltip hasArrow label={`${t.id} · ${format(parseISO(t.start), "MMM d")} → ${format(parseISO(t.due), "MMM d")} · ${t.progress}%${t.dependencies.length ? ` · depends on ${t.dependencies.join(", ")}` : ""}`}>
                    <Box className={`absolute top-1 h-5 overflow-hidden rounded-md border border-white/10 bg-white/[0.06] ${t.status === "blocked" ? "ring-1 ring-rose-400/60" : ""}`} style={{
                  left: `${left}%`,
                  width: `${width}%`
                }} tabIndex={0} aria-label={`${t.name}, ${meta.label}, ${t.progress}% complete`}>
                      <Box className={`h-full ${meta.bar} opacity-80`} style={{
                    width: `${Math.max(t.progress, 3)}%`
                  }} />
                      <Text className="num absolute inset-0 flex items-center px-2 text-[10.5px] font-medium text-white">{t.progress}%</Text>
                    </Box>
                  </Tooltip>
                </Box>
              </Flex>;
        })}
        </Box>
      </Box>
    </Box>;
}
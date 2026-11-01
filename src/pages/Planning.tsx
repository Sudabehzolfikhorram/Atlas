import React, { useMemo, useState } from "react";
import { Box, Button, ButtonGroup, Flex, Select, Text } from "@chakra-ui/react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { CalendarRangeIcon, GitMergeIcon, LayoutGridIcon, LinkIcon } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { useScreenInit } from "../useScreenInit.js";
import { Panel } from "../components/ui/Panel";
import { ProgressBar } from "../components/ui/ProgressBar";
import { GanttTimeline } from "../components/planning/GanttTimeline";
import { priorityMeta, taskStatusMeta } from "../utils/taskStatus";
import { initiative, tasks } from "../data/tasks";
import type { TaskStatus } from "../types/intel";
const TODAY = parseISO("2026-10-12");
const statusOrder: TaskStatus[] = ["blocked", "awaiting_approval", "in_progress", "planned", "completed"];
export function Planning() {
  const screenInit = useScreenInit();
  const [view, setView] = useState<"timeline" | "list">(screenInit?.view as "timeline" | "list" ?? "timeline");
  const [owner, setOwner] = useState("All");
  const [dept, setDept] = useState("All");
  const [priority, setPriority] = useState("All");
  const [status, setStatus] = useState("All");
  const [deadline, setDeadline] = useState("All");
  const owners = useMemo(() => Array.from(new Set(tasks.map((t) => t.owner))), []);
  const depts = useMemo(() => Array.from(new Set(tasks.map((t) => t.department))), []);
  const filtered = tasks.filter((t) => {
    if (owner !== "All" && t.owner !== owner) return false;
    if (dept !== "All" && t.department !== dept) return false;
    if (priority !== "All" && t.priority !== priority) return false;
    if (status !== "All" && t.status !== status) return false;
    if (deadline !== "All") {
      const days = differenceInCalendarDays(parseISO(t.due), TODAY);
      if (deadline === "14" && (days < 0 || days > 14)) return false;
      if (deadline === "30" && (days < 0 || days > 30)) return false;
      if (deadline === "overdue" && (days >= 0 || t.status === "completed")) return false;
    }
    return true;
  });
  const overall = Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length);
  const counts = statusOrder.map((s) => ({
    s,
    n: tasks.filter((t) => t.status === s).length
  }));
  const totalDays = differenceInCalendarDays(parseISO(initiative.end), parseISO(initiative.start));
  const elapsed = Math.round(differenceInCalendarDays(TODAY, parseISO(initiative.start)) / totalDays * 100);
  return <Box className="space-y-6">
      <PageHeader eyebrow="Section E · Execution" title="Upcoming Plans & Operational Execution" description="Recommendations translated into scheduled, accountable actions — each linked back to the signal or decision that created it." />

      <Box role="group" aria-label="Status breakdown" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {counts.map(({
        s,
        n
      }) => <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(status === s ? "All" : s)} className={`glass rounded-2xl border px-4 py-4 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${status === s ? "!border-white/30 bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}>
            <Text className={`num text-[26px] font-medium leading-none ${taskStatusMeta[s].text}`}>{n}</Text>
            <Flex className="mt-2 items-center justify-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${taskStatusMeta[s].dot}`} aria-hidden />
              <Text className="text-[12px] leading-tight text-slate-400">{taskStatusMeta[s].label}</Text>
            </Flex>
          </button>)}
      </Box>

      <Box>
        <Panel eyebrow="Initiative" title={initiative.name} subtitle={`Sponsor: ${initiative.owner} · ${format(parseISO(initiative.start), "MMM d")} – ${format(parseISO(initiative.end), "MMM d, yyyy")}`}>
          <Flex className="items-end gap-6">
            <Box>
              <Text className="num text-[34px] font-medium leading-none text-white">{overall}%</Text>
              <Text className="mt-1 text-[12px] text-slate-500">overall completion</Text>
            </Box>
            <Box className="flex-1 space-y-2.5">
              <Box>
                <Flex className="mb-1 justify-between text-[11px] text-slate-500"><span>Task progress</span><span>{overall}%</span></Flex>
                <ProgressBar value={overall} color="bg-blue-500" height="h-2" label="Overall progress" />
              </Box>
              <Box>
                <Flex className="mb-1 justify-between text-[11px] text-slate-500"><span>Time elapsed</span><span>{elapsed}%</span></Flex>
                <ProgressBar value={elapsed} color="bg-slate-500" height="h-2" label="Time elapsed" />
              </Box>
            </Box>
          </Flex>
        </Panel>
      </Box>

      <Box role="group" aria-label="Task filters" className="glass grid grid-cols-1 gap-2 rounded-2xl px-4 py-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <Select aria-label="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} className="!w-full">
          <option value="All">All owners</option>
          {owners.map((o) => <option key={o}>{o}</option>)}
        </Select>
        <Select aria-label="Department" value={dept} onChange={(e) => setDept(e.target.value)} className="!w-full">
          <option value="All">All departments</option>
          {depts.map((o) => <option key={o}>{o}</option>)}
        </Select>
        <Select aria-label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="!w-full">
          <option value="All">All priorities</option>
          <option>P1</option><option>P2</option><option>P3</option>
        </Select>
        <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className="!w-full">
          <option value="All">All statuses</option>
          {statusOrder.map((s) => <option key={s} value={s}>{taskStatusMeta[s].label}</option>)}
        </Select>
        <Select aria-label="Deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="!w-full">
          <option value="All">Any deadline</option>
          <option value="14">Due in 14 days</option>
          <option value="30">Due in 30 days</option>
          <option value="overdue">Overdue</option>
        </Select>
      </Box>

      <Panel id="planning-tasks" title={`${filtered.length} tasks`} actions={<ButtonGroup size="sm" isAttached role="group" aria-label="View">
            <Button leftIcon={<CalendarRangeIcon size={13} />} onClick={() => setView("timeline")} aria-pressed={view === "timeline"} className={view === "timeline" ? "!bg-white/[0.12] !text-white" : "!text-slate-400"}>Timeline</Button>
            <Button leftIcon={<LayoutGridIcon size={13} />} onClick={() => setView("list")} aria-pressed={view === "list"} className={view === "list" ? "!bg-white/[0.12] !text-white" : "!text-slate-400"}>Card</Button>
          </ButtonGroup>}>
      {filtered.length === 0 ? <Text className="py-10 text-center text-[13px] text-slate-500">No tasks match these filters.</Text> : view === "timeline" ? <GanttTimeline tasks={filtered} /> : <Box className="space-y-6">
          {statusOrder.map((s) => {
          const group = filtered.filter((t) => t.status === s);
          if (!group.length) return null;
          return <Box key={s}>
                <Flex className="mb-2 items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${taskStatusMeta[s].dot}`} />
                  <Text className="text-[13px] font-medium text-slate-200">{taskStatusMeta[s].label}</Text>
                  <Text className="text-[12px] text-slate-500">{group.length}</Text>
                </Flex>
                <Box className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                  {group.map((t) => <Box key={t.id} as="article" className="glass rounded-2xl p-4">
                      <Flex className="items-center gap-2">
                        <Text className="num text-[11px] text-slate-500">{t.id}</Text>
                        <span className={`rounded border px-1.5 text-[10.5px] font-medium ${priorityMeta[t.priority]}`}>{t.priority}</span>
                        <Text className={`ml-auto text-[11px] font-medium ${taskStatusMeta[t.status].text}`}>{taskStatusMeta[t.status].label}</Text>
                      </Flex>
                      <Text className="mt-2 text-[14px] font-medium text-slate-100">{t.name}</Text>
                      <Text className="mt-1 text-[12px] leading-relaxed text-slate-400">{t.description}</Text>
                      <Box className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                        <Box><Text className="text-slate-500">Owner</Text><Text className="text-slate-200">{t.owner}</Text><Text className="text-[11px] text-slate-500">{t.ownerRole}</Text></Box>
                        <Box><Text className="text-slate-500">Dates</Text><Text className="text-slate-200">{format(parseISO(t.start), "MMM d")} → {format(parseISO(t.due), "MMM d")}</Text><Text className="text-[11px] text-slate-500">{t.department} · {t.category}</Text></Box>
                      </Box>
                      <Box className="mt-3">
                        <Flex className="mb-1 justify-between text-[11px] text-slate-500"><span>Progress</span><span className="num">{t.progress}%</span></Flex>
                        <ProgressBar value={t.progress} color={taskStatusMeta[t.status].bar} label={`${t.name} progress`} />
                      </Box>
                      <Flex className="mt-3 flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/[0.05] pt-3 text-[11px] text-slate-400">
                        <Flex className="items-center gap-1"><LinkIcon size={11} />{t.recommendation}</Flex>
                        {t.dependencies.length > 0 && <Flex className="items-center gap-1"><GitMergeIcon size={11} />Depends on {t.dependencies.join(", ")}</Flex>}
                      </Flex>
                    </Box>)}
                </Box>
              </Box>;
        })}
        </Box>}
      </Panel>
    </Box>;
}
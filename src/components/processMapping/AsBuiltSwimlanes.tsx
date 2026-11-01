import React, { useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import { crossLinks, stageFindings, swimlanes } from "../../data/processMapping";
interface Props {
  laneIds: string[];
  onTrace: () => void;
}

/** The original as-built swimlane map: departments, stages, wait vs work and cross-department handoffs. */
export function AsBuiltSwimlanes({
  laneIds,
  onTrace
}: Props) {
  const navigate = useNavigate();
  const lanes = swimlanes.filter((l) => laneIds.includes(l.id));
  const [selectedId, setSelectedId] = useState("p-gate");
  const lane = lanes.find((l) => l.steps.some((s) => s.id === selectedId)) ?? lanes[0];
  const step = lane.steps.find((s) => s.id === selectedId) ?? lane.steps[0];
  const finding = stageFindings[step.id];
  const waitShare = Math.round(step.wait / (step.wait + step.work) * 100);
  return <Box className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_270px]">
      <Box className="min-w-0">
        <Box className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-4">
          <Flex className="mb-3 justify-between text-[12px] uppercase tracking-[0.06em] text-slate-400">
            <span>Organization · As-built workflows</span>
            <span>Illustrative · hours</span>
          </Flex>
          {lanes.map((l, li) => {
          const link = crossLinks.find((c) => c.afterLane === l.id);
          return <React.Fragment key={l.id}>
                <Box className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <Flex className="mb-3 flex-wrap items-baseline gap-x-6">
                    <Text className="min-w-[120px] text-[15px] font-medium text-slate-100 lg:w-[25%]">{l.name}</Text>
                    <Text className="text-[13px] text-slate-400">{l.workflow}</Text>
                    <Text className="ml-auto text-[12px] text-slate-500">In scope</Text>
                  </Flex>
                  <Flex className="flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap lg:items-start lg:gap-0">
                    {l.steps.map((s, i) => {
                  const sel = s.id === step.id;
                  const f = stageFindings[s.id];
                  const workPct = s.work / (s.work + s.wait) * 100;
                  return <React.Fragment key={s.id}>
                          <Box className="min-w-0 sm:w-[calc(50%-6px)] lg:w-auto lg:flex-1">
                            <button type="button" aria-pressed={sel} onClick={() => setSelectedId(s.id)} className={`w-full rounded-xl border px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${sel ? "border-blue-400 bg-blue-500/[0.08]" : f && f.severity !== "Low" ? "border-amber-400/70 bg-white/[0.03] hover:border-amber-300" : "border-white/[0.1] bg-white/[0.03] hover:border-white/20"}`}>
                              <Flex className="items-start justify-between gap-2">
                                <Text className="text-[14px] font-medium text-slate-100">{s.name}</Text>
                                {f && <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${f.severity === "Low" ? "bg-slate-400" : "bg-amber-400"}`} aria-label={`${f.severity} finding`} />}
                              </Flex>
                              <Text className="num mt-1 text-[12px] text-slate-400">{s.wait}h wait · {s.work}h work</Text>
                            </button>
                            <Flex className="mt-2 h-[3px] overflow-hidden rounded-full" aria-hidden>
                              <span className="bg-teal-400" style={{
                          width: `${workPct}%`
                        }} />
                              <span className="flex-1 bg-amber-400" />
                            </Flex>
                          </Box>
                          {i < l.steps.length - 1 && <Flex className="hidden w-10 shrink-0 items-center pt-[26px] lg:flex" aria-hidden>
                              <span className="h-px flex-1 bg-blue-400/60" />
                              <span className="border-y-[5px] border-l-[7px] border-y-transparent border-l-blue-400" />
                            </Flex>}
                        </React.Fragment>;
                })}
                  </Flex>
                </Box>
                {link && li < lanes.length - 1 && <Flex className="items-center gap-3 px-[12%] py-2 text-[11.5px] text-violet-300">
                    <span className="flex-1 border-t border-dashed border-violet-400/70" />
                    {link.label}
                    <span className="flex-1 border-t border-dashed border-violet-400/70" />
                  </Flex>}
              </React.Fragment>;
        })}
        </Box>
        <Flex className="mt-3 flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px]">
          <Flex className="items-center gap-1.5 text-teal-300"><span className="h-0.5 w-3 bg-teal-400" />Processing time</Flex>
          <Flex className="items-center gap-1.5 text-amber-300"><span className="h-0.5 w-3 bg-amber-400" />Waiting time · <span className="h-2 w-2 rounded-full bg-amber-400" />Problem</Flex>
          <Flex className="items-center gap-1.5 text-violet-300"><span className="w-3 border-t border-dashed border-violet-400" />Cross-department dependency</Flex>
        </Flex>
        <Text className="mt-2 text-[11.5px] text-slate-500">Durations are fixed sample measurements; bar proportions compare work with wait within each stage.</Text>
      </Box>

      <Box as="aside" aria-live="polite" className="glass-tile rounded-2xl p-4">
        <Text className="text-[11px] font-medium uppercase tracking-[0.08em] text-blue-300">{lane.name} · Stage {lane.steps.indexOf(step) + 1}</Text>
        <Text className="mt-1 text-[16px] font-semibold text-white">{step.name}</Text>
        <Text className="text-[12.5px] text-slate-400">{step.owner}</Text>
        <Flex className="mt-3 items-baseline gap-1">
          <Text className="num text-[32px] font-medium leading-none text-white">{step.wait}</Text>
          <Text className="text-[11px] text-slate-500">h sample wait</Text>
        </Flex>
        <Text className={`mt-1.5 text-[11.5px] ${finding && finding.severity !== "Low" ? "text-amber-300" : "text-teal-300"}`}>
          {finding && finding.severity !== "Low" ? "Potential bottleneck" : "Within expected range"} · sample measurement
        </Text>
        <Flex className="mt-2 h-1 overflow-hidden rounded-full" aria-hidden>
          <span className="bg-teal-400" style={{
          width: `${100 - waitShare}%`
        }} />
          <span className="flex-1 bg-amber-400" />
        </Flex>
        <Text className="num mt-1.5 text-[11.5px] text-slate-500">{step.work}h processing · {waitShare}% of stage time waiting</Text>
        {finding ? <>
            <span className="mt-3 inline-flex rounded-md border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[11.5px] font-medium text-amber-300">{finding.severity} · {finding.title}</span>
            <Text className="mt-3 text-[12.5px] leading-relaxed text-slate-300">{finding.note}</Text>
            <Text className="mt-3 text-[10.5px] uppercase tracking-[0.08em] text-slate-500">Evidence source</Text>
            <Text className="text-[12.5px] text-slate-300">{finding.evidence}</Text>
          </> : <Text className="mt-3 text-[12.5px] text-slate-400">No open finding at this stage.</Text>}
        <Flex className="mt-4 flex-col gap-2">
          <Button size="sm" variant="primary" rightIcon={<ArrowRightIcon size={13} />} onClick={() => navigate("/process")}>Explore problem</Button>
          <Button size="sm" variant="outline" onClick={onTrace}>Trace data supply chain</Button>
        </Flex>
      </Box>
    </Box>;
}
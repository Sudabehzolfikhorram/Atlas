import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, Heading, Select, Text } from "@chakra-ui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRightIcon, InfoIcon, PauseIcon, PlayIcon, PlugZapIcon, SkipForwardIcon, SparklesIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EventDrawer } from "./EventDrawer";
import { DemoScenarioPanel } from "./DemoScenarioPanel";
import { demoFindingId } from "../../data/demoScenario";
import { useDiligence } from "../../contexts/DiligenceContext";
import { useTheme } from "../../contexts/ThemeContext";
import { connectors, departments } from "../../data/diligence";
import { eventTypeMeta, fmtAgo } from "../../utils/diligence";
import { checkTrend } from "../../utils/workflow";
import { DemoTag } from "./WorkflowStatus";
import { severityStyles } from "../ui/SeverityTag";
import type { Severity } from "../../types/intel";
import type { Department, DiligenceArea, MonitorEvent, MonitorEventType } from "../../types/diligence";
const ranges = [{
  id: "15",
  label: "Last 15 min",
  ms: 15 * 60000
}, {
  id: "60",
  label: "Last hour",
  ms: 3600000
}, {
  id: "1440",
  label: "Last 24 hours",
  ms: 86400000
}];
const monitorStates = [{
  id: "active",
  label: "Active",
  dot: "bg-teal-400"
}, {
  id: "paused",
  label: "Paused",
  dot: "bg-amber-400"
}, {
  id: "delayed",
  label: "Delayed",
  dot: "bg-orange-400"
}, {
  id: "unavailable",
  label: "Unavailable",
  dot: "bg-rose-400"
}] as const;

/** Simulated monitoring of sample events for the selected area. */
export function QualityControlTab({
  area,
  focusId



}: {area: DiligenceArea;focusId?: string | null;}) {
  const {
    events,
    running,
    setRunning,
    advance,
    findings,
    openFinding,
    runs
  } = useDiligence();
  const focusFinding = focusId ? findings.find((f) => f.id === focusId && f.area === area) : undefined;
  const light = useTheme().resolved === "light";
  const reduce = useReducedMotion();
  const [scope, setScope] = useState<DiligenceArea | "all">(area);
  const [sev, setSev] = useState<Severity | "all">("all");
  const [team, setTeam] = useState<Department | "all">("all");
  const [type, setType] = useState<MonitorEventType | "all">("all");
  const [range, setRange] = useState("1440");
  const [selected, setSelected] = useState<MonitorEvent | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => setScope(area), [area]);
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(t);
  }, []);
  useEffect(() => setNow(Date.now()), [events]);
  useEffect(() => () => setRunning(false), [setRunning]);
  const windowMs = ranges.find((r) => r.id === range)!.ms;
  const shown = useMemo(() => events.filter((e) => (scope === "all" || e.area === scope) && (sev === "all" || e.severity === sev) && (team === "all" || e.team === team) && (type === "all" || e.type === type) && now - e.at <= windowMs), [events, scope, sev, team, type, windowMs, now]);
  const inArea = events.filter((e) => scope === "all" || e.area === scope);
  const counts = (["normal", "warning", "gap", "redflag"] as MonitorEventType[]).map((t) => ({
    t,
    n: inArea.filter((e) => e.type === t).length
  }));
  const areaRuns = runs.filter((r) => r.area === area);
  const trend = checkTrend(areaRuns);
  const lastRun = areaRuns[areaRuns.length - 1];
  const recurring = Object.entries(inArea.filter((e) => e.type !== "normal").reduce<Record<string, number>>((acc, e) => ({
    ...acc,
    [e.relatedFindingId ?? e.title]: (acc[e.relatedFindingId ?? e.title] ?? 0) + 1
  }), {})).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const recs = inArea.filter((e) => e.type === "redflag" || e.type === "gap").slice(0, 3);
  const state = running ? "active" : "paused";
  const last = events[0];
  const axis = light ? "#64748B" : "#94A3B8";
  return <Box className="space-y-5">
      {focusFinding && focusFinding.id !== demoFindingId && <Flex className="flex-wrap items-center gap-2.5 rounded-xl border border-blue-400/30 bg-blue-500/[0.06] px-4 py-2.5 text-[12.5px] text-slate-200">
          <span className="num rounded-md border border-blue-400/35 bg-blue-500/10 px-1.5 py-0.5 text-[11.5px] text-blue-200">{focusFinding.id}</span>
          <span className="min-w-0 flex-1 truncate">{focusFinding.title}</span>
          <span className="text-[11.5px] text-slate-400">No automated check is defined for this finding in the demo.</span>
          <Button size="xs" variant="outline" onClick={() => openFinding(focusFinding.id)}>Open finding</Button>
        </Flex>}
      {area === "process" ? <DemoScenarioPanel highlight={focusId === demoFindingId} /> : <Flex className="items-start gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[12.5px] text-slate-400">
          <InfoIcon size={14} className="mt-0.5 shrink-0 text-slate-500" aria-hidden />
          <span>The demo control check (purchase approval, F-01) belongs to QAN → Process. Data findings have no automated verification test in this demo.</span>
        </Flex>}

      <Flex className="flex-wrap items-start gap-2.5 rounded-xl border border-blue-400/25 bg-blue-500/[0.06] px-4 py-2.5 text-[12.5px] text-slate-300">
        <InfoIcon size={14} className="mt-0.5 shrink-0 text-blue-300" aria-hidden />
        <span className="min-w-0 flex-1">The monitoring feed below replays preset sample events in your browser. No enterprise system is connected and nothing at Meridian Energy is being monitored. Violations are added to their related finding as occurrences, once per event.</span>
        <DemoTag />
      </Flex>

      {/* Monitoring status */}
      <Flex className="glass flex-col gap-3 rounded-2xl px-5 py-4 md:flex-row md:items-center">
        <Box className="min-w-0">
          <Flex className="items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {running && !reduce && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />}
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${running ? "bg-teal-400" : "bg-amber-400"}`} />
            </span>
            <Text className="text-[13.5px] font-semibold text-slate-100">Simulated monitoring · {running ? "replaying sample events" : "paused"}</Text>
            <DemoTag />
          </Flex>
          <Text className="mt-0.5 text-[12px] text-slate-400">0 connected systems · last sample event {last ? fmtAgo(last.at, now) : "none yet"}</Text>
          <Flex className="mt-2 flex-wrap gap-1.5" role="list" aria-label="Monitoring states">
            {monitorStates.map((s) => <span key={s.id} role="listitem" aria-current={s.id === state} className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] ${s.id === state ? "border-white/20 bg-white/[0.06] text-slate-100" : "border-white/[0.06] text-slate-500"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />{s.label}
              </span>)}
          </Flex>
        </Box>
        <Flex className="gap-2 md:ml-auto">
          <Button variant="primary" size="sm" leftIcon={running ? <PauseIcon size={13} /> : <PlayIcon size={13} />} onClick={() => setRunning(!running)}>
            {running ? "Pause simulation" : "Start simulation"}
          </Button>
          <Button variant="outline" size="sm" leftIcon={<SkipForwardIcon size={13} />} onClick={advance}>Add one sample event</Button>
        </Flex>
      </Flex>


      <Box className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Live feed */}
        <Box as="section" aria-labelledby="dil-feed" className="glass flex min-h-[520px] flex-col rounded-2xl">
          <Flex className="flex-col gap-3 px-5 pb-3 pt-4">
            <Flex className="items-center justify-between gap-2">
              <Box>
                <Heading as="h3" id="dil-feed" className="!text-[15px] !font-semibold text-slate-100">Simulated activity feed</Heading>
                <Text className="text-[12px] text-slate-400">Most recent first · {shown.length} sample events</Text>
              </Box>
              <DemoTag />
            </Flex>
            <Flex className="flex-wrap gap-2">
              <Select size="sm" value={scope} onChange={(e) => setScope(e.target.value as DiligenceArea | "all")} aria-label="Area" className="!w-[110px] !rounded-lg">
                <option value="data">Data</option><option value="process">Process</option><option value="all">Both</option>
              </Select>
              <Select size="sm" value={type} onChange={(e) => setType(e.target.value as MonitorEventType | "all")} aria-label="Event type" className="!w-[130px] !rounded-lg">
                <option value="all">All types</option>
                {(Object.keys(eventTypeMeta) as MonitorEventType[]).map((t) => <option key={t} value={t}>{eventTypeMeta[t].label}</option>)}
              </Select>
              <Select size="sm" value={sev} onChange={(e) => setSev(e.target.value as Severity | "all")} aria-label="Severity" className="!w-[130px] !rounded-lg">
                <option value="all">All severities</option>
                {(["critical", "high", "medium", "low"] as Severity[]).map((s) => <option key={s} value={s}>{severityStyles[s].label}</option>)}
              </Select>
              <Select size="sm" value={team} onChange={(e) => setTeam(e.target.value as Department | "all")} aria-label="Team" className="!w-[130px] !rounded-lg">
                <option value="all">All teams</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
              <Select size="sm" value={range} onChange={(e) => setRange(e.target.value)} aria-label="Time range" className="!w-[140px] !rounded-lg">
                {ranges.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </Select>
            </Flex>
          </Flex>
          <Box as="ul" aria-live="polite" className="max-h-[560px] flex-1 overflow-y-auto border-t border-white/[0.06]">
            <AnimatePresence initial={false}>
              {shown.map((e) => {
              const m = eventTypeMeta[e.type];
              return <motion.li key={e.id} layout={!reduce} initial={reduce ? false : {
                opacity: 0,
                y: -8
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0
              }} transition={{
                duration: 0.25
              }}>
                    <button type="button" onClick={() => setSelected(e)} className="group flex w-full items-start gap-3 border-b border-white/[0.05] px-5 py-3 text-left transition-colors hover:bg-white/[0.03] focus:outline-none focus-visible:bg-blue-500/[0.07]">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.dot}`} aria-hidden />
                      <Box className="min-w-0 flex-1">
                        <Flex className="flex-wrap items-center gap-x-2 gap-y-1">
                          <span className={`rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium ${m.chip}`}>{m.label}</span>
                          <Text className="text-[13px] font-medium text-slate-100">{e.title}</Text>
                        </Flex>
                        <Text className="mt-0.5 line-clamp-1 text-[12px] text-slate-400">{e.explanation}</Text>
                        <Text className="mt-0.5 text-[11px] text-slate-500">{e.source} · {e.team} · {e.area === "data" ? "Data" : "Process"}{e.relatedFindingId && ` · ${e.relatedFindingId}`}</Text>
                      </Box>
                      <Text className="num shrink-0 text-[11px] text-slate-500">{fmtAgo(e.at, now)}</Text>
                      <ChevronRightIcon size={14} className="mt-0.5 shrink-0 text-slate-600 group-hover:text-slate-300" aria-hidden />
                    </button>
                  </motion.li>;
            })}
            </AnimatePresence>
            {shown.length === 0 && <li className="px-5 py-12 text-center text-[13px] text-slate-400">No events match these filters. Start the simulation or widen the time range.</li>}
          </Box>
        </Box>

        {/* Right column */}
        <Box className="space-y-4">
          <Box as="section" aria-labelledby="dil-class" className="glass rounded-2xl p-5">
            <Heading as="h3" id="dil-class" className="!text-[15px] !font-semibold text-slate-100">Event classification</Heading>
            <Flex className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
              {counts.map(({
              t,
              n
            }) => n > 0 && <Box key={t} style={{
              width: `${n / Math.max(1, inArea.length) * 100}%`,
              background: eventTypeMeta[t].hex
            }} />)}
            </Flex>
            <Box className="mt-3 grid grid-cols-2 gap-2">
              {counts.map(({
              t,
              n
            }) => <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(type === t ? "all" : t)} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[12px] transition-colors ${type === t ? "border-blue-400/50 bg-blue-500/[0.07]" : "border-white/[0.06] hover:border-white/20"}`}>
                  <span className={`h-2 w-2 rounded-full ${eventTypeMeta[t].dot}`} aria-hidden />
                  <span className="text-slate-300">{eventTypeMeta[t].label}</span>
                  <span className="num ml-auto text-slate-100">{n}</span>
                </button>)}
            </Box>
          </Box>

          <Box as="section" aria-labelledby="dil-trend" className="glass rounded-2xl p-5">
            <Heading as="h3" id="dil-trend" className="!text-[15px] !font-semibold text-slate-100">{area === "data" ? "Data" : "Process"} check results</Heading>
            <Text className="text-[11.5px] text-slate-500">Share of records passing each recorded sample check run</Text>
            {trend.length === 0 ? <Box className="mt-3 rounded-xl border border-dashed border-white/[0.1] px-4 py-6 text-center">
                <Text className="text-[12.5px] text-slate-300">No check results recorded yet</Text>
                <Text className="mt-1 text-[11.5px] text-slate-500">{area === "process" ? "Run the simulated pre-remediation check or verification above to plot a result." : "No sample check is defined for Data findings in this demo."}</Text>
              </Box> : <>
            <Box className="mt-2 h-[120px]" aria-label="Check result trend">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{
                  top: 6,
                  right: 4,
                  left: -28,
                  bottom: 0
                }}>
                  <XAxis dataKey="t" tick={{
                    fill: axis,
                    fontSize: 10
                  }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{
                    fill: axis,
                    fontSize: 10
                  }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={{
                    background: light ? "#fff" : "#0F172A",
                    border: "1px solid rgba(148,163,184,0.25)",
                    borderRadius: 10,
                    fontSize: 12
                  }} formatter={(v, _n, p) => [`${v}% · ${p.payload.passed}/${p.payload.evaluated} passed · ${p.payload.sample}`, p.payload.kind]} />
                  <Area type="monotone" dataKey="score" name="Compliant" stroke="#3B82F6" strokeWidth={2} fill="#3B82F6" fillOpacity={0.12} dot={{
                    r: 3
                  }} isAnimationActive={!reduce} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
            {lastRun && <Text className="mt-1.5 text-[11.5px] text-slate-400">Latest: {lastRun.id} · {lastRun.passed}/{lastRun.evaluated} passed ({Math.round(lastRun.passed / lastRun.evaluated * 100)}%) on sample {lastRun.sampleId} · {areaRuns.length} run{areaRuns.length === 1 ? "" : "s"} recorded</Text>}
            </>}
            <Text className="mt-3 text-[12px] font-medium text-slate-300">Recurring issues</Text>
            <Box as="ul" className="mt-1.5 space-y-1">
              {recurring.length ? recurring.map(([k, n]) => <Flex as="li" key={k} className="items-center justify-between text-[12px]">
                  <span className="truncate text-slate-400">{k}</span>
                  <span className={`num ${n > 1 ? "text-amber-300" : "text-slate-500"}`}>{n}×{n > 1 && " · emerging"}</span>
                </Flex>) : <Text className="text-[12px] text-slate-500">None yet.</Text>}
            </Box>
          </Box>

          <Box as="section" aria-labelledby="dil-recs" className="glass rounded-2xl p-5">
            <Flex className="items-center gap-2">
              <SparklesIcon size={14} className="text-blue-300" aria-hidden />
              <Heading as="h3" id="dil-recs" className="!text-[15px] !font-semibold text-slate-100">Suggested next actions</Heading>
            </Flex>
            <Box as="ul" className="mt-2.5 space-y-2">
              {recs.length ? recs.map((e) => <li key={e.id}>
                  <button type="button" onClick={() => setSelected(e)} className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left text-[12.5px] text-slate-200 transition-colors hover:border-white/20">
                    {e.recommendation}
                    <span className="mt-0.5 block text-[11px] text-slate-500">From: {e.title}</span>
                  </button>
                </li>) : <Text className="text-[12px] text-slate-500">No gaps or red flags detected in this view.</Text>}
            </Box>
            <Text className="mt-2.5 text-[11px] text-slate-500">Rule-based suggestions from sample events, not AI inference.</Text>
          </Box>
        </Box>
      </Box>

      {/* Connectors */}
      <Box as="section" aria-labelledby="dil-conn" className="glass rounded-2xl p-5">
        <Flex className="items-start justify-between gap-3">
          <Box>
            <Heading as="h3" id="dil-conn" className="!text-[15px] !font-semibold text-slate-100">Read-only connectors</Heading>
            <Text className="text-[12.5px] text-slate-400">Planned connections. None is connected; event counts come from the simulated feed.</Text>
          </Box>
          <Flex className="items-center gap-2"><DemoTag /><PlugZapIcon size={16} className="text-slate-500" aria-hidden /></Flex>
        </Flex>
        <Box as="ul" className="mt-3 divide-y divide-white/[0.06]">
          {connectors.map((c) => <Flex as="li" key={c.name} className="flex-wrap items-center gap-3 py-3">
              <Box className="min-w-0">
                <Text className="text-[13px] font-medium text-slate-100">{c.name}</Text>
                <Text className="text-[11.5px] text-slate-500">{c.team} · {c.owner}</Text>
              </Box>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-rose-400/35 bg-rose-400/10 px-2 py-0.5 text-[11px] text-rose-300"><span className="h-1.5 w-1.5 rounded-full bg-rose-400" aria-hidden />Not connected · no data read</span>
              <span className="num text-[11.5px] text-slate-500">{events.filter((e) => e.source === c.name).length} sample events (simulated)</span>
            </Flex>)}
        </Box>
      </Box>

      <EventDrawer event={selected} onClose={() => setSelected(null)} />
    </Box>;
}
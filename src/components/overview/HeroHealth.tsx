import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRightIcon, ShieldCheckIcon, SparklesIcon, TrendingUpIcon, TriangleAlertIcon, WorkflowIcon } from "lucide-react";
import { CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ReferenceLine, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from "recharts";
import { useAnalysis } from "../../contexts/AnalysisContext";
import { AnalysisProgressPanel } from "../analysis/AnalysisProgress";
import { HealthGauge } from "./HealthGauge";
import { AnalysisResultsHeader } from "./AnalysisResultsHeader";
import { InfoTip } from "../ui/InfoTip";
/** How long the completed panel stays before the updated results are revealed. */
const REVEAL_DELAY_MS = 900;
const statIcons = [TriangleAlertIcon, WorkflowIcon, ShieldCheckIcon, SparklesIcon];
const statIconTone = ["text-rose-400", "text-blue-300", "text-teal-300", "text-amber-300"];
const tooltipStyle = {
  background: "rgba(12,18,32,0.8)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 12,
  color: "#E2E8F0"
};
export function HeroHealth() {
  const navigate = useNavigate();
  const {
    results: res,
    run,
    isRunning,
    cancel
  } = useAnalysis();
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const wasRunning = useRef(false);
  const [holding, setHolding] = useState(false);

  // Keep the overlay briefly after completion so the new results are in place before it lifts.
  useEffect(() => {
    if (isRunning) {
      if (!wasRunning.current) sectionRef.current?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start"
      });
      wasRunning.current = true;
      return;
    }
    if (!wasRunning.current) return;
    wasRunning.current = false;
    if (run?.status !== "completed") return;
    setHolding(true);
    const t = window.setTimeout(() => setHolding(false), REVEAL_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [isRunning, run?.status, reduce]);
  const overlay = !!run && (isRunning || holding);

  // Block interaction (including keyboard focus) with the blurred content.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (overlay) el.setAttribute("inert", "");else el.removeAttribute("inert");
  }, [overlay]);
  const cycleMin = Math.floor(Math.min(6, ...res.cycle.trend.map((p) => p.days)));
  const cycleMax = Math.ceil(Math.max(13, ...res.cycle.trend.map((p) => p.days)));
  const aboveTarget = res.cycle.days > res.cycle.target;
  return <Box as="section" id="overview-health" ref={sectionRef} aria-labelledby="hero-title" aria-busy={overlay} className="glass relative scroll-mt-6 overflow-hidden rounded-2xl">
      <Box ref={contentRef} aria-hidden={overlay || undefined} className={`transition-[filter,opacity] duration-500 ease-out ${overlay ? "pointer-events-none select-none opacity-80" : ""}`} style={{
      filter: overlay ? "blur(7px)" : "none"
    }}>
      <AnalysisResultsHeader key={res.runId} results={res} />

      <Box className="border-b border-white/[0.06] px-4 py-4 md:px-5">
        <Box className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {res.stats.map((s, i) => {
            const Icon = statIcons[i % statIcons.length];
            return <Box key={s.label} className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-3">
                <Flex className="items-center gap-2">
                  <Icon size={15} className={`shrink-0 ${statIconTone[i % statIconTone.length]}`} aria-hidden />
                  <Text className="truncate text-[12.5px] text-slate-300">{s.label}</Text>
                </Flex>
                <Flex className="mt-2 items-baseline gap-1.5">
                  <Text className="num text-[22px] font-semibold leading-none text-white">{s.value}</Text>
                  <Text className={`truncate text-[12.5px] ${s.tone}`} title={s.note}>{s.note}</Text>
                </Flex>
              </Box>;
          })}
        </Box>
        <Flex className="mt-3 flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
          <Flex className="gap-[2px]" aria-hidden>
            {Array.from({
              length: 14
            }).map((_, i) => <span key={i} className={`h-2.5 w-[3px] rounded-[1px] ${i < Math.round(res.conformance.observed / 100 * 14) ? "bg-blue-400" : "bg-white/15"}`} />)}
          </Flex>
          <Text className="text-slate-300">Observed conformance <span className="num font-semibold text-white">{res.conformance.observed}%</span></Text>
          <InfoTip label="conformance">Share of observed events that follow the documented process, compared with the documented target.</InfoTip>
          <Text className="ml-auto text-slate-400">Documented target <span className="num font-semibold text-white">{res.conformance.target}%</span></Text>
        </Flex>
      </Box>

      <Box className="grid gap-6 px-4 py-5 md:px-5 lg:grid-cols-[minmax(240px,1fr)_minmax(0,1.3fr)_minmax(260px,1fr)] lg:gap-0 lg:divide-x lg:divide-white/[0.06]">
        <Flex className="flex-col lg:pr-5">
          <Flex className="items-center gap-2">
            <Heading as="h2" id="hero-title" className="!text-[14px] !font-semibold text-white">
              Process health
            </Heading>
            <span className={`rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${res.statusLabel === "On track" ? "border-teal-400/40 bg-teal-400/10 text-teal-300" : "border-amber-400/40 bg-amber-400/10 text-amber-300"}`}>{res.statusLabel}</span>
            <InfoTip label="Process health">{res.description}</InfoTip>
          </Flex>
          <Box className="mt-2 h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={res.radar} outerRadius="72%">
                <PolarGrid stroke="rgba(148,163,184,0.18)" />
                <PolarAngleAxis dataKey="area" tick={{
                  fill: "#94A3B8",
                  fontSize: 13
                }} />
                <Radar dataKey="bestPractice" stroke="#2DD4BF" strokeDasharray="4 4" fill="none" strokeWidth={1.2} />
                <Radar dataKey="observed" stroke="#60A5FA" fill="#3B82F6" fillOpacity={0.14} strokeWidth={1.8} dot={{
                  r: 3,
                  fill: "#60A5FA"
                }} />
                <ChartTooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
          <Flex className="justify-center gap-4 text-[11.5px] text-slate-400">
            <Flex className="items-center gap-1.5"><span className="h-0.5 w-3.5 bg-blue-400" />As-built</Flex>
            <Flex className="items-center gap-1.5"><span className="h-0.5 w-3.5 bg-teal-400" />Blueprint target</Flex>
          </Flex>
          {res.notAnalyzed.length > 0 && <Text className="mt-1.5 text-center text-[12px] text-slate-500">Not in this analysis: {res.notAnalyzed.join(", ")}</Text>}
          <Flex className="mt-auto justify-center pt-3">
            <Button variant="link" size="sm" className="!text-[12.5px] !font-medium !text-blue-300" rightIcon={<ChevronRightIcon size={13} />} onClick={() => navigate("/reports")}>
              Executive report
            </Button>
          </Flex>
        </Flex>

        <Flex className="flex-col items-center justify-end lg:px-5">
          <Box className="w-full max-w-[520px]">
            <HealthGauge value={res.healthIndex.value} label={res.healthIndex.label} satellites={res.satellites} animationKey={res.runId} />
          </Box>
          <Flex className="-mt-1 items-center gap-1.5 text-center text-[12px] text-slate-400">
            <TrendingUpIcon size={14} className="shrink-0 text-teal-300" aria-hidden />
            <Text>{res.footnote}</Text>
          </Flex>
        </Flex>

        <Flex className="flex-col lg:pl-5">
          <Flex className="items-center gap-1.5">
            <Text as="h3" className="text-[14px] font-semibold text-white">Cycle time</Text>
            <InfoTip label="Cycle time">
              Procure-to-Pay, requisition to PO. {aboveTarget ? `It takes ${res.cycle.pctAbove}% longer than the ${res.cycle.target}-day documented target.` : `It is within the ${res.cycle.target}-day documented target.`} The trend shows the monthly average; the dashed line is the target.
            </InfoTip>
          </Flex>
          <Text className="num mt-3 text-[30px] font-medium leading-none text-white">
            {res.cycle.days}<span className="ml-1.5 text-[14px] text-slate-400">days</span>
          </Text>
          <Flex className="mt-3 items-center justify-between gap-2">
            <span className={`rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${aboveTarget ? "border-amber-400/40 bg-amber-400/10 text-amber-300" : "border-teal-400/40 bg-teal-400/10 text-teal-300"}`}>
              {aboveTarget ? `+${res.cycle.pctAbove}% vs target` : "On target"}
            </span>
            <Text className="text-[11.5px] text-slate-400">Reference {res.cycle.target} days</Text>
          </Flex>
          <Box className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.08]">
            <Box className={`h-full rounded-full transition-[width] duration-700 ${aboveTarget ? "bg-amber-400" : "bg-teal-400"}`} style={{
              width: `${res.cycle.barPct}%`
            }} />
          </Box>
          {res.cycle.carriedOver && <Text className="mt-2 text-[12px] text-amber-200/80">Carried over from the previous run — Procurement wasn't analyzed.</Text>}
          <Text className="mt-4 text-[11.5px] text-slate-400">Monthly trend</Text>
          <Box className="mt-1 h-[130px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={res.cycle.trend} margin={{
                top: 8,
                right: 8,
                left: -24,
                bottom: 0
              }}>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="month" tick={{
                  fill: "#64748B",
                  fontSize: 12
                }} axisLine={false} tickLine={false} />
                <YAxis domain={[cycleMin, cycleMax]} tick={{
                  fill: "#64748B",
                  fontSize: 12
                }} axisLine={false} tickLine={false} />
                <ReferenceLine y={res.cycle.target} stroke="#2DD4BF" strokeDasharray="3 3" label={{
                  value: `Target ${res.cycle.target}d`,
                  fill: "#2DD4BF",
                  fontSize: 12,
                  position: "insideBottomRight"
                }} />
                <ChartTooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="days" stroke="#60A5FA" strokeWidth={1.8} dot={{
                  r: 2.5,
                  fill: "#60A5FA"
                }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          <Flex className="mt-auto justify-end pt-2">
            <Button variant="link" size="sm" className="!text-[12.5px] !font-medium !text-blue-300" rightIcon={<ChevronRightIcon size={13} />} onClick={() => navigate("/process")}>
              View full analysis
            </Button>
          </Flex>
        </Flex>
      </Box>
      </Box>

      <AnimatePresence>
        {overlay && run && <motion.div key="analysis-overlay" initial={reduce ? false : {
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: reduce ? 0 : 0.45,
        ease: "easeOut"
      }} className="analysis-scrim absolute inset-0 z-10 flex items-center justify-center overflow-y-auto p-4 md:p-8">
            <motion.div initial={reduce ? false : {
          y: 10,
          scale: 0.98
        }} animate={{
          y: 0,
          scale: 1
        }} exit={reduce ? undefined : {
          y: -6,
          scale: 0.99
        }} transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1]
        }} className="flex w-full justify-center">
              <AnalysisProgressPanel run={run} onCancel={cancel} />
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </Box>;
}
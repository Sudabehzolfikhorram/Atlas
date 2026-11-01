import React, { useMemo, useState } from "react";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GitCompareArrowsIcon, SparklesIcon, XIcon } from "lucide-react";
import { useScreenInit } from "../useScreenInit.js";
import { ProcessCanvas } from "../components/bestPractice/ProcessCanvas";
import { ProcessLegend } from "../components/bestPractice/ProcessLegend";
import { CompareSummary } from "../components/bestPractice/CompareSummary";
import { asIsProcess, processLanes, targetProcess } from "../data/bestPracticeProcess";
import { buildLayout, diffProcesses, formatWait, processCounts } from "../utils/bestPractice";

/** Best practice design → Process: target-state swimlanes, with a before/after compare mode. */
export function BestPracticeProcess() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const screen = useScreenInit() as {
    compare?: boolean;
  } | null;
  const [compare, setCompare] = useState(!!screen?.compare);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusNonce, setFocusNonce] = useState(0);
  const layout = useMemo(() => buildLayout(processLanes, [asIsProcess, targetProcess]), []);
  const counts = processCounts(targetProcess);
  const laneLabel = (id: string) => processLanes.find((l) => l.id === id)?.label ?? id;
  const diffs = useMemo(() => diffProcesses(asIsProcess, targetProcess, laneLabel), []);
  const pick = (id: string) => {
    setSelectedId(id);
    setFocusNonce((n) => n + 1);
  };
  const exportCsv = () => {
    const models = compare ? [asIsProcess, targetProcess] : [targetProcess];
    const rows = [["Design", "Lane", "Task", "Type", "Status", "Events", "Wait", "Target wait"]];
    models.forEach((m) => m.tasks.forEach((t) => rows.push([m.title, laneLabel(t.lane), t.label, t.kind, t.status, String(t.events), formatWait(t.waitH) ?? "", formatWait(t.targetH) ?? ""])));
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], {
      type: "text/csv"
    }));
    const a = document.createElement("a");
    a.href = url;
    a.download = compare ? "process-as-is-vs-best-practice.csv" : "process-best-practice.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return <Box className="space-y-5">
      <Flex className="flex-wrap items-center gap-3">
        <Heading as="h1" className="!text-[26px] !font-semibold tracking-tight text-white">Best practice design</Heading>
        <Flex className="ml-auto flex-wrap items-center gap-2">
          <Button variant="outline" leftIcon={<SparklesIcon size={15} />} onClick={() => navigate("/assistant")}>Assistant</Button>
          <Button variant="outline" leftIcon={compare ? <XIcon size={15} /> : <GitCompareArrowsIcon size={15} />} aria-pressed={compare} onClick={() => {
          setCompare((c) => !c);
          setSelectedId(null);
        }}>
            {compare ? "Exit compare" : "Compare"}
          </Button>
          <Button colorScheme="blue" onClick={exportCsv}>Export</Button>
        </Flex>
      </Flex>

      <Box as="section" aria-labelledby="bp-title" className="glass rounded-3xl p-4 md:p-5">
        <Flex className="mb-4 items-center justify-between gap-3">
          <Heading as="h2" id="bp-title" className="!text-[16px] !font-semibold text-white">Process best-practice redesign</Heading>
          <span className="rounded-md border border-violet-400/40 bg-violet-500/10 px-2 py-0.5 text-[11.5px] font-medium text-violet-300">Target state</span>
        </Flex>

        <Box className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.015]">
          {!compare && <Flex className="flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-3">
              <Text className="text-[12px] uppercase tracking-[0.08em] text-slate-400">Process best-practice target state · tasks, owners, controls &amp; waits</Text>
              <span className="num rounded-md border border-white/[0.1] px-2 py-0.5 text-[12px] text-slate-300">{counts.tasks} Tasks · {counts.transitions} Transitions · {counts.departments} Departments</span>
            </Flex>}
          <Box className="p-2.5">
            <ProcessCanvas key={compare ? "compare" : "target"} asIs={asIsProcess} target={targetProcess} layout={layout} compare={compare} selectedId={selectedId} onSelect={setSelectedId} focusNonce={focusNonce} />
          </Box>
        </Box>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={compare ? "summary" : "legend"} initial={reduce ? false : {
          opacity: 0,
          y: 4
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={reduce ? undefined : {
          opacity: 0
        }} transition={{
          duration: 0.16
        }}>
            {compare ? <CompareSummary asIs={asIsProcess} target={targetProcess} diffs={diffs} selectedId={selectedId} onPick={pick} /> : <Flex className="mt-4 flex-wrap items-center gap-3">
                <ProcessLegend />
                <Text className="ml-auto text-[11.5px] text-slate-500">Sample event log · travel permits</Text>
              </Flex>}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>;
}
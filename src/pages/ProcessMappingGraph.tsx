import '@xyflow/react/dist/style.css';
import React, { useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { ReactFlowProvider } from "@xyflow/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DownloadIcon, NetworkIcon, TargetIcon, WorkflowIcon } from "lucide-react";
import { useScreenInit } from "../useScreenInit.js";
import { PageHeader } from "../components/ui/PageHeader";
import { AnalyzeProcessesButton } from "../components/analysis/AnalyzeProcessesButton";
import { MappingTabs } from "../components/mapping/MappingTabs";
import { ContextStrip } from "../components/mapping/ContextStrip";
import { StrategyTab } from "../components/mapping/StrategyTab";
import { exportStrategyConnections } from "../components/mapping/StrategyConnections";
import { StrategyWorkspace } from "../components/strategy/StrategyWorkspace";
import { TeamGraph } from "../components/teamGraph/TeamGraph";
import { OutcomesView } from "../components/outcomes/OutcomesView";
import { teamRelations, teams } from "../data/teamGraph";
import { insights, objectives } from "../data/strategy";
import { eventLog } from "../data/processVariants";
type ProcessTab = "strategy" | "execution" | "processes" | "outcomes";
const tabs: {
  id: ProcessTab;
  label: string;
}[] = [{
  id: "strategy",
  label: "Strategy"
}, {
  id: "execution",
  label: "Strategy execution"
}, {
  id: "processes",
  label: "Detailed processes"
}, {
  id: "outcomes",
  label: "Outcomes"
}];

/** Mapping → Process: strategy, strategy execution, detailed processes and outcomes. */
export function ProcessMappingGraph() {
  const reduce = useReducedMotion();
  const screen = useScreenInit() as {
    tab?: ProcessTab;
  } | null;
  const [tab, setTab] = useState<ProcessTab>(screen?.tab ?? "strategy");
  return <Box className="space-y-5">
      <PageHeader eyebrow="Mapping" title="Process mapping" description="Connect strategy, execution and process outcomes." actions={<>
            <Button variant="outline" leftIcon={<DownloadIcon size={14} />} onClick={exportStrategyConnections}>Export data</Button>
            <AnalyzeProcessesButton />
          </>} />
      <MappingTabs tabs={tabs} active={tab} onChange={setTab} idPrefix="pmg" label="Process mapping views" />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} id="pmg-panel" role="tabpanel" aria-labelledby={`pmg-tab-${tab}`} initial={reduce ? false : {
        opacity: 0,
        y: 6
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={reduce ? undefined : {
        opacity: 0
      }} transition={{
        duration: 0.16
      }} className="space-y-4">
          {tab === "strategy" && <StrategyTab />}
          {tab === "execution" && <>
              <ContextStrip icon={TargetIcon} label="Strategy execution" meta={`${objectives.length} objectives analysed against the organization map`} chip={`${insights.length} insights`} />
              <Box className="glass rounded-2xl p-4 md:p-5"><StrategyWorkspace /></Box>
            </>}
          {tab === "processes" && <>
              <ContextStrip icon={NetworkIcon} label="Teams, workflows & dependencies" meta="Every team, the processes it owns and how they connect" chip={`${teams.length} teams · ${teamRelations.length} relationships`} />
              <Box className="glass rounded-2xl p-4 md:p-5">
                <ReactFlowProvider><TeamGraph view="processes" /></ReactFlowProvider>
              </Box>
            </>}
          {tab === "outcomes" && <>
              <ContextStrip icon={WorkflowIcon} label={eventLog.name} meta="Observed document flow between roles" chip="Sample event log" />
              <Box className="glass rounded-2xl p-4 md:p-5"><OutcomesView /></Box>
            </>}
        </motion.div>
      </AnimatePresence>

      <Text className="text-right text-[11.5px] text-slate-500">Illustrative · sample strategy, team and event-log data</Text>
    </Box>;
}
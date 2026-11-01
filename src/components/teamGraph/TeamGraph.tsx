import '@xyflow/react/dist/style.css';
import React, { useCallback, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MousePointerClickIcon } from "lucide-react";
import type { Edge } from "@xyflow/react";
import { teamRelations, teams } from "../../data/teamGraph";
import { graphViews, type GraphViewId } from "../../data/teamGraphViews";
import { healthMeta, relationMeta } from "../../utils/teamGraph";
import type { RelationType, TeamRelation } from "../../types/teamGraph";
import { healthIcons } from "./teamGraphIcons";
import { GraphViewTabs } from "./GraphViewTabs";
import { TeamFlowCanvas } from "./TeamFlowCanvas";
import { TeamOverlay, type OverlayState } from "./TeamOverlay";
import { OutcomesView } from "../outcomes/OutcomesView";
import { StrategyWorkspace } from "../strategy/StrategyWorkspace";
const healthKeys = ["verified", "partial", "gap", "unknown"] as const;
const positions = Object.fromEntries(teams.map((t) => [t.id, t.position]));
const handles = (r: TeamRelation) => ({
  sourceHandle: `s-${r.sh}`,
  targetHandle: `t-${r.th}`
});

/** Organization graph with three views: detailed processes, observed outcomes and AI strategy analysis. */
export function TeamGraph({
  view



}: { /** Lock the graph to one view and hide the view tabs. */view?: GraphViewId;} = {}) {
  const reduce = useReducedMotion();
  const [innerView, setViewId] = useState<GraphViewId>("processes");
  const viewId = view ?? innerView;
  const [overlay, setOverlay] = useState<OverlayState | null>(null);
  const changeView = useCallback((id: GraphViewId) => {
    setOverlay(null);
    setViewId(id);
  }, []);
  return <Box>
      {!view && <GraphViewTabs views={graphViews} active={viewId} onChange={changeView} />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={viewId} id="tg-panel" role={view ? undefined : "tabpanel"} aria-labelledby={view ? undefined : `tg-tab-${viewId}`} initial={reduce ? false : {
        opacity: 0,
        y: 6
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={reduce ? undefined : {
        opacity: 0,
        y: -4
      }} transition={{
        duration: 0.18
      }} className="mt-3">
          {viewId === "processes" && <DetailedProcesses overlay={overlay} setOverlay={setOverlay} />}
          {viewId === "outcomes" && <OutcomesView />}
          {viewId === "strategy" && <StrategyWorkspace />}
        </motion.div>
      </AnimatePresence>
    </Box>;
}
function DetailedProcesses({
  overlay,
  setOverlay



}: {overlay: OverlayState | null;setOverlay: (s: OverlayState | null) => void;}) {
  const close = useCallback(() => setOverlay(null), [setOverlay]);
  const openTeam = useCallback((id: string) => setOverlay({
    trail: [id],
    edgeId: null
  }), [setOverlay]);
  const openEdge = useCallback((e: Edge) => setOverlay({
    trail: [e.source],
    edgeId: e.id
  }), [setOverlay]);
  return <>
      <Box className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.015]">
        <Flex className="flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 pb-2 pt-3.5">
          <Box className="min-w-0">
            <Text className="text-[12px] uppercase tracking-[0.06em] text-slate-400">Detailed processes · Teams, workflows & dependencies</Text>
            <Text className="mt-0.5 text-[12.5px] text-slate-300">Every team, the processes it owns, and how they connect and depend on each other.</Text>
          </Box>
          <Flex className="shrink-0 items-center gap-2 text-[11.5px] text-slate-400">
            <span className="num rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5">{teams.length} teams · {teamRelations.length} relationships</span>
            <Text className="text-[12px] uppercase tracking-[0.06em] text-slate-400">Illustrative</Text>
          </Flex>
        </Flex>
        <Box className="relative h-[620px]">
          <TeamFlowCanvas teams={teams} relations={teamRelations} fitKey="processes" positions={positions} handles={handles} focusId={overlay?.trail[0] ?? null} hoverHighlight={!overlay} fitPadding={0.08} wheel="ctrl" onNodeClick={openTeam} onEdgeClick={openEdge}>
            <Flex className="pointer-events-none absolute bottom-3 right-3 items-center gap-1.5 text-[11px] text-slate-500">
              <MousePointerClickIcon size={12} aria-hidden /> Click a team or connection to explore · Ctrl/⌘ + scroll to zoom
            </Flex>
          </TeamFlowCanvas>
        </Box>
        <AnimatePresence>{overlay && <TeamOverlay state={overlay} onChange={setOverlay} onClose={close} />}</AnimatePresence>
      </Box>

      <Flex className="mt-3 flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-slate-400">
        {healthKeys.map((k) => {
        const Icon = healthIcons[k];
        return <Flex key={k} className="items-center gap-1.5"><Icon size={12} className={healthMeta[k].text} aria-hidden />{healthMeta[k].label}</Flex>;
      })}
        <span className="h-3 w-px bg-white/10" aria-hidden />
        {(Object.keys(relationMeta) as RelationType[]).map((t) => <Flex key={t} className="items-center gap-1.5">
            <svg width="22" height="6" aria-hidden><line x1="0" y1="3" x2="22" y2="3" stroke="currentColor" strokeWidth="1.6" strokeDasharray={relationMeta[t].dash} /></svg>
            {relationMeta[t].label}
          </Flex>)}
      </Flex>
      <Text className="mt-1.5 text-[11.5px] text-slate-500">Line colour shows evidence status; line pattern and label show the relationship type. Teams, people and evidence are illustrative sample data.</Text>
    </>;
}
import '@xyflow/react/dist/style.css';
import React, { useState } from "react";
import { Box, Flex, Heading } from "@chakra-ui/react";
import { ReactFlowProvider } from "@xyflow/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DatabaseIcon, WorkflowIcon } from "lucide-react";
import { SupplyGraphWorkspace } from "../supplyGraph/SupplyGraphWorkspace";
import { ProcessComparisonSection } from "./ProcessComparisonSection";
import { InfoTip } from "../ui/InfoTip";
type View = "data" | "process";
const views: {
  id: View;
  label: string;
  Icon: typeof DatabaseIcon;
}[] = [{
  id: "data",
  label: "Data",
  Icon: DatabaseIcon
}, {
  id: "process",
  label: "Process",
  Icon: WorkflowIcon
}];

/** Overview section: the data supply chain graph (Data) and the organization & workflow map (Process). */
export function DataGovernanceSection() {
  const [view, setView] = useState<View>("data");
  const reduce = useReducedMotion();
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = views[(i + 1) % views.length];
    setView(next.id);
    document.getElementById(`dg-tab-${next.id}`)?.focus();
  };
  return <Box as="section" id="overview-workflows" aria-labelledby="dg-title" className="glass scroll-mt-6 rounded-2xl p-4 md:p-5">
      <Flex className="mb-4 flex-wrap items-center gap-3">
        <Flex className="items-center gap-1.5">
          <Heading as="h2" id="dg-title" className="!text-[17px] !font-semibold tracking-tight text-white">Data governance</Heading>
          <InfoTip label="Data governance">
            {view === "data" ? "The data supply chain of the analysed process: sources, pipeline steps, outputs and their dependencies. Click a node for its source, status and red flags. Use Edit to change the graph; changes are saved in this browser." : "See which teams take part in each workflow. Select a team or workflow for details, or open a workflow to compare it with best practice."}
            <span className="mt-2 block text-slate-400">Sample data · weights range from 0 to 1.</span>
          </InfoTip>
        </Flex>
        <Flex role="tablist" aria-label="Data governance view" className="ml-auto rounded-xl border border-white/[0.08] bg-black/20 p-1">
          {views.map((v, i) => {
          const on = view === v.id;
          return <button key={v.id} id={`dg-tab-${v.id}`} type="button" role="tab" aria-selected={on} aria-controls="dg-panel" tabIndex={on ? 0 : -1} onClick={() => setView(v.id)} onKeyDown={(e) => onKey(e, i)} className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "text-white" : "text-slate-400 hover:text-slate-200"}`}>
                {on && <motion.span layoutId="dg-tab-active" className="absolute inset-0 rounded-lg border border-white/[0.12] bg-white/[0.08]" transition={reduce ? {
              duration: 0
            } : {
              type: "spring",
              stiffness: 500,
              damping: 40
            }} aria-hidden />}
                <v.Icon size={13} className="relative" aria-hidden />
                <span className="relative">{v.label}</span>
              </button>;
        })}
        </Flex>
      </Flex>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={view} id="dg-panel" role="tabpanel" aria-labelledby={`dg-tab-${view}`} initial={reduce ? false : {
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
          {view === "data" ? <ReactFlowProvider>
              <SupplyGraphWorkspace />
            </ReactFlowProvider> : <ProcessComparisonSection embedded />}
        </motion.div>
      </AnimatePresence>
    </Box>;
}
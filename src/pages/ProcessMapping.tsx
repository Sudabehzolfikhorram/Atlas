import '@xyflow/react/dist/style.css';
import React, { useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DatabaseIcon, DownloadIcon } from "lucide-react";
import { useScreenInit } from "../useScreenInit.js";
import { PageHeader } from "../components/ui/PageHeader";
import { AnalyzeProcessesButton } from "../components/analysis/AnalyzeProcessesButton";
import { MappingTabs } from "../components/mapping/MappingTabs";
import { ContextStrip } from "../components/mapping/ContextStrip";
import { DataSupplyChainPanel, needsAttention, AttentionNote } from "../components/mapping/DataSupplyChainPanel";
import { NodeDirectory, nodeContext } from "../components/mapping/NodeDirectory";
import { AskAtlasCard } from "../components/mapping/AskAtlasCard";
import { DataOutcomesTab } from "../components/mapping/DataOutcomesTab";
import { defaultGraphEdges, defaultGraphNodes } from "../data/supplyGraph";
import { atlasSuggestions, eventLog } from "../data/processVariants";
import { categoryMeta, cleanList, isSupplyNode, statusMeta } from "../utils/supplyGraph";
import { downloadCsv } from "../utils/exportCsv";
type DataTab = "detailed" | "outcomes" | "governance";
const tabs: {
  id: DataTab;
  label: string;
}[] = [{
  id: "detailed",
  label: "Detailed data"
}, {
  id: "outcomes",
  label: "Outcomes"
}, {
  id: "governance",
  label: "Data governance"
}];
const nodes = defaultGraphNodes.filter(isSupplyNode);
const attention = nodes.filter(needsAttention);
const chip = `${nodes.length} nodes · ${defaultGraphEdges.length} connections`;

/** Mapping → Data: detailed data supply chain, observed outcomes and data governance. */
export function ProcessMapping() {
  const reduce = useReducedMotion();
  const screen = useScreenInit() as {
    tab?: DataTab;
  } | null;
  const [tab, setTab] = useState<DataTab>(screen?.tab ?? "detailed");
  const [reveal, setReveal] = useState<{
    id: string;
    n: number;
  }>({
    id: "",
    n: 0
  });
  const onReveal = (id: string) => setReveal((r) => ({
    id,
    n: r.n + 1
  }));
  const exportData = () => downloadCsv("data-mapping.csv", [["Node", "Area", "Source / context", "Status", "Weight", "Red flags"], ...nodes.map((n) => [n.data.label, categoryMeta[n.data.category].label, nodeContext(n), n.data.details.status ? statusMeta[n.data.details.status].label : "", n.data.weight.toFixed(2), cleanList(n.data.details.redFlags).join("; ")])]);
  const strip = <ContextStrip icon={DatabaseIcon} label={eventLog.name} meta="Source systems, lineage and dependencies" chip={chip} />;
  return <Box className="space-y-5">
      <PageHeader eyebrow="Mapping" title="Data mapping" description="Trace your data from source to decision." actions={<>
            <Button variant="outline" leftIcon={<DownloadIcon size={14} />} onClick={exportData}>Export data</Button>
            <AnalyzeProcessesButton />
          </>} />
      <MappingTabs tabs={tabs} active={tab} onChange={setTab} idPrefix="dm" label="Data mapping views" />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} id="dm-panel" role="tabpanel" aria-labelledby={`dm-tab-${tab}`} initial={reduce ? false : {
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
          {tab === "detailed" && <>
              {strip}
              <DataSupplyChainPanel nodes={nodes} attention={attention} onReveal={onReveal} />
              <Box className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
                <NodeDirectory nodes={nodes} focusId={reveal.id} focusNonce={reveal.n} />
                <AskAtlasCard suggestions={atlasSuggestions} className="xl:min-h-[560px]" />
              </Box>
            </>}
          {tab === "outcomes" && <DataOutcomesTab />}
          {tab === "governance" && <>
              {strip}
              <DataSupplyChainPanel nodes={nodes} attention={attention} onReveal={onReveal} />
              <AttentionNote>Governance uses the same source map. Ownership, evidence, quality checks and access roles remain available in each node's details.</AttentionNote>
              <NodeDirectory nodes={nodes} defaultOpen={false} focusId={reveal.id} focusNonce={reveal.n} />
            </>}
        </motion.div>
      </AnimatePresence>

      <Text className="text-right text-[11.5px] text-slate-500">Illustrative · sample event log and source records</Text>
    </Box>;
}
import '@xyflow/react/dist/style.css';
import React, { useState } from "react";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GitCompareArrowsIcon, SparklesIcon, XIcon } from "lucide-react";
import { useScreenInit } from "../useScreenInit.js";
import { SupplyGraphWorkspace } from "../components/supplyGraph/SupplyGraphWorkspace";
import { DataCompareCanvas } from "../components/bestPractice/DataCompareCanvas";
import { DataCompareSummary } from "../components/bestPractice/DataCompareSummary";
import { dataFixes } from "../data/bestPracticeData";
import { asIsDataGraph, dataDiffs, targetDataGraph } from "../utils/bestPracticeData";
import { categoryMeta, cleanList, isSupplyNode } from "../utils/supplyGraph";
import type { SupplyGraphSource } from "../hooks/useSupplyGraph";
const targetSource: SupplyGraphSource = {
  ...targetDataGraph,
  storageKey: "atlas.bestPracticeData.v1"
};

/** Best practice design → Data: editable target-state data flow, with a before/after compare mode. */
export function BestPracticeData() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const screen = useScreenInit() as {
    compare?: boolean;
  } | null;
  const [compare, setCompare] = useState(!!screen?.compare);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusNonce, setFocusNonce] = useState(0);
  const pick = (id: string) => {
    setSelectedId(id);
    setFocusNonce((n) => n + 1);
  };
  const exportCsv = () => {
    const fixes = new Map(dataFixes.map((f) => [f.nodeId, f.fix]));
    const models = compare ? [["As-is", asIsDataGraph], ["Best practice", targetDataGraph]] as const : [["Best practice", targetDataGraph]] as const;
    const rows = [["Design", "Area", "Node", "Status", "Weight", "Red flags", "Best-practice change"]];
    models.forEach(([name, g]) => g.nodes.filter(isSupplyNode).forEach((n) => rows.push([name, categoryMeta[n.data.category].label, n.data.label, n.data.details.status ?? "", n.data.weight.toFixed(2), cleanList(n.data.details.redFlags).join("; "), fixes.get(n.id) ?? ""])));
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], {
      type: "text/csv"
    }));
    const a = document.createElement("a");
    a.href = url;
    a.download = compare ? "data-as-is-vs-best-practice.csv" : "data-best-practice.csv";
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

      <Box as="section" aria-labelledby="bpd-title" className="glass rounded-3xl p-4 md:p-5">
        <Flex className="mb-4 items-center justify-between gap-3">
          <Heading as="h2" id="bpd-title" className="!text-[16px] !font-semibold text-white">Data best-practice target state</Heading>
          <span className="rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[11.5px] font-medium text-amber-300">Weights 0–1</span>
        </Flex>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={compare ? "compare" : "target"} initial={reduce ? false : {
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
            {compare ? <>
                <Box className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-2.5">
                  <DataCompareCanvas asIs={asIsDataGraph} target={targetDataGraph} selectedId={selectedId} onSelect={setSelectedId} focusNonce={focusNonce} />
                </Box>
                <DataCompareSummary asIs={asIsDataGraph} target={targetDataGraph} diffs={dataDiffs} selectedId={selectedId} onPick={pick} />
                <Text className="mt-3 text-right text-[11.5px] text-slate-500">As-is: Mapping → Data supply chain graph · sample data</Text>
              </> : <Box className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-3">
                <ReactFlowProvider>
                  <SupplyGraphWorkspace source={targetSource} />
                </ReactFlowProvider>
              </Box>}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>;
}
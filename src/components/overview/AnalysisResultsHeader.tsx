import React, { useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDownIcon, DatabaseIcon, FileTextIcon, SparklesIcon } from "lucide-react";
import type { AnalysisItemStatus, AnalysisResults } from "../../types/analysis";
const statusMeta: Record<AnalysisItemStatus, {
  label: string;
  cls: string;
}> = {
  analyzed: {
    label: "Analyzed",
    cls: "border-teal-400/30 bg-teal-400/10 text-teal-300"
  },
  excluded: {
    label: "Excluded",
    cls: "border-amber-400/30 bg-amber-400/10 text-amber-300"
  },
  failed: {
    label: "Failed",
    cls: "border-rose-400/30 bg-rose-400/10 text-rose-300"
  }
};
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "Results based on N documents" header with an expandable list of the inputs used. */
export function AnalysisResultsHeader({
  results


}: {results: AnalysisResults;}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const items = results.items ?? [];
  const analyzed = items.filter((i) => i.status === "analyzed");
  const docs = analyzed.filter((i) => i.kind === "document").length;
  const sources = analyzed.length - docs;
  const excluded = items.filter((i) => i.status === "excluded").length;
  const failed = items.filter((i) => i.status === "failed").length;
  const listId = `analysis-inputs-${results.runId}`;
  const skipped = [excluded && `${excluded} excluded`, failed && `${failed} failed`].filter(Boolean).join(" · ");
  return <Box className="border-b border-white/[0.06]">
      <Flex className="flex-wrap items-center gap-x-2.5 gap-y-1 px-4 py-3 text-[12.5px] md:px-5">
        <SparklesIcon size={15} className="shrink-0 text-teal-300" aria-hidden />
        <Text className="font-semibold text-white">Run {results.runId}</Text>
        <Text className="text-slate-400">
          {plural(docs, "document")} · {plural(sources, "data source")}
        </Text>
        {skipped && <span className="rounded-md border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-300">{skipped}</span>}
        {results.simulated}
        <Button variant="link" size="sm" className="!ml-auto !text-[12.5px] !font-medium !text-blue-300" rightIcon={<ChevronDownIcon size={14} className={`transition-transform ${open ? "rotate-180" : "-rotate-90"}`} aria-hidden />} aria-expanded={open} aria-controls={listId} onClick={() => setOpen((o) => !o)}>
          Run details
        </Button>
      </Flex>

      <AnimatePresence initial={false}>
        {open && <motion.div key="details" id={listId} initial={reduce ? false : {
        height: 0,
        opacity: 0
      }} animate={{
        height: "auto",
        opacity: 1
      }} exit={reduce ? {
        opacity: 0
      } : {
        height: 0,
        opacity: 0
      }} transition={{
        duration: 0.22,
        ease: [0.22, 1, 0.36, 1]
      }} className="overflow-hidden">
            <Box className="px-5 pb-4 lg:px-7">
              <Flex className="mb-2 flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-slate-500">
                <span>{plural(items.length, "input")} in Run {results.runId}</span>
                <span className="text-teal-300">{analyzed.length} analyzed</span>
                {excluded > 0 && <span className="text-amber-300">{excluded} excluded</span>}
                {failed > 0 && <span className="text-rose-300">{failed} failed</span>}
              </Flex>
              {items.length === 0 ? <Text className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-[12.5px] text-slate-400">No input list was recorded for this run.</Text> : <Box as="ul" aria-label={`Inputs used in Run ${results.runId}`} className="grid max-h-[260px] gap-2 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((i) => {
              const Icon = i.kind === "document" ? FileTextIcon : DatabaseIcon;
              const meta = statusMeta[i.status];
              return <Flex as="li" key={i.id} className={`glass-tile items-start gap-2.5 rounded-xl px-3 py-2.5 ${i.status !== "analyzed" ? "opacity-90" : ""}`}>
                        <Icon size={14} className="mt-0.5 shrink-0 text-slate-400" aria-hidden />
                        <Box className="min-w-0 flex-1">
                          <Text className={`truncate text-[13px] font-medium ${i.status === "analyzed" ? "text-slate-100" : "text-slate-300 line-through decoration-slate-500/60"}`} title={i.name}>{i.name}</Text>
                          <Text className="truncate text-[11.5px] text-slate-500">{i.typeLabel}</Text>
                          {i.reason && i.status !== "analyzed" && <Text className="mt-0.5 text-[11.5px] leading-snug text-slate-400">{i.reason}</Text>}
                        </Box>
                        <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium ${meta.cls}`}>{meta.label}</span>
                      </Flex>;
            })}
                </Box>}
            </Box>
          </motion.div>}
      </AnimatePresence>
    </Box>;
}
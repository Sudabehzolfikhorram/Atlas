import React, { useMemo } from "react";
import { Box, Text } from "@chakra-ui/react";
import { OutcomesView } from "../outcomes/OutcomesView";
import { processVariants } from "../../data/processVariants";
import { CollapsibleSection } from "./CollapsibleSection";

/** Collapsed statistical views: final-state breakdown plus the existing outcomes filters, flow and permit list. */
export function StatisticalAnalysis() {
  const byState = useMemo(() => {
    const m = new Map<string, {
      cases: number;
      variants: number;
    }>();
    processVariants.forEach((v) => {
      const e = m.get(v.finalState) ?? {
        cases: 0,
        variants: 0
      };
      m.set(v.finalState, {
        cases: e.cases + v.cases,
        variants: e.variants + 1
      });
    });
    return [...m.entries()].sort((a, b) => b[1].cases - a[1].cases);
  }, []);
  const max = byState[0]?.[1].cases ?? 1;
  return <CollapsibleSection id="stat-analysis" title="Statistical analysis" meta="Final states · document flow · permits">
      <Box className="space-y-5 p-5">
        <Box>
          <Text className="text-[13px] font-medium text-slate-200">Cases by final state</Text>
          <Box as="ul" className="mt-2 space-y-1.5">
            {byState.map(([s, v]) => <li key={s} className="grid grid-cols-[160px_minmax(0,1fr)_120px] items-center gap-3 text-[12.5px]">
                <span className="truncate text-slate-300">{s}</span>
                <span className="h-2 rounded-full bg-white/[0.06]"><span className="block h-2 rounded-full bg-blue-400/80" style={{
                width: `${v.cases / max * 100}%`
              }} /></span>
                <span className="num text-right text-slate-400">{v.cases.toLocaleString()} · {v.variants} var.</span>
              </li>)}
          </Box>
        </Box>
        <OutcomesView />
      </Box>
    </CollapsibleSection>;
}
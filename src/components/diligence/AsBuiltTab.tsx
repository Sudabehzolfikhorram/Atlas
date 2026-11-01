import React, { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AsBuiltOverview, type AsBuiltFilter } from "./AsBuiltOverview";
import { FindingsTable } from "./FindingsTable";
import { useDiligence } from "../../contexts/DiligenceContext";
import { dimensionMeta } from "../../utils/diligence";
import type { DiligenceArea } from "../../types/diligence";

/** As-built gap view for one area: KPIs, matrices and dimension cards. Selecting a card or cell reveals its red flags and gaps. */
export function AsBuiltTab({
  area


}: {area: DiligenceArea;}) {
  const {
    findings
  } = useDiligence();
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<AsBuiltFilter>({
    team: null,
    dimension: null
  });
  useEffect(() => setFilter({
    team: null,
    dimension: null
  }), [area]);
  const list = findings.filter((f) => f.area === area);
  const dims = filter.dims ?? (filter.dimension ? [filter.dimension] : null);
  const scoped = list.filter((f) => (!filter.team || f.team === filter.team) && (!dims || dims.includes(f.dimension)));
  const label = [filter.team, filter.label ?? (filter.dimension && dimensionMeta[filter.dimension].label)].filter(Boolean).join(" · ");
  return <Box className="space-y-4">
      <AsBuiltOverview area={area} list={list} filter={filter} onFilter={setFilter} />

      <AnimatePresence mode="wait" initial={false}>
        {label && <motion.div key={label} initial={reduce ? false : {
        opacity: 0,
        y: 8
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={reduce ? undefined : {
        opacity: 0,
        y: -4
      }} transition={{
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1]
      }}>
            <FindingsTable rows={scoped} scopeLabel={label} onClearScope={() => setFilter({
          team: null,
          dimension: null
        })} />
          </motion.div>}
      </AnimatePresence>
    </Box>;
}
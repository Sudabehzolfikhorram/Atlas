import React from "react";
import { Flex } from "@chakra-ui/react";
import type { EdgeKind } from "../../types/bestPractice";
import { edgeMeta, kindMeta, statusMeta } from "./taskMeta";
const legendKinds = ["human", "approval", "system", "exception", "control"] as const;
const legendEdges: EdgeKind[] = ["flow", "exception", "control"];
export function ProcessLegend() {
  return <Flex as="ul" aria-label="Legend" className="flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-slate-300">
      {Object.entries(statusMeta).map(([k, s]) => <li key={k} className="flex items-center gap-1.5"><s.Icon size={13} className={s.tone} aria-hidden />{s.label}</li>)}
      <li aria-hidden className="h-4 w-px bg-white/10" />
      {legendKinds.map((k) => {
      const m = kindMeta[k];
      return <li key={k} className="flex items-center gap-1.5"><span className={`flex h-4 w-4 items-center justify-center rounded ${m.icon}`}><m.Icon size={10} aria-hidden /></span>{k === "control" ? "Added control" : m.label}</li>;
    })}
      <li aria-hidden className="h-4 w-px bg-white/10" />
      {legendEdges.map((k) => {
      const m = edgeMeta[k];
      return <li key={k} className="flex items-center gap-1.5">
            <svg width="22" height="6" aria-hidden><line x1="0" y1="3" x2="22" y2="3" stroke={m.stroke} strokeWidth="1.8" strokeDasharray={m.dash} /></svg>
            {m.label}
          </li>;
    })}
    </Flex>;
}
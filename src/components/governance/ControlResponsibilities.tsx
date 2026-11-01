import React, { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { controlDesigns } from "../../data/governance";
import { DesignStageChip, type DesignStage } from "./DesignStageTrack";
interface Props {
  controlId: string;
  stages: Record<string, DesignStage>;
  onSelectControl: (id: string) => void;
}

/** Each proposed control check with its accountable owner, required change and acceptance criteria. */
export function ControlResponsibilities({
  controlId,
  stages,
  onSelectControl
}: Props) {
  const [scope, setScope] = useState<"selected" | "all">("selected");
  const designs = scope === "all" ? controlDesigns : controlDesigns.filter((d) => d.controlId === controlId);
  return <Box>
      <Flex className="mb-3 items-center justify-between gap-3">
        <Text className="text-[11px] uppercase tracking-wider text-slate-500">Responsibilities & acceptance criteria</Text>
        <Flex role="group" aria-label="Table scope" className="rounded-lg border border-white/[0.08] bg-black/20 p-0.5">
          {([["selected", controlId], ["all", "All controls"]] as const).map(([k, label]) => <button key={k} type="button" aria-pressed={scope === k} onClick={() => setScope(k)} className={`h-6 rounded-md px-2 text-[11.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${scope === k ? "bg-white/[0.12] text-white" : "text-slate-400 hover:text-slate-200"}`}>
              {label}
            </button>)}
        </Flex>
      </Flex>
      <Box className="overflow-x-auto rounded-xl border border-white/[0.07]">
        <table className="w-full min-w-[760px] text-left text-[12.5px]">
          <thead className="bg-white/[0.03] text-[10.5px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Proposed control</th>
              <th className="px-3 py-2 font-medium">Accountable owner</th>
              <th className="px-3 py-2 font-medium">Required change</th>
              <th className="px-3 py-2 font-medium">Acceptance criteria</th>
              <th className="px-3 py-2 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody>
            {designs.flatMap((d) => d.checks.map((c) => {
            const active = d.controlId === controlId;
            return <tr key={c.id} className={`border-t border-white/[0.05] align-top ${scope === "all" && active ? "bg-blue-500/[0.05]" : ""}`}>
                    <td className="px-3 py-2.5">
                      {scope === "all" ? <button type="button" onClick={() => onSelectControl(d.controlId)} className="num text-[11px] text-blue-300 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                          {c.id}
                        </button> : <Text className="num text-[11px] text-slate-500">{c.id}</Text>}
                      <Text className="text-slate-100">{c.name}</Text>
                    </td>
                    <td className="px-3 py-2.5 text-slate-300">{c.owner}</td>
                    <td className="px-3 py-2.5 text-slate-300">{c.change}</td>
                    <td className="px-3 py-2.5 text-slate-200">{c.acceptance}</td>
                    <td className="px-3 py-2.5"><DesignStageChip stage={stages[d.controlId] ?? "proposed"} /></td>
                  </tr>;
          }))}
          </tbody>
        </table>
      </Box>
      <Text className="mt-1.5 text-[11px] text-slate-500">Acceptance criteria are confirmed during the pilot. Owners and criteria are illustrative.</Text>
    </Box>;
}
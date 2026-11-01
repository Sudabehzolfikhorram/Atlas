import React, { useState } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import { strategyLayers } from "../../data/processMapping";

/** Four layers from outcomes up to strategy; selecting one shows its representative workflow. */
export function OutcomeLayers() {
  const [selected, setSelected] = useState<string | null>(null);
  return <Box as="section" aria-labelledby="outcome-title" className="glass rounded-2xl p-5">
      <Heading as="h3" id="outcome-title" className="!text-[15px] !font-semibold text-slate-100">Outcome to strategy</Heading>
      <Text className="mt-3 text-[13px] text-slate-400">Evidence flows upward through four layers. Select a layer to inspect the representative workflow.</Text>
      <Box as="ul" className="mt-4 space-y-3">
        {strategyLayers.map((l) => {
        const on = selected === l.id;
        return <li key={l.id}>
              <button type="button" aria-expanded={on} onClick={() => setSelected(on ? null : l.id)} className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "border-blue-400/60 bg-blue-500/[0.06]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"}`}>
                <span className="num text-[22px] text-blue-300">{l.id}</span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] text-slate-100">{l.name}</span>
                  <span className="block text-[11.5px] text-slate-500">{l.basis === "observed" ? "Observed directly" : "Inferred from the layer below"}</span>
                  {on && <span className="mt-1.5 block text-[12.5px] text-slate-300">Representative workflow: {l.workflow}</span>}
                </span>
              </button>
            </li>;
      })}
      </Box>
    </Box>;
}
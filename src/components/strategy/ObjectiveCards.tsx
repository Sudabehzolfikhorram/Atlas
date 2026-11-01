import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { TargetIcon } from "lucide-react";
import { insights, objectives } from "../../data/strategy";
import { objectiveStatusMeta } from "../../utils/strategy";
interface Props {
  active: string | null;
  onSelect: (id: string | null) => void;
}

/** Strategic objectives with current alignment; selecting one maps it onto the organization. */
export function ObjectiveCards({
  active,
  onSelect
}: Props) {
  return <Box as="ul" aria-label="Strategic objectives" className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
      {objectives.map((o) => {
      const on = active === o.id;
      const st = objectiveStatusMeta[o.status];
      const n = insights.filter((i) => i.objectives.includes(o.id)).length;
      return <li key={o.id}>
            <button type="button" aria-pressed={on} onClick={() => onSelect(on ? null : o.id)} className={`glass-tile flex h-full w-full flex-col rounded-2xl border p-3.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "border-blue-400/50 bg-blue-500/[0.07]" : "border-white/[0.07] hover:border-white/20"}`}>
              <Flex className="items-center justify-between gap-2">
                <Flex className="min-w-0 items-center gap-1.5 text-[11px] uppercase tracking-[0.06em] text-slate-500">
                  <TargetIcon size={12} aria-hidden /> Objective
                </Flex>
                <span className={`rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium ${st.chip}`}>{st.label}</span>
              </Flex>
              <Text className="mt-1.5 text-[13px] font-medium leading-snug text-slate-100">{o.title}</Text>
              <Flex className="mt-auto items-end justify-between gap-2 pt-3">
                <Box>
                  <Text className="text-[10.5px] text-slate-500">{o.kpi}</Text>
                  <Text className="num text-[12.5px] text-slate-300">{o.current} <span className="text-slate-500">→ {o.target}</span></Text>
                </Box>
                <Box className="text-right">
                  <Text className="num text-[18px] font-semibold leading-none text-white">{o.alignment}<span className="text-[11px] text-slate-500">/100</span></Text>
                  <Text className="text-[10.5px] text-slate-500">alignment · {n} issues</Text>
                </Box>
              </Flex>
              <Box className="relative mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]" aria-hidden>
                <Box className="absolute inset-y-0 left-0 rounded-full bg-blue-400/25" style={{
              width: `${o.projected}%`
            }} />
                <Box className={`absolute inset-y-0 left-0 rounded-full ${st.bar}`} style={{
              width: `${o.alignment}%`
            }} />
              </Box>
            </button>
          </li>;
    })}
    </Box>;
}
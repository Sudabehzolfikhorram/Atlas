import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ArrowRightIcon, CpuIcon, DatabaseIcon, FileTextIcon, RadioTowerIcon, ScaleIcon, TriangleAlertIcon } from "lucide-react";
import { lineageConsumers, lineageSteps, type LineageStep } from "../../data/governance";
const kindIcon: Record<LineageStep["kind"], typeof CpuIcon> = {
  origin: RadioTowerIcon,
  store: DatabaseIcon,
  transform: CpuIcon,
  report: FileTextIcon,
  decision: ScaleIcon
};
export function LineageFlow() {
  return <Box>
      <Box className="overflow-x-auto pb-2">
        <Flex className="min-w-max items-stretch gap-2">
          {lineageSteps.map((s, i) => {
          const Icon = kindIcon[s.kind];
          const isGap = Boolean(s.gap);
          return <React.Fragment key={s.id}>
                <Box className={`w-[160px] rounded-xl border p-3 ${isGap ? "border-dashed border-amber-400/60 bg-amber-400/[0.06]" : "border-white/[0.08] bg-white/[0.02]"}`}>
                  <Flex className="items-center justify-between">
                    <Icon size={14} className={isGap ? "text-amber-300" : "text-slate-400"} />
                    <Text className="text-[10px] uppercase tracking-wider text-slate-500">{s.kind}</Text>
                  </Flex>
                  <Text className="mt-2 text-[12.5px] font-medium leading-snug text-slate-100">{s.label}</Text>
                  <Text className="mt-0.5 text-[11px] text-slate-500">{s.system}</Text>
                  <Text className={`mt-1.5 text-[11px] ${s.owner === "Unassigned" ? "text-amber-300" : "text-slate-400"}`}>Owner: {s.owner}</Text>
                  {s.gap && <Flex className="mt-2 items-start gap-1 text-[10.5px] leading-snug text-amber-200">
                      <TriangleAlertIcon size={11} className="mt-px shrink-0" />{s.gap}
                    </Flex>}
                </Box>
                {i < lineageSteps.length - 1 && <Flex className="items-center">
                    <ArrowRightIcon size={14} className={lineageSteps[i + 1].gap || s.gap ? "text-amber-400/70" : "text-slate-600"} />
                  </Flex>}
              </React.Fragment>;
        })}
        </Flex>
      </Box>
      <Text className="mb-2 mt-5 text-[11px] uppercase tracking-wider text-slate-500">What depends on critical data elements</Text>
      <Box className="grid gap-2 md:grid-cols-3">
        {lineageConsumers.map((c) => <Box key={c.element} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <Text className="text-[12.5px] font-medium text-slate-200">{c.element}</Text>
            <Flex className="mt-1.5 flex-wrap gap-1">
              {c.consumers.map((x) => <span key={x} className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[11px] text-slate-400">{x}</span>)}
            </Flex>
          </Box>)}
      </Box>
    </Box>;
}
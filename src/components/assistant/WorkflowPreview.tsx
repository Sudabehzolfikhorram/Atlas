import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ChevronRightIcon } from "lucide-react";
import type { WorkflowStep } from "../../types/assistant";
const kindStyle: Record<WorkflowStep["kind"], string> = {
  ok: "border-white/10 bg-white/[0.03]",
  bottleneck: "border-amber-400/50 bg-amber-400/[0.08]",
  manual: "border-blue-400/40 border-dashed bg-blue-400/[0.05]",
  proposed: "border-violet-400/50 border-dashed bg-violet-400/[0.06]"
};
const kindLabel: Record<WorkflowStep["kind"], string | null> = {
  ok: null,
  bottleneck: "Bottleneck",
  manual: "Manual handoff",
  proposed: "Proposed"
};
export function WorkflowPreview({
  steps,
  label



}: {steps: WorkflowStep[];label: string;}) {
  return <Box>
      <Text className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">{label}</Text>
      <Box className="overflow-x-auto pb-1">
        <Flex className="min-w-max items-stretch gap-1.5">
          {steps.map((s, i) => <React.Fragment key={`${s.label}-${i}`}>
              <Box className={`w-[132px] rounded-xl border px-3 py-2.5 ${kindStyle[s.kind]}`}>
                <Text className="text-[12px] font-medium leading-tight text-slate-100">{s.label}</Text>
                <Text className="mt-0.5 text-[11px] text-slate-500">{s.owner}</Text>
                <Text className={`num mt-1.5 text-[13px] ${s.kind === "bottleneck" ? "text-amber-300" : "text-slate-300"}`}>{s.duration}</Text>
                {kindLabel[s.kind] && <Text className={`mt-0.5 text-[10px] font-medium uppercase tracking-wide ${s.kind === "bottleneck" ? "text-amber-300" : s.kind === "manual" ? "text-blue-300" : "text-violet-300"}`}>
                    {kindLabel[s.kind]}
                  </Text>}
              </Box>
              {i < steps.length - 1 && <Flex className="items-center"><ChevronRightIcon size={14} className="text-slate-600" /></Flex>}
            </React.Fragment>)}
        </Flex>
      </Box>
    </Box>;
}
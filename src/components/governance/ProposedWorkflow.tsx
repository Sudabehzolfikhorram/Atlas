import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { CornerDownLeftIcon, ShieldCheckIcon, StampIcon, TriangleAlertIcon, WorkflowIcon } from "lucide-react";
import type { DesignStep, DesignStepKind } from "../../data/governance";
const kindMeta: Record<DesignStepKind, {
  label: string;
  Icon: typeof WorkflowIcon;
  chip: string;
  node: string;
}> = {
  step: {
    label: "Step",
    Icon: WorkflowIcon,
    chip: "border-white/10 bg-white/[0.04] text-slate-300",
    node: "border-white/15 bg-white/[0.05] text-slate-300"
  },
  check: {
    label: "Check",
    Icon: ShieldCheckIcon,
    chip: "border-teal-400/30 bg-teal-400/10 text-teal-200",
    node: "border-teal-400/40 bg-teal-400/10 text-teal-300"
  },
  approval: {
    label: "Approval point",
    Icon: StampIcon,
    chip: "border-violet-400/30 bg-violet-400/10 text-violet-200",
    node: "border-violet-400/40 bg-violet-400/10 text-violet-300"
  }
};
interface Props {
  steps: DesignStep[];
}

/** Full proposed workflow: each step, its checks and approval points, and the correction loop when one fails. */
export function ProposedWorkflow({
  steps
}: Props) {
  return <Box>
      <Flex className="mb-3 flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
        {(Object.keys(kindMeta) as DesignStepKind[]).map((k) => {
        const {
          label,
          Icon
        } = kindMeta[k];
        return <Flex key={k} className="items-center gap-1.5">
              <Icon size={12} aria-hidden className={k === "check" ? "text-teal-300" : k === "approval" ? "text-violet-300" : "text-slate-400"} />
              {label}
            </Flex>;
      })}
        <Flex className="items-center gap-1.5"><TriangleAlertIcon size={12} aria-hidden className="text-amber-300" />If it fails → correction</Flex>
      </Flex>

      <Box as="ol" aria-label="Proposed workflow steps" className="relative">
        {steps.map((s, i) => {
        const meta = kindMeta[s.kind];
        const last = i === steps.length - 1;
        return <Box as="li" key={s.id} className="relative grid gap-3 pb-4 last:pb-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              {!last && <span className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-px bg-white/10" aria-hidden />}
              <Flex className="min-w-0 gap-3">
                <Flex className={`relative z-[1] h-8 w-8 shrink-0 items-center justify-center rounded-full border ${meta.node}`}>
                  <meta.Icon size={14} aria-hidden />
                </Flex>
                <Box className="min-w-0 pt-0.5">
                  <Flex className="flex-wrap items-center gap-2">
                    <Text className="num text-[11px] text-slate-500">{i + 1}</Text>
                    <Text className="text-[13.5px] font-medium text-slate-100">{s.label}</Text>
                    <span className={`rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium ${meta.chip}`}>{meta.label}</span>
                  </Flex>
                  <Text className="mt-0.5 text-[12px] text-slate-400">{s.detail}</Text>
                  <Text className="mt-0.5 text-[11px] text-slate-500">{s.actor}</Text>
                </Box>
              </Flex>
              {s.onFail ? <Box className="ml-11 rounded-xl border border-dashed border-amber-400/30 bg-amber-400/[0.04] p-3 md:ml-0">
                  <Flex className="items-center gap-1.5 text-[11px] font-medium text-amber-200">
                    <TriangleAlertIcon size={12} aria-hidden />If it fails: {s.onFail.trigger}
                  </Flex>
                  <Text className="mt-1 text-[12px] leading-snug text-slate-300">{s.onFail.correction}</Text>
                  <Flex className="mt-1.5 items-center gap-1.5 text-[11px] text-slate-400">
                    <CornerDownLeftIcon size={11} aria-hidden />Returns to <span className="text-slate-200">{s.onFail.returnsTo}</span> before continuing
                  </Flex>
                </Box> : <Box className="hidden md:block" aria-hidden />}
            </Box>;
      })}
      </Box>
    </Box>;
}
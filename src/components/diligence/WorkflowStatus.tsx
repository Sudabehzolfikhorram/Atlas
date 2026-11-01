import { Box, Flex, Text } from "@chakra-ui/react";
import { CheckCircle2Icon, LockIcon } from "lucide-react";
import { closureLabel, wfOf, workflowDimensions } from "../../utils/workflow";
import type { Finding } from "../../types/diligence";
import { DEMO_LABEL } from "../../config/demo";

/** The four independent status dimensions of a finding, plus its closure state. */
export function WorkflowStatus({
  f,
  compact



}: {f: Finding;compact?: boolean;}) {
  const w = wfOf(f);
  const closure = closureLabel(f);
  if (compact) return <Flex className="flex-wrap gap-1.5" aria-label="Workflow status">
        {workflowDimensions.map((d) => {
      const m = (d.meta as Record<string, {
        label: string;
        chip: string;
      }>)[w[d.key]];
      return <span key={d.key} title={d.label} className={`rounded-md border px-1.5 py-0.5 text-[11px] ${m.chip}`}>
              <span className="opacity-70">{d.label.split(" ")[0]}:</span> {m.label}
            </span>;
    })}
      </Flex>;
  return <Box className="rounded-xl border border-white/[0.07] bg-white/[0.02]">
      <Box as="dl" className="grid grid-cols-1 divide-y divide-white/[0.05] sm:grid-cols-2 sm:divide-y-0">
        {workflowDimensions.map((d, i) => {
        const m = (d.meta as Record<string, {
          label: string;
          chip: string;
        }>)[w[d.key]];
        return <Box key={d.key} className={`px-3 py-2.5 ${i > 1 ? "sm:border-t sm:border-white/[0.05]" : ""} ${i % 2 ? "sm:border-l sm:border-white/[0.05]" : ""}`}>
              <Text as="dt" className="text-[11px] text-slate-500">{d.label}</Text>
              <Box as="dd" className="mt-1"><span className={`inline-block rounded-md border px-2 py-0.5 text-[12px] font-medium ${m.chip}`}>{m.label}</span></Box>
            </Box>;
      })}
      </Box>
      <Flex className={`items-center gap-2 border-t border-white/[0.06] px-3 py-2 text-[12px] ${w.closed ? "text-teal-300" : "text-slate-400"}`}>
        {w.closed ? <CheckCircle2Icon size={13} aria-hidden /> : <LockIcon size={12} aria-hidden />}
        <span>{closure}</span>
        {!w.closed && w.validation !== "rejected" && <span className="ml-auto text-[11px] text-slate-500">Closes only when accepted, plan approved, verification passed and a reviewer approves</span>}
      </Flex>
    </Box>;
}

export { DEMO_LABEL };

/** Explicit marker for simulated actions, results and connection states. */
export function DemoTag() {
  return <span className="inline-flex shrink-0 items-center rounded-md border border-dashed border-amber-400/50 bg-amber-400/10 px-1.5 py-0.5 text-[10.5px] font-semibold tracking-[0.02em] text-amber-300">{DEMO_LABEL}</span>;
}
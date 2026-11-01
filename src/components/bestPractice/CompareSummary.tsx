import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ArrowRightIcon, EyeOffIcon, GaugeIcon, CirclePlusIcon as PlusCircleIcon, ShieldCheckIcon } from "lucide-react";
import type { DiffKind, ProcessDiff, ProcessModel } from "../../types/bestPractice";
import { processCounts } from "../../utils/bestPractice";
interface CompareSummaryProps {
  asIs: ProcessModel;
  target: ProcessModel;
  diffs: ProcessDiff[];
  selectedId: string | null;
  onPick: (taskId: string) => void;
}
const diffMeta: Record<DiffKind, {
  label: string;
  Icon: typeof ShieldCheckIcon;
  tone: string;
}> = {
  controlled: {
    label: "Gap closed",
    Icon: ShieldCheckIcon,
    tone: "border-teal-400/40 bg-teal-500/10 text-teal-300"
  },
  removed: {
    label: "Removed",
    Icon: EyeOffIcon,
    tone: "border-rose-400/40 bg-rose-500/10 text-rose-300"
  },
  faster: {
    label: "Faster",
    Icon: GaugeIcon,
    tone: "border-sky-400/40 bg-sky-500/10 text-sky-300"
  },
  added: {
    label: "New step",
    Icon: PlusCircleIcon,
    tone: "border-violet-400/40 bg-violet-500/10 text-violet-300"
  }
};

/** Headline differences between as-is and best practice; each item pans the map to its task. */
export function CompareSummary({
  asIs,
  target,
  diffs,
  selectedId,
  onPick
}: CompareSummaryProps) {
  const a = processCounts(asIs);
  const t = processCounts(target);
  const criticalBefore = asIs.tasks.filter((x) => x.status === "critical").length;
  const criticalAfter = target.tasks.filter((x) => x.status === "critical").length;
  const stats = [{
    label: "Tasks",
    before: a.tasks,
    after: t.tasks
  }, {
    label: "Hidden work steps",
    before: asIs.tasks.filter((x) => x.kind === "hidden").length,
    after: target.tasks.filter((x) => x.kind === "hidden").length
  }, {
    label: "Controls",
    before: asIs.tasks.filter((x) => x.kind === "control").length,
    after: target.tasks.filter((x) => x.kind === "control").length
  }, {
    label: "Critical gaps",
    before: criticalBefore,
    after: criticalAfter
  }];
  return <Box className="mt-4 space-y-3">
      <Box className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {stats.map((s) => <Box key={s.label} className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5">
            <Text className="text-[12px] text-slate-400">{s.label}</Text>
            <Flex className="mt-1 items-center gap-2">
              <Text className="num text-[18px] font-semibold text-slate-400">{s.before}</Text>
              <ArrowRightIcon size={13} className="text-slate-600" aria-hidden />
              <Text className="num text-[18px] font-semibold text-white">{s.after}</Text>
            </Flex>
          </Box>)}
      </Box>

      <Box className="rounded-xl border border-white/[0.08]">
        <Flex className="items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
          <Text className="text-[13px] font-semibold text-white">Differences, gaps & improvements</Text>
          <Text className="num text-[12px] text-slate-500">{diffs.length} changes</Text>
        </Flex>
        <Box as="ul" className="grid divide-white/[0.05] md:grid-cols-2">
          {diffs.map((d) => {
          const m = diffMeta[d.kind];
          const on = selectedId === d.taskId;
          return <li key={d.id}>
                <button type="button" onClick={() => onPick(d.taskId)} aria-pressed={on} className={`flex w-full items-center gap-3 border-t border-white/[0.05] px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03] focus:outline-none focus-visible:bg-blue-500/10 ${on ? "bg-blue-500/[0.08]" : ""}`}>
                  <span className={`flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${m.tone}`}><m.Icon size={11} aria-hidden />{m.label}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-slate-100">{d.title} <span className="font-normal text-slate-500">· {d.lane}</span></span>
                    <span className="block truncate text-[11.5px] text-slate-400">{d.detail}</span>
                  </span>
                </button>
              </li>;
        })}
        </Box>
      </Box>
    </Box>;
}
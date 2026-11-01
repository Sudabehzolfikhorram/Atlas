import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ArrowRightIcon, CirclePlusIcon, RouteIcon, ShieldCheckIcon } from "lucide-react";
import { graphStats, type DataGraph } from "../../utils/bestPracticeData";
import type { DataDiff, DataDiffKind } from "../../types/bestPracticeData";
interface Props {
  asIs: DataGraph;
  target: DataGraph;
  diffs: DataDiff[];
  selectedId: string | null;
  onPick: (nodeId: string) => void;
}
const diffMeta: Record<DataDiffKind, {
  label: string;
  Icon: typeof ShieldCheckIcon;
  tone: string;
}> = {
  fixed: {
    label: "Gap closed",
    Icon: ShieldCheckIcon,
    tone: "border-sky-400/40 bg-sky-500/10 text-sky-300"
  },
  added: {
    label: "New control",
    Icon: CirclePlusIcon,
    tone: "border-teal-400/40 bg-teal-500/10 text-teal-300"
  },
  rerouted: {
    label: "Rerouted",
    Icon: RouteIcon,
    tone: "border-violet-400/40 bg-violet-500/10 text-violet-300"
  }
};

/** Headline before → after figures and the list of differences; each item pans the map to its node. */
export function DataCompareSummary({
  asIs,
  target,
  diffs,
  selectedId,
  onPick
}: Props) {
  const a = graphStats(asIs);
  const t = graphStats(target);
  const stats = [{
    label: "Red flags",
    before: a.redFlags,
    after: t.redFlags
  }, {
    label: "Failed or pending",
    before: a.notHealthy,
    after: t.notHealthy
  }, {
    label: "Foundation controls",
    before: a.controls,
    after: t.controls
  }, {
    label: "Nodes · connections",
    before: `${a.nodes} · ${a.connections}`,
    after: `${t.nodes} · ${t.connections}`
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
        <Flex className="flex-wrap items-center gap-x-4 gap-y-1 border-b border-white/[0.06] px-4 py-2.5">
          <Text className="text-[13px] font-semibold text-white">Differences, gaps & improvements</Text>
          <Flex className="items-center gap-3 text-[11.5px] text-slate-400">
            <Flex className="items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-rose-400" />Gap today</Flex>
            <Flex className="items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-sky-400" />Fixed</Flex>
            <Flex className="items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-teal-400" />New</Flex>
          </Flex>
          <Text className="num ml-auto text-[12px] text-slate-500">{diffs.length} changes</Text>
        </Flex>
        <Box as="ul" className="grid md:grid-cols-2">
          {diffs.map((d) => {
          const m = diffMeta[d.kind];
          const on = selectedId === d.nodeId;
          return <li key={d.id}>
                <button type="button" onClick={() => onPick(d.nodeId)} aria-pressed={on} className={`flex w-full items-center gap-3 border-t border-white/[0.05] px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03] focus:outline-none focus-visible:bg-blue-500/10 ${on ? "bg-blue-500/[0.08]" : ""}`}>
                  <span className={`flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${m.tone}`}><m.Icon size={11} aria-hidden />{m.label}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-slate-100">{d.title} <span className="font-normal text-slate-500">· {d.area}</span></span>
                    <span className="block truncate text-[11.5px] text-slate-400" title={d.detail}>{d.detail}</span>
                  </span>
                </button>
              </li>;
        })}
        </Box>
      </Box>
    </Box>;
}
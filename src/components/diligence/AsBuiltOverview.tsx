import { Box, Flex, Text } from "@chakra-ui/react";
import { CheckCircle2Icon, ClipboardCheckIcon, FlagIcon, GaugeIcon, TriangleAlertIcon } from "lucide-react";
import { diligenceKpis, isActionable } from "../../utils/workflow";
import { StatTile } from "./StatTile";
import { AttentionMatrix } from "./AttentionMatrix";
import { dimensionBlurb } from "../../data/diligence";
import { dimensionMeta, dimensions } from "../../utils/diligence";
import type { Department, DiligenceArea, Dimension, Finding } from "../../types/diligence";
export interface AsBuiltFilter {
  team: Department | null;
  dimension: Dimension | null;
  /** Set by a matrix column that groups several dimensions. */
  dims?: Dimension[];
  label?: string;
}
interface Props {
  area: DiligenceArea;
  list: Finding[];
  filter: AsBuiltFilter;
  onFilter: (f: AsBuiltFilter) => void;
}

/** KPIs, the red flag and gap matrices, and the four dimension cards for one area. */
export function AsBuiltOverview({
  area,
  list,
  filter,
  onFilter
}: Props) {
  const open = list.filter(isActionable);
  const k = diligenceKpis(list);
  const noun = area === "data" ? "Data" : "Process";
  const sample = `${k.evaluated} ${noun} findings · sample register`;
  return <Box className="space-y-4">
      <Box className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatTile label="Findings awaiting validation" value={k.awaitingValidation} tone={k.awaitingValidation ? "amber" : "neutral"} note={`${k.awaitingValidation} of ${sample}`} icon={<ClipboardCheckIcon size={15} />} />
        <StatTile label="Accepted findings still open" value={k.acceptedOpen} tone="blue" note={`Of ${k.accepted} accepted · ${sample}`} icon={<TriangleAlertIcon size={15} />} />
        <StatTile label="Critical unresolved risks" value={k.critical} tone={k.critical ? "rose" : "neutral"} note={`Not rejected, not closed · of ${k.nonRejected} non-rejected findings`} icon={<FlagIcon size={15} />} />
        <StatTile label="Remediation progress" value={`${k.progress}%`} tone={k.progress >= 70 ? "teal" : k.progress >= 30 ? "amber" : "rose"} bar={k.progress} note={`${k.implemented} of ${k.accepted} accepted findings implemented or closed`} icon={<GaugeIcon size={15} />} />
        <StatTile label="Closed after verification" value={k.closed} tone="teal" bar={k.closedPct} note={`${k.closedPct}% of ${k.accepted} accepted · passed test + reviewer approval`} icon={<CheckCircle2Icon size={15} />} />
      </Box>

      <Box className="grid gap-4 xl:grid-cols-2">
        <AttentionMatrix id="dil-flags" area={area} variant="redflags" title="Red flags" description={area === "process" ? "Processes vs. standards" : `${noun} vs. standards`} footnote="Select a cell to inspect its red flags." open={open} filter={filter} onFilter={onFilter} />
        <AttentionMatrix id="dil-gaps" area={area} variant="gaps" title="Gap analysis" description="An AI engine finds the delta" footnote="Non-critical deficiencies, ownership gaps and improvement opportunities." open={open} filter={filter} onFilter={onFilter} />
      </Box>

      <Box className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {dimensions.map((dim, i) => {
        const openDim = open.filter((f) => f.dimension === dim);
        const g = openDim.filter((f) => f.kind === "gap").length;
        const r = openDim.filter((f) => f.kind === "redflag").length;
        const top = [...openDim].sort((a, b) => a.kind === b.kind ? 0 : a.kind === "redflag" ? -1 : 1)[0];
        const on = filter.dimension === dim && !filter.team;
        return <button key={dim} type="button" aria-pressed={on} onClick={() => onFilter(on ? {
          team: null,
          dimension: null
        } : {
          team: null,
          dimension: dim
        })} className={`glass-tile flex flex-col rounded-2xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "border-blue-400/70 shadow-[0_0_0_1px_rgba(96,165,250,0.35)]" : "border-white/[0.07] hover:border-white/20"}`}>
              <Flex className="items-center gap-2">
                <span className="num flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.12] bg-white/[0.03] text-[11px] text-blue-300">0{i + 1}</span>
                <Text className="text-[13.5px] font-semibold text-slate-100">{dimensionMeta[dim].label}</Text>
              </Flex>
              <Text className="mt-2 text-[12px] leading-snug text-slate-400">{dimensionBlurb[area][dim]}</Text>
              <Flex className="mt-3 gap-2 text-[11.5px]">
                <span className="rounded-md border border-blue-400/40 bg-blue-500/10 px-1.5 py-0.5 text-blue-300"><span className="num">{g}</span> Gaps</span>
                <span className={`rounded-md border px-1.5 py-0.5 ${r ? "border-rose-400/45 bg-rose-500/10 text-rose-300" : "border-white/[0.12] text-slate-400"}`}><span className="num">{r}</span> Red flags</span>
              </Flex>
              <Text className="mt-3 border-t border-white/[0.08] pt-2.5 text-[11.5px] text-slate-500">
                {top ? <>Top Finding: <span className="text-slate-200">{top.title}</span></> : "No open findings in the sample"}
              </Text>
            </button>;
      })}
      </Box>
    </Box>;
}
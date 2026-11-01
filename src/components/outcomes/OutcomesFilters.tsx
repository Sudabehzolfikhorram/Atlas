import React from "react";
import { Box, Checkbox, Flex, Heading, Input, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text } from "@chakra-ui/react";
import { docGroups, monthlyVolume } from "../../data/outcomesFlow";
import { monthsInRange, widthFor } from "../../utils/outcomesFlow";
import type { DocGroup } from "../../types/outcomes";
interface Props {
  groups: Set<DocGroup>;
  onToggleGroup: (g: DocGroup) => void;
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  minHandoffs: number;
  onMinHandoffs: (v: number) => void;
}
const axisLabels = ["Jan 17", "Jul 17", "Jan 18", "Jul 18", "Jan 19", "Jul 19", "Jan 20"];
const maxVol = Math.max(...monthlyVolume);

/** Left rail: document groups, time window with volume histogram, and edge threshold. */
export function OutcomesFilters({
  groups,
  onToggleGroup,
  from,
  to,
  onFrom,
  onTo,
  minHandoffs,
  onMinHandoffs
}: Props) {
  const invalid = !from || !to || from > to;
  const {
    a,
    b
  } = monthsInRange(from || "1900-01-01", to || "1900-01-01");
  return <Box as="aside" aria-labelledby="oc-filters" className="glass-tile flex flex-col rounded-2xl border border-white/[0.07] p-5">
      <Heading as="h3" id="oc-filters" className="!text-[15px] !font-semibold text-slate-100">Filters</Heading>

      <Text className="mt-5 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">Document group</Text>
      <Flex className="mt-2 flex-wrap gap-x-4 gap-y-2">
        {docGroups.map((g) => <Checkbox key={g.id} size="sm" isChecked={groups.has(g.id)} onChange={() => onToggleGroup(g.id)}>
            <Flex as="span" className="items-center gap-1.5 text-[12.5px] text-slate-200">
              <span className="h-2 w-2 rounded-full" style={{
            background: g.color
          }} aria-hidden />
              {g.label}
            </Flex>
          </Checkbox>)}
      </Flex>

      <Text className="mt-5 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">Time (UTC)</Text>
      <Flex className="mt-2 items-center gap-2">
        <Input size="sm" type="date" aria-label="From date" value={from} max={to} onChange={(e) => onFrom(e.target.value)} className="!rounded-lg" />
        <span className="text-slate-500" aria-hidden>–</span>
      </Flex>
      <Input size="sm" type="date" aria-label="To date" value={to} min={from} onChange={(e) => onTo(e.target.value)} className="mt-2 !rounded-lg" />
      {invalid && <Text role="alert" className="mt-1.5 text-[11.5px] text-rose-300">Choose a start date before the end date.</Text>}
      <Box className="mt-3" aria-label="Permit volume per month; the selected window is highlighted" role="img">
        <Flex className="h-[64px] items-end gap-[2px] rounded-md bg-white/[0.03] px-1 pt-1">
          {monthlyVolume.map((v, i) => {
          const on = !invalid && i >= a && i <= b;
          return <span key={i} className={`flex-1 rounded-t-[1px] transition-colors ${on ? "bg-blue-400/80" : "bg-slate-500/40"}`} style={{
            height: `${Math.max(4, v / maxVol * 100)}%`
          }} />;
        })}
        </Flex>
        <Flex className="mt-1 justify-between text-[9.5px] text-slate-500">
          {axisLabels.map((l) => <span key={l}>{l}</span>)}
        </Flex>
      </Box>

      <Text className="mt-5 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">Edges</Text>
      <Flex className="mt-2 items-center gap-3">
        <Text as="label" id="oc-min-label" className="shrink-0 text-[12.5px] text-slate-200">Min handoffs</Text>
        <Slider aria-labelledby="oc-min-label" min={1} max={500} step={1} value={minHandoffs} onChange={onMinHandoffs} focusThumbOnChange={false}>
          <SliderTrack><SliderFilledTrack /></SliderTrack>
          <SliderThumb />
        </Slider>
        <Text className="num w-8 shrink-0 text-right text-[12.5px] text-slate-300">{minHandoffs}</Text>
      </Flex>

      <Text className="mt-5 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">Width</Text>
      <Box className="mt-2 space-y-2.5">
        {[10, 100, 1000].map((n) => <Flex key={n} className="items-center gap-3 text-[12px] text-slate-400">
            <svg width="80" height="8" aria-hidden><line x1="2" y1="4" x2="78" y2="4" stroke="currentColor" strokeLinecap="round" strokeWidth={widthFor(n)} className="text-slate-500" /></svg>
            {n.toLocaleString("en-US")} handoffs
          </Flex>)}
      </Box>
    </Box>;
}
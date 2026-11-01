import React, { useEffect, useState } from "react";
import { FOCUS_FILTER_EVENT, type FocusFilterDetail } from "../../utils/focusTarget";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { ChevronRightIcon } from "lucide-react";
import type { BusinessPriority } from "../../types/priorities";
import { SeverityTag, severityStyles } from "../ui/SeverityTag";
import { InfoTip } from "../ui/InfoTip";
import { ViewMoreButton } from "../ui/ViewMoreButton";
import { needsValidation, statusMeta } from "../../utils/priorities";
type SignalFilter = "all" | "critical" | "validation" | "progress";
const filters: {
  id: SignalFilter;
  label: string;
  match: (p: BusinessPriority) => boolean;
}[] = [{
  id: "all",
  label: "All",
  match: () => true
}, {
  id: "critical",
  label: "Critical",
  match: (p) => p.severity === "critical"
}, {
  id: "validation",
  label: "Needs validation",
  match: needsValidation
}, {
  id: "progress",
  label: "In progress",
  match: (p) => p.status === "approved" || p.status === "task_created"
}];
/** Rows shown before "View more". */
const INITIAL = 5;
const GRID = "lg:grid-cols-[minmax(0,1.6fr)_200px_minmax(0,1.1fr)_minmax(0,1.1fr)_20px]";
function nextStepText(p: BusinessPriority) {
  if (p.task) return `Task · ${p.task.owner}, due ${p.task.due}`;
  if (p.status === "approved") return "Create a task";
  if (p.status === "validation_requested") return "Awaiting validation";
  if (p.status === "needs_validation") return "Request validation";
  return p.recommendation.action;
}
export function SignalsList({
  items,
  onOpen



}: {items: BusinessPriority[];onOpen: (p: BusinessPriority) => void;}) {
  const [filter, setFilter] = useState<SignalFilter>("all");
  const [expanded, setExpanded] = useState(false);
  // AI Assistant focus requests can pre-select a filter.
  useEffect(() => {
    const onFocus = (e: Event) => {
      const {
        target,
        value
      } = (e as CustomEvent<FocusFilterDetail>).detail;
      if (target === "overview-signals" && filters.some((f) => f.id === value)) setFilter(value as SignalFilter);
    };
    window.addEventListener(FOCUS_FILTER_EVENT, onFocus);
    return () => window.removeEventListener(FOCUS_FILTER_EVENT, onFocus);
  }, []);
  const rows = items.filter(filters.find((f) => f.id === filter)!.match);
  const shown = expanded ? rows : rows.slice(0, INITIAL);
  return <Box as="section" id="overview-signals" aria-labelledby="signals-title" className="glass overflow-hidden rounded-3xl">
      <Flex className="flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
        <Flex className="items-center gap-1.5">
          <Heading as="h2" id="signals-title" className="!text-[19px] !font-semibold tracking-tight text-white">Business signals</Heading>
          <InfoTip label="Business signals">Issues and opportunities found across the organization, ranked by impact and urgency. Open a row for evidence, causes and the recommended action.</InfoTip>
        </Flex>
        <Flex role="group" aria-label="Filter signals" className="flex-wrap rounded-xl border border-white/[0.08] bg-black/20 p-0.5">
          {filters.map((f) => <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className={`h-9 whitespace-nowrap rounded-lg px-3 text-[13.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${filter === f.id ? "bg-white/[0.12] text-white" : "text-slate-400 hover:text-slate-200"}`}>
              {f.label} <span className="num text-slate-500">{items.filter(f.match).length}</span>
            </button>)}
        </Flex>
      </Flex>

      <Box className={`hidden gap-4 whitespace-nowrap border-b border-white/[0.05] px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.08em] text-slate-500 lg:grid ${GRID}`} aria-hidden>
        <span>Signal</span>
        <span>Status</span>
        <span>Impact</span>
        <span>Next step</span>
        <span />
      </Box>

      {rows.length === 0 ? <Text className="px-5 py-10 text-center text-[14px] text-slate-500">Nothing matches this filter.</Text> : <Box as="ul" id="signals-rows">
          {shown.map((p) => <Box as="li" key={p.id} className="border-b border-white/[0.04] last:border-0">
              <button type="button" onClick={() => onOpen(p)} aria-label={`Open ${p.title}`} className={`group grid w-full grid-cols-1 items-center gap-x-4 gap-y-2 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.03] focus:outline-none focus-visible:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400 ${GRID}`}>
                <Flex className="min-w-0 items-center gap-3">
                  <span className={`h-9 w-[3px] shrink-0 rounded ${severityStyles[p.severity].bar}`} aria-hidden />
                  <Box className="min-w-0">
                    <Text className="truncate text-[15px] font-medium text-slate-100 group-hover:text-white">{p.title}</Text>
                    <Text className="truncate text-[13px] text-slate-500"><span className="num">{p.id}</span> · {p.affected.processes[0]}</Text>
                  </Box>
                </Flex>
                <Flex className="flex-wrap items-center gap-2 pl-[15px] lg:pl-0">
                  <SeverityTag severity={p.severity} />
                  <span className={`whitespace-nowrap rounded-md border px-2 py-0.5 text-[12.5px] font-medium ${statusMeta[p.status].chip}`}>{statusMeta[p.status].label}</span>
                </Flex>
                <Text className="truncate pl-[15px] text-[14px] text-slate-300 lg:pl-0" title={p.impact.text}>
                  {p.impact.isEstimate && <span className="mr-1.5 rounded border border-blue-400/30 px-1 text-[11.5px] font-medium text-blue-200">Est.</span>}
                  {p.impact.text}
                </Text>
                <Text className="truncate pl-[15px] text-[14px] text-slate-400 lg:pl-0" title={nextStepText(p)}>{nextStepText(p)}</Text>
                <ChevronRightIcon size={18} className="hidden text-slate-600 transition-colors group-hover:text-slate-300 lg:block" aria-hidden />
              </button>
            </Box>)}
        </Box>}
      <ViewMoreButton expanded={expanded} hiddenCount={rows.length - shown.length} onToggle={() => setExpanded((e) => !e)} controls="signals-rows" />
    </Box>;
}
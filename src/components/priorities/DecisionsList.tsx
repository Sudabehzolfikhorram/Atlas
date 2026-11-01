import React, { useState } from "react";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { CalendarClockIcon, ChevronRightIcon, GavelIcon } from "lucide-react";
import type { BusinessPriority } from "../../types/priorities";
import { SeverityTag, severityStyles } from "../ui/SeverityTag";
import { InfoTip } from "../ui/InfoTip";
import { ViewMoreButton } from "../ui/ViewMoreButton";
import { statusMeta } from "../../utils/priorities";
/** Rows shown before "View more". */
const INITIAL = 4;
const GRID = "lg:grid-cols-[minmax(0,1.7fr)_170px_150px_minmax(0,1.2fr)_auto]";
interface Props {
  items: BusinessPriority[];
  onOpen: (p: BusinessPriority) => void;
  onReview: (p: BusinessPriority) => void;
}
export function DecisionsList({
  items,
  onOpen,
  onReview
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const awaiting = items.filter((p) => p.status === "awaiting_decision").length;
  const shown = expanded ? items : items.slice(0, INITIAL);
  return <Box as="section" id="overview-decisions" aria-labelledby="decisions-title" className="glass overflow-hidden rounded-3xl">
      <Flex className="flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
        <Flex className="items-center gap-1.5">
          <Heading as="h2" id="decisions-title" className="!text-[19px] !font-semibold tracking-tight text-white">Decisions for you</Heading>
          <InfoTip label="Decisions for you">Recommendations ready for a decision, based on the evidence available today. Review opens the options, trade-offs and evidence.</InfoTip>
        </Flex>
        <Flex className="items-center gap-1.5 rounded-lg border border-blue-400/25 bg-blue-400/[0.08] px-3 py-1.5 text-[13.5px] text-blue-200">
          <GavelIcon size={16} aria-hidden /><span className="num font-medium">{awaiting}</span> awaiting decision
        </Flex>
      </Flex>

      <Box className={`hidden gap-4 whitespace-nowrap border-b border-white/[0.05] px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.08em] text-slate-500 lg:grid ${GRID}`} aria-hidden>
        <span>Decision</span>
        <span>Priority · due</span>
        <span>Status</span>
        <span>Impact</span>
        <span className="w-[100px]" />
      </Box>

      {items.length === 0 ? <Text className="px-5 py-10 text-center text-[14px] text-slate-500">No decisions are waiting on you right now.</Text> : <Box as="ul" id="decisions-rows">
          {shown.map((p) => {
        const estimate = p.recommendation.benefit ?? p.impact.text;
        const isEst = !!p.recommendation.benefit || p.impact.isEstimate;
        return <Box as="li" key={p.id} className={`group grid grid-cols-1 items-center gap-x-4 gap-y-2 border-b border-white/[0.04] px-5 py-3.5 transition-colors last:border-0 hover:bg-white/[0.03] ${GRID} ${p.status === "deferred" ? "opacity-70" : ""}`}>
                <button type="button" onClick={() => onOpen(p)} className="flex min-w-0 items-center gap-3 text-left focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-blue-400">
                  <span className={`h-9 w-[3px] shrink-0 rounded ${severityStyles[p.severity].bar}`} aria-hidden />
                  <Box className="min-w-0">
                    <Text className="truncate text-[15px] font-medium text-slate-100 group-hover:text-white">{p.recommendation.action}</Text>
                    <Text className="truncate text-[13px] text-slate-500">{p.ownership.decisionMaker.name}</Text>
                  </Box>
                </button>
                <Flex className="flex-wrap items-center gap-2 pl-[15px] lg:pl-0">
                  <SeverityTag severity={p.severity} />
                  <Flex className="items-center gap-1 whitespace-nowrap text-[13px] text-slate-400"><CalendarClockIcon size={14} aria-hidden />{p.dueBy}</Flex>
                </Flex>
                <Box className="pl-[15px] lg:pl-0">
                  <span className={`whitespace-nowrap rounded-md border px-2 py-0.5 text-[12.5px] font-medium ${statusMeta[p.status].chip}`}>{statusMeta[p.status].label}</span>
                </Box>
                <Text className="truncate pl-[15px] text-[14px] text-slate-300 lg:pl-0" title={estimate}>
                  {isEst && <span className="mr-1.5 rounded border border-blue-400/30 px-1 text-[11.5px] font-medium text-blue-200">Est.</span>}
                  {estimate}
                </Text>
                <Box className="pl-[15px] lg:pl-0">
                  <Button size="sm" variant={p.status === "deferred" ? "outline" : "primary"} rightIcon={<ChevronRightIcon size={15} />} onClick={() => onReview(p)} className="!w-[100px]" aria-label={`${p.status === "deferred" ? "Revisit" : "Review"} decision: ${p.recommendation.action}`}>
                    {p.status === "deferred" ? "Revisit" : "Review"}
                  </Button>
                </Box>
              </Box>;
      })}
        </Box>}
      <ViewMoreButton expanded={expanded} hiddenCount={items.length - shown.length} onToggle={() => setExpanded((e) => !e)} controls="decisions-rows" />
    </Box>;
}
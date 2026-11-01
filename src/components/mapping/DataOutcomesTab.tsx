import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ActivityIcon, CheckIcon, ClockIcon, TriangleAlertIcon, WorkflowIcon } from "lucide-react";
import { atlasSuggestions, eventLog, outcomeCounts, outcomeHeadlines } from "../../data/processVariants";
import type { OutcomeHeadline } from "../../types/processVariants";
import { InfoTip } from "../ui/InfoTip";
import { AskAtlasCard } from "./AskAtlasCard";
import { ContextStrip } from "./ContextStrip";
import { DepartmentHandoffs } from "./DepartmentHandoffs";
import { ProcessVariantsTable } from "./ProcessVariantsTable";
import { StatisticalAnalysis } from "./StatisticalAnalysis";
const icons: Record<OutcomeHeadline["id"], typeof CheckIcon> = {
  completed: CheckIcon,
  duration: ClockIcon,
  deviation: ActivityIcon,
  stopped: TriangleAlertIcon
};
const tone = {
  teal: "text-teal-300",
  white: "text-white",
  amber: "text-amber-300"
};

/** Data mapping → Outcomes: case KPIs, department handoffs, variants and statistics. */
export function DataOutcomesTab() {
  return <Box className="space-y-4">
      <ContextStrip icon={WorkflowIcon} label={eventLog.name} meta={eventLog.period} chip={`${eventLog.cases.toLocaleString()} cases · ${eventLog.events.toLocaleString()} events`} />
      <Box as="ul" aria-label="Outcome indicators" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {outcomeHeadlines.map((k) => {
        const Icon = icons[k.id];
        return <li key={k.id} className="glass rounded-2xl px-5 py-4">
              <Flex className="items-center justify-between">
                <Text className="text-[13px] text-slate-300">{k.label}</Text>
                <InfoTip label={k.label}>{k.info}</InfoTip>
              </Flex>
              <Flex className="mt-2 items-end justify-between">
                <Text className={`num text-[30px] font-semibold leading-none ${tone[k.tone]}`}>{k.value}</Text>
                <Icon size={16} className="text-slate-500" aria-hidden />
              </Flex>
            </li>;
      })}
      </Box>
      <Box as="ul" aria-label="Case counts" className="glass grid divide-white/[0.06] rounded-2xl sm:grid-cols-2 lg:grid-cols-5 lg:divide-x">
        {outcomeCounts.map((c) => <li key={c.label} className="flex items-center gap-2 px-4 py-3">
            <Text className="text-[12.5px] text-slate-400">{c.label}</Text>
            <InfoTip label={c.label}>{c.info}</InfoTip>
            <Text className="num ml-auto text-[14px] font-semibold text-white">{c.value.toLocaleString()}</Text>
          </li>)}
      </Box>
      <DepartmentHandoffs />
      <ProcessVariantsTable />
      <StatisticalAnalysis />
      <AskAtlasCard layout="split" suggestions={atlasSuggestions} workflows={["The workflow the question names", eventLog.name]} />
    </Box>;
}
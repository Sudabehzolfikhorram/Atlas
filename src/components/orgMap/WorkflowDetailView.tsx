import React, { useMemo, useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { ArrowLeftIcon, ChevronRightIcon, InfoIcon } from "lucide-react";
import type { OrgWorkflow } from "../../types/orgMap";
import { getProcess } from "../../utils/processMap";
import { ProcessComparisonView, type ComparisonTab } from "../processMap/ProcessComparisonView";
import { WorkflowBranchCanvas, type BranchSelection, type BranchStage } from "./WorkflowBranchCanvas";
import { WorkflowBranchInspector } from "./WorkflowBranchInspector";
interface Props {
  wf: OrgWorkflow;
  tab: ComparisonTab;
  onTabChange: (t: ComparisonTab) => void;
  onBack: () => void;
  onOpenWorkflow: (wf: OrgWorkflow) => void;
}

/** Isolated branch of the organization map for ONE workflow, followed by its process comparison. */
export function WorkflowDetailView({
  wf,
  tab,
  onTabChange,
  onBack,
  onOpenWorkflow
}: Props) {
  const process = wf.processId ? getProcess(wf.processId) : null;
  const stages: BranchStage[] = useMemo(() => process ? process.stages.map((s) => ({
    id: s.id,
    label: s.label,
    stepIds: s.stepIds
  })) : wf.stages.map((s, i) => ({
    id: `stage-${i}`,
    label: s,
    stepIds: []
  })), [process, wf.stages]);
  const [selection, setSelection] = useState<BranchSelection>({
    kind: "workflow"
  });
  return <Box className="space-y-4">
      <Box className="glass overflow-hidden rounded-3xl">
        {/* Breadcrumb */}
        <Flex className="flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-3 md:px-5">
          <Box as="nav" aria-label="Breadcrumb">
            <Flex as="ol" className="flex-wrap items-center gap-1.5 text-[13px]">
              <Box as="li">
                <button id="wf-crumb-root" type="button" onClick={onBack} className="rounded-md px-1 text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                  Organization map
                </button>
              </Box>
              <Box as="li" aria-hidden className="text-slate-600"><ChevronRightIcon size={13} /></Box>
              <Box as="li" aria-current="page" className="font-semibold text-white">{wf.name}</Box>
            </Flex>
          </Box>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeftIcon size={14} />} onClick={onBack}>Back to organization map</Button>
        </Flex>

        {/* Isolated, expanded branch */}
        <Box className="grid gap-4 p-4 md:p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Box className="min-w-0">
            <WorkflowBranchCanvas key={wf.id} wf={wf} process={process} stages={stages} selection={selection} onSelect={setSelection} />
            <Flex className="mt-3 flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[11.5px] text-slate-400">
              <Flex className="items-center gap-1.5"><svg width="22" height="6" aria-hidden><line x1="0" y1="3" x2="22" y2="3" stroke="#60A5FA" strokeWidth="2.2" /></svg>Primary owner</Flex>
              <Flex className="items-center gap-1.5"><svg width="22" height="6" aria-hidden><line x1="0" y1="3" x2="22" y2="3" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="6 4" /></svg>Participant · verified</Flex>
              <Flex className="items-center gap-1.5"><svg width="22" height="6" aria-hidden><line x1="0" y1="3" x2="22" y2="3" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="1.5 4.5" /></svg>Participant · AI-inferred</Flex>
              {process && <Flex className="items-center gap-1.5"><svg width="22" height="6" aria-hidden><line x1="0" y1="3" x2="22" y2="3" stroke="#A78BFA" strokeWidth="1.5" strokeDasharray="5 4" /></svg>Proposed step · not observed</Flex>}
              {process && <Flex className="items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" aria-hidden />Identified issue</Flex>}
              <Text className="ml-auto text-slate-500">Select any node to inspect it</Text>
            </Flex>
          </Box>
          <Box className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <WorkflowBranchInspector wf={wf} process={process} stages={stages} selection={selection} onSelect={setSelection} onOpenWorkflow={onOpenWorkflow} />
          </Box>
        </Box>
      </Box>

      {/* Existing comparison */}
      {wf.processId ? <ProcessComparisonView key={wf.processId} processId={wf.processId} tab={tab} onTabChange={onTabChange} /> : <Flex className="glass items-start gap-3 rounded-3xl p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-slate-300"><InfoIcon size={16} aria-hidden /></span>
          <Box>
            <Text className="text-[14px] font-medium text-white">Process comparison isn't available yet</Text>
            <Text className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-slate-400">
              Current process, Best practice and Side by side need step-level records for this workflow. Once its source systems are mined, the comparison will appear here.
            </Text>
          </Box>
        </Flex>}
    </Box>;
}
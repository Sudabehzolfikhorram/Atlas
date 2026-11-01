import React from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { LightbulbIcon } from "lucide-react";
import { controlDesigns, governanceGaps, type NextControl } from "../../data/governance";
import { ProposedWorkflow } from "./ProposedWorkflow";
import { ControlResponsibilities } from "./ControlResponsibilities";
import { DesignStageTrack, type DesignStage } from "./DesignStageTrack";
import { PilotReview, type PilotReviewRecord } from "./PilotReview";
interface Props {
  control: NextControl;
  reviews: Record<string, PilotReviewRecord>;
  scheduled: boolean;
  onSelectControl: (id: string) => void;
  onRecord: (stage: PilotReviewRecord["stage"], note: string) => void;
  onReopen: () => void;
}
export function ProposedSolutionSection({
  control,
  reviews,
  scheduled,
  onSelectControl,
  onRecord,
  onReopen
}: Props) {
  const design = controlDesigns.find((d) => d.controlId === control.id);
  const gaps = governanceGaps.filter((g) => control.gaps.includes(g.id));
  const stages: Record<string, DesignStage> = Object.fromEntries(Object.entries(reviews).map(([k, r]) => [k, r.stage]));
  const stage: DesignStage = stages[control.id] ?? "proposed";
  return <Box as="section" id="proposed-solution" aria-labelledby="proposed-solution-title" className="glass scroll-mt-24 rounded-2xl !border-violet-300/25 p-5">
      <Flex className="flex-wrap items-start justify-between gap-3">
        <Box className="min-w-0">
          <Flex className="items-center gap-2">
            <LightbulbIcon size={16} className="text-violet-300" aria-hidden />
            <Text className="text-[11px] font-medium uppercase tracking-[0.08em] text-violet-300">5 · Proposed solution</Text>
          </Flex>
          <Heading as="h3" id="proposed-solution-title" className="mt-2 !text-[17px] !font-semibold tracking-tight text-white">
            {control.id} · {control.name}
          </Heading>
          <Text className="mt-1 text-[12.5px] text-slate-400">
            Solves {gaps.map((g) => `${g.id} ${g.title.toLowerCase()}`).join(" and ")}
            {design && <> · {design.version}, drafted {design.drafted}</>}
          </Text>
        </Box>
        <Text className="text-[11px] text-slate-500">
          Implementation: <span className={scheduled ? "text-teal-300" : "text-slate-400"}>{scheduled ? "scheduled" : "not scheduled"}</span>
        </Text>
      </Flex>

      <Box className="mt-4">
        <DesignStageTrack stage={stage} />
      </Box>

      {design ? <>
          <Box className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Box>
              <Text className="mb-3 text-[11px] uppercase tracking-wider text-slate-500">Complete proposed workflow</Text>
              <ProposedWorkflow steps={design.steps} />
            </Box>
            <Box>
              <PilotReview design={design} controlName={control.name} review={reviews[control.id]} onRecord={onRecord} onReopen={onReopen} />
            </Box>
          </Box>
          <Box className="mt-6">
            <ControlResponsibilities controlId={control.id} stages={stages} onSelectControl={onSelectControl} />
          </Box>
        </> : <Text className="mt-6 text-[13px] text-slate-500">No proposed design has been drafted for this control yet.</Text>}
    </Box>;
}
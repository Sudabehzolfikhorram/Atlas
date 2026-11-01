import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ArrowRightIcon, BookOpenIcon, ChevronRightIcon, GavelIcon, InfoIcon, SparklesIcon, TriangleAlertIcon } from "lucide-react";
import type { OrgWorkflow, TeamId } from "../../types/orgMap";
import type { ProcessChange, ProcessDefinition } from "../../types/processMap";
import { getTeam, getWorkflow, linkRole, teamsOf, workflowsOf } from "../../utils/orgMap";
import { LAST_MONTH, casesAt, changeMeta, stepChange } from "../../utils/processMap";
import { EvidenceTag } from "../ui/EvidenceTag";
import { teamIcons } from "./teamIcons";
import { isDecisionStep, type BranchSelection, type BranchStage } from "./WorkflowBranchCanvas";
interface Props {
  wf: OrgWorkflow;
  process: ProcessDefinition | null;
  stages: BranchStage[];
  selection: BranchSelection;
  onSelect: (s: BranchSelection) => void;
  onOpenWorkflow: (wf: OrgWorkflow) => void;
}

/** Details for whichever node of the isolated workflow branch is selected. */
export function WorkflowBranchInspector({
  wf,
  process,
  stages,
  selection,
  onSelect,
  onOpenWorkflow
}: Props) {
  return <Box as="aside" aria-label="Node details" aria-live="polite">
      {selection.kind === "workflow" && <WorkflowPanel wf={wf} process={process} stages={stages} onSelect={onSelect} onOpenWorkflow={onOpenWorkflow} />}
      {selection.kind === "team" && <TeamPanel wf={wf} id={selection.id as TeamId} />}
      {selection.kind === "stage" && <StagePanel process={process} stage={stages.find((s) => s.id === selection.id)!} index={stages.findIndex((s) => s.id === selection.id)} onSelect={onSelect} />}
      {selection.kind === "step" && process && <StepPanel process={process} stepId={selection.id} />}
    </Box>;
}
const Eyebrow = ({
  children


}: {children: React.ReactNode;}) => <Text className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-slate-500">{children}</Text>;
const Section = ({
  title,
  children



}: {title: string;children: React.ReactNode;}) => <Box className="mt-4 border-t border-white/[0.06] pt-3">
    <Eyebrow>{title}</Eyebrow>
    <Box className="mt-2 space-y-1.5">{children}</Box>
  </Box>;
const Metric = ({
  label,
  value,
  warn = false




}: {label: string;value: React.ReactNode;warn?: boolean;}) => <Box className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2">
    <Text className="text-[11px] text-slate-500">{label}</Text>
    <Text className={`num text-[13px] ${warn ? "text-amber-300" : "text-slate-100"}`}>{value}</Text>
  </Box>;
const chip = "rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-left text-[11.5px] text-slate-300 transition-colors hover:border-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";
function WorkflowPanel({
  wf,
  process,
  stages,
  onSelect,
  onOpenWorkflow
}: Omit<Props, "selection">) {
  const issues = process?.steps.filter((s) => s.current?.issue).length ?? null;
  return <>
      <Eyebrow>Workflow</Eyebrow>
      <Text className="mt-0.5 text-[16px] font-semibold leading-snug text-white">{wf.name}</Text>
      <Text className="mt-1.5 text-[12.5px] leading-relaxed text-slate-400">{wf.description}</Text>
      <Box className="mt-3 grid grid-cols-2 gap-2">
        <Metric label="Owner" value={getTeam(wf.owner).name} />
        <Metric label="Volume" value={wf.volume ?? "Not measured"} />
        <Metric label="Evidence coverage" value={`${wf.coverage}%`} warn={wf.coverage < 60} />
        <Metric label="Identified issues" value={issues === null ? "Not mined" : issues} warn={!!issues} />
        {process && <Metric label="Cases (latest month)" value={casesAt(process, LAST_MONTH).toLocaleString()} />}
        {process && <Metric label="Connected sources" value={process.sources[LAST_MONTH]} />}
      </Box>
      {wf.note && <Text className="mt-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-2.5 py-2 text-[11.5px] leading-relaxed text-amber-100/90">{wf.note}</Text>}
      <Section title={`Stages · ${stages.length}`}>
        <Flex className="flex-wrap items-center gap-1">
          {stages.map((s, i) => <React.Fragment key={s.id}>
              {i > 0 && <ChevronRightIcon size={11} className="text-slate-600" aria-hidden />}
              <button type="button" className={chip} onClick={() => onSelect({
            kind: "stage",
            id: s.id
          })}>{s.label}</button>
            </React.Fragment>)}
        </Flex>
      </Section>
      {wf.dependsOn.length > 0 && <Section title="Depends on">
          <Flex className="flex-wrap gap-1.5">
            {wf.dependsOn.map((id) => {
          const dep = getWorkflow(id);
          return dep ? <button key={id} type="button" className={chip} onClick={() => onOpenWorkflow(dep)}>{dep.name}</button> : null;
        })}
          </Flex>
        </Section>}
      {!process && <Flex className="mt-4 items-start gap-2 text-[11.5px] leading-relaxed text-slate-400">
          <InfoIcon size={13} className="mt-0.5 shrink-0" aria-hidden />
          Step-level records haven't been mined for this workflow, so the branch ends at its documented stages.
        </Flex>}
    </>;
}
function TeamPanel({
  wf,
  id



}: {wf: OrgWorkflow;id: TeamId;}) {
  const team = getTeam(id);
  const Icon = teamIcons[id];
  const entry = teamsOf(wf).find((t) => t.team === id);
  const link = linkRole(wf, id);
  const {
    owns,
    joins
  } = workflowsOf(id);
  return <>
      <Flex className="items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-200"><Icon size={17} aria-hidden /></span>
        <Box>
          <Eyebrow>Team in this workflow</Eyebrow>
          <Text className="text-[16px] font-semibold text-white">{team.name}</Text>
        </Box>
      </Flex>
      <Flex className="mt-3 items-center gap-2">
        <span className={`rounded-md border px-1.5 py-px text-[11px] font-medium ${link?.role === "owner" ? "border-blue-400/40 bg-blue-500/15 text-blue-200" : "border-white/15 bg-white/[0.05] text-slate-300"}`}>{link?.role === "owner" ? "Primary owner" : "Participant"}</span>
        {link && <EvidenceTag status={link.evidence} />}
      </Flex>
      <Section title="Responsibility">
        <Text className="text-[12.5px] leading-relaxed text-slate-300">{entry?.duty}</Text>
      </Section>
      <Section title="Team">
        <Text className="text-[12.5px] text-slate-400">{team.description}</Text>
        <Text className="text-[12px] text-slate-500">Lead: <span className="text-slate-300">{team.lead}</span> · Owns {owns.length} · joins {joins.length} workflows</Text>
      </Section>
    </>;
}
function StagePanel({
  process,
  stage,
  index,
  onSelect





}: {process: ProcessDefinition | null;stage: BranchStage;index: number;onSelect: (s: BranchSelection) => void;}) {
  const steps = process ? stage.stepIds.map((id) => process.steps.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s) : [];
  const wait = steps.reduce((n, s) => n + (s.current?.waitDays ?? 0), 0);
  const issues = steps.filter((s) => s.current?.issue);
  const changes = process?.recommendation?.changes.filter((c) => c.stepIds.some((id) => stage.stepIds.includes(id))) ?? [];
  return <>
      <Eyebrow>Stage {index + 1}</Eyebrow>
      <Text className="mt-0.5 text-[16px] font-semibold text-white">{stage.label}</Text>
      {!process ? <Text className="mt-2 text-[12.5px] leading-relaxed text-slate-400">Steps, owners and issues for this stage aren't available until its step-level records are mined.</Text> : <>
          <Box className="mt-3 grid grid-cols-3 gap-2">
            <Metric label="Steps" value={steps.length} />
            <Metric label="Avg. wait" value={`${Math.round(wait * 10) / 10} d`} />
            <Metric label="Issues" value={issues.length} warn={issues.length > 0} />
          </Box>
          <Section title="Steps">
            {steps.map((s) => <button key={s.id} type="button" onClick={() => onSelect({
          kind: "step",
          id: s.id
        })} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-slate-200">{s.current?.label ?? s.recommended?.label}</span>
                {!s.current && <span className="text-[10.5px] text-violet-300">Proposed</span>}
                {s.current?.issue && <TriangleAlertIcon size={12} className="text-amber-300" aria-label="Has an issue" />}
                <ArrowRightIcon size={12} className="text-slate-500" aria-hidden />
              </button>)}
          </Section>
          <Section title="Proposed changes in this stage">
            {changes.length ? changes.map((c) => <ChangeCard key={c.id} change={c} reference={!!process.recommendation?.reference} />) : <Text className="text-[12px] text-slate-500">{process.recommendation ? "None proposed." : "No recommendation yet."}</Text>}
          </Section>
        </>}
    </>;
}
function StepPanel({
  process,
  stepId



}: {process: ProcessDefinition;stepId: string;}) {
  const step = process.steps.find((s) => s.id === stepId);
  if (!step) return null;
  const v = step.current;
  const change = stepChange(process, stepId);
  return <>
      <Flex className="items-center gap-2">
        <Eyebrow>Step</Eyebrow>
        {v ? <span className="rounded-md border border-teal-400/25 bg-teal-400/[0.08] px-1.5 py-px text-[10.5px] text-teal-200">Observed</span> : <EvidenceTag status="proposed" />}
        {isDecisionStep(process, stepId) && <span className="inline-flex items-center gap-1 rounded-md border border-white/15 px-1.5 py-px text-[10.5px] text-slate-300"><GavelIcon size={10} aria-hidden />Decision point</span>}
      </Flex>
      <Text className="mt-1 text-[16px] font-semibold text-white">{v?.label ?? step.recommended?.label}</Text>
      {v ? <>
          <Box className="mt-3 grid grid-cols-2 gap-2">
            <Metric label="Responsible" value={v.owner} />
            <Metric label="System" value={v.system} />
            <Metric label="Avg. wait" value={v.waitDays !== undefined ? `${v.waitDays} d` : "Not measured"} />
            <Metric label="Share of cases" value={`${Math.round(v.share * 100)}%`} />
          </Box>
          {v.issue && <Flex className="mt-3 items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-2.5 py-2 text-[12px] leading-relaxed text-amber-100/90">
              <TriangleAlertIcon size={13} className="mt-0.5 shrink-0 text-amber-300" aria-hidden />{v.issue}
            </Flex>}
          <Section title="Supporting evidence">
            {v.evidence.map((e) => <Flex key={e.label} className="items-center gap-1.5 text-[12px] text-slate-300"><EvidenceTag status={e.status} compact />{e.label}</Flex>)}
          </Section>
        </> : <Text className="mt-2 text-[12.5px] leading-relaxed text-slate-400">Not part of today's workflow. Proposed owner: {step.recommended?.owner} · {step.recommended?.system}.</Text>}
      <Section title="Best practice">
        {change ? <ChangeCard change={change} reference={!!process.recommendation?.reference} /> : <Text className="text-[12px] text-slate-500">{process.recommendation ? "No change proposed for this step." : "No recommendation yet."}</Text>}
      </Section>
    </>;
}
function ChangeCard({
  change: c,
  reference



}: {change: ProcessChange;reference: boolean;}) {
  return <Box className="rounded-xl border border-violet-400/20 bg-violet-400/[0.04] px-3 py-2.5">
      <Flex className="flex-wrap items-center gap-1.5">
        <span className={`rounded-md border px-1.5 py-px text-[10.5px] font-medium ${changeMeta[c.type].chip}`}>{changeMeta[c.type].label}</span>
        <span className="inline-flex items-center gap-1 text-[10.5px] text-violet-200">{reference ? <BookOpenIcon size={10} aria-hidden /> : <SparklesIcon size={10} aria-hidden />}Proposal · not observed</span>
      </Flex>
      <Text className="mt-1.5 text-[12.5px] font-medium text-slate-100">{c.title}</Text>
      <Text className="mt-1 text-[12px] text-slate-400">{c.current}</Text>
      <Flex className="mt-1 items-start gap-1.5 text-[12px] text-violet-100/90"><ArrowRightIcon size={12} className="mt-1 shrink-0 text-violet-300" aria-hidden />{c.proposed}</Flex>
      <Text className="mt-1.5 text-[11.5px] text-slate-500"><span className="text-slate-400">Why:</span> {c.why}</Text>
      <Flex className="mt-1.5 items-center gap-1.5 text-[11px] text-slate-400"><EvidenceTag status={c.evidenceStatus} compact />{c.evidence}</Flex>
    </Box>;
}
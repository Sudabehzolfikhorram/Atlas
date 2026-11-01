import React, { useId, useState } from "react";
import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangleIcon, ArrowRightIcon, ChevronDownIcon, ChevronRightIcon, ColumnsIcon, SparklesIcon, XIcon } from "lucide-react";
import type { OrgMapModel } from "../../hooks/useOrgMap";
import type { OrgWorkflow, TeamId } from "../../types/orgMap";
import { collaboratorsOf, getTeam, getWorkflow, issuesForTeam, issuesForWorkflow, teamCount, teamsOf, workflowsOf, type MapIssue } from "../../utils/orgMap";
import { EvidenceTag } from "../ui/EvidenceTag";
import type { ComparisonTab } from "../processMap/ProcessComparisonView";
import { teamIcons } from "./teamIcons";
interface Props {
  model: OrgMapModel;
  onOpenComparison: (wf: OrgWorkflow, tab: ComparisonTab) => void;
  onClose: () => void;
}

/** Details for the selected team or workflow. Rendered only when something is selected. */
export function OrgMapInspector({
  model,
  onOpenComparison,
  onClose
}: Props) {
  const {
    selection,
    select
  } = model;
  if (!selection) return null;
  const selectTeam = (id: TeamId) => select({
    kind: "team",
    id
  });
  const selectWorkflow = (id: string) => select({
    kind: "workflow",
    id
  });
  const wf = selection.kind === "workflow" ? getWorkflow(selection.id) : undefined;
  return <Box as="aside" aria-label="Selection details" className="flex h-full flex-col">
      {selection.kind === "team" ? <TeamDetails id={selection.id} onClose={onClose} onSelectWorkflow={selectWorkflow} onSelectTeam={selectTeam} /> : wf ? <WorkflowDetails wf={wf} onClose={onClose} onSelectTeam={selectTeam} onSelectWorkflow={selectWorkflow} onOpenComparison={onOpenComparison} /> : <Text className="text-[14px] text-slate-400">This workflow is no longer available.</Text>}
    </Box>;
}
function Header({
  kind,
  name,
  status,
  icon,
  onClose






}: {kind: string;name: string;status: React.ReactNode;icon?: React.ReactNode;onClose: () => void;}) {
  return <Flex className="items-start gap-3">
      {icon}
      <Box className="min-w-0 flex-1">
        <Text className="text-[12px] font-medium uppercase tracking-[0.1em] text-slate-500">{kind}</Text>
        <Text as="h3" className="mt-0.5 text-[17px] font-semibold leading-snug text-white">{name}</Text>
        <Box className="mt-1.5">{status}</Box>
      </Box>
      <IconButton aria-label="Close details" size="sm" variant="ghost" icon={<XIcon size={16} />} onClick={onClose} className="-mr-1 -mt-1" />
    </Flex>;
}
function Chip({
  tone,
  children



}: {tone: "amber" | "teal" | "slate";children: React.ReactNode;}) {
  const cls = tone === "amber" ? "border-amber-400/30 bg-amber-400/10 text-amber-300" : tone === "teal" ? "border-teal-400/30 bg-teal-400/10 text-teal-300" : "border-white/15 bg-white/[0.05] text-slate-300";
  return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[12.5px] font-medium ${cls}`}>{children}</span>;
}
function IssueList({
  issues,
  showWorkflow = false



}: {issues: MapIssue[];showWorkflow?: boolean;}) {
  if (!issues.length) return null;
  return <Box className="mt-4">
      <Text className="text-[12px] font-medium uppercase tracking-[0.1em] text-slate-500">Needs attention · {issues.length}</Text>
      <Box as="ul" className="mt-2 space-y-2">
        {issues.map((i) => <Flex as="li" key={i.id} className={`gap-2.5 rounded-xl border px-3 py-2.5 ${i.severity === "high" ? "border-rose-400/25 bg-rose-400/[0.06]" : "border-amber-400/20 bg-amber-400/[0.05]"}`}>
            <AlertTriangleIcon size={16} className={`mt-0.5 shrink-0 ${i.severity === "high" ? "text-rose-300" : "text-amber-300"}`} aria-hidden />
            <Box className="min-w-0">
              <Text className="text-[14px] font-medium text-slate-100">{i.title}</Text>
              {showWorkflow && <Text className="text-[12.5px] text-slate-400">{getWorkflow(i.workflowId)?.name}</Text>}
              <Text className="mt-0.5 text-[13px] leading-snug text-slate-300">{i.detail}</Text>
            </Box>
          </Flex>)}
      </Box>
    </Box>;
}
function Metric({
  label,
  value,
  tone




}: {label: string;value: React.ReactNode;tone?: string;}) {
  return <Box className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
      <Text className={`num text-[17px] font-medium leading-tight ${tone ?? "text-white"}`}>{value}</Text>
      <Text className="mt-0.5 text-[12.5px] text-slate-500">{label}</Text>
    </Box>;
}

/** Collapsible group for secondary details. */
function Group({
  title,
  count,
  defaultOpen = false,
  children





}: {title: string;count?: number;defaultOpen?: boolean;children: React.ReactNode;}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const reduce = useReducedMotion();
  return <Box className="border-t border-white/[0.06]">
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className="flex min-h-[44px] w-full items-center gap-2 py-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md">
        <Text as="span" className="flex-1 text-[14px] font-medium text-slate-200">
          {title}{count !== undefined && <span className="num ml-1.5 text-slate-500">{count}</span>}
        </Text>
        <ChevronDownIcon size={16} className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {open && <motion.div id={id} key="c" initial={reduce ? false : {
        height: 0,
        opacity: 0
      }} animate={{
        height: "auto",
        opacity: 1
      }} exit={reduce ? {
        opacity: 0
      } : {
        height: 0,
        opacity: 0
      }} transition={{
        duration: 0.2
      }} className="overflow-hidden">
            <Box className="space-y-1 pb-3">{children}</Box>
          </motion.div>}
      </AnimatePresence>
    </Box>;
}
const pill = "rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[13px] text-slate-300 transition-colors hover:border-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";
function TeamDetails({
  id,
  onClose,
  onSelectWorkflow,
  onSelectTeam





}: {id: TeamId;onClose: () => void;onSelectWorkflow: (id: string) => void;onSelectTeam: (id: TeamId) => void;}) {
  const team = getTeam(id);
  const Icon = teamIcons[id];
  const {
    owns,
    joins
  } = workflowsOf(id);
  const issues = issuesForTeam(id);
  const collaborators = collaboratorsOf(id).slice(0, 5);
  return <>
      <Header kind="Team" name={team.name} onClose={onClose} icon={<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-200"><Icon size={19} aria-hidden /></span>} status={issues.length ? <Chip tone="amber">{issues.length} need{issues.length === 1 ? "s" : ""} attention</Chip> : <Chip tone="slate">No open issues on owned workflows</Chip>} />
      <IssueList issues={issues} showWorkflow />
      <Box className="mt-4 grid grid-cols-3 gap-2">
        <Metric label="Owns" value={owns.length} />
        <Metric label="Joins" value={joins.length} />
        <Metric label="People" value={team.headcount} />
      </Box>
      <Text className="mt-2 text-[13px] text-slate-400">Lead: <span className="text-slate-200">{team.lead}</span> · illustrative</Text>

      <Box className="mt-4">
        {owns.length > 0 && <Group title="Workflows owned" count={owns.length} defaultOpen>
            {owns.map((w) => <WorkflowRow key={w.id} wf={w} owner onClick={() => onSelectWorkflow(w.id)} />)}
          </Group>}
        {joins.length > 0 && <Group title="Participates in" count={joins.length}>
            {joins.map((w) => <WorkflowRow key={w.id} wf={w} onClick={() => onSelectWorkflow(w.id)} />)}
          </Group>}
        {collaborators.length > 0 && <Group title="Works most with" count={collaborators.length}>
            <Flex className="flex-wrap gap-1.5">
              {collaborators.map((c) => <button key={c.team} type="button" onClick={() => onSelectTeam(c.team)} className={pill}>
                  {getTeam(c.team).name} <span className="num text-slate-500">· {c.shared}</span>
                </button>)}
            </Flex>
          </Group>}
      </Box>
    </>;
}
function WorkflowDetails({
  wf,
  onClose,
  onSelectTeam,
  onSelectWorkflow,
  onOpenComparison






}: {wf: OrgWorkflow;onClose: () => void;onSelectTeam: (id: TeamId) => void;onSelectWorkflow: (id: string) => void;onOpenComparison: Props["onOpenComparison"];}) {
  const teams = teamsOf(wf);
  const issues = issuesForWorkflow(wf.id);
  const limited = wf.coverage < 60;
  return <>
      <Header kind="Workflow" name={wf.name} onClose={onClose} status={<Flex className="flex-wrap gap-1.5">
            {issues.length ? <Chip tone="amber">{issues.length} need{issues.length === 1 ? "s" : ""} attention</Chip> : <Chip tone="teal">No open issues</Chip>}
            {wf.processId && <Chip tone="slate"><ColumnsIcon size={13} className="mr-1 text-violet-300" aria-hidden />Comparison available</Chip>}
          </Flex>} />
      <IssueList issues={issues} />

      <Box className="mt-4 grid grid-cols-2 gap-2">
        <Metric label="Evidence coverage" value={`${wf.coverage}%`} tone={limited ? "text-amber-300" : undefined} />
        {wf.volume ? <Metric label="Volume" value={wf.volume} /> : <Metric label="Teams involved" value={teamCount(wf)} />}
      </Box>
      <Flex className="mt-2 flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-slate-400">
        Owner: <span className="text-slate-200">{getTeam(wf.owner).name}</span>
        <EvidenceTag status={wf.ownerEvidence} compact />
      </Flex>

      <Box className="mt-4">
        <Group title="Teams involved" count={teams.length}>
          {teams.map((t) => {
          const Icon = teamIcons[t.team];
          return <button key={t.team} type="button" onClick={() => onSelectTeam(t.team)} className="flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${t.role === "owner" ? "bg-blue-500/20 text-blue-200" : "bg-white/[0.06] text-slate-300"}`}><Icon size={14} aria-hidden /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-slate-100">{getTeam(t.team).name}</span>
                  <span className="block text-[12.5px] text-slate-500">{t.duty}</span>
                </span>
                <EvidenceTag status={t.evidence} compact />
              </button>;
        })}
        </Group>
        <Group title="Stages" count={wf.stages.length}>
          <Flex className="flex-wrap items-center gap-1">
            {wf.stages.map((s, i) => <React.Fragment key={s}>
                {i > 0 && <ChevronRightIcon size={13} className="text-slate-600" aria-hidden />}
                <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[12.5px] text-slate-300">{s}</span>
              </React.Fragment>)}
          </Flex>
        </Group>
        {wf.dependsOn.length > 0 && <Group title="Depends on" count={wf.dependsOn.length}>
            <Flex className="flex-wrap gap-1.5">
              {wf.dependsOn.map((id) => {
            const dep = getWorkflow(id);
            return dep ? <button key={id} type="button" onClick={() => onSelectWorkflow(id)} className={pill}>{dep.name}</button> : null;
          })}
            </Flex>
          </Group>}
      </Box>

      <Box className="mt-auto border-t border-white/[0.06] pt-4">
        <Button variant="primary" className="w-full" rightIcon={<ArrowRightIcon size={15} />} onClick={() => onOpenComparison(wf, "current")}>
          Explore workflow
        </Button>
        {wf.processId ? <Flex className="mt-2 gap-2">
            <Button size="sm" variant="outline" className="flex-1" leftIcon={<SparklesIcon size={14} />} onClick={() => onOpenComparison(wf, "ai")}>Best practice</Button>
            <Button size="sm" variant="outline" className="flex-1" leftIcon={<ColumnsIcon size={14} />} onClick={() => onOpenComparison(wf, "side")}>Side by side</Button>
          </Flex> : <Text className="mt-2 text-[12.5px] leading-snug text-slate-500">Step-level data hasn't been mined yet, so comparison isn't available.</Text>}
      </Box>
    </>;
}
function WorkflowRow({
  wf,
  owner = false,
  onClick




}: {wf: OrgWorkflow;owner?: boolean;onClick: () => void;}) {
  const issues = issuesForWorkflow(wf.id).length;
  return <button type="button" onClick={onClick} className="flex min-h-[40px] w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
      <span className={`h-[2px] w-4 shrink-0 ${owner ? "bg-blue-400" : "border-t-2 border-dashed border-slate-400"}`} aria-hidden />
      <span className="min-w-0 flex-1 truncate text-[14px] text-slate-200">{wf.name}</span>
      {issues > 0 && <AlertTriangleIcon size={14} className="shrink-0 text-amber-300" aria-label={`${issues} need attention`} />}
      {wf.processId && <ColumnsIcon size={14} className="shrink-0 text-violet-300" aria-label="Comparison available" />}
    </button>;
}
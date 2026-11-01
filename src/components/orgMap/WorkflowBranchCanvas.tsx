import React from "react";
import { Tooltip } from "@chakra-ui/react";
import { Building2Icon, GavelIcon, TriangleAlertIcon, WorkflowIcon } from "lucide-react";
import { organization } from "../../data/orgWorkflows";
import { usePanZoom } from "../../hooks/usePanZoom";
import type { OrgWorkflow } from "../../types/orgMap";
import type { ProcessDefinition } from "../../types/processMap";
import { getTeam, teamsOf } from "../../utils/orgMap";
import { MapZoomControls } from "./MapZoomControls";
import { RoleTag, linkStyle } from "./OrgMapCanvas";
import { teamIcons } from "./teamIcons";
export type BranchSelection = {
  kind: "workflow";
} | {
  kind: "team";
  id: string;
} | {
  kind: "stage";
  id: string;
} | {
  kind: "step";
  id: string;
};
export interface BranchStage {
  id: string;
  label: string;
  stepIds: string[];
}
interface Props {
  wf: OrgWorkflow;
  process: ProcessDefinition | null;
  stages: BranchStage[];
  selection: BranchSelection;
  onSelect: (s: BranchSelection) => void;
}
const TOP = 56;
const ROW = 46;
const TEAM = {
  x: 20,
  w: 214,
  h: 40
};
const HUB = {
  x: 330,
  r: 40
};
const WF = {
  x: 420,
  w: 232,
  h: 56
};
const STAGE = {
  x: 732,
  w: 176,
  h: 40
};
const STEP = {
  x: 988,
  w: 232,
  h: 36
};
export const isDecisionStep = (p: ProcessDefinition, stepId: string) => [...p.currentEdges, ...(p.recommendation?.edges ?? [])].some((e) => e.from === stepId && e.kind === "approval");

/**
 * The selected workflow's branch of the organization map, isolated and expanded:
 * its teams → organization → workflow (same nodes and link styles as the full map),
 * then fanned out into stages and individual steps.
 */
export function WorkflowBranchCanvas({
  wf,
  process,
  stages,
  selection,
  onSelect
}: Props) {
  const teams = teamsOf(wf);
  const steps = process ? stages.flatMap((s) => s.stepIds.map((id) => ({
    stageId: s.id,
    step: process.steps.find((x) => x.id === id)!
  })).filter((x) => x.step)) : [];
  const rows = Math.max(teams.length, stages.length, steps.length, 4);
  const SPAN = rows * ROW;
  const W = process ? STEP.x + STEP.w + 20 : STAGE.x + STAGE.w + 24;
  const H = TOP + SPAN + 24;
  const midY = TOP + SPAN / 2;
  const teamY = (i: number) => TOP + SPAN * (i + 0.5) / teams.length;
  const stepY = (i: number) => TOP + SPAN * (i + 0.5) / Math.max(steps.length, 1);
  const stageY = (i: number) => {
    if (!process) return TOP + SPAN * (i + 0.5) / stages.length;
    const idx = steps.map((s, j) => s.stageId === stages[i].id ? j : -1).filter((j) => j >= 0);
    return idx.length ? (stepY(idx[0]) + stepY(idx[idx.length - 1])) / 2 : TOP + SPAN * (i + 0.5) / stages.length;
  };
  const selStageId = selection.kind === "stage" ? selection.id : selection.kind === "step" ? steps.find((s) => s.step.id === selection.id)?.stageId : undefined;
  const selTeam = selection.kind === "team" ? selection.id : null;
  const nodeCls = (on: boolean, dim: boolean) => `absolute flex items-center text-left rounded-xl border transition-[opacity,background-color,border-color] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "border-blue-400/60 bg-[#14213D]" : "border-white/[0.08] bg-[#0F1729] hover:border-white/20"} ${dim ? "opacity-40" : "opacity-100"}`;
  const {
    vpRef,
    handlers,
    fit,
    zoomAt,
    pct,
    viewportStyle,
    contentStyle
  } = usePanZoom({
    contentW: W,
    contentH: H,
    onBackgroundClick: () => onSelect({
      kind: "workflow"
    }),
    onEscape: () => onSelect({
      kind: "workflow"
    })
  });
  const curve = (x1: number, y1: number, x2: number, y2: number, bend = 0.45) => {
    const dx = (x2 - x1) * bend;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };
  return <div className="relative">
      <div ref={vpRef} role="region" aria-label={`${wf.name} workflow branch, zoom ${pct}%. Drag to pan, Ctrl or ⌘ plus scroll to zoom.`} tabIndex={0} {...handlers} className="relative cursor-grab touch-none select-none overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1220] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:cursor-grabbing" style={viewportStyle}>
        <div className="absolute left-0 top-0 origin-top-left" style={contentStyle}>
          <svg width={W} height={H} className="absolute inset-0" aria-hidden>
            {[[TEAM.x + 4, "start", "TEAMS INVOLVED"], [HUB.x, "middle", "ORGANIZATION"], [WF.x + WF.w / 2, "middle", "WORKFLOW"], [STAGE.x + 4, "start", "STAGES"], ...(process ? [[STEP.x + STEP.w - 4, "end", "STEPS · OBSERVED"]] : [])].map(([x, anchor, label]) => <text key={label as string} x={x as number} y={26} textAnchor={anchor as "start"} fill="#64748B" fontSize="10.5" letterSpacing="1.4">{label}</text>)}
            <circle cx={HUB.x} cy={midY} r={HUB.r + 26} fill="rgba(96,165,250,0.05)" />

            {/* teams → organization (same encoding as the full map in workflow focus) */}
            {teams.map((t, i) => {
            const st = linkStyle(t);
            const dim = selTeam !== null && selTeam !== t.team;
            return <path key={t.team} d={curve(TEAM.x + TEAM.w, teamY(i), HUB.x - HUB.r, midY)} fill="none" stroke={st.stroke} strokeWidth={st.width} strokeDasharray={st.dash} opacity={dim ? 0.2 : 0.95} />;
          })}
            {/* organization → workflow */}
            <path d={`M ${HUB.x + HUB.r} ${midY} L ${WF.x} ${midY}`} stroke="#60A5FA" strokeWidth="2.2" />
            {/* workflow → stages */}
            {stages.map((s, i) => <path key={s.id} d={curve(WF.x + WF.w, midY, STAGE.x, stageY(i))} fill="none" stroke={selStageId === s.id ? "#60A5FA" : "#64748B"} strokeWidth={selStageId === s.id ? 2 : 1.2} opacity={selStageId && selStageId !== s.id ? 0.25 : 0.8} />)}
            {/* stages → steps */}
            {steps.map(({
            stageId,
            step
          }, j) => {
            const i = stages.findIndex((s) => s.id === stageId);
            const proposedOnly = !step.current;
            const on = selection.kind === "step" ? selection.id === step.id : selStageId === stageId;
            return <path key={step.id} d={curve(STAGE.x + STAGE.w, stageY(i), STEP.x, stepY(j))} fill="none" stroke={proposedOnly ? "#A78BFA" : on ? "#60A5FA" : "#64748B"} strokeWidth={on ? 1.8 : 1.1} strokeDasharray={proposedOnly ? "5 4" : undefined} opacity={selStageId && !on ? 0.22 : 0.75} />;
          })}
          </svg>

          {/* Teams */}
          {teams.map((t, i) => {
          const team = getTeam(t.team);
          const Icon = teamIcons[t.team];
          const on = selTeam === t.team;
          return <Tooltip key={t.team} label={t.duty} hasArrow placement="top" openDelay={400}>
                <button type="button" aria-pressed={on} aria-label={`${team.name}, ${t.role === "owner" ? "primary owner" : "participant"}: ${t.duty}`} onClick={() => onSelect({
              kind: "team",
              id: t.team
            })} className={`${nodeCls(on, !!selTeam && !on)} gap-2.5 px-2`} style={{
              left: TEAM.x,
              top: teamY(i) - TEAM.h / 2,
              width: TEAM.w,
              height: TEAM.h
            }}>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${on || t.role === "owner" ? "bg-blue-500/25 text-blue-200" : "bg-white/[0.06] text-slate-300"}`}><Icon size={14} aria-hidden /></span>
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-slate-100">{team.name}</span>
                  <RoleTag owner={t.role === "owner"} />
                  <span className="absolute -right-[4px] h-2 w-2 rounded-full border border-[#0C1220] bg-slate-300" aria-hidden />
                </button>
              </Tooltip>;
        })}

          {/* Organization hub */}
          <div className="absolute flex items-center justify-center rounded-full border border-white/15 bg-[#111A2E] shadow-[0_0_0_6px_rgba(96,165,250,0.06)]" style={{
          left: HUB.x - HUB.r,
          top: midY - HUB.r,
          width: HUB.r * 2,
          height: HUB.r * 2
        }} aria-hidden>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-200"><Building2Icon size={16} /></span>
          </div>
          <p className="pointer-events-none absolute text-center text-[11.5px] font-medium text-slate-300" style={{
          left: HUB.x - 70,
          width: 140,
          top: midY + HUB.r + 8
        }}>{organization.name}</p>

          {/* Workflow (the selected branch node) */}
          <button type="button" aria-pressed={selection.kind === "workflow"} onClick={() => onSelect({
          kind: "workflow"
        })} className={`${nodeCls(selection.kind === "workflow", false)} gap-2.5 px-3 !border-blue-400/50`} style={{
          left: WF.x,
          top: midY - WF.h / 2,
          width: WF.w,
          height: WF.h
        }}>
            <span className="absolute -left-[4px] h-2 w-2 rounded-full border border-[#0C1220] bg-blue-300" aria-hidden />
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-200"><WorkflowIcon size={15} aria-hidden /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-semibold leading-tight text-white">{wf.name}</span>
              <span className="block text-[10.5px] text-slate-400">{teams.length} teams · {stages.length} stages</span>
            </span>
            <span className="absolute -right-[4px] h-2 w-2 rounded-full border border-[#0C1220] bg-slate-300" aria-hidden />
          </button>

          {/* Stages */}
          {stages.map((s, i) => {
          const on = selection.kind === "stage" && selection.id === s.id;
          const issues = process ? s.stepIds.filter((id) => process.steps.find((x) => x.id === id)?.current?.issue).length : 0;
          return <button key={s.id} type="button" aria-pressed={on} aria-label={`Stage ${i + 1}: ${s.label}${process ? `, ${s.stepIds.length} steps` : ""}${issues ? `, ${issues} issues` : ""}`} onClick={() => onSelect({
            kind: "stage",
            id: s.id
          })} className={`${nodeCls(on, !!selStageId && selStageId !== s.id)} gap-2 px-3`} style={{
            left: STAGE.x,
            top: stageY(i) - STAGE.h / 2,
            width: STAGE.w,
            height: STAGE.h
          }}>
                <span className="absolute -left-[4px] h-2 w-2 rounded-full border border-[#0C1220] bg-slate-300" aria-hidden />
                <span className="num text-[10.5px] text-slate-500">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-slate-100">{s.label}</span>
                  {process && <span className="block text-[10.5px] text-slate-500">{s.stepIds.length} steps</span>}
                </span>
                {issues > 0 && <span className="flex items-center gap-0.5 text-[10.5px] text-amber-300"><TriangleAlertIcon size={10} aria-hidden />{issues}</span>}
                {process && <span className="absolute -right-[4px] h-2 w-2 rounded-full border border-[#0C1220] bg-slate-300" aria-hidden />}
              </button>;
        })}

          {/* Steps */}
          {steps.map(({
          stageId,
          step
        }, j) => {
          const on = selection.kind === "step" && selection.id === step.id;
          const v = step.current;
          const proposedOnly = !v;
          const removed = !!v && !step.recommended && !!process?.recommendation;
          const label = v?.label ?? step.recommended?.label ?? step.id;
          return <button key={step.id} type="button" aria-pressed={on} aria-label={`${label}${proposedOnly ? ", proposed step" : ""}${v?.issue ? ", has an issue" : ""}`} onClick={() => onSelect({
            kind: "step",
            id: step.id
          })} className={`${nodeCls(on, !!selStageId && selStageId !== stageId)} gap-2 pl-3 pr-2 ${proposedOnly ? "!border-dashed !border-violet-400/40" : ""}`} style={{
            left: STEP.x,
            top: stepY(j) - STEP.h / 2,
            width: STEP.w,
            height: STEP.h
          }}>
                <span className={`absolute -left-[4px] h-2 w-2 rounded-full border border-[#0C1220] ${proposedOnly ? "bg-violet-300" : "bg-slate-300"}`} aria-hidden />
                <span className={`min-w-0 flex-1 truncate text-[12px] font-medium ${removed ? "text-slate-400 line-through decoration-rose-300/60" : "text-slate-100"}`}>{label}</span>
                {process && isDecisionStep(process, step.id) && <GavelIcon size={11} className="shrink-0 text-slate-400" aria-label="Decision point" />}
                {v?.issue && <span className="h-2 w-2 shrink-0 rounded-full bg-rose-400" aria-hidden />}
                {proposedOnly && <span className="shrink-0 rounded-md border border-violet-400/40 bg-violet-400/10 px-1.5 py-px text-[10px] font-medium text-violet-200">Proposed</span>}
                {v?.waitDays !== undefined && <span className="num shrink-0 text-[10.5px] text-slate-500">{v.waitDays}d</span>}
              </button>;
        })}
        </div>
      </div>
      <MapZoomControls pct={pct} zoomAt={zoomAt} fit={fit} />
    </div>;
}
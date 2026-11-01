import '@xyflow/react/dist/style.css';
import React, { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { Team } from "../../types/teamGraph";
import { coverage, coverageHealth, healthMeta } from "../../utils/teamGraph";
import { healthIcons, teamIcons } from "./teamGraphIcons";
export type TeamNodeState = "default" | "selected" | "neighbor" | "dim";
export type TeamFlowNode = Node<{
  team: Team;
  state: TeamNodeState;
  compact?: boolean;
}, "team">;
const sides = [["t", Position.Top], ["r", Position.Right], ["b", Position.Bottom], ["l", Position.Left]] as const;
const handle = "!h-1.5 !w-1.5 !min-h-0 !min-w-0 !border-0 !bg-transparent !pointer-events-none";

/** A team on the organization graph: health, evidence coverage and identity at a glance. */
function TeamNodeBase({
  data
}: NodeProps<TeamFlowNode>) {
  const {
    team,
    state,
    compact
  } = data;
  const Icon = teamIcons[team.icon];
  const h = healthMeta[team.status];
  const HIcon = healthIcons[team.status];
  const cov = coverage(team);
  const covH = healthMeta[coverageHealth(cov.pct)];
  return <div aria-label={`${team.name}, ${h.label}, evidence coverage ${cov.pct}%`} className={`glass-tile relative cursor-pointer rounded-xl border px-3 pb-2.5 pt-2.5 transition-[opacity,border-color] duration-150 hover:!border-blue-400/60 ${compact ? "w-[184px]" : "w-[210px]"} ${state === "selected" ? "!border-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.3)]" : state === "neighbor" ? "!border-white/25" : ""} ${state === "dim" ? "opacity-35" : ""}`}>
      {sides.map(([id, pos]) => <React.Fragment key={id}>
          <Handle type="source" id={`s-${id}`} position={pos} className={handle} />
          <Handle type="target" id={`t-${id}`} position={pos} className={handle} />
        </React.Fragment>)}
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-400/25 bg-blue-400/10 text-blue-300">
          <Icon size={15} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-semibold leading-tight text-slate-100">{team.name}</div>
          <div className="truncate text-[10.5px] text-slate-400">{team.category} · {team.members} people</div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1 rounded border px-1.5 text-[10px] font-medium leading-[16px] ${h.chip}`}>
          <HIcon size={10} aria-hidden />
          {h.label}
        </span>
        <span className="num text-[10.5px] text-slate-400">Evidence <span className={`font-semibold ${covH.text}`}>{cov.pct}%</span></span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.08]">
        <div className={`h-full rounded-full ${covH.bar}`} style={{
        width: `${cov.pct}%`
      }} />
      </div>
    </div>;
}
export const TeamNode = memo(TeamNodeBase);
import React, { useEffect, useRef } from "react";
import { Tooltip } from "@chakra-ui/react";
import { AlertTriangleIcon, Building2Icon, ColumnsIcon } from "lucide-react";
import { organization, orgTeams } from "../../data/orgWorkflows";
import type { OrgMapModel } from "../../hooks/useOrgMap";
import { usePanZoom, type MapView } from "../../hooks/usePanZoom";
import type { LinkInfo, OrgSelection } from "../../types/orgMap";
import { issuesForWorkflow, orderedWorkflows, teamCount, workflowsOf } from "../../utils/orgMap";
import { MapZoomControls } from "./MapZoomControls";
import { teamIcons } from "./teamIcons";
export type { MapView };
const W = 1080;
const TOP = 76;
const ROW = 50;
const SPAN = orderedWorkflows.length * ROW;
const H = TOP + SPAN + 24;
const HUB = {
  x: W / 2,
  y: TOP + SPAN / 2,
  r: 58
};
const TEAM = {
  x: 20,
  w: 240,
  h: 46
};
const WF = {
  x: W - 20 - 256,
  w: 256,
  h: 40
};
/** Width reserved on the right for the details panel when it overlays the map. */
export const PANEL_W = 360;
const PANEL_MIN_VIEWPORT = 768;
const teamY = (i: number) => TOP + SPAN * (i + 0.5) / orgTeams.length;
const wfY = (i: number) => TOP + i * ROW + ROW / 2;
function centerOf(s: OrgSelection) {
  if (!s) return null;
  if (s.kind === "team") {
    const i = orgTeams.findIndex((t) => t.id === s.id);
    return i < 0 ? null : {
      x: TEAM.x + TEAM.w / 2,
      y: teamY(i)
    };
  }
  const i = orderedWorkflows.findIndex((w) => w.id === s.id);
  return i < 0 ? null : {
    x: WF.x + WF.w / 2,
    y: wfY(i)
  };
}
export const linkStyle = (l: LinkInfo) => l.role === "owner" ? {
  stroke: "#60A5FA",
  width: 2.2,
  dash: undefined
} : l.evidence === "inferred" ? {
  stroke: "#93C5FD",
  width: 1.5,
  dash: "1.5 4.5"
} : {
  stroke: "#CBD5E1",
  width: 1.5,
  dash: "6 4"
};
interface Props {
  model: OrgMapModel;
  /** Fill the parent's height (expanded view) instead of sizing to content. */
  fill?: boolean;
  /** Restores a previous zoom/pan after the map remounts. */
  initialView?: MapView | null;
  onViewChange?: (v: MapView) => void;
}
export function OrgMapCanvas({
  model,
  fill = false,
  initialView = null,
  onViewChange
}: Props) {
  const {
    focus,
    related,
    selection,
    select,
    setHover,
    setSelection,
    visible
  } = model;
  const {
    vpRef,
    handlers,
    fit,
    zoomAt,
    focusOn,
    getView,
    setView,
    width,
    pct,
    viewportStyle,
    contentStyle
  } = usePanZoom({
    contentW: W,
    contentH: H,
    fill,
    initialView,
    onViewChange,
    onBackgroundClick: () => setSelection(null),
    onEscape: () => setSelection(null)
  });

  // Gently centre the selected node; restore the overview when the selection is cleared.
  const prevSel = useRef<OrgSelection>(selection);
  const before = useRef<ReturnType<typeof getView> | null>(null);
  useEffect(() => {
    const prev = prevSel.current;
    prevSel.current = selection;
    if (!width) return;
    if (selection) {
      if (!prev || !before.current) before.current = getView();
      const c = centerOf(selection);
      if (c) focusOn(c.x, c.y, width >= PANEL_MIN_VIEWPORT ? PANEL_W + 12 : 0);
    } else if (prev && before.current) {
      setView(before.current);
      before.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);
  const focusTeam = focus?.kind === "team" ? focus.id : null;
  const focusWf = focus?.kind === "workflow" ? focus.id : null;
  const teamState = (id: string) => {
    const hidden = !visible.teams.has(id) && visible.active && model.query.trim() !== "";
    if (!related) return hidden ? "dim" : "idle";
    if (focusTeam) return focusTeam === id ? "focus" : "dim";
    return related.has(id) ? "related" : "dim";
  };
  const wfState = (id: string) => {
    const hidden = !visible.workflows.has(id);
    if (!related) return hidden ? "dim" : "idle";
    if (focusWf) return focusWf === id ? "focus" : "dim";
    return related.has(id) ? hidden ? "related-muted" : "related" : "dim";
  };
  const isSelected = (kind: "team" | "workflow", id: string) => selection?.kind === kind && selection.id === id;
  return <div className="relative h-full">
      <div ref={vpRef} id={fill ? undefined : "org-map-region"} role="region" aria-label={`Organization-to-workflow map, zoom ${pct}%. Drag to pan, Ctrl or ⌘ plus scroll to zoom, arrow keys to pan when focused.`} tabIndex={0} {...handlers} className="relative cursor-grab touch-none select-none overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1220] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:cursor-grabbing" style={{
      ...viewportStyle,
      paddingTop: "0px",
      paddingBottom: "0px",
      paddingLeft: "2px",
      paddingRight: "2px",
      marginRight: "0px"
    }}>
        <div className="absolute left-0 top-0 origin-top-left" style={contentStyle}>
          <svg width={W} height={H} className="absolute inset-0" aria-hidden style={{
          paddingTop: "20px",
          paddingBottom: "20px"
        }}>
            {[[TEAM.x + 4, "start", "TEAMS & DEPARTMENTS"], [HUB.x, "middle", "ORGANIZATION"], [WF.x + WF.w - 4, "end", "WORKFLOWS"]].map(([x, anchor, label]) => <text key={label as string} x={x as number} y={TOP - 18} textAnchor={anchor as "start"} fill="#64748B" fontSize="12" letterSpacing="1.4">
                {label}
              </text>)}
            <circle cx={HUB.x} cy={HUB.y} r={HUB.r + 34} fill="rgba(96,165,250,0.05)" />
            <circle cx={HUB.x} cy={HUB.y} r={HUB.r + 14} fill="none" stroke="rgba(148,163,184,0.18)" strokeDasharray="1 5" strokeWidth="2" />

            {orgTeams.map((tm, i) => {
            const y = teamY(i);
            const s = teamState(tm.id);
            const link = focusWf ? related?.get(tm.id) : undefined;
            const st = focusTeam === tm.id ? {
              stroke: "#60A5FA",
              width: 2.2,
              dash: undefined
            } : link ? linkStyle(link) : {
              stroke: "#64748B",
              width: 1,
              dash: undefined
            };
            const op = s === "dim" ? 0.08 : s === "idle" ? 0.45 : 0.95;
            return <path key={tm.id} d={`M ${TEAM.x + TEAM.w} ${y} C ${TEAM.x + TEAM.w + 140} ${y}, ${HUB.x - 140} ${HUB.y}, ${HUB.x - HUB.r} ${HUB.y}`} fill="none" stroke={st.stroke} strokeWidth={st.width} strokeDasharray={st.dash} opacity={op} style={{
              transition: "opacity .2s, stroke .2s"
            }} />;
          })}

            {orderedWorkflows.map((wf, i) => {
            const y = wfY(i);
            const s = wfState(wf.id);
            const link = focusTeam ? related?.get(wf.id) : undefined;
            const st = focusWf === wf.id ? {
              stroke: "#60A5FA",
              width: 2.2,
              dash: undefined
            } : link ? linkStyle(link) : {
              stroke: "#64748B",
              width: 1,
              dash: undefined
            };
            const op = s === "dim" ? 0.08 : s === "idle" ? 0.45 : s === "related-muted" ? 0.4 : 0.95;
            return <path key={wf.id} d={`M ${HUB.x + HUB.r} ${HUB.y} C ${HUB.x + 140} ${HUB.y}, ${WF.x - 140} ${y}, ${WF.x} ${y}`} fill="none" stroke={st.stroke} strokeWidth={st.width} strokeDasharray={st.dash} opacity={op} style={{
              transition: "opacity .2s, stroke .2s"
            }} />;
          })}
          </svg>

          {/* Hub */}
          <button type="button" onClick={() => setSelection(null)} aria-label={`${organization.name} — show the whole organization`} className="absolute flex flex-col items-center justify-center rounded-full border border-white/15 bg-[#111A2E] text-center shadow-[0_0_0_6px_rgba(96,165,250,0.06),0_20px_40px_rgba(0,0,0,0.35)] transition-colors hover:border-blue-300/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" style={{
          left: HUB.x - HUB.r,
          top: HUB.y - HUB.r,
          width: HUB.r * 2,
          height: HUB.r * 2
        }}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 text-blue-200">
              <Building2Icon size={22} aria-hidden />
            </span>
          </button>
          <div className="pointer-events-none absolute text-center" style={{
          left: HUB.x - 120,
          width: 240,
          top: HUB.y + HUB.r + 12
        }}>
            <p className="text-[16px] font-semibold text-white">{organization.name}</p>
            <p className="text-[12.5px] text-slate-400">{orgTeams.length} teams · {orderedWorkflows.length} workflows</p>
          </div>

          {/* Teams */}
          {orgTeams.map((tm, i) => {
          const Icon = teamIcons[tm.id];
          const s = teamState(tm.id);
          const link = focusWf ? related?.get(tm.id) : undefined;
          const {
            owns,
            joins
          } = workflowsOf(tm.id);
          const sel = isSelected("team", tm.id);
          return <button key={tm.id} type="button" aria-pressed={sel} aria-label={`${tm.name}. Owns ${owns.length} workflows, participates in ${joins.length}.${link ? ` ${link.role === "owner" ? "Primary owner" : "Participant"} of the selected workflow.` : ""}`} onClick={() => select({
            kind: "team",
            id: tm.id
          })} onMouseEnter={() => setHover({
            kind: "team",
            id: tm.id
          })} onMouseLeave={() => setHover(null)} onFocus={() => setHover({
            kind: "team",
            id: tm.id
          })} onBlur={() => setHover(null)} className={`absolute flex items-center gap-2.5 rounded-xl border px-2 text-left transition-[opacity,background-color,border-color,box-shadow] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${sel ? "border-blue-400/70 bg-[#14213D] shadow-[0_0_0_4px_rgba(96,165,250,0.15)]" : s === "focus" || s === "related" ? "border-white/20 bg-[#141D31]" : "border-white/[0.08] bg-[#0F1729] hover:border-white/20"} ${s === "dim" ? "opacity-30" : "opacity-100"}`} style={{
            left: TEAM.x,
            top: teamY(i) - TEAM.h / 2,
            width: TEAM.w,
            height: TEAM.h
          }}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${sel || s === "focus" ? "bg-blue-500/25 text-blue-200" : "bg-white/[0.06] text-slate-300"}`}>
                  <Icon size={16} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-slate-100">{tm.name}</span>
                  <span className="block text-[12px] text-slate-500">Owns {owns.length} · joins {joins.length}</span>
                </span>
                {link && <RoleTag owner={link.role === "owner"} />}
                <span className={`absolute -right-[4px] h-2 w-2 rounded-full border border-[#0C1220] ${s === "dim" ? "bg-slate-600" : "bg-slate-300"}`} aria-hidden />
              </button>;
        })}

          {/* Workflows */}
          {orderedWorkflows.map((wf, i) => {
          const s = wfState(wf.id);
          const link = focusTeam ? related?.get(wf.id) : undefined;
          const sel = isSelected("workflow", wf.id);
          const n = teamCount(wf);
          const issues = issuesForWorkflow(wf.id).length;
          return <Tooltip key={wf.id} label={`${n} teams${issues ? ` · ${issues} need${issues === 1 ? "s" : ""} attention` : ""}${wf.processId ? " · comparison available" : ""}`} hasArrow placement="top" openDelay={500}>
                <button type="button" aria-pressed={sel} aria-label={`${wf.name}. ${n} teams involved.${issues ? ` ${issues} items need attention.` : ""}${wf.processId ? " Process comparison available." : ""}${link ? ` Selected team is ${link.role === "owner" ? "primary owner" : "a participant"}.` : ""}`} onClick={() => select({
              kind: "workflow",
              id: wf.id
            })} onMouseEnter={() => setHover({
              kind: "workflow",
              id: wf.id
            })} onMouseLeave={() => setHover(null)} onFocus={() => setHover({
              kind: "workflow",
              id: wf.id
            })} onBlur={() => setHover(null)} className={`absolute flex items-center gap-2 rounded-xl border pl-3 pr-2 text-left transition-[opacity,background-color,border-color,box-shadow] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${sel ? "border-blue-400/70 bg-[#14213D] shadow-[0_0_0_4px_rgba(96,165,250,0.15)]" : s === "focus" || s === "related" ? "border-white/20 bg-[#141D31]" : "border-white/[0.08] bg-[#0F1729] hover:border-white/20"} ${s === "dim" ? "opacity-30" : s === "related-muted" ? "opacity-60" : "opacity-100"}`} style={{
              left: WF.x,
              top: wfY(i) - WF.h / 2,
              width: WF.w,
              height: WF.h
            }}>
                  <span className={`absolute -left-[4px] h-2 w-2 rounded-full border border-[#0C1220] ${s === "dim" ? "bg-slate-600" : "bg-slate-300"}`} aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-slate-100">{wf.name}</span>
                  {link ? <RoleTag owner={link.role === "owner"} /> : <span className="flex shrink-0 items-center gap-1.5 text-[12px] text-slate-500">
                      {issues > 0 && <AlertTriangleIcon size={14} className="text-amber-300" aria-hidden />}
                      {wf.processId && <ColumnsIcon size={14} className="text-violet-300" aria-hidden />}
                      <span className="num">{n}</span>
                    </span>}
                </button>
              </Tooltip>;
        })}
        </div>
      </div>

      <MapZoomControls pct={pct} zoomAt={zoomAt} fit={fit} placement="left" />
    </div>;
}
export function RoleTag({
  owner


}: {owner: boolean;}) {
  return <span className={`shrink-0 rounded-md border px-1.5 py-px text-[11.5px] font-medium ${owner ? "border-blue-400/40 bg-blue-500/15 text-blue-200" : "border-white/15 bg-white/[0.05] text-slate-300"}`}>
      {owner ? "Owner" : "Participant"}
    </span>;
}
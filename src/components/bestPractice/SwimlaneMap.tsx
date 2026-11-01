import React from "react";
import { RotateCwIcon } from "lucide-react";
import type { ProcessModel } from "../../types/bestPractice";
import { edgePath, formatWait, LANE_LABEL_W, NODE_H, NODE_W, type ProcessLayout } from "../../utils/bestPractice";
import { edgeMeta, kindMeta, statusMeta } from "./taskMeta";
export type TaskMark = "removed" | "added" | "changed";
interface SwimlaneMapProps {
  model: ProcessModel;
  layout: ProcessLayout;
  selectedId: string | null;
  onSelect: (id: string) => void;
  marks?: Record<string, TaskMark>;
}
const markRing: Record<TaskMark, string> = {
  removed: "ring-2 ring-rose-400/70 ring-offset-2 ring-offset-transparent",
  added: "ring-2 ring-teal-400/70 ring-offset-2 ring-offset-transparent",
  changed: "ring-2 ring-sky-400/60 ring-offset-2 ring-offset-transparent"
};

/** One process model drawn as swimlanes: lanes, routed transitions and task cards. */
export function SwimlaneMap({
  model,
  layout,
  selectedId,
  onSelect,
  marks = {}
}: SwimlaneMapProps) {
  const byId = new Map(model.tasks.map((t) => [t.id, t]));
  return <div className="relative" style={{
    width: layout.width,
    height: layout.height
  }}>
      {layout.lanes.map(({
      lane,
      y,
      h
    }) => <div key={lane.id} className="absolute left-2 right-0 rounded-l-xl border border-r-0 border-white/[0.06] bg-white/[0.015]" style={{
      top: y,
      height: h
    }}>
          <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{
        width: LANE_LABEL_W - 30
      }}>
            <p className="text-[12px] font-semibold text-slate-100">{lane.label}</p>
            <p className="num text-[10.5px] text-slate-500">{(model.laneEvents[lane.id] ?? 0).toLocaleString()} events</p>
          </div>
        </div>)}

      <svg className="pointer-events-none absolute inset-0" width={layout.width} height={layout.height} aria-hidden>
        <defs>
          {Object.entries(edgeMeta).map(([k, m]) => <marker key={k} id={`bp-arrow-${model.id}-${k}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill={m.stroke} />
            </marker>)}
        </defs>
        {model.transitions.map((tr) => {
        const a = byId.get(tr.from);
        const b = byId.get(tr.to);
        if (!a || !b) return null;
        const m = edgeMeta[tr.kind];
        const p = edgePath(layout.pos(a), layout.pos(b));
        const on = selectedId === tr.from || selectedId === tr.to;
        return <g key={tr.id} opacity={selectedId && !on ? 0.35 : 1}>
              <path d={p.d} fill="none" stroke={m.stroke} strokeWidth={on ? m.width + 0.8 : m.width} strokeDasharray={m.dash} markerEnd={`url(#bp-arrow-${model.id}-${tr.kind})`} strokeLinejoin="round" />
              {tr.label && <g transform={`translate(${p.lx},${p.ly})`}>
                  <rect x={-(tr.label.length * 2.9 + 6)} y={-8} width={tr.label.length * 5.8 + 12} height={16} rx={4} fill="#0B1220" stroke="rgba(148,163,184,0.25)" />
                  <text textAnchor="middle" y={3.5} fontSize={9.5} fill="#CBD5E1" className="num">{tr.label}</text>
                </g>}
            </g>;
      })}
      </svg>

      {model.tasks.map((t) => {
      const {
        x,
        y
      } = layout.pos(t);
      const k = kindMeta[t.kind];
      const s = statusMeta[t.status];
      const wait = model.id === "target" ? t.targetH !== undefined ? `target ${formatWait(t.targetH)}` : null : t.waitH !== undefined ? `wait ${formatWait(t.waitH)}` : null;
      const sel = selectedId === t.id;
      const mark = marks[t.id];
      return <button key={t.id} type="button" onClick={() => onSelect(t.id)} aria-pressed={sel} aria-label={`${t.label}, ${k.label}, ${t.events.toLocaleString()} events, ${s.label}`} className={`absolute flex flex-col justify-between rounded-lg border bg-[#0D1424] px-2 py-1.5 text-left transition-[box-shadow,border-color] hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${t.kind === "hidden" ? "border-dashed border-slate-500/50" : "border-white/[0.12]"} ${sel ? "!border-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.25)]" : ""} ${mark ? markRing[mark] : ""}`} style={{
        left: x,
        top: y,
        width: NODE_W,
        height: NODE_H
      }}>
            <span className="flex min-w-0 items-start gap-1.5">
              <span className={`mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded ${k.icon}`}><k.Icon size={11} aria-hidden /></span>
              <span className="min-w-0">
                <span className="block truncate text-[10.5px] font-semibold leading-tight text-slate-100" title={t.label}>{t.label}</span>
                <span className="num block truncate text-[9.5px] text-slate-400">{t.events.toLocaleString()} events{wait ? ` · ${wait}` : ""}</span>
              </span>
            </span>
            <span className="flex items-center justify-between gap-1">
              <span className={`truncate rounded border px-1 text-[9px] font-medium leading-[14px] ${k.chip}`}>{k.label}</span>
              <span className={`flex items-center gap-1 text-[9.5px] ${s.tone}`}>
                <s.Icon size={10} aria-hidden />
                {t.rework !== undefined && <><RotateCwIcon size={9} aria-hidden /><span className="num">{t.rework}%</span></>}
              </span>
            </span>
          </button>;
    })}
    </div>;
}
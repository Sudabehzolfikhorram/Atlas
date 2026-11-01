import React, { useId } from "react";
import type { ChangeType, MapMode, MapVariant, ProcessDefinition, ProcessStep, StepVersion } from "../../types/processMap";
import { stepChange, stepWait, volume } from "../../utils/processMap";
export const MAP_W = 800;
export const MAP_H = 360;
const T = {
  title: "#8b95aa",
  label: "#c7cddd",
  labelActive: "#e8ebf3",
  sub: "#8d97ac",
  link: "#596376",
  linkSoft: "#778397",
  outcome: "#c5ab88",
  attention: "#e18585"
};
export const changeColor: Record<ChangeType, string> = {
  added: "#A78BFA",
  removed: "#E18585",
  modified: "#FBBF24",
  reordered: "#38BDF8"
};
const changeWord: Record<ChangeType, string> = {
  added: "ADDED",
  removed: "REMOVED",
  modified: "MODIFIED",
  reordered: "REORDERED"
};
export interface Bucket {
  key: "verified" | "inferred" | "flagged" | "proposed";
  label: string;
  color: string;
}
export const bucketDefs: Record<MapVariant, Bucket[]> = {
  current: [{
    key: "verified",
    label: "Verified",
    color: "#5FC3B5"
  }, {
    key: "inferred",
    label: "Inferred",
    color: "#7AA7E8"
  }, {
    key: "flagged",
    label: "Flagged",
    color: "#E7B27C"
  }],
  recommended: [{
    key: "verified",
    label: "Verified",
    color: "#5FC3B5"
  }, {
    key: "inferred",
    label: "Inferred",
    color: "#7AA7E8"
  }, {
    key: "proposed",
    label: "New (proposed)",
    color: "#B29ADE"
  }]
};
interface Item {
  step: ProcessStep;
  v: StepVersion;
  label: string;
  change?: ChangeType;
  issue: boolean;
  removed: boolean;
}
interface Stage {
  id: string;
  label: string;
  items: Item[];
}
function buildStages(process: ProcessDefinition, variant: MapVariant): Stage[] {
  return process.stages.map((st) => {
    const items: Item[] = [];
    st.stepIds.forEach((id) => {
      const step = process.steps.find((s) => s.id === id);
      if (!step) return;
      if (variant === "current") {
        if (step.current) items.push({
          step,
          v: step.current,
          label: step.current.label,
          issue: !!step.current.issue,
          removed: false
        });
        return;
      }
      const ch = stepChange(process, id);
      if (step.recommended) items.push({
        step,
        v: step.recommended,
        label: step.recommended.label,
        change: ch?.type,
        issue: false,
        removed: false
      });else if (step.current && ch?.type === "removed") items.push({
        step,
        v: step.current,
        label: step.current.label,
        change: "removed",
        issue: false,
        removed: true
      });
    });
    return {
      id: st.id,
      label: st.label,
      items
    };
  }).filter((s) => s.items.length > 0);
}
const round1 = (n: number) => Math.round(n * 10) / 10;
interface Props {
  process: ProcessDefinition;
  variant: MapVariant;
  mode: MapMode;
  month: number;
  selectedId: string | null;
  onSelect: (stepId: string) => void;
  label: string;
}
export function ProcessMapCanvas({
  process,
  variant,
  mode,
  month,
  selectedId,
  onSelect,
  label
}: Props) {
  const uid = useId().replace(/:/g, "");
  const stages = buildStages(process, variant);
  const allItems = stages.flatMap((s) => s.items);
  const activeStage = stages.find((s) => s.items.some((i) => i.step.id === selectedId))?.id ?? null;
  const activeItem = allItems.find((i) => i.step.id === selectedId && !i.removed);
  const activeSystem = activeItem?.v.system ?? null;
  const m = stages.length;
  const pickFromStage = (st: Stage) => (st.items.find((i) => i.issue || i.change && !i.removed) ?? st.items[0]).step.id;
  const interactive = (ariaLabel: string, pressed: boolean, fn: () => void) => ({
    role: "button",
    tabIndex: 0,
    "aria-label": ariaLabel,
    "aria-pressed": pressed,
    className: "km-node",
    onClick: fn,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fn();
      }
    }
  });
  const stageSummary = (st: Stage) => {
    const live = st.items.filter((i) => !i.removed);
    if (variant === "current") {
      const wait = round1(live.reduce((a, i) => a + (stepWait(process, i.v, month) ?? 0), 0));
      return {
        steps: `${live.length} step${live.length === 1 ? "" : "s"}`,
        detail: `${wait} d avg. wait`
      };
    }
    const changes = st.items.filter((i) => i.change).length;
    const removed = st.items.filter((i) => i.removed).length;
    return {
      steps: `${live.length} step${live.length === 1 ? "" : "s"}`,
      detail: changes ? `${changes} change${changes === 1 ? "" : "s"}${removed ? ` · ${removed} removed` : ""}` : "No changes"
    };
  };
  const titleProps = {
    fontSize: 9.5,
    fill: T.title,
    letterSpacing: 1.4
  } as const;

  /* ---------------- Relationships ---------------- */
  const renderRelationships = () => {
    const systems: {
      name: string;
      stepIds: string[];
    }[] = [];
    allItems.forEach((i) => {
      if (i.removed) return;
      const ex = systems.find((s) => s.name === i.v.system);
      if (ex) ex.stepIds.push(i.step.id);else systems.push({
        name: i.v.system,
        stepIds: [i.step.id]
      });
    });
    const n = systems.length;
    const srcY = (i: number) => n === 1 ? 185 : 54 + i * (278 / (n - 1));
    const CX = 250;
    const CY = 185;
    const stY = (i: number) => m === 1 ? 185 : 72 + i * (228 / (m - 1));
    return <>
        <text x={20} y={22} {...titleProps}>SOURCE SYSTEMS</text>
        <text x={CX} y={22} textAnchor="middle" {...titleProps}>PROCESS</text>
        <text x={352} y={22} {...titleProps}>WORKFLOW STAGES</text>
        <text x={556} y={22} {...titleProps}>{"STEPS & OUTCOMES"}</text>

        {systems.map((s, i) => {
        const y = srcY(i);
        const active = activeSystem === s.name;
        return <g key={s.name}>
              <path d={`M146 ${y} C196 ${y} 186 ${CY} ${CX - 36} ${CY}`} fill="none" stroke={active ? "#77b8b7" : T.linkSoft} strokeWidth={active ? 1.4 : 1} opacity={active ? 0.9 : 0.35} />
              <g {...interactive(`${s.name} source system`, active, () => onSelect(s.stepIds[0]))}>
                <rect x={6} y={y - 9} width={148} height={18} fill="transparent" />
                <circle className="km-dot" cx={146} cy={y} r={3.2} fill={active ? "#7ac6bf" : "#518584"} />
                <text x={136} y={y + 4} textAnchor="end" fontSize={12.5} fill={active ? "#ffffff" : T.label} fontWeight={active ? 500 : 400}>
                  {s.name.length > 21 ? `${s.name.slice(0, 20)}…` : s.name}
                </text>
              </g>
            </g>;
      })}

        {stages.map((st, i) => {
        const y = stY(i);
        const active = activeStage === st.id;
        const k = st.items.length;
        const sum = stageSummary(st);
        return <g key={st.id}>
              <path d={`M${CX + 36} ${CY} C${CX + 80} ${CY} ${CX + 56} ${y} 352 ${y}`} fill="none" stroke={active ? "#bda6df" : T.link} strokeWidth={active ? 1.6 : 1} opacity={active ? 0.95 : 0.75} />
              {st.items.map((it, j) => {
            const oy = y - (k - 1) * 9.5 + j * 19;
            const sel = selectedId === it.step.id;
            const color = it.issue ? T.attention : it.change ? changeColor[it.change] : T.outcome;
            const tag = it.change ? changeWord[it.change] : it.issue ? "ISSUE" : null;
            return <g key={it.step.id}>
                    <path d={`M476 ${y} C516 ${y} 516 ${oy} 552 ${oy}`} fill="none" stroke={it.change === "added" || it.removed ? color : active ? "#a59aaa" : T.link} strokeDasharray={it.change === "added" || it.removed ? "3 3" : undefined} opacity={active ? 0.85 : 0.5} />
                    <g {...interactive(`${it.label}${tag ? `, ${tag.toLowerCase()}` : ""}`, sel, () => onSelect(it.step.id))}>
                      <rect x={544} y={oy - 9.5} width={250} height={19} fill="transparent" />
                      <circle className="km-dot" cx={552} cy={oy} r={sel ? 3.8 : 2.8} fill={color} />
                      <text x={562} y={oy + 4} fontSize={12.5} fill={sel ? "#ffffff" : active ? T.labelActive : T.label} fontWeight={sel ? 600 : 400} opacity={it.removed ? 0.65 : 1} textDecoration={it.removed ? "line-through" : undefined}>
                        {it.label}
                      </text>
                      {tag && <text x={562 + it.label.length * 6.9 + 8} y={oy + 3.5} fontSize={9} fontWeight={600} letterSpacing={0.6} fill={color}>
                          {tag}
                        </text>}
                    </g>
                  </g>;
          })}
              <g {...interactive(`${st.label} stage, ${sum.steps}, ${sum.detail}`, active, () => onSelect(pickFromStage(st)))}>
                <rect className="km-box" x={352} y={y - 22} width={124} height={44} rx={8} fill={active ? "#343043" : "#262a37"} fillOpacity={0.92} stroke={active ? "#a894db" : "#444454"} strokeWidth={active ? 1.1 : 0.8} />
                <circle cx={366} cy={y} r={3} fill={active ? "#c0a3e8" : "#8c7b9e"} />
                <text x={377} y={y - 2} fontSize={12.5} fill={active ? "#f3eaff" : T.label}>{st.label}</text>
                <text x={377} y={y + 12} fontSize={10.5} fill={T.sub}>{sum.steps}</text>
                <text x={466} y={y + 5} textAnchor="end" fontSize={15} fill="#9b88ba">›</text>
              </g>
            </g>;
      })}

        <circle cx={CX} cy={CY} r={82} fill={`url(#${uid}-halo)`} />
        <circle cx={CX} cy={CY} r={49} stroke="#665678" strokeWidth={0.7} fill="none" opacity={0.5} />
        <circle cx={CX} cy={CY} r={43} stroke="#b8a0d3" strokeWidth={3} strokeDasharray="1 4" fill="none" opacity={0.3} />
        <circle cx={CX} cy={CY} r={36} fill={`url(#${uid}-orb)`} />
        <circle cx={CX} cy={CY} r={36} fill="none" stroke="#d0b9e8" strokeOpacity={0.3} />
        <path d={`M${CX} ${CY - 14} l13 7 -13 7 -13 -7Z M${CX - 13} ${CY - 7} v14 l13 7 13 -7 v-14 M${CX} ${CY} v14`} fill="none" stroke="#efe5ff" strokeWidth={1.5} opacity={0.8} strokeLinejoin="round" />
        <text x={CX} y={CY + 66} textAnchor="middle" fontSize={14} fill="#ded4ef" fontWeight={500}>{process.name}</text>
        <text x={CX} y={CY + 82} textAnchor="middle" fontSize={10.5} fill={T.sub}>{variant === "current" ? "Observed workflow" : "Proposed workflow"}</text>
      </>;
  };

  /* ---------------- Data flow (Sankey) ---------------- */
  const renderFlow = () => {
    const defs = bucketDefs[variant];
    const live = (st: Stage) => st.items.filter((i) => !i.removed);
    const volOf = (i: Item) => volume(process, i.v.share, month) ?? 0;
    const stageVol = (st: Stage) => Math.max(0, ...live(st).map(volOf));
    const bucketOf = (i: Item): Bucket["key"] => {
      if (variant === "current" && i.issue) return "flagged";
      if (variant === "recommended" && i.change === "added") return "proposed";
      return i.v.evidence[0]?.status === "verified" ? "verified" : "inferred";
    };
    const links = stages.map((st) => defs.map((b) => live(st).filter((i) => bucketOf(i) === b.key).reduce((a, i) => a + volOf(i), 0)));
    const totals = defs.map((_, b) => links.reduce((a, row) => a + row[b], 0));
    const unit = Math.max(1, ...totals) / 96;
    const maxStage = Math.max(1, ...stages.map(stageVol));
    const bucketY = [82, 192, 302];
    const heights = totals.map((t) => Math.max(14, t / unit));
    const fy = (i: number) => m === 1 ? 185 : 66 + i * (232 / (m - 1));
    const off = heights.map((h, b) => bucketY[b] - h / 2);
    const paths: {
      key: string;
      d: string;
      w: number;
      color: string;
      stage: string;
    }[] = [];
    stages.forEach((st, i) => defs.forEach((b, bi) => {
      const v = links[i][bi];
      if (!v) return;
      const t = Math.max(1.5, v / unit);
      const y1 = fy(i) + (bi - 1) * 9;
      const y2 = off[bi] + t / 2;
      off[bi] += t;
      paths.push({
        key: `${st.id}-${b.key}`,
        d: `M506 ${y1} C578 ${y1} 578 ${y2} 650 ${y2}`,
        w: t,
        color: b.color,
        stage: st.id
      });
    }));
    return <>
        <text x={24} y={24} {...titleProps}>WORKFLOW STAGES</text>
        <text x={346} y={24} {...titleProps}>STEP PROCESSING</text>
        <text x={650} y={24} {...titleProps}>EVIDENCE STATUS</text>

        {stages.map((st, i) => {
        const y = fy(i);
        const active = activeStage === st.id;
        return <path key={`band-${st.id}`} d={`M186 ${y} L346 ${y}`} fill="none" stroke={active ? "#9d85c5" : "#61728c"} strokeWidth={6 + 22 * (stageVol(st) / maxStage)} opacity={active ? 0.42 : 0.26} />;
      })}

        {paths.map((p) => <path key={p.key} d={p.d} fill="none" stroke={p.color} strokeWidth={p.w} opacity={activeStage ? activeStage === p.stage ? 0.62 : 0.2 : 0.35} style={{
        transition: "opacity .2s"
      }} />)}

        {stages.map((st, i) => {
        const y = fy(i);
        const active = activeStage === st.id;
        const sum = stageSummary(st);
        const pick = () => onSelect(pickFromStage(st));
        return <g key={st.id}>
              <g {...interactive(`${st.label} stage, ${stageVol(st).toLocaleString()} cases per month`, active, pick)}>
                <rect className="km-box" x={24} y={y - 20} width={162} height={40} rx={6} fill="#292f3b" stroke={active ? "#a894db" : "#465160"} strokeWidth={active ? 1.1 : 0.7} />
                <rect x={24} y={y - 11} width={3} height={22} rx={1} fill="#7bc0b8" />
                <text x={38} y={y - 2} fontSize={12.5} fill={active ? "#ffffff" : T.label}>{st.label}</text>
                <text x={38} y={y + 12} fontSize={10.5} fill={T.sub}>{stageVol(st).toLocaleString()} cases / mo</text>
              </g>
              <g {...interactive(`${st.label} processing, ${sum.steps}, ${sum.detail}`, active, pick)}>
                <rect className="km-box" x={346} y={y - 20} width={160} height={40} rx={6} fill="#2f2c3d" stroke={active ? "#a894db" : "#5a4d70"} strokeWidth={active ? 1.1 : 0.7} />
                <text x={360} y={y - 2} fontSize={12.5} fill={active ? "#ffffff" : T.label}>{sum.steps}</text>
                <text x={360} y={y + 12} fontSize={10.5} fill={T.sub}>{sum.detail}</text>
              </g>
            </g>;
      })}

        {defs.map((b, bi) => <g key={b.key}>
            <rect x={650} y={bucketY[bi] - heights[bi] / 2} width={4} height={heights[bi]} rx={2} fill={b.color} />
            <text x={666} y={bucketY[bi] - 3} fontSize={12.5} fill={T.label}>{b.label}</text>
            <text x={666} y={bucketY[bi] + 16} fontSize={17} fill={b.color}>{totals[bi].toLocaleString()}</text>
          </g>)}
      </>;
  };
  return <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="block h-auto w-full" role="group" aria-label={label}>
      <defs>
        <radialGradient id={`${uid}-orb`} cx="32%" cy="27%" r="75%">
          <stop offset="0" stopColor="#e9dcff" />
          <stop offset="0.36" stopColor="#b698ea" />
          <stop offset="0.72" stopColor="#7e66a8" />
          <stop offset="1" stopColor="#4e435f" />
        </radialGradient>
        <radialGradient id={`${uid}-halo`}>
          <stop offset="0" stopColor="#ac92d7" stopOpacity="0.21" />
          <stop offset="1" stopColor="#a98bcb" stopOpacity="0" />
        </radialGradient>
      </defs>
      {mode === "relationships" ? renderRelationships() : renderFlow()}
    </svg>;
}
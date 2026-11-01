import { MarkerType, type Edge } from "@xyflow/react";
import type { Health, RelationType, Team, TeamRelation } from "../types/teamGraph";

export const healthMeta: Record<Health, {label: string;text: string;chip: string;dot: string;bar: string;stroke: {dark: string;light: string;};}> = {
  verified: { label: "Verified", text: "text-emerald-300", chip: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400", bar: "bg-emerald-400", stroke: { dark: "#34D399", light: "#059669" } },
  partial: { label: "Attention", text: "text-amber-300", chip: "border-amber-400/30 bg-amber-400/10 text-amber-300", dot: "bg-amber-400", bar: "bg-amber-400", stroke: { dark: "#FBBF24", light: "#D97706" } },
  gap: { label: "Critical gap", text: "text-rose-300", chip: "border-rose-400/30 bg-rose-400/10 text-rose-300", dot: "bg-rose-400", bar: "bg-rose-400", stroke: { dark: "#FB7185", light: "#E11D48" } },
  unknown: { label: "Unverified", text: "text-slate-300", chip: "border-slate-400/30 bg-slate-400/10 text-slate-300", dot: "bg-slate-400", bar: "bg-slate-400", stroke: { dark: "#94A3B8", light: "#64748B" } }
};

export const relationMeta: Record<RelationType, {label: string;dash?: string;}> = {
  ownership: { label: "Data ownership" },
  provisioning: { label: "Data provisioning", dash: "12 3" },
  approval: { label: "Approval", dash: "6 4" },
  oversight: { label: "Oversight", dash: "2 4" },
  evidence: { label: "Evidence sharing", dash: "1 4" },
  compliance: { label: "Compliance", dash: "10 4 2 4" },
  handoff: { label: "Operational handoff", dash: "5 5" }
};

export const severityChip: Record<"High" | "Medium" | "Low", string> = {
  High: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  Medium: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  Low: "border-slate-400/30 bg-slate-400/10 text-slate-300"
};

export const getTeam = (teams: Team[], id: string) => teams.find((t) => t.id === id);

export function coverage(team: Team) {
  const available = team.evidence.reduce((s, e) => s + e.available, 0);
  const required = team.evidence.reduce((s, e) => s + e.required, 0);
  const dates = team.evidence.map((e) => e.lastVerified).filter((d): d is string => Boolean(d)).sort();
  const pct = required ? Math.round(available / required * 100) : 0;
  return { available, required, pct, lastVerified: dates[dates.length - 1], gaps: team.evidence.filter((e) => e.status !== "verified").length };
}

export const coverageHealth = (pct: number): Health => pct >= 85 ? "verified" : pct >= 60 ? "partial" : "gap";

export function relationsOf(id: string, rels: TeamRelation[]) {
  return { incoming: rels.filter((r) => r.target === id), outgoing: rels.filter((r) => r.source === id) };
}

export function neighborsOf(id: string, rels: TeamRelation[]) {
  const s = new Set<string>();
  rels.forEach((r) => {
    if (r.source === id) s.add(r.target);
    if (r.target === id) s.add(r.source);
  });
  return s;
}

/** Follows incoming oversight relations upwards: who this team answers to. */
export function escalationPath(id: string, rels: TeamRelation[]) {
  const path: string[] = [];
  const seen = new Set([id]);
  let cur = id;
  for (;;) {
    const r = rels.find((x) => x.target === cur && x.type === "oversight" && !seen.has(x.source));
    if (!r) break;
    seen.add(r.source);
    path.push(r.source);
    cur = r.source;
  }
  return path;
}

type Pos = {x: number;y: number;};

export function pickHandles(a: Pos, b: Pos) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy) * 0.8) return dx >= 0 ? { sourceHandle: "s-r", targetHandle: "t-l" } : { sourceHandle: "s-l", targetHandle: "t-r" };
  return dy >= 0 ? { sourceHandle: "s-b", targetHandle: "t-t" } : { sourceHandle: "s-t", targetHandle: "t-b" };
}

interface EdgeOpts {
  light: boolean;
  focusId?: string | null;
  selectedId?: string | null;
  dimOpacity?: number;
  handles: (r: TeamRelation) => {sourceHandle: string;targetHandle: string;};
}

export function relationEdges(rels: TeamRelation[], o: EdgeOpts): Edge[] {
  const text = o.light ? "#334155" : "#CBD5E1";
  const bg = o.light ? "rgba(255,255,255,0.92)" : "rgba(10,16,30,0.9)";
  return rels.map((r) => {
    const stroke = healthMeta[r.evidence].stroke[o.light ? "light" : "dark"];
    const touches = !o.focusId || r.source === o.focusId || r.target === o.focusId;
    const sel = r.id === o.selectedId;
    return {
      id: r.id,
      source: r.source,
      target: r.target,
      ...o.handles(r),
      label: relationMeta[r.type].label,
      labelStyle: { fill: text, fontSize: 9.5, fontWeight: sel ? 600 : 400 },
      labelBgStyle: { fill: bg },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 4,
      interactionWidth: 18,
      zIndex: sel || o.focusId && touches ? 2 : 0,
      style: { stroke, strokeWidth: sel ? 3 : touches && o.focusId ? 2 : 1.4, strokeDasharray: relationMeta[r.type].dash, opacity: touches || sel ? 1 : o.dimOpacity ?? 0.14 },
      markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 14, height: 14 },
      ariaLabel: `${relationMeta[r.type].label}: ${r.process}`
    };
  });
}
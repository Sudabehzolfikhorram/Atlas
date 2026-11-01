import { Box } from "@chakra-ui/react";
import type { Finding } from "../../types/diligence";
interface NodeSpec {
  label: string;
  kind: "team" | "system" | "data" | "process" | "finding";
  id?: string;
}
const kindColor: Record<NodeSpec["kind"], string> = {
  team: "#60A5FA",
  system: "#A78BFA",
  data: "#2DD4BF",
  process: "#FBBF24",
  finding: "#FB7185"
};

/** Compact radial graph: the finding in the centre, affected entities and related findings around it. */
export function RelationshipMini({
  finding,
  onOpen



}: {finding: Finding;onOpen: (id: string) => void;}) {
  const nodes: NodeSpec[] = [{
    label: finding.team,
    kind: "team"
  }, ...finding.systems.slice(0, 3).map((s) => ({
    label: s,
    kind: "system" as const
  })), ...finding.dataAssets.slice(0, 2).map((s) => ({
    label: s,
    kind: "data" as const
  })), ...finding.processes.slice(0, 2).map((s) => ({
    label: s,
    kind: "process" as const
  })), ...finding.relatedIds.slice(0, 3).map((id) => ({
    label: id,
    kind: "finding" as const,
    id
  }))];
  const W = 640,
    H = 250,
    cx = W / 2,
    cy = H / 2,
    rx = 240,
    ry = 92;
  const pos = nodes.map((_, i) => {
    const a = -Math.PI / 2 + i / nodes.length * Math.PI * 2;
    return {
      x: cx + Math.cos(a) * rx,
      y: cy + Math.sin(a) * ry
    };
  });
  return <Box className="rounded-xl border border-white/[0.07] bg-white/[0.015]">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Relationships of ${finding.id}`}>
        {pos.map((p, i) => <line key={`l${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={kindColor[nodes[i].kind]} strokeOpacity={0.35} strokeWidth={1.2} strokeDasharray={nodes[i].kind === "finding" ? "4 4" : undefined} />)}
        <g>
          <rect x={cx - 62} y={cy - 18} width={124} height={36} rx={10} fill="rgba(251,113,133,0.12)" stroke="#FB7185" strokeOpacity={0.7} />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor" className="fill-slate-100">{finding.id}</text>
        </g>
        {nodes.map((n, i) => {
        const p = pos[i];
        const w = Math.min(150, 18 + n.label.length * 6.2);
        const clickable = n.kind === "finding" && n.id;
        return <g key={`n${i}`} transform={`translate(${p.x - w / 2},${p.y - 13})`} onClick={clickable ? () => onOpen(n.id!) : undefined} onKeyDown={clickable ? (e) => (e.key === "Enter" || e.key === " ") && onOpen(n.id!) : undefined} tabIndex={clickable ? 0 : undefined} role={clickable ? "button" : undefined} aria-label={clickable ? `Open related finding ${n.label}` : undefined} className={clickable ? "cursor-pointer outline-none [&:focus-visible>rect]:stroke-[2.5]" : undefined}>
              <rect width={w} height={26} rx={7} fill="rgba(15,23,42,0.6)" className="dil-mini-node" stroke={kindColor[n.kind]} strokeOpacity={0.6} />
              <circle cx={10} cy={13} r={3} fill={kindColor[n.kind]} />
              <text x={18} y={17} fontSize={11} className="fill-slate-200">{n.label.length > 22 ? `${n.label.slice(0, 21)}…` : n.label}</text>
            </g>;
      })}
      </svg>
      <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-white/[0.06] px-3 py-2 text-[11px] text-slate-400">
        {(["team", "system", "data", "process", "finding"] as const).map((k) => <span key={k} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{
          background: kindColor[k]
        }} aria-hidden />
            {k === "data" ? "Data asset" : k === "finding" ? "Related finding (click)" : k[0].toUpperCase() + k.slice(1)}
          </span>)}
      </div>
    </Box>;
}
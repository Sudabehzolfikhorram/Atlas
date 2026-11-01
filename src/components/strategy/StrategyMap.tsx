import React, { useMemo } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { MousePointerClickIcon } from "lucide-react";
import { teamRelations, teams } from "../../data/teamGraph";
import { insights } from "../../data/strategy";
import { useTheme } from "../../contexts/ThemeContext";
import { healthMeta } from "../../utils/teamGraph";
import { severityHex } from "../../utils/strategy";
import { teamIcons } from "../teamGraph/teamGraphIcons";
import type { StrategicObjective, StrategyInsight } from "../../types/strategy";
interface Props {
  insight: StrategyInsight | null;
  objective: StrategicObjective | null;
  teamId: string | null;
  onTeam: (id: string | null) => void;
}
const W = 190;
const H = 60;
const center = (id: string) => {
  const t = teams.find((x) => x.id === id)!;
  return {
    x: t.position.x + W / 2,
    y: t.position.y + H / 2
  };
};
function curve(from: string, to: string, bend = 26) {
  const a = center(from);
  const b = center(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = (a.x + b.x) / 2 - dy / len * bend;
  const cy = (a.y + b.y) / 2 + dx / len * bend;
  return {
    d: `M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`,
    mid: {
      x: 0.25 * a.x + 0.5 * cx + 0.25 * b.x,
      y: 0.25 * a.y + 0.5 * cy + 0.25 * b.y
    }
  };
}
const issueCount = Object.fromEntries(teams.map((t) => [t.id, insights.filter((i) => i.teams.includes(t.id))]));

/** The organization map, re-drawn to show which teams and dependencies a strategic insight touches. */
export function StrategyMap({
  insight,
  objective,
  teamId,
  onTeam
}: Props) {
  const light = useTheme().resolved === "light";
  const reduce = useReducedMotion();
  const focus = useMemo(() => {
    if (insight) return {
      teams: new Set(insight.teams),
      rels: new Set(insight.relations),
      color: severityHex[insight.severity],
      label: insight.title
    };
    if (objective) {
      const s = new Set(objective.teams);
      return {
        teams: s,
        rels: new Set(teamRelations.filter((r) => s.has(r.source) && s.has(r.target)).map((r) => r.id)),
        color: "#60A5FA",
        label: objective.short
      };
    }
    if (teamId) {
      const rels = teamRelations.filter((r) => r.source === teamId || r.target === teamId);
      return {
        teams: new Set([teamId, ...rels.flatMap((r) => [r.source, r.target])]),
        rels: new Set(rels.map((r) => r.id)),
        color: "#60A5FA",
        label: teams.find((t) => t.id === teamId)?.name ?? ""
      };
    }
    return null;
  }, [insight, objective, teamId]);
  const link = insight?.missingLink;
  const missing = link ? {
    ...curve(link.from, link.to, -60),
    label: link.label
  } : null;
  const nodeBg = light ? "#FFFFFF" : "#0F172A";
  const nodeBorder = light ? "#CBD5E1" : "rgba(148,163,184,0.28)";
  const title = light ? "#0F172A" : "#E2E8F0";
  const sub = light ? "#64748B" : "#94A3B8";
  return <Box className="glass-tile relative flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-white/[0.07]">
      <Flex className="items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <Text className="min-w-0 truncate text-[12px] text-slate-400">
          {focus ? <>Highlighting <span className="font-medium text-slate-100">{focus.label}</span></> : "Organization map · select an insight, objective or team"}
        </Text>
        <Text className="shrink-0 text-[11px] uppercase tracking-[0.06em] text-slate-500">Live org data · illustrative</Text>
      </Flex>
      <svg viewBox="110 -40 1150 720" className="w-full flex-1" role="img" aria-label="Organization map with strategy highlights" onClick={() => onTeam(null)}>
        <defs>
          <marker id="st-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={sub} />
          </marker>
        </defs>
        <g fill="none">
          {teamRelations.map((r) => {
          const g = curve(r.source, r.target);
          const on = focus?.rels.has(r.id);
          const stroke = on ? focus!.color : healthMeta[r.evidence].stroke[light ? "light" : "dark"];
          return <g key={r.id}>
                <path d={g.d} stroke={stroke} strokeWidth={on ? 3 : 1.3} strokeOpacity={focus ? on ? 1 : 0.1 : 0.45} />
                {on && !reduce && <motion.path d={g.d} stroke={light ? "#0F172A" : "#FFFFFF"} strokeOpacity={0.55} strokeWidth={1.4} strokeDasharray="4 14" initial={{
              strokeDashoffset: 0
            }} animate={{
              strokeDashoffset: -36
            }} transition={{
              duration: 1.2,
              ease: "linear",
              repeat: Infinity
            }} />}
                {on && <text x={g.mid.x} y={g.mid.y - 6} textAnchor="middle" fontSize="11" fill={title} stroke={nodeBg} strokeWidth={3} paintOrder="stroke">{r.process}</text>}
              </g>;
        })}
          {missing && <g>
              <path d={missing.d} stroke="#A78BFA" strokeWidth={2.2} strokeDasharray="7 6" markerEnd="url(#st-arrow)" />
              <text x={missing.mid.x} y={missing.mid.y - 8} textAnchor="middle" fontSize="11" fill="#C4B5FD" stroke={nodeBg} strokeWidth={3} paintOrder="stroke">{missing.label} (missing)</text>
            </g>}
        </g>
        {teams.map((t) => {
        const on = focus?.teams.has(t.id);
        const dim = focus && !on;
        const Icon = teamIcons[t.icon];
        const issues = issueCount[t.id];
        const high = issues.some((i) => i.severity === "High");
        const selected = teamId === t.id;
        return <g key={t.id} role="button" tabIndex={0} aria-pressed={selected} aria-label={`${t.name}: ${issues.length} strategy issues`} opacity={dim ? 0.32 : 1} className="cursor-pointer focus:outline-none" style={{
          transition: "opacity 200ms"
        }} onClick={(e) => {
          e.stopPropagation();
          onTeam(selected ? null : t.id);
        }} onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTeam(selected ? null : t.id);
          }
        }}>
              {on && <rect x={t.position.x - 5} y={t.position.y - 5} width={W + 10} height={H + 10} rx={16} fill={focus!.color} fillOpacity={0.12} stroke={focus!.color} strokeOpacity={0.7} strokeWidth={1.5} />}
              <rect x={t.position.x} y={t.position.y} width={W} height={H} rx={12} fill={nodeBg} stroke={selected ? "#60A5FA" : nodeBorder} strokeWidth={selected ? 2 : 1} />
              <rect x={t.position.x + 12} y={t.position.y + 15} width={30} height={30} rx={8} fill={healthMeta[t.status].stroke.dark} fillOpacity={0.14} />
              <Icon x={t.position.x + 19} y={t.position.y + 22} size={16} color={healthMeta[t.status].stroke[light ? "light" : "dark"]} aria-hidden />
              <text x={t.position.x + 52} y={t.position.y + 27} fontSize="13" fontWeight={600} fill={title}>{t.name}</text>
              <text x={t.position.x + 52} y={t.position.y + 44} fontSize="11" fill={sub}>{t.category}</text>
              {issues.length > 0 && <g>
                  <circle cx={t.position.x + W - 4} cy={t.position.y + 4} r={10} fill={high ? "#E11D48" : "#D97706"} stroke={nodeBg} strokeWidth={2} />
                  <text x={t.position.x + W - 4} y={t.position.y + 8} textAnchor="middle" fontSize="11" fontWeight={700} fill="#FFFFFF">{issues.length}</text>
                </g>}
            </g>;
      })}
      </svg>
      <Flex className="flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/[0.06] px-4 py-2 text-[11px] text-slate-400">
        <Flex className="items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden />Issue count (high severity)</Flex>
        <Flex className="items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-600" aria-hidden />Issue count (medium/low)</Flex>
        <Flex className="items-center gap-1.5"><svg width="22" height="6" aria-hidden><line x1="0" y1="3" x2="22" y2="3" stroke="#A78BFA" strokeWidth="2" strokeDasharray="5 4" /></svg>Missing dependency (hypothesis)</Flex>
        <Flex className="ml-auto items-center gap-1.5 text-slate-500"><MousePointerClickIcon size={12} aria-hidden />Click a team to filter insights</Flex>
      </Flex>
    </Box>;
}
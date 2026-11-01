import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { teamRelations, teams } from "../../data/teamGraph";
import { coverage, coverageHealth, getTeam, healthMeta } from "../../utils/teamGraph";
import { RelationshipDetail } from "./RelationshipDetail";
import { TeamEgoGraph } from "./TeamEgoGraph";
import { TeamIntelPanel } from "./TeamIntelPanel";
import { healthIcons, teamIcons } from "./teamGraphIcons";
export interface OverlayState {
  trail: string[];
  edgeId: string | null;
}
interface Props {
  state: OverlayState;
  onChange: (s: OverlayState) => void;
  onClose: () => void;
}
const legend = ["verified", "partial", "gap", "unknown"] as const;

/** Compact overlay confined to the graph card: team relationship map + intelligence panel. */
export function TeamOverlay({
  state,
  onChange,
  onClose
}: Props) {
  const light = useTheme().resolved === "light";
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mobileView, setMobileView] = useState<"map" | "details">("map");
  const id = state.trail[state.trail.length - 1];
  const team = getTeam(teams, id);
  const relation = state.edgeId ? teamRelations.find((r) => r.id === state.edgeId) ?? null : null;
  useEffect(() => closeRef.current?.focus(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!team) return null;
  const selectTeam = (t: string) => {
    if (t === id) onChange({
      ...state,
      edgeId: null
    });else onChange({
      trail: [...state.trail, t],
      edgeId: null
    });
  };
  const selectEdge = (e: string) => {
    onChange({
      ...state,
      edgeId: e
    });
    setMobileView("details");
  };
  const back = () => state.trail.length > 1 ? onChange({
    trail: state.trail.slice(0, -1),
    edgeId: null
  }) : onClose();
  const cov = coverage(team);
  const covH = healthMeta[coverageHealth(cov.pct)];
  const h = healthMeta[team.status];
  const HIcon = healthIcons[team.status];
  const Icon = teamIcons[team.icon];
  const fade = reduce ? {} : {
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1
    },
    exit: {
      opacity: 0
    },
    transition: {
      duration: 0.18
    }
  };
  return <>
      <motion.div {...fade} role="region" aria-labelledby="team-overlay-title" className={`absolute inset-0 z-20 flex flex-col overflow-hidden rounded-[inherit] backdrop-blur-[2.5px] ${light ? "bg-white/[0.72]" : "bg-[#0b1220]/[0.74]"}`}>
        {/* Header */}
        <Flex className="items-center gap-2.5 border-b border-white/[0.07] px-3.5 py-2.5">
          <IconButton aria-label={state.trail.length > 1 ? "Back" : "Back to organization graph"} size="sm" variant="ghost" icon={<ArrowLeftIcon size={15} />} onClick={back} />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-400/25 bg-blue-400/10 text-blue-300"><Icon size={15} aria-hidden /></span>
          <Box className="min-w-0">
            <Flex as="nav" aria-label="Explored teams" className="items-center gap-1 text-[10.5px] text-slate-500">
              <button type="button" onClick={onClose} className="hover:text-slate-200">Organization</button>
              {state.trail.slice(0, -1).map((t, i) => <React.Fragment key={`${t}-${i}`}>
                  <ChevronRightIcon size={10} />
                  <button type="button" onClick={() => onChange({
                trail: state.trail.slice(0, i + 1),
                edgeId: null
              })} className="truncate hover:text-slate-200">{getTeam(teams, t)?.name}</button>
                </React.Fragment>)}
            </Flex>
            <Text id="team-overlay-title" className="truncate text-[15px] font-semibold leading-tight text-white">
              {team.name} <span className="font-normal text-slate-500">· {team.category}</span>
            </Text>
          </Box>
          <Flex className="ml-auto items-center gap-1.5">
            <span className={`hidden items-center gap-1 rounded border px-1.5 text-[10.5px] font-medium leading-[20px] sm:inline-flex ${h.chip}`}><HIcon size={11} aria-hidden />{h.label}</span>
            <span className={`hidden items-center gap-1 rounded border px-1.5 text-[10.5px] font-medium leading-[20px] sm:inline-flex ${covH.chip}`}>Evidence {cov.pct}%</span>
            <IconButton ref={closeRef} aria-label="Close" size="sm" variant="ghost" icon={<XIcon size={16} />} onClick={onClose} />
          </Flex>
        </Flex>

        {/* Small-screen switch */}
        <Flex role="tablist" aria-label="Overlay view" className="gap-1 border-b border-white/[0.07] px-3 py-1.5 lg:hidden">
          {(["map", "details"] as const).map((v) => <button key={v} type="button" role="tab" aria-selected={mobileView === v} onClick={() => setMobileView(v)} className={`rounded-md px-2.5 py-1 text-[12px] font-medium ${mobileView === v ? "bg-white/[0.1] text-white" : "text-slate-400"}`}>
              {v === "map" ? "Relationship map" : "Details"}
            </button>)}
        </Flex>

        {/* Body */}
        <Box className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
          <Box className={`min-h-0 min-w-0 ${mobileView === "map" ? "block" : "hidden"} lg:block`}>
            <TeamEgoGraph teamId={id} selectedEdgeId={state.edgeId} onSelectTeam={selectTeam} onSelectEdge={selectEdge} onClearEdge={() => onChange({
            ...state,
            edgeId: null
          })} />
          </Box>
          <Box as="aside" aria-live="polite" className={`min-h-0 overflow-y-auto border-white/[0.07] p-3.5 lg:border-l ${mobileView === "details" ? "block" : "hidden"} lg:block`}>
            {relation ? <RelationshipDetail relation={relation} backLabel={team.name} onBack={() => onChange({
            ...state,
            edgeId: null
          })} onSelectTeam={selectTeam} /> : <TeamIntelPanel key={team.id} team={team} onSelectTeam={selectTeam} onSelectRelation={selectEdge} />}
          </Box>
        </Box>

        {/* Footer */}
        <Flex className="flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/[0.07] px-3.5 py-2 text-[10.5px] text-slate-400">
          {legend.map((k) => {
          const LIcon = healthIcons[k];
          return <Flex key={k} className={`items-center gap-1 ${healthMeta[k].text}`}><LIcon size={11} aria-hidden /><span className="text-slate-400">{healthMeta[k].label}</span></Flex>;
        })}
          <Text className="text-slate-500">· Illustrative sample data · last activity {team.lastActivity}</Text>
          <Button size="xs" variant="ghost" className="!ml-auto" rightIcon={<ArrowRightIcon size={12} />} onClick={() => navigate("/governance")}>Governance & Lineage</Button>
        </Flex>
      </motion.div>
    </>;
}
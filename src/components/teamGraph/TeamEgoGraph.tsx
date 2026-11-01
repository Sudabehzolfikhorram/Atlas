import React, { useCallback, useMemo } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { teamRelations, teams } from "../../data/teamGraph";
import { pickHandles } from "../../utils/teamGraph";
import type { TeamRelation } from "../../types/teamGraph";
import { TeamFlowCanvas } from "./TeamFlowCanvas";
const ROW = 112;
const COL = 300;
interface Props {
  teamId: string;
  selectedEdgeId: string | null;
  onSelectTeam: (id: string) => void;
  onSelectEdge: (id: string) => void;
  onClearEdge: () => void;
}

/** Selected team in the centre, providers on the left, receivers on the right, unrelated teams faded below. */
function buildEgo(id: string) {
  const left = [...new Set(teamRelations.filter((r) => r.target === id).map((r) => r.source))];
  const right = [...new Set(teamRelations.filter((r) => r.source === id).map((r) => r.target))].filter((t) => !left.includes(t));
  const related = new Set([id, ...left, ...right]);
  const others = teams.filter((t) => !related.has(t.id)).map((t) => t.id);
  const h = Math.max(left.length, right.length, 1) * ROW;
  const pos: Record<string, {
    x: number;
    y: number;
  }> = {
    [id]: {
      x: COL,
      y: h / 2 - 46
    }
  };
  left.forEach((t, i) => pos[t] = {
    x: 0,
    y: h / 2 - left.length * ROW / 2 + i * ROW
  });
  right.forEach((t, i) => pos[t] = {
    x: COL * 2,
    y: h / 2 - right.length * ROW / 2 + i * ROW
  });
  const step = 200;
  const start = COL + 105 - others.length * step / 2;
  others.forEach((t, i) => pos[t] = {
    x: start + i * step,
    y: h + 60
  });
  const rels = teamRelations.filter((r) => related.has(r.source) && related.has(r.target));
  return {
    rels,
    pos,
    counts: {
      left: left.length,
      right: right.length,
      others: others.length
    }
  };
}

/** The selected team's relationship map, rendered with the shared team canvas. */
export function TeamEgoGraph({
  teamId,
  selectedEdgeId,
  onSelectTeam,
  onSelectEdge,
  onClearEdge
}: Props) {
  const ego = useMemo(() => buildEgo(teamId), [teamId]);
  const handles = useCallback((r: TeamRelation) => pickHandles(ego.pos[r.source], ego.pos[r.target]), [ego]);
  const nodeClick = useCallback((id: string) => id === teamId ? onClearEdge() : onSelectTeam(id), [teamId, onClearEdge, onSelectTeam]);
  const edgeClick = useCallback((e: {
    id: string;
  }) => onSelectEdge(e.id), [onSelectEdge]);
  return <div className="relative h-full min-h-[300px]">
      <TeamFlowCanvas key={teamId} teams={teams} relations={ego.rels} positions={ego.pos} handles={handles} focusId={teamId} selectedEdgeId={selectedEdgeId} compact dimOpacity={0.3} fitPadding={0.12} wheel="scroll" onNodeClick={nodeClick} onEdgeClick={edgeClick} onPaneClick={onClearEdge}>
        <Flex className="pointer-events-none absolute left-3 top-2.5 flex-wrap gap-x-3 text-[10.5px] uppercase tracking-[0.06em] text-slate-500">
          <span>← Provides to this team ({ego.counts.left})</span>
          <span>Receives from this team ({ego.counts.right}) →</span>
          {ego.counts.others > 0 && <span>Faded: not directly connected</span>}
        </Flex>
        <Text className="pointer-events-none absolute bottom-3 right-3 text-[10.5px] text-slate-500">Click a team or connection · scroll to zoom</Text>
      </TeamFlowCanvas>
    </div>;
}
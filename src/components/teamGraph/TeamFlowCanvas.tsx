import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import { Background, BackgroundVariant, ReactFlow, ReactFlowProvider, useReactFlow, type Edge, type EdgeMouseHandler, type NodeMouseHandler, type NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MaximizeIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useStableById } from "../../hooks/useStableById";
import { neighborsOf, relationEdges } from "../../utils/teamGraph";
import type { Team, TeamRelation } from "../../types/teamGraph";
import { TeamNode, type TeamFlowNode, type TeamNodeState } from "./TeamNode";
const nodeTypes = {
  team: TeamNode
} as NodeTypes;
const proOptions = {
  hideAttribution: true
};
const flowStyle = {
  background: "transparent"
};
const zoomKeys = ["Meta", "Control"];
type Pos = {
  x: number;
  y: number;
};
export interface TeamFlowCanvasProps {
  teams: Team[];
  relations: TeamRelation[];
  positions: Record<string, Pos>;
  handles: (r: TeamRelation) => {
    sourceHandle: string;
    targetHandle: string;
  };
  /** Team kept in focus when nothing is hovered. */
  focusId?: string | null;
  selectedEdgeId?: string | null;
  /** Highlight a hovered team's connections. */
  hoverHighlight?: boolean;
  compact?: boolean;
  dimOpacity?: number;
  fitPadding?: number;
  /** "ctrl": page scrolls, Ctrl/⌘ + scroll zooms. "scroll": plain scroll zooms. */
  wheel?: "ctrl" | "scroll";
  onNodeClick?: (id: string) => void;
  onEdgeClick?: (edge: Edge) => void;
  onPaneClick?: () => void;
  /** Changing this value smoothly refits the viewport (e.g. when the visible teams change) without remounting. */
  fitKey?: string;
  children?: React.ReactNode;
}

/** The single React Flow canvas used for both the organization graph and the team overlay map. */
export function TeamFlowCanvas(props: TeamFlowCanvasProps) {
  return <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>;
}
function CanvasInner({
  teams,
  relations,
  positions,
  handles,
  focusId = null,
  selectedEdgeId = null,
  hoverHighlight = false,
  compact = false,
  dimOpacity,
  fitPadding = 0.1,
  wheel = "scroll",
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  fitKey,
  children
}: TeamFlowCanvasProps) {
  const light = useTheme().resolved === "light";
  const rf = useReactFlow();
  const firstFit = useRef(true);
  useEffect(() => {
    if (firstFit.current) {
      firstFit.current = false;
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => rf.fitView({
      padding: fitPadding,
      duration: reduce ? 0 : 450
    }), 40);
    return () => window.clearTimeout(t);
  }, [fitKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const hover = useHover(hoverHighlight);
  const focus = hoverHighlight && hover.id || focusId;
  const near = useMemo(() => focus ? neighborsOf(focus, relations) : null, [focus, relations]);
  const rawNodes = useMemo<TeamFlowNode[]>(() => teams.map((t) => {
    const state: TeamNodeState = !focus ? "default" : t.id === focus ? "selected" : near?.has(t.id) ? "neighbor" : "dim";
    return {
      id: t.id,
      type: "team",
      position: positions[t.id],
      draggable: false,
      data: {
        team: t,
        state,
        compact
      }
    };
  }), [teams, positions, focus, near, compact]);
  const nodes = useStableById(rawNodes, (n) => `${n.data.state}|${n.position.x},${n.position.y}|${n.data.compact ? 1 : 0}|${n.data.team.id}`);
  const rawEdges = useMemo(() => relationEdges(relations, {
    light,
    focusId: focus,
    selectedId: selectedEdgeId,
    dimOpacity,
    handles
  }), [relations, light, focus, selectedEdgeId, dimOpacity, handles]);
  const edges = useStableById(rawEdges, (e) => `${e.source}>${e.target}|${e.sourceHandle}|${e.targetHandle}|${e.zIndex}|${JSON.stringify(e.style)}|${light ? 1 : 0}|${e.id === selectedEdgeId ? 1 : 0}`);
  const nodeClick = useCallback<NodeMouseHandler>((_, n) => onNodeClick?.(n.id), [onNodeClick]);
  const edgeClick = useCallback<EdgeMouseHandler>((_, e) => onEdgeClick?.(e), [onEdgeClick]);
  const fitOptions = useMemo(() => ({
    padding: fitPadding
  }), [fitPadding]);
  return <Box className="team-flow relative h-full w-full">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} onNodeClick={nodeClick} onEdgeClick={edgeClick} onPaneClick={onPaneClick} onNodeMouseEnter={hoverHighlight ? hover.enter : undefined} onNodeMouseLeave={hoverHighlight ? hover.leave : undefined} zoomOnScroll={wheel === "scroll"} preventScrolling={wheel === "scroll"} zoomActivationKeyCode={wheel === "ctrl" ? zoomKeys : null} colorMode={light ? "light" : "dark"} fitView fitViewOptions={fitOptions} minZoom={0.3} maxZoom={2} proOptions={proOptions} style={flowStyle}>
        <Background variant={BackgroundVariant.Dots} gap={18} size={1.2} color={light ? "rgba(100,116,139,0.28)" : "rgba(148,163,184,0.17)"} />
      </ReactFlow>
      <Flex className="glass-tile absolute bottom-2.5 left-2.5 z-[5] items-center gap-0.5 rounded-lg p-0.5">
        <IconButton aria-label="Zoom out" size="xs" variant="ghost" icon={<MinusIcon size={12} />} onClick={() => rf.zoomOut({
        duration: 200
      })} />
        <IconButton aria-label="Zoom in" size="xs" variant="ghost" icon={<PlusIcon size={12} />} onClick={() => rf.zoomIn({
        duration: 200
      })} />
        <IconButton aria-label="Fit to view" size="xs" variant="ghost" icon={<MaximizeIcon size={11} />} onClick={() => rf.fitView({
        padding: fitPadding,
        duration: 300
      })} />
      </Flex>
      {children}
    </Box>;
}

/** Hover tracking coalesced to one update per frame, with a short leave grace period so moving between teams doesn't flash. */
function useHover(enabled: boolean) {
  const [id, setId] = useState<string | null>(null);
  const frame = useRef(0);
  const leaveTimer = useRef<number>();
  const pending = useRef<string | null>(null);
  const flush = useCallback(() => {
    frame.current = 0;
    setId((cur) => cur === pending.current ? cur : pending.current);
  }, []);
  const schedule = useCallback((next: string | null) => {
    pending.current = next;
    if (!frame.current) frame.current = requestAnimationFrame(flush);
  }, [flush]);
  const enter = useCallback<NodeMouseHandler>((_, n) => {
    window.clearTimeout(leaveTimer.current);
    schedule(n.id);
  }, [schedule]);
  const leave = useCallback<NodeMouseHandler>(() => {
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => schedule(null), 70);
  }, [schedule]);
  useEffect(() => {
    if (!enabled) setId(null);
  }, [enabled]);
  useEffect(() => () => {
    cancelAnimationFrame(frame.current);
    window.clearTimeout(leaveTimer.current);
  }, []);
  return {
    id,
    enter,
    leave
  };
}
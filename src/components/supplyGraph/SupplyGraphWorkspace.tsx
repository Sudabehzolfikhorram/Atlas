import React, { useMemo, useRef, useState } from "react";
import { Box, Flex, Text, useToast } from "@chakra-ui/react";
import { Background, BackgroundVariant, MarkerType, ReactFlow, useReactFlow, type NodeTypes } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "../../contexts/ThemeContext";
import { SupplyGraphViewContext } from "../../contexts/SupplyGraphViewContext";
import { useSupplyGraph, type SupplyGraphSource } from "../../hooks/useSupplyGraph";
import type { GraphNode, SupplyEdge } from "../../types/supplyGraph";
import { isSupplyNode, neighborIds } from "../../utils/supplyGraph";
import { AreaNodeCard } from "./AreaNodeCard";
import { NodeDetailsPanel } from "./NodeDetailsPanel";
import { NodeEditForm } from "./NodeEditForm";
import { SupplyGraphEditBar } from "./SupplyGraphEditBar";
import { SupplyGraphToolbar } from "./SupplyGraphToolbar";
import { SupplyNodeCard } from "./SupplyNodeCard";
const nodeTypes = {
  supply: SupplyNodeCard,
  area: AreaNodeCard
} as NodeTypes;
const NODE_W = 150;
const NODE_H = 70;

/** Interactive, editable supply chain data product graph with a node details sidebar. Must sit inside a ReactFlowProvider. */
export function SupplyGraphWorkspace({
  source



}: { /** Graph to show; defaults to the organization's supply chain graph. */source?: SupplyGraphSource;} = {}) {
  const g = useSupplyGraph(source);
  const rf = useReactFlow<GraphNode, SupplyEdge>();
  const toast = useToast();
  const light = useTheme().resolved === "light";
  const canvasRef = useRef<HTMLDivElement>(null);
  const [flow, setFlow] = useState(true);
  const [showWeight, setShowWeight] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [query, setQuery] = useState("");
  const selectedNodeId = g.selection?.kind === "node" ? g.selection.id : null;
  const selectedEdgeId = g.selection?.kind === "edge" ? g.selection.id : null;
  const selectedNode = useMemo(() => g.nodes.filter(isSupplyNode).find((n) => n.id === selectedNodeId) ?? null, [g.nodes, selectedNodeId]);
  const selectedEdge = useMemo(() => g.edges.find((e) => e.id === selectedEdgeId) ?? null, [g.edges, selectedEdgeId]);
  const relatedIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const {
      up,
      down
    } = neighborIds(selectedNodeId, g.edges);
    return new Set([...up, ...down]);
  }, [selectedNodeId, g.edges]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return new Set<string>();
    return new Set(g.nodes.filter(isSupplyNode).filter((n) => `${n.data.label} ${n.data.subtitle ?? ""}`.toLowerCase().includes(q)).map((n) => n.id));
  }, [g.nodes, query]);
  const view = useMemo(() => ({
    editing: g.editing,
    showWeight,
    selectedId: selectedNodeId,
    relatedIds,
    query,
    matches
  }), [g.editing, showWeight, selectedNodeId, relatedIds, query, matches]);
  const displayEdges = useMemo<SupplyEdge[]>(() => {
    const c = light ? {
      flow: "rgba(37,99,235,0.55)",
      dep: "rgba(100,116,139,0.55)",
      hot: "#1D4ED8",
      sel: "#7C3AED",
      text: "#334155",
      bg: "rgba(255,255,255,0.92)"
    } : {
      flow: "rgba(96,165,250,0.6)",
      dep: "rgba(148,163,184,0.45)",
      hot: "#93C5FD",
      sel: "#C4B5FD",
      text: "#CBD5E1",
      bg: "rgba(10,16,30,0.9)"
    };
    return g.edges.map((e) => {
      const d = e.data ?? {
        weight: 0.5,
        kind: "flow" as const
      };
      const dep = d.kind === "dependency";
      const isSel = e.id === selectedEdgeId;
      const touches = selectedNodeId !== null && (e.source === selectedNodeId || e.target === selectedNodeId);
      const dimmed = selectedNodeId !== null && !touches;
      const stroke = isSel ? c.sel : touches ? c.hot : dep ? c.dep : c.flow;
      const text = [showLabels ? d.label : null, showWeight && showLabels ? `W ${d.weight.toFixed(2)}` : null].filter(Boolean).join(" · ");
      return {
        ...e,
        animated: flow && !dep,
        label: text || undefined,
        labelStyle: {
          fill: c.text,
          fontSize: 9.5
        },
        labelBgStyle: {
          fill: c.bg
        },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
        style: {
          stroke,
          strokeWidth: (showWeight ? 0.8 + d.weight * 2 : 1.4) + (isSel ? 1 : 0),
          strokeDasharray: dep ? "5 5" : undefined,
          opacity: dimmed ? 0.15 : 1
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: stroke,
          width: 14,
          height: 14
        },
        interactionWidth: 16,
        zIndex: isSel || touches ? 1 : 0
      };
    });
  }, [g.edges, light, flow, showWeight, showLabels, selectedEdgeId, selectedNodeId]);
  const zoom = {
    onZoomIn: () => rf.zoomIn({
      duration: 200
    }),
    onZoomOut: () => rf.zoomOut({
      duration: 200
    }),
    onFit: () => rf.fitView({
      padding: 0.08,
      duration: 300
    })
  };
  const focusNode = (id: string) => {
    g.selectNode(id);
    const n = rf.getNode(id);
    if (n) rf.setCenter(n.position.x + NODE_W / 2, n.position.y + NODE_H / 2, {
      zoom: Math.max(rf.getZoom(), 0.9),
      duration: 400
    });
  };
  const search = () => {
    const ids = [...matches];
    if (!ids.length) return;
    if (ids.length === 1) focusNode(ids[0]);else rf.fitView({
      nodes: ids.map((id) => ({
        id
      })),
      padding: 0.3,
      duration: 400
    });
  };
  const addNode = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const center = rect ? rf.screenToFlowPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }) : {
      x: 700,
      y: 450
    };
    g.addNode({
      x: center.x - NODE_W / 2,
      y: center.y - NODE_H / 2
    });
  };
  const save = () => {
    g.save();
    toast({
      title: "Graph saved",
      description: "Your changes are stored in this browser.",
      status: "success",
      duration: 3000
    });
  };
  const del = () => g.deleteSelection();
  return <SupplyGraphViewContext.Provider value={view}>
      <Box className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Box className="min-w-0 overflow-hidden">
          {g.editing ? <SupplyGraphEditBar dirty={g.dirty} canDelete={g.selection !== null} onAdd={addNode} onDelete={del} onRestore={g.restoreOriginal} onCancel={g.cancelEditing} onSave={save} {...zoom} /> : <SupplyGraphToolbar flow={flow} onFlow={setFlow} weight={showWeight} onWeight={setShowWeight} labels={showLabels} onLabels={setShowLabels} query={query} onQuery={setQuery} onSearch={search} matchCount={matches.size} onEdit={g.startEditing} {...zoom} />}

          <Box ref={canvasRef} className={`relative h-[640px] transition-shadow ${g.editing ? "shadow-[inset_0_0_0_1px_rgba(167,139,250,0.35)]" : ""}`} aria-label="Supply chain data product graph">
            <ReactFlow<GraphNode, SupplyEdge> nodes={g.nodes} edges={displayEdges} nodeTypes={nodeTypes} onNodesChange={g.onNodesChange} onEdgesChange={g.onEdgesChange} onConnect={g.onConnect} onNodeClick={(_, n) => isSupplyNode(n) ? g.selectNode(n.id) : g.clearSelection()} onEdgeClick={(_, e) => g.selectEdge(e.id)} onPaneClick={g.clearSelection} nodesDraggable={g.editing} nodesConnectable={g.editing} elementsSelectable deleteKeyCode={g.editing ? ["Backspace", "Delete"] : null} zoomOnScroll={g.editing} preventScrolling={g.editing} zoomActivationKeyCode={["Meta", "Control"]} colorMode={light ? "light" : "dark"} fitView fitViewOptions={{
            padding: 0.08
          }} minZoom={0.2} maxZoom={2.5} proOptions={{
            hideAttribution: true
          }} style={{
            background: "transparent"
          }}>
              <Background variant={BackgroundVariant.Dots} gap={18} size={g.editing ? 1.8 : 1.2} color={light ? g.editing ? "rgba(100,116,139,0.45)" : "rgba(100,116,139,0.28)" : g.editing ? "rgba(196,181,253,0.35)" : "rgba(148,163,184,0.18)"} />
            </ReactFlow>
            <Text className="pointer-events-none absolute bottom-2.5 right-3 text-[11px] text-slate-500">
              {g.editing ? "Scroll to zoom · drag empty space to pan · Delete removes selection" : "Drag to pan · Ctrl/⌘ + scroll to zoom · click a node for details"}
            </Text>
          </Box>

          <Flex className="flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-white/[0.06] px-4 py-2.5 text-[11.5px] text-slate-400">
            <Flex className="items-center gap-1.5"><span className="h-0.5 w-5 bg-blue-400" />Data / process flow</Flex>
            <Flex className="items-center gap-1.5"><span className="w-5 border-t border-dashed border-slate-400" />Foundation dependency</Flex>
            <Flex className="items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-400" />Completed</Flex>
            <Flex className="items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400" />Running</Flex>
            <Flex className="items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" />Pending</Flex>
            <Flex className="items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" />Failed</Flex>
            <Flex className="items-center gap-1.5"><span className="rounded bg-amber-400/15 px-1 text-[10px] font-semibold text-amber-300">!</span>Red flags</Flex>
            <Text className="ml-auto text-slate-500">
              {g.savedAt ? `Saved ${g.savedAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}` : g.customized ? "Showing your saved version" : "Original layout"} · sample data
            </Text>
          </Flex>
        </Box>

        <Box as="aside" aria-label="Node details" aria-live="polite" className={`glass-tile min-w-0 overflow-y-auto rounded-2xl p-4 xl:max-h-[786px] ${g.editing ? "!border-violet-400/30" : ""}`}>
          {g.editing ? <NodeEditForm node={selectedNode} edge={selectedEdge} nodes={g.nodes} onNode={g.updateNode} onDetails={g.updateDetails} onEdge={g.updateEdge} onDelete={del} /> : <NodeDetailsPanel node={selectedNode} edge={selectedEdge} nodes={g.nodes} edges={g.edges} onSelectNode={focusNode} />}
        </Box>
      </Box>
    </SupplyGraphViewContext.Provider>;
}
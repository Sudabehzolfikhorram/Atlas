import { useCallback, useRef, useState } from "react";
import { addEdge, useEdgesState, useNodesState, type Connection, type EdgeChange, type NodeChange } from "@xyflow/react";
import { defaultGraphEdges, defaultGraphNodes } from "../data/supplyGraph";
import type { GraphNode, GraphSelection, SupplyEdge, SupplyEdgeData, SupplyNode, SupplyNodeData, SupplyNodeDetails } from "../types/supplyGraph";
import { isSupplyNode } from "../utils/supplyGraph";

const STORAGE_KEY = "atlas.supplyGraph.v1";
type Snapshot = {nodes: GraphNode[];edges: SupplyEdge[];};

export interface SupplyGraphSource {
  nodes: GraphNode[];
  edges: SupplyEdge[];
  /** localStorage key for saved edits. */
  storageKey: string;
}

const defaultSource: SupplyGraphSource = { nodes: defaultGraphNodes, edges: defaultGraphEdges, storageKey: STORAGE_KEY };

function readSaved(key: string): Snapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Snapshot;
    return Array.isArray(parsed.nodes) && Array.isArray(parsed.edges) ? parsed : null;
  } catch {
    return null;
  }
}

const clean = (s: Snapshot): Snapshot => ({
  nodes: s.nodes.map((n) => ({ ...n, selected: false, dragging: false })),
  edges: s.edges.map((e) => ({ ...e, selected: false }))
});

/** State and editing actions for the supply chain data product graph. */
export function useSupplyGraph(source: SupplyGraphSource = defaultSource) {
  const [initial] = useState(() => {
    const saved = readSaved(source.storageKey);
    return saved ? { ...clean(saved), custom: true } : { nodes: source.nodes, edges: source.edges, custom: false };
  });
  const [nodes, setNodes, applyNodeChanges] = useNodesState<GraphNode>(initial.nodes);
  const [edges, setEdges, applyEdgeChanges] = useEdgesState<SupplyEdge>(initial.edges);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [selection, setSelection] = useState<GraphSelection>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [customized, setCustomized] = useState(initial.custom);
  const snapshot = useRef<Snapshot | null>(null);

  const onNodesChange = useCallback((changes: NodeChange<GraphNode>[]) => {
    applyNodeChanges(changes);
    const removed = changes.flatMap((c) => c.type === "remove" ? [c.id] : []);
    if (removed.length || changes.some((c) => c.type === "position" && c.dragging)) setDirty(true);
    if (removed.length) setSelection((s) => s && removed.includes(s.id) ? null : s);
  }, [applyNodeChanges]);

  const onEdgesChange = useCallback((changes: EdgeChange<SupplyEdge>[]) => {
    applyEdgeChanges(changes);
    const removed = changes.flatMap((c) => c.type === "remove" ? [c.id] : []);
    if (removed.length) {
      setDirty(true);
      setSelection((s) => s && removed.includes(s.id) ? null : s);
    }
  }, [applyEdgeChanges]);

  const onConnect = useCallback((c: Connection) => {
    if (!c.source || !c.target || c.source === c.target) return;
    const id = `e-${c.source}-${c.target}-${Date.now().toString(36)}`;
    setEdges((eds) => addEdge<SupplyEdge>({ ...c, id, data: { label: "New connection", weight: 0.5, kind: "flow" } }, eds));
    setDirty(true);
    setSelection({ kind: "edge", id });
  }, [setEdges]);

  const selectNode = useCallback((id: string) => {
    setSelection({ kind: "node", id });
    setNodes((ns) => ns.map((n) => Boolean(n.selected) === (n.id === id) ? n : { ...n, selected: n.id === id }));
  }, [setNodes]);

  const selectEdge = useCallback((id: string) => setSelection({ kind: "edge", id }), []);
  const clearSelection = useCallback(() => setSelection(null), []);

  const startEditing = useCallback(() => {
    snapshot.current = { nodes, edges };
    setEditing(true);
    setDirty(false);
  }, [nodes, edges]);

  const cancelEditing = useCallback(() => {
    const snap = snapshot.current;
    if (snap) {
      setNodes(snap.nodes);
      setEdges(snap.edges);
      setSelection((s) => s && (snap.nodes.some((n) => n.id === s.id) || snap.edges.some((e) => e.id === s.id)) ? s : null);
    }
    setEditing(false);
    setDirty(false);
  }, [setNodes, setEdges]);

  const save = useCallback(() => {
    try {
      window.localStorage.setItem(source.storageKey, JSON.stringify(clean({ nodes, edges })));
    } catch {

      /* storage unavailable — keep in-memory state */}
    setEditing(false);
    setDirty(false);
    setCustomized(true);
    setSavedAt(new Date());
  }, [nodes, edges, source.storageKey]);

  const restoreOriginal = useCallback(() => {
    setNodes(source.nodes);
    setEdges(source.edges);
    setSelection(null);
    setDirty(true);
  }, [setNodes, setEdges, source.nodes, source.edges]);

  const addNode = useCallback((position: {x: number;y: number;}) => {
    const id = `n-${Date.now().toString(36)}`;
    const newNode: SupplyNode = { id, type: "supply", position, data: { label: "New node", subtitle: "", icon: "circle", weight: 0.5, category: "pipeline", details: {} } };
    setNodes((ns) => [...ns.map((n) => ({ ...n, selected: false })), { ...newNode, selected: true }]);
    setSelection({ kind: "node", id });
    setDirty(true);
  }, [setNodes]);

  const deleteSelection = useCallback(() => {
    if (!selection) return;
    if (selection.kind === "node") {
      setNodes((ns) => ns.filter((n) => n.id !== selection.id));
      setEdges((es) => es.filter((e) => e.source !== selection.id && e.target !== selection.id));
    } else {
      setEdges((es) => es.filter((e) => e.id !== selection.id));
    }
    setSelection(null);
    setDirty(true);
  }, [selection, setNodes, setEdges]);

  const updateNode = useCallback((id: string, patch: Partial<SupplyNodeData>) => {
    setNodes((ns) => ns.map((n) => n.id === id && isSupplyNode(n) ? { ...n, data: { ...n.data, ...patch } } : n));
    setDirty(true);
  }, [setNodes]);

  const updateDetails = useCallback((id: string, patch: Partial<SupplyNodeDetails>) => {
    setNodes((ns) => ns.map((n) => n.id === id && isSupplyNode(n) ? { ...n, data: { ...n.data, details: { ...n.data.details, ...patch } } } : n));
    setDirty(true);
  }, [setNodes]);

  const updateEdge = useCallback((id: string, patch: Partial<SupplyEdgeData>) => {
    setEdges((es) => es.map((e) => e.id === id ? { ...e, data: { weight: 0.5, kind: "flow", ...e.data, ...patch } } : e));
    setDirty(true);
  }, [setEdges]);

  return {
    nodes, edges, editing, dirty, selection, savedAt, customized,
    onNodesChange, onEdgesChange, onConnect,
    selectNode, selectEdge, clearSelection,
    startEditing, cancelEditing, save, restoreOriginal,
    addNode, deleteSelection, updateNode, updateDetails, updateEdge
  };
}

export type SupplyGraphState = ReturnType<typeof useSupplyGraph>;
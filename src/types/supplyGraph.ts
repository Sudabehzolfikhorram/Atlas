import type { Edge, Node } from "@xyflow/react";

export type SupplyCategory = "source" | "pipeline" | "output" | "downstream" | "foundation" | "twin";
export type NodeStatus = "completed" | "running" | "pending" | "failed";
export type EdgeKind = "flow" | "dependency";

export type SupplyIconKey =
"database" | "warehouse" | "truck" | "factory" | "dollar" | "radio" | "users" | "globe" | "file" |
"target" | "listChecks" | "layers" | "shuffle" | "boxes" | "eraser" | "shieldCheck" | "search" |
"wrench" | "brain" | "gauge" | "cloud" | "copy" | "trendingUp" | "sliders" | "gitCompare" |
"dashboard" | "code" | "package" | "bot" | "presentation" | "monitor" | "handshake" | "headphones" |
"landmark" | "lock" | "server" | "folderCog" | "eye" | "infinity" | "badgeCheck" | "circle";

/** Every field is optional — missing values render as "Not available". */
export interface SupplyNodeDetails {
  dataSource?: string;
  summary?: string;
  duration?: string;
  status?: NodeStatus;
  redFlags?: string[];
  inputs?: string[];
  outputs?: string[];
  timestamp?: string;
}

export interface SupplyNodeData extends Record<string, unknown> {
  label: string;
  subtitle?: string;
  icon: SupplyIconKey;
  weight: number;
  category: SupplyCategory;
  details: SupplyNodeDetails;
}

export interface AreaNodeData extends Record<string, unknown> {
  label: string;
}

export type SupplyNode = Node<SupplyNodeData, "supply">;
export type AreaNode = Node<AreaNodeData, "area">;
export type GraphNode = SupplyNode | AreaNode;

export interface SupplyEdgeData extends Record<string, unknown> {
  label?: string;
  weight: number;
  kind: EdgeKind;
}

export type SupplyEdge = Edge<SupplyEdgeData>;

export type GraphSelection = {kind: "node" | "edge";id: string;} | null;
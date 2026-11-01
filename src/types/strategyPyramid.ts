export type PyramidLayer = "strategy" | "policy" | "program" | "project" | "action";

export interface PyramidNode {
  id: string;
  layer: PyramidLayer;
  label: string;
  /** Catalog records that trace through this node. */
  records: number;
}

export interface PyramidLink {
  id: string;
  from: string;
  to: string;
  /** Layer of the "from" node. */
  layer: PyramidLayer;
  records: number;
}
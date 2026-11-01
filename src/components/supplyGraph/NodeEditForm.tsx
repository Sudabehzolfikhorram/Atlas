import React from "react";
import { Box, Button, FormControl, FormLabel, Input, Select, Text, Textarea } from "@chakra-ui/react";
import { Trash2Icon } from "lucide-react";
import type { EdgeKind, GraphNode, NodeStatus, SupplyCategory, SupplyEdge, SupplyEdgeData, SupplyNode, SupplyNodeData, SupplyNodeDetails } from "../../types/supplyGraph";
import { categoryMeta, isSupplyNode, statusMeta } from "../../utils/supplyGraph";
interface Props {
  node: SupplyNode | null;
  edge: SupplyEdge | null;
  nodes: GraphNode[];
  onNode: (id: string, patch: Partial<SupplyNodeData>) => void;
  onDetails: (id: string, patch: Partial<SupplyNodeDetails>) => void;
  onEdge: (id: string, patch: Partial<SupplyEdgeData>) => void;
  onDelete: () => void;
}
function F({
  label,
  children



}: {label: string;children: React.ReactNode;}) {
  return <FormControl>
      <FormLabel className="!mb-1 !text-[11px] !font-medium uppercase tracking-[0.08em] !text-slate-500">{label}</FormLabel>
      {children}
    </FormControl>;
}
const toWeight = (v: string) => Math.min(1, Math.max(0, Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0));
export function NodeEditForm({
  node,
  edge,
  nodes,
  onNode,
  onDetails,
  onEdge,
  onDelete
}: Props) {
  if (edge) {
    const d = edge.data ?? {
      weight: 0.5,
      kind: "flow" as EdgeKind
    };
    const nameOf = (id: string) => nodes.filter(isSupplyNode).find((n) => n.id === id)?.data.label ?? id;
    return <Box className="space-y-3">
        <Text className="text-[11px] font-medium uppercase tracking-[0.08em] text-violet-300">Edit connection</Text>
        <Text className="text-[13px] text-slate-300">{nameOf(edge.source)} → {nameOf(edge.target)}</Text>
        <F label="Label"><Input size="sm" value={d.label ?? ""} onChange={(e) => onEdge(edge.id, {
          label: e.target.value
        })} /></F>
        <F label="Weight (0–1)"><Input size="sm" type="number" step={0.01} min={0} max={1} value={d.weight} onChange={(e) => onEdge(edge.id, {
          weight: toWeight(e.target.value)
        })} /></F>
        <F label="Type">
          <Select size="sm" value={d.kind} onChange={(e) => onEdge(edge.id, {
          kind: e.target.value as EdgeKind
        })}>
            <option value="flow">Data / process flow</option>
            <option value="dependency">Foundation dependency</option>
          </Select>
        </F>
        <Button size="sm" variant="ghost" className="!text-rose-300" leftIcon={<Trash2Icon size={13} />} onClick={onDelete}>Delete connection</Button>
      </Box>;
  }
  if (!node) {
    return <Box className="rounded-xl border border-dashed border-violet-400/25 px-4 py-6 text-center">
        <Text className="text-[14px] font-medium text-slate-200">Nothing selected</Text>
        <Text className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
          Select a node or connection to edit it. Drag nodes to move them, drag from a node's edge handle to another node to connect them, or add a new node.
        </Text>
      </Box>;
  }
  const d = node.data;
  const det = d.details;
  const lines = (v?: string[]) => (v ?? []).join("\n");
  const toLines = (v: string) => v.split("\n");
  return <Box className="space-y-3">
      <Text className="text-[11px] font-medium uppercase tracking-[0.08em] text-violet-300">Edit node</Text>
      <F label="Node name"><Input size="sm" value={d.label} onChange={(e) => onNode(node.id, {
        label: e.target.value
      })} /></F>
      <F label="Subtitle"><Input size="sm" value={d.subtitle ?? ""} onChange={(e) => onNode(node.id, {
        subtitle: e.target.value
      })} /></F>
      <Box className="grid grid-cols-2 gap-2">
        <F label="Category">
          <Select size="sm" value={d.category} onChange={(e) => onNode(node.id, {
          category: e.target.value as SupplyCategory
        })}>
            {(Object.keys(categoryMeta) as SupplyCategory[]).map((c) => <option key={c} value={c}>{categoryMeta[c].label}</option>)}
          </Select>
        </F>
        <F label="Weight"><Input size="sm" type="number" step={0.01} min={0} max={1} value={d.weight} onChange={(e) => onNode(node.id, {
          weight: toWeight(e.target.value)
        })} /></F>
      </Box>
      <F label="Status">
        <Select size="sm" value={det.status ?? ""} onChange={(e) => onDetails(node.id, {
        status: (e.target.value || undefined) as NodeStatus | undefined
      })}>
          <option value="">Not set</option>
          {(Object.keys(statusMeta) as NodeStatus[]).map((s) => <option key={s} value={s}>{statusMeta[s].label}</option>)}
        </Select>
      </F>
      <F label="Data source"><Input size="sm" value={det.dataSource ?? ""} onChange={(e) => onDetails(node.id, {
        dataSource: e.target.value
      })} /></F>
      <F label="Summary"><Textarea size="sm" rows={3} value={det.summary ?? ""} onChange={(e) => onDetails(node.id, {
        summary: e.target.value
      })} /></F>
      <Box className="grid grid-cols-2 gap-2">
        <F label="Processing duration"><Input size="sm" value={det.duration ?? ""} onChange={(e) => onDetails(node.id, {
          duration: e.target.value
        })} /></F>
        <F label="Timestamp"><Input size="sm" value={det.timestamp ?? ""} placeholder="YYYY-MM-DD HH:MM" onChange={(e) => onDetails(node.id, {
          timestamp: e.target.value
        })} /></F>
      </Box>
      <F label="Red flags · one per line"><Textarea size="sm" rows={2} value={lines(det.redFlags)} onChange={(e) => onDetails(node.id, {
        redFlags: toLines(e.target.value)
      })} /></F>
      <F label="Input data · one per line"><Textarea size="sm" rows={2} value={lines(det.inputs)} onChange={(e) => onDetails(node.id, {
        inputs: toLines(e.target.value)
      })} /></F>
      <F label="Output data · one per line"><Textarea size="sm" rows={2} value={lines(det.outputs)} onChange={(e) => onDetails(node.id, {
        outputs: toLines(e.target.value)
      })} /></F>
      <Button size="sm" variant="ghost" className="!text-rose-300" leftIcon={<Trash2Icon size={13} />} onClick={onDelete}>Delete node</Button>
    </Box>;
}
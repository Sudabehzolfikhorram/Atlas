import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ArrowDownRightIcon, ArrowUpLeftIcon, MousePointerClickIcon, TriangleAlertIcon } from "lucide-react";
import type { GraphNode, SupplyEdge, SupplyNode } from "../../types/supplyGraph";
import { categoryMeta, cleanList, isSupplyNode, neighborIds, statusMeta } from "../../utils/supplyGraph";
interface Props {
  node: SupplyNode | null;
  edge: SupplyEdge | null;
  nodes: GraphNode[];
  edges: SupplyEdge[];
  onSelectNode: (id: string) => void;
}
function Field({
  label,
  children



}: {label: string;children: React.ReactNode;}) {
  return <Box className="border-t border-white/[0.06] py-3">
      <Text as="dt" className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-slate-500">{label}</Text>
      <Box as="dd" className="mt-1 text-[13px] leading-relaxed text-slate-200">{children}</Box>
    </Box>;
}
function List({
  items


}: {items: string[];}) {
  return <Box as="ul" className="space-y-1">
      {items.map((i) => <Text as="li" key={i} className="flex gap-2"><span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-slate-500" aria-hidden />{i}</Text>)}
    </Box>;
}
export function NodeDetailsPanel({
  node,
  edge,
  nodes,
  edges,
  onSelectNode
}: Props) {
  const supply = nodes.filter(isSupplyNode);
  const nameOf = (id: string) => supply.find((n) => n.id === id)?.data.label ?? id;
  const NodeChip = ({
    id,
    dir



  }: {id: string;dir: "up" | "down";}) => <button type="button" onClick={() => onSelectNode(id)} className="inline-flex items-center gap-1 rounded-md border border-white/[0.1] bg-white/[0.03] px-2 py-0.5 text-[12px] text-slate-200 transition-colors hover:border-blue-400/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
      {dir === "up" ? <ArrowUpLeftIcon size={11} className="text-slate-500" aria-hidden /> : <ArrowDownRightIcon size={11} className="text-slate-500" aria-hidden />}
      {nameOf(id)}
    </button>;
  if (edge) {
    const d = edge.data;
    return <Box>
        <Text className="text-[11px] font-medium uppercase tracking-[0.08em] text-blue-300">Connection</Text>
        <Text className="mt-1 text-[16px] font-semibold text-white">{d?.label || "Unlabelled connection"}</Text>
        <Box as="dl" className="mt-3">
          <Field label="From"><NodeChip id={edge.source} dir="up" /></Field>
          <Field label="To"><NodeChip id={edge.target} dir="down" /></Field>
          <Field label="Type">{d?.kind === "dependency" ? "Foundation dependency" : "Data / process flow"}</Field>
          {d && <Field label="Weight"><span className="num">{d.weight.toFixed(2)}</span></Field>}
        </Box>
      </Box>;
  }
  if (!node) {
    const flagged = supply.filter((n) => cleanList(n.data.details.redFlags).length > 0);
    const failed = supply.filter((n) => n.data.details.status === "failed").length;
    return <Box>
        <Flex className="flex-col items-center rounded-xl border border-dashed border-white/[0.1] px-4 py-6 text-center">
          <MousePointerClickIcon size={20} className="text-slate-500" aria-hidden />
          <Text className="mt-2 text-[14px] font-medium text-slate-200">Select a node</Text>
          <Text className="mt-1 text-[12.5px] leading-relaxed text-slate-500">Click any node to see its source, status, red flags and dependencies.</Text>
        </Flex>
        <Box className="mt-4 grid grid-cols-2 gap-2">
          {[["Nodes", supply.length], ["Connections", edges.length], ["With red flags", flagged.length], ["Failed", failed]].map(([l, v]) => <Box key={l} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <Text className="num text-[18px] font-semibold text-white">{v}</Text>
              <Text className="text-[11px] text-slate-500">{l}</Text>
            </Box>)}
        </Box>
        {flagged.length > 0 && <Box className="mt-4">
            <Text className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-slate-500">Needs attention</Text>
            <Box as="ul" className="mt-2 space-y-1">
              {flagged.map((n) => <li key={n.id}>
                  <button type="button" onClick={() => onSelectNode(n.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px] text-slate-300 transition-colors hover:bg-white/[0.04] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                    <TriangleAlertIcon size={12} className="shrink-0 text-amber-300" aria-hidden />
                    <span className="truncate">{n.data.label}</span>
                    <span className="num ml-auto text-[11px] text-amber-300">{cleanList(n.data.details.redFlags).length}</span>
                  </button>
                </li>)}
            </Box>
          </Box>}
      </Box>;
  }
  const {
    details
  } = node.data;
  const status = details.status ? statusMeta[details.status] : null;
  const flags = cleanList(details.redFlags);
  const inputs = cleanList(details.inputs);
  const outputs = cleanList(details.outputs);
  const {
    up,
    down
  } = neighborIds(node.id, edges);
  return <Box>
      <Text className="text-[11px] font-medium uppercase tracking-[0.08em] text-blue-300">
        {categoryMeta[node.data.category]?.label ?? "Node"} · <span className="num">W {node.data.weight.toFixed(2)}</span>
      </Text>
      <Text className="mt-1 text-[17px] font-semibold leading-snug text-white">{node.data.label || "Untitled node"}</Text>
      {node.data.subtitle && <Text className="text-[12.5px] text-slate-400">{node.data.subtitle}</Text>}
      <Flex className="mt-2.5 flex-wrap items-center gap-1.5">
        {status && <span className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${status.chip}`}><span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{status.label}</span>}
        {flags.length > 0 && <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-300"><TriangleAlertIcon size={11} />{flags.length} red flag{flags.length > 1 ? "s" : ""}</span>}
        <span className="rounded-md border border-white/[0.1] px-1.5 py-0.5 text-[11px] text-slate-400">Sample data</span>
      </Flex>

      <Box as="dl" className="mt-3">
        {/* Red flags stay first and always visible; other fields only render when they have a value. */}
        <Field label="Red flags">
          {flags.length ? <Box as="ul" className="space-y-1.5">
              {flags.map((f) => <Text as="li" key={f} className="flex gap-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-2.5 py-1.5 text-[12.5px] text-amber-100"><TriangleAlertIcon size={12} className="mt-1 shrink-0 text-amber-300" aria-hidden />{f}</Text>)}
            </Box> : <span className="text-slate-400">None recorded</span>}
        </Field>
        {details.dataSource && <Field label="Data source">{details.dataSource}</Field>}
        {details.summary && <Field label="Summary">{details.summary}</Field>}
        {details.duration && <Field label="Processing duration">{details.duration}</Field>}
        {inputs.length > 0 && <Field label="Input data"><List items={inputs} /></Field>}
        {outputs.length > 0 && <Field label="Output data"><List items={outputs} /></Field>}
        {(up.length > 0 || down.length > 0) && <Field label="Dependencies">
            {up.length > 0 && <>
                <Text className="text-[11.5px] text-slate-500">Upstream ({up.length})</Text>
                <Flex className="mt-1 flex-wrap gap-1.5">{up.map((id) => <NodeChip key={id} id={id} dir="up" />)}</Flex>
              </>}
            {down.length > 0 && <>
                <Text className={`${up.length ? "mt-2.5" : ""} text-[11.5px] text-slate-500`}>Downstream ({down.length})</Text>
                <Flex className="mt-1 flex-wrap gap-1.5">{down.map((id) => <NodeChip key={id} id={id} dir="down" />)}</Flex>
              </>}
          </Field>}
        {details.timestamp && <Field label="Timestamp"><span className="num">{details.timestamp}</span></Field>}
      </Box>
    </Box>;
}
import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Input, InputGroup, InputLeftElement, Text } from "@chakra-ui/react";
import { ArrowRightIcon, DownloadIcon, SearchIcon, TriangleAlertIcon } from "lucide-react";
import { categoryMeta, cleanList, statusMeta } from "../../utils/supplyGraph";
import { downloadCsv } from "../../utils/exportCsv";
import type { SupplyNode } from "../../types/supplyGraph";
import { CollapsibleSection } from "./CollapsibleSection";
import { Pager } from "./Pager";
interface Props {
  nodes: SupplyNode[];
  defaultOpen?: boolean;
  /** Node to reveal (opens the directory, pages to it and expands its row). */
  focusId?: string | null;
  focusNonce?: number;
}
const PAGE = 8;
export const nodeContext = (n: SupplyNode) => [n.data.details.dataSource, n.data.subtitle].filter(Boolean).join(" · ") || categoryMeta[n.data.category].label;

/** Searchable, exportable list of every node in the data supply chain. */
export function NodeDirectory({
  nodes,
  defaultOpen = true,
  focusId,
  focusNonce = 0
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? nodes.filter((n) => `${n.data.label} ${nodeContext(n)}`.toLowerCase().includes(s)) : nodes;
  }, [nodes, q]);
  useEffect(() => setPage(0), [q]);
  useEffect(() => {
    if (!focusId || !focusNonce) return;
    setQ("");
    setOpen(true);
    const idx = nodes.findIndex((n) => n.id === focusId);
    if (idx >= 0) setPage(Math.floor(idx / PAGE));
    setExpanded(focusId);
    window.setTimeout(() => document.getElementById(`nd-row-${focusId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    }), 260);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNonce]);
  const exportNodes = () => downloadCsv("node-directory.csv", [["Node", "Area", "Source / context", "Status", "Weight", "Red flags"], ...nodes.map((n) => [n.data.label, categoryMeta[n.data.category].label, nodeContext(n), n.data.details.status ? statusMeta[n.data.details.status].label : "", n.data.weight.toFixed(2), cleanList(n.data.details.redFlags).join("; ")])]);
  const rows = shown.slice(page * PAGE, (page + 1) * PAGE);
  return <CollapsibleSection id="node-directory" title="Node directory" meta={`${nodes.length} source records`} open={open} onOpenChange={setOpen}>
      <Box className="flex flex-wrap items-center gap-3 px-5 py-4">
        <InputGroup size="sm" className="!w-full sm:!w-[260px]">
          <InputLeftElement pointerEvents="none"><SearchIcon size={14} className="text-slate-500" /></InputLeftElement>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search all nodes" aria-label="Search all nodes" className="!rounded-lg" />
        </InputGroup>
        <Button size="sm" variant="outline" leftIcon={<DownloadIcon size={14} />} onClick={exportNodes} className="sm:!ml-auto">Export nodes</Button>
      </Box>
      <Box className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13px]">
          <thead>
            <tr className="border-y border-white/[0.06] text-left text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
              <th scope="col" className="px-5 py-2.5 font-medium">Node</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Source / context</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
              <th className="w-12" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">No nodes match “{q}”.</td></tr>}
            {rows.map((n) => {
            const st = n.data.details.status ? statusMeta[n.data.details.status] : null;
            const flags = cleanList(n.data.details.redFlags);
            const on = expanded === n.id;
            return <React.Fragment key={n.id}>
                  <tr id={`nd-row-${n.id}`} className={`border-b border-white/[0.05] transition-colors hover:bg-white/[0.02] ${on ? "bg-blue-500/[0.05]" : ""}`}>
                    <td className="px-5 py-3 font-medium text-slate-100">
                      <span className="flex items-center gap-2">{n.data.label}{flags.length > 0 && <TriangleAlertIcon size={13} className="text-amber-300" aria-label={`${flags.length} red flags`} />}</span>
                    </td>
                    <td className="max-w-[360px] truncate px-3 py-3 text-slate-300" title={nodeContext(n)}>{nodeContext(n)}</td>
                    <td className="px-3 py-3">{st ? <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[11.5px] font-medium ${st.chip}`}>{st.label}</span> : <span className="text-slate-500">—</span>}</td>
                    <td className="pr-5">
                      <button type="button" aria-expanded={on} aria-label={`${on ? "Hide" : "Show"} details for ${n.data.label}`} onClick={() => setExpanded(on ? null : n.id)} className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.1] text-slate-300 transition-colors hover:border-blue-400/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                        <ArrowRightIcon size={14} className={`transition-transform ${on ? "rotate-90" : ""}`} aria-hidden />
                      </button>
                    </td>
                  </tr>
                  {on && <tr className="border-b border-white/[0.05] bg-white/[0.015]">
                      <td colSpan={4} className="px-5 py-3.5">
                        <Box className="grid gap-4 text-[12.5px] md:grid-cols-3">
                          <Box>
                            <Text className="text-[11px] uppercase tracking-[0.08em] text-slate-500">{categoryMeta[n.data.category].label} · weight {n.data.weight.toFixed(2)}</Text>
                            {n.data.details.summary && <Text className="mt-1 text-slate-300">{n.data.details.summary}</Text>}
                          </Box>
                          <Box>
                            <Text className="text-[11px] uppercase tracking-[0.08em] text-slate-500">Red flags</Text>
                            {flags.length ? <ul className="mt-1 space-y-0.5 text-amber-200">{flags.map((f) => <li key={f}>• {f}</li>)}</ul> : <Text className="mt-1 text-slate-400">None recorded</Text>}
                          </Box>
                          {(cleanList(n.data.details.inputs).length > 0 || cleanList(n.data.details.outputs).length > 0) && <Box>
                              <Text className="text-[11px] uppercase tracking-[0.08em] text-slate-500">Inputs → outputs</Text>
                              <Text className="mt-1 text-slate-300">{cleanList(n.data.details.inputs).join(", ") || "—"} → {cleanList(n.data.details.outputs).join(", ") || "—"}</Text>
                            </Box>}
                        </Box>
                      </td>
                    </tr>}
                </React.Fragment>;
          })}
          </tbody>
        </table>
      </Box>
      <Pager page={page} pageSize={PAGE} total={shown.length} noun="records" onPage={setPage} />
    </CollapsibleSection>;
}
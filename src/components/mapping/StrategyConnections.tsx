import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, Input, InputGroup, InputLeftElement, Text } from "@chakra-ui/react";
import { DownloadIcon, SearchIcon } from "lucide-react";
import { pyramidLinks, pyramidNodes, pyramidRecords } from "../../data/strategyPyramid";
import { downloadCsv } from "../../utils/exportCsv";
import type { PyramidLayer } from "../../types/strategyPyramid";
import { InfoTip } from "../ui/InfoTip";
import { SectionHeader } from "./CollapsibleSection";
import { Pager } from "./Pager";
const name = new Map(pyramidNodes.map((n) => [n.id, n.label]));
const pairs: {
  layer: PyramidLayer;
  label: string;
}[] = [{
  layer: "strategy",
  label: "Strategy → Policy"
}, {
  layer: "policy",
  label: "Policy → Program"
}, {
  layer: "program",
  label: "Program → Project"
}, {
  layer: "project",
  label: "Project → Action"
}];
const PAGE = 8;
export const exportStrategyConnections = () => downloadCsv("strategy-connections.csv", [["Layer", "From", "To", "Records", "Layer share %"], ...pyramidLinks.map((l) => [pairs.find((p) => p.layer === l.layer)?.label ?? l.layer, name.get(l.from) ?? l.from, name.get(l.to) ?? l.to, l.records, (l.records / pyramidRecords * 100).toFixed(1)])]);

/** Strategy connections: every link between two adjacent pyramid layers. */
export function StrategyConnections() {
  const [layer, setLayer] = useState<PyramidLayer>("strategy");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return pyramidLinks.filter((l) => l.layer === layer && (!s || `${name.get(l.from)} ${name.get(l.to)}`.toLowerCase().includes(s))).sort((a, b) => b.records - a.records);
  }, [layer, q]);
  useEffect(() => setPage(0), [layer, q]);
  const max = Math.max(1, ...pyramidLinks.filter((l) => l.layer === layer).map((l) => l.records));
  const th = "px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400";
  return <Box as="section" aria-labelledby="sc-title" className="glass overflow-hidden rounded-2xl">
      <SectionHeader id="sc-title" title={<>Strategy connections<span className="num rounded-md border border-white/[0.1] px-1.5 text-[11.5px] font-medium text-slate-300">{pyramidLinks.length}</span><InfoTip label="Strategy connections">Each row links an item to one it is delivered through, with the number of catalog records on that link.</InfoTip></>}>
        <Button size="sm" variant="outline" leftIcon={<DownloadIcon size={14} />} onClick={exportStrategyConnections}>Export all</Button>
      </SectionHeader>
      <Box className="space-y-3 px-5 py-3">
        <Flex role="tablist" aria-label="Layer pair" className="w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-black/20 p-1">
          {pairs.map((p) => {
          const on = p.layer === layer;
          return <button key={p.layer} type="button" role="tab" aria-selected={on} onClick={() => setLayer(p.layer)} className={`shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "bg-blue-500/20 text-white" : "text-slate-400 hover:text-slate-200"}`}>
                {p.label} <span className="num text-slate-500">{pyramidLinks.filter((l) => l.layer === p.layer).length}</span>
              </button>;
        })}
        </Flex>
        <Flex className="flex-wrap items-center gap-3">
          <InputGroup size="sm" className="!w-full sm:!w-[300px]">
            <InputLeftElement pointerEvents="none"><SearchIcon size={14} className="text-slate-500" /></InputLeftElement>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search connections…" aria-label="Search connections" className="!rounded-lg" />
          </InputGroup>
          <Text className="num ml-auto text-[12px] text-slate-500">{pyramidRecords} records in this layer</Text>
        </Flex>
      </Box>
      <Box className="overflow-x-auto border-t border-white/[0.06]">
        <table className="w-full min-w-[760px] text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th scope="col" className={`${th} pl-5`}>From</th>
              <th scope="col" className={th}>To</th>
              <th scope="col" className={`${th} text-right`}>Records</th>
              <th scope="col" className={`${th} text-right`}>Layer share</th>
              <th scope="col" className={`${th} pr-5`}><span className="flex items-center gap-1">Relative share<InfoTip label="Relative share">Records on this link compared with the largest link in the same layer.</InfoTip></span></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No connections match “{q}”.</td></tr>}
            {rows.slice(page * PAGE, (page + 1) * PAGE).map((l) => <tr key={l.id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                <td className="py-3 pl-5 pr-3 font-medium text-slate-100">{name.get(l.from)}</td>
                <td className="px-3 py-3 text-slate-200">{name.get(l.to)}</td>
                <td className="num px-3 py-3 text-right text-slate-200">{l.records}</td>
                <td className="num px-3 py-3 text-right text-slate-200">{(l.records / pyramidRecords * 100).toFixed(1)}%</td>
                <td className="py-3 pl-3 pr-5"><span className="block h-1.5 w-[110px] rounded-full bg-white/[0.08]"><span className="block h-1.5 rounded-full bg-blue-400" style={{
                  width: `${l.records / max * 100}%`
                }} /></span></td>
              </tr>)}
          </tbody>
        </table>
      </Box>
      <Pager page={page} pageSize={PAGE} total={rows.length} noun="connections" onPage={setPage} />
    </Box>;
}
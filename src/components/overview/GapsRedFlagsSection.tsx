import React, { useEffect, useMemo, useState } from "react";
import { Box, Flex, Heading, IconButton, Input, InputGroup, InputLeftElement, Select, Text } from "@chakra-ui/react";
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "lucide-react";
import { useDiligence } from "../../contexts/DiligenceContext";
import { bySeverity, kindMeta, statusMeta, statuses } from "../../utils/diligence";
import { severityStyles } from "../ui/SeverityTag";
import { InfoTip } from "../ui/InfoTip";
import { FindingDrawer } from "../diligence/FindingDrawer";
import type { Severity } from "../../types/intel";
import type { DiligenceArea, FindingKind, FindingStatus } from "../../types/diligence";
const areas: {
  id: DiligenceArea;
  label: string;
}[] = [{
  id: "data",
  label: "Data"
}, {
  id: "process",
  label: "Process"
}];
const PAGE_SIZES = [8, 16, 24];

/** Overview list of gaps and red flags across Data and Process, with a details drawer per row. */
export function GapsRedFlagsSection() {
  const {
    findings,
    openFinding,
    selectedId
  } = useDiligence();
  const [area, setArea] = useState<DiligenceArea>("data");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<FindingKind | "all">("all");
  const [risk, setRisk] = useState<Severity | "all">("all");
  const [status, setStatus] = useState<FindingStatus | "all">("all");
  const [titleDir, setTitleDir] = useState<1 | -1 | 0>(0);
  const [riskDir, setRiskDir] = useState<1 | -1>(1);
  const [size, setSize] = useState(8);
  const [page, setPage] = useState(0);
  const counts = useMemo(() => ({
    data: findings.filter((f) => f.area === "data").length,
    process: findings.filter((f) => f.area === "process").length
  }), [findings]);
  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = findings.filter((f) => f.area === area && (kind === "all" || f.kind === kind) && (risk === "all" || f.severity === risk) && (status === "all" || f.status === status) && (!term || [f.id, f.title, f.owner, f.team, f.related, ...f.systems].join(" ").toLowerCase().includes(term)));
    return out.sort((a, b) => titleDir ? a.title.localeCompare(b.title) * titleDir : bySeverity(a, b) * riskDir);
  }, [findings, area, q, kind, risk, status, titleDir, riskDir]);
  useEffect(() => setPage(0), [area, q, kind, risk, status, size]);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const shown = rows.slice(page * size, page * size + size);
  const th = "whitespace-nowrap px-4 py-2.5 text-left text-[11.5px] font-medium text-slate-400";
  const SortIcon = ({
    dir


  }: {dir: number;}) => dir === -1 ? <ArrowUpIcon size={11} aria-hidden /> : <ArrowDownIcon size={11} aria-hidden />;
  return <Box as="section" id="overview-findings" aria-labelledby="gaps-title" className="glass overflow-hidden rounded-2xl">
      <Flex className="flex-wrap items-center gap-3 px-4 pt-4 md:px-5">
        <Flex className="items-center gap-1.5">
          <Heading as="h2" id="gaps-title" className="!text-[15px] !font-semibold tracking-tight text-white">Gaps &amp; red flags</Heading>
          <InfoTip label="Gaps and red flags">Red flags are serious anomalies, broken controls or compliance risks. Gaps are smaller deficiencies, missing ownership or improvement opportunities. Open a row for evidence, cause and the recommended action.</InfoTip>
        </Flex>
        <Flex role="tablist" aria-label="Area" className="ml-auto rounded-lg border border-white/[0.08] bg-black/20 p-0.5">
          {areas.map((a) => {
          const on = area === a.id;
          return <button key={a.id} type="button" role="tab" aria-selected={on} onClick={() => setArea(a.id)} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "bg-white/[0.1] text-white" : "text-slate-400 hover:text-slate-200"}`}>
                {a.label}<span className="num text-[10.5px] text-slate-500">{counts[a.id]}</span>
              </button>;
        })}
        </Flex>
      </Flex>

      

      <Box className="overflow-x-auto border-t border-white/[0.06]">
        <table className="w-full min-w-[860px] text-[12.5px]">
          <thead className="bg-white/[0.02]">
            <tr>
              <th scope="col" className={`${th} w-[34%]`} aria-sort={titleDir ? titleDir === 1 ? "ascending" : "descending" : "none"}>
                <button type="button" onClick={() => setTitleDir((d) => d === 1 ? -1 : 1)} className="inline-flex items-center gap-1 hover:text-slate-200 focus:outline-none focus-visible:text-white">Finding<SortIcon dir={titleDir || 1} /></button>
              </th>
              <th scope="col" className={th} aria-sort={!titleDir ? riskDir === 1 ? "descending" : "ascending" : "none"}>
                <button type="button" onClick={() => {
                setTitleDir(0);
                setRiskDir((d) => titleDir ? d : d === 1 ? -1 : 1);
              }} className="inline-flex items-center gap-1 hover:text-slate-200 focus:outline-none focus-visible:text-white">Risk<SortIcon dir={riskDir} /></button>
              </th>
              <th scope="col" className={th}>Type</th>
              <th scope="col" className={th}>Affected</th>
              <th scope="col" className={th}>Status</th>
              <th scope="col" className={th}>Owner</th>
              <th className="w-12" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {shown.map((f) => {
            const sev = severityStyles[f.severity];
            return <tr key={f.id} tabIndex={0} onClick={() => openFinding(f.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), openFinding(f.id))} aria-label={`Open ${f.title}`} className={`group cursor-pointer border-t border-white/[0.05] transition-colors hover:bg-white/[0.03] focus:outline-none focus-visible:bg-blue-500/[0.07] ${selectedId === f.id ? "bg-blue-500/[0.06]" : ""}`}>
                  <td className="px-4 py-3">
                    <Text className="truncate font-medium text-slate-100 group-hover:text-white" title={f.title}>{f.title}</Text>
                    <Text className="num truncate text-[11px] text-slate-500">{f.id}</Text>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap font-medium ${sev.text}`}><span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} aria-hidden />{sev.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="whitespace-nowrap rounded-md border border-white/15 bg-white/[0.04] px-1.5 py-0.5 text-[11px] font-medium text-slate-200">{kindMeta[f.kind].label}</span>
                  </td>
                  <td className="max-w-[200px] px-4 py-3"><Text className="truncate text-slate-300" title={f.systems.join(", ") || f.team}>{f.systems.slice(0, 2).join(", ") || f.team}</Text></td>
                  <td className="px-4 py-3">
                    <span className={`whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${statusMeta[f.status].chip}`}>{statusMeta[f.status].label}</span>
                  </td>
                  <td className="max-w-[160px] px-4 py-3"><Text className={`truncate ${f.owner ? "text-slate-300" : "text-slate-500"}`}>{f.owner || "Unassigned"}</Text></td>
                  <td className="px-3 py-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md border border-blue-400/30 bg-blue-500/10 text-blue-300 transition-colors group-hover:bg-blue-500/20" aria-hidden><ChevronRightIcon size={14} /></span>
                  </td>
                </tr>;
          })}
            {shown.length === 0 && <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-slate-400">No findings match these filters.</td>
              </tr>}
          </tbody>
        </table>
      </Box>

      <Flex className="flex-wrap items-center gap-3 border-t border-white/[0.06] px-4 py-3 text-[12px] text-slate-400 md:px-5">
        <Text>{rows.length ? `${page * size + 1}–${Math.min(rows.length, page * size + size)} of ${rows.length} findings` : "0 findings"}</Text>
        <Flex className="ml-auto items-center gap-2">
          <Text as="label" htmlFor="gaps-rows">Rows</Text>
          <Select id="gaps-rows" size="xs" value={size} onChange={(e) => setSize(Number(e.target.value))} className="!w-16 !rounded-md">
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
          <IconButton aria-label="Previous page" size="xs" variant="ghost" icon={<ChevronLeftIcon size={14} />} isDisabled={page === 0} onClick={() => setPage((p) => p - 1)} />
          <Text className="num" style={{
          width: "70px"
        }}>{page + 1} / {pages}</Text>
          <IconButton aria-label="Next page" size="xs" variant="ghost" icon={<ChevronRightIcon size={14} />} isDisabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} />
        </Flex>
      </Flex>
      <FindingDrawer />
    </Box>;
}
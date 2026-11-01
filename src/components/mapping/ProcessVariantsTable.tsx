import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, Input, InputGroup, InputLeftElement, Select, Text } from "@chakra-ui/react";
import { ArrowRightIcon, DownloadIcon, SearchIcon, TriangleAlertIcon } from "lucide-react";
import { eventLog, processVariants } from "../../data/processVariants";
import { downloadCsv } from "../../utils/exportCsv";
import { InfoTip } from "../ui/InfoTip";
import { SectionHeader } from "./CollapsibleSection";
import { Pager } from "./Pager";
const finalStates = Array.from(new Set(processVariants.map((v) => v.finalState)));
const variantCases = processVariants.reduce((s, v) => s + v.cases, 0);
const label = (path: string[]) => `${path[0]} → … → ${path[path.length - 1]}`;

/** Process variants: every distinct activity path in the event log. */
export function ProcessVariantsTable() {
  const [q, setQ] = useState("");
  const [state, setState] = useState("all");
  const [dev, setDev] = useState<"all" | "yes" | "no">("all");
  const [size, setSize] = useState(8);
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return processVariants.filter((v) => (state === "all" || v.finalState === state) && (dev === "all" || v.deviation === (dev === "yes")) && (!s || `${v.id} ${v.path.join(" ")}`.toLowerCase().includes(s)));
  }, [q, state, dev]);
  useEffect(() => setPage(0), [q, state, dev, size]);
  const filtered = q || state !== "all" || dev !== "all";
  const exportAll = () => downloadCsv("process-variants.csv", [["Variant", "Path", "Cases", "Share %", "Median days", "Final state", "Deviation"], ...rows.map((v) => [v.id, v.path.join(" > "), v.cases, (v.cases / eventLog.cases * 100).toFixed(1), v.medianDays, v.finalState, v.deviation ? "yes" : "no"])]);
  const th = "px-3 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400";
  return <Box as="section" aria-labelledby="pv-title" className="glass overflow-hidden rounded-2xl">
      <SectionHeader id="pv-title" title={<>Process variants<span className="num rounded-md border border-white/[0.1] px-1.5 text-[11.5px] font-medium text-slate-300">{processVariants.length}</span><InfoTip label="Process variants">A variant is one distinct sequence of activities. Flags mark variants with a time or sequence deviation.</InfoTip></>} meta={<Text className="w-full text-[12.5px] text-slate-400 md:order-last">{variantCases.toLocaleString()} cases · {(variantCases / eventLog.cases * 100).toFixed(1)}% of the full event log</Text>}>
        <Button size="sm" variant="outline" leftIcon={<DownloadIcon size={14} />} onClick={exportAll}>Export CSV</Button>
      </SectionHeader>
      <Flex className="flex-wrap items-center gap-2 px-5 py-3">
        <InputGroup size="sm" className="!w-full sm:!w-[300px]">
          <InputLeftElement pointerEvents="none"><SearchIcon size={14} className="text-slate-500" /></InputLeftElement>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search variant, activity or family…" aria-label="Search variants" className="!rounded-lg" />
        </InputGroup>
        <Box className="w-[150px] sm:ml-auto">
          <Select size="sm" value={state} onChange={(e) => setState(e.target.value)} aria-label="Final state" className="!rounded-lg">
            <option value="all">All final states</option>
            {finalStates.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Box>
        <Box className="w-[150px]">
          <Select size="sm" value={dev} onChange={(e) => setDev(e.target.value as typeof dev)} aria-label="Deviation" className="!rounded-lg">
            <option value="all">All deviations</option>
            <option value="yes">With deviation</option>
            <option value="no">Without deviation</option>
          </Select>
        </Box>
        <Button size="sm" variant="outline" isDisabled={!filtered} onClick={() => {
        setQ("");
        setState("all");
        setDev("all");
      }}>Reset</Button>
      </Flex>
      <Box className="overflow-x-auto border-t border-white/[0.06]">
        <table className="w-full min-w-[820px] text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th scope="col" className={`${th} pl-5`}>Variant</th>
              <th scope="col" className={`${th} text-right`}>Cases</th>
              <th scope="col" className={`${th} text-right`}>Share</th>
              <th scope="col" className={`${th} text-right`}>Median</th>
              <th scope="col" className={th}>Final state</th>
              <th scope="col" className={`${th} text-center`}>Flags</th>
              <th className="w-14" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-500">No variants match these filters.</td></tr>}
            {rows.slice(page * size, (page + 1) * size).map((v) => {
            const on = open === v.id;
            const paid = v.finalState === "Payment Handled";
            return <React.Fragment key={v.id}>
                  <tr className={`border-b border-white/[0.05] transition-colors hover:bg-white/[0.02] ${on ? "bg-blue-500/[0.05]" : ""}`}>
                    <td className="py-3 pl-5 pr-3">
                      <Text className="font-medium text-slate-100">{label(v.path)}</Text>
                      <Text className="num text-[11.5px] text-slate-500">{v.id}</Text>
                    </td>
                    <td className="num px-3 py-3 text-right text-slate-200">{v.cases.toLocaleString()}</td>
                    <td className="num px-3 py-3 text-right text-slate-200">{(v.cases / eventLog.cases * 100).toFixed(1)}%</td>
                    <td className="num px-3 py-3 text-right text-slate-200">{v.medianDays} d</td>
                    <td className="px-3 py-3"><span className={`inline-flex whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11.5px] font-medium ${paid ? "border-teal-400/40 bg-teal-500/10 text-teal-300" : "border-white/[0.15] text-slate-300"}`}>{v.finalState}</span></td>
                    <td className="px-3 py-3 text-center">{v.deviation ? <TriangleAlertIcon size={15} className="mx-auto text-amber-300" aria-label="Deviation flagged" /> : <span className="text-slate-600">—</span>}</td>
                    <td className="pr-5">
                      <button type="button" aria-expanded={on} aria-label={`${on ? "Hide" : "Show"} path of variant ${v.id}`} onClick={() => setOpen(on ? null : v.id)} className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.1] text-slate-300 hover:border-blue-400/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                        <ArrowRightIcon size={14} className={`transition-transform ${on ? "rotate-90" : ""}`} aria-hidden />
                      </button>
                    </td>
                  </tr>
                  {on && <tr className="border-b border-white/[0.05] bg-white/[0.015]">
                      <td colSpan={7} className="px-5 py-3">
                        <Flex as="ol" aria-label="Activity path" className="flex-wrap items-center gap-1.5 text-[12px]">
                          {v.path.map((s, i) => <li key={`${s}-${i}`} className="flex items-center gap-1.5">
                              {i > 0 && <ArrowRightIcon size={11} className="text-slate-600" aria-hidden />}
                              <span className="rounded-md border border-white/[0.1] bg-white/[0.03] px-1.5 py-0.5 text-slate-200">{s}</span>
                            </li>)}
                        </Flex>
                      </td>
                    </tr>}
                </React.Fragment>;
          })}
          </tbody>
        </table>
      </Box>
      <Pager page={page} pageSize={size} total={rows.length} noun="variants" onPage={setPage}>
        <Flex className="mr-2 items-center gap-1.5 text-[12px] text-slate-500">
          Rows
          <Box className="w-[70px]">
            <Select size="xs" value={size} onChange={(e) => setSize(Number(e.target.value))} aria-label="Rows per page" className="!rounded-md">
              {[8, 16, 32].map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          </Box>
        </Flex>
      </Pager>
    </Box>;
}
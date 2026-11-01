import React, { useEffect, useMemo, useState } from "react";
import { Box, Flex, Heading, Input, InputGroup, InputLeftElement, Select, Text } from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownIcon, ArrowUpIcon, CheckCircle2Icon, ChevronRightIcon, FlagIcon, SearchIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import { SeverityTag, severityStyles } from "../ui/SeverityTag";
import { InfoTip } from "../ui/InfoTip";
import { bySeverity, fmtDate, kindMeta, statusMeta, statuses, urgencyMeta } from "../../utils/diligence";
import { useDiligence } from "../../contexts/DiligenceContext";
import type { Severity } from "../../types/intel";
import type { Finding, FindingKind, FindingStatus } from "../../types/diligence";
type SortKey = "severity" | "id" | "identified" | "target";
interface Props {
  /** Red flags and gaps in the current scope. */
  rows: Finding[];
  /** Label for the matrix / dimension-card scope. */
  scopeLabel: string;
  onClearScope: () => void;
}
const kinds: {
  id: FindingKind;
  Icon: typeof FlagIcon;
  blurb: string;
}[] = [{
  id: "redflag",
  Icon: FlagIcon,
  blurb: "Serious anomalies, broken controls and compliance exposures."
}, {
  id: "gap",
  Icon: TriangleAlertIcon,
  blurb: "Smaller deficiencies, missing ownership and improvement opportunities."
}];

/** One findings panel for the selected scope: switch between red flags and gaps, with a single shared filter row. */
export function FindingsTable({
  rows,
  scopeLabel,
  onClearScope
}: Props) {
  const {
    openFinding,
    selectedId
  } = useDiligence();
  const reduce = useReducedMotion();
  const counts = {
    redflag: rows.filter((f) => f.kind === "redflag").length,
    gap: rows.filter((f) => f.kind === "gap").length
  };
  const [kind, setKind] = useState<FindingKind>(counts.redflag || !counts.gap ? "redflag" : "gap");
  useEffect(() => {
    setKind(counts.redflag || !counts.gap ? "redflag" : "gap");
    // Re-pick the tab only when the scope changes.
  }, [scopeLabel]); // eslint-disable-line react-hooks/exhaustive-deps
  const [q, setQ] = useState("");
  const [sev, setSev] = useState<Severity | "all">("all");
  const [status, setStatus] = useState<FindingStatus | "all">("all");
  const [sort, setSort] = useState<{
    key: SortKey;
    dir: 1 | -1;
  }>({
    key: "severity",
    dir: 1
  });
  const isFlag = kind === "redflag";
  const ofKind = rows.filter((f) => f.kind === kind);
  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = ofKind.filter((f) => (sev === "all" || f.severity === sev) && (status === "all" || f.status === status) && (!term || [f.id, f.title, f.team, f.owner, f.category, f.related, ...f.systems].join(" ").toLowerCase().includes(term)));
    const cmp: Record<SortKey, (a: Finding, b: Finding) => number> = {
      severity: bySeverity,
      id: (a, b) => a.id.localeCompare(b.id),
      identified: (a, b) => a.identified.localeCompare(b.identified),
      target: (a, b) => a.target.localeCompare(b.target)
    };
    return out.sort((a, b) => cmp[sort.key](a, b) * sort.dir);
  }, [ofKind, q, sev, status, sort]);
  const filtered = q.trim() !== "" || sev !== "all" || status !== "all";
  const reset = () => {
    setQ("");
    setSev("all");
    setStatus("all");
  };
  const sortBtn = (key: SortKey, label: string) => {
    const on = sort.key === key;
    return <button type="button" onClick={() => setSort({
      key,
      dir: on ? sort.dir === 1 ? -1 : 1 : 1
    })} className="inline-flex items-center gap-1 whitespace-nowrap hover:text-slate-200 focus:outline-none focus-visible:text-white" aria-label={`Sort by ${label}`}>
        {label}
        {on && (sort.dir === 1 ? <ArrowDownIcon size={11} /> : <ArrowUpIcon size={11} />)}
      </button>;
  };
  const ariaSort = (key: SortKey) => (sort.key === key ? sort.dir === 1 ? "ascending" : "descending" : "none") as React.AriaAttributes["aria-sort"];
  const th = "whitespace-nowrap px-3 py-2.5 text-left text-[11.5px] font-medium text-slate-400";
  const noun = kindMeta[kind].plural.toLowerCase();
  return <Box as="section" id="dil-findings" aria-labelledby="dil-findings-title" className="glass overflow-hidden rounded-2xl">
      <Flex className="flex-wrap items-center gap-2 px-5 pt-4">
        <Heading as="h3" id="dil-findings-title" className="!text-[15px] !font-semibold text-slate-100">Findings</Heading>
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/30 bg-blue-500/10 py-0.5 pl-2.5 pr-1 text-[12px] text-blue-200">
          {scopeLabel}
          <button type="button" onClick={onClearScope} aria-label="Clear scope" className="flex h-5 w-5 items-center justify-center rounded-full text-blue-300 hover:bg-blue-400/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
            <XIcon size={12} aria-hidden />
          </button>
        </span>
        <InfoTip label="Red flags and gaps">
          {kinds.map((k) => <span key={k.id} className="block [&:not(:first-child)]:mt-1.5"><span className="font-medium text-slate-100">{kindMeta[k.id].plural}:</span> {k.blurb}</span>)}
          <span className="mt-2 block text-slate-400">Classifications, risk levels and review statuses use the same finding register across all three tabs.</span>
        </InfoTip>
      </Flex>

      <Flex className="flex-col gap-3 px-5 pb-4 pt-3 lg:flex-row lg:items-center lg:justify-between">
        <Flex role="tablist" aria-label="Finding type" className="w-fit gap-1 rounded-xl border border-white/[0.08] bg-black/20 p-1">
          {kinds.map(({
          id,
          Icon
        }) => {
          const on = kind === id;
          return <button key={id} type="button" role="tab" aria-selected={on} onClick={() => setKind(id)} className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "text-white" : "text-slate-400 hover:text-slate-200"}`}>
                {on && <motion.span layoutId="dil-kind-active" className="absolute inset-0 rounded-lg border border-white/[0.12] bg-white/[0.08]" transition={reduce ? {
              duration: 0
            } : {
              type: "spring",
              stiffness: 500,
              damping: 40
            }} aria-hidden />}
                <Icon size={13} className={`relative ${on ? id === "redflag" ? "text-rose-300" : "text-amber-300" : ""}`} aria-hidden />
                <span className="relative">{kindMeta[id].plural}</span>
                <span className={`num relative rounded px-1.5 text-[11px] ${on ? "bg-white/[0.1] text-slate-100" : "bg-white/[0.05] text-slate-500"}`}>{counts[id]}</span>
              </button>;
        })}
        </Flex>

        <Flex className="flex-wrap items-center gap-2 lg:flex-nowrap">
          <InputGroup size="sm" className="!w-[210px] shrink-0">
            <InputLeftElement pointerEvents="none"><SearchIcon size={13} className="text-slate-500" /></InputLeftElement>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${noun}`} aria-label={`Search ${noun}`} className="!rounded-lg" />
          </InputGroup>
          <Box className="w-[150px] shrink-0">
            <Select size="sm" value={sev} onChange={(e) => setSev(e.target.value as Severity | "all")} aria-label="Risk level" className="!rounded-lg">
              <option value="all">All risk levels</option>
              {(["critical", "high", "medium", "low"] as Severity[]).map((s) => <option key={s} value={s}>{severityStyles[s].label}</option>)}
            </Select>
          </Box>
          <Box className="w-[150px] shrink-0">
            <Select size="sm" value={status} onChange={(e) => setStatus(e.target.value as FindingStatus | "all")} aria-label="Status" className="!rounded-lg">
              <option value="all">All statuses</option>
              {statuses.map((s) => <option key={s} value={s}>{statusMeta[s].label}</option>)}
            </Select>
          </Box>
          {filtered && <button type="button" onClick={reset} className="rounded-md px-2 py-1 text-[12px] text-slate-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Reset</button>}
        </Flex>
      </Flex>

      {shown.length === 0 ? <Flex className="mx-4 mb-4 items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] px-5 py-6 text-[13px] text-slate-400">
          <CheckCircle2Icon size={15} className="text-teal-300" aria-hidden />
          {ofKind.length === 0 ? `No open ${noun} in ${scopeLabel}.` : `No ${noun} match these filters.`}
          {filtered && <button type="button" onClick={reset} className="text-blue-300 hover:text-blue-200 focus:outline-none focus-visible:underline">Reset filters</button>}
        </Flex> : <Box className="mx-4 mb-4 overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full min-w-[960px] text-[12.5px]">
            <thead className="bg-white/[0.02]">
              <tr>
                <th scope="col" className={`${th} w-[28%]`} aria-sort={ariaSort("id")}>{sortBtn("id", isFlag ? "Red flag" : "Gap")}</th>
                <th scope="col" className={th} aria-sort={ariaSort("severity")}>{sortBtn("severity", "Risk")}</th>
                <th scope="col" className={th}>{isFlag ? "Affected" : "Topic"}</th>
                <th scope="col" className={th}>Root cause</th>
                <th scope="col" className={th}>{isFlag ? "Remediation" : "Corrective action"}</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th} aria-sort={ariaSort(isFlag ? "target" : "identified")}>{isFlag ? sortBtn("target", "Target") : sortBtn("identified", "Identified")}</th>
                <th className="w-8" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {shown.map((f) => <tr key={f.id} tabIndex={0} onClick={() => openFinding(f.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), openFinding(f.id))} aria-label={`Open ${f.id} ${f.title}`} className={`group cursor-pointer border-t border-white/[0.05] align-top transition-colors hover:bg-white/[0.03] focus:outline-none focus-visible:bg-blue-500/[0.07] ${selectedId === f.id ? "bg-blue-500/[0.06]" : ""}`}>
                  <td className="relative py-3.5 pl-4 pr-3">
                    <span className="absolute inset-y-3 left-0 w-[3px] rounded-full" style={{
                background: severityStyles[f.severity].hex
              }} aria-hidden />
                    <Text className="font-medium text-slate-100 group-hover:text-white">{f.title}</Text>
                    <Text className="mt-0.5 text-[11.5px] text-slate-500"><span className="num">{f.id}</span> · {f.related}{f.alsoArea && " · cross-functional"}</Text>
                  </td>
                  <td className="px-3 py-3">
                    <SeverityTag severity={f.severity} />
                    <Text className="mt-1 line-clamp-2 text-[11.5px] text-slate-400" title={isFlag ? undefined : f.impact}>{isFlag ? urgencyMeta[f.urgency].label : f.impact}</Text>
                  </td>
                  <td className="px-3 py-3 text-slate-300">
                    {isFlag ? <>{f.team}<Text className="text-[11.5px] text-slate-500">{f.systems.slice(0, 2).join(", ")}</Text></> : <>{f.category}<Text className="text-[11.5px] text-slate-500">{f.team}</Text></>}
                  </td>
                  <td className="max-w-[220px] px-3 py-3"><Text className="line-clamp-2 text-slate-300" title={f.rootCause}>{f.rootCause}</Text></td>
                  <td className="max-w-[240px] px-3 py-3"><Text className="line-clamp-2 text-slate-300" title={f.action}>{f.action}</Text></td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${statusMeta[f.status].chip}`}>{statusMeta[f.status].label}</span>
                    <Text className="mt-1 text-[11.5px] text-slate-400">{f.owner}</Text>
                  </td>
                  <td className="num whitespace-nowrap px-3 py-3 text-slate-400">{fmtDate(isFlag ? f.target : f.identified)}</td>
                  <td className="px-2 py-3 text-slate-600 group-hover:text-slate-300"><ChevronRightIcon size={15} aria-hidden /></td>
                </tr>)}
            </tbody>
          </table>
        </Box>}
    </Box>;
}
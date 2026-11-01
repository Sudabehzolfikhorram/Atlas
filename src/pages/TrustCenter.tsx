import React, { useState } from "react";
import { Box, Button, Flex, Select, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { ArrowDownIcon, CircleCheckIcon, CircleDashedIcon, EyeIcon, LockIcon, RefreshCwIcon } from "lucide-react";
import { Panel } from "../components/ui/Panel";
import { PageHeader } from "../components/ui/PageHeader";
import { EvidenceTag } from "../components/ui/EvidenceTag";
import { AuthorizeModal } from "../components/ui/AuthorizeModal";
import { dataSources } from "../data/dataSources";
import { accessMatrix, accessRoles, dataUsage, privacyControls, traceChains } from "../data/trust";
import { useAudit } from "../contexts/AuditContext";
import type { SourceStatus } from "../types/intel";
const statusStyle: Record<SourceStatus, {
  label: string;
  cls: string;
  dot: string;
}> = {
  synced: {
    label: "Synced",
    cls: "text-teal-300",
    dot: "bg-teal-400"
  },
  delayed: {
    label: "Delayed",
    cls: "text-amber-300",
    dot: "bg-amber-400"
  },
  error: {
    label: "Sync error",
    cls: "text-rose-300",
    dot: "bg-rose-400"
  },
  restricted: {
    label: "Restricted",
    cls: "text-violet-300",
    dot: "bg-violet-400"
  }
};
const levelStyle = {
  full: {
    label: "Full",
    cls: "bg-teal-400/15 text-teal-200"
  },
  masked: {
    label: "Masked",
    cls: "bg-violet-400/15 text-violet-200"
  },
  aggregate: {
    label: "Aggregate",
    cls: "bg-blue-400/15 text-blue-200"
  },
  none: {
    label: "None",
    cls: "bg-white/[0.03] text-slate-600"
  }
};
function qualityColor(v: number) {
  return v >= 90 ? "text-teal-300" : v >= 80 ? "text-slate-200" : "text-amber-300";
}
export function TrustCenter() {
  const [traceIdx, setTraceIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const auth = useDisclosure();
  const {
    log,
    entries
  } = useAudit();
  const toast = useToast();
  const trace = traceChains[traceIdx];
  return <Box className="space-y-6">
      <PageHeader eyebrow="Section F · Governance area" title="Data Transparency, Traceability & User Control" description="Where every insight comes from, what evidence supports it, who can see the underlying data, and how sensitive information is protected." />

      <Panel id="trust-sources" eyebrow="Data source registry" title="Connected systems" subtitle="Ownership, sync status and data quality for each source feeding Atlas.">
        <Box className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-[12.5px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500">
              <tr className="border-b border-white/[0.06]">
                <th className="py-2 pr-3 font-normal">Source</th>
                <th className="py-2 pr-3 font-normal">Owner</th>
                <th className="py-2 pr-3 font-normal">Status</th>
                <th className="py-2 pr-3 text-right font-normal">Complete</th>
                <th className="py-2 pr-3 text-right font-normal">Fresh</th>
                <th className="py-2 pr-3 text-right font-normal">Consistent</th>
                <th className="py-2 pr-3 font-normal">Sensitivity · retention</th>
                <th className="py-2 font-normal">Known limitations</th>
              </tr>
            </thead>
            <tbody>
              {dataSources.map((s) => <tr key={s.id} className="border-b border-white/[0.04] align-top">
                  <td className="py-3 pr-3">
                    <Text className="font-medium text-slate-100">{s.name}</Text>
                    <Text className="text-[11px] text-slate-500">{s.records} · {s.datasets.slice(0, 2).join(", ")}</Text>
                  </td>
                  <td className="py-3 pr-3 text-slate-300">{s.owner}</td>
                  <td className="py-3 pr-3">
                    <Flex className={`items-center gap-1.5 ${statusStyle[s.status].cls}`}><span className={`h-1.5 w-1.5 rounded-full ${statusStyle[s.status].dot}`} />{statusStyle[s.status].label}</Flex>
                    <Text className="text-[11px] text-slate-500">{s.lastSync}</Text>
                  </td>
                  <td className={`num py-3 pr-3 text-right ${qualityColor(s.completeness)}`}>{s.completeness}%</td>
                  <td className={`num py-3 pr-3 text-right ${qualityColor(s.freshness)}`}>{s.freshness}%</td>
                  <td className={`num py-3 pr-3 text-right ${qualityColor(s.consistency)}`}>{s.consistency}%</td>
                  <td className="py-3 pr-3">
                    <Text className={s.sensitivity === "Restricted" ? "text-violet-300" : "text-slate-300"}>{s.sensitivity}</Text>
                    <Text className="text-[11px] text-slate-500">{s.retention}</Text>
                  </td>
                  <td className="max-w-[240px] py-3 text-[12px] text-slate-400">
                    {s.limitations}
                    {s.status === "error" && <Button size="xs" variant="ghost" leftIcon={<RefreshCwIcon size={11} />} className="!ml-1 !h-6" onClick={() => {
                  log({
                    category: "Governance",
                    action: "Retried source sync",
                    target: s.name
                  });
                  toast({
                    title: `Retrying ${s.name} sync`,
                    status: "info",
                    duration: 2000,
                    position: "bottom-right"
                  });
                }}>
                        Retry
                      </Button>}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </Box>
      </Panel>

      <Box className="grid gap-6 xl:grid-cols-2">
        <Panel eyebrow="Evidence traceability" title="Where did this insight come from?" actions={<Select aria-label="Choose insight" value={traceIdx} onChange={(e) => setTraceIdx(Number(e.target.value))} className="!w-56">
              {traceChains.map((t, i) => <option key={t.insight} value={i}>{t.insight}</option>)}
            </Select>}>
          <Box as="ol" className="space-y-1">
            {trace.chain.map((c, i) => <Box as="li" key={c.label}>
                <Flex className="items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                  <Box>
                    <Text className="text-[10.5px] uppercase tracking-wider text-slate-500">{c.level}</Text>
                    <Text className="text-[13px] text-slate-200">{c.label}</Text>
                  </Box>
                  <EvidenceTag status={c.status} />
                </Flex>
                {i < trace.chain.length - 1 && <Flex className="justify-center py-0.5"><ArrowDownIcon size={12} className="text-slate-600" /></Flex>}
              </Box>)}
          </Box>
        </Panel>

        <Panel eyebrow="Access & permissions" title="Who can see what" subtitle="Effective visibility by role. Changes require Governance Officer approval.">
          <Box className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-[12px]">
              <thead>
                <tr>
                  <th className="pb-2 text-left font-normal text-slate-500">Resource</th>
                  {accessRoles.map((r) => <th key={r} className="pb-2 text-center font-normal text-slate-500">{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {accessMatrix.map((row) => <tr key={row.resource}>
                    <td className="py-1 pr-2 text-slate-300">{row.resource}</td>
                    {row.levels.map((l, i) => <td key={i} className="p-0.5 text-center">
                        <span className={`block rounded-md px-1 py-1 text-[11px] ${levelStyle[l].cls}`}>{levelStyle[l].label}</span>
                      </td>)}
                  </tr>)}
              </tbody>
            </table>
          </Box>
          <Flex className="mt-4 items-center justify-between gap-3 rounded-xl border border-violet-400/20 bg-violet-400/[0.05] p-3">
            <Box>
              <Flex className="items-center gap-1.5 text-[13px] font-medium text-slate-100"><LockIcon size={13} className="text-violet-300" />Sensitive record: ATN-104 email pattern</Flex>
              <Text className="mt-0.5 text-[12px] text-slate-400">
                {revealed ? "Sender role: Field Supervisor (FS-2291) · Recipient: accruals@ mailbox · 9 occurrences" : "Identities masked. Viewing requires justification and is logged."}
              </Text>
            </Box>
            {!revealed && <Button size="xs" leftIcon={<EyeIcon size={12} />} onClick={auth.onOpen}>Request view</Button>}
          </Flex>
        </Panel>
      </Box>

      <Box className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Panel eyebrow="Data usage transparency" title="Which data each analysis uses — and why">
          <Box as="ul" className="space-y-2.5">
            {dataUsage.map((u) => <Box as="li" key={u.analysis} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <Text className="text-[13px] font-medium text-slate-100">{u.analysis}</Text>
                <Flex className="mt-1.5 flex-wrap gap-1">
                  {u.categories.map((c) => <span key={c} className="rounded bg-blue-400/10 px-1.5 py-0.5 text-[11px] text-blue-200">{c}</span>)}
                </Flex>
                <Text className="mt-1.5 text-[12px] text-slate-400">{u.why}</Text>
                <Text className="mt-1 text-[11px] text-slate-500">Never used for: {u.excluded}</Text>
              </Box>)}
          </Box>
        </Panel>
        <Box className="space-y-6">
          <Panel eyebrow="Privacy controls" title="Sensitive-data handling">
            <Box as="ul" className="space-y-3">
              {privacyControls.map((p) => <Flex as="li" key={p.title} className="gap-2.5">
                  {p.active ? <CircleCheckIcon size={15} className="mt-0.5 shrink-0 text-teal-300" /> : <CircleDashedIcon size={15} className="mt-0.5 shrink-0 text-amber-300" />}
                  <Box>
                    <Text className="text-[13px] text-slate-100">{p.title}</Text>
                    <Text className="text-[12px] text-slate-400">{p.detail}</Text>
                  </Box>
                </Flex>)}
            </Box>
          </Panel>
          <Panel eyebrow="Audit trail" title="Latest governance activity">
            <Box as="ul" className="space-y-2.5">
              {entries.filter((e) => e.category === "Access" || e.category === "Governance").slice(0, 4).map((e) => <Box as="li" key={e.id} className="border-l border-white/10 pl-3">
                  <Text className="text-[12.5px] text-slate-200">{e.action} · <span className="text-slate-400">{e.target}</span></Text>
                  <Text className="text-[11px] text-slate-500">{e.actor} · {e.id}</Text>
                </Box>)}
            </Box>
          </Panel>
        </Box>
      </Box>

      <AuthorizeModal isOpen={auth.isOpen} onClose={auth.onClose} title="Access restricted data" description="You are requesting to view identities in a masked communication pattern." consequences={["Access is time-limited to this session", "The Data Governance Officer is notified", "Your justification is stored in the audit trail"]} confirmLabel="View with justification" onConfirm={(note) => {
      auth.onClose();
      setRevealed(true);
      log({
        category: "Access",
        action: "Viewed restricted identities",
        target: "ATN-104 email pattern",
        detail: note || "No justification provided"
      });
    }} />
    </Box>;
}
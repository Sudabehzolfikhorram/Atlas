import React, { useState } from "react";
import { Box, Button, ButtonGroup, Flex, Text, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { DownloadIcon, MessageSquareIcon, ShieldAlertIcon, TriangleAlertIcon, UploadIcon } from "lucide-react";
import { useAudit } from "../contexts/AuditContext";
import { downloadCsv } from "../utils/exportCsv";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "../components/ui/PageHeader";
import { useScreenInit } from "../useScreenInit.js";
import { Panel } from "../components/ui/Panel";
import { EvidenceTag } from "../components/ui/EvidenceTag";
import { ConfidenceMeter } from "../components/ui/ConfidenceMeter";
import { ProgressBar } from "../components/ui/ProgressBar";
import { KpiCard } from "../components/process/KpiCard";
import { WorkflowSankey } from "../components/process/WorkflowSankey";
import { DependencyMatrix } from "../components/process/DependencyMatrix";
import { anomalies, bottleneckFindings, complianceRows, cycleTrend, processKpis, processOptions, stageDelays, trendTargets, type ProcessKey } from "../data/processMetrics";
const tooltipStyle = {
  background: "rgba(12,18,32,0.8)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 12,
  color: "#E2E8F0"
};
const anomalyIcon = {
  "Communication pattern": MessageSquareIcon,
  "Process deviation": TriangleAlertIcon,
  "Operational risk": ShieldAlertIcon
};
export function ProcessIntelligence() {
  const screenInit = useScreenInit();
  const [proc, setProc] = useState<ProcessKey>(screenInit?.proc as ProcessKey ?? "p2p");
  const navigate = useNavigate();
  const kpis = processKpis[proc];
  const toast = useToast();
  const {
    log
  } = useAudit();
  const exportResults = () => {
    const label = processOptions.find((p) => p.key === proc)?.label ?? proc;
    downloadCsv(`process-intelligence-${proc}.csv`, [["Process", label], ["Note", "Illustrative demonstration data"], [], ["Metric", "Value", "Unit", "Change", "Target", "Source", "Records", "Method"], ...kpis.map((k) => [k.label, k.value, k.unit, k.delta, k.target, k.source, k.records, k.method])]);
    log({
      category: "Investigation",
      action: "Exported process intelligence results",
      target: label
    });
    toast({
      title: "Results exported",
      description: `${label} · CSV downloaded`,
      status: "success",
      duration: 2800,
      position: "bottom-right"
    });
  };
  return <Box className="space-y-6">
      <PageHeader eyebrow="Section B · Current state" title="Current-State Process Intelligence" description="How North Basin actually operates, reconstructed from ERP, CMMS, HSE, email and chat metadata. Click any metric to trace it to its source records." actions={<Flex className="flex-wrap items-center gap-2">
            <Button variant="outline" leftIcon={<UploadIcon size={14} />} onClick={() => navigate("/trust")}>
              Import evidence
            </Button>
            <Button variant="primary" leftIcon={<DownloadIcon size={14} />} onClick={exportResults}>
              Export results
            </Button>
          </Flex>} />

      <Flex className="overflow-x-auto">
        <ButtonGroup size="sm" isAttached role="group" aria-label="Select process">
          {processOptions.map((p) => <Button key={p.key} onClick={() => setProc(p.key)} aria-pressed={proc === p.key} className={proc === p.key ? "!bg-white/[0.12] !text-white" : "!text-slate-400"}>
              {p.label}
            </Button>)}
        </ButtonGroup>
      </Flex>

      <Box className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => <KpiCard key={k.label} kpi={k} />)}
      </Box>

      <Box className="grid gap-6 xl:grid-cols-5">
        <Panel className="xl:col-span-3" eyebrow="Process performance" title="Cycle time vs documented target" subtitle="Weekly average, days. Source: ERP & CMMS event logs." actions={<EvidenceTag status="verified" />}>
          <Box className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cycleTrend} margin={{
              top: 10,
              right: 10,
              left: -18,
              bottom: 0
            }}>
                <defs />
                <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="week" tick={{
                fill: "#64748B",
                fontSize: 11
              }} axisLine={false} tickLine={false} />
                <YAxis tick={{
                fill: "#64748B",
                fontSize: 11
              }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine y={trendTargets[proc]} stroke="#2DD4BF" strokeDasharray="4 4" label={{
                value: `Target ${trendTargets[proc]}d`,
                fill: "#2DD4BF",
                fontSize: 11,
                position: "insideTopRight"
              }} />
                <Area type="monotone" dataKey={proc} name="Avg. days" stroke="#60A5FA" strokeWidth={2} fill="#3B82F6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Panel>

        <Panel id="process-stage-wait" className="xl:col-span-2" eyebrow="Bottleneck detection" title="Average wait by P2P stage" subtitle="Hours. Stages over 48h flagged.">
          <Box className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageDelays} layout="vertical" margin={{
              top: 0,
              right: 16,
              left: 20,
              bottom: 0
            }}>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" horizontal={false} />
                <XAxis type="number" tick={{
                fill: "#64748B",
                fontSize: 11
              }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={{
                fill: "#94A3B8",
                fontSize: 11
              }} axisLine={false} tickLine={false} width={92} />
                <Tooltip contentStyle={tooltipStyle} cursor={{
                fill: "rgba(255,255,255,0.03)"
              }} />
                <Bar dataKey="hours" radius={[0, 4, 4, 0]} barSize={14}>
                  {stageDelays.map((s) => <Cell key={s.stage} fill={s.hours > 48 ? "#FBBF24" : "#3B82F6"} fillOpacity={s.hours > 48 ? 0.9 : 0.6} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Panel>
      </Box>

      <Box className="grid gap-6 xl:grid-cols-5">
        <Panel className="xl:col-span-3" eyebrow="Organizational workflow mapping" title="How requests move between departments" subtitle="Cases per week flowing from requesting departments through approval to delivery." actions={<EvidenceTag status="verified" />}>
          <WorkflowSankey />
          <Flex className="mt-2 flex-wrap gap-4 text-[11px] text-slate-400">
            <Flex className="items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-blue-400" />Standard flow</Flex>
            <Flex className="items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-amber-400" />Approval stage</Flex>
            <Flex className="items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-rose-400" />Returned / rework</Flex>
          </Flex>
        </Panel>

        <Panel className="xl:col-span-2" eyebrow="Bottleneck detection" title="Structural inefficiencies">
          <Box as="ul" className="space-y-2.5">
            {bottleneckFindings.map((b) => <Box as="li" key={b.text} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <Flex className="items-center justify-between gap-2">
                  <Text className="text-[11px] font-medium uppercase tracking-wider text-amber-300/90">{b.type}</Text>
                  <EvidenceTag status={b.status} compact />
                </Flex>
                <Text className="mt-1 text-[13px] text-slate-200">{b.text}</Text>
                <Text className="mt-0.5 text-[11px] text-slate-500">{b.cases}</Text>
              </Box>)}
          </Box>
        </Panel>
      </Box>

      <Box className="grid gap-6 xl:grid-cols-2">
        <Panel id="process-compliance" eyebrow="Process compliance" title="Observed conformance to documented workflows" subtitle="Share of cases following the approved process path. Coverage shows how much of the process is observable in data.">
          <Box as="ul" className="space-y-4">
            {complianceRows.map((r) => <Box as="li" key={r.process}>
                <Flex className="items-baseline justify-between">
                  <Text className="text-[13px] text-slate-200">{r.process}</Text>
                  <Text className="num text-[13px] text-white">
                    {r.conformance}%<span className="ml-2 text-[11px] text-slate-500">{r.deviations} deviations</span>
                  </Text>
                </Flex>
                <Box className="relative mt-1.5">
                  <ProgressBar value={r.conformance} color={r.conformance >= 85 ? "bg-teal-400" : r.conformance >= 70 ? "bg-blue-400" : "bg-amber-400"} label={`${r.process} conformance`} />
                  <span className="absolute -top-0.5 h-2.5 w-px bg-white/60" style={{
                left: "85%"
              }} aria-hidden />
                </Box>
                <Text className={`mt-1 text-[11px] ${r.coverage < 75 ? "text-amber-300/80" : "text-slate-500"}`}>
                  Observational coverage {r.coverage}%{r.coverage < 75 ? " — limited evidence; not an indication of non-compliance" : ""}
                </Text>
              </Box>)}
          </Box>
          <Text className="mt-4 text-[11px] text-slate-500">White marker = 85% documented conformance target.</Text>
        </Panel>

        <Panel id="process-dependencies" eyebrow="Cross-department dependencies" title="Where one team's delay becomes another's" subtitle="Hours of downstream delay per week. Select a cell for the explanation." actions={<EvidenceTag status="inferred" />}>
          <DependencyMatrix />
        </Panel>
      </Box>

      <Panel id="process-anomalies" eyebrow="AI-detected anomalies" title="Unusual patterns supported by available evidence" subtitle="Chat and email are analysed as metadata only — message content is masked by privacy policy.">
        <Box className="grid gap-3 md:grid-cols-2">
          {anomalies.map((a) => {
          const Icon = anomalyIcon[a.kind as keyof typeof anomalyIcon];
          return <Flex key={a.id} className="gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <Flex className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-400/10 text-blue-300">
                  <Icon size={15} />
                </Flex>
                <Box className="min-w-0 flex-1">
                  <Flex className="flex-wrap items-center gap-2">
                    <Text className="text-[11px] text-slate-500">{a.id} · {a.kind} · {a.when}</Text>
                    <EvidenceTag status={a.status} />
                  </Flex>
                  <Text className="mt-1 text-[14px] font-medium text-slate-100">{a.title}</Text>
                  <Text className="mt-0.5 text-[12px] leading-relaxed text-slate-400">{a.detail}</Text>
                  <Box className="mt-2"><ConfidenceMeter value={a.confidence} /></Box>
                </Box>
              </Flex>;
        })}
        </Box>
      </Panel>
    </Box>;
}
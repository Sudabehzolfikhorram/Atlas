import React, { useState } from "react";
import { Box, Button, Flex, Text, useToast } from "@chakra-ui/react";
import { ArrowDownIcon, ArrowRightIcon, CalendarPlusIcon, CircleCheckIcon as CheckCircle2Icon, ShieldCheckIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { EvidenceTag } from "../components/ui/EvidenceTag";
import { SeverityTag } from "../components/ui/SeverityTag";
import { LineageFlow } from "../components/governance/LineageFlow";
import { deferredByAsset, governanceGaps, nextControls, productionHandoffs, productionKpis } from "../data/governance";
import { useAudit } from "../contexts/AuditContext";
import { currentUser } from "../data/currentUser";
import { ProposedSolutionSection } from "../components/governance/ProposedSolutionSection";
import type { PilotReviewRecord } from "../components/governance/PilotReview";
const tooltipStyle = {
  background: "rgba(12,18,32,0.8)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 12,
  color: "#E2E8F0"
};
export function GovernanceLineage() {
  const [controlId, setControlId] = useState("C-01");
  const [scheduled, setScheduled] = useState<Set<string>>(new Set());
  const {
    log
  } = useAudit();
  const toast = useToast();
  const [reviews, setReviews] = useState<Record<string, PilotReviewRecord>>({});
  const control = nextControls.find((c) => c.id === controlId) ?? nextControls[0];
  const recordReview = (stage: PilotReviewRecord["stage"], note: string) => {
    setReviews((p) => ({
      ...p,
      [control.id]: {
        stage,
        note,
        by: currentUser.name,
        at: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit"
        })
      }
    }));
    log({
      category: stage === "pilot" ? "Approval" : "Governance",
      action: stage === "pilot" ? "Approved design for pilot" : "Requested design revisions",
      target: `${control.id} · ${control.name}`,
      detail: note || undefined
    });
    toast({
      title: stage === "pilot" ? "Design approved for pilot" : "Revisions recorded",
      description: "Recorded in the audit trail · implementation not scheduled by this decision",
      status: "success",
      duration: 2800,
      position: "bottom-right"
    });
  };
  const reopenReview = () => {
    setReviews((p) => {
      const next = {
        ...p
      };
      delete next[control.id];
      return next;
    });
    log({
      category: "Governance",
      action: "Reopened pilot review",
      target: `${control.id} · ${control.name}`
    });
  };
  const goToSolution = () => document.getElementById("proposed-solution")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
  const schedule = () => {
    setScheduled((p) => new Set(p).add(control.id));
    log({
      category: "Governance",
      action: "Scheduled control implementation",
      target: control.name,
      detail: `Addresses ${control.gaps.join(", ")}`
    });
    toast({
      title: "Control added to Operational Planning",
      status: "success",
      duration: 2500,
      position: "bottom-right"
    });
  };
  return <Box className="space-y-6">
      <PageHeader eyebrow="Section J · Operational governance" title="Production, Lineage, Governance Gaps & Next Control" description="Connecting production performance to the data that reports it, the gaps that weaken it, and the concrete control that closes each gap." />

      <Panel id="gov-production" eyebrow="1 · Production intelligence" title="Production workflow performance" subtitle="Field operations, maintenance and supply chain dependencies affecting output.">
        <Box className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {productionKpis.map((k) => <Box key={k.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <Text className="text-[12px] text-slate-400">{k.label}</Text>
              <Text className={`num mt-1 text-[24px] font-medium ${k.tone}`}>{k.value}<span className="ml-1 text-[12px] text-slate-500">{k.unit}</span></Text>
              <Text className="text-[11px] text-slate-500">{k.note}</Text>
            </Box>)}
        </Box>
        <Box className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Box>
            <Text className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">Deferred volume by cause, bbl/d (estimate)</Text>
            <Box className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deferredByAsset} margin={{
                top: 4,
                right: 8,
                left: -16,
                bottom: 0
              }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                  <XAxis dataKey="asset" tick={{
                  fill: "#94A3B8",
                  fontSize: 10.5
                }} axisLine={false} tickLine={false} />
                  <YAxis tick={{
                  fill: "#64748B",
                  fontSize: 10.5
                }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{
                  fill: "rgba(255,255,255,0.03)"
                }} />
                  <Legend wrapperStyle={{
                  fontSize: 11,
                  color: "#94A3B8"
                }} />
                  <Bar dataKey="maintenance" name="Maintenance delay" stackId="a" fill="#3B82F6" fillOpacity={0.75} />
                  <Bar dataKey="supply" name="Parts / supply chain" stackId="a" fill="#FBBF24" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
          <Box>
            <Text className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">Operational handoffs</Text>
            <Box as="ul" className="space-y-2">
              {productionHandoffs.map((h) => <Box as="li" key={h.text} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <Flex className="items-center gap-1.5 text-[12px] text-slate-300">
                    {h.from} <ArrowRightIcon size={11} className="text-slate-500" /> {h.to}
                    <Box className="ml-auto"><EvidenceTag status={h.status} compact /></Box>
                  </Flex>
                  <Flex className="mt-1 justify-between text-[12px]">
                    <Text className="text-slate-400">{h.text}</Text>
                    <Text className="num text-slate-200">{h.delay}</Text>
                  </Flex>
                </Box>)}
            </Box>
          </Box>
        </Box>
      </Panel>

      <Panel id="gov-lineage" eyebrow="2 · Data lineage" title="Daily production volumes: from meter to regulatory filing" subtitle="Origin, movement, transformation and downstream dependencies of a critical data element." actions={<EvidenceTag status="verified" />}>
        <LineageFlow />
      </Panel>

      <Box className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        <Panel id="gov-gaps" eyebrow="3 · Governance gaps" title="Identified gaps" subtitle="Select a gap to see the control that addresses it.">
          <Box as="ul" className="space-y-2">
            {governanceGaps.map((g) => {
            const active = g.controlId === controlId;
            return <Box as="li" key={g.id}>
                  <button onClick={() => setControlId(g.controlId)} className={`w-full rounded-xl border p-3 text-left transition-colors ${active ? "border-blue-400/40 bg-blue-500/[0.06]" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.14]"}`}>
                    <Flex className="items-center gap-2">
                      <Text className="num text-[11px] text-slate-500">{g.id}</Text>
                      <SeverityTag severity={g.severity} />
                      <Text className="text-[11px] text-slate-500">{g.type}</Text>
                      <Box className="ml-auto"><EvidenceTag status={g.status} compact /></Box>
                    </Flex>
                    <Text className="mt-1 text-[13px] font-medium text-slate-100">{g.title}</Text>
                    <Flex className="mt-0.5 justify-between text-[11px]">
                      <Text className="text-slate-500">{g.area}</Text>
                      <Text className={active ? "text-blue-300" : "text-slate-500"}>→ {g.controlId}</Text>
                    </Flex>
                  </button>
                </Box>;
          })}
          </Box>
        </Panel>

        <Box as="section" aria-labelledby="next-control" className="glass rounded-2xl !border-teal-300/30 p-5">
          <Flex className="items-center gap-2">
            <ShieldCheckIcon size={16} className="text-teal-300" />
            <Text className="text-[11px] font-medium uppercase tracking-[0.08em] text-teal-300">4 · Next control to implement</Text>
          </Flex>
          <Flex className="mt-3 flex-wrap gap-1.5">
            {nextControls.map((c) => <button key={c.id} onClick={() => setControlId(c.id)} className={`rounded-md px-2 py-1 text-[11px] font-medium ${c.id === controlId ? "bg-teal-400/15 text-teal-200" : "bg-white/[0.04] text-slate-400 hover:text-slate-200"}`}>
                {c.id}
              </button>)}
          </Flex>
          <Text as="h3" id="next-control" className="mt-3 text-[18px] font-semibold leading-snug text-white">{control.name}</Text>
          <Text className="mt-1.5 text-[13px] leading-relaxed text-slate-400">{control.description}</Text>

          <Box className="mt-4 grid gap-4 sm:grid-cols-2">
            <Box><Text className="text-[11px] uppercase tracking-wider text-slate-500">Addresses</Text><Text className="mt-0.5 text-[13px] text-amber-200">{control.gaps.join(", ")}</Text></Box>
            <Box><Text className="text-[11px] uppercase tracking-wider text-slate-500">Responsible owner</Text><Text className="mt-0.5 text-[13px] text-slate-200">{control.owner}</Text></Box>
            <Box><Text className="text-[11px] uppercase tracking-wider text-slate-500">Priority · effort</Text><Text className="mt-0.5 text-[13px] text-slate-200">{control.priority} · {control.effort}</Text></Box>
            <Box><Text className="text-[11px] uppercase tracking-wider text-slate-500">Dependencies</Text>{control.dependencies.map((d) => <Text key={d} className="mt-0.5 text-[12px] text-slate-400">{d}</Text>)}</Box>
          </Box>

          <Box className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <Text className="text-[11px] uppercase tracking-wider text-slate-500">Evidence required for completion</Text>
            <Box as="ul" className="mt-1.5 space-y-1">
              {control.evidenceRequired.map((e) => <Flex as="li" key={e} className="items-center gap-2 text-[12.5px] text-slate-300"><CheckCircle2Icon size={12} className="text-slate-500" />{e}</Flex>)}
            </Box>
          </Box>
          <Box className="mt-3 grid gap-3 sm:grid-cols-2">
            <Box className="rounded-xl bg-teal-400/[0.06] p-3"><Text className="text-[11px] uppercase tracking-wider text-teal-300/80">Expected outcome</Text><Text className="mt-0.5 text-[13px] text-slate-100">{control.outcome}</Text></Box>
            <Box className="rounded-xl bg-white/[0.03] p-3"><Text className="text-[11px] uppercase tracking-wider text-slate-500">Verification method</Text><Text className="mt-0.5 text-[13px] text-slate-200">{control.verification}</Text></Box>
          </Box>
          <Flex className="mt-5 flex-wrap items-center justify-end gap-2">
            <Button variant="outline" rightIcon={<ArrowDownIcon size={13} />} onClick={goToSolution}>
              Review proposed solution
            </Button>
            <Button variant="approve" leftIcon={<CalendarPlusIcon size={13} />} onClick={schedule} isDisabled={scheduled.has(control.id)}>
              {scheduled.has(control.id) ? "Scheduled" : "Schedule implementation"}
            </Button>
          </Flex>
        </Box>
      </Box>

      <ProposedSolutionSection control={control} reviews={reviews} scheduled={scheduled.has(control.id)} onSelectControl={setControlId} onRecord={recordReview} onReopen={reopenReview} />
    </Box>;
}
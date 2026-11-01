import React from "react";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, DownloadIcon, FlagIcon, InfoIcon, ShieldCheckIcon, TargetIcon, TriangleAlertIcon, UserIcon } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { DecisionApprovalCard, statusMeta, urgencyRank, urgencyTone } from "../components/report/DecisionApprovalCard";
import { ReportHealthPanels } from "../components/report/ReportHealthPanels";
import { evidenceGaps, executiveSummary, priorityActions, verifiedFindings } from "../data/report";
import { decisions } from "../data/decisions";
import { useAudit } from "../contexts/AuditContext";
export function ExecutiveReport() {
  const navigate = useNavigate();
  const {
    decisionStatus
  } = useAudit();
  const sorted = [...decisions].sort((a, b) => (urgencyRank[a.urgency] ?? 9) - (urgencyRank[b.urgency] ?? 9));
  const statusOf = (id: string) => decisionStatus[id] ?? "pending";
  const pending = sorted.filter((d) => statusOf(d.id) === "pending");
  const first = pending[0];
  const decideToday = pending.filter((d) => d.urgency === "Decide today").length;
  const review = () => navigate("/");
  const glance = [{
    label: "Awaiting your approval",
    value: pending.length,
    note: `of ${decisions.length} decisions`,
    cls: "text-amber-300"
  }, {
    label: "Due today",
    value: decideToday,
    note: "decisions",
    cls: decideToday ? "text-rose-300" : "text-slate-300"
  }, {
    label: "Verified findings",
    value: verifiedFindings.length,
    note: "backed by records",
    cls: "text-teal-300"
  }, {
    label: "Evidence gaps",
    value: evidenceGaps.length,
    note: "still unresolved",
    cls: "text-amber-200"
  }];
  return <Box className="space-y-8">
      <PageHeader eyebrow="Section G · Management assessment" title="Executive Process & Data Governance Report" description="Q3 2026 · Upstream North Basin. Separates what is confirmed from what remains unresolved, and lists the decisions that need management approval." actions={<Button leftIcon={<DownloadIcon size={14} />}>Export PDF</Button>} />

      {/* 1 · Summary */}
      <Box as="section" id="report-summary" aria-labelledby="rep-summary" className="glass grid gap-6 rounded-3xl p-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:p-7">
        <Box>
          <StepLabel n={1} text="Executive summary" />
          <Heading as="h2" id="rep-summary" className="mt-2 !text-[20px] !font-semibold tracking-tight text-white">Current state in brief</Heading>
          <Text className="mt-3 text-[15px] leading-relaxed text-slate-300">{executiveSummary}</Text>
          <Flex className="mt-4 items-start gap-2 rounded-xl border border-blue-400/20 bg-blue-500/[0.05] px-3 py-2.5">
            <InfoIcon size={14} className="mt-0.5 shrink-0 text-blue-300" aria-hidden />
            <Text className="text-[12px] leading-relaxed text-slate-300">
              Every assessment shows its evidence status. <span className="font-medium text-white">Lack of evidence is not interpreted as evidence of non-compliance</span> — low-coverage areas are listed as evidence gaps.
            </Text>
          </Flex>
        </Box>
        <Box className="grid grid-cols-2 gap-3 self-start">
          {glance.map((g) => <Box key={g.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
              <Text className={`num text-[30px] font-medium leading-none ${g.cls}`}>{g.value}</Text>
              <Text className="mt-2 text-[12.5px] font-medium text-slate-200">{g.label}</Text>
              <Text className="text-[11.5px] text-slate-500">{g.note}</Text>
            </Box>)}
        </Box>
      </Box>

      {/* 2 · Start here */}
      {first && <Box as="section" aria-labelledby="rep-first" className="glass rounded-3xl !border-amber-300/30 p-6">
          <Flex className="flex-col gap-5 lg:flex-row lg:items-center">
            <Box className="min-w-0 flex-1">
              <StepLabel n={2} text="Do this first" tone="text-amber-300" />
              <Flex className="mt-2 flex-wrap items-center gap-2">
                <span className={`rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${urgencyTone(first.urgency)}`}>{first.urgency}</span>
                <Text className="num text-[11px] text-slate-500">{first.id}</Text>
                <Text className={`text-[12px] font-medium ${statusMeta.pending.cls}`}>{statusMeta.pending.label}</Text>
              </Flex>
              <Heading as="h2" id="rep-first" className="mt-2 !text-[19px] !font-semibold leading-snug tracking-tight text-white">{first.title}</Heading>
              <Flex className="mt-3 flex-wrap gap-x-6 gap-y-2 text-[13px]">
                <Flex className="items-center gap-1.5 text-slate-300"><UserIcon size={13} className="text-slate-500" aria-hidden />{first.decisionMaker.name} · {first.decisionMaker.role}</Flex>
                <Flex className="items-center gap-1.5 text-slate-300"><FlagIcon size={13} className="text-slate-500" aria-hidden />Next step: <span className="text-slate-100">{first.nextStep}</span></Flex>
              </Flex>
            </Box>
            <Button variant="primary" size="lg" rightIcon={<ArrowRightIcon size={15} />} onClick={review} className="shrink-0">Review & decide</Button>
          </Flex>
        </Box>}

      {/* 3 · Decisions */}
      <Box as="section" aria-labelledby="rep-decisions">
        <SectionHead n={3} id="rep-decisions" title="Decisions requiring your approval" subtitle="Ordered by urgency. Impacts are estimates until validated." action={<Button size="sm" variant="outline" onClick={review}>Decide on Overview</Button>} />
        <Box className="grid gap-4 lg:grid-cols-2">
          {sorted.map((d) => <DecisionApprovalCard key={d.id} decision={d} status={statusOf(d.id)} onReview={review} />)}
        </Box>
      </Box>

      {/* 4 · Priority actions */}
      <Box as="section" aria-labelledby="rep-actions">
        <SectionHead n={4} id="rep-actions" title="Priority actions" subtitle="Deserving executive attention, in priority order." />
        <Box as="ol" className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {priorityActions.map((a, i) => <Box as="li" key={a.text} className={`glass flex flex-col rounded-2xl p-4 ${i === 0 ? "!border-blue-300/30" : ""}`}>
              <Flex className="items-center justify-between">
                <span className={`num flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-medium ${i < 2 ? "bg-blue-500/20 text-blue-200" : "bg-white/[0.06] text-slate-300"}`}>{i + 1}</span>
                <TargetIcon size={14} className={i < 2 ? "text-blue-300" : "text-slate-600"} aria-hidden />
              </Flex>
              <Text className="mt-3 text-[13.5px] font-medium leading-snug text-slate-100">{a.text}</Text>
              <Flex className="mt-auto items-center gap-1.5 pt-3 text-[11.5px] text-slate-400"><UserIcon size={12} aria-hidden />{a.owner}</Flex>
            </Box>)}
        </Box>
      </Box>

      {/* 5 · Findings */}
      <Box as="section" aria-labelledby="rep-findings">
        <SectionHead n={5} id="rep-findings" title="What we know — and what we don't" subtitle="Confirmed findings are kept separate from unresolved questions." />
        <Box className="grid gap-4 lg:grid-cols-2">
          <FindingList tone="teal" icon={<ShieldCheckIcon size={15} />} title="Verified findings" note="Supported by sufficient source records" items={verifiedFindings} />
          <FindingList tone="amber" icon={<TriangleAlertIcon size={15} />} title="Evidence gaps" note="Unresolved — not evidence of non-compliance" items={evidenceGaps} />
        </Box>
      </Box>

      {/* 6 · Supporting */}
      <Box as="section" id="report-health" aria-labelledby="rep-health" className="rounded-3xl">
        <SectionHead n={6} id="rep-health" title="Supporting context" subtitle="Process maturity, governance foundations and risk." />
        <ReportHealthPanels />
      </Box>
    </Box>;
}
function StepLabel({
  n,
  text,
  tone = "text-blue-300"




}: {n: number;text: string;tone?: string;}) {
  return <Flex className={`items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em] ${tone}`}>
      <span className="num flex h-5 w-5 items-center justify-center rounded-full border border-current/30 bg-white/[0.04] text-[10.5px]">{n}</span>
      {text}
    </Flex>;
}
function SectionHead({
  n,
  id,
  title,
  subtitle,
  action






}: {n: number;id: string;title: string;subtitle: string;action?: React.ReactNode;}) {
  return <Flex className="mb-4 flex-wrap items-end justify-between gap-3">
      <Flex className="items-start gap-3">
        <span className="num mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[11px] text-slate-400" aria-hidden>{n}</span>
        <Box>
          <Heading as="h2" id={id} className="!text-[18px] !font-semibold tracking-tight text-white">{title}</Heading>
          <Text className="mt-0.5 text-[13px] text-slate-400">{subtitle}</Text>
        </Box>
      </Flex>
      {action}
    </Flex>;
}
function FindingList({
  tone,
  icon,
  title,
  note,
  items






}: {tone: "teal" | "amber";icon: React.ReactNode;title: string;note: string;items: string[];}) {
  const c = tone === "teal" ? {
    border: "!border-teal-300/25",
    text: "text-teal-300",
    bar: "border-teal-400/40"
  } : {
    border: "!border-amber-300/25",
    text: "text-amber-300",
    bar: "border-amber-400/40"
  };
  return <Box className={`glass rounded-2xl p-5 ${c.border}`}>
      <Flex className={`items-center gap-2 text-[14px] font-semibold ${c.text}`}>{icon}{title}<span className="num ml-1 text-[12px] font-normal text-slate-500">{items.length}</span></Flex>
      <Text className="mt-0.5 text-[11.5px] text-slate-500">{note}</Text>
      <Box as="ul" className="mt-4 space-y-2.5">
        {items.map((f) => <Text as="li" key={f} className={`border-l-2 pl-3 text-[13px] leading-relaxed text-slate-300 ${c.bar}`}>{f}</Text>)}
      </Box>
    </Box>;
}
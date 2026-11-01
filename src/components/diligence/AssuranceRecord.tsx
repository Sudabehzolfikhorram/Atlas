import React from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, BanIcon, CheckIcon, ExternalLinkIcon, HistoryIcon, RotateCcwIcon, SparklesIcon } from "lucide-react";
import { SeverityTag } from "../ui/SeverityTag";
import { BasisChip } from "./FindingDrawer";
import { WorkflowStatus } from "./WorkflowStatus";
import { VerificationSummary } from "./VerificationSummary";
import { decisionMeta, fmtDate, fmtDateTime, kindMeta } from "../../utils/diligence";
import { closureLabel, closureReady, planMeta, validationMeta, verificationMeta, wfOf } from "../../utils/workflow";
import { diligenceUrl, qanUrl } from "../../utils/qanLinks";
import type { Finding, ReviewState, ReviewSubject } from "../../types/diligence";
import type { PendingDecision } from "./ReviewDecisionModal";
interface Props {
  f: Finding;
  review: ReviewState;
  onDecide: (p: PendingDecision) => void;
  onOpenFinding: (id: string) => void;
}
function Block({
  title,
  tone,
  children




}: {title: string;tone: "teal" | "blue" | "violet";children: React.ReactNode;}) {
  const t = {
    teal: "border-teal-400/25 text-teal-300",
    blue: "border-blue-400/25 text-blue-300",
    violet: "border-violet-400/25 text-violet-300"
  }[tone];
  return <Box className={`rounded-xl border bg-white/[0.015] p-3.5 ${t.split(" ")[0]}`}>
      <Text className={`text-[11.5px] font-semibold uppercase tracking-[0.06em] ${t.split(" ")[1]}`}>{title}</Text>
      <Box className="mt-2 space-y-1.5 text-[12.5px] text-slate-200">{children}</Box>
    </Box>;
}
interface BarProps {
  f: Finding;
  subject: ReviewSubject;
  question: string;
  chip: {
    label: string;
    chip: string;
  };
  tone: "pending" | "ok" | "bad" | "idle";
  review: ReviewState;
  /** Shown instead of actions when the decision isn't available yet. */
  blocked?: React.ReactNode;
  canDecide: boolean;
  canReopen: boolean;
  labels: [string, string];
  onDecide: Props["onDecide"];
}
function DecisionBar({
  f,
  subject,
  question,
  chip,
  tone,
  review,
  blocked,
  canDecide,
  canReopen,
  labels,
  onDecide
}: BarProps) {
  const last = review.history.find((h) => h.subject === subject);
  const go = (action: PendingDecision["action"]) => onDecide({
    id: f.id,
    title: f.title,
    subject,
    action
  });
  const box = {
    pending: "border-amber-400/30 bg-amber-400/[0.04]",
    ok: "border-teal-400/30 bg-teal-400/[0.05]",
    bad: "border-rose-400/45 bg-rose-500/[0.07]",
    idle: "border-white/[0.08] bg-white/[0.02]"
  }[tone];
  return <Box className={`rounded-xl border p-3.5 ${box}`}>
      <Flex className="flex-wrap items-center gap-2">
        <Text className="text-[13px] font-medium text-slate-100">{question}</Text>
        <span className={`ml-auto rounded-md border px-2 py-0.5 text-[11.5px] ${chip.chip}`}>{chip.label}</span>
      </Flex>
      {last && <Text className="mt-1.5 text-[11.5px] text-slate-400">
          {last.label ?? decisionMeta[last.decision].label} · {last.reviewer} · {fmtDateTime(last.at)}{last.comment && <> — <span className="text-slate-300">“{last.comment}”</span></>}
        </Text>}
      {canDecide ? <Flex className="mt-2.5 flex-wrap gap-2">
          <Button size="sm" variant="primary" leftIcon={<CheckIcon size={13} />} onClick={() => go("accepted")}>{labels[0]}</Button>
          <Button size="sm" variant="outline" className="!border-rose-400/40 !text-rose-300 hover:!bg-rose-500/10" leftIcon={<BanIcon size={13} />} onClick={() => go("rejected")}>{labels[1]}</Button>
        </Flex> : blocked ? <Box className="mt-2 text-[11.5px] text-slate-500">{blocked}</Box> : null}
      {canReopen && <Button size="xs" variant="ghost" className="!mt-2" leftIcon={<RotateCcwIcon size={12} />} onClick={() => go("reopen")}>Reopen for reassessment</Button>}
    </Box>;
}

/** Assurance record: the reviewer's three separate decisions plus the evidence behind them. */
export function AssuranceRecord({
  f,
  review,
  onDecide,
  onOpenFinding
}: Props) {
  const navigate = useNavigate();
  const w = wfOf(f);
  const rejected = w.validation === "rejected";
  const link = (label: string, to: string) => <button type="button" onClick={() => navigate(to)} className="inline-flex items-center gap-1 text-blue-300 hover:underline focus:outline-none focus-visible:underline">{label}<ArrowRightIcon size={11} aria-hidden /></button>;
  const planBlocked = w.validation !== "accepted" ? rejected ? "Not applicable — the finding was rejected and is excluded from remediation queues." : "Accept the finding first; the plan is decided separately." : w.plan === "not_submitted" || w.plan === "changes" ? <>Waiting for Diligence to {w.plan === "changes" ? "revise and resubmit" : "submit"} the plan. {link("Open in Diligence", diligenceUrl(f.area, f.id))}</> : null;
  const closureBlocked = rejected ? "Not applicable — rejected. Remediation and verification are blocked." : w.closed ? null : w.validation !== "accepted" ? "Closure needs an accepted finding first." : w.plan !== "approved" ? "Closure needs the current remediation plan to be approved." : w.verification === "failed" ? <span className="text-rose-300">Verification failed — closure is blocked until remediation is verified again.</span> : w.verification === "not_tested" ? <>Closure needs a passed verification test (now: Not tested). {link("Open Quality Control", qanUrl(f.area, "quality", f.id))}</> : null;
  return <Box className="space-y-4">
      <Box>
        <Flex className="flex-wrap items-center gap-2 text-[11.5px] text-slate-500">
          <span className={`rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${kindMeta[f.kind].chip}`}>{kindMeta[f.kind].label}</span>
          <span className="num">{f.id}</span> · {f.team} · {f.area === "data" ? "Data" : "Process"}
        </Flex>
        <Flex className="mt-1.5 items-start justify-between gap-3">
          <Text className={`text-[18px] font-semibold leading-snug ${rejected ? "text-slate-400 line-through decoration-rose-400/60" : "text-white"}`}>{f.title}</Text>
          {rejected && <span className="shrink-0 rounded-md border-2 border-rose-400/70 bg-rose-500/15 px-2.5 py-1 text-[13px] font-bold text-rose-300">Rejected</span>}
        </Flex>
        <Text className="mt-1 text-[13px] text-slate-300">{f.summary}</Text>
        <Flex className="mt-2 flex-wrap items-center gap-3 text-[11.5px] text-slate-500">
          <SeverityTag severity={f.severity} />
          <span>Detected {fmtDateTime(f.detection.at)}</span>
          <button type="button" onClick={() => onOpenFinding(f.id)} className="inline-flex items-center gap-1 text-blue-300 hover:underline">Full finding<ExternalLinkIcon size={11} /></button>
        </Flex>
      </Box>

      <WorkflowStatus f={f} />

      <Box className="space-y-2">
        <DecisionBar f={f} review={review} subject="finding" question="1 · Is the finding valid?" chip={validationMeta[w.validation]} tone={w.validation === "pending" ? "pending" : w.validation === "accepted" ? "ok" : "bad"} canDecide={w.validation === "pending"} canReopen={w.validation !== "pending" && !w.closed} labels={["Accept", "Reject"]} onDecide={onDecide} />
        <DecisionBar f={f} review={review} subject="remediation" question="2 · Approve the remediation plan?" chip={planMeta[w.plan]} tone={w.plan === "pending" && w.validation === "accepted" ? "pending" : w.plan === "approved" ? "ok" : w.plan === "changes" ? "bad" : "idle"} blocked={planBlocked} canDecide={w.validation === "accepted" && w.plan === "pending" && !w.closed} canReopen={w.validation === "accepted" && (w.plan === "approved" || w.plan === "changes") && !w.closed && w.execution === "not_started"} labels={["Approve plan", "Request changes"]} onDecide={onDecide} />
        {!rejected && <VerificationSummary f={f} />}
        <DecisionBar f={f} review={review} subject="closure" question="3 · Approve closure?" chip={w.closed ? {
        label: closureLabel(f),
        chip: "border-teal-400/35 bg-teal-400/10 text-teal-300"
      } : verificationMeta[w.verification]} tone={w.closed ? "ok" : closureReady(w) ? "pending" : w.verification === "failed" ? "bad" : "idle"} blocked={closureBlocked} canDecide={closureReady(w)} canReopen={w.closed} labels={["Approve closure", "Return for more work"]} onDecide={onDecide} />
      </Box>

      <Block title="Verified facts" tone="teal">
        {f.facts.map((x) => <Text key={x}>• {x}</Text>)}
        {f.evidence.filter((e) => e.basis === "verified").map((e) => <Flex key={e.ref} className="items-center gap-2 text-[12px] text-slate-400"><span className="num">{e.ref}</span>{e.label}</Flex>)}
      </Block>

      <Block title="Inferred causes" tone="blue">
        <Flex className="items-start gap-2"><Text className="flex-1">{f.rootCause}</Text><BasisChip basis={f.rootCauseBasis} /></Flex>
      </Block>

      <Block title="Proposed remediation plan" tone="violet">
        <Flex className="items-start gap-2"><SparklesIcon size={13} className="mt-0.5 shrink-0 text-violet-300" aria-hidden /><Text>{f.action}</Text></Flex>
        <Text className="text-[12px] text-slate-400">Owner: {f.owner} ({f.ownerRole}) · expected by {fmtDate(f.target)}</Text>
        <Text className="text-[11.5px] text-slate-500">Owner and plan are edited in Diligence. {link("Open in Diligence", diligenceUrl(f.area, f.id))}</Text>
      </Block>

      <Box className="border-t border-white/[0.06] pt-3">
        <Flex className="items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-slate-400"><HistoryIcon size={12} aria-hidden />Decision history</Flex>
        <Box as="ol" className="mt-2 space-y-1.5">
          {review.history.length ? review.history.map((h, i) => <Flex as="li" key={i} className="items-start gap-2 text-[12px]">
              <span className={`mt-0.5 shrink-0 rounded border px-1.5 text-[10.5px] ${decisionMeta[h.decision].chip}`}>{h.decision === "pending" ? "Reopened" : h.decision === "accepted" ? "Approved" : "Declined"}</span>
              <Text className="text-slate-300">
                {h.label ?? (h.subject === "finding" ? "Finding" : "Remediation")} · {h.reviewer} · <span className="num text-slate-500">{fmtDateTime(h.at)}</span>
                {h.comment && <span className="block text-slate-400">Reason: “{h.comment}”</span>}
              </Text>
            </Flex>) : <Text className="text-[12px] text-slate-500">No decisions yet. Assigned reviewer: {f.reviewer}.</Text>}
        </Box>
      </Box>
    </Box>;
}
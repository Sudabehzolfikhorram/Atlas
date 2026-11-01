import React, { useState } from "react";
import { Box, Button, Flex, Heading, Select, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2Icon, CircleIcon, FlaskConicalIcon, PlayIcon, RotateCcwIcon, ShieldCheckIcon, WrenchIcon, XCircleIcon } from "lucide-react";
import { DemoTag, WorkflowStatus } from "./WorkflowStatus";
import { useDiligence } from "../../contexts/DiligenceContext";
import { demoFindingId, demoRule, verificationSamples } from "../../data/demoScenario";
import { fmtDateTime } from "../../utils/diligence";
import { pct, remediationAllowed, wfOf } from "../../utils/workflow";
import { diligenceUrl, qanUrl } from "../../utils/qanLinks";
import type { CheckRun } from "../../types/diligence";
const money = (n: number) => `$${n.toLocaleString("en-US")}`;
const time = (iso: string) => new Date(iso).toLocaleString("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC"
});

/** Repeatable end-to-end demo: baseline check, simulated remediation, verification. Quality Control only runs checks. */
export function DemoScenarioPanel({
  highlight


}: {highlight?: boolean;}) {
  const navigate = useNavigate();
  const {
    getFinding,
    runs,
    linked,
    runBaseline,
    simulateRemediation,
    runVerification,
    attachEvent,
    resetDemo,
    openFinding,
    verifySampleId: sampleId,
    setVerifySampleId: setSampleId
  } = useDiligence();
  const f = getFinding(demoFindingId)!;
  const w = wfOf(f);
  const rejected = w.validation === "rejected";
  const [shownId, setShownId] = useState<string | null>(null);
  const shown: CheckRun | undefined = runs.find((r) => r.id === shownId) ?? runs[runs.length - 1];
  const linkedIds = new Set((linked[demoFindingId] ?? []).map((e) => e.eventId));
  const baselineDone = runs.some((r) => r.kind === "baseline");
  const canSimulate = remediationAllowed(w) && w.execution !== "ready";
  const canVerify = remediationAllowed(w) && w.execution === "ready";
  const steps = [{
    label: "Diligence: identify",
    done: true
  }, {
    label: "Assurance: accept finding",
    done: w.validation === "accepted"
  }, {
    label: "Assurance: approve plan",
    done: w.plan === "approved"
  }, {
    label: "QC: baseline check",
    done: baselineDone
  }, {
    label: "Simulate remediation",
    done: w.execution === "ready" || w.verification === "passed" || w.closed
  }, {
    label: "Run verification",
    done: w.verification === "passed" || w.closed
  }, {
    label: "Assurance: approve closure",
    done: w.closed
  }];
  const openViolation = (run: CheckRun, eventId: string) => {
    attachEvent(run.id, eventId);
    openFinding(demoFindingId);
  };
  const result = shown && <Box role="status" aria-live="polite" className={`rounded-xl border px-3.5 py-2.5 text-[12.5px] ${shown.passed === shown.evaluated ? "border-teal-400/30 bg-teal-400/[0.06] text-teal-100" : "border-rose-400/35 bg-rose-500/[0.07] text-rose-100"}`}>
      <Flex className="flex-wrap items-center gap-2">
        <DemoTag />
        <span className="font-medium">
          {shown.kind === "baseline" ? "Pre-remediation check" : "Post-remediation verification"} {shown.id} on sample {shown.sampleId}: {shown.passed} of {shown.evaluated} purchase orders compliant ({pct(shown.passed, shown.evaluated)}%)
        </span>
      </Flex>
      <Text className="mt-1 text-[11.5px] opacity-80">
        {shown.kind === "verification" ? shown.passed === shown.evaluated ? `All ${shown.evaluated} POs in ${shown.sampleId} passed rule ${shown.ruleId}. Closure still needs reviewer approval in Assurance.` : `${shown.evaluated - shown.passed} of ${shown.evaluated} POs in ${shown.sampleId} failed rule ${shown.ruleId}. F-01 stays open and remediation returns to In progress.` : `${shown.evaluated - shown.passed} of ${shown.evaluated} POs in ${shown.sampleId} failed. Select one to link it to F-01 as an occurrence.`} This result describes this sample only — not other purchase orders or the organization.
      </Text>
    </Box>;
  return <Box as="section" aria-labelledby="demo-title" className={`glass rounded-2xl ${highlight ? "ring-1 ring-blue-400/50" : ""}`}>
      <Flex className="flex-wrap items-start gap-3 border-b border-white/[0.06] px-5 py-4">
        <Box className="min-w-0 flex-1">
          <Flex className="flex-wrap items-center gap-2">
            <FlaskConicalIcon size={15} className="text-amber-300" aria-hidden />
            <Heading as="h3" id="demo-title" className="!text-[15px] !font-semibold text-slate-100">Purchase approval outside the formal workflow</Heading>
            <DemoTag />
          </Flex>
          <Text className="mt-1 text-[12.5px] text-slate-400">
            <button type="button" onClick={() => openFinding(demoFindingId)} className="num text-blue-300 hover:underline">{demoFindingId}</button> · {f.title} · checks run on fixed sample records; no system is read or changed
          </Text>
        </Box>
        <Button size="sm" variant="ghost" leftIcon={<RotateCcwIcon size={13} />} onClick={() => {
        resetDemo();
        setShownId(null);
      }}>Reset demo</Button>
      </Flex>

      <Box className="space-y-4 p-5">
        <Box as="ol" className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 xl:grid-cols-7" aria-label="Scenario progress">
          {steps.map((s, i) => <Flex as="li" key={s.label} className={`items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11.5px] ${s.done ? "border-teal-400/25 text-teal-200" : "border-white/[0.07] text-slate-400"}`}>
              {s.done ? <CheckCircle2Icon size={13} className="shrink-0 text-teal-300" aria-hidden /> : <CircleIcon size={13} className="shrink-0 text-slate-600" aria-hidden />}
              <span className="num text-slate-500">0{i + 1}</span>
              <span className="truncate" title={s.label}>{s.label}</span>
            </Flex>)}
        </Box>

        <WorkflowStatus f={f} />

        {rejected && <Flex className="items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/[0.07] px-3.5 py-2.5 text-[12.5px] text-rose-200">
            <XCircleIcon size={14} aria-hidden />F-01 is Rejected. Checks, remediation and verification are blocked; its history is kept. Use Reset demo to start again.
          </Flex>}

        <Box className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5 text-[12.5px]">
          <Text className="text-[11px] text-slate-500">Tested rule · <span className="num">{demoRule.id}</span></Text>
          <Text className="mt-0.5 text-slate-100">{demoRule.text}</Text>
        </Box>

        <Box className="grid gap-3 lg:grid-cols-3">
          <Box className="rounded-xl border border-white/[0.07] p-3.5">
            <Text className="text-[12.5px] font-medium text-slate-100">1 · Baseline</Text>
            <Text className="mt-0.5 text-[11.5px] text-slate-500">Sample S-BASE-10 · 10 POs, Sep 2026</Text>
            <Button size="sm" variant="primary" className="!mt-3" leftIcon={<PlayIcon size={13} />} onClick={() => {
            const r = runBaseline();
            if (r) setShownId(r.id);
          }} isDisabled={w.closed || rejected}>Run simulated pre-remediation check</Button>
          </Box>
          <Box className="rounded-xl border border-white/[0.07] p-3.5">
            <Text className="text-[12.5px] font-medium text-slate-100">2 · Remediation</Text>
            <Text className="mt-0.5 text-[11.5px] text-slate-500">{rejected ? "Blocked — the finding is rejected." : remediationAllowed(w) ? "Simulates the ERP approval gate. No system is changed." : "Unlocks after the finding is accepted and the current plan is approved in Assurance."}</Text>
            <Flex className="mt-3 flex-wrap gap-2">
              <Button size="sm" variant="outline" leftIcon={<WrenchIcon size={13} />} onClick={simulateRemediation} isDisabled={!canSimulate}>Simulate remediation</Button>
              {!rejected && !remediationAllowed(w) && !w.closed && <Button size="sm" variant="ghost" leftIcon={<ShieldCheckIcon size={13} />} onClick={() => navigate(qanUrl("process", "assurance", demoFindingId))}>Go to Assurance</Button>}
            </Flex>
          </Box>
          <Box className="rounded-xl border border-white/[0.07] p-3.5">
            <Text as="label" htmlFor="demo-sample" className="text-[12.5px] font-medium text-slate-100">3 · Verification</Text>
            <Select id="demo-sample" size="sm" value={sampleId} onChange={(e) => setSampleId(e.target.value)} className="!mt-1.5 !rounded-lg">
              {verificationSamples.map((s) => <option key={s.id} value={s.id}>{s.id} · {s.label}</option>)}
            </Select>
            <Button size="sm" variant="primary" className="!mt-2" leftIcon={<PlayIcon size={13} />} onClick={() => {
            const r = runVerification(sampleId);
            if (r) setShownId(r.id);
          }} isDisabled={!canVerify}>Run simulated verification</Button>
            {!canVerify && !w.closed && <Text className="mt-1.5 text-[11px] text-slate-500">{rejected ? "Blocked — the finding is rejected." : "Available once remediation is ready for verification under an approved plan."}</Text>}
          </Box>
        </Box>

        {w.verification === "passed" && !w.closed && remediationAllowed(w) && <Flex className="flex-wrap items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/[0.06] px-3.5 py-2.5 text-[12.5px] text-blue-100">
            Verification passed — send it to Assurance for the closure decision.
            <Button size="xs" variant="primary" className="ml-auto" onClick={() => navigate(qanUrl("process", "assurance", demoFindingId))}>Review closure</Button>
          </Flex>}
        {w.closed && <Flex className="items-center gap-2 rounded-xl border border-teal-400/30 bg-teal-400/[0.06] px-3.5 py-2.5 text-[12.5px] text-teal-100"><CheckCircle2Icon size={14} aria-hidden />F-01 resolved in the demo scenario (sample data — simulated execution). Use Reset demo to run it again.</Flex>}

        {result}

        {shown && <Box className="overflow-x-auto rounded-xl border border-white/[0.07]">
            <Flex className="flex-wrap items-center gap-2 border-b border-white/[0.06] px-3.5 py-2 text-[11.5px] text-slate-400">
              <span>Run {shown.id} · {shown.sampleId} · executed {fmtDateTime(shown.ranAt)}</span>
              {runs.length > 1 && <Select size="xs" value={shown.id} onChange={(e) => setShownId(e.target.value)} aria-label="Show run" className="!ml-auto !w-[150px] !rounded-md">
                  {runs.map((r) => <option key={r.id} value={r.id}>{r.id} · {r.kind === "baseline" ? "Baseline" : "Verification"}</option>)}
                </Select>}
            </Flex>
            <table className="w-full min-w-[640px] text-[12.5px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.06em] text-slate-500">
                  <th scope="col" className="px-3.5 py-2 font-medium">Purchase order</th>
                  <th scope="col" className="px-3 py-2 font-medium">Supplier</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Amount</th>
                  <th scope="col" className="px-3 py-2 font-medium">Approval (UTC)</th>
                  <th scope="col" className="px-3 py-2 font-medium">Sent (UTC)</th>
                  <th scope="col" className="px-3.5 py-2 font-medium">Result</th>
                </tr>
              </thead>
              <tbody>
                {shown.rows.map((r) => {
              const isLinked = linkedIds.has(r.eventId);
              return <tr key={r.eventId} className={`border-t border-white/[0.05] ${r.pass ? "" : "bg-rose-500/[0.04]"}`}>
                      <td className="num px-3.5 py-2 text-slate-100">{r.po}</td>
                      <td className="px-3 py-2 text-slate-300">{r.supplier}</td>
                      <td className="num px-3 py-2 text-right text-slate-300">{money(r.amount)}</td>
                      <td className="num px-3 py-2 text-slate-300">{time(r.approvedAt)}</td>
                      <td className="num px-3 py-2 text-slate-300">{time(r.sentAt)}</td>
                      <td className="px-3.5 py-2">
                        {r.pass ? <span className="inline-flex items-center gap-1 text-teal-300"><CheckCircle2Icon size={13} aria-hidden />Pass</span> : <button type="button" onClick={() => openViolation(shown, r.eventId)} className="inline-flex items-center gap-1.5 rounded-md text-rose-300 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label={`Fail: ${r.po}. Open ${demoFindingId} and link this violation`}>
                            <XCircleIcon size={13} aria-hidden />Fail · {isLinked ? `occurrence of ${demoFindingId}` : `link to ${demoFindingId}`}
                          </button>}
                      </td>
                    </tr>;
            })}
              </tbody>
            </table>
          </Box>}

        <Text className="text-[11.5px] text-slate-500">
          Diligence prepares the plan ({<button type="button" onClick={() => navigate(diligenceUrl("process", demoFindingId))} className="text-blue-300 hover:underline">open</button>}), Assurance decides, Quality Control runs the checks. Fixed samples give the same results every run. Reset demo restores F-01, all check runs, the default verification sample ({verificationSamples[0].id}) and the simulated monitoring feed.
        </Text>
      </Box>
    </Box>;
}
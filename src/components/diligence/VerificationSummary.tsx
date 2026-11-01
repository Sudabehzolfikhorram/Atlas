import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { CheckCircle2Icon, FlaskConicalIcon, XCircleIcon } from "lucide-react";
import { DemoTag } from "./WorkflowStatus";
import { useDiligence } from "../../contexts/DiligenceContext";
import { demoFindingId, demoRule } from "../../data/demoScenario";
import { fmtDateTime } from "../../utils/diligence";
import { pct, wfOf } from "../../utils/workflow";
import type { Finding } from "../../types/diligence";

/** Verification evidence shown to the reviewer before the closure decision. */
export function VerificationSummary({
  f


}: {f: Finding;}) {
  const {
    runs
  } = useDiligence();
  const w = wfOf(f);
  if (f.id !== demoFindingId) {
    return <Box className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
        <Text className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-slate-400">Verification details</Text>
        <Text className="mt-1.5 text-[12.5px] text-slate-400">No verification test is defined for this finding in the demo, so there are no results to review and closure is not available.</Text>
      </Box>;
  }
  const verifications = runs.filter((r) => r.kind === "verification" && r.findingId === f.id);
  const latest = verifications[verifications.length - 1];
  const baseline = [...runs].reverse().find((r) => r.kind === "baseline");
  const fails = latest?.rows.filter((r) => !r.pass) ?? [];
  const ok = !!latest && latest.passed === latest.evaluated;
  return <Box as="section" aria-label="Verification details" className={`rounded-xl border p-3.5 ${!latest ? "border-white/[0.08] bg-white/[0.02]" : ok ? "border-teal-400/30 bg-teal-400/[0.04]" : "border-rose-400/35 bg-rose-500/[0.05]"}`}>
      <Flex className="flex-wrap items-center gap-2">
        <FlaskConicalIcon size={13} className="text-amber-300" aria-hidden />
        <Text className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-slate-300">Verification details</Text>
        <DemoTag />
      </Flex>
      <Text className="mt-2 text-[12px] text-slate-400">Rule <span className="num text-slate-300">{demoRule.id}</span> · {demoRule.text}</Text>
      {!latest ? <Text className="mt-2 text-[12.5px] text-slate-400">No post-remediation verification has been run yet{w.execution === "ready" ? "." : " — remediation must be ready for verification first."}</Text> : <>
          <Box className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Fact label="Result" value={<span className={`inline-flex items-center gap-1 ${ok ? "text-teal-300" : "text-rose-300"}`}>{ok ? <CheckCircle2Icon size={13} aria-hidden /> : <XCircleIcon size={13} aria-hidden />}{ok ? "Passed" : "Failed"}</span>} />
            <Fact label="Compliant" value={<span className="num">{latest.passed} / {latest.evaluated} · {pct(latest.passed, latest.evaluated)}%</span>} />
            <Fact label="Sample" value={<span className="num" title={latest.sampleLabel}>{latest.sampleId}</span>} />
            <Fact label="Run" value={<span className="num">{latest.id}</span>} />
          </Box>
          <Text className="mt-2 text-[11.5px] text-slate-500">
            {latest.sampleLabel} · executed {fmtDateTime(latest.ranAt)}
            {baseline && <> · baseline {baseline.id}: {baseline.passed}/{baseline.evaluated} ({pct(baseline.passed, baseline.evaluated)}%) on {baseline.sampleId}</>}
            {verifications.length > 1 && <> · {verifications.length} verification runs in total</>}
          </Text>
          {fails.length > 0 && <Box as="ul" className="mt-2 space-y-1">
              {fails.map((r) => <Flex as="li" key={r.eventId} className="items-center gap-2 text-[12px] text-rose-200"><XCircleIcon size={12} aria-hidden />{r.po} · sent before approval was recorded</Flex>)}
            </Box>}
          {w.verification === "not_tested" && <Text className="mt-2 text-[11.5px] text-amber-300">This result predates the latest reassessment and no longer counts — run verification again.</Text>}
          <Text className="mt-2 text-[11.5px] text-slate-500">Describes sample {latest.sampleId} only, not other purchase orders or the organization.</Text>
        </>}
    </Box>;
}

function Fact({
  label,
  value



}: {label: string;value: React.ReactNode;}) {
  return <Box className="rounded-lg border border-white/[0.07] bg-black/10 px-2.5 py-2">
      <Text className="text-[10.5px] text-slate-500">{label}</Text>
      <Box className="mt-0.5 text-[12.5px] font-medium text-slate-100">{value}</Box>
    </Box>;
}
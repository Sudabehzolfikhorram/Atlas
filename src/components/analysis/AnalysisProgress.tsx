import React from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { CheckCircle2Icon, CheckIcon, FlaskConicalIcon, Loader2Icon } from "lucide-react";
import { analysisStages } from "../../data/analysis";
import type { AnalysisRun } from "../../types/analysis";
import { formatDateTime } from "../../utils/catalog";
interface Props {
  run: AnalysisRun;
  onCancel: () => void;
}

/** Progress of a (simulated) analysis run, shown as an overlay on Process Health. */
export function AnalysisProgressPanel({
  run,
  onCancel
}: Props) {
  const n = analysisStages.length;
  const done = run.status === "completed";
  const pct = Math.round(run.progress);
  const stage = done ? n : Math.min(n - 1, Math.floor(run.progress / (100 / n)));
  const count = run.inputs.length;
  return <Box as="section" aria-label={`Analysis run ${run.runId}`} className="analysis-panel glass-strong w-full max-w-[880px] overflow-hidden rounded-3xl border">
      <Flex className="flex-wrap items-center gap-3 border-b border-white/[0.06] px-5 py-4 lg:px-6">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${done ? "bg-teal-400/15 text-teal-300" : "bg-blue-500/15 text-blue-300"}`} aria-hidden>
          {done ? <CheckCircle2Icon size={18} /> : <Loader2Icon size={18} className="animate-spin" />}
        </span>
        <Box className="min-w-0 flex-1">
          <Flex className="flex-wrap items-center gap-2">
            <Text as="h2" className="text-[16px] font-semibold text-white">
              {done ? `Analysis complete · ${count} input${count === 1 ? "" : "s"}` : `Analyzing ${count} selected input${count === 1 ? "" : "s"}`}
            </Text>
            <span className="inline-flex items-center gap-1 rounded-md border border-violet-400/30 bg-violet-400/10 px-1.5 py-0.5 text-[11px] font-medium text-violet-200">
              <FlaskConicalIcon size={11} aria-hidden />Simulated processing · demo
            </span>
          </Flex>
          <Text className="text-[12px] text-slate-500">Run {run.runId} · started {formatDateTime(run.startedAt)}</Text>
        </Box>
        {!done && <Button variant="outline" size="sm" onClick={onCancel}>Cancel analysis</Button>}
      </Flex>

      <Box className="px-5 py-4 lg:px-6">
        <Flex className="items-baseline justify-between gap-3" role="status" aria-live="polite">
          <Text className="text-[13px] font-medium text-slate-200">{done ? "Updating Process Health with the new results…" : analysisStages[stage].activeText}</Text>
          <Text className="num shrink-0 text-[12px] text-slate-400">{done ? "100% · complete" : `${pct}% · stage ${stage + 1} of ${n}`}</Text>
        </Flex>
        <Box className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-label="Analysis progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <Box className={`h-full rounded-full transition-[width] duration-150 ${done ? "bg-teal-400" : "bg-blue-500"}`} style={{
          width: `${pct}%`
        }} />
        </Box>

        <Box as="ol" className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {analysisStages.map((s, i) => {
          const state = i < stage ? "done" : i === stage ? "active" : "pending";
          return <Flex as="li" key={s.id} aria-current={state === "active" ? "step" : undefined} className={`items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${state === "done" ? "border-teal-400/25 bg-teal-400/[0.05]" : state === "active" ? "border-blue-400/40 bg-blue-500/[0.07]" : "border-white/[0.06] bg-white/[0.02]"}`}>
                <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${state === "done" ? "bg-teal-400/15 text-teal-300" : state === "active" ? "bg-blue-500/20 text-blue-300" : "border border-white/10 text-slate-500"}`} aria-hidden>
                  {state === "done" ? <CheckIcon size={13} /> : state === "active" ? <Loader2Icon size={13} className="animate-spin" /> : <span className="num">{i + 1}</span>}
                </span>
                <Box className="min-w-0">
                  <Text className={`text-[13px] font-medium ${state === "pending" ? "text-slate-400" : "text-slate-100"}`}>
                    {s.title}
                    <span className="sr-only"> — {state === "done" ? "completed" : state === "active" ? "in progress" : "not started"}</span>
                  </Text>
                  <Text className={`text-[12px] ${state === "done" ? "text-teal-300" : "text-slate-500"}`}>{state === "done" ? run.summaries[i] : s.description}</Text>
                </Box>
              </Flex>;
        })}
        </Box>

        <Flex className="mt-3 items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[12px] text-slate-400">
          <CheckCircle2Icon size={13} className="mt-0.5 shrink-0 text-slate-500" aria-hidden />
          {done ? <Text>Run {run.runId} results replace Run {run.previousRunId}. Figures come from simulated processing and are illustrative.</Text> : <Text>Behind this panel: <span className="font-medium text-slate-200">previous results</span> (Run {run.previousRunId}). They're replaced only when this run completes.</Text>}
        </Flex>
      </Box>
    </Box>;
}
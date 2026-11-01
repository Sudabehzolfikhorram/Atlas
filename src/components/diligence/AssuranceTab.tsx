import React, { useEffect, useMemo, useState } from "react";
import { Box, Flex, Heading, Select, Text } from "@chakra-ui/react";
import { InfoIcon, ListChecksIcon } from "lucide-react";
import { AssuranceRecord } from "./AssuranceRecord";
import { ReviewDecisionModal, type PendingDecision } from "./ReviewDecisionModal";
import { useDiligence, reviewOf } from "../../contexts/DiligenceContext";
import { departments } from "../../data/diligence";
import { bySeverity, kindMeta } from "../../utils/diligence";
import { closureLabel, isRejected, planMeta, reviewerTask, wfOf, type ReviewerTask } from "../../utils/workflow";
import { severityStyles } from "../ui/SeverityTag";
import type { Severity } from "../../types/intel";
import type { Department, DiligenceArea, Finding } from "../../types/diligence";
type QueueMode = "needs" | "all" | "rejected";
const taskChip: Record<ReviewerTask, {
  label: string;
  chip: string;
}> = {
  finding: {
    label: "Validate finding",
    chip: "border-amber-400/35 bg-amber-400/10 text-amber-300"
  },
  remediation: {
    label: "Approve plan",
    chip: "border-amber-400/35 bg-amber-400/10 text-amber-300"
  },
  closure: {
    label: "Approve closure",
    chip: "border-blue-400/35 bg-blue-400/10 text-blue-300"
  }
};
function stateChip(f: Finding) {
  const t = reviewerTask(f);
  if (t) return taskChip[t];
  const w = wfOf(f);
  if (w.validation === "rejected") return {
    label: "Rejected",
    chip: "border-rose-400/50 bg-rose-500/15 text-rose-300 font-semibold"
  };
  if (w.closed) return {
    label: closureLabel(f),
    chip: "border-teal-400/35 bg-teal-400/10 text-teal-300"
  };
  if (w.plan !== "approved") return planMeta[w.plan];
  return {
    label: w.verification === "failed" ? "Verification failed" : "In remediation",
    chip: "border-violet-400/35 bg-violet-400/10 text-violet-300"
  };
}

const modeFor = (f: Finding): QueueMode => isRejected(f) ? "rejected" : reviewerTask(f) ? "needs" : "all";

/** Reviewer decisions: finding validity, plan approval and closure. Rejected findings leave the action queue. */
export function AssuranceTab({
  area,
  focusId,
  onSelect






}: {area: DiligenceArea; /** Finding to select on arrival (from another page). */focusId?: string | null; /** Reports the reviewer's selection so the page URL keeps the context. */onSelect?: (id: string) => void;}) {
  const {
    findings,
    reviews,
    decide,
    reopen,
    openFinding
  } = useDiligence();
  const focused = focusId ? findings.find((x) => x.id === focusId && x.area === area) : undefined;
  const [mode, setMode] = useState<QueueMode>(() => focused ? modeFor(focused) : "needs");
  const [sev, setSev] = useState<Severity | "all">("all");
  const [team, setTeam] = useState<Department | "all">("all");
  const [activeId, setActiveId] = useState<string | null>(focused?.id ?? null);
  const [pending, setPending] = useState<PendingDecision | null>(null);
  const inScope = findings.filter((f) => f.area === area);
  // Arriving with (or switching to) a focused finding: select exactly that finding and a queue that lists it.
  useEffect(() => {
    if (!focused || focused.id === activeId) return;
    setActiveId(focused.id);
    setMode((m) => m === "all" ? m : modeFor(focused));
    setSev("all");
    setTeam("all");
  }, [focused?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const select = (id: string) => {
    setActiveId(id);
    onSelect?.(id);
  };

  const queue = useMemo(() => inScope.filter((f) => (mode === "needs" ? reviewerTask(f) !== null : mode === "rejected" ? isRejected(f) : true) && (sev === "all" || f.severity === sev) && (team === "all" || f.team === team)).sort((a, b) => Number(!reviewerTask(a)) - Number(!reviewerTask(b)) || Number(isRejected(a)) - Number(isRejected(b)) || bySeverity(a, b)), [inScope, mode, sev, team]);
  // Keep the selected finding shown even after a decision moves it out of the current queue.
  const active = inScope.find((f) => f.id === activeId);
  useEffect(() => {
    if (!active && queue[0]) setActiveId(queue[0].id);
  }, [active, queue]);
  const needCount = inScope.filter((f) => reviewerTask(f)).length;
  const confirm = (comment: string) => {
    if (!pending) return;
    if (pending.action === "reopen") reopen(pending.id, pending.subject, comment);else decide(pending.id, pending.subject, pending.action, comment);
    setPending(null);
  };
  return <Box className="space-y-5">
      <Flex className="items-start gap-2.5 rounded-xl border border-blue-400/25 bg-blue-500/[0.06] px-4 py-2.5 text-[12.5px] text-slate-300">
        <InfoIcon size={14} className="mt-0.5 shrink-0 text-blue-300" aria-hidden />
        Assurance makes three separate decisions: is the finding valid, is the plan approved, and can it close. Decisions update shared sample records and are logged with reviewer, time and reason.
      </Flex>

      <Box className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Box as="section" aria-labelledby="dil-queue" className="glass flex flex-col rounded-2xl">
          <Box className="px-5 pb-3 pt-4">
            <Flex className="items-center gap-2">
              <ListChecksIcon size={15} className="text-blue-300" aria-hidden />
              <Heading as="h3" id="dil-queue" className="!text-[15px] !font-semibold text-slate-100">Review queue</Heading>
              <span className="num ml-auto text-[12px] text-slate-500">{needCount} need a decision</span>
            </Flex>
            <Flex className="mt-3 flex-wrap gap-2">
              <Select size="sm" value={mode} onChange={(e) => setMode(e.target.value as QueueMode)} aria-label="Queue" className="!w-[170px] !rounded-lg">
                <option value="needs">Needs a decision</option>
                <option value="all">All findings</option>
                <option value="rejected">Rejected (history)</option>
              </Select>
              <Select size="sm" value={sev} onChange={(e) => setSev(e.target.value as Severity | "all")} aria-label="Severity" className="!w-[130px] !rounded-lg">
                <option value="all">All severities</option>
                {(["critical", "high", "medium", "low"] as Severity[]).map((s) => <option key={s} value={s}>{severityStyles[s].label}</option>)}
              </Select>
              <Select size="sm" value={team} onChange={(e) => setTeam(e.target.value as Department | "all")} aria-label="Team" className="!w-[130px] !rounded-lg">
                <option value="all">All teams</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            </Flex>
          </Box>
          <Box as="ul" className="max-h-[880px] space-y-2 overflow-y-auto border-t border-white/[0.06] p-3">
            {queue.map((f) => {
            const on = f.id === activeId;
            const c = stateChip(f);
            const rej = isRejected(f);
            return <li key={f.id}>
                  <button type="button" aria-pressed={on} onClick={() => select(f.id)} className={`relative flex w-full items-start gap-3 rounded-xl border py-3 pl-5 pr-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "border-blue-400/50 bg-blue-500/[0.07]" : "border-white/[0.07] bg-white/[0.02] hover:border-white/20"} ${rej ? "opacity-80" : ""}`}>
                    <span className="absolute inset-y-3 left-2 w-[3px] rounded-full" style={{
                  background: severityStyles[f.severity].hex
                }} aria-hidden />
                    <Box className="min-w-0 flex-1">
                      <Text className="text-[11px] text-slate-500">{f.team} · <span className="num">{f.id}</span> · {kindMeta[f.kind].label}</Text>
                      <Text className={`mt-0.5 text-[13.5px] font-semibold ${rej ? "text-slate-400 line-through decoration-rose-400/60" : "text-slate-100"}`}>{f.title}</Text>
                      <Text className="mt-0.5 truncate text-[12px] text-slate-400">{f.owner} · reviewer {f.reviewer}</Text>
                    </Box>
                    <Flex className="shrink-0 flex-col items-end gap-1.5">
                      <span className={`rounded-md border px-2 py-0.5 text-[11px] ${c.chip}`}>{c.label}</span>
                      <span className={`text-[11px] ${severityStyles[f.severity].text}`}>{severityStyles[f.severity].label}</span>
                    </Flex>
                  </button>
                </li>;
          })}
            {queue.length === 0 && <li className="px-4 py-10 text-center text-[13px] text-slate-400">{mode === "needs" ? "No findings need a reviewer decision right now." : "Nothing matches these filters."}</li>}
          </Box>
        </Box>

        <Box as="section" aria-label="Assurance record" className="glass rounded-2xl p-5 xl:sticky xl:top-4 xl:self-start">
          {active ? <AssuranceRecord f={active} review={reviewOf(reviews, active.id)} onDecide={setPending} onOpenFinding={openFinding} /> : <Box className="py-16 text-center">
              <Text className="text-[14px] font-medium text-slate-200">Select an item to review</Text>
              <Text className="mt-1 text-[12.5px] text-slate-500">Its evidence, plan and decisions appear here.</Text>
            </Box>}
        </Box>
      </Box>

      <ReviewDecisionModal pending={pending} onCancel={() => setPending(null)} onConfirm={confirm} />
    </Box>;
}
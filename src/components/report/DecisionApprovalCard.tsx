import React from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { ArrowRightIcon, CheckIcon, CircleIcon, CornerDownRightIcon } from "lucide-react";
import type { Decision, DecisionStatus } from "../../types/intel";
export const urgencyRank: Record<string, number> = {
  "Decide today": 0,
  "Decide this week": 1,
  "Within 2 weeks": 2,
  "Within 30 days": 3
};
export const urgencyTone = (u: string) => u === "Decide today" ? "border-rose-400/30 bg-rose-400/10 text-rose-200" : u === "Decide this week" ? "border-amber-400/30 bg-amber-400/10 text-amber-200" : "border-white/10 bg-white/[0.04] text-slate-300";
export const statusMeta: Record<DecisionStatus, {
  label: string;
  cls: string;
}> = {
  pending: {
    label: "Awaiting approval",
    cls: "text-amber-300"
  },
  approved: {
    label: "Approved",
    cls: "text-teal-300"
  },
  deferred: {
    label: "Deferred",
    cls: "text-slate-400"
  },
  validation_requested: {
    label: "Validation requested",
    cls: "text-blue-300"
  }
};
interface Props {
  decision: Decision;
  status: DecisionStatus;
  onReview: () => void;
}
export function DecisionApprovalCard({
  decision: d,
  status,
  onReview
}: Props) {
  const done = d.approvals.filter((a) => a.done).length;
  const st = statusMeta[status] ?? statusMeta.pending;
  const pending = status === "pending";
  return <Box as="article" aria-labelledby={`${d.id}-title`} className={`glass flex flex-col rounded-2xl p-5 ${pending && d.urgency === "Decide today" ? "!border-rose-300/30" : ""}`}>
      <Flex className="flex-wrap items-center gap-2">
        <span className={`rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${urgencyTone(d.urgency)}`}>{d.urgency}</span>
        <Text className="num text-[11px] text-slate-500">{d.id} · {d.type}</Text>
        <Text className={`ml-auto text-[12px] font-medium ${st.cls}`}>{st.label}</Text>
      </Flex>
      <Text id={`${d.id}-title`} className="mt-2.5 text-[15px] font-semibold leading-snug text-white">{d.title}</Text>

      <Box className="mt-3 grid gap-3 text-[12.5px] sm:grid-cols-2">
        <Box>
          <Text className="text-[11px] uppercase tracking-wider text-slate-500">Decision-maker</Text>
          <Text className="text-slate-200">{d.decisionMaker.name}</Text>
          <Text className="text-[11.5px] text-slate-500">{d.decisionMaker.role}</Text>
        </Box>
        <Box>
          <Text className="text-[11px] uppercase tracking-wider text-slate-500">Expected impact · estimate</Text>
          <Text className="text-slate-200">{d.impact}</Text>
        </Box>
      </Box>

      <Flex className="mt-3 items-start gap-2 rounded-xl border border-blue-400/15 bg-blue-500/[0.05] px-3 py-2.5">
        <CornerDownRightIcon size={14} className="mt-0.5 shrink-0 text-blue-300" aria-hidden />
        <Box>
          <Text className="text-[11px] uppercase tracking-wider text-blue-300/80">Next step</Text>
          <Text className="text-[13px] text-slate-100">{d.nextStep}</Text>
        </Box>
      </Flex>

      <Flex className="mt-auto flex-wrap items-center justify-between gap-3 pt-4">
        <Flex className="flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-400" aria-label={`${done} of ${d.approvals.length} approvals`}>
          <span className="num text-slate-300">Approvals {done}/{d.approvals.length}</span>
          {d.approvals.map((a) => <Flex key={a.name} className="items-center gap-1" title={`${a.name} · ${a.role}`}>
              {a.done ? <CheckIcon size={11} className="text-teal-300" aria-hidden /> : <CircleIcon size={9} className="text-slate-500" aria-hidden />}
              <span className={a.done ? "text-slate-300" : "text-slate-500"}>{a.role}</span>
            </Flex>)}
        </Flex>
        <Button size="sm" variant={pending ? "primary" : "outline"} rightIcon={<ArrowRightIcon size={13} />} onClick={onReview}>
          {pending ? "Review & decide" : "View decision"}
        </Button>
      </Flex>
    </Box>;
}
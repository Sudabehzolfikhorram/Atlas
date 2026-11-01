import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input, Text, Textarea } from "@chakra-ui/react";
import { ArrowRightIcon, CheckCircle2Icon, LockIcon, MessageSquareWarningIcon, SaveIcon, SendIcon, UserIcon } from "lucide-react";
import { reviewOf, useDiligence } from "../../contexts/DiligenceContext";
import { findings as findingSeed } from "../../data/diligence";
import { fmtDate, fmtDateTime } from "../../utils/diligence";
import { qanUrl } from "../../utils/qanLinks";
import { planEditable, planSubmittable, wfOf } from "../../utils/workflow";
import type { Finding, FindingWorkflow, PlanFields, ReviewEntry } from "../../types/diligence";

const fieldsOf = (f: Finding): PlanFields => ({
  owner: f.owner,
  ownerRole: f.ownerRole,
  action: f.action,
  target: f.target
});

/** Diligence-only editor for the accountable owner and remediation plan, with save and submit. */
export function RemediationPlanEditor({
  f,
  readOnlyNote




}: {f: Finding; /** When set, the plan is shown read-only with this note (e.g. outside Diligence). */readOnlyNote?: React.ReactNode;}) {
  const {
    savePlan,
    submitPlan,
    reviews,
    openFinding
  } = useDiligence();
  const navigate = useNavigate();
  // Same review record Assurance shows: the latest decision on the remediation plan.
  const lastPlanReview = reviewOf(reviews, f.id).history.find((h) => h.subject === "remediation");
  const w = wfOf(f);
  const editable = planEditable(f);
  const submittable = planSubmittable(f);
  const [draft, setDraft] = useState<PlanFields>(() => fieldsOf(f));
  const [touched, setTouched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Reset the form when another finding is opened or the saved plan changes elsewhere.
  useEffect(() => {
    setDraft(fieldsOf(f));
    setTouched(false);
  }, [f.id, f.owner, f.ownerRole, f.action, f.target]);
  useEffect(() => setMessage(null), [f.id]);
  const owners = useMemo(() => Array.from(new Map(findingSeed.map((x) => [x.owner, x.ownerRole])).entries()), []);
  const saved = fieldsOf(f);
  const dirty = (Object.keys(draft) as (keyof PlanFields)[]).some((k) => draft[k].trim() !== saved[k]);
  const ownerErr = touched && !draft.owner.trim();
  const actionErr = touched && !draft.action.trim();
  const valid = !!draft.owner.trim() && !!draft.action.trim();
  const set = (k: keyof PlanFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setDraft((d) => {
      const next = {
        ...d,
        [k]: v
      };
      // Pre-fill the role when a known owner is picked.
      if (k === "owner") {
        const role = owners.find(([o]) => o === v)?.[1];
        if (role) next.ownerRole = role;
      }
      return next;
    });
    setMessage(null);
  };
  const save = () => {
    setTouched(true);
    if (!valid) return;
    if (savePlan(f.id, draft)) setMessage("Changes saved.");
  };
  const submit = () => {
    setTouched(true);
    if (!valid) return;
    if (submitPlan(f.id, draft)) setMessage("Saved and submitted — the plan is now pending approval in Assurance.");
  };
  if (readOnlyNote) return <Box className="space-y-3">
        <Text className="text-[13px] text-slate-200">{f.action}</Text>
        <OwnerCard f={f} />
        <Flex className="items-center gap-1.5 text-[11.5px] text-slate-500"><LockIcon size={11} aria-hidden />{readOnlyNote}</Flex>
      </Box>;
  if (!editable) {
    const lock = lockGuidance(w, lastPlanReview);
    const toAssurance = () => {
      openFinding(null);
      navigate(qanUrl(f.area, "assurance", f.id));
    };
    return <Box className="space-y-3">
        {message && <StatusLine text={message} />}
        <Text className="text-[13px] text-slate-200">{f.action}</Text>
        <OwnerCard f={f} />
        <Box className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 text-[11.5px] text-slate-400">
          <Flex className="items-center gap-1.5 font-medium text-slate-300"><LockIcon size={11} aria-hidden />{lock.title}</Flex>
          {lock.steps && <Box as="ol" className="mt-1.5 list-decimal space-y-0.5 pl-5">{lock.steps.map((s) => <li key={s}>{s}</li>)}</Box>}
          {lock.note && <Text className="mt-1.5">{lock.note}</Text>}
          {lock.assurance && <button type="button" onClick={toAssurance} className="mt-1.5 inline-flex items-center gap-1 text-blue-300 hover:underline focus:outline-none focus-visible:underline">Open in Assurance<ArrowRightIcon size={11} aria-hidden /></button>}
        </Box>
      </Box>;
  }
  return <Box as="form" className="space-y-3" onSubmit={(e: React.FormEvent) => {
    e.preventDefault();
    if (submittable) submit();else save();
  }} noValidate>
      {w.plan === "changes" && <ChangesRequested review={lastPlanReview} />}
      <Box className="grid gap-3 sm:grid-cols-2">
        <FormControl isRequired isInvalid={ownerErr}>
          <FormLabel htmlFor={`own-${f.id}`} className="!mb-1 !text-[11.5px] !font-medium !text-slate-400">Accountable owner</FormLabel>
          <Input id={`own-${f.id}`} size="sm" list="dil-owner-options" value={draft.owner} onChange={set("owner")} className="!rounded-lg" />
          <datalist id="dil-owner-options">{owners.map(([o, r]) => <option key={o} value={o}>{r}</option>)}</datalist>
          <FormErrorMessage className="!text-[11.5px]">Add an accountable owner.</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel htmlFor={`role-${f.id}`} className="!mb-1 !text-[11.5px] !font-medium !text-slate-400">Role</FormLabel>
          <Input id={`role-${f.id}`} size="sm" value={draft.ownerRole} onChange={set("ownerRole")} className="!rounded-lg" />
        </FormControl>
      </Box>
      <FormControl isRequired isInvalid={actionErr}>
        <FormLabel htmlFor={`plan-${f.id}`} className="!mb-1 !text-[11.5px] !font-medium !text-slate-400">Remediation plan</FormLabel>
        <Textarea id={`plan-${f.id}`} size="sm" rows={4} value={draft.action} onChange={set("action")} className="!rounded-lg !text-[13px]" />
        <FormErrorMessage className="!text-[11.5px]">Describe the remediation plan.</FormErrorMessage>
      </FormControl>
      <FormControl className="sm:!w-1/2">
        <FormLabel htmlFor={`tgt-${f.id}`} className="!mb-1 !text-[11.5px] !font-medium !text-slate-400">Target date</FormLabel>
        <Input id={`tgt-${f.id}`} type="date" size="sm" value={draft.target} onChange={set("target")} className="!rounded-lg" />
      </FormControl>
      <Flex className="flex-wrap items-center gap-2 pt-1">
        <Button type="button" size="sm" variant="outline" leftIcon={<SaveIcon size={13} />} onClick={save} isDisabled={!dirty}>Save changes</Button>
        <Button type="button" size="sm" variant="primary" leftIcon={<SendIcon size={13} />} onClick={submit} isDisabled={!submittable}>
          {w.plan === "changes" ? "Save & resubmit" : "Save & submit for approval"}
        </Button>
        {dirty && <Text className="text-[11.5px] text-amber-300">Unsaved changes</Text>}
      </Flex>
      {!submittable && <Text className="text-[11.5px] text-slate-500">You can save now; submitting unlocks once the finding is accepted in Assurance.</Text>}
      {message && <StatusLine text={message} />}
    </Box>;
}

function StatusLine({
  text


}: {text: string;}) {
  return <Flex role="status" aria-live="polite" className="items-center gap-1.5 text-[12px] text-teal-300"><CheckCircle2Icon size={13} aria-hidden />{text}</Flex>;
}

function OwnerCard({
  f


}: {f: Finding;}) {
  return <Flex className="items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15 text-blue-300"><UserIcon size={14} aria-hidden /></span>
      <Box>
        <Text className="text-[12.5px] font-medium text-slate-100">{f.owner}</Text>
        <Text className="text-[11.5px] text-slate-500">{f.ownerRole} · accountable owner · target {fmtDate(f.target)}</Text>
      </Box>
    </Flex>;
}

/** Latest reviewer decision on a plan returned with "Changes required" (same record as in Assurance). */
function ChangesRequested({
  review


}: {review?: ReviewEntry;}) {
  return <Box role="note" aria-label="Changes requested in Assurance" className="rounded-lg border border-rose-400/30 bg-rose-500/[0.06] px-3 py-2.5 text-[12px] text-rose-200">
      <Flex className="items-center gap-1.5 font-medium"><MessageSquareWarningIcon size={13} aria-hidden />Changes required — revise the plan and resubmit it for approval.</Flex>
      {review ? <Box className="mt-1.5 border-l-2 border-rose-400/40 pl-2.5">
          {review.comment ? <Text className="text-[12.5px] text-slate-100">“{review.comment}”</Text> : <Text className="text-[12px] italic text-slate-400">No reviewer comment was recorded.</Text>}
          <Text className="mt-0.5 text-[11.5px] text-slate-400">{review.reviewer} · {fmtDateTime(review.at)}</Text>
        </Box> : <Text className="mt-1 text-[11.5px] text-slate-400">The reviewer decision is not in the review history.</Text>}
    </Box>;
}

type LockGuidance = {title: string;steps?: string[];note?: string;assurance?: boolean;};

/** Why the plan is locked and, where possible, how it can be edited again. A changed plan always needs approval again. */
function lockGuidance(w: FindingWorkflow, last?: ReviewEntry): LockGuidance {
  if (w.validation === "rejected") return { title: "Finding rejected — the plan is not used. History is kept." };
  if (w.closed) return { title: "Finding closed — the plan is final." };
  if (w.plan === "pending") {
    const reopened = last?.decision === "pending";
    return {
      title: reopened ? "Reopened in Assurance — locked while the reviewer reassesses it." : "Submitted — locked while it awaits approval in Assurance.",
      steps: ["In Assurance, the reviewer chooses “Request changes” on the plan.", "The plan unlocks here: revise it and choose “Save & resubmit”.", "The revised plan goes back to Assurance and must be approved again."],
      note: reopened ? "If the reviewer approves it instead, the plan stays as it is." : undefined,
      assurance: true
    };
  }
  // Approved plan
  if (w.execution !== "not_started") return {
    title: "Approved — locked. Remediation has started, so the plan can no longer be reopened.",
    note: "Assurance can only reopen an approved plan before remediation starts."
  };
  return {
    title: "Approved — locked. To change it:",
    steps: ["In Assurance, the reviewer reopens the plan (“Reopen for reassessment”).", "The reviewer chooses “Request changes”.", "The plan unlocks here: revise it and choose “Save & resubmit”.", "The revised plan must be approved again in Assurance before remediation can start."],
    assurance: true
  };
}

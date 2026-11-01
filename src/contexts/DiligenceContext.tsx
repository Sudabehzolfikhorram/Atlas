import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { eventPool, findings as findingSeed, reviewSeed, seedEventCount } from "../data/diligence";
import { baselineSample, demoFindingId, verificationSamples } from "../data/demoScenario";
import { currentUser } from "../data/currentUser";
import { useAudit } from "./AuditContext";
import { closureReady, deriveStatus, evaluateSample, remediationAllowed, seedWorkflow } from "../utils/workflow";
import { verificationMeta } from "../utils/workflow";
import type { CheckRun, ExecutionState, Finding, FindingEvent, FindingWorkflow, LinkedEvent, MonitorEvent, PlanFields, ReviewDecision, ReviewEntry, ReviewState, ReviewSubject } from "../types/diligence";
type Verdict = Exclude<ReviewDecision, "pending">;
interface DiligenceContextValue {
  findings: Finding[];
  getFinding: (id: string) => Finding | undefined;
  reviews: Record<string, ReviewState>;
  /** Reviewer decisions (Assurance): finding validity, plan approval, closure. */
  decide: (id: string, subject: ReviewSubject, decision: Verdict, comment: string) => void;
  reopen: (id: string, subject: ReviewSubject, comment: string) => void;
  /** Diligence: save edits to owner and remediation plan (only while editable). */
  savePlan: (id: string, fields: PlanFields) => boolean;
  /** Diligence: save (optional edits) and submit the remediation plan for approval. */
  submitPlan: (id: string, fields?: PlanFields) => boolean;
  /** Diligence: track remediation execution. */
  setExecution: (id: string, state: Exclude<ExecutionState, "not_started">) => void;
  selectedId: string | null;
  openFinding: (id: string | null) => void;
  events: MonitorEvent[];
  running: boolean;
  setRunning: (on: boolean) => void;
  advance: () => void;
  /** Recorded sample check runs (demo scenario on F-01). */
  runs: CheckRun[];
  /** Unique violations linked to each finding (check failures and monitoring events). */
  linked: Record<string, LinkedEvent[]>;
  verifySampleId: string;
  setVerifySampleId: (id: string) => void;
  runBaseline: () => CheckRun | null;
  simulateRemediation: () => void;
  runVerification: (sampleId: string) => CheckRun | null;
  attachEvent: (runId: string, eventId: string) => void;
  resetDemo: () => void;
}
const Ctx = createContext<DiligenceContextValue | null>(null);
const emptyReview = (): ReviewState => ({
  finding: "pending",
  remediation: "pending",
  closure: "pending",
  history: []
});
const seedOffsets = [3, 11, 22, 38, 57, 84];
const defaultSampleId = verificationSamples[0].id;
const seedFlows = (): Record<string, FindingWorkflow> => Object.fromEntries(findingSeed.map((f) => [f.id, seedWorkflow(f, reviewSeed[f.id])]));
const seedHistory = (): Record<string, ReviewEntry[]> => Object.fromEntries(Object.entries(reviewSeed).map(([id, r]) => [id, r.history]));
const seedEvents = (): MonitorEvent[] => {
  const now = Date.now();
  return eventPool.slice(0, seedEventCount).map((e, i) => ({
    ...e,
    id: `EV-${1001 + i}`,
    at: now - seedOffsets[i] * 60000
  }));
};
const isViolation = (e: MonitorEvent) => e.type !== "normal" && !!e.relatedFindingId;
const monitoringLink = (e: MonitorEvent): LinkedEvent => ({
  eventId: e.id,
  source: "monitoring",
  label: e.title,
  linkedAt: new Date(e.at).toISOString()
});
/** Merge new links into a finding, counting each unique event once. */
const mergeLinks = (prev: Record<string, LinkedEvent[]>, id: string, items: LinkedEvent[]) => {
  const have = new Set((prev[id] ?? []).map((l) => l.eventId));
  const fresh = items.filter((l) => !have.has(l.eventId) && (have.add(l.eventId), true));
  return fresh.length ? {
    ...prev,
    [id]: [...(prev[id] ?? []), ...fresh]
  } : prev;
};
const seedLinks = (events: MonitorEvent[]) => events.filter(isViolation).reduce<Record<string, LinkedEvent[]>>((acc, e) => mergeLinks(acc, e.relatedFindingId!, [monitoringLink(e)]), {});
const today = () => new Date().toISOString().slice(0, 10);
export function DiligenceProvider({
  children


}: {children: React.ReactNode;}) {
  const {
    log
  } = useAudit();
  const initialEvents = useRef<MonitorEvent[]>(seedEvents());
  const [flows, setFlows] = useState<Record<string, FindingWorkflow>>(seedFlows);
  const [history, setHistory] = useState<Record<string, ReviewEntry[]>>(seedHistory);
  const [added, setAdded] = useState<Record<string, FindingEvent[]>>({});
  const [plans, setPlans] = useState<Record<string, PlanFields>>({});
  const [runs, setRuns] = useState<CheckRun[]>([]);
  const [linked, setLinked] = useState<Record<string, LinkedEvent[]>>(() => seedLinks(initialEvents.current));
  const [verifySampleId, setVerifySampleId] = useState(defaultSampleId);
  const runSeq = useRef(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const cursor = useRef(seedEventCount);
  const [events, setEvents] = useState<MonitorEvent[]>(() => initialEvents.current);
  const findings = useMemo(() => findingSeed.map((f) => {
    const w = flows[f.id];
    return {
      ...f,
      ...(plans[f.id] ?? {}),
      workflow: w,
      status: deriveStatus(w),
      timeline: [...f.timeline, ...(added[f.id] ?? [])]
    };
  }), [flows, added, plans]);
  const reviews = useMemo(() => Object.fromEntries(findingSeed.map((f) => {
    const w = flows[f.id];
    const r: ReviewState = {
      finding: w.validation,
      remediation: w.plan === "approved" ? "accepted" : w.plan === "changes" ? "rejected" : "pending",
      closure: w.closed ? "accepted" : "pending",
      history: history[f.id] ?? []
    };
    return [f.id, r];
  })), [flows, history]);
  const getFinding = useCallback((id: string) => findings.find((f) => f.id === id), [findings]);
  const note = useCallback((id: string, label: string, actor = currentUser.name) => setAdded((prev) => ({
    ...prev,
    [id]: [...(prev[id] ?? []), {
      date: today(),
      label,
      actor
    }]
  })), []);
  const patch = useCallback((id: string, p: Partial<FindingWorkflow>) => setFlows((prev) => ({
    ...prev,
    [id]: {
      ...prev[id],
      ...p
    }
  })), []);
  /** Previous verification results stay in the timeline when approvals are reassessed. */
  const keepResult = useCallback((id: string, w: FindingWorkflow, why: string) => {
    if (w.verification !== "not_tested") note(id, `Previous verification result (${verificationMeta[w.verification].label}) kept in history · ${why} · re-verification required`);
  }, [note]);
  const record = useCallback((id: string, subject: ReviewSubject, decision: ReviewDecision, comment: string, label: string) => {
    setHistory((prev) => ({
      ...prev,
      [id]: [{
        subject,
        decision,
        reviewer: currentUser.name,
        at: new Date().toISOString(),
        comment,
        label
      }, ...(prev[id] ?? [])]
    }));
    log({
      category: "Approval",
      action: label,
      target: id,
      detail: comment || undefined
    });
  }, [log]);
  const decide = useCallback((id: string, subject: ReviewSubject, decision: Verdict, comment: string) => {
    const w = flows[id];
    if (!w || w.closed) return;
    const ok = decision === "accepted";
    if (subject === "finding") {
      if (w.validation !== "pending") return;
      patch(id, {
        validation: decision
      });
      record(id, subject, decision, comment, ok ? "Finding accepted" : "Finding rejected · excluded from remediation queues");
    } else if (subject === "remediation") {
      if (w.validation !== "accepted" || w.plan !== "pending") return;
      patch(id, {
        plan: ok ? "approved" : "changes"
      });
      record(id, subject, decision, comment, ok ? "Remediation plan approved" : "Plan changes required");
    } else {
      // Closure: accepted finding, approved current plan and a passed verification are all required.
      if (!closureReady(w)) return;
      if (ok) patch(id, {
        closed: true
      });else {
        patch(id, {
          verification: "not_tested",
          execution: "in_progress"
        });
        keepResult(id, w, "returned for more work");
      }
      record(id, subject, decision, comment, ok ? id === demoFindingId ? "Closure approved · resolved in demo scenario (sample data)" : "Closure approved" : "Returned for more work");
    }
  }, [flows, patch, record, keepResult]);
  const reopen = useCallback((id: string, subject: ReviewSubject, comment: string) => {
    const w = flows[id];
    if (!w) return;
    if (subject === "finding") {
      // Validity is reassessed, and so are the plan approval and verification that depended on it.
      patch(id, {
        validation: "pending",
        plan: w.plan === "not_submitted" || w.plan === "changes" ? w.plan : "pending",
        verification: "not_tested",
        closed: false
      });
      keepResult(id, w, "finding reopened");
    } else if (subject === "remediation") {
      patch(id, {
        plan: "pending",
        verification: "not_tested",
        closed: false
      });
      keepResult(id, w, "plan reopened");
    } else {
      patch(id, {
        closed: false,
        verification: "not_tested",
        execution: w.execution === "not_started" ? "not_started" : "ready"
      });
      keepResult(id, w, "closure reopened");
    }
    record(id, subject, "pending", comment, `Reopened ${subject === "finding" ? "finding" : subject === "remediation" ? "remediation plan" : "closure"} for reassessment`);
  }, [flows, patch, record, keepResult]);
  const editable = (w?: FindingWorkflow) => !!w && !w.closed && w.validation !== "rejected" && (w.plan === "not_submitted" || w.plan === "changes");
  const applyPlan = useCallback((id: string, fields: PlanFields) => {
    const clean: PlanFields = {
      owner: fields.owner.trim(),
      ownerRole: fields.ownerRole.trim(),
      action: fields.action.trim(),
      target: fields.target
    };
    if (!clean.owner || !clean.action) return false;
    const base = findingSeed.find((f) => f.id === id);
    if (!base) return false;
    const prev = {
      owner: base.owner,
      ownerRole: base.ownerRole,
      action: base.action,
      target: base.target,
      ...(plans[id] ?? {})
    };
    const changed = (Object.keys(clean) as (keyof PlanFields)[]).filter((k) => clean[k] !== prev[k]);
    if (!changed.length) return true;
    setPlans((p) => ({
      ...p,
      [id]: clean
    }));
    const what = changed.map((k) => k === "action" ? "plan" : k === "ownerRole" ? "role" : k === "target" ? "target date" : "owner").join(", ");
    note(id, `Remediation plan updated (${what}) · owner ${clean.owner}`);
    log({
      category: "Investigation",
      action: "Updated remediation plan",
      target: id,
      detail: `Changed ${what} · owner ${clean.owner}`
    });
    return true;
  }, [plans, note, log]);
  const savePlan = useCallback((id: string, fields: PlanFields) => editable(flows[id]) ? applyPlan(id, fields) : false, [flows, applyPlan]);
  const submitPlan = useCallback((id: string, fields?: PlanFields) => {
    const w = flows[id];
    if (!editable(w) || w.validation !== "accepted") return false;
    if (fields && !applyPlan(id, fields)) return false;
    // A changed plan needs fresh approval and fresh verification.
    patch(id, {
      plan: "pending",
      verification: "not_tested"
    });
    keepResult(id, w, "plan changed");
    note(id, w.plan === "changes" ? "Revised remediation plan resubmitted for approval" : "Remediation plan submitted for approval");
    log({
      category: "Investigation",
      action: "Submitted remediation plan for approval",
      target: id,
      detail: "Diligence and analysis · sample record"
    });
    return true;
  }, [flows, applyPlan, patch, note, log, keepResult]);
  const setExecution = useCallback((id: string, state: Exclude<ExecutionState, "not_started">) => {
    const w = flows[id];
    if (!w || !remediationAllowed(w)) return;
    patch(id, {
      execution: state,
      verification: state === "in_progress" ? "not_tested" : w.verification
    });
    note(id, state === "ready" ? "Remediation ready for verification" : "Remediation started");
    log({
      category: "Investigation",
      action: state === "ready" ? "Marked remediation ready for verification" : "Started remediation",
      target: id,
      detail: "Diligence and analysis · sample record"
    });
  }, [flows, patch, note, log]);
  const nextRunId = () => {
    runSeq.current += 1;
    return `RUN-${String(runSeq.current).padStart(3, "0")}`;
  };
  const runBaseline = useCallback(() => {
    const w = flows[demoFindingId];
    if (w.closed || w.validation === "rejected") return null;
    const run = evaluateSample(baselineSample, "baseline", nextRunId(), new Date().toISOString());
    setRuns((prev) => [...prev, run]);
    note(demoFindingId, `Sample data — simulated pre-remediation check ${run.id}: ${run.passed}/${run.evaluated} compliant on ${run.sampleId}`, "Quality Control");
    log({
      category: "Investigation",
      action: `Ran simulated pre-remediation check ${run.id}`,
      target: demoFindingId,
      detail: `Sample data · ${run.passed} of ${run.evaluated} compliant on ${run.sampleId}`
    });
    return run;
  }, [flows, note, log]);
  const simulateRemediation = useCallback(() => {
    const w = flows[demoFindingId];
    if (!remediationAllowed(w) || w.execution === "ready") return;
    patch(demoFindingId, {
      execution: "ready",
      verification: "not_tested"
    });
    note(demoFindingId, "Sample data — simulated remediation (ERP approval gate) · ready for verification", "Quality Control");
    log({
      category: "Investigation",
      action: "Simulated remediation",
      target: demoFindingId,
      detail: "Sample data — simulated execution · no system was changed"
    });
  }, [flows, patch, note, log]);
  const runVerification = useCallback((sampleId: string) => {
    const w = flows[demoFindingId];
    const sample = verificationSamples.find((s) => s.id === sampleId);
    if (!sample || !remediationAllowed(w) || w.execution !== "ready") return null;
    const run = evaluateSample(sample, "verification", nextRunId(), new Date().toISOString());
    const passed = run.passed === run.evaluated;
    setRuns((prev) => [...prev, run]);
    patch(demoFindingId, passed ? {
      verification: "passed"
    } : {
      verification: "failed",
      execution: "in_progress"
    });
    note(demoFindingId, `Sample data — simulated verification ${run.id} ${passed ? "passed" : "failed"}: ${run.passed}/${run.evaluated} compliant on ${run.sampleId}`, "Quality Control");
    log({
      category: "Investigation",
      action: `Ran simulated post-remediation verification ${run.id}`,
      target: demoFindingId,
      detail: `Sample data · ${passed ? "passed" : "failed"} · ${run.passed} of ${run.evaluated} compliant on ${run.sampleId}`
    });
    return run;
  }, [flows, patch, note, log]);
  const attachEvent = useCallback((runId: string, eventId: string) => {
    const run = runs.find((r) => r.id === runId);
    const row = run?.rows.find((r) => r.eventId === eventId);
    if (!run || !row || row.pass) return;
    if ((linked[run.findingId] ?? []).some((e) => e.eventId === eventId)) return;
    setLinked((prev) => mergeLinks(prev, run.findingId, [{
      eventId,
      source: "check",
      label: `${row.po} · sent before approval was recorded`,
      runId,
      sampleId: run.sampleId,
      linkedAt: new Date().toISOString()
    }]));
    note(run.findingId, `Control violation ${eventId} (${row.po}) linked as an occurrence`, "Quality Control");
  }, [runs, linked, note]);
  const resetDemo = useCallback(() => {
    const seed = findingSeed.find((f) => f.id === demoFindingId)!;
    const fresh = seedEvents();
    const drop = <T,>(prev: Record<string, T>) => {
      const next = {
        ...prev
      };
      delete next[demoFindingId];
      return next;
    };
    setFlows((prev) => ({
      ...prev,
      [demoFindingId]: seedWorkflow(seed)
    }));
    setHistory(drop);
    setAdded(drop);
    setPlans(drop);
    setRuns([]);
    runSeq.current = 0;
    setVerifySampleId(defaultSampleId);
    // The simulated monitoring feed and its linked occurrences return to their initial state too.
    setRunning(false);
    cursor.current = seedEventCount;
    setEvents(fresh);
    setLinked(seedLinks(fresh));
    log({
      category: "Investigation",
      action: "Reset demo scenario",
      target: demoFindingId,
      detail: "Sample data — simulated execution · initial state restored"
    });
  }, [log]);
  const advance = useCallback(() => {
    const tpl = eventPool[cursor.current % eventPool.length];
    const n = cursor.current;
    cursor.current += 1;
    const ev: MonitorEvent = {
      ...tpl,
      id: `EV-${1001 + n}`,
      at: Date.now()
    };
    setEvents((prev) => [ev, ...prev].slice(0, 80));
    // New violations become occurrences of their related finding (once per unique event).
    if (isViolation(ev)) setLinked((prev) => mergeLinks(prev, ev.relatedFindingId!, [monitoringLink(ev)]));
  }, []);
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(advance, 3500);
    const onVis = () => document.hidden && setRunning(false);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [running, advance]);
  const value = useMemo(() => ({
    findings,
    getFinding,
    reviews,
    decide,
    reopen,
    savePlan,
    submitPlan,
    setExecution,
    selectedId,
    openFinding: setSelectedId,
    events,
    running,
    setRunning,
    advance,
    runs,
    linked,
    verifySampleId,
    setVerifySampleId,
    runBaseline,
    simulateRemediation,
    runVerification,
    attachEvent,
    resetDemo
  }), [findings, getFinding, reviews, decide, reopen, savePlan, submitPlan, setExecution, selectedId, events, running, advance, runs, linked, verifySampleId, runBaseline, simulateRemediation, runVerification, attachEvent, resetDemo]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useDiligence(): DiligenceContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDiligence must be used within DiligenceProvider");
  return ctx;
}
export function reviewOf(reviews: Record<string, ReviewState>, id: string): ReviewState {
  return reviews[id] ?? emptyReview();
}
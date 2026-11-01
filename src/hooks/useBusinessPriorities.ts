import { useCallback, useMemo, useState } from "react";
import { priorities as seed } from "../data/priorities";
import { currentUser } from "../data/currentUser";
import { useAudit } from "../contexts/AuditContext";
import type { ActivityEntry, BusinessPriority, PriorityStatus, PriorityTask, StepStatus } from "../types/priorities";

interface Override {
  status?: PriorityStatus;
  task?: PriorityTask;
  history: ActivityEntry[];
  stepUpdates?: Record<number, StepStatus>;
}

const today = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function useBusinessPriorities() {
  const { log, setDecisionStatus } = useAudit();
  const [overrides, setOverrides] = useState<Record<string, Override>>({});

  const items = useMemo<BusinessPriority[]>(
    () =>
    seed.map((p) => {
      const o = overrides[p.id];
      if (!o) return p;
      return {
        ...p,
        status: o.status ?? p.status,
        task: o.task ?? p.task,
        history: [...p.history, ...o.history],
        nextSteps: p.nextSteps.map((s, i) => o.stepUpdates?.[i] ? { ...s, status: o.stepUpdates[i] } : s)
      };
    }),
    [overrides]
  );

  const patch = useCallback((id: string, status: PriorityStatus, entry: Omit<ActivityEntry, "date" | "actor">, extra: Partial<Override> = {}) => {
    setOverrides((prev) => {
      const cur = prev[id] ?? { history: [] };
      return {
        ...prev,
        [id]: {
          ...cur,
          ...extra,
          status,
          history: [...cur.history, { date: today(), actor: currentUser.name, ...entry }],
          stepUpdates: { ...cur.stepUpdates, ...extra.stepUpdates }
        }
      };
    });
  }, []);

  const approve = useCallback(
    (p: BusinessPriority, note: string) => {
      patch(p.id, "approved", { action: `Approved: ${p.recommendation.action}${note ? ` — “${note}”` : ""}`, kind: "approval" });
      if (p.decisionId) setDecisionStatus(p.decisionId, "approved");
      log({ category: "Approval", action: "Approved recommendation", target: `${p.id} · ${p.title}`, detail: note || undefined });
    },
    [patch, log, setDecisionStatus]
  );

  const requestValidation = useCallback(
    (p: BusinessPriority) => {
      patch(p.id, "validation_requested", { action: "Requested validation of supporting evidence", kind: "decision" });
      if (p.decisionId) setDecisionStatus(p.decisionId, "validation_requested");
      log({ category: "Recommendation", action: "Requested validation", target: `${p.id} · ${p.title}` });
    },
    [patch, log, setDecisionStatus]
  );

  const defer = useCallback(
    (p: BusinessPriority) => {
      patch(p.id, "deferred", { action: "Deferred decision", kind: "decision" });
      if (p.decisionId) setDecisionStatus(p.decisionId, "deferred");
      log({ category: "Recommendation", action: "Deferred decision", target: `${p.id} · ${p.title}` });
    },
    [patch, log, setDecisionStatus]
  );

  const createTask = useCallback(
    (p: BusinessPriority, task: Omit<PriorityTask, "createdAt">) => {
      const idx = p.nextSteps.findIndex((s) => s.status !== "done");
      patch(
        p.id,
        "task_created",
        { action: `Created task for ${task.owner} (${task.priority}, due ${task.due})`, kind: "action" },
        { task: { ...task, createdAt: today() }, stepUpdates: idx >= 0 ? { [idx]: "in_progress" } : {} }
      );
      log({ category: "Task", action: "Created task from priority", target: `${p.id} · ${p.title}`, detail: `${task.owner} · ${task.priority} · due ${task.due}` });
    },
    [patch, log]
  );

  return { items, approve, requestValidation, defer, createTask };
}
import type { Priority, TaskStatus } from "../types/intel";

export const taskStatusMeta: Record<TaskStatus, {label: string;text: string;bar: string;dot: string;}> = {
  planned: { label: "Planned", text: "text-slate-300", bar: "bg-slate-500", dot: "bg-slate-400" },
  in_progress: { label: "In progress", text: "text-blue-300", bar: "bg-blue-500", dot: "bg-blue-400" },
  blocked: { label: "Blocked", text: "text-rose-300", bar: "bg-rose-400", dot: "bg-rose-400" },
  completed: { label: "Completed", text: "text-teal-300", bar: "bg-teal-400", dot: "bg-teal-400" },
  awaiting_approval: { label: "Awaiting approval", text: "text-amber-300", bar: "bg-amber-400", dot: "bg-amber-400" }
};

export const priorityMeta: Record<Priority, string> = {
  P1: "border-rose-400/40 text-rose-300",
  P2: "border-amber-400/40 text-amber-300",
  P3: "border-slate-500/50 text-slate-400"
};
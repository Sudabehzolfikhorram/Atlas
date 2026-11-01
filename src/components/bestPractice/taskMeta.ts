import { TriangleAlertIcon as AlertTriangleIcon, CircleCheckIcon as CheckCircle2Icon, EyeIcon, CircleHelpIcon as HelpCircleIcon, ServerIcon, ShieldCheckIcon, StampIcon, UsersIcon, CircleXIcon as XCircleIcon } from "lucide-react";
import type { EdgeKind, TaskKind, TaskStatus } from "../../types/bestPractice";

export const kindMeta: Record<TaskKind, {label: string;Icon: typeof UsersIcon;chip: string;icon: string;}> = {
  human: { label: "Human task", Icon: UsersIcon, chip: "border-blue-400/40 bg-blue-500/10 text-blue-300", icon: "text-blue-300 bg-blue-500/15" },
  approval: { label: "Approval", Icon: StampIcon, chip: "border-violet-400/40 bg-violet-500/10 text-violet-300", icon: "text-violet-300 bg-violet-500/15" },
  system: { label: "System step", Icon: ServerIcon, chip: "border-slate-400/30 bg-white/[0.04] text-slate-300", icon: "text-slate-300 bg-white/[0.06]" },
  exception: { label: "Exception", Icon: XCircleIcon, chip: "border-rose-400/40 bg-rose-500/10 text-rose-300", icon: "text-rose-300 bg-rose-500/15" },
  control: { label: "Added control", Icon: ShieldCheckIcon, chip: "border-teal-400/40 bg-teal-500/10 text-teal-300", icon: "text-teal-300 bg-teal-500/15" },
  hidden: { label: "Hidden work", Icon: EyeIcon, chip: "border-dashed border-slate-400/40 bg-transparent text-slate-300", icon: "text-slate-300 bg-white/[0.05]" }
};

export const statusMeta: Record<TaskStatus, {label: string;Icon: typeof CheckCircle2Icon;tone: string;}> = {
  verified: { label: "Verified", Icon: CheckCircle2Icon, tone: "text-teal-300" },
  attention: { label: "Attention", Icon: AlertTriangleIcon, tone: "text-amber-300" },
  critical: { label: "Critical gap", Icon: XCircleIcon, tone: "text-rose-400" },
  unverified: { label: "Unverified", Icon: HelpCircleIcon, tone: "text-slate-400" }
};

export const edgeMeta: Record<EdgeKind, {stroke: string;dash?: string;width: number;label: string;}> = {
  flow: { stroke: "#60A5FA", width: 1.6, label: "Flow" },
  exception: { stroke: "#FB7185", dash: "5 4", width: 1.3, label: "Exception path" },
  control: { stroke: "#2DD4BF", dash: "6 3 2 3", width: 1.4, label: "Added control" },
  hidden: { stroke: "#94A3B8", dash: "4 4", width: 1.2, label: "Hidden work" }
};
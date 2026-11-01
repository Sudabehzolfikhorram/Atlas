import { ArrowRightLeftIcon, ChartColumnIcon as BarChart3Icon, CircleCheckIcon as CheckCircle2Icon, ClipboardCheckIcon, CrownIcon, DatabaseIcon, EyeIcon, FactoryIcon, FileCheckIcon, CircleHelpIcon as HelpCircleIcon, KeyRoundIcon, LandmarkIcon, ServerIcon, ShieldCheckIcon, ShieldIcon, StampIcon, TriangleAlertIcon, UsersIcon, OctagonXIcon as XOctagonIcon, type LucideIcon } from "lucide-react";
import type { Health, RelationType, TeamIconKey } from "../../types/teamGraph";

export const teamIcons: Record<TeamIconKey, LucideIcon> = {
  crown: CrownIcon,
  landmark: LandmarkIcon,
  users: UsersIcon,
  database: DatabaseIcon,
  chart: BarChart3Icon,
  shield: ShieldIcon,
  clipboard: ClipboardCheckIcon,
  server: ServerIcon,
  factory: FactoryIcon
};

export const healthIcons: Record<Health, LucideIcon> = {
  verified: CheckCircle2Icon,
  partial: TriangleAlertIcon,
  gap: XOctagonIcon,
  unknown: HelpCircleIcon
};

export const relationIcons: Record<RelationType, LucideIcon> = {
  ownership: KeyRoundIcon,
  provisioning: DatabaseIcon,
  approval: StampIcon,
  oversight: EyeIcon,
  evidence: FileCheckIcon,
  compliance: ShieldCheckIcon,
  handoff: ArrowRightLeftIcon
};
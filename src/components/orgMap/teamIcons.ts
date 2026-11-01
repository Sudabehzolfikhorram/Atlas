import { BriefcaseIcon, CpuIcon, FactoryIcon, HeadsetIcon, LandmarkIcon, MegaphoneIcon, ScaleIcon, SettingsIcon, ShoppingCartIcon, UsersIcon } from "lucide-react";
import type { TeamId } from "../../types/orgMap";

export const teamIcons: Record<TeamId, typeof UsersIcon> = {
  hr: UsersIcon,
  finance: LandmarkIcon,
  procurement: ShoppingCartIcon,
  operations: SettingsIcon,
  production: FactoryIcon,
  sales: MegaphoneIcon,
  it: CpuIcon,
  legal: ScaleIcon,
  support: HeadsetIcon,
  exec: BriefcaseIcon
};
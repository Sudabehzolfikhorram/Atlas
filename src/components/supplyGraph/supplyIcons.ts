import {
  BadgeCheckIcon, BotIcon, BoxesIcon, BrainIcon, CircleDotIcon, CloudIcon, CodeIcon, CopyIcon, DatabaseIcon, DollarSignIcon,
  EraserIcon, EyeIcon, FactoryIcon, FileTextIcon, FolderCogIcon, GaugeIcon, GitCompareIcon, GlobeIcon, HandshakeIcon,
  HeadphonesIcon, InfinityIcon, LandmarkIcon, LayersIcon, LayoutDashboardIcon, ListChecksIcon, LockIcon, MonitorIcon,
  PackageIcon, PresentationIcon, RadioIcon, SearchIcon, ServerIcon, ShieldCheckIcon, ShuffleIcon, SlidersHorizontalIcon,
  TargetIcon, TrendingUpIcon, TruckIcon, UsersIcon, WarehouseIcon, WrenchIcon, type LucideIcon } from
"lucide-react";
import type { SupplyIconKey } from "../../types/supplyGraph";

export const supplyIcons: Record<SupplyIconKey, LucideIcon> = {
  database: DatabaseIcon, warehouse: WarehouseIcon, truck: TruckIcon, factory: FactoryIcon, dollar: DollarSignIcon,
  radio: RadioIcon, users: UsersIcon, globe: GlobeIcon, file: FileTextIcon, target: TargetIcon, listChecks: ListChecksIcon,
  layers: LayersIcon, shuffle: ShuffleIcon, boxes: BoxesIcon, eraser: EraserIcon, shieldCheck: ShieldCheckIcon,
  search: SearchIcon, wrench: WrenchIcon, brain: BrainIcon, gauge: GaugeIcon, cloud: CloudIcon, copy: CopyIcon,
  trendingUp: TrendingUpIcon, sliders: SlidersHorizontalIcon, gitCompare: GitCompareIcon, dashboard: LayoutDashboardIcon,
  code: CodeIcon, package: PackageIcon, bot: BotIcon, presentation: PresentationIcon, monitor: MonitorIcon,
  handshake: HandshakeIcon, headphones: HeadphonesIcon, landmark: LandmarkIcon, lock: LockIcon, server: ServerIcon,
  folderCog: FolderCogIcon, eye: EyeIcon, infinity: InfinityIcon, badgeCheck: BadgeCheckIcon, circle: CircleDotIcon
};
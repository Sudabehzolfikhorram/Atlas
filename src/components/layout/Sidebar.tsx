import React, { useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BarChart3Icon, ChevronRightIcon, DatabaseIcon, LayoutGridIcon, RouteIcon, ShieldCheckIcon, SparklesIcon } from "lucide-react";
type NavChild = {
  to: string;
  label: string;
};
type NavItem = {
  label: string;
  Icon: typeof DatabaseIcon;
  to?: string;
  children?: NavChild[];
};
const nav: NavItem[] = [{
  label: "Overview",
  Icon: LayoutGridIcon,
  to: "/"
}, {
  label: "Data sources",
  Icon: DatabaseIcon,
  to: "/catalog"
}, {
  label: "Mapping",
  Icon: RouteIcon,
  children: [{
    to: "/process-mapping",
    label: "Data"
  }, {
    to: "/process-mapping-graph",
    label: "Process"
  }]
}, {
  label: "Diligence and analysis",
  Icon: BarChart3Icon,
  children: [{
    to: "/diligence/data",
    label: "Data"
  }, {
    to: "/diligence/process",
    label: "Process"
  }]
}, {
  label: "Best practice design",
  Icon: SparklesIcon,
  children: [{
    to: "/best-practice/data",
    label: "Data"
  }, {
    to: "/best-practice/process",
    label: "Process"
  }]
}, {
  label: "QAN",
  Icon: ShieldCheckIcon,
  children: [{
    to: "/qan/data",
    label: "Data"
  }, {
    to: "/qan/process",
    label: "Process"
  }]
}];
const itemBase = "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";
const itemClass = ({
  isActive


}: {isActive: boolean;}) => `${itemBase} ${isActive ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"}`;
export function Sidebar({
  onNavigate


}: {onNavigate?: () => void;}) {
  return <Flex as="nav" aria-label="Primary" className="h-full w-60 shrink-0 flex-col glass-strong border-r border-white/[0.08] px-3 py-4">
      <Flex className="items-center gap-2.5 px-1.5">
        <LogoMark />
        <Box className="min-w-0">
          <Text className="text-[14px] font-semibold leading-tight tracking-tight text-white">Atlas</Text>
          <Text className="truncate text-[10.5px] text-slate-500">Enterprise operating intelligence</Text>
        </Box>
      </Flex>

      <Text className="mt-7 px-2.5 text-[10.5px] font-medium uppercase tracking-[0.12em] text-slate-500">Enterprise discovery</Text>
      <Flex as="ul" className="mt-2 flex-col gap-0.5">
        {nav.map((item) => <li key={item.label}>
            {item.children ? <NavGroup item={item} onNavigate={onNavigate} /> : <NavLink to={item.to!} end={item.to === "/"} className={itemClass} onClick={onNavigate}>
                <item.Icon size={15} className="shrink-0" aria-hidden />
                <span className="flex-1 truncate">{item.label}</span>
              </NavLink>}
          </li>)}
      </Flex>
    </Flex>;
}
function NavGroup({
  item,
  onNavigate



}: {item: NavItem;onNavigate?: () => void;}) {
  const {
    pathname
  } = useLocation();
  const reduce = useReducedMotion();
  const containsActive = item.children!.some((c) => pathname === c.to || pathname.startsWith(`${c.to}/`));
  const [open, setOpen] = useState(containsActive);
  useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive]);
  const id = `nav-${item.label.replace(/\W+/g, "-").toLowerCase()}`;
  return <>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className={`${itemBase} ${containsActive ? "text-slate-100" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"}`}>
        <item.Icon size={15} className="shrink-0" aria-hidden />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronRightIcon size={14} className={`shrink-0 text-slate-500 transition-transform duration-200 ${open ? "rotate-90" : ""}`} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {open && <motion.ul id={id} key="sub" initial={reduce ? false : {
        height: 0,
        opacity: 0
      }} animate={{
        height: "auto",
        opacity: 1
      }} exit={reduce ? {
        opacity: 0
      } : {
        height: 0,
        opacity: 0
      }} transition={{
        duration: 0.18,
        ease: [0.22, 1, 0.36, 1]
      }} className="ml-[18px] overflow-hidden border-l border-white/[0.08] pl-2">
            {item.children!.map((c) => <li key={c.to} className="py-px">
                <NavLink to={c.to} className={({
            isActive
          }) => `flex items-center rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${isActive ? "bg-white/[0.08] font-medium text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"}`} onClick={onNavigate}>
                  {c.label}
                </NavLink>
              </li>)}
          </motion.ul>}
      </AnimatePresence>
    </>;
}
function LogoMark() {
  return <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="13" fill="none" stroke="#3B82F6" strokeWidth="2.4" strokeDasharray="52 30" strokeLinecap="round" />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="#2DD4BF" strokeWidth="2.4" strokeDasharray="30 24" strokeLinecap="round" transform="rotate(120 16 16)" />
      <circle cx="16" cy="16" r="3.2" fill="#FBBF24" />
    </svg>;
}
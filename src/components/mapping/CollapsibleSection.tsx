import React, { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRightIcon } from "lucide-react";
interface Props {
  id: string;
  title: string;
  meta?: string;
  defaultOpen?: boolean;
  /** Controlled open state (optional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

/** Glass panel whose body collapses behind a one-line header. */
export function CollapsibleSection({
  id,
  title,
  meta,
  defaultOpen = false,
  open,
  onOpenChange,
  children
}: Props) {
  const reduce = useReducedMotion();
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const toggle = () => {
    setInner(!isOpen);
    onOpenChange?.(!isOpen);
  };
  return <Box as="section" id={id} aria-labelledby={`${id}-title`} className="glass scroll-mt-6 overflow-hidden rounded-2xl">
      <button type="button" onClick={toggle} aria-expanded={isOpen} aria-controls={`${id}-body`} className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.02] focus:outline-none focus-visible:bg-blue-500/[0.06]">
        <Text as="h2" id={`${id}-title`} className="text-[15px] font-semibold text-white">{title}</Text>
        {meta && <Text className="text-[12px] text-slate-500">{meta}</Text>}
        <ChevronRightIcon size={16} className={`ml-auto text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} aria-hidden />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && <motion.div id={`${id}-body`} initial={reduce ? false : {
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
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1]
      }} className="overflow-hidden">
            <Box className="border-t border-white/[0.06]">{children}</Box>
          </motion.div>}
      </AnimatePresence>
    </Box>;
}

/** Plain header row for always-open panels, matching CollapsibleSection's header. */
export function SectionHeader({
  id,
  title,
  meta,
  children





}: {id: string;title: React.ReactNode;meta?: React.ReactNode;children?: React.ReactNode;}) {
  return <Flex className="flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/[0.06] px-5 py-4">
      <Text as="h2" id={id} className="flex items-center gap-1.5 text-[15px] font-semibold text-white">{title}</Text>
      {meta}
      {children && <Flex className="ml-auto items-center gap-2">{children}</Flex>}
    </Flex>;
}
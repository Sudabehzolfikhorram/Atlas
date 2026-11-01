import React, { useId, useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDownIcon, BoxIcon } from "lucide-react";
interface Props {
  icon: BoxIcon;
  title: string;
  meta?: string;
  /** Always-visible compact content. */
  preview: React.ReactNode;
  /** Extra detail revealed on Expand. Omit when there is nothing more to show. */
  details?: React.ReactNode;
  footer?: React.ReactNode;
  defaultExpanded?: boolean;
}

/** Compact content card used inside AI answers, with an Expand toggle for full detail. */
export function ExpandableCard({
  icon: Icon,
  title,
  meta,
  preview,
  details,
  footer,
  defaultExpanded = false
}: Props) {
  const [open, setOpen] = useState(defaultExpanded);
  const reduce = useReducedMotion();
  const id = useId();
  return <Box as="section" aria-labelledby={`${id}-t`} className="rounded-xl border border-white/[0.08] bg-white/[0.02]">
      <Flex className="items-center gap-2.5 px-3.5 py-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-400/25 bg-blue-400/10 text-blue-300">
          <Icon size={14} aria-hidden />
        </span>
        <Box className="min-w-0 flex-1">
          <Text as="h4" id={`${id}-t`} className="truncate text-[13px] font-semibold text-slate-100">{title}</Text>
          {meta && <Text className="truncate text-[11px] text-slate-500">{meta}</Text>}
        </Box>
        {details && <Button size="xs" variant="ghost" aria-expanded={open} aria-controls={`${id}-d`} rightIcon={<ChevronDownIcon size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />} onClick={() => setOpen((o) => !o)}>
            {open ? "Collapse" : "Expand"}
          </Button>}
      </Flex>
      <Box className="border-t border-white/[0.06] px-3.5 py-3">{preview}</Box>
      <AnimatePresence initial={false}>
        {open && details && <motion.div id={`${id}-d`} key="d" initial={reduce ? false : {
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
        duration: 0.22,
        ease: [0.22, 1, 0.36, 1]
      }} className="overflow-hidden">
            <Box className="border-t border-white/[0.06] px-3.5 py-3">{details}</Box>
          </motion.div>}
      </AnimatePresence>
      {footer && <Box className="border-t border-white/[0.06] px-3.5 py-2.5">{footer}</Box>}
    </Box>;
}
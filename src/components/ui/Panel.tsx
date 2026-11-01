import React from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
interface PanelProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
}
export function Panel({
  title,
  subtitle,
  eyebrow,
  actions,
  children,
  className = "",
  bodyClassName = "",
  id
}: PanelProps) {
  const hasHeader = Boolean(title || actions || eyebrow);
  return <Box as="section" id={id} className={`glass rounded-2xl ${className}`}>
      {hasHeader && <Flex className="items-start justify-between gap-4 px-5 pt-5">
          <Box className="min-w-0">
            {eyebrow && <Text className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">{eyebrow}</Text>}
            {title && <Heading as="h3" className="!text-[15px] !font-semibold tracking-tight text-slate-100">
                {title}
              </Heading>}
            {subtitle && <Text className="mt-1 text-[13px] leading-relaxed text-slate-400">{subtitle}</Text>}
          </Box>
          {actions && <Flex className="shrink-0 items-center gap-2">{actions}</Flex>}
        </Flex>}
      <Box className={`${hasHeader ? "px-5 pb-5 pt-4" : "p-5"} ${bodyClassName}`}>{children}</Box>
    </Box>;
}
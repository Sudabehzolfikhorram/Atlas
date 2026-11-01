import React from "react";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { DemoBadge } from "./DemoBadge";
interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}
export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: PageHeaderProps) {
  return <Flex className="flex-col gap-4 md:flex-row md:items-end md:justify-between" style={{
    gap: "0px",
    alignItems: "flex-start",
    justifyContent: "flex-start"
  }}>
      <Box className="max-w-3xl" style={{
      width: "auto",
      flex: "1 1 0%"
    }}>
        <Flex className="mb-2 items-center gap-2">
          <Text className="text-[11px] font-medium uppercase tracking-[0.1em] text-blue-300/80">{eyebrow}</Text>
          <DemoBadge />
        </Flex>
        <Heading as="h1" className="!text-[26px] !font-semibold tracking-tight text-white">
          {title}
        </Heading>
        <Text className="mt-1.5 text-[14px] leading-relaxed text-slate-400" style={{
        width: "100%"
      }}>{description}</Text>
      </Box>
      {actions && <Flex className="shrink-0 flex-wrap items-center gap-2 md:ml-auto md:self-start md:pl-6 md:pt-6">{actions}</Flex>}
    </Flex>;
}
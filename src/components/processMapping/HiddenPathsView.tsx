import React from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { ArrowRightIcon } from "lucide-react";
import { formalPath, hiddenPath } from "../../data/processMapping";
import { PathChips } from "./PathChips";

/** Documented path vs the parallel path observed outside the workflow. */
export function HiddenPathsView({
  onTrace


}: {onTrace: () => void;}) {
  return <Box className="space-y-3">
      <Box className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-4">
        <Flex className="mb-3 items-center gap-2">
          <Text className="text-[14px] font-medium text-slate-100">Documented path</Text>
          <span className="rounded-md border border-teal-400/30 bg-teal-400/10 px-1.5 py-0.5 text-[11px] font-medium text-teal-300">Observed in ERP</span>
        </Flex>
        <PathChips steps={formalPath} size="md" />
      </Box>
      <Box className="rounded-2xl border border-dashed border-violet-400/30 bg-violet-500/[0.03] p-4">
        <Flex className="mb-3 items-center gap-2">
          <Text className="text-[14px] font-medium text-slate-100">Parallel path</Text>
          <span className="rounded-md border border-blue-400/30 bg-blue-400/10 px-1.5 py-0.5 text-[11px] font-medium text-blue-300">AI-inferred · needs expert validation</span>
        </Flex>
        <PathChips steps={hiddenPath} tone="hidden" size="md" />
        <Text className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-400">
          Requests are reworked in Excel, approved in chat and uploaded manually, bypassing the formal control gate. This relationship is inferred from access-log timing and has not been confirmed.
        </Text>
      </Box>
      <Button size="sm" variant="outline" rightIcon={<ArrowRightIcon size={13} />} onClick={onTrace}>Trace in data product graph</Button>
    </Box>;
}
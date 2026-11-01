import React from "react";
import { Box, Flex, Text, Tooltip } from "@chakra-ui/react";
import { DatabaseIcon, FileCheck2Icon, PlugZapIcon, TriangleAlertIcon } from "lucide-react";
interface Props {
  stats: {
    total: number;
    connected: number;
    imported: number;
    indexed: number;
    processing: number;
    attention: number;
    attentionSources: number;
    failedDocs: number;
  };
}

/** One compact strip of headline numbers; supporting breakdowns live in tooltips. */
export function CatalogStats({
  stats
}: Props) {
  const cells = [{
    label: "Sources",
    value: stats.total,
    hint: "Across documents, systems, emails, chats and meetings",
    Icon: DatabaseIcon,
    tone: "text-blue-300"
  }, {
    label: "Connected",
    value: stats.connected,
    hint: `${stats.total - stats.connected} not collecting`,
    Icon: PlugZapIcon,
    tone: "text-teal-300"
  }, {
    label: "Files ready for AI",
    value: `${stats.indexed}/${stats.imported}`,
    hint: `${stats.indexed} indexed · ${stats.processing} processing · ${stats.imported} imported`,
    Icon: FileCheck2Icon,
    tone: "text-violet-300"
  }, {
    label: "Need attention",
    value: stats.attention,
    hint: `${stats.attentionSources} sources · ${stats.failedDocs} failed files`,
    Icon: TriangleAlertIcon,
    tone: stats.attention ? "text-amber-300" : "text-slate-400"
  }];
  return <Box className="glass grid grid-cols-2 divide-white/[0.06] overflow-hidden rounded-2xl lg:grid-cols-4 lg:divide-x">
      {cells.map(({
      label,
      value,
      hint,
      Icon,
      tone
    }) => <Tooltip key={label} label={hint} openDelay={250} hasArrow placement="bottom">
          <Flex tabIndex={0} aria-label={`${label}: ${value}. ${hint}`} className="items-center gap-3 px-4 py-3 focus:outline-none focus-visible:bg-white/[0.03]">
            <Icon size={16} className={`shrink-0 ${tone}`} aria-hidden />
            <Text className="num text-[20px] font-medium leading-none text-white">{value}</Text>
            <Text className="truncate text-[12px] text-slate-400">{label}</Text>
          </Flex>
        </Tooltip>)}
    </Box>;
}
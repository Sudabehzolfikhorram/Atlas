import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import { BoxIcon } from "lucide-react";
interface Props {
  icon: BoxIcon;
  label: string;
  meta: string;
  chip: string;
}

/** One-line dataset context shown under the Mapping tabs. */
export function ContextStrip({
  icon: Icon,
  label,
  meta,
  chip
}: Props) {
  return <Flex className="flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-slate-400">
      <Icon size={15} className="text-slate-500" aria-hidden />
      <Text className="text-slate-300">{label}</Text>
      <span aria-hidden>·</span>
      <Text>{meta}</Text>
      <span className="num ml-auto rounded-md border border-blue-400/40 bg-blue-500/10 px-2 py-0.5 text-[11.5px] font-medium text-blue-200">{chip}</span>
    </Flex>;
}
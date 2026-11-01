import React from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, NotebookTextIcon } from "lucide-react";
import type { ResponseBlock } from "../../../types/assistant";
import { ExpandableCard } from "./ExpandableCard";
type Block = Extract<ResponseBlock, {
  kind: "report";
}>;

/** Short structured report: headings visible, full text on Expand. */
export function ReportBlock({
  block


}: {block: Block;}) {
  const navigate = useNavigate();
  return <ExpandableCard icon={NotebookTextIcon} title={block.title} meta={`${block.sections.length} sections`} preview={<ul className="flex flex-wrap gap-1.5">
          {block.sections.map((s) => <li key={s.heading} className="rounded-md border border-white/[0.08] px-2 py-0.5 text-[11.5px] text-slate-300">{s.heading}</li>)}
        </ul>} details={<Box className="space-y-2.5">
          {block.sections.map((s) => <Box key={s.heading}>
              <Text className="text-[12px] font-medium text-slate-100">{s.heading}</Text>
              <Text className="text-[12px] leading-relaxed text-slate-400">{s.body}</Text>
            </Box>)}
        </Box>} footer={block.link ? <Button size="xs" variant="link" className="!text-blue-300" rightIcon={<ArrowRightIcon size={12} />} onClick={() => navigate(block.link!.to, {
    state: block.link!.focus ? {
      focus: block.link!.focus
    } : undefined
  })}>
            {block.link.label}
          </Button> : undefined} />;
}
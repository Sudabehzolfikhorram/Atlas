import React from "react";
import { Flex } from "@chakra-ui/react";
import { ArrowRightIcon } from "lucide-react";
interface Props {
  steps: string[];
  tone?: "formal" | "hidden";
  size?: "sm" | "md";
}

/** A short path of steps shown as chips joined by arrows. */
export function PathChips({
  steps,
  tone = "formal",
  size = "sm"
}: Props) {
  const chip = tone === "hidden" ? "border-dashed border-violet-400/40 text-violet-200" : "border-white/[0.12] text-slate-300";
  const pad = size === "md" ? "px-3 py-1.5 text-[13px]" : "px-2 py-1 text-[11.5px]";
  return <Flex as="ol" className="flex-wrap items-center gap-2">
      {steps.map((s, i) => <Flex as="li" key={s} className="items-center gap-2">
          <span className={`rounded-md border bg-white/[0.02] ${pad} ${chip}`}>{s}</span>
          {i < steps.length - 1 && <ArrowRightIcon size={12} className="text-slate-500" aria-hidden />}
        </Flex>)}
    </Flex>;
}
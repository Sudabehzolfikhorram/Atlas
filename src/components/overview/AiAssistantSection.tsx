import React, { useEffect, useRef, useState } from "react";
import { Box, Flex, Heading, IconButton, Spinner, Text, Textarea } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, ArrowUpIcon, CpuIcon } from "lucide-react";
import { useAssistant } from "../../contexts/AssistantContext";
import { overviewTopics } from "../../data/assistant";
import { AiIcon } from "../assistant/AiIcon";

/** Short pause so the send state is visible before moving the user to the chat. */
const ROUTE_DELAY_MS = 260;
const MAX_HEIGHT = 140;

/** Overview entry point to the AI Assistant. Every question opens in the AI Chat with its full answer. */
export function AiAssistantSection() {
  const {
    send,
    activeModel,
    isGenerating
  } = useAssistant();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [routing, setRouting] = useState(false);
  const timer = useRef<number>();
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);
  const busy = routing || isGenerating;
  const canSend = value.trim().length > 0 && !busy;
  const submit = (text: string) => {
    const prompt = text.trim();
    if (!prompt || busy) return;
    if (!send(prompt)) return;
    setValue(prompt);
    setRouting(true);
    timer.current = window.setTimeout(() => navigate("/assistant"), ROUTE_DELAY_MS);
  };
  return <Box as="section" id="overview-assistant" aria-labelledby="ai-assistant-title" className="ai-orbit rounded-3xl">
      <Box className="ai-orbit-surface grid overflow-hidden rounded-3xl lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)]">
        <Box className="p-5 md:p-6">
          <AiIcon size={52} />
          <Text className="mt-4 text-[10.5px] font-medium uppercase tracking-[0.18em] text-slate-500">Atlas assistant</Text>
          <Heading as="h2" id="ai-assistant-title" className="mt-1 !text-[22px] !font-semibold tracking-tight text-white">
            Make sense of your operations.
          </Heading>
          <Text className="mt-1 text-[13px] text-slate-400">Explore your workflows, trace the evidence, and find what matters next.</Text>

          <Box className="mt-5 rounded-2xl border border-white/[0.1] bg-white/[0.02] transition-colors focus-within:border-blue-400/50 focus-within:bg-white/[0.03]">
            <Textarea ref={ref} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit(value);
            }
          }} placeholder="Ask anything about your business..." aria-label="Ask the AI Assistant" readOnly={busy} rows={2} resize="none" variant="unstyled" className="!min-h-[56px] !px-4 !pt-3.5 !text-[14px] leading-relaxed !text-slate-100 placeholder:!text-slate-500" />
            <Flex className="items-center gap-2 px-3 pb-3">
              <Flex className="items-center gap-1.5 rounded-full border border-white/[0.1] px-2.5 py-1 text-[11.5px] text-slate-300" title={`Model: ${activeModel.name}`}>
                <CpuIcon size={12} className="text-slate-500" aria-hidden />
                Current analysis · <span className="text-slate-400">{activeModel.name}</span>
              </Flex>
              <Text className="ml-auto hidden text-[11px] text-slate-500 sm:block">Enter to ask</Text>
              <IconButton aria-label={busy ? "Sending" : "Ask"} onClick={() => submit(value)} isDisabled={!canSend && !busy} aria-busy={busy} variant="primary" className="!h-8 !w-8 !min-w-0 !rounded-full disabled:!bg-white/10 disabled:!text-slate-500 disabled:!opacity-100" icon={busy ? <Spinner size="xs" thickness="2px" speed="0.7s" color="white" /> : <ArrowUpIcon size={15} />} />
            </Flex>
          </Box>
        </Box>

        <Box as="nav" aria-label="Suggested topics" className="border-t border-white/[0.06] p-5 md:p-6 lg:border-l lg:border-t-0">
          <Text className="px-1 text-[12px] font-medium text-slate-400">Suggested topics</Text>
          <Box as="ul" className="mt-2">
            {overviewTopics.map((t) => <li key={t.label} className="border-b border-white/[0.06] last:border-0">
                <button type="button" onClick={() => submit(t.prompt)} disabled={busy} className="group flex w-full items-center justify-between gap-3 rounded-lg px-1 py-3.5 text-left text-[13px] font-medium text-slate-200 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50">
                  {t.label}
                  <ArrowRightIcon size={15} className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-300" aria-hidden />
                </button>
              </li>)}
          </Box>
        </Box>
      </Box>
    </Box>;
}
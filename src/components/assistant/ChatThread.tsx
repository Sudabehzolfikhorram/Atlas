import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Avatar, Box, Button, Flex, Text } from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowDownIcon, RotateCcwIcon, ShieldAlertIcon, TriangleAlertIcon } from "lucide-react";
import type { AiModel, ChatMessage } from "../../types/assistant";
import { currentUser } from "../../data/currentUser";
import { followUpPrompts, overviewSuggestions } from "../../data/assistant";
import { AiIcon } from "./AiIcon";
import { AssistantResponseCard } from "./AssistantResponseCard";
interface Props {
  messages: ChatMessage[];
  models: AiModel[];
  isGenerating: boolean;
  onRetry: (id: string) => void;
  onPrompt: (text: string) => void;
  onCreateTask: (text: string) => void;
}
const NEAR_BOTTOM_PX = 140;
function AssistantAvatar() {
  return <Flex className="glass-tile h-9 w-9 shrink-0 items-center justify-center rounded-full">
      <AiIcon size={26} />
    </Flex>;
}
export function ChatThread({
  messages,
  models,
  isGenerating,
  onRetry,
  onPrompt,
  onCreateTask
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const lastUserId = [...messages].reverse().find((m) => m.role === "user")?.id;
  const modelName = (id: string) => models.find((m) => m.id === id)?.name ?? "AI model";
  const scrollToBottom = useCallback((smooth: boolean) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth && !reduceMotion ? "smooth" : "auto"
    });
  }, [reduceMotion]);

  // A new question always brings the latest turn into view.
  useLayoutEffect(() => {
    setPinned(true);
    scrollToBottom(true);
  }, [lastUserId, scrollToBottom]);

  // Streaming / completion updates only follow along if the user hasn't scrolled up to review.
  useEffect(() => {
    if (pinned) scrollToBottom(true);
  }, [messages, pinned, scrollToBottom]);
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX);
  };
  if (messages.length === 0) {
    return <Flex className="flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <Flex className="glass-tile h-16 w-16 items-center justify-center rounded-2xl"><AiIcon size={46} /></Flex>
        <Text className="mt-4 text-[18px] font-semibold text-white">How can I help today?</Text>
        <Text className="mt-1 max-w-md text-[13px] text-slate-400">Ask about workflows, bottlenecks, risks or improvement opportunities. Answers include evidence and confidence so you can judge what's verified.</Text>
        <Flex className="mt-6 max-w-2xl flex-wrap justify-center gap-2">
          {overviewSuggestions.map((s) => <Button key={s} variant="suggestion" size="sm" onClick={() => onPrompt(s)} isDisabled={isGenerating}>{s}</Button>)}
        </Flex>
      </Flex>;
  }
  return <Box className="relative min-h-0 flex-1">
      <Box ref={scrollRef} onScroll={onScroll} className="h-full overflow-y-auto px-4 py-6 md:px-8" role="log" aria-live="polite" aria-label="Conversation">
        <Box className="mx-auto max-w-4xl space-y-7">
          {messages.map((m, idx) => <motion.div key={m.id} initial={reduceMotion ? false : {
          opacity: 0,
          y: 6
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.22
        }}>
              {m.role === "user" ? <Flex className="justify-end gap-3">
                  <Box className="max-w-[78%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-md border border-blue-400/25 bg-blue-500/[0.16] px-4 py-2.5 text-[14px] leading-relaxed text-slate-100">
                    {m.text}
                  </Box>
                  <Avatar size="sm" name={currentUser.name} bg="#3B82F6" color="white" className="!h-9 !w-9" />
                </Flex> : <Flex className="gap-3">
                  <AssistantAvatar />
                  <Box className="min-w-0 flex-1">
                    <Text className="mb-1.5 text-[12px] text-slate-500">
                      <span className="font-medium text-slate-300">AI Assistant</span> · {modelName(m.modelId)}
                    </Text>
                    {m.status === "generating" && <Flex className="glass-tile inline-flex items-center gap-2.5 rounded-2xl px-4 py-3 text-[13px] text-slate-300" role="status">
                        <span className="flex gap-1" aria-hidden>
                          {[0, 1, 2].map((i) => <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-blue-300" animate={reduceMotion ? undefined : {
                    opacity: [0.3, 1, 0.3]
                  }} transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15
                  }} />)}
                        </span>
                        Analyzing with {modelName(m.modelId)}…
                      </Flex>}
                    {m.status === "done" && m.response && <>
                        <AssistantResponseCard response={m.response} prompt={m.prompt} modelName={modelName(m.modelId)} onCreateTask={onCreateTask} />
                        {idx === messages.length - 1 && <Flex className="mt-3 flex-wrap gap-2">
                            {followUpPrompts.map((f) => <Button key={f} size="xs" variant="suggestion" onClick={() => onPrompt(f)} isDisabled={isGenerating}>{f}</Button>)}
                          </Flex>}
                      </>}
                    {m.status === "error" && <Flex className="flex-col gap-3 rounded-2xl border border-rose-400/25 bg-rose-400/[0.06] p-4 sm:flex-row sm:items-center" role="alert">
                        <TriangleAlertIcon size={16} className="shrink-0 text-rose-300" />
                        <Text className="flex-1 text-[13px] text-slate-200">Something went wrong while generating the response. Please try again.</Text>
                        <Button size="xs" leftIcon={<RotateCcwIcon size={12} />} onClick={() => onRetry(m.id)} isDisabled={isGenerating}>Retry</Button>
                      </Flex>}
                    {m.status === "blocked" && m.blocked && <Box className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4" role="alert">
                        <Flex className="items-center gap-2 text-[14px] font-medium text-white">
                          <ShieldAlertIcon size={15} className="text-amber-300" />{m.blocked.title}
                        </Flex>
                        <Text className="mt-1.5 text-[13px] leading-relaxed text-slate-300">{m.blocked.explanation}</Text>
                        <Button size="xs" className="mt-3" onClick={() => navigate(m.blocked!.actionTo)}>{m.blocked.actionLabel}</Button>
                      </Box>}
                  </Box>
                </Flex>}
            </motion.div>)}
        </Box>
      </Box>
      {!pinned && <Button size="xs" leftIcon={<ArrowDownIcon size={12} />} onClick={() => {
      setPinned(true);
      scrollToBottom(true);
    }} className="!absolute bottom-3 left-1/2 -translate-x-1/2 !rounded-full">
          Latest messages
        </Button>}
    </Box>;
}
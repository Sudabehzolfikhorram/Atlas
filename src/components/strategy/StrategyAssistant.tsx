import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Heading, IconButton, Spinner, Text, Textarea } from "@chakra-ui/react";
import { ArrowUpIcon } from "lucide-react";
import { assistantSuggestions, insights } from "../../data/strategy";
import { answerFor } from "../../utils/strategy";
import type { ChatMessage } from "../../types/strategy";
import { AiIcon } from "../assistant/AiIcon";
import { BasisTag } from "./BasisTag";
interface Props {
  /** A question pushed in from elsewhere (e.g. "Ask assistant" on an insight). */
  pending: {
    id: number;
    text: string;
  } | null;
  onShow: (insightId: string) => void;
}

/** Conversational assistant scoped to strategy execution on the organization map. */
export function StrategyAssistant({
  pending,
  onShow
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "m0",
    role: "assistant",
    text: "Ask me about any objective, team or process. I'll point to the insights on the map and say whether the answer is evidence-backed or an AI hypothesis."
  }]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number>();
  const ask = (q: string) => {
    const text = q.trim();
    if (!text || thinking) return;
    setMessages((m) => [...m, {
      id: `u${Date.now()}`,
      role: "user",
      text
    }]);
    setDraft("");
    setThinking(true);
    const a = text.startsWith("Tell me more about: ") ? (() => {
      const hit = insights.find((i) => text.endsWith(i.title));
      return hit ? {
        answer: `${hit.summary} ${hit.basis === "hypothesis" ? `This is an AI hypothesis (${hit.confidence}% confidence). ${hit.validate ?? ""}` : `This is backed by ${hit.evidence.length} evidence items on the map.`}`,
        basis: hit.basis,
        insights: [hit.id]
      } : answerFor(text);
    })() : answerFor(text);
    timer.current = window.setTimeout(() => {
      setMessages((m) => [...m, {
        id: `a${Date.now()}`,
        role: "assistant",
        text: a.answer,
        basis: a.basis,
        insights: a.insights
      }]);
      setThinking(false);
    }, 750);
  };
  useEffect(() => {
    if (pending) ask(pending.text);
  }, [pending?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, thinking]);
  return <Box as="section" aria-labelledby="st-chat" className="glass-tile flex h-full min-h-[420px] flex-col rounded-2xl border border-white/[0.07] p-4">
      <Flex className="items-center gap-2">
        <AiIcon size={24} />
        <Heading as="h3" id="st-chat" className="!text-[14px] !font-semibold text-slate-100">Strategy assistant</Heading>
        <Text className="ml-auto text-[11px] text-slate-500">Prototype · answers from sample analysis</Text>
      </Flex>
      <Box ref={listRef} className="mt-3 max-h-[340px] min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1" role="log" aria-live="polite">
        {messages.map((m) => <Flex key={m.id} className={m.role === "user" ? "justify-end" : "justify-start"}>
            <Box className={`max-w-[88%] rounded-xl px-3 py-2 text-[12.5px] leading-relaxed ${m.role === "user" ? "bg-blue-500/20 text-slate-100" : "border border-white/[0.07] bg-white/[0.03] text-slate-200"}`}>
              {m.basis && <Box className="mb-1.5"><BasisTag basis={m.basis} /></Box>}
              <Text>{m.text}</Text>
              {m.insights && m.insights.length > 0 && <Flex className="mt-2 flex-wrap gap-1.5">
                  {m.insights.map((id) => {
              const i = insights.find((x) => x.id === id);
              return i ? <button key={id} type="button" onClick={() => onShow(id)} className="rounded-md border border-blue-400/30 bg-blue-400/10 px-1.5 py-0.5 text-left text-[11px] text-blue-200 hover:bg-blue-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                        Show on map · {i.title.length > 34 ? `${i.title.slice(0, 34)}…` : i.title}
                      </button> : null;
            })}
                </Flex>}
            </Box>
          </Flex>)}
        {thinking && <Flex className="items-center gap-2 text-[12px] text-slate-400"><Spinner size="xs" /> Analysing the organization map…</Flex>}
      </Box>
      <Flex className="mt-3 flex-wrap gap-1.5">
        {assistantSuggestions.map((s) => <Button key={s} size="xs" variant="outline" isDisabled={thinking} onClick={() => ask(s)}>{s}</Button>)}
      </Flex>
      <Flex as="form" className="mt-2.5 items-end gap-2" onSubmit={(e) => {
      e.preventDefault();
      ask(draft);
    }}>
        <Textarea size="sm" rows={1} resize="none" aria-label="Ask about strategy execution" placeholder="Ask about an objective, team or process…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          ask(draft);
        }
      }} className="!rounded-lg" />
        <IconButton type="submit" aria-label="Send question" colorScheme="blue" size="sm" icon={<ArrowUpIcon size={15} />} isDisabled={!draft.trim() || thinking} />
      </Flex>
    </Box>;
}
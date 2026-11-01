import React, { useEffect, useRef, useState } from "react";
import { Box, Flex, Heading, IconButton, Select, Spinner, Text, Textarea } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, ArrowUpIcon } from "lucide-react";
import { useAssistant } from "../../contexts/AssistantContext";
import { AiIcon } from "../assistant/AiIcon";
interface Props {
  suggestions: string[];
  /** "split": composer left, suggestions right (wide). "stacked": single column card. */
  layout?: "split" | "stacked";
  /** Optional workflow scope options appended to the question. */
  workflows?: string[];
  className?: string;
}
const ROUTE_DELAY_MS = 260;

/** Ask Atlas: questions open in AI Chat with the full answer. */
export function AskAtlasCard({
  suggestions,
  layout = "stacked",
  workflows,
  className = ""
}: Props) {
  const {
    send,
    isGenerating
  } = useAssistant();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [workflow, setWorkflow] = useState(workflows?.[0] ?? "");
  const [routing, setRouting] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const busy = routing || isGenerating;
  const submit = (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const scoped = workflows && workflow && workflow !== workflows[0] ? `${q} (${workflow})` : q;
    if (!send(scoped)) return;
    setValue(q);
    setRouting(true);
    timer.current = window.setTimeout(() => navigate("/assistant"), ROUTE_DELAY_MS);
  };
  const head = <Flex className="items-center gap-3.5">
      <AiIcon size={52} />
      <Box>
        <Heading as="h2" className="!text-[20px] !font-semibold tracking-tight text-white">Ask Atlas</Heading>
        <Text className="text-[13px] text-slate-400">Explore your process evidence.</Text>
      </Box>
    </Flex>;
  const composer = <Box className="rounded-2xl border border-blue-400/40 bg-white/[0.02] transition-colors focus-within:border-blue-400/70">
      <Textarea value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        submit(value);
      }
    }} placeholder="What would you like to understand?" aria-label="Ask Atlas" readOnly={busy} rows={2} resize="none" variant="unstyled" className="!min-h-[60px] !px-4 !pt-3.5 !text-[14px] !text-slate-100 placeholder:!text-slate-500" />
      <Flex className="items-end gap-2 px-4 pb-3">
        <Text className="text-[11.5px] text-slate-500">Enter to ask · Shift + Enter for a new line</Text>
        <IconButton aria-label={busy ? "Sending" : "Ask"} onClick={() => submit(value)} isDisabled={!value.trim() && !busy} variant="primary" className="!ml-auto !h-9 !w-9 !min-w-0 !rounded-lg disabled:!bg-white/10 disabled:!text-slate-500 disabled:!opacity-100" icon={busy ? <Spinner size="xs" color="white" /> : <ArrowUpIcon size={16} />} />
      </Flex>
    </Box>;
  const list = <Box>
      <Text className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Suggested investigations</Text>
      <Box as="ul" className="mt-2">
        {suggestions.map((s) => <li key={s} className="border-b border-white/[0.06] last:border-0">
            <button type="button" onClick={() => submit(s)} disabled={busy} className="group flex w-full items-center justify-between gap-3 py-3 text-left text-[14px] text-slate-200 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50">
              {s}
              <ArrowRightIcon size={16} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-300" aria-hidden />
            </button>
          </li>)}
      </Box>
      {workflows && <Flex className="mt-3 items-center gap-3">
          <Text as="label" htmlFor="atlas-workflow" className="text-[12.5px] text-slate-400">Workflow</Text>
          <Box className="w-[240px]">
            <Select id="atlas-workflow" size="sm" value={workflow} onChange={(e) => setWorkflow(e.target.value)} className="!rounded-lg">
              {workflows.map((w) => <option key={w} value={w}>{w}</option>)}
            </Select>
          </Box>
        </Flex>}
    </Box>;
  if (layout === "split") return <Box as="section" aria-label="Ask Atlas" className={`glass grid overflow-hidden rounded-2xl lg:grid-cols-2 ${className}`}>
        <Flex className="flex-col gap-6 p-5 md:p-6">
          {head}
          <Box className="mt-auto">{composer}</Box>
        </Flex>
        <Box className="border-t border-white/[0.06] p-5 md:p-6 lg:border-l lg:border-t-0">{list}</Box>
      </Box>;
  return <Flex as="section" aria-label="Ask Atlas" className={`glass flex-col gap-6 rounded-2xl p-5 md:p-6 ${className}`}>
      {head}
      {list}
      <Box className="mt-auto">{composer}</Box>
    </Flex>;
}
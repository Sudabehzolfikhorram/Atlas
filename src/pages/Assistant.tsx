import React, { useState } from "react";
import { Box, Button, Flex, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { ClockIcon, RefreshCwIcon, SlidersHorizontalIcon } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { ChatThread } from "../components/assistant/ChatThread";
import { PromptComposer } from "../components/assistant/PromptComposer";
import { ModelSelectModal } from "../components/assistant/ModelSelectModal";
import { ProviderMark } from "../components/assistant/ProviderMark";
import { useAssistant } from "../contexts/AssistantContext";
import { useAudit } from "../contexts/AuditContext";
import { investigationPrompts, recentInvestigations } from "../data/assistant";
export function Assistant() {
  const {
    messages,
    isGenerating,
    models,
    activeModel,
    send,
    retry,
    clearConversation
  } = useAssistant();
  const {
    log
  } = useAudit();
  const toast = useToast();
  const modelModal = useDisclosure();
  const [draft, setDraft] = useState("");
  const submit = (text: string) => {
    if (send(text)) setDraft("");
  };
  const createTask = (text: string) => {
    log({
      category: "Task",
      action: "Created task from AI recommendation",
      target: text
    });
    toast({
      title: "Task added to Operational Planning",
      description: text,
      status: "success",
      duration: 3000,
      position: "bottom-right"
    });
  };
  return <Box className="space-y-6">
      <PageHeader eyebrow="Section A · Conversational analysis" title="AI Assistant" description="Ask in plain language. Answers include workflow diagrams, supporting evidence, issues and recommendations." actions={<>
            <Flex className="glass-tile items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-3" aria-live="polite">
              <ProviderMark provider={activeModel.providerKey} />
              <Box>
                <Text className="text-[11px] leading-tight text-slate-500">Active model</Text>
                <Text className="text-[13px] font-medium leading-tight text-slate-100">{activeModel.name}</Text>
              </Box>
            </Flex>
            <Button variant="outline" leftIcon={<SlidersHorizontalIcon size={14} />} onClick={modelModal.onOpen}>
              Change model
            </Button>
          </>} />

      <Box className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Flex className="glass h-[calc(100vh-250px)] min-h-[560px] flex-col overflow-hidden rounded-2xl">
          <Flex className="items-center justify-between border-b border-white/[0.06] px-4 py-2.5 md:px-6">
            <Text className="text-[12px] text-slate-500">{messages.length === 0 ? "New conversation" : `${messages.filter((m) => m.role === "user").length} questions in this conversation`}</Text>
            {messages.length > 0 && <Button size="xs" variant="ghost" leftIcon={<RefreshCwIcon size={12} />} onClick={clearConversation} isDisabled={isGenerating}>
                New conversation
              </Button>}
          </Flex>
          <ChatThread messages={messages} models={models} isGenerating={isGenerating} onRetry={retry} onPrompt={submit} onCreateTask={createTask} />
          <Box className="border-t border-white/[0.06] p-3 md:p-4">
            <Box className="mx-auto max-w-4xl">
              <PromptComposer value={draft} onChange={setDraft} onSubmit={submit} loading={isGenerating} size="md" autoFocus placeholder={messages.length ? "Ask a follow-up question..." : "Ask about your business, processes, or performance..."} ariaLabel="Message the AI Assistant" />
              <Text className="mt-2 px-1 text-[11px] text-slate-500">Enter to send · Shift + Enter for a new line · Responses in this demo use illustrative data</Text>
            </Box>
          </Box>
        </Flex>

        <Box className="space-y-4">
          <Panel title="Suggested investigations">
            <Box as="ul" className="space-y-1.5">
              {investigationPrompts.map((p) => <Box as="li" key={p}>
                  <button onClick={() => submit(p)} disabled={isGenerating} className="w-full rounded-lg border border-white/[0.08] px-3 py-2 text-left text-[12px] leading-snug text-slate-300 transition-colors hover:border-blue-400/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
                    {p}
                  </button>
                </Box>)}
            </Box>
          </Panel>
          <Panel title="Recent investigations">
            <Box as="ul" className="space-y-3">
              {recentInvestigations.map((r) => <Flex as="li" key={r.title} className="items-start justify-between gap-2">
                  <Box>
                    <Text className="text-[13px] text-slate-200">{r.title}</Text>
                    <Flex className="items-center gap-1 text-[11px] text-slate-500"><ClockIcon size={10} />{r.when}</Flex>
                  </Box>
                  <Text className={`shrink-0 text-[11px] ${r.status === "Complete" ? "text-teal-300" : "text-amber-300"}`}>{r.status}</Text>
                </Flex>)}
            </Box>
          </Panel>
        </Box>
      </Box>

      <ModelSelectModal isOpen={modelModal.isOpen} onClose={modelModal.onClose} />
    </Box>;
}
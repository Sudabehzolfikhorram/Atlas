import React, { useEffect, useState } from "react";
import { Box, Button, Flex, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Text, useToast } from "@chakra-ui/react";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { useAssistant } from "../../contexts/AssistantContext";
import type { AiModel } from "../../types/assistant";
import { ProviderMark } from "./ProviderMark";
import { CustomModelForm } from "./CustomModelForm";
const statusMeta: Record<AiModel["status"], {
  label: string;
  cls: string;
  dot: string;
}> = {
  connected: {
    label: "Connected",
    cls: "text-teal-300",
    dot: "bg-teal-400"
  },
  not_connected: {
    label: "Not connected",
    cls: "text-slate-400",
    dot: "bg-slate-500"
  },
  pending: {
    label: "Pending setup",
    cls: "text-amber-300",
    dot: "bg-amber-400"
  }
};
export function ModelSelectModal({
  isOpen,
  onClose



}: {isOpen: boolean;onClose: () => void;}) {
  const {
    models,
    activeModel,
    setActiveModel,
    addPendingModel
  } = useAssistant();
  const [view, setView] = useState<"select" | "custom">("select");
  const [pending, setPending] = useState(activeModel.id);
  const toast = useToast();
  useEffect(() => {
    if (isOpen) {
      setView("select");
      setPending(activeModel.id);
    }
  }, [isOpen, activeModel.id]);
  const selected = models.find((m) => m.id === pending);
  const valid = selected?.status === "connected";
  const apply = () => {
    if (!valid || !selected) return;
    if (selected.id !== activeModel.id) {
      setActiveModel(selected.id);
      toast({
        title: `Now using ${selected.name}`,
        description: "Your conversation is unchanged.",
        status: "success",
        duration: 2500,
        position: "bottom-right"
      });
    }
    onClose();
  };
  return <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader className="!pb-1">
          {view === "select" ? <>
              <Text className="text-[17px] font-semibold text-white">Choose AI Model</Text>
              <Text className="mt-1 text-[13px] font-normal text-slate-400">Select a connected AI model to use for your conversations.</Text>
            </> : <Flex className="items-start gap-2">
              <IconButton aria-label="Back to models" size="xs" variant="ghost" icon={<ArrowLeftIcon size={14} />} onClick={() => setView("select")} className="!mt-0.5" />
              <Box>
                <Text className="text-[17px] font-semibold text-white">Connect a Custom AI Model</Text>
                <Text className="mt-1 text-[13px] font-normal text-slate-400">Add a model that isn't listed. Credentials are validated before the model becomes available.</Text>
              </Box>
            </Flex>}
        </ModalHeader>
        <ModalCloseButton />

        {view === "select" ? <>
            <ModalBody className="!pt-4">
              {models.length === 0 ? <Text className="py-8 text-center text-[13px] text-slate-400">No AI models connected yet.</Text> : <RadioGroup value={pending} onChange={setPending} aria-label="AI models">
                  <Box className="space-y-2">
                    {models.map((m) => {
                const disabled = m.status !== "connected";
                const active = pending === m.id;
                const st = statusMeta[m.status];
                return <Box as="label" key={m.id} htmlFor={`model-${m.id}`} className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors ${disabled ? "cursor-not-allowed border-white/[0.06] opacity-60" : active ? "cursor-pointer border-blue-400/50 bg-blue-500/[0.08]" : "cursor-pointer border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03]"}`}>
                          <ProviderMark provider={m.providerKey} />
                          <Box className="min-w-0 flex-1">
                            <Flex className="flex-wrap items-center gap-2">
                              <Text className="text-[14px] font-medium text-slate-100">{m.name}</Text>
                              {m.custom && <span className="rounded border border-violet-400/30 px-1.5 text-[10px] font-medium text-violet-300">Custom</span>}
                              {m.id === activeModel.id && <span className="rounded bg-white/[0.08] px-1.5 text-[10px] font-medium text-slate-300">Current</span>}
                            </Flex>
                            <Text className="truncate text-[12px] text-slate-500">{m.provider} · {m.description}</Text>
                          </Box>
                          <Flex className={`hidden shrink-0 items-center gap-1.5 text-[11px] sm:flex ${st.cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} aria-hidden />
                            {st.label}
                          </Flex>
                          <Radio id={`model-${m.id}`} value={m.id} isDisabled={disabled} aria-label={`${m.name}, ${st.label}`} />
                        </Box>;
              })}
                  </Box>
                </RadioGroup>}
              <Text className="mt-4 text-[11px] text-slate-500">In this demo environment, connected models return sample responses from illustrative data.</Text>
            </ModalBody>
            <ModalFooter className="justify-between gap-2 border-t border-white/[0.06]">
              <Button variant="outline" leftIcon={<PlusIcon size={14} />} onClick={() => setView("custom")}>Add Custom Model</Button>
              <Button variant="primary" isDisabled={!valid} onClick={apply}>Select Model</Button>
            </ModalFooter>
          </> : <ModalBody className="!pb-6 !pt-4">
            <CustomModelForm onCancel={() => setView("select")} onSavePending={(m) => {
          addPendingModel(m);
          setView("select");
          toast({
            title: `${m.name} saved as pending`,
            description: "It can be selected once the connection is completed.",
            status: "info",
            duration: 3500,
            position: "bottom-right"
          });
        }} />
          </ModalBody>}
      </ModalContent>
    </Modal>;
}
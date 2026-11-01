import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Checkbox, Flex, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from "@chakra-ui/react";
import { CheckIcon, DatabaseIcon, FileTextIcon, InfoIcon, PlayIcon, SearchIcon, UploadIcon, XIcon } from "lucide-react";
import { useAnalysis } from "../../contexts/AnalysisContext";
import type { AnalysisInput } from "../../types/analysis";
import { documentToInput, sourceToInput } from "../../utils/analysis";
import { UploadModal } from "../catalog/UploadModal";
type Tab = "documents" | "sources";
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/** Choose catalog documents and sources for a (simulated) process analysis run. */
export function AnalysisInputModal({
  isOpen,
  onClose
}: Props) {
  const {
    documents,
    sources,
    uploadFiles,
    start
  } = useAnalysis();
  const upload = useDisclosure();
  const [tab, setTab] = useState<Tab>("documents");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const openedAt = useRef(0);
  useEffect(() => {
    if (isOpen) {
      openedAt.current = Date.now() - 1000;
      setTab("documents");
      setQuery("");
      setSelected([]);
    }
  }, [isOpen]);
  const docInputs = useMemo(() => documents.map(documentToInput), [documents]);
  const sourceInputs = useMemo(() => sources.map(sourceToInput), [sources]);
  const all = useMemo(() => [...docInputs, ...sourceInputs], [docInputs, sourceInputs]);
  const byId = useMemo(() => new Map(all.map((i) => [i.id, i])), [all]);
  const q = query.trim().toLowerCase();
  const list = (tab === "documents" ? docInputs : sourceInputs).filter((i) => !q || [i.name, i.meta, i.department].some((t) => t.toLowerCase().includes(q)));
  const readyShown = list.filter((i) => i.ready);
  const readyUnselected = readyShown.filter((i) => !selected.includes(i.id));

  // Drop selections that stopped being ready (e.g. an upload that failed).
  const chosen = selected.map((id) => byId.get(id)).filter((i): i is AnalysisInput => !!i);
  const readyChosen = chosen.filter((i) => i.ready);
  const pending = chosen.filter((i) => !i.ready);
  const toggle = (i: AnalysisInput) => {
    if (!i.ready) return;
    setSelected((s) => s.includes(i.id) ? s.filter((x) => x !== i.id) : [...s, i.id]);
  };
  const onStart = () => {
    if (!readyChosen.length || pending.length) return;
    // Uploads made in this session that failed are reported with the results.
    const failedUploads = documents.filter((d) => !d.sample && d.status === "failed" && Date.parse(d.uploadedAt) >= openedAt.current).map((d) => ({
      input: documentToInput(d),
      status: "failed" as const
    }));
    start(readyChosen, failedUploads);
    onClose();
  };
  const status = pending.length ? {
    tone: "text-amber-300",
    text: `${pending.length} selected input${pending.length === 1 ? " isn't" : "s aren't"} ready yet.`
  } : readyChosen.length ? {
    tone: "text-teal-300",
    text: `Ready. Only ${readyChosen.length === 1 ? "this input" : `these ${readyChosen.length} inputs`} will be used.`
  } : {
    tone: "text-slate-400",
    text: "Select at least one ready input to start."
  };
  return <>
      <Modal isOpen={isOpen} onClose={onClose} size="5xl" isCentered scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent className="!mx-4 max-h-[calc(100vh-4rem)]">
          <ModalHeader className="!pb-2">
            <Text className="text-[18px] font-semibold text-white">Analyze processes</Text>
            <Text className="mt-0.5 text-[13px] font-normal text-slate-400">
              Choose the documents and sources to analyze. Nothing runs until you select <span className="font-medium text-slate-200">Start analysis</span>.
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="!pb-4">
            <Box className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
              {/* Available inputs */}
              <Flex className="glass-tile min-h-0 flex-col overflow-hidden rounded-2xl">
                <Flex className="items-start justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
                  <Box>
                    <Text className="text-[14px] font-semibold text-slate-100">Available inputs</Text>
                    <Text className="text-[12px] text-slate-500">From your Organization Catalog</Text>
                  </Box>
                  <Button variant="outline" leftIcon={<UploadIcon size={14} />} onClick={upload.onOpen}>Upload documents</Button>
                </Flex>
                <Box className="px-4 pt-3">
                  <Flex className="flex-col gap-2 sm:flex-row sm:items-center">
                    
                    <InputGroup size="sm" className="min-w-0 flex-1">
                      <InputLeftElement pointerEvents="none" className="!h-10"><SearchIcon size={14} className="text-slate-500" /></InputLeftElement>
                      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, type, department…" aria-label="Search inputs" className="!h-10 !rounded-xl" />
                    </InputGroup>
                  </Flex>
                  <Flex className="mt-2.5 items-center justify-between text-[12px]">
                    <Text className="text-slate-500">{list.length} shown · {readyShown.length} ready</Text>
                    <button type="button" disabled={!readyUnselected.length} onClick={() => setSelected((s) => [...s, ...readyUnselected.map((i) => i.id)])} className="rounded font-medium text-blue-300 hover:text-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:text-slate-600">
                      Select all ready ({readyUnselected.length})
                    </button>
                  </Flex>
                </Box>
                <Box as="ul" aria-label={tab === "documents" ? "Documents" : "Catalog sources"} className="mt-2 max-h-[46vh] flex-1 space-y-2 overflow-y-auto px-4 pb-4">
                  {list.length === 0 && <Text as="li" className="py-10 text-center text-[13px] text-slate-500">No {tab === "documents" ? "documents" : "sources"} match “{query}”.</Text>}
                  {list.map((i) => {
                  const on = selected.includes(i.id);
                  const Icon = i.kind === "document" ? FileTextIcon : DatabaseIcon;
                  return <Box as="li" key={i.id}>
                        <label className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${!i.ready ? "cursor-not-allowed border-white/[0.05] opacity-60" : on ? "cursor-pointer border-blue-400/50 bg-blue-500/[0.1]" : "cursor-pointer border-white/[0.07] bg-white/[0.02] hover:border-white/20"}`}>
                          <Checkbox isChecked={on} isDisabled={!i.ready} onChange={() => toggle(i)} className="mt-0.5" aria-label={`Select ${i.name}`} />
                          <Icon size={15} className="mt-0.5 shrink-0 text-slate-400" aria-hidden />
                          <Box className="min-w-0 flex-1">
                            <Text className="truncate text-[13.5px] font-medium text-slate-100">{i.name}</Text>
                            <Text className="truncate text-[12px] text-slate-500">{i.meta}</Text>
                            {i.blockedReason && <Text className="mt-0.5 text-[12px] text-slate-400">{i.blockedReason}</Text>}
                          </Box>
                         
                        </label>
                      </Box>;
                })}
                </Box>
              </Flex>

              {/* Selected */}
              <Flex className="glass-tile min-h-[280px] flex-col overflow-hidden rounded-2xl">
                <Flex className="items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
                  <Box>
                    <Text className="text-[14px] font-semibold text-slate-100">Selected for this analysis</Text>
                    <Text className="text-[12px] text-slate-500">Review before you start</Text>
                  </Box>
                  <span className="num flex h-7 min-w-[28px] items-center justify-center rounded-full bg-blue-500 px-2 text-[12.5px] font-semibold text-white" aria-label={`${chosen.length} selected`}>{chosen.length}</span>
                </Flex>
                <Box as="ul" aria-label="Selected inputs" className="max-h-[46vh] flex-1 space-y-2 overflow-y-auto p-4">
                  {chosen.length === 0 && <Flex as="li" className="h-full min-h-[160px] flex-col items-center justify-center text-center">
                      <FileTextIcon size={20} className="text-slate-600" aria-hidden />
                      <Text className="mt-2 text-[13px] text-slate-400">Nothing selected yet</Text>
                      <Text className="mt-0.5 max-w-[220px] text-[12px] text-slate-500">Pick documents or catalog sources on the left.</Text>
                    </Flex>}
                  {chosen.map((i) => <Flex as="li" key={i.id} className="items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
                      {i.kind === "document" ? <FileTextIcon size={14} className="mt-0.5 shrink-0 text-slate-400" aria-hidden /> : <DatabaseIcon size={14} className="mt-0.5 shrink-0 text-slate-400" aria-hidden />}
                      <Box className="min-w-0 flex-1">
                        <Text className="truncate text-[13px] font-medium text-slate-100">{i.name}</Text>
                        <Text className="truncate text-[11.5px] text-slate-500">{i.shortMeta}</Text>
                        <Box className="mt-1.5">{i.ready ? <ReadyTag /> : <Text className="text-[11.5px] text-amber-300">{i.blockedReason}</Text>}</Box>
                      </Box>
                      <button type="button" aria-label={`Remove ${i.name}`} onClick={() => setSelected((s) => s.filter((x) => x !== i.id))} className="rounded-md p-1 text-slate-500 hover:bg-white/[0.06] hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                        <XIcon size={14} />
                      </button>
                    </Flex>)}
                </Box>
                <Flex className="items-start gap-2 border-t border-white/[0.06] px-4 py-3 text-[11.5px] leading-relaxed text-slate-500">
                  <InfoIcon size={13} className="mt-0.5 shrink-0" aria-hidden />
                  Removing an item only takes it out of this analysis. It stays in the catalog.
                </Flex>
              </Flex>
            </Box>
          </ModalBody>
          <ModalFooter className="flex-wrap gap-3 border-t border-white/[0.06] !py-3.5">
            <Text role="status" aria-live="polite" className={`mr-auto text-[12.5px] font-medium ${status.tone}`}>{status.text}</Text>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button variant="primary" leftIcon={<PlayIcon size={13} />} onClick={onStart} isDisabled={!readyChosen.length || pending.length > 0}>
              Start analysis{readyChosen.length ? ` (${readyChosen.length})` : ""}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <UploadModal isOpen={upload.isOpen} onClose={upload.onClose} onUpload={uploadFiles} />
    </>;
}
function ReadyTag() {
  return <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-teal-400/30 bg-teal-400/10 px-1.5 py-0.5 text-[11px] font-medium text-teal-200">
      <CheckIcon size={11} aria-hidden />Ready
    </span>;
}
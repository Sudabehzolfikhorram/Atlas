import '@xyflow/react/dist/style.css';
import React from "react";
import { Box, Flex, IconButton, Menu, MenuButton, MenuGroup, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, useDisclosure } from "@chakra-ui/react";
import { ReactFlowProvider } from "@xyflow/react";
import { ChevronRightIcon, MaximizeIcon, TriangleAlertIcon } from "lucide-react";
import { SupplyGraphWorkspace } from "../supplyGraph/SupplyGraphWorkspace";
import { InfoTip } from "../ui/InfoTip";
import { cleanList, statusMeta } from "../../utils/supplyGraph";
import type { SupplyNode } from "../../types/supplyGraph";
import { SectionHeader } from "./CollapsibleSection";
interface Props {
  nodes: SupplyNode[];
  /** Nodes with red flags or a failed / pending status. */
  attention: SupplyNode[];
  onReveal: (nodeId: string) => void;
}

/** "Data supply chain" panel: the existing supply graph with an attention menu and full-screen view. */
export function DataSupplyChainPanel({
  nodes,
  attention,
  onReveal
}: Props) {
  const full = useDisclosure();
  return <Box as="section" aria-labelledby="dsc-title" className="glass overflow-hidden rounded-2xl">
      <SectionHeader id="dsc-title" title={<>Data supply chain<InfoTip label="Data supply chain">Every source, pipeline step, output and downstream consumer, with the connections between them. Select a node for its source, status, red flags and dependencies.</InfoTip></>}>
        {attention.length > 0 && <Menu placement="bottom-end">
            <MenuButton className="flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[12.5px] font-medium text-amber-200 transition-colors hover:bg-amber-400/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
              <span className="flex items-center gap-1.5"><TriangleAlertIcon size={14} aria-hidden />{attention.length} nodes need attention<ChevronRightIcon size={14} aria-hidden /></span>
            </MenuButton>
            <MenuList className="!max-h-[340px] !overflow-y-auto !rounded-xl !border">
              <MenuGroup title="Red flags or not completed">
                {attention.map((n) => {
              const st = n.data.details.status ? statusMeta[n.data.details.status] : null;
              const flags = cleanList(n.data.details.redFlags).length;
              return <MenuItem key={n.id} onClick={() => onReveal(n.id)} className="!mx-1.5 !w-auto !rounded-md !px-2.5 !py-2">
                      <span className="flex w-full items-center gap-2 text-[12.5px]">
                        {st && <span className={`h-2 w-2 shrink-0 rounded-full ${st.dot}`} aria-hidden />}
                        <span className="min-w-0 flex-1 truncate">{n.data.label}</span>
                        {flags > 0 && <span className="text-[11px] text-amber-300">{flags} flag{flags > 1 ? "s" : ""}</span>}
                      </span>
                    </MenuItem>;
            })}
              </MenuGroup>
            </MenuList>
          </Menu>}
        <span className="num rounded-md border border-white/[0.1] px-2 py-1 text-[11.5px] text-slate-300">{nodes.length} nodes</span>
        <IconButton aria-label="Open full screen" size="sm" variant="outline" icon={<MaximizeIcon size={14} />} onClick={full.onOpen} />
      </SectionHeader>
      <Box className="p-4">
        <ReactFlowProvider>
          <SupplyGraphWorkspace />
        </ReactFlowProvider>
      </Box>

      <Modal isOpen={full.isOpen} onClose={full.onClose} size="full" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent className="!m-4 !h-[calc(100vh-2rem)] !w-auto !max-w-none overflow-hidden !rounded-3xl">
          <ModalHeader className="!py-3">
            <Text className="text-[17px] font-semibold text-white">Data supply chain</Text>
            <Text className="text-[13px] font-normal text-slate-500">Esc to close · edits saved here also apply to the page</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="!pb-5">
            <ReactFlowProvider>
              <SupplyGraphWorkspace />
            </ReactFlowProvider>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>;
}

/** Nodes that need attention: any red flag, or a failed / pending status. */
export const needsAttention = (n: SupplyNode) => cleanList(n.data.details.redFlags).length > 0 || n.data.details.status === "failed" || n.data.details.status === "pending";

export function AttentionNote({
  children


}: {children: React.ReactNode;}) {
  return <Flex className="glass rounded-xl px-4 py-3 text-[12.5px] text-slate-400">{children}</Flex>;
}
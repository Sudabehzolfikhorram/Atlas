import React, { useEffect, useState } from "react";
import { Box, Button, Checkbox, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Textarea } from "@chakra-ui/react";
import { KeyRoundIcon } from "lucide-react";
import { currentUser } from "../../data/currentUser";
interface AuthorizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  title: string;
  description: string;
  consequences?: string[];
  confirmLabel?: string;
}
export function AuthorizeModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  consequences = [],
  confirmLabel = "Authorize & record"
}: AuthorizeModalProps) {
  const [reviewed, setReviewed] = useState(false);
  const [note, setNote] = useState("");
  useEffect(() => {
    if (isOpen) {
      setReviewed(false);
      setNote("");
    }
  }, [isOpen]);
  return <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader className="!pb-2">
          <Flex className="items-center gap-2.5">
            <Flex className="h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300">
              <KeyRoundIcon size={16} />
            </Flex>
            <Text className="text-[16px] font-semibold text-white">{title}</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text className="text-[13px] leading-relaxed text-slate-400">{description}</Text>
          {consequences.length > 0 && <Box as="ul" className="mt-4 space-y-1.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
              {consequences.map((c) => <Text as="li" key={c} className="flex gap-2 text-[13px] text-slate-300">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-500" />
                  {c}
                </Text>)}
            </Box>}
          <Flex className="mt-4 items-center justify-between rounded-xl border border-teal-400/20 bg-teal-400/[0.06] px-3 py-2.5">
            <Box>
              <Text className="text-[12px] text-slate-400">Signed in as</Text>
              <Text className="text-[13px] font-medium text-slate-100">
                {currentUser.name} · {currentUser.role}
              </Text>
            </Box>
            <Text className="text-[11px] font-medium text-teal-300">{currentUser.access}</Text>
          </Flex>
          <Textarea className="mt-4" placeholder="Decision rationale (recorded in audit trail)" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          <Checkbox className="mt-3" isChecked={reviewed} onChange={(e) => setReviewed(e.target.checked)}>
            <Text className="text-[13px] text-slate-300">I have reviewed the supporting evidence and its limitations</Text>
          </Checkbox>
        </ModalBody>
        <ModalFooter className="gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" isDisabled={!reviewed} onClick={() => onConfirm(note)}>
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>;
}
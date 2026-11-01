import React, { useEffect, useState } from "react";
import { Box, Button, FormControl, FormErrorMessage, FormHelperText, FormLabel, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Textarea } from "@chakra-ui/react";
import type { ReviewSubject } from "../../types/diligence";
export type PendingDecision = {
  id: string;
  title: string;
  subject: ReviewSubject;
  action: "accepted" | "rejected" | "reopen";
};
interface Props {
  pending: PendingDecision | null;
  onCancel: () => void;
  onConfirm: (comment: string) => void;
}
const subjectLabel: Record<ReviewSubject, string> = {
  finding: "finding",
  remediation: "remediation plan",
  closure: "closure"
};
const titles: Record<ReviewSubject, Record<PendingDecision["action"], string>> = {
  finding: {
    accepted: "Accept finding?",
    rejected: "Reject finding?",
    reopen: "Reopen finding?"
  },
  remediation: {
    accepted: "Approve remediation plan?",
    rejected: "Request changes to the plan?",
    reopen: "Reopen plan decision?"
  },
  closure: {
    accepted: "Approve closure?",
    rejected: "Return for more work?",
    reopen: "Reopen closed finding?"
  }
};
const buttons: Record<ReviewSubject, Record<PendingDecision["action"], string>> = {
  finding: {
    accepted: "Accept",
    rejected: "Reject",
    reopen: "Reopen"
  },
  remediation: {
    accepted: "Approve plan",
    rejected: "Request changes",
    reopen: "Reopen"
  },
  closure: {
    accepted: "Approve closure",
    rejected: "Return for more work",
    reopen: "Reopen"
  }
};

/** Confirmation step for consequential review decisions. Rejecting and reopening require a reason. */
export function ReviewDecisionModal({
  pending,
  onCancel,
  onConfirm
}: Props) {
  const [comment, setComment] = useState("");
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    setComment("");
    setTouched(false);
  }, [pending]);
  const required = pending?.action !== "accepted";
  const invalid = required && comment.trim().length < 5;
  const submit = () => {
    setTouched(true);
    if (!invalid) onConfirm(comment.trim());
  };
  return <Modal isOpen={!!pending} onClose={onCancel} isCentered size="md">
      <ModalOverlay />
      {pending && <ModalContent>
        <ModalHeader className="!pb-1">
          <Text className="text-[17px] font-semibold text-white">{titles[pending.subject][pending.action]}</Text>
          <Text className="mt-0.5 text-[12.5px] font-normal text-slate-400"><span className="num">{pending.id}</span> · {pending.title}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box className={`mb-3 rounded-lg border px-3 py-2 text-[12.5px] ${pending.action === "rejected" ? "border-rose-400/35 bg-rose-500/[0.08] text-rose-200" : "border-white/[0.08] bg-white/[0.02] text-slate-300"}`}>
            {pending.action === "accepted" && pending.subject === "finding" && "You confirm the finding is valid. This does not approve its remediation plan."}
            {pending.action === "accepted" && pending.subject === "remediation" && "You approve the proposed remediation for implementation by its owner."}
            {pending.action === "accepted" && pending.subject === "closure" && "Verification passed. Approving closes the finding; the test result and your decision stay on record."}
            {pending.action === "rejected" && pending.subject === "finding" && "The finding stays in the register, marked REJECTED, with your reason. It leaves the remediation queues but is not deleted."}
            {pending.action === "rejected" && pending.subject === "remediation" && "The plan returns to Diligence with your reason. The finding stays accepted."}
            {pending.action === "rejected" && pending.subject === "closure" && "The finding stays open. Remediation returns to In progress and must be verified again."}
            {pending.action === "reopen" && "The decision returns to pending review. The previous decision stays in the history."}
          </Box>
          <FormControl isRequired={required} isInvalid={touched && invalid}>
            <FormLabel className="!text-[12.5px]">{required ? "Reason" : "Comment (optional)"}</FormLabel>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} onBlur={() => setTouched(true)} rows={3} placeholder={pending.action === "rejected" ? "Why? What should change?" : "Add context for the audit trail"} />
            {touched && invalid ? <FormErrorMessage>Add a reason of at least 5 characters.</FormErrorMessage> : <FormHelperText className="!text-[11.5px]">Recorded with your name and the time in the audit trail.</FormHelperText>}
          </FormControl>
        </ModalBody>
        <ModalFooter className="gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant={pending.action === "rejected" ? "solid" : "primary"} colorScheme={pending.action === "rejected" ? "red" : undefined} onClick={submit}>
            {buttons[pending.subject][pending.action]}
          </Button>
        </ModalFooter>
      </ModalContent>}
    </Modal>;
}
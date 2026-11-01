import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Text, Textarea } from "@chakra-ui/react";
import { ClipboardCheckIcon, PencilLineIcon, RotateCcwIcon } from "lucide-react";
import type { ControlDesign } from "../../data/governance";
import { AuthorizeModal } from "../ui/AuthorizeModal";
import { DesignStageChip, type DesignStage } from "./DesignStageTrack";
export interface PilotReviewRecord {
  stage: Exclude<DesignStage, "proposed">;
  note: string;
  by: string;
  at: string;
}
interface Props {
  design: ControlDesign;
  controlName: string;
  review?: PilotReviewRecord;
  onRecord: (stage: PilotReviewRecord["stage"], note: string) => void;
  onReopen: () => void;
}

/** Records whether a proposed design is ready for a small-scale pilot. Separate from scheduling implementation. */
export function PilotReview({
  design,
  controlName,
  review,
  onRecord,
  onReopen
}: Props) {
  const [mode, setMode] = useState<"idle" | "revise">("idle");
  const [note, setNote] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  useEffect(() => {
    setMode("idle");
    setNote("");
  }, [design.controlId]);
  return <Box className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <Flex className="flex-wrap items-center justify-between gap-2">
        <Flex className="items-center gap-2">
          <ClipboardCheckIcon size={15} className="text-blue-300" aria-hidden />
          <Text className="text-[13.5px] font-medium text-slate-100">Review before pilot</Text>
        </Flex>
        <DesignStageChip stage={review?.stage ?? "proposed"} />
      </Flex>
      <Text className="mt-1 text-[12px] leading-relaxed text-slate-400">
        Decide whether {design.version} is ready for a small-scale pilot. This doesn't schedule implementation or change any live process.
      </Text>
      <Box className="mt-3 rounded-lg bg-white/[0.03] px-3 py-2 text-[12px]">
        <Text className="text-slate-500">Proposed pilot scope</Text>
        <Text className="text-slate-200">{design.pilotScope}</Text>
      </Box>

      {review ? <Box className="mt-3" role="status">
          <Text className="text-[12.5px] text-slate-200">
            {review.stage === "pilot" ? "Approved for pilot" : "Revisions requested"} by {review.by} · {review.at}
          </Text>
          {review.note && <Text className="mt-0.5 text-[12px] text-slate-400">“{review.note}”</Text>}
          <Button size="sm" variant="ghost" className="mt-2" leftIcon={<RotateCcwIcon size={13} />} onClick={onReopen}>Reopen review</Button>
        </Box> : mode === "revise" ? <Box className="mt-3">
          <Textarea aria-label="What needs to change" placeholder="What needs to change before a pilot? (required, recorded in audit trail)" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          <Flex className="mt-2 justify-end gap-2">
            <Button size="sm" onClick={() => setMode("idle")}>Cancel</Button>
            <Button size="sm" variant="primary" isDisabled={!note.trim()} onClick={() => onRecord("revise", note.trim())}>Record revisions</Button>
          </Flex>
        </Box> : <Flex className="mt-3 flex-wrap gap-2">
          <Button size="sm" variant="primary" leftIcon={<ClipboardCheckIcon size={13} />} onClick={() => setAuthOpen(true)}>Ready for pilot</Button>
          <Button size="sm" variant="outline" leftIcon={<PencilLineIcon size={13} />} onClick={() => setMode("revise")}>Needs revisions</Button>
        </Flex>}

      <AuthorizeModal isOpen={authOpen} onClose={() => setAuthOpen(false)} title="Approve design for pilot" description={`${controlName} · ${design.version}`} consequences={[`Pilot scope: ${design.pilotScope}`, "Approves a trial only — not a live implementation", "Scheduling implementation remains a separate decision"]} confirmLabel="Approve for pilot" onConfirm={(n) => {
      onRecord("pilot", n);
      setAuthOpen(false);
    }} />
    </Box>;
}
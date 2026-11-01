import React from "react";
import { Button, Flex, Text } from "@chakra-ui/react";
import { PlusIcon, RotateCcwIcon, SaveIcon, Trash2Icon, XIcon } from "lucide-react";
import { ZoomGroup } from "./SupplyGraphToolbar";
interface Props {
  dirty: boolean;
  canDelete: boolean;
  onAdd: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onCancel: () => void;
  onSave: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}
export function SupplyGraphEditBar({
  dirty,
  canDelete,
  onAdd,
  onDelete,
  onRestore,
  onCancel,
  onSave,
  ...zoom
}: Props) {
  return <Flex className="flex-wrap items-center gap-2 border-b border-violet-400/25 bg-violet-500/[0.06] px-3 py-2.5">
      <span className="inline-flex items-center gap-1.5 rounded-md border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-[11.5px] font-medium text-violet-200">
        <span className="h-1.5 w-1.5 rounded-full bg-violet-300" aria-hidden />
        Editing graph
      </span>
      <Button size="sm" variant="outline" leftIcon={<PlusIcon size={13} />} onClick={onAdd}>Add node</Button>
      <Button size="sm" variant="ghost" leftIcon={<Trash2Icon size={13} />} onClick={onDelete} isDisabled={!canDelete}>Delete selected</Button>
      <Button size="sm" variant="ghost" leftIcon={<RotateCcwIcon size={13} />} onClick={onRestore}>Restore original</Button>
      <ZoomGroup {...zoom} />
      <Flex className="ml-auto items-center gap-2">
        <Text className="text-[11.5px] text-slate-400" aria-live="polite">{dirty ? "Unsaved changes" : "No changes yet"}</Text>
        <Button size="sm" variant="ghost" leftIcon={<XIcon size={13} />} onClick={onCancel}>Cancel</Button>
        <Button size="sm" variant="primary" leftIcon={<SaveIcon size={13} />} onClick={onSave}>Save & exit</Button>
      </Flex>
    </Flex>;
}
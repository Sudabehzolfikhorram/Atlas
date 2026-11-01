import React from "react";
import { Button, Flex } from "@chakra-ui/react";
import { ChevronDownIcon } from "lucide-react";
interface Props {
  expanded: boolean;
  hiddenCount: number;
  onToggle: () => void;
  controls?: string;
}

/** "View more (N)" / "View less" toggle for lists that start collapsed. Renders nothing when there's nothing hidden. */
export function ViewMoreButton({
  expanded,
  hiddenCount,
  onToggle,
  controls
}: Props) {
  if (hiddenCount <= 0 && !expanded) return null;
  return <Flex className="justify-center border-t border-white/[0.05] px-5 py-2.5">
      <Button size="sm" variant="ghost" aria-expanded={expanded} aria-controls={controls} rightIcon={<ChevronDownIcon size={15} className={`transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden />} onClick={onToggle} className="!text-[13px]">
        {expanded ? "View less" : `View more (${hiddenCount})`}
      </Button>
    </Flex>;
}
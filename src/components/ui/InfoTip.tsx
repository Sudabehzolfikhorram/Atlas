import React, { useState } from "react";
import { Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger } from "@chakra-ui/react";
import { InfoIcon } from "lucide-react";
interface Props {
  /** What the explanation is about, used for the accessible name. */
  label: string;
  children: React.ReactNode;
}

/** Info icon that reveals supporting context on hover, keyboard focus, or click/tap (click pins it open). */
export function InfoTip({
  label,
  children
}: Props) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const close = () => {
    setOpen(false);
    setPinned(false);
  };
  return <Popover isOpen={open} onClose={close} placement="bottom-start" isLazy returnFocusOnClose={false} autoFocus={false}>
      <PopoverTrigger>
        <button type="button" aria-label={`About ${label}`} aria-expanded={open} onMouseEnter={() => setOpen(true)} onMouseLeave={() => !pinned && setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => !pinned && setOpen(false)} onClick={() => {
        if (pinned) close();else {
          setPinned(true);
          setOpen(true);
        }
      }} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
          <InfoIcon size={16} aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="!w-auto !max-w-[320px]">
        <PopoverArrow />
        <PopoverBody className="text-[13px] leading-relaxed text-slate-200">{children}</PopoverBody>
      </PopoverContent>
    </Popover>;
}
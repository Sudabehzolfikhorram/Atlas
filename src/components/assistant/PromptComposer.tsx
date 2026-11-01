import React, { useEffect, useRef } from "react";
import { Box, Flex, IconButton, Spinner, Textarea } from "@chakra-ui/react";
import { ArrowUpIcon } from "lucide-react";
import { AiIcon } from "./AiIcon";
interface PromptComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  loading?: boolean;
  disabled?: boolean;
  size?: "lg" | "md";
  autoFocus?: boolean;
}
const MAX_HEIGHT = 168;
export function PromptComposer({
  value,
  onChange,
  onSubmit,
  placeholder,
  ariaLabel,
  loading = false,
  disabled = false,
  size = "lg",
  autoFocus = false
}: PromptComposerProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !loading && !disabled;
  const lg = size === "lg";
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);
  const submit = () => {
    if (canSend) onSubmit(value);
  };
  return <Box className={`composer-ring rounded-[20px] p-px ${disabled ? "opacity-60" : ""}`}>
      <Flex className={`items-center gap-3 rounded-[19px] bg-[#0B1222]/85 backdrop-blur-xl ${lg ? "px-4 py-3" : "px-3 py-2.5"}`}>
        <AiIcon size={lg ? 32 : 28} />
        <Textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
          e.preventDefault();
          submit();
        }
      }} placeholder={placeholder} aria-label={ariaLabel} isDisabled={disabled} readOnly={loading} rows={1} resize="none" variant="unstyled" className={`!min-h-0 flex-1 !overflow-y-auto !py-1.5 leading-relaxed !text-slate-100 placeholder:!text-slate-500 ${lg ? "!text-[15px]" : "!text-[14px]"}`} />
        <IconButton aria-label={loading ? "Sending" : "Send"} onClick={submit} isDisabled={!canSend && !loading} aria-busy={loading} variant="primary" className={`!shrink-0 !rounded-full ${lg ? "!h-10 !w-10" : "!h-9 !w-9"} disabled:!bg-white/10 disabled:!text-slate-500 disabled:!opacity-100`} icon={loading ? <Spinner size="sm" thickness="2px" speed="0.7s" color="white" /> : <ArrowUpIcon size={17} />} />
      </Flex>
    </Box>;
}
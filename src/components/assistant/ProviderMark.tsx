import React from "react";
import { PlugIcon } from "lucide-react";
import type { ProviderKey } from "../../types/assistant";
import { AiIcon } from "./AiIcon";
const marks: Record<Exclude<ProviderKey, "atlas" | "custom">, {
  label: string;
  cls: string;
}> = {
  anthropic: {
    label: "A",
    cls: "bg-amber-200/10 text-amber-200"
  },
  openai: {
    label: "O",
    cls: "bg-teal-300/10 text-teal-200"
  },
  azure: {
    label: "Az",
    cls: "bg-sky-300/10 text-sky-200"
  }
};
export function ProviderMark({
  provider


}: {provider: ProviderKey;}) {
  const base = "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10";
  if (provider === "atlas") {
    return <span className={`${base} bg-white/[0.04]`}>
        <AiIcon size={26} />
      </span>;
  }
  if (provider === "custom") {
    return <span className={`${base} bg-violet-300/10 text-violet-200`}>
        <PlugIcon size={15} aria-hidden />
      </span>;
  }
  const m = marks[provider];
  return <span className={`${base} text-[13px] font-semibold ${m.cls}`} aria-hidden>{m.label}</span>;
}
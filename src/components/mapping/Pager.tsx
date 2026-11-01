import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
interface Props {
  page: number;
  pageSize: number;
  total: number;
  noun: string;
  onPage: (p: number) => void;
  children?: React.ReactNode;
}
const btn = "flex h-7 min-w-[28px] items-center justify-center rounded-md border px-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-40";

/** "1–8 of N" range label with compact numbered pagination. */
export function Pager({
  page,
  pageSize,
  total,
  noun,
  onPage,
  children
}: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  const shown = Array.from(new Set([0, page - 1, page, page + 1, pages - 1])).filter((p) => p >= 0 && p < pages).sort((a, b) => a - b);
  return <Flex className="flex-wrap items-center gap-3 px-5 py-3">
      <Text className="num text-[12px] text-slate-500">{from}–{to} of {total.toLocaleString()} {noun}</Text>
      <Flex as="nav" aria-label={`${noun} pages`} className="ml-auto items-center gap-1">
        {children}
        <button type="button" aria-label="Previous page" disabled={page === 0} onClick={() => onPage(page - 1)} className={`${btn} border-white/[0.08] text-slate-400 hover:text-white`}><ChevronLeftIcon size={13} /></button>
        {shown.map((p, i) => <React.Fragment key={p}>
            {i > 0 && p - shown[i - 1] > 1 && <span className="px-0.5 text-[12px] text-slate-600">…</span>}
            <button type="button" aria-current={p === page ? "page" : undefined} onClick={() => onPage(p)} className={`${btn} num ${p === page ? "border-blue-400/60 bg-blue-500/15 text-white" : "border-transparent text-slate-400 hover:text-white"}`}>{p + 1}</button>
          </React.Fragment>)}
        <button type="button" aria-label="Next page" disabled={page >= pages - 1} onClick={() => onPage(page + 1)} className={`${btn} border-white/[0.08] text-slate-400 hover:text-white`}><ChevronRightIcon size={13} /></button>
      </Flex>
    </Flex>;
}
import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, Heading, Input, InputGroup, InputLeftElement, Select, Text } from "@chakra-ui/react";
import { SearchIcon } from "lucide-react";
import type { Permit, PermitStatus } from "../../types/outcomes";
interface Props {
  permits: Permit[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}
const PAGE = 15;
const statusChip: Record<PermitStatus, string> = {
  closed: "text-emerald-300",
  open: "text-blue-300",
  rejected: "text-rose-300",
  unknown: "text-slate-400"
};

/** Right rail: searchable, paged list of permits. Selecting one traces its path on the graph. */
export function PermitTable({
  permits,
  selectedId,
  onSelect
}: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PermitStatus | "all">("all");
  const [page, setPage] = useState(0);
  const filtered = useMemo(() => permits.filter((p) => (status === "all" || p.status === status) && (!query.trim() || String(p.id).includes(query.trim()))), [permits, status, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  useEffect(() => setPage(0), [query, status, permits]);
  const rows = filtered.slice(page * PAGE, page * PAGE + PAGE);
  return <Box as="aside" aria-labelledby="oc-permits" className="glass-tile flex flex-col rounded-2xl border border-white/[0.07] p-5">
      <Heading as="h3" id="oc-permits" className="!text-[15px] !font-semibold text-slate-100">Travel permits</Heading>
      <InputGroup size="sm" className="mt-4">
        <InputLeftElement pointerEvents="none"><SearchIcon size={13} className="text-slate-500" /></InputLeftElement>
        <Input placeholder="search permit id…" aria-label="Search permit id" inputMode="numeric" value={query} onChange={(e) => setQuery(e.target.value)} className="!rounded-lg" />
      </InputGroup>
      <Flex className="mt-3 items-center gap-2">
        <Text as="label" htmlFor="oc-status" className="text-[12.5px] text-slate-300">Status</Text>
        <Select id="oc-status" size="sm" value={status} onChange={(e) => setStatus(e.target.value as PermitStatus | "all")} className="!rounded-lg">
          <option value="all">all</option>
          <option value="closed">closed</option>
          <option value="open">open</option>
          <option value="rejected">rejected</option>
          <option value="unknown">unknown</option>
        </Select>
      </Flex>
      <Flex className="mt-3 items-center gap-2">
        <Text className="num text-[12px] text-slate-400">{filtered.length.toLocaleString("en-US")} permits</Text>
        <Flex className="ml-auto items-center gap-1.5">
          <Button size="xs" variant="outline" isDisabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <Text className="num text-[11.5px] text-slate-400">{page + 1} / {pages}</Text>
          <Button size="xs" variant="outline" isDisabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </Flex>
      </Flex>
      <Box className="mt-3 border-t border-white/[0.07]">
        <Flex className="px-2 py-2 text-[11.5px] font-medium text-slate-400">
          <span className="flex-1">Permit</span>
          <span className="flex-1">Org unit</span>
        </Flex>
        {rows.length === 0 ? <Text className="px-2 py-6 text-center text-[12px] text-slate-500">No permits match. Clear the search or change the status.</Text> : <ul>
            {rows.map((p) => {
          const on = selectedId === p.id;
          return <li key={p.id}>
                  <button type="button" aria-pressed={on} onClick={() => onSelect(on ? null : p.id)} className={`flex w-full items-center border-t border-white/[0.05] px-2 py-2 text-left text-[12.5px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "bg-blue-500/[0.12] text-white" : "text-slate-200 hover:bg-white/[0.03]"}`}>
                    <span className="flex-1 truncate">
                      travel permit <span className="num">{p.id}</span>
                      <span className={`ml-1.5 text-[10.5px] ${statusChip[p.status]}`}>· {p.status}</span>
                    </span>
                    <span className="flex-1 truncate text-slate-300">organizational unit <span className="num">{p.orgUnit}</span></span>
                  </button>
                </li>;
        })}
          </ul>}
      </Box>
    </Box>;
}
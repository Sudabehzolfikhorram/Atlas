import React, { useState } from "react";
import { Box, Button, Flex, Input, InputGroup, InputLeftElement, Text } from "@chakra-ui/react";
import { BotIcon, DownloadIcon, SearchIcon, UserIcon } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { useAudit } from "../contexts/AuditContext";
import { dateTime } from "../utils/format";
import type { AuditCategory } from "../types/intel";
const categories: ("All" | AuditCategory)[] = ["All", "Investigation", "Graph edit", "Recommendation", "Approval", "Governance", "Access", "Task"];
const catColor: Record<AuditCategory, string> = {
  Investigation: "text-blue-300 bg-blue-400/10",
  "Graph edit": "text-violet-300 bg-violet-400/10",
  Recommendation: "text-violet-300 bg-violet-400/10",
  Approval: "text-teal-300 bg-teal-400/10",
  Governance: "text-teal-300 bg-teal-400/10",
  Access: "text-amber-300 bg-amber-400/10",
  Task: "text-slate-300 bg-white/[0.06]"
};
export function AuditActivity() {
  const {
    entries
  } = useAudit();
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const [q, setQ] = useState("");
  const filtered = entries.filter((e) => (cat === "All" || e.category === cat) && `${e.action} ${e.target} ${e.actor} ${e.detail ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  return <Box className="space-y-6">
      <PageHeader eyebrow="Audit & activity" title="Audit Trail" description="An immutable record of investigations, graph modifications, recommendations, approvals and governance decisions." actions={<Button leftIcon={<DownloadIcon size={14} />}>Export log</Button>} />
      <Flex id="audit-log" className="flex-col gap-3 rounded-2xl md:flex-row md:items-center">
        <Flex className="flex-wrap gap-1.5">
          {categories.map((c) => <Button key={c} size="xs" onClick={() => setCat(c)} aria-pressed={cat === c} className={cat === c ? "!bg-white/[0.12] !text-white" : "!text-slate-400"}>
              {c}
            </Button>)}
        </Flex>
        <InputGroup size="sm" className="md:ml-auto md:!w-72">
          <InputLeftElement pointerEvents="none"><SearchIcon size={14} className="text-slate-500" /></InputLeftElement>
          <Input placeholder="Search activity…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search audit trail" />
        </InputGroup>
      </Flex>

      <Box className="glass overflow-hidden rounded-2xl">
        {filtered.length === 0 ? <Text className="py-12 text-center text-[13px] text-slate-500">No activity matches your filters.</Text> : <Box as="ol">
            {filtered.map((e) => <Flex as="li" key={e.id} className="gap-4 border-b border-white/[0.05] px-5 py-4 last:border-b-0">
                <Flex className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-slate-400">
                  {e.role === "System" ? <BotIcon size={14} /> : <UserIcon size={14} />}
                </Flex>
                <Box className="min-w-0 flex-1">
                  <Flex className="flex-wrap items-center gap-2">
                    <Text className="text-[13px] font-medium text-slate-100">{e.action}</Text>
                    <span className={`rounded px-1.5 py-0.5 text-[10.5px] font-medium ${catColor[e.category]}`}>{e.category}</span>
                  </Flex>
                  <Text className="mt-0.5 text-[13px] text-slate-300">{e.target}</Text>
                  {e.detail && <Text className="mt-0.5 text-[12px] text-slate-500">{e.detail}</Text>}
                  <Text className="mt-1 text-[11px] text-slate-500">{e.actor} · {e.role}</Text>
                </Box>
                <Box className="shrink-0 text-right">
                  <Text className="num text-[12px] text-slate-400">{dateTime(e.timestamp)}</Text>
                  <Text className="num font-mono text-[11px] text-slate-600">{e.id}</Text>
                </Box>
              </Flex>)}
          </Box>}
      </Box>
    </Box>;
}
import React from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon, TriangleAlertIcon } from "lucide-react";
import { teams } from "../../data/teamGraph";
import type { TeamRelation } from "../../types/teamGraph";
import { getTeam, healthMeta, relationMeta } from "../../utils/teamGraph";
import { healthIcons, relationIcons } from "./teamGraphIcons";
interface Props {
  relation: TeamRelation;
  backLabel: string;
  onBack: () => void;
  onSelectTeam: (id: string) => void;
}

/** Details for one connection: type, direction, process, evidence, owner and risks. */
export function RelationshipDetail({
  relation: r,
  backLabel,
  onBack,
  onSelectTeam
}: Props) {
  const src = getTeam(teams, r.source);
  const tgt = getTeam(teams, r.target);
  const h = healthMeta[r.evidence];
  const HIcon = healthIcons[r.evidence];
  const TIcon = relationIcons[r.type];
  const rows: [string, React.ReactNode][] = [["Associated process", r.process], ["Accountable owner", r.owner], ["Last verified", r.lastVerified ?? <span className="italic text-slate-500">Not available</span>]];
  return <Box>
      <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1 rounded text-[12px] text-slate-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
        <ArrowLeftIcon size={12} /> {backLabel}
      </button>
      <Flex className="items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-400/25 bg-blue-400/10 text-blue-300"><TIcon size={14} aria-hidden /></span>
        <Box>
          <Text className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-slate-500">Connection</Text>
          <Text className="text-[15px] font-semibold text-white">{relationMeta[r.type].label}</Text>
        </Box>
        <span className={`ml-auto inline-flex items-center gap-1 rounded border px-1.5 text-[10.5px] font-medium leading-[18px] ${h.chip}`}><HIcon size={11} aria-hidden />{h.label}</span>
      </Flex>

      <Flex className="mt-3 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5 text-[12.5px]">
        <button type="button" onClick={() => onSelectTeam(r.source)} className="min-w-0 truncate rounded font-medium text-slate-100 hover:text-blue-300">{src?.name}</button>
        <ArrowRightIcon size={13} className="shrink-0 text-slate-500" aria-label="to" />
        <button type="button" onClick={() => onSelectTeam(r.target)} className="min-w-0 truncate rounded font-medium text-slate-100 hover:text-blue-300">{tgt?.name}</button>
      </Flex>

      <Text className="mt-3 text-[13px] leading-relaxed text-slate-300">{r.description}</Text>

      <Box as="dl" className="mt-2">
        {rows.map(([k, v]) => <Flex key={k} className="justify-between gap-3 border-t border-white/[0.06] py-2 text-[12.5px]">
            <Text as="dt" className="text-slate-500">{k}</Text>
            <Box as="dd" className="text-right text-slate-200">{v}</Box>
          </Flex>)}
      </Box>

      <Text className="mt-3 text-[10.5px] font-medium uppercase tracking-[0.08em] text-slate-500">Risks on this connection</Text>
      {r.risks?.length ? <Box as="ul" className="mt-1.5 space-y-1.5">
          {r.risks.map((x) => <Flex as="li" key={x} className="items-start gap-2 text-[12.5px] text-slate-300"><TriangleAlertIcon size={12} className="mt-0.5 shrink-0 text-amber-300" aria-hidden />{x}</Flex>)}
        </Box> : <Text className="mt-1 text-[12.5px] text-slate-500">None recorded</Text>}

      <Flex className="mt-4 gap-2">
        <Button size="xs" variant="outline" onClick={() => onSelectTeam(r.source)}>Open {src?.name}</Button>
        <Button size="xs" variant="outline" onClick={() => onSelectTeam(r.target)}>Open {tgt?.name}</Button>
      </Flex>
    </Box>;
}
import React, { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { ChevronRightIcon, TriangleAlertIcon } from "lucide-react";
import { teamRelations, teams } from "../../data/teamGraph";
import type { Team, TeamRelation } from "../../types/teamGraph";
import { coverage, coverageHealth, escalationPath, getTeam, healthMeta, neighborsOf, relationMeta, relationsOf, severityChip } from "../../utils/teamGraph";
import { healthIcons, relationIcons } from "./teamGraphIcons";
type Tab = "overview" | "people" | "connections" | "processes" | "evidence" | "risks";
interface Props {
  team: Team;
  onSelectTeam: (id: string) => void;
  onSelectRelation: (id: string) => void;
}
const nameOf = (id: string) => getTeam(teams, id)?.name ?? id;
function HealthChip({
  status


}: {status: Team["status"];}) {
  const h = healthMeta[status];
  const Icon = healthIcons[status];
  return <span className={`inline-flex shrink-0 items-center gap-1 rounded border px-1.5 text-[10px] font-medium leading-[16px] ${h.chip}`}><Icon size={10} aria-hidden />{h.label}</span>;
}
function Eyebrow({
  children


}: {children: React.ReactNode;}) {
  return <Text className="mb-1.5 mt-4 text-[10.5px] font-medium uppercase tracking-[0.08em] text-slate-500 first:mt-0">{children}</Text>;
}

/** Right-hand intelligence panel for the selected team. */
export function TeamIntelPanel({
  team,
  onSelectTeam,
  onSelectRelation
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const cov = coverage(team);
  const covH = healthMeta[coverageHealth(cov.pct)];
  const {
    incoming,
    outgoing
  } = relationsOf(team.id, teamRelations);
  const connectionRisks = [...incoming, ...outgoing].flatMap((r) => (r.risks ?? []).map((risk) => ({
    risk,
    r
  })));
  const tabs: {
    id: Tab;
    label: string;
  }[] = [{
    id: "overview",
    label: "Overview"
  }, {
    id: "people",
    label: "People"
  }, {
    id: "connections",
    label: "Connections"
  }, {
    id: "processes",
    label: "Processes"
  }, {
    id: "evidence",
    label: "Evidence"
  }, {
    id: "risks",
    label: `Risks (${team.risks.length + connectionRisks.length})`
  }];
  const metrics: [string, number][] = [["Connected teams", neighborsOf(team.id, teamRelations).size], ["Processes", team.processes.length], ["Data assets", team.assets.length], ["Open actions", team.openActions]];
  return <Box>
      <Box className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
        <Flex className="items-center justify-between gap-2">
          <Text className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-slate-500">Evidence coverage</Text>
          <HealthChip status={coverageHealth(cov.pct)} />
        </Flex>
        <Flex className="mt-1 items-baseline gap-2">
          <Text className={`num text-[28px] font-semibold leading-none ${covH.text}`}>{cov.pct}%</Text>
          <Text className="text-[12px] text-slate-400">{cov.available} of {cov.required} required items</Text>
        </Flex>
        <Box className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-valuenow={cov.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Evidence coverage">
          <Box className={`h-full rounded-full ${covH.bar}`} style={{
          width: `${cov.pct}%`
        }} />
        </Box>
        <Text className="mt-1.5 text-[11px] text-slate-500">
          Last verified {cov.lastVerified ?? "—"} · {cov.gaps} of {team.evidence.length} evidence sets incomplete or outdated
        </Text>
      </Box>

      <Box className="mt-2.5 grid grid-cols-4 gap-1.5">
        {metrics.map(([k, v]) => <Box key={k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-center">
            <Text className="num text-[15px] font-semibold text-white">{v}</Text>
            <Text className="text-[10px] leading-tight text-slate-500">{k}</Text>
          </Box>)}
      </Box>

      <Flex role="tablist" aria-label="Team details" className="mt-3 gap-0.5 overflow-x-auto border-b border-white/[0.07]">
        {tabs.map((t) => <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`shrink-0 border-b-2 px-2 pb-1.5 pt-1 text-[11.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${tab === t.id ? "border-blue-400 text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}>
            {t.label}
          </button>)}
      </Flex>

      <Box role="tabpanel" className="pt-3 text-[12.5px]">
        {tab === "overview" && <>
            <Text className="leading-relaxed text-slate-300">{team.function}</Text>
            <Box as="dl" className="mt-2">
              {([["Lead", `${team.lead.name} · ${team.lead.role}`], ["Members", String(team.members)], ["Status", <HealthChip key="s" status={team.status} />], ["Avg. approval time", team.avgApprovalDays != null ? `${team.avgApprovalDays} days` : "Not available"], ["Last activity", team.lastActivity], ["Last review", team.lastReview ?? "Not available"]] as [string, React.ReactNode][]).map(([k, v]) => <Flex key={k} className="justify-between gap-3 border-t border-white/[0.06] py-1.5">
                  <Text as="dt" className="text-slate-500">{k}</Text>
                  <Box as="dd" className="text-right text-slate-200">{v}</Box>
                </Flex>)}
            </Box>
            <Eyebrow>Primary responsibilities</Eyebrow>
            <Box as="ul" className="space-y-1">
              {team.responsibilities.map((r) => <Flex as="li" key={r} className="gap-2 text-slate-300"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-500" />{r}</Flex>)}
            </Box>
          </>}

        {tab === "people" && <>
            <Box as="ul" className="space-y-1.5">
              {team.people.map((p) => <Flex as="li" key={`${p.name}-${p.assignment}`} className={`items-start gap-2 rounded-lg border px-2.5 py-2 ${p.vacant ? "border-rose-400/30 bg-rose-400/[0.06]" : "border-white/[0.06] bg-white/[0.02]"}`}>
                  <Box className="min-w-0 flex-1">
                    <Text className={`font-medium ${p.vacant ? "text-rose-300" : "text-slate-100"}`}>{p.name}</Text>
                    <Text className="text-[11.5px] text-slate-400">{p.role} · {p.assignment}</Text>
                  </Box>
                  <span className="shrink-0 rounded border border-white/[0.1] px-1.5 text-[10px] leading-[16px] text-slate-300">{p.raci}</span>
                </Flex>)}
            </Box>
            <Eyebrow>Critical data assets owned</Eyebrow>
            <Flex className="flex-wrap gap-1.5">
              {team.assets.map((a) => <span key={a} className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11.5px] text-slate-300">{a}</span>)}
            </Flex>
            <Eyebrow>Accountable to</Eyebrow>
            <Text className="text-slate-300">{escalationPath(team.id, teamRelations).map(nameOf).join(" → ") || "Top of the escalation path"}</Text>
            <Eyebrow>Supporting teams</Eyebrow>
            <Text className="text-slate-300">{incoming.filter((r) => r.type === "provisioning" || r.type === "ownership").map((r) => nameOf(r.source)).join(", ") || "None recorded"}</Text>
          </>}

        {tab === "connections" && <>
            <Eyebrow>Escalation path</Eyebrow>
            <Flex className="flex-wrap items-center gap-1 text-slate-300">
              <span className="font-medium text-white">{team.name}</span>
              {escalationPath(team.id, teamRelations).map((id) => <React.Fragment key={id}><ChevronRightIcon size={12} className="text-slate-600" /><button type="button" onClick={() => onSelectTeam(id)} className="hover:text-blue-300">{nameOf(id)}</button></React.Fragment>)}
            </Flex>
            <Eyebrow>Receives from (upstream · {incoming.length})</Eyebrow>
            <RelationList rels={incoming} other="source" onSelect={onSelectRelation} />
            <Eyebrow>Provides to (downstream · {outgoing.length})</Eyebrow>
            <RelationList rels={outgoing} other="target" onSelect={onSelectRelation} />
          </>}

        {tab === "processes" && <Box as="ul" className="space-y-2">
            {team.processes.map((p) => <Box as="li" key={p.name} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                <Flex className="items-start justify-between gap-2">
                  <Box className="min-w-0">
                    <Text className="font-medium text-slate-100">{p.name}</Text>
                    <Text className="text-[11px] text-slate-500">{p.role} · {p.stage}</Text>
                  </Box>
                  <HealthChip status={p.status} />
                </Flex>
                <Flex className="mt-1.5 flex-wrap gap-1">
                  {p.controls.map((c) => <span key={c} className="rounded border border-white/[0.08] px-1.5 text-[10.5px] text-slate-400">{c}</span>)}
                </Flex>
                {p.bottleneck && <Flex className="mt-1.5 items-start gap-1.5 text-[11.5px] text-amber-300"><TriangleAlertIcon size={11} className="mt-0.5 shrink-0" />{p.bottleneck}</Flex>}
              </Box>)}
          </Box>}

        {tab === "evidence" && <Box as="ul" className="space-y-2">
            {team.evidence.map((e) => {
          const pct = e.required ? Math.round(e.available / e.required * 100) : 0;
          return <Box as="li" key={e.item} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                  <Flex className="items-center justify-between gap-2">
                    <Text className="font-medium text-slate-100">{e.item}</Text>
                    <HealthChip status={e.status} />
                  </Flex>
                  <Flex className="mt-1.5 items-center gap-2">
                    <Box className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.08]"><Box className={`h-full rounded-full ${healthMeta[e.status].bar}`} style={{
                  width: `${pct}%`
                }} /></Box>
                    <Text className="num text-[11px] text-slate-400">{e.available}/{e.required}</Text>
                  </Flex>
                  <Text className="mt-1 text-[11px] text-slate-500">{e.source} · {e.owner} · verified {e.lastVerified ?? "—"}</Text>
                  {e.note && <Text className="mt-0.5 text-[11.5px] text-amber-300">{e.note}</Text>}
                </Box>;
        })}
          </Box>}

        {tab === "risks" && <Box as="ul" className="space-y-1.5">
            {team.risks.map((r) => <Flex as="li" key={r.title} className="items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                <span className={`mt-0.5 shrink-0 rounded border px-1.5 text-[10px] font-medium leading-[16px] ${severityChip[r.severity]}`}>{r.severity}</span>
                <Box><Text className="text-slate-200">{r.title}</Text><Text className="text-[11px] text-slate-500">{r.kind}</Text></Box>
              </Flex>)}
            {connectionRisks.map(({
          risk,
          r
        }) => <Flex as="li" key={`${r.id}-${risk}`} className="items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                <TriangleAlertIcon size={12} className="mt-1 shrink-0 text-amber-300" aria-hidden />
                <Box>
                  <Text className="text-slate-200">{risk}</Text>
                  <button type="button" onClick={() => onSelectRelation(r.id)} className="text-[11px] text-slate-500 hover:text-blue-300">On connection: {r.process}</button>
                </Box>
              </Flex>)}
            {!team.risks.length && !connectionRisks.length && <Text className="text-slate-500">No open risks recorded.</Text>}
          </Box>}
      </Box>
    </Box>;
}
function RelationList({
  rels,
  other,
  onSelect




}: {rels: TeamRelation[];other: "source" | "target";onSelect: (id: string) => void;}) {
  if (!rels.length) return <Text className="text-slate-500">None recorded</Text>;
  return <Box as="ul" className="space-y-1">
      {rels.map((r) => {
      const Icon = relationIcons[r.type];
      return <Box as="li" key={r.id}>
            <button type="button" onClick={() => onSelect(r.id)} className="flex w-full items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-left transition-colors hover:border-blue-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              <Icon size={13} className="shrink-0 text-blue-300" aria-hidden />
              <Box className="min-w-0 flex-1">
                <Text className="truncate font-medium text-slate-100">{nameOf(r[other])}</Text>
                <Text className="truncate text-[11px] text-slate-500">{relationMeta[r.type].label} · {r.process}</Text>
              </Box>
              <HealthChip status={r.evidence} />
            </button>
          </Box>;
    })}
    </Box>;
}
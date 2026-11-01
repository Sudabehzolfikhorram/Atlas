import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { CheckIcon, CircleIcon, ExternalLinkIcon, FlaskConicalIcon, HelpCircleIcon, LightbulbIcon, UserIcon } from "lucide-react";
import type { BusinessPriority } from "../../types/priorities";
import { EvidenceTag } from "../ui/EvidenceTag";
import { SeverityTag } from "../ui/SeverityTag";
import { impactKindMeta, statusMeta } from "../../utils/priorities";
import { QualityIndicators } from "./QualityIndicators";
export type DetailTab = "overview" | "evidence" | "analysis" | "options";
export const detailTabs: {
  id: DetailTab;
  label: string;
}[] = [{
  id: "overview",
  label: "Overview & Impact"
}, {
  id: "evidence",
  label: "Evidence & Sources"
}, {
  id: "analysis",
  label: "AI Recommendation"
}, {
  id: "options",
  label: "Outcomes & Risks"
}];
interface PersonEntry {
  name: string;
  role: string;
  relations: string[];
  approval?: boolean;
}

/** One entry per person, merging affected people, decision-maker, stakeholders and approvers. */
function mergePeople(item: BusinessPriority): PersonEntry[] {
  const map = new Map<string, PersonEntry>();
  const add = (name: string, role: string, relation?: string) => {
    const cur = map.get(name) ?? {
      name,
      role,
      relations: []
    };
    if (relation && !cur.relations.includes(relation)) cur.relations.push(relation);
    map.set(name, cur);
    return cur;
  };
  const o = item.ownership;
  add(o.decisionMaker.name, o.decisionMaker.role, "Decision-maker");
  item.affected.people.forEach((p) => add(p.name, p.role, p.relation));
  o.stakeholders.forEach((s) => add(s.name, s.role, "Stakeholder"));
  o.approvals.forEach((a) => {
    add(a.name, a.role).approval = a.done;
  });
  return Array.from(map.values());
}
const Label = ({
  children


}: {children: React.ReactNode;}) => <Text className="mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-slate-500">{children}</Text>;
const Block = ({
  children,
  className = ""



}: {children: React.ReactNode;className?: string;}) => <Box className={`rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 ${className}`}>{children}</Box>;
function PeopleInvolved({
  item


}: {item: BusinessPriority;}) {
  const people = mergePeople(item);
  const approvals = item.ownership.approvals;
  const done = approvals.filter((a) => a.done).length;
  const deps = item.ownership.dependencies;
  return <Box className="border-t border-white/10 pt-4">
      <Flex className="items-baseline justify-between gap-3">
        <Label>People involved</Label>
        {approvals.length > 0 && <Text className="mb-1.5 text-[11px] text-slate-500">
            Approvals <span className="num text-slate-300">{done}/{approvals.length}</span>
          </Text>}
      </Flex>
      <Box className="grid gap-2 sm:grid-cols-2">
        {people.map((p) => <Flex key={p.name} className="items-center gap-2.5 rounded-lg border border-white/[0.06] px-3 py-2">
            <Flex className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-slate-400"><UserIcon size={13} /></Flex>
            <Box className="min-w-0 flex-1">
              <Text className="truncate text-[12.5px] text-slate-100">{p.name}</Text>
              <Text className="truncate text-[11px] text-slate-500" title={`${p.role}${p.relations.length ? ` · ${p.relations.join(", ")}` : ""}`}>
                {p.role}{p.relations.length ? ` · ${p.relations.join(", ")}` : ""}
              </Text>
            </Box>
            {p.approval !== undefined && <span className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium ${p.approval ? "border-teal-400/30 bg-teal-400/10 text-teal-200" : "border-white/10 bg-white/[0.04] text-slate-400"}`}>
                {p.approval ? <CheckIcon size={10} aria-hidden /> : <CircleIcon size={8} aria-hidden />}
                {p.approval ? "Approved" : "Approval pending"}
              </span>}
          </Flex>)}
      </Box>
      <Box className="mt-3">
        <Text className="text-[11px] text-slate-500">Dependencies</Text>
        {deps.length ? <Box as="ul" className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] text-slate-300">{deps.map((d) => <li key={d}>{d}</li>)}</Box> : <Text className="mt-0.5 text-[12px] text-slate-500">None recorded.</Text>}
      </Box>
    </Box>;
}
function Overview({
  item


}: {item: BusinessPriority;}) {
  return <Box className="space-y-4">
      <Flex className="flex-wrap items-center gap-2">
        <SeverityTag severity={item.severity} />
        <span className={`rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${statusMeta[item.status].chip}`}>{statusMeta[item.status].label}</span>
        <EvidenceTag status={item.evidenceStatus} />
        <Text className="text-[11.5px] text-slate-500">{item.category} · decide by {item.dueBy}</Text>
      </Flex>
      <Text className="text-[13.5px] leading-relaxed text-slate-300">{item.summary}</Text>
      <Box className="grid gap-3 sm:grid-cols-2">
        <Block>
          <Label>Business impact · <span className={impactKindMeta[item.impact.kind]}>{item.impact.kind}</span></Label>
          <Text className="text-[13px] text-slate-100">{item.impact.text}</Text>
          <Text className={`mt-1 text-[11px] ${item.impact.isEstimate ? "text-blue-300/80" : "text-teal-300/80"}`}>
            {item.impact.isEstimate ? "Estimate · not yet validated" : "Measured from source records"}
          </Text>
        </Block>
        <Block>
          <Label>Affected areas</Label>
          <Text className="text-[12.5px] text-slate-200">{item.affected.departments.join(", ")}</Text>
          <Text className="mt-1 text-[11.5px] text-slate-400">Processes: {item.affected.processes.join(", ")}</Text>
          <Text className="text-[11.5px] text-slate-400">Systems: {item.affected.systems.join(", ")}</Text>
        </Block>
      </Box>
      <Block>
        <Label>Confidence & data quality</Label>
        <QualityIndicators quality={item.quality} />
        {item.quality.limitation && <Text className="mt-2.5 text-[11.5px] text-amber-200/90">Known limitation: {item.quality.limitation}</Text>}
        <Text className="mt-1 text-[11px] text-slate-500">Data refreshed {item.quality.freshness}</Text>
      </Block>
      <PeopleInvolved item={item} />
    </Box>;
}
function Evidence({
  item


}: {item: BusinessPriority;}) {
  return <Box className="space-y-4">
      <Box>
        <Label>Supporting findings</Label>
        <Box as="ul" className="space-y-1.5">
          {item.evidence.map((e) => <Flex as="li" key={e.label} className="items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <Box className="min-w-0">
                <Text className="text-[12.5px] text-slate-200">{e.label}</Text>
                <Text className="text-[11px] text-slate-500">{e.source}</Text>
              </Box>
              <EvidenceTag status={e.status} />
            </Flex>)}
        </Box>
      </Box>
      <Box>
        <Label>Source records · {item.records.length}</Label>
        <Box className="overflow-x-auto rounded-xl border border-white/[0.07]">
          <table className="w-full min-w-[520px] text-left text-[12px]">
            <thead className="bg-white/[0.03] text-[10.5px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Record</th>
                <th className="px-3 py-2 font-medium">System</th>
                <th className="px-3 py-2 font-medium">Timestamp</th>
                <th className="px-3 py-2 font-medium">Excerpt</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {item.records.map((r) => <tr key={r.id} className="border-t border-white/[0.05] align-top">
                  <td className="px-3 py-2">
                    <span className="num inline-flex items-center gap-1 text-blue-200">{r.id}<ExternalLinkIcon size={11} aria-hidden /></span>
                    <Text className="text-[11px] text-slate-500">{r.type}</Text>
                  </td>
                  <td className="px-3 py-2 text-slate-300">{r.system}</td>
                  <td className="num px-3 py-2 text-slate-400">{r.date}</td>
                  <td className="px-3 py-2 text-slate-300">{r.excerpt}</td>
                  <td className="px-3 py-2"><EvidenceTag status={r.status} compact /></td>
                </tr>)}
            </tbody>
          </table>
        </Box>
        <Text className="mt-1.5 text-[11px] text-slate-500">Record links open in source systems and require your existing access rights. All records are illustrative.</Text>
      </Box>
      <Box>
        <Label>Related workflows</Label>
        <Flex className="flex-wrap gap-1.5">
          {item.affected.processes.map((p) => <span key={p} className="rounded-md border border-white/10 px-2 py-0.5 text-[11.5px] text-slate-300">{p}</span>)}
        </Flex>
      </Box>
    </Box>;
}
function Analysis({
  item


}: {item: BusinessPriority;}) {
  return <Box className="space-y-4">
      <Block>
        <Label>Detected pattern</Label>
        <Text className="text-[13px] leading-relaxed text-slate-200">{item.analysis.pattern}</Text>
      </Block>
      <Box className="grid gap-3 sm:grid-cols-2">
        <Block className="!border-teal-400/20">
          <Flex className="mb-2 items-center gap-2"><EvidenceTag status="verified" /><Text className="text-[11.5px] text-slate-400">Observed facts</Text></Flex>
          <Box as="ul" className="space-y-1.5">
            {item.analysis.observed.map((o) => <Text as="li" key={o} className="text-[12.5px] leading-snug text-slate-200">{o}</Text>)}
          </Box>
        </Block>
        <Block className="!border-blue-400/20">
          <Flex className="mb-2 items-center gap-2"><EvidenceTag status="inferred" /><Text className="text-[11.5px] text-slate-400">AI inferences</Text></Flex>
          <Box as="ul" className="space-y-1.5">
            {item.analysis.inferred.map((o) => <Text as="li" key={o} className="text-[12.5px] leading-snug text-slate-300">{o}</Text>)}
          </Box>
        </Block>
      </Box>
      <Box>
        <Label>Likely underlying causes</Label>
        <Box as="ul" className="list-disc space-y-1 pl-4 text-[12.5px] text-slate-300">
          {item.analysis.causes.map((c) => <li key={c}>{c}</li>)}
        </Box>
      </Box>
      <Block className="!border-violet-400/20">
        <Flex className="mb-1.5 items-center gap-2"><EvidenceTag status="proposed" /><Text className="text-[11.5px] text-slate-400">Recommendation</Text></Flex>
        <Text className="text-[13px] font-medium text-slate-100">{item.recommendation.action}</Text>
        <Text className="mt-1 text-[12px] text-slate-400">Why: {item.recommendation.rationale}</Text>
        {item.recommendation.benefit && <Text className="mt-1.5 text-[12px] text-blue-200"><FlaskConicalIcon size={11} className="mr-1 inline" aria-hidden />Estimated benefit: {item.recommendation.benefit} — hypothesis until validated.</Text>}
      </Block>
      {item.unresolved.length > 0 && <Box>
          <Label>Unresolved questions</Label>
          <Box as="ul" className="space-y-1">
            {item.unresolved.map((u) => <Flex as="li" key={u} className="gap-2 text-[12.5px] text-amber-100/90"><HelpCircleIcon size={13} className="mt-0.5 shrink-0 text-amber-300" aria-hidden />{u}</Flex>)}
          </Box>
        </Box>}
    </Box>;
}
const riskTone = {
  Low: "text-teal-300",
  Medium: "text-amber-300",
  High: "text-rose-300"
};
function Options({
  item


}: {item: BusinessPriority;}) {
  return <Box className="space-y-2.5">
      {item.options.map((o) => <Block key={o.id} className={o.recommended ? "!border-blue-400/30 !bg-blue-500/[0.05]" : ""}>
          <Flex className="items-start justify-between gap-3">
            <Text className="text-[13.5px] font-medium text-slate-100">{o.title}</Text>
            {o.recommended && <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-blue-400/30 bg-blue-400/10 px-1.5 py-0.5 text-[10.5px] font-medium text-blue-200">
                <LightbulbIcon size={10} aria-hidden />Best practice
              </span>}
          </Flex>
          <Text className="mt-1 text-[12px] text-slate-400">{o.description}</Text>
          <Box className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] sm:grid-cols-4">
            <Box><Text className="text-[10.5px] text-slate-500">Expected impact (est.)</Text><Text className="text-slate-200">{o.impact}</Text></Box>
            <Box><Text className="text-[10.5px] text-slate-500">Implementation cost</Text><Text className="text-slate-200">{o.cost}</Text></Box>
            <Box><Text className="text-[10.5px] text-slate-500">Risk</Text><Text className={riskTone[o.risk]}>{o.risk}</Text></Box>
            <Box><Text className="text-[10.5px] text-slate-500">Trade-off</Text><Text className="text-slate-200">{o.tradeoffs}</Text></Box>
          </Box>
        </Block>)}
      <Text className="text-[11px] text-slate-500">Impacts are estimates or hypotheses until validated through implementation.</Text>
    </Box>;
}
export function PriorityDetailContent({
  item,
  tab



}: {item: BusinessPriority;tab: DetailTab;}) {
  switch (tab) {
    case "evidence":
      return <Evidence item={item} />;
    case "analysis":
      return <Analysis item={item} />;
    case "options":
      return <Options item={item} />;
    default:
      return <Overview item={item} />;
  }
}
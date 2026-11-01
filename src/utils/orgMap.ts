import { orgTeams, orgWorkflows } from "../data/orgWorkflows";
import type { LinkInfo, OrgSelection, OrgTeam, OrgWorkflow, TeamId, WorkflowFilter } from "../types/orgMap";

export const getTeam = (id: TeamId): OrgTeam => orgTeams.find((t) => t.id === id) ?? orgTeams[0];
export const getWorkflow = (id: string): OrgWorkflow | undefined => orgWorkflows.find((w) => w.id === id);

/** All teams in a workflow, owner first. */
export function teamsOf(wf: OrgWorkflow): (LinkInfo & {team: TeamId;duty: string;})[] {
  return [
  { team: wf.owner, role: "owner" as const, evidence: wf.ownerEvidence, duty: "Accountable for the workflow end to end" },
  ...wf.participants.map((p) => ({ team: p.team, role: "participant" as const, evidence: p.evidence, duty: p.role }))];

}

export function linkRole(wf: OrgWorkflow, team: TeamId): LinkInfo | null {
  if (wf.owner === team) return { role: "owner", evidence: wf.ownerEvidence };
  const p = wf.participants.find((x) => x.team === team);
  return p ? { role: "participant", evidence: p.evidence } : null;
}

export function workflowsOf(team: TeamId) {
  const owns = orgWorkflows.filter((w) => w.owner === team);
  const joins = orgWorkflows.filter((w) => w.owner !== team && w.participants.some((p) => p.team === team));
  return { owns, joins };
}

/** Teams that share at least one workflow with the given team. */
export function collaboratorsOf(team: TeamId): {team: TeamId;shared: number;}[] {
  const counts = new Map<TeamId, number>();
  orgWorkflows.forEach((w) => {
    const ids = [w.owner, ...w.participants.map((p) => p.team)];
    if (!ids.includes(team)) return;
    ids.filter((id) => id !== team).forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  });
  return [...counts.entries()].map(([t, shared]) => ({ team: t, shared })).sort((a, b) => b.shared - a.shared);
}

export const teamCount = (wf: OrgWorkflow) => 1 + wf.participants.length;

export function matchesFilter(wf: OrgWorkflow, filter: WorkflowFilter) {
  if (filter === "shared") return teamCount(wf) >= 4;
  if (filter === "comparable") return !!wf.processId;
  if (filter === "low-evidence") return wf.coverage < 60;
  return true;
}

/** Workflows grouped by their owning team's order so connections stay tidy. */
export const orderedWorkflows: OrgWorkflow[] = [...orgWorkflows].sort(
  (a, b) => orgTeams.findIndex((t) => t.id === a.owner) - orgTeams.findIndex((t) => t.id === b.owner)
);

export type IssueSeverity = "high" | "medium";

export interface MapIssue {
  id: string;
  workflowId: string;
  severity: IssueSeverity;
  title: string;
  detail: string;
}

/**
 * Issues derived from the workflow records themselves — limited evidence, recorded source
 * limitations and owners that are only AI-inferred. Nothing here is invented.
 */
export const mapIssues: MapIssue[] = orderedWorkflows.
flatMap((w): MapIssue[] => {
  const out: MapIssue[] = [];
  if (w.coverage < 60)
  out.push({
    id: `${w.id}-coverage`,
    workflowId: w.id,
    severity: w.coverage < 45 ? "high" : "medium",
    title: `Limited evidence · ${w.coverage}% coverage`,
    detail: "Less than 60% of this workflow is covered by connected source records, so findings are less certain."
  });
  if (w.ownerEvidence === "inferred")
  out.push({
    id: `${w.id}-owner`,
    workflowId: w.id,
    severity: "medium",
    title: "Owner not verified",
    detail: `${getTeam(w.owner).name} is the AI-inferred owner; no source record confirms it yet.`
  });
  if (w.note) out.push({ id: `${w.id}-source`, workflowId: w.id, severity: "medium", title: "Source limitation", detail: w.note });
  return out;
}).
sort((a, b) => a.severity === b.severity ? 0 : a.severity === "high" ? -1 : 1);

export const issuesForWorkflow = (id: string) => mapIssues.filter((i) => i.workflowId === id);

/** Issues on workflows the team owns. */
export const issuesForTeam = (team: TeamId) => mapIssues.filter((i) => getWorkflow(i.workflowId)?.owner === team);

/** Links (keyed by team or workflow id) related to the focused node. */
export function relatedTo(focus: OrgSelection): Map<string, LinkInfo> | null {
  if (!focus) return null;
  const map = new Map<string, LinkInfo>();
  if (focus.kind === "team") {
    orgWorkflows.forEach((w) => {
      const l = linkRole(w, focus.id);
      if (l) map.set(w.id, l);
    });
  } else {
    const wf = getWorkflow(focus.id);
    if (wf) orgTeams.forEach((t) => {
      const l = linkRole(wf, t.id);
      if (l) map.set(t.id, l);
    });
  }
  return map;
}
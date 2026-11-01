import { useMemo, useState } from "react";
import { orgTeams } from "../data/orgWorkflows";
import type { OrgSelection, WorkflowFilter } from "../types/orgMap";
import { matchesFilter, orderedWorkflows, relatedTo } from "../utils/orgMap";

export function useOrgMap() {
  const [selection, setSelection] = useState<OrgSelection>(null);
  const [hover, setHover] = useState<OrgSelection>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<WorkflowFilter>("all");

  const focus = hover ?? selection;
  const related = useMemo(() => relatedTo(focus), [focus]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const teams = new Set(orgTeams.filter((t) => !q || t.name.toLowerCase().includes(q) || t.lead.toLowerCase().includes(q)).map((t) => t.id as string));
    const workflows = new Set(
      orderedWorkflows.filter((w) => matchesFilter(w, filter) && (!q || w.name.toLowerCase().includes(q) || w.stages.some((s) => s.toLowerCase().includes(q)))).map((w) => w.id)
    );
    return { teams, workflows, active: !!q || filter !== "all" };
  }, [query, filter]);

  const select = (s: OrgSelection) =>
  setSelection((cur) => cur && s && cur.kind === s.kind && cur.id === s.id ? null : s);

  const reset = () => {
    setSelection(null);
    setHover(null);
    setQuery("");
    setFilter("all");
  };

  return { selection, setSelection, select, hover, setHover, focus, related, query, setQuery, filter, setFilter, visible, reset };
}

export type OrgMapModel = ReturnType<typeof useOrgMap>;
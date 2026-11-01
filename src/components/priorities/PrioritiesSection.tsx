import React, { useMemo, useState } from "react";
import { Box, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useBusinessPriorities } from "../../hooks/useBusinessPriorities";
import type { BusinessPriority } from "../../types/priorities";
import { availableActions, priorityScore } from "../../utils/priorities";
import { AuthorizeModal } from "../ui/AuthorizeModal";
import { SignalsList } from "./SignalsList";
import { DecisionsList } from "./DecisionsList";
import { PriorityDrawer } from "./PriorityDrawer";
import { CreateTaskModal } from "./CreateTaskModal";
import type { DetailTab } from "./PriorityDetailTabs";

/**
 * One connected record per issue: items that need a management decision appear under
 * "Decisions requiring your attention"; everything else under "Business signals & opportunities".
 * Both open the same detail drawer.
 */
export function PrioritiesSection() {
  const {
    items,
    approve,
    requestValidation,
    defer,
    createTask
  } = useBusinessPriorities();
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<DetailTab>("overview");
  const [approveId, setApproveId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const ranked = useMemo(() => [...items].sort((a, b) => priorityScore(b, "priority") - priorityScore(a, "priority")), [items]);
  const decisions = ranked.filter((p) => availableActions(p).review);
  const signals = ranked.filter((p) => !availableActions(p).review);
  const byId = (id: string | null) => items.find((p) => p.id === id) ?? null;
  const openItem = byId(openId);
  const approveItem = byId(approveId);
  const open = (p: BusinessPriority, t: DetailTab = "overview") => {
    setTab(t);
    setOpenId(p.id);
  };
  const notify = (title: string, description?: string) => toast({
    title,
    description,
    status: "success",
    duration: 2800,
    position: "bottom-right"
  });
  return <Box className="space-y-6">
      <SignalsList items={signals} onOpen={(p) => open(p)} />
      <DecisionsList items={decisions} onOpen={(p) => open(p)} onReview={(p) => open(p, "options")} />

      <PriorityDrawer item={openItem} tab={tab} onTab={setTab} onClose={() => setOpenId(null)} onTrace={() => {
      setOpenId(null);
      navigate("/process-mapping-graph");
    }} onApprove={() => openItem && setApproveId(openItem.id)} onRequestValidation={() => {
      if (!openItem) return;
      requestValidation(openItem);
      notify("Validation requested", `${openItem.id} · recorded in the audit trail`);
    }} onDefer={() => {
      if (!openItem) return;
      defer(openItem);
      notify("Decision deferred", `${openItem.id} · recorded in the audit trail`);
    }} onCreateTask={() => openItem && setTaskId(openItem.id)} />

      <AuthorizeModal isOpen={!!approveItem} onClose={() => setApproveId(null)} title="Approve recommendation" description={approveItem?.recommendation.action ?? ""} consequences={approveItem ? [...approveItem.ownership.dependencies, "Projected benefits remain estimates until validated"] : []} confirmLabel="Approve & record" onConfirm={(note) => {
      if (approveItem) {
        approve(approveItem, note);
        notify("Recommendation approved", "It now appears under Business signals, ready for a task.");
        setTab("overview");
      }
      setApproveId(null);
    }} />

      <CreateTaskModal item={byId(taskId)} onClose={() => setTaskId(null)} onCreate={(task) => {
      const p = byId(taskId);
      if (p) {
        createTask(p, task);
        notify("Task created", `${task.owner} · ${task.priority} · due ${task.due}`);
      }
      setTaskId(null);
    }} />
    </Box>;
}
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { aiModels, defaultModelId } from "../data/aiModels";
import { checkRestricted, matchResponse } from "../data/assistant";
import { useAudit } from "./AuditContext";
import type { AiModel, ChatMessage } from "../types/assistant";
interface AssistantContextValue {
  messages: ChatMessage[];
  isGenerating: boolean;
  models: AiModel[];
  activeModel: AiModel;
  send: (text: string) => boolean;
  retry: (assistantMessageId: string) => void;
  setActiveModel: (id: string) => void;
  addPendingModel: (model: Omit<AiModel, "id" | "status" | "custom">) => void;
  clearConversation: () => void;
}
const AssistantContext = createContext<AssistantContextValue | null>(null);
const GENERATION_MS = 1600;
export function AssistantProvider({
  children


}: {children: React.ReactNode;}) {
  const {
    log
  } = useAudit();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [models, setModels] = useState<AiModel[]>(aiModels);
  const [activeModelId, setActiveModelId] = useState(defaultModelId);
  const generatingRef = useRef(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const activeModel = models.find((m) => m.id === activeModelId) ?? models[0];
  const isGenerating = messages.some((m) => m.role === "assistant" && m.status === "generating");

  // Demo generation: the prototype has no live model backend, so responses come from the
  // illustrative sample library and are labelled as such in the UI.
  const generate = useCallback((assistantId: string, prompt: string) => {
    generatingRef.current = true;
    const t = window.setTimeout(() => {
      setMessages((prev) => prev.map((m) => {
        if (m.id !== assistantId || m.role !== "assistant") return m;
        if (typeof navigator !== "undefined" && navigator.onLine === false) return {
          ...m,
          status: "error"
        };
        const blocked = checkRestricted(prompt);
        if (blocked) return {
          ...m,
          status: "blocked",
          blocked
        };
        return {
          ...m,
          status: "done",
          response: matchResponse(prompt)
        };
      }));
      generatingRef.current = false;
    }, GENERATION_MS);
    timers.current.push(t);
  }, []);
  const send = useCallback((text: string) => {
    const prompt = text.trim();
    if (!prompt || generatingRef.current) return false;
    const now = new Date().toISOString();
    const stamp = Date.now();
    const assistantId = `a${stamp}`;
    setMessages((prev) => [...prev, {
      id: `u${stamp}`,
      role: "user",
      text: prompt,
      createdAt: now
    }, {
      id: assistantId,
      role: "assistant",
      prompt,
      modelId: activeModelId,
      createdAt: now,
      status: "generating"
    }]);
    log({
      category: "Investigation",
      action: "Asked AI Assistant",
      target: prompt,
      detail: `Model: ${activeModel.name}`
    });
    generate(assistantId, prompt);
    return true;
  }, [activeModelId, activeModel.name, generate, log]);
  const retry = useCallback((assistantId: string) => {
    if (generatingRef.current) return;
    const target = messages.find((m) => m.id === assistantId);
    if (!target || target.role !== "assistant") return;
    setMessages((prev) => prev.map((m) => m.id === assistantId && m.role === "assistant" ? {
      ...m,
      status: "generating",
      modelId: activeModelId,
      response: undefined
    } : m));
    generate(assistantId, target.prompt);
  }, [messages, activeModelId, generate]);
  const setActiveModel = useCallback((id: string) => {
    const next = models.find((m) => m.id === id);
    if (!next || next.status !== "connected" || id === activeModelId) return;
    setActiveModelId(id);
    log({
      category: "Governance",
      action: "Changed AI model",
      target: next.name,
      detail: next.provider
    });
  }, [models, activeModelId, log]);
  const addPendingModel = useCallback((model: Omit<AiModel, "id" | "status" | "custom">) => {
    setModels((prev) => [...prev, {
      ...model,
      id: `custom-${Date.now().toString(36)}`,
      status: "pending",
      custom: true
    }]);
    log({
      category: "Governance",
      action: "Registered pending custom model",
      target: model.name,
      detail: `${model.provider} · no credentials stored`
    });
  }, [log]);
  const clearConversation = useCallback(() => {
    if (generatingRef.current) return;
    setMessages([]);
  }, []);
  const value = useMemo(() => ({
    messages,
    isGenerating,
    models,
    activeModel,
    send,
    retry,
    setActiveModel,
    addPendingModel,
    clearConversation
  }), [messages, isGenerating, models, activeModel, send, retry, setActiveModel, addPendingModel, clearConversation]);
  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}
export function useAssistant(): AssistantContextValue {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error("useAssistant must be used within AssistantProvider");
  return ctx;
}
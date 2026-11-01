import type { AiModel } from "../types/assistant";

export const defaultModelId = "atlas-analyst";

export const aiModels: AiModel[] = [
{
  id: "atlas-analyst",
  name: "Atlas Analyst",
  provider: "Atlas · built-in",
  providerKey: "atlas",
  description: "Tuned for process mining and governance questions.",
  status: "connected"
},
{
  id: "claude-opus",
  name: "Claude Opus",
  provider: "Anthropic",
  providerKey: "anthropic",
  description: "Deep reasoning for complex, multi-step analysis.",
  status: "connected"
},
{
  id: "claude-sonnet",
  name: "Claude Sonnet",
  provider: "Anthropic",
  providerKey: "anthropic",
  description: "Balanced speed and quality for everyday questions.",
  status: "connected"
},
{
  id: "gpt-6",
  name: "GPT-6",
  provider: "OpenAI",
  providerKey: "openai",
  description: "Requires an API key from your administrator.",
  status: "not_connected"
}];
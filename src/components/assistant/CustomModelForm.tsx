import React, { useState } from "react";
import { Box, Button, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, IconButton, Input, InputGroup, InputRightElement, Select, Text } from "@chakra-ui/react";
import { EyeIcon, EyeOffIcon, LockIcon, TriangleAlertIcon } from "lucide-react";
import type { AiModel, ProviderKey } from "../../types/assistant";
type ProviderOption = {
  key: string;
  label: string;
  providerKey: ProviderKey;
  requiresUrl: boolean;
  defaultUrl?: string;
  authLabel: string;
  needsVersion?: boolean;
};
const providers: ProviderOption[] = [{
  key: "anthropic",
  label: "Anthropic",
  providerKey: "anthropic",
  requiresUrl: false,
  defaultUrl: "https://api.anthropic.com",
  authLabel: "API key"
}, {
  key: "openai",
  label: "OpenAI",
  providerKey: "openai",
  requiresUrl: false,
  defaultUrl: "https://api.openai.com/v1",
  authLabel: "API key"
}, {
  key: "azure",
  label: "Azure OpenAI",
  providerKey: "azure",
  requiresUrl: true,
  authLabel: "API key",
  needsVersion: true
}, {
  key: "compatible",
  label: "OpenAI-compatible endpoint",
  providerKey: "custom",
  requiresUrl: true,
  authLabel: "API key"
}, {
  key: "other",
  label: "Other provider",
  providerKey: "custom",
  requiresUrl: true,
  authLabel: "Access token"
}];
type Phase = "editing" | "validating" | "unavailable";
interface Props {
  onCancel: () => void;
  onSavePending: (model: Omit<AiModel, "id" | "status" | "custom">) => void;
}
export function CustomModelForm({
  onCancel,
  onSavePending
}: Props) {
  const [providerKey, setProviderKey] = useState("anthropic");
  const [name, setName] = useState("");
  const [modelId, setModelId] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiVersion, setApiVersion] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [touched, setTouched] = useState(false);
  const [phase, setPhase] = useState<Phase>("editing");
  const provider = providers.find((p) => p.key === providerKey) ?? providers[0];
  const urlValue = baseUrl.trim();
  const errors = {
    name: !name.trim() ? "Enter a display name." : "",
    modelId: !modelId.trim() ? "Enter the model identifier." : "",
    baseUrl: provider.requiresUrl && !urlValue ? "Enter the endpoint URL." : urlValue && !/^https:\/\/\S+$/.test(urlValue) ? "Use a secure https:// URL." : "",
    apiVersion: provider.needsVersion && !apiVersion.trim() ? "Enter the API version." : "",
    secret: !secret ? `Enter the ${provider.authLabel.toLowerCase()}.` : ""
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const validate = () => {
    setTouched(true);
    if (hasErrors) return;
    setPhase("validating");
    window.setTimeout(() => {
      // No credential-storage backend exists in this prototype: discard the secret immediately.
      setSecret("");
      setShowSecret(false);
      setPhase("unavailable");
    }, 1200);
  };
  if (phase === "unavailable") {
    return <Box className="space-y-4">
        <Flex className="gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] p-4">
          <TriangleAlertIcon size={16} className="mt-0.5 shrink-0 text-amber-300" />
          <Box>
            <Text className="text-[14px] font-medium text-white">We couldn't validate this connection</Text>
            <Text className="mt-1 text-[13px] leading-relaxed text-slate-300">
              Secure credential storage isn't available in this environment yet, so {name.trim()} was not connected. Your {provider.authLabel.toLowerCase()} was not saved or sent anywhere.
            </Text>
          </Box>
        </Flex>
        <Text className="text-[12px] text-slate-400">
          You can save the model details as a pending connection. It will appear in your list but can't be selected until an administrator completes the connection.
        </Text>
        <Flex className="justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>Back to models</Button>
          <Button variant="primary" onClick={() => onSavePending({
          name: name.trim(),
          provider: `${provider.label} · custom`,
          providerKey: provider.providerKey,
          description: `Model ID: ${modelId.trim()}`
        })}>
            Save as pending connection
          </Button>
        </Flex>
      </Box>;
  }
  const busy = phase === "validating";
  return <Box as="form" className="space-y-4" noValidate onSubmit={(e: React.FormEvent) => {
    e.preventDefault();
    validate();
  }}>
      <FormControl>
        <FormLabel className="!text-[12px] !text-slate-400">Provider</FormLabel>
        <Select value={providerKey} onChange={(e) => setProviderKey(e.target.value)} isDisabled={busy}>
          {providers.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </Select>
      </FormControl>
      <Box className="grid gap-4 sm:grid-cols-2">
        <FormControl isRequired isInvalid={touched && !!errors.name}>
          <FormLabel className="!text-[12px] !text-slate-400">Display name</FormLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Meridian Ops Model" isDisabled={busy} />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>
        <FormControl isRequired isInvalid={touched && !!errors.modelId}>
          <FormLabel className="!text-[12px] !text-slate-400">Model identifier</FormLabel>
          <Input value={modelId} onChange={(e) => setModelId(e.target.value)} placeholder="e.g. claude-opus-4" isDisabled={busy} className="font-mono" />
          <FormErrorMessage>{errors.modelId}</FormErrorMessage>
        </FormControl>
      </Box>
      <FormControl isRequired={provider.requiresUrl} isInvalid={touched && !!errors.baseUrl}>
        <FormLabel className="!text-[12px] !text-slate-400">API endpoint / Base URL</FormLabel>
        <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder={provider.defaultUrl ?? "https://your-endpoint.example.com"} isDisabled={busy} />
        {touched && errors.baseUrl ? <FormErrorMessage>{errors.baseUrl}</FormErrorMessage> : !provider.requiresUrl && <FormHelperText className="!text-[11px]">Optional — defaults to {provider.defaultUrl}</FormHelperText>}
      </FormControl>
      {provider.needsVersion && <FormControl isRequired isInvalid={touched && !!errors.apiVersion}>
          <FormLabel className="!text-[12px] !text-slate-400">API version</FormLabel>
          <Input value={apiVersion} onChange={(e) => setApiVersion(e.target.value)} placeholder="e.g. 2026-06-01" isDisabled={busy} />
          <FormErrorMessage>{errors.apiVersion}</FormErrorMessage>
        </FormControl>}
      <FormControl isRequired isInvalid={touched && !!errors.secret}>
        <FormLabel className="!text-[12px] !text-slate-400">{provider.authLabel}</FormLabel>
        <InputGroup size="sm">
          <Input type={showSecret ? "text" : "password"} value={secret} onChange={(e) => setSecret(e.target.value)} autoComplete="off" spellCheck={false} placeholder="••••••••••••••••" isDisabled={busy} className="font-mono" />
          <InputRightElement>
            <IconButton size="xs" variant="ghost" aria-label={showSecret ? "Hide key" : "Show key"} icon={showSecret ? <EyeOffIcon size={13} /> : <EyeIcon size={13} />} onClick={() => setShowSecret((v) => !v)} />
          </InputRightElement>
        </InputGroup>
        {touched && errors.secret ? <FormErrorMessage>{errors.secret}</FormErrorMessage> : <FormHelperText className="!flex !items-center !gap-1 !text-[11px]"><LockIcon size={10} />Never stored in your browser or shown in conversations.</FormHelperText>}
      </FormControl>
      <Flex className="justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel} isDisabled={busy}>Cancel</Button>
        <Button type="submit" variant="primary" isLoading={busy} loadingText="Validating…">Validate & connect</Button>
      </Flex>
    </Box>;
}
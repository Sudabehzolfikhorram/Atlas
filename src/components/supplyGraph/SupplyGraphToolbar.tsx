import React from "react";
import { Button, Flex, IconButton, Input, InputGroup, InputLeftElement, Text } from "@chakra-ui/react";
import { MaximizeIcon, MinusIcon, PencilIcon, PlusIcon, SearchIcon } from "lucide-react";
interface ZoomProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

/** Zoom − / + / Fit group, shared by view and edit toolbars. */
export function ZoomGroup({
  onZoomIn,
  onZoomOut,
  onFit
}: ZoomProps) {
  return <Flex role="group" aria-label="Zoom" className="items-center rounded-xl border border-white/[0.08] bg-black/20 p-0.5">
      <IconButton size="xs" variant="ghost" aria-label="Zoom out" title="Zoom out" icon={<MinusIcon size={13} />} onClick={onZoomOut} />
      <IconButton size="xs" variant="ghost" aria-label="Zoom in" title="Zoom in" icon={<PlusIcon size={13} />} onClick={onZoomIn} />
      <Button size="xs" variant="ghost" leftIcon={<MaximizeIcon size={12} />} onClick={onFit}>Fit</Button>
    </Flex>;
}
interface ToggleProps {
  on: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}
function Toggle({
  on,
  onChange,
  children
}: ToggleProps) {
  return <button type="button" aria-pressed={on} onClick={() => onChange(!on)} className={`inline-flex h-6 items-center rounded-lg px-2.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "bg-white/[0.12] text-white" : "text-slate-400 hover:text-slate-200"}`}>
      {children}
    </button>;
}
interface Props extends ZoomProps {
  flow: boolean;
  onFlow: (v: boolean) => void;
  weight: boolean;
  onWeight: (v: boolean) => void;
  labels: boolean;
  onLabels: (v: boolean) => void;
  query: string;
  onQuery: (v: string) => void;
  onSearch: () => void;
  matchCount: number;
  onEdit: () => void;
}
export function SupplyGraphToolbar({
  flow,
  onFlow,
  weight,
  onWeight,
  labels,
  onLabels,
  query,
  onQuery,
  onSearch,
  matchCount,
  onEdit,
  ...zoom
}: Props) {
  return <Flex className="flex-wrap items-center gap-2 border-b border-white/[0.06] px-3 py-2.5">
      <ZoomGroup {...zoom} />
      <Flex role="group" aria-label="Display" className="items-center gap-0.5 rounded-xl border border-white/[0.08] bg-black/20 p-0.5">
        <Toggle on={flow} onChange={onFlow}>Flow</Toggle>
        <Toggle on={weight} onChange={onWeight}>Weight</Toggle>
        <Toggle on={labels} onChange={onLabels}>Labels</Toggle>
      </Flex>
      <form className="flex min-w-[180px] flex-1 items-center gap-2 sm:max-w-[280px]" role="search" onSubmit={(e) => {
      e.preventDefault();
      onSearch();
    }}>
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none"><SearchIcon size={13} className="text-slate-500" /></InputLeftElement>
          <Input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search nodes…" aria-label="Search nodes" className="!rounded-lg" />
        </InputGroup>
        {query.trim() && <Text className="shrink-0 text-[11.5px] text-slate-500" aria-live="polite">{matchCount} found</Text>}
      </form>
      <Button size="sm" variant="primary" className="ml-auto" leftIcon={<PencilIcon size={13} />} onClick={onEdit}>
        Edit graph
      </Button>
    </Flex>;
}
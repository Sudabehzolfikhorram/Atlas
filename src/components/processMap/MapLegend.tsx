import React from "react";
import { Flex } from "@chakra-ui/react";
import type { ChangeType, MapMode, MapVariant } from "../../types/processMap";
import { bucketDefs, changeColor } from "./ProcessMapCanvas";
const Dot = ({
  color


}: {color: string;}) => <i className="block h-[6px] w-[6px] rounded-full" style={{
  background: color
}} aria-hidden />;
const Item = ({
  children


}: {children: React.ReactNode;}) => <Flex as="li" className="items-center gap-1.5">{children}</Flex>;
const changeLabels: [ChangeType, string][] = [["added", "Added"], ["modified", "Modified"], ["reordered", "Reordered"], ["removed", "Removed"]];
export function MapLegend({
  variant,
  mode



}: {variant: MapVariant;mode: MapMode;}) {
  return <Flex as="ul" aria-label="Map legend" className="flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
      {mode === "relationships" ? <>
          <Item><Dot color="#62b8b1" />Source</Item>
          <Item><Dot color="#b29ade" />Stage</Item>
          <Item><Dot color="#c5ab88" />Step</Item>
          {variant === "current" ? <Item><Dot color="#e18585" />Needs attention</Item> : changeLabels.map(([k, l]) => <Item key={k}><Dot color={changeColor[k]} />{l}</Item>)}
        </> : <>
          {bucketDefs[variant].map((b) => <Item key={b.key}><Dot color={b.color} />{b.label}</Item>)}
          <Item><span className="text-slate-500">Width = case-steps per month{variant === "recommended" ? " · baseline demand assumed" : ""}</span></Item>
        </>}
    </Flex>;
}
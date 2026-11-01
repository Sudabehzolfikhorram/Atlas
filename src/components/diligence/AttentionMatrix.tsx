import { Box, Heading, Text } from "@chakra-ui/react";
import { departments } from "../../data/diligence";
import type { DiligenceArea, Dimension, Finding } from "../../types/diligence";
import type { AsBuiltFilter } from "./AsBuiltOverview";
type Variant = "all" | "gaps" | "redflags";
type Column = {
  id: string;
  label: string;
  dims: Dimension[];
};

/** Process matrices keep one column per dimension. */
const processColumns: Column[] = [{
  id: "strategy",
  label: "Strategy",
  dims: ["strategy"]
}, {
  id: "execution",
  label: "Strategy execution",
  dims: ["execution"]
}, {
  id: "detailed",
  label: "Detailed process",
  dims: ["process"]
}, {
  id: "outcome",
  label: "Outcome",
  dims: ["outcome"]
}];

/** Data matrix columns. Data governance groups the strategy and strategy-execution findings. */
const dataColumns: Column[] = [{
  id: "detailed",
  label: "Detailed Data",
  dims: ["process"]
}, {
  id: "outcomes",
  label: "Outcomes",
  dims: ["outcome"]
}, {
  id: "governance",
  label: "Data Governance",
  dims: ["strategy", "execution"]
}];
const sameDims = (a: Dimension[] | undefined, b: Dimension[]) => !!a && a.length === b.length && a.every((d) => b.includes(d));
interface Props {
  id: string;
  title: string;
  description: string;
  footnote: string;
  variant: Variant;
  open: Finding[];
  filter: AsBuiltFilter;
  onFilter: (f: AsBuiltFilter) => void;
  area?: DiligenceArea;
}

/** Department × dimension heatmap of open findings. Select a cell to filter the tables. */
export function AttentionMatrix({
  id,
  title,
  description,
  footnote,
  variant,
  open,
  filter,
  onFilter,
  area = "data"
}: Props) {
  const columns = area === "process" ? processColumns : dataColumns;
  const scoped = variant === "gaps" ? open.filter((f) => f.kind === "gap") : variant === "redflags" ? open.filter((f) => f.kind === "redflag") : open;
  const noun = variant === "gaps" ? "open gaps" : variant === "redflags" ? "open red flags" : "open findings";
  const hot = variant === "gaps" ? "border-amber-400/50 bg-amber-400/[0.08] text-amber-300" : "border-rose-400/45 bg-rose-500/[0.1] text-rose-300";
  return <Box as="section" aria-labelledby={id} className="glass rounded-2xl p-5">
      <Heading as="h3" id={id} className="!text-[14px] !font-semibold uppercase tracking-[0.04em] text-slate-100">{title}</Heading>
      <Text className="mt-0.5 text-[12.5px] text-slate-400">{description}</Text>
      <Box className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[480px] border-separate border-spacing-1.5">
          <thead>
            <tr>
              <th className="w-[100px]" />
              {columns.map((c) => <th key={c.id} scope="col" className="pb-1.5 text-center text-[11.5px] font-normal text-slate-400">{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {departments.map((dep) => <tr key={dep}>
                <th scope="row" className="pr-2 text-left text-[12.5px] font-medium text-slate-200">{dep}</th>
                {columns.map((col) => {
              const n = scoped.filter((f) => f.team === dep && col.dims.includes(f.dimension)).length;
              const on = filter.team === dep && sameDims(filter.dims, col.dims);
              return <td key={col.id} className="p-0">
                      <button type="button" aria-pressed={on} aria-label={`${dep}, ${col.label}: ${n} ${noun}`} onClick={() => onFilter(on ? {
                  team: null,
                  dimension: null
                } : {
                  team: dep,
                  dimension: null,
                  dims: col.dims,
                  label: col.label
                })} className={`flex h-[50px] w-full items-center justify-center rounded-lg border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${n ? hot : "border-teal-400/20 bg-teal-400/[0.04] text-teal-300"} ${on ? "ring-2 ring-blue-400/80" : "hover:brightness-125"}`}>
                        <span className="num text-[17px] font-medium leading-none">{n}</span>
                      </button>
                    </td>;
            })}
              </tr>)}
          </tbody>
        </table>
      </Box>
      <Text className="mt-3 text-[11.5px] text-slate-500">{footnote}</Text>
    </Box>;
}
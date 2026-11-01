import { Box } from "@chakra-ui/react";
import { StatTile } from "./StatTile";
import { useDiligence } from "../../contexts/DiligenceContext";
import { pct, qanKpis } from "../../utils/workflow";
import type { DiligenceArea } from "../../types/diligence";

/** QAN metrics for one area only, computed from shared finding records and recorded sample check runs. */
export function QanKpis({
  area


}: {area: DiligenceArea;}) {
  const {
    findings,
    runs,
    linked
  } = useDiligence();
  const noun = area === "data" ? "Data" : "Process";
  const list = findings.filter((f) => f.area === area);
  const k = qanKpis(list, runs.filter((r) => r.area === area));
  const samples = k.latest.map((r) => `${r.sampleId} (${r.passed}/${r.evaluated})`).join(", ");
  const scope = `${list.length} ${noun} findings (sample register)`;
  const occurrences = list.reduce((s, f) => s + (linked[f.id]?.length ?? 0), 0);
  const lv = k.lastVerification;
  return <Box className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <StatTile label={`${noun} records evaluated`} value={k.evaluated} tone="blue" note={k.evaluated ? <>Latest run per sample · {samples}<br />Sample data — simulated execution</> : `No ${noun} sample checks recorded`} />
      <StatTile label="Failed checks" value={<>{k.failed}<span className="text-[16px] text-slate-500"> / {k.evaluated}</span></>} tone={k.failed ? "rose" : "neutral"} note={k.evaluated ? `${pct(k.evaluated - k.failed, k.evaluated)}% passed (${k.evaluated - k.failed}/${k.evaluated}) for these samples only · ${occurrences} unique occurrences linked to ${noun} findings` : `${occurrences} unique occurrences linked to ${noun} findings (monitoring)`} />
      <StatTile label="Findings awaiting reviewer decisions" value={k.awaitingFinding + k.awaitingClosure} tone={k.awaitingFinding + k.awaitingClosure ? "amber" : "neutral"} note={`${k.awaitingFinding} validation · ${k.awaitingClosure} closure · of ${scope}; ${k.rejected} rejected excluded`} />
      <StatTile label="Plans awaiting approval" value={k.plansPending} tone={k.plansPending ? "amber" : "neutral"} note={`Of ${k.acceptedOpen} accepted open ${noun} findings · rejected excluded`} />
      <StatTile label="Verification tests" value={<>{k.verifyPassed}<span className="text-[15px] text-teal-300/70"> passed</span> · {k.verifyFailed}<span className="text-[15px] text-rose-300/70"> failed</span></>} tone="neutral" note={lv ? `Last: ${lv.passed}/${lv.evaluated} passed (${pct(lv.passed, lv.evaluated)}%) on ${lv.sampleId}` : `No ${noun} verification run recorded`} />
    </Box>;
}
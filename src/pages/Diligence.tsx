import { useEffect, useRef } from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { AsBuiltTab } from "../components/diligence/AsBuiltTab";
import { FindingDrawer } from "../components/diligence/FindingDrawer";
import { useDiligence } from "../contexts/DiligenceContext";
import { useScreenInit } from "../useScreenInit.js";
import { diligenceUrl, qanUrl } from "../utils/qanLinks";
import type { DiligenceArea, QanTab } from "../types/diligence";
const descriptions: Record<DiligenceArea, string> = {
  data: "Investigate data issues and prepare remediation plans. Checks and approvals happen in QAN.",
  process: "Investigate process issues and prepare remediation plans. Checks and approvals happen in QAN."
};

/** Diligence and analysis: investigate findings and prepare remediation plans. Quality control and assurance live in QAN. */
export function Diligence() {
  const {
    area: param
  } = useParams();
  const [params, setParams] = useSearchParams();
  const {
    openFinding,
    selectedId,
    findings
  } = useDiligence();
  const screen = useScreenInit() as {
    tab?: QanTab;
  } | null;
  const findingId = params.get("finding");
  const legacyTab = params.get("tab") as QanTab | null ?? screen?.tab;
  const target = findingId ? findings.find((f) => f.id === findingId) : undefined;
  // Open the finding named in the URL (arriving from QAN or a shared link).
  useEffect(() => {
    if (findingId && target) openFinding(findingId);
  }, [findingId]); // eslint-disable-line react-hooks/exhaustive-deps
  // Keep ?finding= in step with the open finding so moving to QAN keeps the selection.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if ((selectedId ?? null) === findingId) return;
    const next = new URLSearchParams(params);
    if (selectedId) next.set("finding", selectedId);else next.delete("finding");
    setParams(next, {
      replace: true
    });
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (param !== "data" && param !== "process") return <Navigate to={target ? diligenceUrl(target.area, target.id) : "/diligence/data"} replace />;
  const area: DiligenceArea = param;
  // Quality control and assurance used to be duplicated here; redirect to QAN keeping area and finding.
  if (legacyTab === "quality" || legacyTab === "assurance") return <Navigate to={qanUrl(target?.area ?? area, legacyTab, findingId)} replace />;
  // A finding always opens under its own area.
  if (target && target.area !== area) return <Navigate to={diligenceUrl(target.area, target.id)} replace />;
  return <Box className="space-y-5">
      <Box>
        <Heading as="h1" className="!text-[26px] !font-semibold tracking-tight text-white">Diligence and analysis</Heading>
        <Text className="mt-1 text-[14px] text-slate-400">{descriptions[area]}</Text>
      </Box>
      <AsBuiltTab area={area} />
      <FindingDrawer />
    </Box>;
}
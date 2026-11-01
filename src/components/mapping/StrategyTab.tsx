import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import { LayersIcon } from "lucide-react";
import { pyramidLinks, pyramidRecords } from "../../data/strategyPyramid";
import { AiRecommendations } from "./AiRecommendations";
import { AskAtlasCard } from "./AskAtlasCard";
import { ContextStrip } from "./ContextStrip";
import { PolicyCoverage } from "./PolicyCoverage";
import { StrategicInsights } from "./StrategicInsights";
import { StrategyConnections } from "./StrategyConnections";
import { StrategyPyramid } from "./StrategyPyramid";
import { atlasSuggestions } from "../../data/processVariants";

/** Process mapping → Strategy: pyramid, coverage, insights, connections, recommendations and Ask Atlas. */
export function StrategyTab() {
  const [insightId, setInsightId] = useState<string | null>("i2");
  const show = (id: string) => {
    setInsightId(id);
    document.getElementById("strategic-insights")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };
  return <Box className="space-y-4">
      <ContextStrip icon={LayersIcon} label="Strategy to execution" meta={`${pyramidRecords} catalog records across five layers`} chip={`${pyramidLinks.length} connections`} />
      <StrategyPyramid />
      <PolicyCoverage />
      <StrategicInsights selectedId={insightId} onSelect={setInsightId} />
      <StrategyConnections />
      <Box className="grid gap-4 lg:grid-cols-2">
        <AiRecommendations onShow={show} />
        <AskAtlasCard suggestions={atlasSuggestions} />
      </Box>
    </Box>;
}
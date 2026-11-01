import React from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, CircleAlertIcon, FlaskConicalIcon, LightbulbIcon, ListPlusIcon, NetworkIcon } from "lucide-react";
import type { AssistantResponse, ResponseBlock } from "../../types/assistant";
import { resolveIntent } from "../../utils/assistantIntents";
import { WorkflowPreview } from "./WorkflowPreview";
import { DocumentsBlock } from "./blocks/DocumentsBlock";
import { MetricsBlock } from "./blocks/MetricsBlock";
import { ChartBlock } from "./blocks/ChartBlock";
import { ReportBlock } from "./blocks/ReportBlock";
import { EvidenceTag } from "../ui/EvidenceTag";
import { ConfidenceMeter } from "../ui/ConfidenceMeter";
interface Props {
  response: AssistantResponse;
  modelName: string;
  /** The original question; used to offer a link to the page where its answer lives. */
  prompt?: string;
  onCreateTask: (text: string) => void;
}
function Block({
  block


}: {block: ResponseBlock;}) {
  switch (block.kind) {
    case "documents":
      return <DocumentsBlock block={block} />;
    case "metrics":
      return <MetricsBlock block={block} />;
    case "chart":
      return <ChartBlock block={block} />;
    case "report":
      return <ReportBlock block={block} />;
  }
}
export function AssistantResponseCard({
  response,
  modelName,
  prompt,
  onCreateTask
}: Props) {
  const navigate = useNavigate();
  const intent = prompt ? resolveIntent(prompt) : null;
  const related = intent && intent.kind === "page" && !response.blocks?.some((b) => b.kind === "documents") ? intent : null;
  const sections = [response.evidence.length > 0, response.issues.length > 0, response.recommendations.length > 0].filter(Boolean).length;
  return <Box className="glass-tile space-y-4 rounded-2xl p-4 md:p-5">
      <Flex className="flex-wrap items-center justify-between gap-2">
        <Text as="h3" className="text-[15px] font-semibold text-white">{response.title}</Text>
        <ConfidenceMeter value={response.confidence} />
      </Flex>
      <Text className="text-[13.5px] leading-relaxed text-slate-300">{response.summary}</Text>

      {response.blocks && response.blocks.length > 0 && <Box className="space-y-3">
          {response.blocks.map((b) => <Block key={`${b.kind}-${b.title}`} block={b} />)}
        </Box>}

      {response.workflow && <WorkflowPreview steps={response.workflow} label={response.compareWorkflow ? "Current state (observed)" : "Workflow"} />}
      {response.compareWorkflow && <WorkflowPreview steps={response.compareWorkflow} label="Best-practice / proposed" />}

      {sections > 0 && <Box className={`grid gap-4 ${sections === 3 ? "md:grid-cols-3" : sections === 2 ? "md:grid-cols-2" : ""}`}>
          {response.evidence.length > 0 && <Box>
              <Text className="mb-1.5 text-[11px] uppercase tracking-wider text-slate-500">Supporting evidence</Text>
              <Box as="ul" className="space-y-1.5">
                {response.evidence.map((e) => <Box as="li" key={e.label} className="rounded-lg bg-white/[0.03] px-2.5 py-1.5">
                    <Flex className="items-start justify-between gap-2">
                      <Text className="text-[12px] text-slate-300">{e.label}</Text>
                      <EvidenceTag status={e.status} compact />
                    </Flex>
                    <Text className="text-[11px] text-slate-500">{e.source}</Text>
                  </Box>)}
              </Box>
            </Box>}
          {response.issues.length > 0 && <Box>
              <Text className="mb-1.5 text-[11px] uppercase tracking-wider text-slate-500">Identified issues</Text>
              <Box as="ul" className="space-y-1.5">
                {response.issues.map((i) => <Flex as="li" key={i} className="items-start gap-2 text-[12px] text-slate-300">
                    <CircleAlertIcon size={12} className="mt-0.5 shrink-0 text-amber-300" />{i}
                  </Flex>)}
              </Box>
            </Box>}
          {response.recommendations.length > 0 && <Box>
              <Text className="mb-1.5 text-[11px] uppercase tracking-wider text-slate-500">Recommendations</Text>
              <Box as="ul" className="space-y-1.5">
                {response.recommendations.map((r) => <Box as="li" key={r.text} className="rounded-lg border border-violet-400/15 bg-violet-400/[0.05] px-2.5 py-1.5">
                    <Flex className="items-start gap-2">
                      <LightbulbIcon size={12} className="mt-0.5 shrink-0 text-violet-300" />
                      <Box>
                        <Text className="text-[12px] text-slate-200">{r.text}</Text>
                        <Text className="text-[11px] text-violet-300/80">{r.impact}</Text>
                      </Box>
                    </Flex>
                  </Box>)}
              </Box>
            </Box>}
        </Box>}

      <Flex className="flex-col gap-3 border-t border-white/[0.06] pt-4 md:flex-row md:items-center md:justify-between">
        <Flex className="items-center gap-1.5 text-[11px] text-slate-500">
          <FlaskConicalIcon size={11} />
          {modelName} · sample response from demo data, not live analysis
        </Flex>
        <Flex className="flex-wrap gap-2">
          {related && <Button size="xs" variant="outline" rightIcon={<ArrowRightIcon size={12} />} onClick={() => navigate(related.path, {
          state: {
            focus: related.target,
            filter: related.filter
          }
        })}>
              Open {related.label}
            </Button>}
          {response.recommendations.length > 0 && <Button size="xs" leftIcon={<ListPlusIcon size={12} />} onClick={() => onCreateTask(response.recommendations[0].text)}>Turn into task</Button>}
          {response.workflow && <Button size="xs" variant="primary" leftIcon={<NetworkIcon size={12} />} onClick={() => navigate("/process-mapping-graph")}>Open in process mapping</Button>}
        </Flex>
      </Flex>
    </Box>;
}
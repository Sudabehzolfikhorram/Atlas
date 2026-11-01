/**
 * Routes an Overview prompt to the right kind of answer:
 *  - "overview": the content already exists on the Overview → scroll there
 *  - "page": the content lives on another page → navigate, then scroll there
 *  - "inline": conversational → short answer inside the AI Assistant section
 * Matching is keyword-based for this prototype (no live language model).
 */
export type AssistantIntent =
{kind: "inline";} |
{kind: "overview";target: string;label: string;filter?: string;} |
{kind: "page";path: string;pageName: string;target: string;label: string;filter?: string;};

interface Rule {
  test: RegExp;
  unless?: RegExp;
  intent: Exclude<AssistantIntent, {kind: "inline";}>;
}

const rules: Rule[] = [
// Overview content
{ test: /bottleneck/, intent: { kind: "overview", target: "overview-signals", label: "Business signals & opportunities", filter: "all" } },
{ test: /\b(critical|signals?|issues?)\b/, intent: { kind: "overview", target: "overview-signals", label: "Business signals & opportunities", filter: "critical" } },
{ test: /needs? validation|unverified/, intent: { kind: "overview", target: "overview-signals", label: "Business signals & opportunities", filter: "validation" } },
{ test: /decision|approv/, intent: { kind: "overview", target: "overview-decisions", label: "Decisions requiring your attention" } },
{ test: /health|kpi|performance|cycle time|conformance score|metrics?\b/, intent: { kind: "overview", target: "overview-health", label: "Process Health" } },
{ test: /improvement|opportunit|best practice|compare|workflows? (map|across)|which teams|departments?/, intent: { kind: "overview", target: "overview-workflows", label: "Data governance" } },

// Other pages
{ test: /anomal|unusual/, intent: { kind: "page", path: "/process", pageName: "Process Intelligence", target: "process-anomalies", label: "AI-detected anomalies" } },
{ test: /optimi|compliance|conformance|deviation/, intent: { kind: "page", path: "/process", pageName: "Process Intelligence", target: "process-compliance", label: "Process compliance" } },
{ test: /dependenc/, intent: { kind: "page", path: "/process", pageName: "Process Intelligence", target: "process-dependencies", label: "Cross-department dependencies" } },
{ test: /wait|stage delay|delay by stage|sankey|handoff/, intent: { kind: "page", path: "/process", pageName: "Process Intelligence", target: "process-stage-wait", label: "Average wait by P2P stage" } },
{ test: /\btasks?\b|plan(ning|s)?\b|timeline|schedul|deadline/, intent: { kind: "page", path: "/planning", pageName: "Operational Planning", target: "planning-tasks", label: "Tasks" } },
{ test: /lineage/, intent: { kind: "page", path: "/governance", pageName: "Governance & Lineage", target: "gov-lineage", label: "Data lineage" } },
{ test: /governance gap|gaps|controls?\b/, intent: { kind: "page", path: "/governance", pageName: "Governance & Lineage", target: "gov-gaps", label: "Governance gaps" } },
{ test: /production/, intent: { kind: "page", path: "/governance", pageName: "Governance & Lineage", target: "gov-production", label: "Production workflow performance" } },
{ test: /risks?\b/, unless: /summar|explain|why|what are/, intent: { kind: "page", path: "/reports", pageName: "Executive Report", target: "report-health", label: "Risk prioritization" } },
{ test: /executive report|report|maturity|findings|evidence gaps/, intent: { kind: "page", path: "/reports", pageName: "Executive Report", target: "report-summary", label: "Executive summary" } },
{ test: /audit|activity log/, intent: { kind: "page", path: "/audit", pageName: "Audit Trail", target: "audit-log", label: "Audit trail" } },
{ test: /permission|access|privacy|data sources?|connected systems/, intent: { kind: "page", path: "/trust", pageName: "Data Transparency & Control", target: "trust-sources", label: "Connected systems" } },
{ test: /documents?|upload|catalog|files?\b/, intent: { kind: "page", path: "/catalog", pageName: "Organization Catalog", target: "catalog-documents", label: "Uploaded documents" } },
{ test: /graph|relationship/, intent: { kind: "page", path: "/process-mapping-graph", pageName: "Process mapping", target: "pmg-panel", label: "Process mapping" } }];


export function resolveIntent(prompt: string): AssistantIntent {
  const p = prompt.toLowerCase();
  // Questions phrased conversationally get an answer, not a redirect.
  if (/^(why|how come|explain|summari[sz]e|what needs attention|tell me about)\b/.test(p)) return { kind: "inline" };
  const rule = rules.find((r) => r.test.test(p) && !(r.unless && r.unless.test(p)));
  return rule ? rule.intent : { kind: "inline" };
}
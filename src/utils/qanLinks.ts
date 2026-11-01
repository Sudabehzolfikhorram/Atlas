import type { DiligenceArea } from "../types/diligence";

export type QanView = "quality" | "assurance";

/** QAN URL that preserves the selected finding and Data/Process context. */
export const qanUrl = (area: DiligenceArea, view: QanView, findingId?: string | null) => `/qan/${area}?view=${view}${findingId ? `&finding=${findingId}` : ""}`;
export const diligenceUrl = (area: DiligenceArea, findingId?: string | null) => `/diligence/${area}${findingId ? `?finding=${findingId}` : ""}`;
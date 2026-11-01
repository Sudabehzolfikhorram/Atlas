import type { CheckSample } from "../types/diligence";

/** Demo scenario: purchase approval outside the formal workflow. All records are fictional. */
export const demoFindingId = "F-01";
export const demoRule = {
  id: "QC-PA-01",
  text: "Formal approval must be recorded before the purchase order is sent."
};

const rec = (po: string, supplier: string, amount: number, approvedAt: string, sentAt: string) => ({ po, supplier, amount, approvedAt, sentAt });

/** Fixed pre-remediation sample: 3 of 10 POs were sent before approval was recorded. */
export const baselineSample: CheckSample = {
  id: "S-BASE-10",
  label: "10 POs above delegated limit · Sep 2026",
  records: [
  rec("PO 4500-8801", "Northfield Supply", 48200, "2026-09-02T09:10:00Z", "2026-09-02T11:40:00Z"),
  rec("PO 4500-8804", "Basin Pipe & Valve", 126500, "2026-09-03T15:20:00Z", "2026-09-03T10:05:00Z"),
  rec("PO 4500-8806", "Carrow Electrical", 31800, "2026-09-04T08:30:00Z", "2026-09-04T09:15:00Z"),
  rec("PO 4500-8809", "Westline Safety", 22400, "2026-09-08T13:00:00Z", "2026-09-08T16:20:00Z"),
  rec("PO 4500-8812", "Basin Pipe & Valve", 94300, "2026-09-10T13:02:00Z", "2026-09-10T10:02:00Z"),
  rec("PO 4500-8815", "Harbor Fleet Services", 57900, "2026-09-12T10:45:00Z", "2026-09-12T14:10:00Z"),
  rec("PO 4500-8818", "Northfield Supply", 39600, "2026-09-16T09:00:00Z", "2026-09-16T09:40:00Z"),
  rec("PO 4500-8823", "Ridge Instrumentation", 71250, "2026-09-19T17:30:00Z", "2026-09-18T15:55:00Z"),
  rec("PO 4500-8827", "Carrow Electrical", 28900, "2026-09-23T11:10:00Z", "2026-09-23T12:00:00Z"),
  rec("PO 4500-8830", "Westline Safety", 44100, "2026-09-26T08:05:00Z", "2026-09-26T08:50:00Z")]

};

const corrected = [
rec("PO 4500-9101", "Northfield Supply", 51200, "2026-10-26T09:05:00Z", "2026-10-26T10:30:00Z"),
rec("PO 4500-9103", "Basin Pipe & Valve", 118400, "2026-10-26T14:10:00Z", "2026-10-26T15:00:00Z"),
rec("PO 4500-9104", "Carrow Electrical", 33700, "2026-10-27T08:40:00Z", "2026-10-27T09:10:00Z"),
rec("PO 4500-9106", "Westline Safety", 24800, "2026-10-27T13:15:00Z", "2026-10-27T15:45:00Z"),
rec("PO 4500-9107", "Ridge Instrumentation", 68900, "2026-10-28T10:00:00Z", "2026-10-28T11:20:00Z"),
rec("PO 4500-9109", "Harbor Fleet Services", 60300, "2026-10-28T15:30:00Z", "2026-10-28T16:05:00Z"),
rec("PO 4500-9110", "Northfield Supply", 41500, "2026-10-29T09:20:00Z", "2026-10-29T09:55:00Z"),
rec("PO 4500-9112", "Basin Pipe & Valve", 89700, "2026-10-29T12:45:00Z", "2026-10-29T14:00:00Z"),
rec("PO 4500-9114", "Carrow Electrical", 27300, "2026-10-30T08:10:00Z", "2026-10-30T08:35:00Z"),
rec("PO 4500-9115", "Westline Safety", 46600, "2026-10-30T11:00:00Z", "2026-10-30T13:25:00Z")];


/** Post-remediation samples. The regression sample demonstrates the failed-verification path. */
export const verificationSamples: CheckSample[] = [{
  id: "S-VER-10",
  label: "10 corrected POs after the ERP approval gate · Oct 2026",
  records: corrected
}, {
  id: "S-VER-10R",
  label: "Same 10 POs with 1 urgent-purchase bypass · Oct 2026",
  records: corrected.map((r) => r.po === "PO 4500-9107" ? { ...r, approvedAt: "2026-10-28T13:40:00Z" } : r)
}];
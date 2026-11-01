import type { OutcomeCount, OutcomeHeadline, ProcessVariant } from "../types/processVariants";

/** Ask Atlas suggested investigations on the Mapping pages. */
export const atlasSuggestions = ["What slows down Travel permits?", "Find the widest impact", "Cases and variants"];

/** Travel-permit event log summary (sample data). */
export const eventLog = {
  name: "Travel permits",
  period: "4 Oct 2016 – 31 Aug 2021",
  cases: 7065,
  events: 86581
};

export const outcomeHeadlines: OutcomeHeadline[] = [
{ id: "completed", label: "Payment completed", value: "77.5%", tone: "teal", info: "Share of cases whose last recorded activity is Payment Handled." },
{ id: "duration", label: "Median duration", value: "71.7 days", tone: "white", info: "Median time from the first to the last event of a case." },
{ id: "deviation", label: "Variants with deviation", value: "46.5%", tone: "amber", info: "Share of variants containing at least one flagged time or sequence deviation." },
{ id: "stopped", label: "Stopped early", value: "147", tone: "amber", info: "Cases that ended before payment without a rejection." }];


export const outcomeCounts: OutcomeCount[] = [
{ label: "Cases arrived", value: 7065, info: "Cases whose first event falls in the log period." },
{ label: "Cases ended", value: 7065, info: "Cases with a recorded last event." },
{ label: "Rejected cases", value: 1148, info: "Cases containing at least one REJECTED activity." },
{ label: "Reminder sent", value: 1381, info: "Cases where a Send Reminder activity was recorded." },
{ label: "Repeated activity", value: 3350, info: "Cases where the same activity occurs more than once." }];


const seeded: Omit<ProcessVariant, "id">[] = [
{ path: ["Permit SUBMITTED", "Permit FINAL_APPROVED", "Start trip", "End trip", "Declaration SUBMITTED", "Declaration FINAL_APPROVED", "Payment Handled"], cases: 956, medianDays: 44.93, finalState: "Payment Handled", deviation: false },
{ path: ["Permit SUBMITTED", "Permit APPROVED by ADMINISTRATION", "Permit FINAL_APPROVED", "Start trip", "End trip", "Declaration SUBMITTED", "Payment Handled"], cases: 427, medianDays: 56.2, finalState: "Payment Handled", deviation: false },
{ path: ["Permit SUBMITTED", "Permit FINAL_APPROVED", "Start trip", "End trip", "Send Reminder"], cases: 343, medianDays: 130.73, finalState: "Send Reminder", deviation: true },
{ path: ["Permit SUBMITTED", "Permit APPROVED by SUPERVISOR", "Permit FINAL_APPROVED", "Start trip", "End trip", "Declaration SUBMITTED", "Payment Handled"], cases: 302, medianDays: 45.21, finalState: "Payment Handled", deviation: false },
{ path: ["Permit SUBMITTED", "Permit FINAL_APPROVED", "Start trip", "End trip", "Declaration SUBMITTED", "Declaration REJECTED", "Declaration SUBMITTED", "Payment Handled"], cases: 243, medianDays: 56.32, finalState: "Payment Handled", deviation: true },
{ path: ["Permit SUBMITTED", "Permit APPROVED by BUDGET OWNER", "Permit FINAL_APPROVED", "Start trip", "End trip", "Declaration SUBMITTED", "Payment Handled"], cases: 201, medianDays: 45.19, finalState: "Payment Handled", deviation: false },
{ path: ["Permit SUBMITTED", "Permit FINAL_APPROVED", "Request For Payment SUBMITTED", "Start trip", "End trip", "Declaration SUBMITTED", "Payment Handled"], cases: 166, medianDays: 87.02, finalState: "Payment Handled", deviation: true },
{ path: ["Start trip", "Permit SUBMITTED", "Permit FINAL_APPROVED", "End trip", "Declaration SUBMITTED", "Payment Handled"], cases: 148, medianDays: 29.73, finalState: "Payment Handled", deviation: false }];


const middle = ["Permit APPROVED by ADMINISTRATION", "Permit APPROVED by SUPERVISOR", "Permit APPROVED by BUDGET OWNER", "Declaration REJECTED by EMPLOYEE", "Request For Payment SUBMITTED", "Declaration APPROVED by PRE_APPROVER", "Send Reminder", "Permit REJECTED by ADMINISTRATION"];
const finals = ["Payment Handled", "Payment Handled", "Send Reminder", "Declaration REJECTED", "Payment Handled", "Permit REJECTED", "End trip"];
const TOTAL_VARIANT_CASES = 5802;
const REST = 292;

const hex = (i: number) => (((i + 7) * 2654435761 >>> 0).toString(16) + ((i + 3) * 40503 >>> 0).toString(16)).padEnd(12, "0").slice(0, 12);

/** Remaining cases split across the long tail of variants, largest first. */
function tail(total: number, n: number): number[] {
  const w = Array.from({ length: n }, (_, i) => 1 / (i + 4));
  const rest = total - n;
  const sum = w.reduce((s, v) => s + v, 0);
  const raw = w.map((v) => v / sum * rest);
  const out = raw.map((r) => Math.floor(r) + 1);
  let left = total - out.reduce((s, v) => s + v, 0);
  for (let i = 0; left > 0; i = (i + 1) % n, left -= 1) out[i] += 1;
  return out.sort((a, b) => b - a);
}

const seededCases = seeded.reduce((s, v) => s + v.cases, 0);
const tailCases = tail(TOTAL_VARIANT_CASES - seededCases, REST).map((c) => Math.min(c, 147));

export const processVariants: ProcessVariant[] = [
...seeded.map((v, i) => ({ ...v, id: hex(i) })),
...tailCases.map((cases, k) => {
  const i = k + seeded.length;
  const finalState = finals[i % finals.length];
  const start = i % 9 === 0 ? "Start trip" : "Permit SUBMITTED";
  const steps = [middle[i % middle.length], middle[(i * 3 + 1) % middle.length]].filter((s, j, a) => a.indexOf(s) === j);
  return {
    id: hex(i),
    path: [start, ...steps, "End trip", finalState].filter((s, j, a) => a.indexOf(s) === j),
    cases,
    medianDays: Math.round((28 + i * 37 % 110 + i * 13 % 100 / 100) * 100) / 100,
    finalState,
    deviation: i % 3 === 0 || finalState === "Send Reminder"
  };
})];
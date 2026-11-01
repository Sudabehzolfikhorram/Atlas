import type { Lane, ProcessModel } from "../types/bestPractice";

/**
 * Travel permit process (sample event log modelled on a public travel-expense dataset).
 * As-is is reconstructed from events; target is the proposed best-practice design.
 */
export const processLanes: Lane[] = [
{ id: "source", label: "Source system" },
{ id: "employee", label: "Employee" },
{ id: "admin", label: "Administration" },
{ id: "pre", label: "Pre-Approver" },
{ id: "budget", label: "Budget Owner" },
{ id: "supervisor", label: "Supervisor" },
{ id: "director", label: "Director" }];


export const asIsProcess: ProcessModel = {
  id: "asis",
  title: "As-is",
  laneEvents: { source: 86581, employee: 33436, admin: 13837, pre: 1301, budget: 4370, supervisor: 19391, director: 935 },
  tasks: [
  { id: "xes", lane: "source", col: 0, row: 0, label: "XES source system", events: 86581, kind: "system", status: "verified" },
  { id: "submitted", lane: "employee", col: 1, row: 0, label: "Permit SUBMITTED", events: 7331, kind: "human", status: "attention", waitH: 50, targetH: 0, rework: 4, note: "Permits are often saved and reopened before submission." },
  { id: "saved", lane: "employee", col: 1, row: 1, label: "Permit SAVED", events: 17, kind: "hidden", status: "verified", note: "Draft state outside the documented process." },
  { id: "rfp", lane: "employee", col: 3, row: 0, label: "Request For Payment SAVED", events: 17, kind: "hidden", status: "verified", note: "Payment requests created before the permit is approved." },
  { id: "admin-approved", lane: "admin", col: 2, row: 0, label: "Permit APPROVED", events: 5715, kind: "approval", status: "critical", waitH: 0.001, rework: 2, note: "Approved within seconds of submission — no evidence of review." },
  { id: "rejected", lane: "admin", col: 2, row: 1, label: "Permit REJECTED", events: 133, kind: "exception", status: "verified", waitH: 0.0014, rework: 2 },
  { id: "for-approval", lane: "admin", col: 2, row: 2, label: "Permit FOR_APPROVAL", events: 1, kind: "hidden", status: "verified", waitH: 0.0008 },
  { id: "pre-approved", lane: "pre", col: 3, row: 0, label: "Permit APPROVED", events: 584, kind: "hidden", status: "attention", waitH: 0.0014, rework: 2, note: "Pre-approval is skipped for most permits." },
  { id: "budget-approved", lane: "budget", col: 4, row: 0, label: "Permit APPROVED", events: 2048, kind: "approval", status: "attention", waitH: 158, targetH: 30.4 },
  { id: "final-approved", lane: "supervisor", col: 5, row: 0, label: "Permit FINAL_APPROVED", events: 6300, kind: "approval", status: "attention", waitH: 46, targetH: 30.4, note: "Supervisor can approve their own team's spend; no segregation check." },
  { id: "sup-approved", lane: "supervisor", col: 5, row: 1, label: "Permit APPROVED", events: 683, kind: "approval", status: "unverified" },
  { id: "dir-final", lane: "director", col: 6, row: 0, label: "Permit FINAL_APPROVED", events: 681, kind: "approval", status: "critical", waitH: 77, targetH: 30.4, note: "No named owner for escalations to the Director." },
  { id: "start-trip", lane: "employee", col: 7, row: 0, label: "Start trip", events: 7065, kind: "human", status: "verified" },
  { id: "end-trip", lane: "employee", col: 8, row: 0, label: "End trip", events: 7065, kind: "human", status: "verified" },
  { id: "decl-submitted", lane: "employee", col: 9, row: 0, label: "Declaration SUBMITTED", events: 7574, kind: "human", status: "critical", waitH: 446, targetH: 134, rework: 6, note: "Declarations wait 18.6 days on average after the trip ends." },
  { id: "decl-approved", lane: "admin", col: 10, row: 0, label: "Declaration APPROVED", events: 4782, kind: "approval", status: "attention", waitH: 31 }],

  transitions: [
  { id: "a1", from: "xes", to: "submitted", kind: "flow", label: "6,319" },
  { id: "a2", from: "submitted", to: "saved", kind: "hidden" },
  { id: "a3", from: "saved", to: "submitted", kind: "hidden", label: "405 · 4 s" },
  { id: "a4", from: "submitted", to: "admin-approved", kind: "flow" },
  { id: "a5", from: "submitted", to: "rejected", kind: "exception" },
  { id: "a6", from: "admin-approved", to: "pre-approved", kind: "hidden", label: "581 · 5 s" },
  { id: "a7", from: "admin-approved", to: "for-approval", kind: "hidden" },
  { id: "a8", from: "rfp", to: "submitted", kind: "exception" },
  { id: "a9", from: "admin-approved", to: "budget-approved", kind: "flow", label: "1,677 · 5 s" },
  { id: "a10", from: "budget-approved", to: "final-approved", kind: "flow" },
  { id: "a11", from: "pre-approved", to: "final-approved", kind: "flow" },
  { id: "a12", from: "final-approved", to: "sup-approved", kind: "flow" },
  { id: "a13", from: "final-approved", to: "dir-final", kind: "flow", label: "629" },
  { id: "a14", from: "final-approved", to: "start-trip", kind: "flow", label: "4,018" },
  { id: "a15", from: "dir-final", to: "start-trip", kind: "flow" },
  { id: "a16", from: "start-trip", to: "end-trip", kind: "flow" },
  { id: "a17", from: "end-trip", to: "decl-submitted", kind: "flow", label: "18.6 d" },
  { id: "a18", from: "decl-submitted", to: "decl-approved", kind: "flow", label: "4,685" },
  { id: "a19", from: "xes", to: "rfp", kind: "flow", label: "734" }]

};

export const targetProcess: ProcessModel = {
  id: "target",
  title: "Best practice",
  laneEvents: { source: 86581, employee: 31167, admin: 20417, pre: 1301, budget: 4370, supervisor: 19391, director: 935 },
  tasks: [
  { id: "xes", lane: "source", col: 0, row: 0, label: "XES source system", events: 86581, kind: "system", status: "verified" },
  { id: "submitted", lane: "employee", col: 1, row: 0, label: "Permit SUBMITTED", events: 7331, kind: "human", status: "verified", waitH: 50, targetH: 0 },
  { id: "validate", lane: "employee", col: 2, row: 1, label: "Validate before submitting", events: 9607, kind: "control", status: "verified", note: "Required fields and budget code checked before submission; replaces the hidden save-and-reopen loop." },
  { id: "rfp", lane: "employee", col: 3, row: 0, label: "Request For Payment SAVED", events: 17, kind: "human", status: "verified", note: "Only allowed after the permit is approved." },
  { id: "admin-approved", lane: "admin", col: 2, row: 0, label: "Permit APPROVED", events: 5715, kind: "approval", status: "verified", waitH: 0.001, targetH: 30.4 },
  { id: "owner-admin", lane: "admin", col: 3, row: 1, label: "Name an accountable owner", events: 17388, kind: "control", status: "verified", note: "Every approval queue has a named owner and backup." },
  { id: "pre-approved", lane: "pre", col: 3, row: 0, label: "Permit APPROVED", events: 584, kind: "approval", status: "verified", waitH: 0.0014, targetH: 30.4 },
  { id: "budget-approved", lane: "budget", col: 4, row: 0, label: "Permit APPROVED", events: 2048, kind: "approval", status: "verified", waitH: 158, targetH: 6.6 },
  { id: "sod", lane: "supervisor", col: 4, row: 1, label: "Check segregation of duties", events: 14629, kind: "control", status: "verified", note: "Blocks a supervisor approving spend they requested or own." },
  { id: "final-approved", lane: "supervisor", col: 5, row: 0, label: "Permit FINAL_APPROVED", events: 6300, kind: "approval", status: "verified", waitH: 46, targetH: 30.4 },
  { id: "sup-approved", lane: "supervisor", col: 5, row: 1, label: "Permit APPROVED", events: 683, kind: "approval", status: "verified" },
  { id: "owner-sup", lane: "supervisor", col: 6, row: 1, label: "Name an accountable owner", events: 186, kind: "control", status: "verified" },
  { id: "dir-final", lane: "director", col: 6, row: 0, label: "Permit FINAL_APPROVED", events: 681, kind: "approval", status: "verified", waitH: 77, targetH: 30.4 },
  { id: "rejected", lane: "supervisor", col: 9, row: 2, label: "Permit REJECTED (controlled)", events: 775, kind: "exception", status: "verified", note: "Rejections from all approvers merged into one controlled path with a reason code." },
  { id: "start-trip", lane: "employee", col: 7, row: 0, label: "Start trip", events: 7065, kind: "human", status: "verified" },
  { id: "end-trip", lane: "employee", col: 8, row: 0, label: "End trip", events: 7065, kind: "human", status: "verified" },
  { id: "escalate", lane: "employee", col: 9, row: 1, label: "Escalate waits over target", events: 21704, kind: "control", status: "verified", note: "Automatic escalation when a declaration waits longer than 5.6 days." },
  { id: "reminder", lane: "admin", col: 9, row: 0, label: "Send Reminder", events: 2303, kind: "system", status: "verified" },
  { id: "decl-submitted", lane: "employee", col: 10, row: 0, label: "Declaration SUBMITTED", events: 7574, kind: "human", status: "verified", waitH: 446, targetH: 134 },
  { id: "decl-approved", lane: "admin", col: 10, row: 1, label: "Declaration APPROVED", events: 4782, kind: "approval", status: "verified", waitH: 31, targetH: 0 }],

  transitions: [
  { id: "t1", from: "xes", to: "submitted", kind: "flow", label: "6,319 · target no wait" },
  { id: "t2", from: "submitted", to: "validate", kind: "control" },
  { id: "t3", from: "validate", to: "admin-approved", kind: "flow", label: "target 30.4 h" },
  { id: "t4", from: "admin-approved", to: "owner-admin", kind: "control" },
  { id: "t5", from: "owner-admin", to: "pre-approved", kind: "flow" },
  { id: "t6", from: "admin-approved", to: "budget-approved", kind: "flow", label: "1,862 · target 6.6 h" },
  { id: "t7", from: "pre-approved", to: "sod", kind: "flow" },
  { id: "t8", from: "budget-approved", to: "sod", kind: "control" },
  { id: "t9", from: "sod", to: "final-approved", kind: "flow", label: "1,594 · target 30.4 h" },
  { id: "t10", from: "final-approved", to: "sup-approved", kind: "flow" },
  { id: "t11", from: "sup-approved", to: "owner-sup", kind: "control" },
  { id: "t12", from: "final-approved", to: "dir-final", kind: "flow", label: "629" },
  { id: "t13", from: "final-approved", to: "start-trip", kind: "flow", label: "4,018 · target 18.6 d" },
  { id: "t14", from: "dir-final", to: "start-trip", kind: "flow" },
  { id: "t15", from: "start-trip", to: "end-trip", kind: "flow", label: "1,176 · target 2.9 d" },
  { id: "t16", from: "end-trip", to: "escalate", kind: "control" },
  { id: "t17", from: "end-trip", to: "reminder", kind: "flow" },
  { id: "t18", from: "reminder", to: "decl-submitted", kind: "flow", label: "360 · target 5.6 d" },
  { id: "t19", from: "escalate", to: "decl-submitted", kind: "control" },
  { id: "t20", from: "decl-submitted", to: "decl-approved", kind: "flow", label: "4,685 · target no wait" },
  { id: "t21", from: "final-approved", to: "rejected", kind: "exception" },
  { id: "t22", from: "xes", to: "rfp", kind: "flow", label: "734 · target 18.6 d" }]

};
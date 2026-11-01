/**
 * Demo mode: the app runs on sample data and simulated execution.
 * On by default; build with VITE_DEMO_MODE=false to show live connection status.
 */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";

export const DEMO_LABEL = "Sample data — Simulated execution";

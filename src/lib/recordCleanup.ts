const CLEANUP_FLAG = "axen-record-cleanup-2026-06-17-v1";

const RECORD_STORAGE_KEYS = [
  "axen-performance-evaluations-v9",
  "axen-performance-evaluations-v8",
  "axen-performance-evaluations-v7",
  "axen-performance-evaluations-v6",
  "axen-performance-evaluations-v5",
  "axen-performance-evaluations-v4",
  "axen-document-registry-v1",
  "axen-unit-condition-reviews-v2",
  "axen-unit-condition-reviews-v1",
];

export function runOneTimeRecordCleanup() {
  if (typeof localStorage === "undefined") return;
  if (localStorage.getItem(CLEANUP_FLAG)) return;

  RECORD_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(CLEANUP_FLAG, new Date().toISOString());
}

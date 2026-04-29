import type { DojoRun } from "@/lib/types";

const STORAGE_KEY = "ninja-dojo-runs";
const MAX_RUNS = 8;

export function loadStoredRuns(): DojoRun[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isStoredRun).slice(0, MAX_RUNS);
  } catch {
    return [];
  }
}

export function saveStoredRun(run: DojoRun) {
  if (typeof window === "undefined") {
    return;
  }

  const runs = loadStoredRuns();
  const nextRuns = [run, ...runs.filter((item) => item.id !== run.id)].slice(
    0,
    MAX_RUNS
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRuns));
}

function isStoredRun(value: unknown): value is DojoRun {
  if (!value || typeof value !== "object") {
    return false;
  }

  const run = value as Partial<DojoRun>;
  return Boolean(
    run.id &&
      run.scroll &&
      run.previewPath &&
      Array.isArray(run.agents) &&
      Array.isArray(run.artifacts)
  );
}

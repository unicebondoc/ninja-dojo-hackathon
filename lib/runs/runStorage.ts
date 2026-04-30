import type { RunManifest } from "@/lib/runs/types";

const STORAGE_KEY = "ninja-dojo-run-manifests";
const MAX_RUNS = 12;

export function loadRunManifests(): RunManifest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRunManifest).slice(0, MAX_RUNS) : [];
  } catch {
    return [];
  }
}

export function saveRunManifest(run: RunManifest) {
  if (typeof window === "undefined") return [];
  const runs = loadRunManifests();
  const nextRuns = [run, ...runs.filter((item) => item.runId !== run.runId)].slice(0, MAX_RUNS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRuns));
  return nextRuns;
}

export function clearRunManifests() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function isRunManifest(value: unknown): value is RunManifest {
  if (!value || typeof value !== "object") return false;
  const run = value as Partial<RunManifest>;
  return Boolean(
    run.runId &&
      run.createdAt &&
      run.scrollText &&
      run.generatedPreview &&
      run.judgeResult &&
      run.moonriseUrl &&
      Array.isArray(run.stages)
  );
}

import type {
  ApprovalGate,
  MissionMemoryEntry,
  ProjectMemoryEntry,
  ReceiptMemoryEntry
} from "@/lib/memory/types";

const APPROVALS_KEY = "ninja-dojo-memory-approvals";
const PROJECTS_KEY = "ninja-dojo-memory-projects";
const MISSIONS_KEY = "ninja-dojo-memory-missions";
const RECEIPTS_KEY = "ninja-dojo-memory-receipts";
const RUNS_KEY = "ninja-dojo-run-manifests";
const MAX_ENTRIES = 40;

export function saveProject(project: ProjectMemoryEntry) {
  const projects = upsertProject(getProjects(), {
    ...project,
    id: stableProjectId(project)
  });
  write(PROJECTS_KEY, projects);
  return projects;
}

export function saveMission(mission: MissionMemoryEntry) {
  const missions = upsert(getMissions(), mission);
  write(MISSIONS_KEY, missions);
  return missions;
}

export function saveReceipt(receipt: ReceiptMemoryEntry) {
  const receipts = upsert(getReceipts(), receipt);
  write(RECEIPTS_KEY, receipts);
  return receipts;
}

export function saveApproval(approval: ApprovalGate) {
  const approvals = upsert(getApprovals(), approval);
  write(APPROVALS_KEY, approvals);
  return approvals;
}

export function getProjects(): ProjectMemoryEntry[] {
  return read<ProjectMemoryEntry>(PROJECTS_KEY, isProject);
}

export function getMissions(): MissionMemoryEntry[] {
  return read<MissionMemoryEntry>(MISSIONS_KEY, isMission);
}

export function getReceipts(): ReceiptMemoryEntry[] {
  return read<ReceiptMemoryEntry>(RECEIPTS_KEY, isReceipt);
}

export function getApprovals(): ApprovalGate[] {
  return read<ApprovalGate>(APPROVALS_KEY, isApproval);
}

export function clearLocalMemory() {
  if (typeof window === "undefined") return;
  [APPROVALS_KEY, PROJECTS_KEY, MISSIONS_KEY, RECEIPTS_KEY, RUNS_KEY].forEach((key) => {
    window.localStorage.removeItem(key);
  });
}

function upsert<T extends { id: string }>(entries: T[], entry: T) {
  return [entry, ...entries.filter((item) => item.id !== entry.id)].slice(0, MAX_ENTRIES);
}

function upsertProject(entries: ProjectMemoryEntry[], entry: ProjectMemoryEntry) {
  const entryName = normalizeName(entry.name);
  return [
    entry,
    ...entries.filter(
      (item) => item.id !== entry.id && normalizeName(item.name) !== entryName
    )
  ].slice(0, MAX_ENTRIES);
}

function read<T>(key: string, guard: (value: unknown) => value is T) {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(guard).slice(0, MAX_ENTRIES) : [];
  } catch {
    window.localStorage.removeItem(key);
    return [];
  }
}

function write<T>(key: string, entries: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(entries));
}

function isProject(value: unknown): value is ProjectMemoryEntry {
  const project = value as Partial<ProjectMemoryEntry>;
  return Boolean(project?.id && project.name && project.status && project.createdAt);
}

function isMission(value: unknown): value is MissionMemoryEntry {
  const mission = value as Partial<MissionMemoryEntry>;
  return Boolean(
    mission?.id &&
      mission.projectId &&
      mission.runId &&
      mission.scrollText &&
      mission.createdAt
  );
}

function isReceipt(value: unknown): value is ReceiptMemoryEntry {
  const receipt = value as Partial<ReceiptMemoryEntry>;
  return Boolean(
    receipt?.id &&
      receipt.projectId &&
      receipt.missionId &&
      receipt.runId &&
      receipt.receiptUrl &&
      receipt.createdAt
  );
}

function isApproval(value: unknown): value is ApprovalGate {
  const approval = value as Partial<ApprovalGate>;
  return Boolean(
    approval?.id &&
      approval.missionId &&
      approval.requestedAt &&
      ["approved", "pending", "rejected"].includes(approval.status ?? "")
  );
}

function stableProjectId(project: ProjectMemoryEntry) {
  return project.id || normalizeName(project.name) || "untitled-project";
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

import {
  mapMissionToNotion,
  mapProjectToNotion,
  mapReceiptToNotion,
  type NotionPreparedPage
} from "@/lib/integrations/notion";
import type {
  MissionMemoryEntry,
  ProjectMemoryEntry,
  ReceiptMemoryEntry
} from "@/lib/memory/types";

type NotionKind = "mission" | "project" | "receipt";

type NotionConfig = {
  missionsDatabaseId?: string;
  projectsDatabaseId?: string;
  receiptsDatabaseId?: string;
  token?: string;
};

const NOTION_VERSION = "2022-06-28";
const syncedFingerprints = new Set<string>();

export async function syncProjectToNotion(project: ProjectMemoryEntry) {
  const config = getNotionConfig();
  if (!config.token || !config.projectsDatabaseId) return { ok: true, skipped: true };

  return syncToDatabase({
    config,
    databaseId: config.projectsDatabaseId,
    idProperty: "Project ID",
    kind: "project",
    page: mapProjectToNotion(project),
    stableId: project.id
  });
}

export async function syncMissionToNotion(mission: MissionMemoryEntry) {
  const config = getNotionConfig();
  if (!config.token || !config.missionsDatabaseId) return { ok: true, skipped: true };

  return syncToDatabase({
    config,
    databaseId: config.missionsDatabaseId,
    idProperty: "Mission ID",
    kind: "mission",
    page: mapMissionToNotion(mission),
    stableId: mission.id
  });
}

export async function syncReceiptToNotion(receipt: ReceiptMemoryEntry) {
  const config = getNotionConfig();
  if (!config.token || !config.receiptsDatabaseId) return { ok: true, skipped: true };

  return syncToDatabase({
    config,
    databaseId: config.receiptsDatabaseId,
    idProperty: "Receipt ID",
    kind: "receipt",
    page: mapReceiptToNotion(receipt),
    stableId: receipt.id
  });
}

function getNotionConfig(): NotionConfig {
  return {
    missionsDatabaseId: process.env.NOTION_MISSIONS_DATABASE_ID,
    projectsDatabaseId: process.env.NOTION_PROJECTS_DATABASE_ID,
    receiptsDatabaseId: process.env.NOTION_RECEIPTS_DATABASE_ID,
    token: process.env.NOTION_TOKEN
  };
}

async function syncToDatabase({
  config,
  databaseId,
  idProperty,
  kind,
  page,
  stableId
}: {
  config: NotionConfig;
  databaseId: string;
  idProperty: string;
  kind: NotionKind;
  page: NotionPreparedPage;
  stableId: string;
}) {
  const fingerprint = `${kind}:${stableId}:${JSON.stringify(page.properties)}`;
  if (syncedFingerprints.has(fingerprint)) return { ok: true, skipped: true };

  try {
    const existingPageId = await findExistingPageId(config, databaseId, idProperty, stableId);
    if (existingPageId) {
      await notionRequest(config, `/v1/pages/${existingPageId}`, {
        method: "PATCH",
        body: JSON.stringify({
          properties: toNotionProperties(page.properties)
        })
      });
    } else {
      await notionRequest(config, "/v1/pages", {
        method: "POST",
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties: toNotionProperties(page.properties)
        })
      });
    }

    syncedFingerprints.add(fingerprint);
    return { ok: true, skipped: false };
  } catch (error) {
    console.warn(`[ninja-dojo:notion] ${kind} sync skipped`, error);
    return { ok: false, skipped: true };
  }
}

async function findExistingPageId(
  config: NotionConfig,
  databaseId: string,
  idProperty: string,
  stableId: string
) {
  try {
    const response = await notionRequest(config, `/v1/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify({
        filter: {
          property: idProperty,
          rich_text: {
            equals: stableId
          }
        },
        page_size: 1
      })
    });
    const result = (await response.json()) as { results?: Array<{ id?: string }> };
    return result.results?.[0]?.id;
  } catch {
    return undefined;
  }
}

async function notionRequest(config: NotionConfig, path: string, init: RequestInit) {
  if (!config.token) throw new Error("Missing Notion token");

  const response = await fetch(`https://api.notion.com${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Notion request failed: ${response.status}`);
  }

  return response;
}

function toNotionProperties(properties: Record<string, string | number>) {
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [key, toNotionProperty(key, value)])
  );
}

function toNotionProperty(key: string, value: string | number) {
  if (key === "Name") {
    return {
      title: [{ text: { content: String(value || "Untitled") } }]
    };
  }

  if (typeof value === "number") {
    return { number: value };
  }

  if (key.endsWith("At")) {
    return value ? { date: { start: value } } : { date: null };
  }

  if (key === "Receipt URL" && value) {
    return { url: value };
  }

  if (key === "Status" || key === "Priority" || key === "Type") {
    return { select: { name: String(value || "Unknown") } };
  }

  return {
    rich_text: [{ text: { content: String(value ?? "") } }]
  };
}

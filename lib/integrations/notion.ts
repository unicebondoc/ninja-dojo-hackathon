import type {
  MissionMemoryEntry,
  ProjectMemoryEntry,
  ReceiptMemoryEntry
} from "@/lib/memory/types";

export type NotionPreparedPage = {
  content: string;
  properties: Record<string, string | number>;
};

export function mapProjectToNotion(project: ProjectMemoryEntry): NotionPreparedPage {
  return {
    content: [
      `Status: ${project.status}`,
      `Next action: ${project.nextAction}`,
      project.lastMissionId ? `Last mission: ${project.lastMissionId}` : "Last mission: none",
      project.lastReceiptId ? `Last receipt: ${project.lastReceiptId}` : "Last receipt: none"
    ].join("\n"),
    properties: {
      "Created At": project.createdAt,
      "Current Mission": project.lastMissionId ?? "",
      "Last Receipt": project.lastReceiptId ?? "",
      "Name": project.name,
      "Next Action": project.nextAction,
      "Priority": "Normal",
      "Project ID": project.id,
      "Status": project.status,
      "Type": "Local",
      "Last Updated": project.updatedAt
    }
  };
}

export function mapMissionToNotion(mission: MissionMemoryEntry): NotionPreparedPage {
  return {
    content: [
      `Scroll: ${mission.scrollText}`,
      `Summary: ${mission.summary}`,
      `Run: ${mission.runId}`,
      `Project: ${mission.projectId}`
    ].join("\n"),
    properties: {
      "Active Agent": "",
      "Assigned Departments": "",
      "Completed At": mission.status === "shipped" ? mission.updatedAt : "",
      "Meowts Score": 0,
      "Mission ID": mission.id,
      "Name": mission.summary,
      "Project ID": mission.projectId,
      "Receipt ID": "",
      "Run ID": mission.runId,
      "Scroll Text": mission.scrollText,
      "Started At": mission.createdAt,
      "Status": mission.status,
      "Summary": mission.summary
    }
  };
}

export function mapReceiptToNotion(receipt: ReceiptMemoryEntry): NotionPreparedPage {
  return {
    content: [
      `Verdict: ${receipt.verdict}`,
      `Score: ${receipt.score}/100`,
      `Summary: ${receipt.summary}`,
      `Receipt: ${receipt.receiptUrl}`
    ].join("\n"),
    properties: {
      "Created At": receipt.createdAt,
      "Mission ID": receipt.missionId,
      "Name": receipt.summary,
      "Project ID": receipt.projectId,
      "Receipt ID": receipt.id,
      "Receipt URL": receipt.receiptUrl,
      "Run ID": receipt.runId,
      "Score": receipt.score,
      "Status": receipt.verdict,
      "Summary": receipt.summary,
      "Verdict": receipt.verdict
    }
  };
}

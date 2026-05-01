"use client";

import { useState } from "react";
import type { ProjectMemoryEntry } from "@/lib/memory/types";
import type { ShrineProject } from "@/lib/mock-dojo-events";

type ShrineState = {
  deployState: string;
  label: string;
  lastCommit: string;
  openPRs: number;
  project: ShrineProject;
  subtitle: string;
};

type ShrineBarProps = {
  projects?: ProjectMemoryEntry[];
  shrines: Record<ShrineProject, ShrineState>;
};

export function ShrineBar({ projects = [], shrines }: ShrineBarProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selected, setSelected] = useState<ShrineProject | null>(null);
  const project = selectedProject
    ? projects.find((item) => item.id === selectedProject) ?? null
    : null;
  const selectedShrine = selected ? shrines[selected] : null;

  return (
    <section className="shrine-bar" aria-label="Project shrines">
      {projects.length > 0 ? projects.slice(0, 6).map((item) => (
        <button
          data-state={item.status === "shipped" ? "green" : item.status === "blocked" ? "red" : "yellow"}
          key={item.id}
          onClick={() => setSelectedProject(item.id)}
          type="button"
        >
          <span />
          <strong>{item.name}</strong>
          <em>{item.status}</em>
          <small className="shrine-bar__memory-row">
            <b>M</b>
            {shortId(item.lastMissionId) ?? "none"}
            <b>R</b>
            {shortId(item.lastReceiptId) ?? "none"}
          </small>
          <small>{item.nextAction}</small>
        </button>
      )) : projects ? (
        <article className="shrine-bar__empty">
          <strong>No project memory yet</strong>
          <small>Send a scroll. The first receipt will create a shrine.</small>
        </article>
      ) : (Object.keys(shrines) as ShrineProject[]).map((projectId) => {
        const shrine = shrines[projectId];
        return (
          <button
            data-state={shrine.deployState}
            key={projectId}
            onClick={() => setSelected(projectId)}
            type="button"
          >
            <span />
            <strong>{shrine.label}</strong>
            <em>{shrine.subtitle}</em>
            <small>{shrine.lastCommit} · {shrine.openPRs} PRs</small>
          </button>
        );
      })}

      {project ? (
        <div className="shrine-modal" role="dialog" aria-modal="true" aria-label={`${project.name} project memory`}>
          <button
            aria-label="Close project memory"
            className="shrine-modal__scrim"
            onClick={() => setSelectedProject(null)}
            type="button"
          />
          <article>
            <header>
              <span>{project.status}</span>
              <button onClick={() => setSelectedProject(null)} type="button">Close</button>
            </header>
            <h2>{project.name}</h2>
            <p>{project.nextAction}</p>
            <dl>
              <div>
                <dt>Last mission</dt>
                <dd>{project.lastMissionId ?? "None yet"}</dd>
              </div>
              <div>
                <dt>Last receipt</dt>
                <dd>{project.lastReceiptId ?? "None yet"}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{project.updatedAt}</dd>
              </div>
            </dl>
          </article>
        </div>
      ) : null}

      {selectedShrine ? (
        <div className="shrine-modal" role="dialog" aria-modal="true" aria-label={`${selectedShrine.label} shrine`}>
          <button
            aria-label="Close shrine details"
            className="shrine-modal__scrim"
            onClick={() => setSelected(null)}
            type="button"
          />
          <article>
            <header>
              <span>{selectedShrine.deployState}</span>
              <button onClick={() => setSelected(null)} type="button">Close</button>
            </header>
            <h2>{selectedShrine.label}</h2>
            <p>{selectedShrine.subtitle}</p>
            <dl>
              <div>
                <dt>Last commit</dt>
                <dd>{selectedShrine.lastCommit}</dd>
              </div>
              <div>
                <dt>Open PRs</dt>
                <dd>{selectedShrine.openPRs}</dd>
              </div>
            </dl>
            <div>
              <button type="button">Open in GitHub</button>
              <button type="button">Open deployed site</button>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}

function shortId(value?: string) {
  if (!value) return undefined;
  return value.replace(/^(mission|receipt)-/, "").slice(-8);
}

"use client";

import { useState } from "react";
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
  shrines: Record<ShrineProject, ShrineState>;
};

export function ShrineBar({ shrines }: ShrineBarProps) {
  const [selected, setSelected] = useState<ShrineProject | null>(null);
  const selectedShrine = selected ? shrines[selected] : null;

  return (
    <section className="shrine-bar" aria-label="Project shrines">
      {(Object.keys(shrines) as ShrineProject[]).map((project) => {
        const shrine = shrines[project];
        return (
          <button
            data-state={shrine.deployState}
            key={project}
            onClick={() => setSelected(project)}
            type="button"
          >
            <span />
            <strong>{shrine.label}</strong>
            <em>{shrine.subtitle}</em>
            <small>{shrine.lastCommit} · {shrine.openPRs} PRs</small>
          </button>
        );
      })}

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

"use client";

import Link from "next/link";
import { ExternalLink, Moon } from "lucide-react";

type MoonPanelProps = {
  isComplete: boolean;
  isRunning: boolean;
  previewPath: string;
};

export function MoonPanel({
  isComplete,
  isRunning,
  previewPath
}: MoonPanelProps) {
  return (
    <aside className="moon-panel">
      <div className="moon-panel__orb" data-visible={isComplete}>
        <Moon className="h-10 w-10" />
      </div>
      <p className="moon-panel__eyebrow">Moonrise status</p>
      <h2>
        {isComplete
          ? "The moon rises."
          : isRunning
            ? "Judgment pending."
            : "Awaiting final judgment"}
      </h2>
      <p>
        {isComplete
          ? "The scroll passed through the dojo. The shipped page is ready."
          : "Meowts will approve the run only after plan, build, attack, review, and deploy complete."}
      </p>
      <Link
        aria-disabled={!isComplete}
        className={!isComplete ? "is-disabled" : undefined}
        href={previewPath}
        tabIndex={!isComplete ? -1 : undefined}
      >
        <ExternalLink className="h-4 w-4" />
        Open shipped page
      </Link>
    </aside>
  );
}

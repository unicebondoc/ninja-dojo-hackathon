"use client";

import { useEffect, useRef } from "react";
import type { AgentDefinition, AgentStatus } from "@/lib/agent-registry";

type ChatPaneProps = {
  agent: AgentDefinition | null;
  logs: string[];
  onClose: () => void;
  status: AgentStatus;
};

export function ChatPane({ agent, logs, onClose, status }: ChatPaneProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!agent) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;

      const panel = closeRef.current?.closest(".chat-pane");
      const focusables = panel?.querySelectorAll<HTMLElement>(
        "button, input, [href], textarea, select, [tabindex]:not([tabindex='-1'])"
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [agent, onClose]);

  return (
    <>
      <button
        aria-label="Close chat pane"
        className="chat-pane__scrim"
        data-open={Boolean(agent)}
        onClick={onClose}
        type="button"
      />
      <aside className="chat-pane" data-open={Boolean(agent)} aria-label="Agent chat pane">
        {agent ? (
          <>
            <header>
              <div>
                <span>{agent.name}</span>
                <h2>{agent.role}</h2>
              </div>
              <i data-status={status}>{status}</i>
              <button onClick={onClose} ref={closeRef} type="button">
                X
              </button>
            </header>
            <div className="chat-pane__logs">
              {(logs.length > 0 ? logs.slice(-50) : ["No logs yet. Waiting for local mock telemetry."]).map(
                (line, index) => (
                  <p key={`${line}-${index}`}>{line}</p>
                )
              )}
            </div>
            <footer>
              <input disabled placeholder="Mock chat only this PR" />
              <button disabled type="button">
                Send
              </button>
              <small>Real Butler connection coming in PR 4.</small>
            </footer>
          </>
        ) : null}
      </aside>
    </>
  );
}

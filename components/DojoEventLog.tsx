"use client";

import { motion } from "framer-motion";
import type { DojoDialogue } from "@/lib/types";

type DojoEventLogProps = {
  dialogue: DojoDialogue[];
};

export function DojoEventLog({ dialogue }: DojoEventLogProps) {
  const visibleDialogue = dialogue.slice(-8);

  return (
    <aside className="rpg-event-log">
      <div className="rpg-panel-title">
        <span>Dojo Comms</span>
        <i />
      </div>
      <div className="rpg-event-log__body">
        {visibleDialogue.length === 0 ? (
          <p className="rpg-event-log__empty">
            Drop the scroll. The ninjas will move when the run begins.
          </p>
        ) : (
          visibleDialogue.map((line) => (
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="rpg-event-log__item"
              initial={{ opacity: 0, x: 12 }}
              key={line.id}
              transition={{ duration: 0.2 }}
            >
              <strong>{line.speaker}</strong>
              <span>{line.message}</span>
            </motion.div>
          ))
        )}
      </div>
    </aside>
  );
}

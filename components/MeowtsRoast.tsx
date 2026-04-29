"use client";

import { Cat } from "lucide-react";
import { motion } from "framer-motion";

type MeowtsRoastProps = {
  roast: string;
  isVisible: boolean;
};

export function MeowtsRoast({ roast, isVisible }: MeowtsRoastProps) {
  if (!isVisible) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/45 p-5 text-zinc-500">
        Meowts is watching from the pagoda roof.
      </div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-moon/25 bg-gradient-to-br from-moon/12 via-black/70 to-blood/12 p-5 shadow-shoji"
      initial={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-md border border-moon/25 bg-moon/10 p-2 text-moon">
          <Cat className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">
            Meowts roast
          </p>
          <p className="mt-2 text-lg font-semibold leading-7 text-white">
            {roast}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

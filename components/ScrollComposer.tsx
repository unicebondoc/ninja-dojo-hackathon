"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { Send } from "lucide-react";

export type ScrollComposerHandle = {
  focus: () => void;
};

type ScrollComposerProps = {
  isComplete: boolean;
  isRunning: boolean;
  isSent: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  shouldPulse: boolean;
  value: string;
};

const examples = [
  {
    label: "Landing page",
    prompt:
      "Build me a landing page for a moonlit ramen shop with online booking, pricing, and testimonials."
  },
  {
    label: "Waitlist app",
    prompt:
      "Build me a waitlist app for a cozy AI journaling product with email capture and social proof."
  },
  {
    label: "Portfolio",
    prompt:
      "Build me a cinematic portfolio for a freelance product designer with case studies and a contact CTA."
  },
  {
    label: "Product page",
    prompt:
      "Build me a product page for a magical desk lamp with features, reviews, pricing, and checkout CTA."
  },
  {
    label: "Dashboard",
    prompt:
      "Build me a compact analytics dashboard for a solo founder tracking revenue, users, and launch tasks."
  }
];

export const ScrollComposer = forwardRef<ScrollComposerHandle, ScrollComposerProps>(
  function ScrollComposer(
    { isComplete, isRunning, isSent, onChange, onSubmit, shouldPulse, value },
    ref
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const compact = isSent || isRunning || isComplete;

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus()
    }));

    return (
      <section
        className="scroll-composer"
        data-compact={compact}
        data-pulse={shouldPulse}
        aria-label="Scroll composer"
      >
        <img
          alt=""
          aria-hidden="true"
          className="scroll-composer__seal"
          draggable={false}
          src="/scroll/wax-moon-seal.png"
        />
        <div className="scroll-composer__paper">
          {compact ? (
            <div className="scroll-composer__sent">
              <img
                alt=""
                aria-hidden="true"
                draggable={false}
                src="/scroll/scroll-sent-compact.png"
              />
              <div>
                <p>Scroll sent</p>
                <strong>{value.trim() || "The dojo is awaiting a scroll."}</strong>
              </div>
            </div>
          ) : (
            <>
              <div className="scroll-composer__header">
                <div>
                  <p>Scroll Composer</p>
                  <h2>What mission should the dojo track?</h2>
                </div>
                <span>Run manifest</span>
              </div>
              <textarea
                aria-label="Describe the shipping mission"
                ref={textareaRef}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Build me a landing page for a moonlit ramen shop with online booking, pricing, and testimonials..."
                rows={4}
              />
              <p className="scroll-composer__helper">
                Describe the intent, constraints, and desired handoff. The dojo
                turns it into a Run Manifest, stage trail, and Moonrise Receipt.
              </p>
              <div className="scroll-composer__examples" aria-label="Example scrolls">
                {examples.map((example) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => {
                      onChange(example.prompt);
                      textareaRef.current?.focus();
                    }}
                  >
                    {example.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <button
          className="scroll-composer__submit"
          disabled={isRunning}
          onClick={onSubmit}
          type="button"
        >
          <img alt="" aria-hidden="true" draggable={false} src="/scroll/scroll-send-icon.png" />
          <span>{isRunning ? "Sealing..." : isComplete ? "Send Again" : "Send Scroll"}</span>
          <Send className="h-4 w-4" />
        </button>
      </section>
    );
  }
);

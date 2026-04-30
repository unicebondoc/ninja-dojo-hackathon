import type { CSSProperties } from "react";
import { CastCard } from "@/components/CastCard";
import { LiveDojo } from "@/components/LiveDojo";
import { SectionIcon, type SectionIconVariant } from "@/components/SectionIcon";

const cast = [
  ["Moji", "Plan", "Maps the route before the scroll moves.", "gold"],
  ["Miji", "Build", "Turns the plan into the first working pass.", "red"],
  ["Maji", "Attack", "Stress-tests the weak spots.", "teal"],
  ["Meji", "Review", "Catches mistakes before they ship.", "cream"],
  ["Muji", "Deploy", "Opens the gate to production.", "ash"],
  ["Meowts", "Judge", "Judges the run under moonlight.", "pink"]
] as const;

const howItWorks = [
  [
    "scroll",
    "Drop the Scroll",
    "Send one request into the dojo. The run begins instantly."
  ],
  [
    "agents",
    "Ninjas Coordinate",
    "Each ninja owns a stage: plan, build, attack, review, deploy, and judge."
  ],
  [
    "moon",
    "Moonrise Ships",
    "When the moon rises, the dojo declares the run shipped."
  ]
] satisfies ReadonlyArray<readonly [SectionIconVariant, string, string]>;

const proofCards = [
  [
    "timeline",
    "What happened in the dojo?",
    "The scroll became a shipped page.",
    "The cached run moves from scroll intake through planning, building, adversarial attack, architecture review, deployment checks, and Meowts judgment before opening the oracle landing page."
  ],
  [
    "cast",
    "Codex-native proof",
    "Built around the way Codex actually works.",
    "Ninja Dojo keeps AGENTS.md, six Codex Skills, and cached /api/train output in the repo today, with room for future App Server and worktree streaming when the live orchestration layer is ready."
  ]
] satisfies ReadonlyArray<readonly [SectionIconVariant, string, string, string]>;

export default function Home() {
  return (
    <main className="rpg-page">
      <div className="rpg-atmosphere" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, index) => (
          <span key={index} style={{ "--particle-index": index } as CSSProperties} />
        ))}
      </div>
      <section className="rpg-page-shell">
        <LiveDojo />

        <section className="rpg-how-section" aria-labelledby="how-it-works">
          <div className="rpg-section-heading">
            <p>How it works</p>
            <h2 id="how-it-works">A product run you can watch.</h2>
          </div>
          <div className="rpg-how-grid">
            {howItWorks.map(([icon, title, line]) => (
              <article key={title}>
                <SectionIcon variant={icon} />
                <h3>{title}</h3>
                <p>{line}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rpg-info-grid">
          {proofCards.map(([icon, eyebrow, title, line]) => (
            <article key={eyebrow}>
              <SectionIcon variant={icon} />
              <p>{eyebrow}</p>
              <h2>{title}</h2>
              <span>{line}</span>
            </article>
          ))}
        </section>

        <section className="rpg-cast-section" aria-labelledby="meet-the-cast">
          <div className="rpg-section-heading">
            <p>Meet the cast</p>
            <h2 id="meet-the-cast">Six ninjas. One shipped run.</h2>
          </div>
          <div className="rpg-cast-grid">
            {cast.map(([name, role, line, accent]) => (
              <CastCard
                accent={accent}
                key={name}
                line={line}
                name={name}
                role={role}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

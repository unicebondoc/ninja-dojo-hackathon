import type { CSSProperties } from "react";
import { CastCard } from "@/components/CastCard";
import { LiveDojo } from "@/components/LiveDojo";
import { SectionIcon, type SectionIconVariant } from "@/components/SectionIcon";

const method = [
  ["01", "Scroll", "Capture intent", "The original request becomes mission state instead of a disappearing chat prompt."],
  ["02", "Plan", "Moji writes the manifest", "Scope, constraints, requirements, and acceptance signals are made explicit."],
  ["03", "Build", "Miji prepares the handoff", "The builder plugin gets a focused prompt and expected artifact shape."],
  ["04", "Attack", "Maji checks weak spots", "Risks, missing proof, vague claims, and likely breakpoints are surfaced early."],
  ["05", "Review", "Meji reviews quality", "Architecture, copy, UX, and project constraints get checked before receipt."],
  ["06", "Deploy", "Muji checks readiness", "Launch path, test posture, and preview expectations are recorded."],
  ["07", "Judge", "Meowts gives the verdict", "The run receives a score, pass/fail notes, and next fix prompt."],
  ["08", "Moonrise", "Receipt produced", "The final artifact is a shareable receipt with the mission trail attached."]
] as const;

const plugins = [
  ["Codex", "Build handoff prompts now, real execution later."],
  ["Claude", "Review prompts now, deeper critique later."],
  ["OpenClaw", "Local action prompts now, gateway actions later."],
  ["GPT Image 2", "Asset prompts now, generation integration later."],
  ["Telegram", "Scroll capture and mission updates."],
  ["Manual", "Paste results from any tool and save them to mission state."]
] as const;

const receiptItems = [
  "Original scroll",
  "Inferred requirements",
  "Stage summaries",
  "Plugin handoffs",
  "Pasted or plugin results",
  "Judge score",
  "Pass/fail notes",
  "Next fix prompt",
  "Client/project summary"
] as const;

const brainItems = [
  ["Repo rules", "What the project allows, forbids, and expects."],
  ["Product constraints", "Positioning, audience, offer, and launch boundaries."],
  ["Decisions", "Why the run moved the way it did."],
  ["Active plugins", "Which worker or tool owns the next handoff."],
  ["Memory summary", "What changed since the last scroll."],
  ["Next action", "The single best follow-up after Meowts judges."]
] as const;

const cast = [
  ["Moji", "Plan", "Turns intent into a Run Manifest.", "gold"],
  ["Miji", "Build", "Prepares the build handoff.", "red"],
  ["Maji", "Attack", "Finds weak spots before they ship.", "teal"],
  ["Meji", "Review", "Checks quality and architecture.", "cream"],
  ["Muji", "Deploy", "Tracks launch readiness.", "ash"],
  ["Meowts", "Judge", "Scores the receipt under moonlight.", "pink"]
] as const;

const receiptIconMap: SectionIconVariant[] = ["scroll", "timeline", "moon"];

export default function Home() {
  return (
    <main className="rpg-page">
      <div className="rpg-atmosphere" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, index) => (
          <span key={index} style={{ "--particle-index": index } as CSSProperties} />
        ))}
      </div>
      <section className="rpg-page-shell">
        <nav className="rpg-topnav" aria-label="Ninja Dojo sections">
          <a href="#dojo">Console</a>
          <a href="#method">Method</a>
          <a href="#plugins">Plugins</a>
          <a href="#receipt">Receipt</a>
          <a href="#brain">Project Brain</a>
          <a href="#cast">Cast</a>
        </nav>

        <div id="dojo">
          <LiveDojo />
        </div>

        <section className="rpg-method-section" id="method" aria-labelledby="method-title">
          <div className="rpg-section-heading">
            <p>The Dojo Method</p>
            <h2 id="method-title">Eight stages from intent to receipt.</h2>
          </div>
          <div className="rpg-method-grid">
            {method.map(([number, stage, title, line]) => (
              <article key={stage}>
                <i>{number}</i>
                <strong>{stage}</strong>
                <h3>{title}</h3>
                <p>{line}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rpg-plugin-section" id="plugins" aria-labelledby="plugins-title">
          <div className="rpg-section-heading">
            <p>Plugins Do the Work</p>
            <h2 id="plugins-title">Dojo tracks the mission. Plugins execute the handoff.</h2>
          </div>
          <div className="rpg-plugin-grid">
            {plugins.map(([name, line]) => (
              <article key={name}>
                <span>{name.slice(0, 2)}</span>
                <h3>{name} plugin</h3>
                <p>{line}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rpg-receipt-section" id="receipt" aria-labelledby="receipt-title">
          <div className="rpg-section-heading">
            <p>Moonrise Receipt</p>
            <h2 id="receipt-title">The artifact is the audit trail.</h2>
          </div>
          <div className="rpg-receipt-layout">
            <article className="rpg-receipt-card">
              <div>
                <span>Moonrise Receipt</span>
                <strong>meowts-verdict.shipped</strong>
              </div>
              <ul>
                {receiptItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <div className="rpg-receipt-notes">
              {receiptIconMap.map((icon, index) => (
                <article key={icon}>
                  <SectionIcon variant={icon} />
                  <h3>{["Mission memory", "Judge evidence", "Next fix prompt"][index]}</h3>
                  <p>
                    {[
                      "Every scroll keeps its intent, requirements, and stage summaries.",
                      "Meowts records what passed, what failed, and why the score landed.",
                      "The receipt ends with a concrete next prompt for the next plugin or human."
                    ][index]}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rpg-brain-section" id="brain" aria-labelledby="brain-title">
          <div className="rpg-section-heading">
            <p>Project Brain</p>
            <h2 id="brain-title">Project memory without a giant database UI.</h2>
          </div>
          <div className="rpg-brain-grid">
            {brainItems.map(([title, line]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{line}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rpg-cast-section" id="cast" aria-labelledby="cast-title">
          <div className="rpg-section-heading">
            <p>Meet the cast</p>
            <h2 id="cast-title">Six ninjas keep the receipt honest.</h2>
          </div>
          <div className="rpg-cast-grid rpg-cast-grid--compact">
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

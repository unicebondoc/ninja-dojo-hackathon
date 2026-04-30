import type { CSSProperties } from "react";
import { LiveDojo } from "@/components/LiveDojo";

const method = [
  ["01", "Scroll", "Dojo", "Capture intent"],
  ["02", "Plan", "Moji", "Write manifest"],
  ["03", "Build", "Miji", "Prepare handoff"],
  ["04", "Attack", "Maji", "Check weak spots"],
  ["05", "Review", "Meji", "Review quality"],
  ["06", "Deploy", "Muji", "Check readiness"],
  ["07", "Judge", "Meowts", "Score evidence"],
  ["08", "Moonrise", "Dojo", "Produce receipt"]
] as const;

const plugins = [
  ["Codex", "Handoff-only", "Build prompts now; execution later."],
  ["Claude", "Handoff-only", "Review prompts now; deep review later."],
  ["OpenClaw", "Planned", "Local action prompts now."],
  ["GPT Image 2", "Planned", "Asset prompts now."],
  ["Telegram", "Planned", "Scroll capture and updates."],
  ["Manual", "Connected", "Paste results into mission state."]
] as const;

const receiptRows = [
  ["Scroll", "Original intent"],
  ["Requirements", "Inferred asks"],
  ["Stages", "Plan to judge trail"],
  ["Handoffs", "Plugin prompts/results"],
  ["Meowts", "Score + pass/fail notes"],
  ["Next", "Fix prompt"]
] as const;

const brainRows = [
  ["Rules", "Repo and product constraints"],
  ["Decisions", "What changed and why"],
  ["Plugins", "Active handoffs"],
  ["Latest", "Current run state"],
  ["Memory", "Useful context"],
  ["Next", "Best follow-up"]
] as const;

const cast = [
  ["Moji", "Plan"],
  ["Miji", "Build"],
  ["Maji", "Attack"],
  ["Meji", "Review"],
  ["Muji", "Deploy"],
  ["Meowts", "Judge"]
] as const;

export default function Home() {
  return (
    <main className="rpg-page">
      <div className="rpg-atmosphere" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, index) => (
          <span key={index} style={{ "--particle-index": index } as CSSProperties} />
        ))}
      </div>
      <section className="rpg-page-shell">
        <nav className="rpg-topnav ops-topnav" aria-label="Ninja Dojo sections">
          <a href="#dojo">Console</a>
          <a href="#method">Method</a>
          <a href="#plugins">Plugins</a>
          <a href="#receipt">Receipt</a>
          <a href="#brain">Brain</a>
        </nav>

        <div id="dojo">
          <LiveDojo />
        </div>

        <section className="ops-section ops-method" id="method" aria-labelledby="method-title">
          <div className="ops-section__head">
            <p>The Dojo Method</p>
            <h2 id="method-title">Stage trail.</h2>
          </div>
          <ol className="ops-timeline">
            {method.map(([number, stage, owner, line]) => (
              <li key={stage}>
                <i>{number}</i>
                <strong>{stage}</strong>
                <span>{owner}</span>
                <p>{line}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="ops-section" id="plugins" aria-labelledby="plugins-title">
          <div className="ops-section__head">
            <p>Plugin Registry</p>
            <h2 id="plugins-title">Handoffs, not hype.</h2>
          </div>
          <div className="ops-plugin-grid">
            {plugins.map(([name, status, line]) => (
              <article key={name}>
                <div>
                  <strong>{name}</strong>
                  <span>{status}</span>
                </div>
                <p>{line}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ops-section ops-split" id="receipt" aria-labelledby="receipt-title">
          <div className="ops-section__head">
            <p>Moonrise Receipt</p>
            <h2 id="receipt-title">Evidence after every run.</h2>
          </div>
          <article className="ops-receipt">
            <header>
              <span>moonrise.receipt</span>
              <strong>meowts-verdict.shipped</strong>
            </header>
            <dl>
              {receiptRows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </section>

        <section className="ops-section ops-split" id="brain" aria-labelledby="brain-title">
          <div className="ops-section__head">
            <p>Project Brain</p>
            <h2 id="brain-title">Memory for the next mission.</h2>
          </div>
          <div className="ops-brain-list">
            {brainRows.map(([label, value]) => (
              <div key={label}>
                <strong>{label}</strong>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="ops-cast" aria-label="Ninja cast">
          {cast.map(([name, role]) => (
            <span key={name}>
              <strong>{name}</strong>
              {role}
            </span>
          ))}
        </section>
      </section>
    </main>
  );
}

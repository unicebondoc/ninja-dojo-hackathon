import { LiveDojo } from "@/components/LiveDojo";

export default function Home() {
  return (
    <main className="rpg-page">
      <section className="rpg-page-shell">
        <LiveDojo />

        <section className="rpg-info-grid">
          <article>
            <p>What happened in the dojo?</p>
            <h2>The scroll became a shipped page.</h2>
            <span>
              The cached run moves from scroll intake through planning,
              building, adversarial attack, architecture review, deployment
              checks, and Meowts judgment before opening the oracle landing
              page.
            </span>
          </article>
          <article>
            <p>Codex-native proof</p>
            <h2>Built around the way Codex actually works.</h2>
            <span>
              Ninja Dojo keeps AGENTS.md, six Codex Skills, and cached
              /api/train output in the repo today, with room for future App
              Server and worktree streaming when the live orchestration layer is
              ready.
            </span>
          </article>
        </section>
      </section>
    </main>
  );
}

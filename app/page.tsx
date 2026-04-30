import { LiveDojo } from "@/components/LiveDojo";

const cast = [
  ["Moji", "Plan", "Maps the route before the scroll moves."],
  ["Miji", "Build", "Turns the plan into the first working pass."],
  ["Maji", "Attack", "Stress-tests the weak spots."],
  ["Meji", "Review", "Catches mistakes before they ship."],
  ["Muji", "Deploy", "Opens the gate to production."],
  ["Meowts", "Judge", "Judges the run under moonlight."]
];

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

        <section className="rpg-cast-section" aria-labelledby="meet-the-cast">
          <div>
            <p>Meet the cast</p>
            <h2 id="meet-the-cast">Six ninjas. One shipped run.</h2>
          </div>
          <div className="rpg-cast-grid">
            {cast.map(([name, role, line]) => (
              <article key={name}>
                <strong>{name}</strong>
                <span>{role}</span>
                <p>{line}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

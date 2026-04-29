import { DojoDashboard } from "@/components/DojoDashboard";

const sequence = [
  "Scroll",
  "Panels",
  "Moji",
  "Miji",
  "Attack",
  "Review",
  "Deploy",
  "Moon"
];

export default function Home() {
  return (
    <main className="ink-wash min-h-screen bg-ink text-white">
      <div className="dojo-grid absolute inset-0 z-0" />
      <div className="falling-petals" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            className="petal"
            key={index}
            style={{
              left: `${(index * 17) % 101}%`,
              "--fall-duration": `${12 + (index % 7)}s`,
              "--fall-delay": `${-(index * 1.7)}s`
            } as React.CSSProperties}
          />
        ))}
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-8 pt-8 lg:pt-14">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="text-sm font-semibold uppercase tracking-[0.32em] text-gold">
              Codex workflow simulation
            </div>
            <div className="rounded-full border border-blood/50 bg-blood/10 px-4 py-2 text-sm text-red-100 shadow-blood">
              Cached-first live demo
            </div>
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-[0.78fr_1fr]">
            <div className="max-w-4xl">
              <h1 className="max-w-4xl text-6xl font-black leading-none text-white sm:text-7xl lg:text-8xl">
                Ninja Dojo
              </h1>
              <p className="mt-5 max-w-3xl text-3xl font-semibold text-moon sm:text-4xl">
                One scroll in. Five Codex worktrees out.
              </p>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
                A visual command center for solo builders coordinating
                Codex-style agent workflows.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-300">
                {["Moji plans", "Miji builds", "Meowts judges"].map((item) => (
                  <span
                    className="rounded-full border border-moon/20 bg-white/[0.04] px-3 py-2"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="hero-preview-card">
              <div className="hero-preview-card__chrome">
                <span />
                <span />
                <span />
                <strong>Scroll → Panels → Moon</strong>
              </div>
              <div className="hero-preview-card__stage">
                <div className="hero-preview-card__moon" />
                <div className="hero-preview-card__scroll">
                  <span>Build a magical oracle deck landing page.</span>
                </div>
                <div className="hero-preview-card__panels">
                  {[0, 1, 2, 3].map((panel) => (
                    <i key={panel} />
                  ))}
                </div>
                <div className="hero-preview-card__agents">
                  {["Moji", "Miji", "Renegade", "Sensei", "Tester", "Meowts"].map(
                    (agent, index) => (
                      <div
                        className="hero-preview-card__agent"
                        data-active={index < 4}
                        key={agent}
                        style={{ "--agent-index": index } as React.CSSProperties}
                      >
                        <span />
                        <strong>{agent}</strong>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="hero-preview-card__timeline">
                {sequence.map((item, index) => (
                  <span data-active={index < 6} key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>

        <DojoDashboard />
      </section>
    </main>
  );
}

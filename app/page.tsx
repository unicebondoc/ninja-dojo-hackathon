import { DojoDashboard } from "@/components/DojoDashboard";

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
              Codex Hackathon MVP
            </div>
            <div className="rounded-full border border-blood/50 bg-blood/10 px-4 py-2 text-sm text-red-100 shadow-blood">
              Cached-first demo
            </div>
          </div>

          <div className="grid items-end gap-7 lg:grid-cols-[0.78fr_1fr]">
            <div>
              <h1 className="max-w-4xl text-6xl font-black leading-none text-white sm:text-7xl lg:text-8xl">
                Ninja Dojo
              </h1>
              <p className="mt-5 max-w-3xl text-3xl font-semibold text-moon sm:text-4xl">
                One scroll in. Five Codex worktrees out.
              </p>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
              Where solo builders coordinate AI ninjas to plan, build, attack,
              review, deploy, and judge.
            </p>
          </div>
        </header>

        <DojoDashboard />
      </section>
    </main>
  );
}

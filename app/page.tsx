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

      <section className="relative z-10 mx-auto min-h-screen w-full max-w-[1680px] px-4 py-4 sm:px-6 lg:px-8">
        <DojoDashboard />
      </section>
    </main>
  );
}

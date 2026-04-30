import Link from "next/link";
import type { CSSProperties } from "react";
import { createRunManifest } from "@/lib/runs/createRunManifest";
import { sanitizePrompt } from "@/lib/runs/generatePreview";

type MoonrisePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MoonrisePage({ searchParams }: MoonrisePageProps) {
  const params = await searchParams;
  const rawScroll = params.scroll ?? params.prompt;
  const rawRunId = params.run;
  const prompt = sanitizePrompt(Array.isArray(rawScroll) ? rawScroll[0] ?? "" : rawScroll ?? "");
  const runId = Array.isArray(rawRunId) ? rawRunId[0] : rawRunId;

  if (!prompt) {
    return <EmptyMoonrise />;
  }

  const manifest = createRunManifest(prompt, {
    runId: runId || undefined,
    status: "shipped"
  });
  const preview = manifest.generatedPreview;
  const pageStyle = {
    "--moonrise-accent": preview.palette.accent,
    "--moonrise-glow": preview.palette.glow,
    "--moonrise-surface": preview.palette.surface
  } as CSSProperties;

  return (
    <main
      className="min-h-screen bg-[#050505] px-5 py-6 text-white sm:px-8 lg:px-12"
      style={pageStyle}
    >
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-[color:var(--moonrise-accent)]/30 bg-[color:var(--moonrise-surface)] shadow-[0_30px_120px_rgba(0,0,0,0.66)]">
        <section className="relative isolate grid min-h-[76vh] gap-8 overflow-hidden px-6 py-8 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-12">
          <div
            className="absolute inset-0 -z-10 opacity-80"
            style={{
              background:
                "radial-gradient(circle at 78% 18%, color-mix(in srgb, var(--moonrise-glow), transparent 58%), transparent 30%), radial-gradient(circle at 18% 78%, color-mix(in srgb, var(--moonrise-accent), transparent 62%), transparent 34%), linear-gradient(135deg, rgba(5,5,5,.18), rgba(0,0,0,.72))"
            }}
          />
          <div className="absolute right-[-8rem] top-[-8rem] -z-10 h-80 w-80 rounded-full border border-white/15 bg-[color:var(--moonrise-glow)]/25 blur-2xl" />
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[color:var(--moonrise-glow)]">
              Moonrise Preview
            </div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-white/55">
              {preview.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {preview.brandName}
            </h1>
            <h2 className="mt-6 max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl">
              {preview.headline}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              {preview.subheadline}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[color:var(--moonrise-accent)] px-6 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_44px_color-mix(in_srgb,var(--moonrise-accent),transparent_65%)] transition hover:-translate-y-0.5"
                href="#moonrise-action"
              >
                {preview.primaryCta}
              </a>
              <a
                className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/15 bg-black/35 px-6 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 hover:border-[color:var(--moonrise-glow)]/50"
                href="#moonrise-details"
              >
                {preview.secondaryCta}
              </a>
            </div>
          </div>

          <aside className="grid content-center gap-4" id="moonrise-details">
            <div className="rounded-3xl border border-white/12 bg-black/38 p-5 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--moonrise-glow)]">
                Built from your scroll
              </p>
              <p className="mt-3 text-xl font-bold leading-snug text-white">
                “{prompt}”
              </p>
            </div>
            {preview.metrics ? (
              <div className="grid grid-cols-2 gap-3">
                {preview.metrics.map((metric) => (
                  <div
                    className="rounded-2xl border border-white/10 bg-black/42 p-4"
                    key={metric.label}
                  >
                    <strong className="block text-2xl font-black text-white">
                      {metric.value}
                    </strong>
                    <span className="mt-2 block text-xs font-black uppercase tracking-[0.16em] text-white/56">
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="rounded-3xl border border-[color:var(--moonrise-glow)]/25 bg-black/30 p-5">
              <p className="text-sm leading-7 text-white/72">
                This preview is generated locally and deterministically by Ninja Dojo, so the Moonrise loop stays instant and reliable.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/32 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--moonrise-glow)]">
                Meowts verdict
              </p>
              <strong className="mt-3 block text-3xl font-black capitalize text-white">
                {manifest.judgeResult.verdict}
              </strong>
              <p className="mt-2 text-sm text-white/68">
                Score: {manifest.judgeResult.score}/100
              </p>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 border-t border-white/10 px-6 py-8 sm:px-10 lg:grid-cols-3 lg:px-14">
          {preview.features.map((feature) => (
            <article
              className="rounded-2xl border border-[color:var(--moonrise-accent)]/22 bg-black/34 p-5"
              key={feature.title}
            >
              <h3 className="text-xl font-black text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/68">{feature.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 border-t border-white/10 px-6 py-8 sm:px-10 lg:grid-cols-3 lg:px-14">
          {preview.sections.map((section) => (
            <article
              className="rounded-2xl border border-white/10 bg-black/34 p-5"
              key={section.title}
            >
              <h3 className="text-xl font-black text-white">{section.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/68">{section.body}</p>
              <ul className="mt-5 grid gap-2">
                {section.items.map((item) => (
                  <li className="flex items-start gap-2 text-sm text-white/76" key={item}>
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[color:var(--moonrise-accent)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        {preview.pricing ? (
          <section className="border-t border-white/10 px-6 py-8 sm:px-10 lg:px-14">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--moonrise-glow)]">
                  Pricing and offers
                </p>
                <h2 className="mt-2 text-3xl font-black text-white">
                  Clear choices, ready to ship.
                </h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {preview.pricing.map((item) => (
                <article
                  className="rounded-2xl border border-white/10 bg-black/38 p-5"
                  key={item.name}
                >
                  <h3 className="text-xl font-black text-white">{item.name}</h3>
                  <strong className="mt-4 block text-4xl font-black text-[color:var(--moonrise-glow)]">
                    {item.price}
                  </strong>
                  <p className="mt-3 text-sm leading-7 text-white/68">{item.detail}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {preview.testimonials ? (
          <section className="border-t border-white/10 px-6 py-8 sm:px-10 lg:px-14">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--moonrise-glow)]">
              Proof
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {preview.testimonials.map((testimonial) => (
                <blockquote
                  className="rounded-2xl border border-white/10 bg-black/34 p-5"
                  key={testimonial.name}
                >
                  <p className="text-lg font-bold leading-8 text-white">“{testimonial.quote}”</p>
                  <cite className="mt-5 block text-sm not-italic text-white/58">
                    {testimonial.name}
                  </cite>
                </blockquote>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-t border-white/10 px-6 py-8 sm:px-10 lg:px-14">
          <div className="grid gap-5 rounded-3xl border border-[color:var(--moonrise-glow)]/20 bg-black/34 p-6 lg:grid-cols-[0.7fr_1fr_1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--moonrise-glow)]">
                Judge result
              </p>
              <h2 className="mt-3 text-4xl font-black capitalize text-white">
                {manifest.judgeResult.verdict}
              </h2>
              <p className="mt-3 text-lg font-bold text-white/72">
                {manifest.judgeResult.score}/100
              </p>
            </div>
            <div>
              <h3 className="font-black text-white">Matched the scroll</h3>
              <ul className="mt-4 grid gap-2">
                {manifest.judgeResult.matched.map((item) => (
                  <li className="text-sm leading-6 text-white/72" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-black text-white">Next polish pass</h3>
              <ul className="mt-4 grid gap-2">
                {manifest.judgeResult.improvements.map((item) => (
                  <li className="text-sm leading-6 text-white/72" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-3">
              <h3 className="font-black text-white">Requested item checks</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {manifest.judgeResult.requestedItems
                  .filter((item) => item.requested)
                  .map((item) => (
                    <span
                      className="rounded-full border border-white/12 bg-black/42 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/72"
                      key={item.label}
                    >
                      {item.label}: {item.included ? "included" : "missing"}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className="border-t border-white/10 px-6 py-8 sm:px-10 lg:px-14"
          id="moonrise-action"
        >
          <div className="rounded-3xl border border-[color:var(--moonrise-accent)]/35 bg-black/42 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[color:var(--moonrise-glow)]">
              Next step
            </p>
            <h2 className="mt-3 text-3xl font-black text-white">
              {preview.primaryCta} for {preview.brandName}.
            </h2>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                aria-label="Email or contact"
                className="min-h-14 flex-1 rounded-xl border border-white/12 bg-black/48 px-4 text-white outline-none ring-[color:var(--moonrise-glow)]/0 transition placeholder:text-white/36 focus:border-[color:var(--moonrise-glow)]/60 focus:ring-4"
                placeholder="you@example.com"
                readOnly
              />
              <button className="min-h-14 rounded-xl bg-[color:var(--moonrise-accent)] px-6 text-sm font-black uppercase tracking-[0.16em] text-white">
                {preview.primaryCta}
              </button>
            </div>
          </div>
          <div className="mt-6 flex justify-between gap-4 text-sm">
            <Link className="font-bold text-white/70 hover:text-white" href="/">
              Back to Ninja Dojo
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function EmptyMoonrise() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#050505] px-5 text-white">
      <section className="max-w-xl rounded-3xl border border-[#e8c66a]/22 bg-black/58 p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#78f0d4]">
          Moonrise is waiting
        </p>
        <h1 className="mt-4 text-4xl font-black">Send a scroll first.</h1>
        <p className="mt-4 text-white/68">
          Ninja Dojo opens a shipped preview after a run completes. Return to the dojo, describe what you want built, and send the scroll.
        </p>
        <Link
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#ef3434] px-6 text-sm font-black uppercase tracking-[0.16em] text-white"
          href="/"
        >
          Return to Dojo
        </Link>
      </section>
    </main>
  );
}

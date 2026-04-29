import Link from "next/link";
import { ArrowLeft, Mail, Moon, Sparkles, Stars } from "lucide-react";

const steps = [
  "Draw one illustrated card when the day gets noisy.",
  "Read a quiet prompt written for reflection, not prediction.",
  "Leave with one grounded action for the next hour."
];

const receives = [
  "78 reflective oracle cards with moonlit animal archetypes.",
  "Daily one-card rituals for founders, artists, and seekers.",
  "A printable launch spread for hard decisions and fresh starts."
];

export default function OracleDemoPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#060509] text-white">
      <section className="oracle-stars relative min-h-screen px-5 py-6 sm:px-8 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(246,231,177,0.18),transparent_22rem),radial-gradient(circle_at_18%_72%,rgba(220,38,38,0.16),transparent_24rem),linear-gradient(to_bottom,rgba(6,5,9,0.24),#060509_86%)]" />
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
          <nav className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-white"
              href="/"
            >
              <ArrowLeft className="h-4 w-4" />
              Ninja Dojo
            </Link>
            <div className="rounded-full border border-moon/20 bg-moon/10 px-4 py-2 text-sm text-moon">
              Shipped preview
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.92fr_0.78fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C9A84E]/30 bg-[#C9A84E]/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#F6E7B1]">
                <Moon className="h-4 w-4" />
                Quiet Whiskers Oracle
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-tight text-white sm:text-7xl">
                Draw a card. Hear what the quiet knows.
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-8 text-zinc-300">
                A reflective oracle deck for daily guidance, soft courage, and
                the rare kind of intuition that still works at midnight.
              </p>

              <div className="mt-8 flex max-w-xl flex-col gap-3 rounded-lg border border-white/10 bg-black/55 p-3 shadow-shoji sm:flex-row">
                <label className="relative flex-1">
                  <span className="sr-only">Email address</span>
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    className="h-12 w-full rounded-md border border-white/10 bg-zinc-950/80 pl-11 pr-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#DC2626]"
                    placeholder="you@moonmail.com"
                    type="email"
                  />
                </label>
                <button className="h-12 rounded-md bg-[#DC2626] px-6 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-blood transition hover:bg-red-500">
                  Join the waitlist
                </button>
              </div>
            </div>

            <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
              <div className="absolute inset-6 rounded-[2rem] border border-[#F6E7B1]/25 bg-gradient-to-b from-[#F6E7B1]/18 via-black to-[#DC2626]/18 shadow-[0_0_90px_rgba(246,231,177,0.16)]" />
              <div className="absolute inset-0 rotate-[-5deg] rounded-[2rem] border border-white/10 bg-zinc-950 p-5 shadow-shoji" />
              <div className="absolute inset-0 rotate-[4deg] rounded-[2rem] border border-[#F6E7B1]/25 bg-gradient-to-br from-zinc-950 via-[#161015] to-black p-7 shadow-shoji">
                <div className="flex h-full flex-col items-center justify-between rounded-[1.4rem] border border-[#F6E7B1]/20 bg-black/35 p-8 text-center">
                  <Stars className="h-9 w-9 text-[#F6E7B1]" />
                  <div>
                    <div className="mx-auto mb-7 h-32 w-32 rounded-full bg-[#F6E7B1] shadow-[0_0_70px_rgba(246,231,177,0.65)]" />
                    <p className="text-sm uppercase tracking-[0.32em] text-[#C9A84E]">
                      Card XVII
                    </p>
                    <h2 className="mt-3 text-4xl font-black text-white">
                      The Listener
                    </h2>
                  </div>
                  <p className="text-sm leading-6 text-zinc-300">
                    Ask once. Sit still. The useful answer usually arrives
                    without applause.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
          <InfoBlock
            icon={<Sparkles className="h-5 w-5" />}
            items={steps}
            title="How it works"
          />
          <InfoBlock
            icon={<Stars className="h-5 w-5" />}
            items={receives}
            title="What you receive"
          />
          <div className="rounded-lg border border-[#F6E7B1]/18 bg-[#F6E7B1]/8 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#C9A84E]">
              Made for
            </p>
            <h2 className="mt-4 text-3xl font-black text-white">
              Late-night founders, artists, and seekers
            </h2>
            <p className="mt-4 leading-7 text-zinc-300">
              For people who need a ritual that slows the mind without asking
              them to become someone else.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoBlock({
  icon,
  items,
  title
}: {
  icon: React.ReactNode;
  items: string[];
  title: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-950/75 p-6 shadow-shoji">
      <div className="mb-4 flex items-center gap-3 text-[#F6E7B1]">
        {icon}
        <h2 className="text-2xl font-black text-white">{title}</h2>
      </div>
      <ul className="space-y-4 text-zinc-300">
        {items.map((item) => (
          <li className="flex gap-3 leading-7" key={item}>
            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

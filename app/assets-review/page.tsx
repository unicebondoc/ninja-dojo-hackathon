import { existsSync, statSync } from "node:fs";
import path from "node:path";
import Image from "next/image";

export const dynamic = "force-dynamic";

const assetNames = [
  "dojo-background.png",
  "moji.png",
  "miji.png",
  "renegade.png",
  "sensei.png",
  "tester.png",
  "meowts.png",
  "scroll.png",
  "moon.png",
  "slash.png",
  "petal.png",
  "moji-walk.png",
  "miji-walk.png",
  "renegade-walk.png",
  "sensei-walk.png",
  "tester-walk.png",
  "meowts-walk.png"
];

const assetDir = path.join(process.cwd(), "public", "assets", "dojo");

function assetPath(filename: string) {
  return `/assets/dojo/${filename}`;
}

function rawAssetPath(filename: string) {
  return `/assets/dojo/raw/${filename}`;
}

function getAsset(filename: string) {
  const filePath = path.join(assetDir, filename);
  const rawPath = path.join(assetDir, "raw", filename);
  const exists = existsSync(filePath);
  const rawExists = existsSync(rawPath);

  return {
    exists,
    filename,
    rawExists,
    rawSize: rawExists ? statSync(rawPath).size : 0,
    size: exists ? statSync(filePath).size : 0
  };
}

function formatBytes(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

export default function AssetsReviewPage() {
  const assets = assetNames.map(getAsset);
  const background = assets.find(
    (asset) => asset.filename === "dojo-background.png"
  );

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#F6E7B1]">
            Ninja Dojo
          </p>
          <h1 className="mt-2 text-4xl font-black">Asset Review</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Visual QA for generated files in <code>public/assets/dojo</code>.
            Cleaned sprites and item assets appear on light and dark
            checkerboards; raw chroma-key outputs are linked when present.
          </p>
        </header>

        <section className="mb-10 rounded-lg border border-white/10 bg-black/35 p-4">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F6E7B1]">
                Environment
              </p>
              <h2 className="mt-1 text-2xl font-black">
                dojo-background.png
              </h2>
            </div>
            <span className="text-sm text-zinc-500">
              {background?.exists ? formatBytes(background.size) : "missing"}
            </span>
          </div>
          {background?.exists ? (
            <div className="relative aspect-video overflow-hidden rounded-md border border-white/10 bg-zinc-900">
              <Image
                alt="dojo-background.png"
                className="object-cover"
                fill
                priority
                src={assetPath("dojo-background.png")}
              />
            </div>
          ) : (
            <MissingCard filename="dojo-background.png" />
          )}
        </section>

        <section>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#F6E7B1]">
            Sprites, items, and VFX
          </p>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {assets
              .filter((asset) => asset.filename !== "dojo-background.png")
              .map((asset) =>
                asset.exists ? (
                  <AssetCard asset={asset} key={asset.filename} />
                ) : (
                  <MissingCard filename={asset.filename} key={asset.filename} />
                )
              )}
          </div>
        </section>
      </div>
    </main>
  );
}

function AssetCard({ asset }: { asset: ReturnType<typeof getAsset> }) {
  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-black/35">
      <div className="grid grid-cols-2">
        <PreviewPane filename={asset.filename} tone="light" />
        <PreviewPane filename={asset.filename} tone="dark" />
      </div>
      <footer className="border-t border-white/10 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-sm text-zinc-200">{asset.filename}</p>
          <span className="text-xs text-zinc-500">{formatBytes(asset.size)}</span>
        </div>
        {asset.rawExists ? (
          <a
            className="mt-2 inline-block text-xs font-bold uppercase tracking-[0.18em] text-[#F6E7B1] hover:text-white"
            href={rawAssetPath(asset.filename)}
          >
            Raw chroma file ({formatBytes(asset.rawSize)})
          </a>
        ) : null}
      </footer>
    </article>
  );
}

function PreviewPane({
  filename,
  tone
}: {
  filename: string;
  tone: "light" | "dark";
}) {
  return (
    <div
      className={[
        "relative grid aspect-square place-items-center overflow-hidden border-b border-white/10",
        tone === "dark" ? "asset-checker-dark" : "asset-checker-light"
      ].join(" ")}
    >
      <Image
        alt={filename}
        className="object-contain p-6"
        fill
        src={assetPath(filename)}
      />
    </div>
  );
}

function MissingCard({ filename }: { filename: string }) {
  return (
    <article className="grid min-h-52 place-items-center rounded-lg border border-dashed border-red-500/40 bg-red-950/20 p-5 text-center">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">
          Missing
        </p>
        <p className="mt-2 font-mono text-sm text-red-100">{filename}</p>
      </div>
    </article>
  );
}

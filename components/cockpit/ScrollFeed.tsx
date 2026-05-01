"use client";

type ScrollFeedItem = {
  id: string;
  preview: string;
  source: "butler-checkin" | "job-match" | "diary";
  ts: number;
};

type ScrollFeedProps = {
  items: ScrollFeedItem[];
};

export function ScrollFeed({ items }: ScrollFeedProps) {
  return (
    <aside className="scroll-feed" aria-label="Scroll feed">
      <header>
        <span>Scroll Feed</span>
        <strong>{items.length}</strong>
      </header>
      <div className="scroll-feed__list">
        {items.length === 0 ? (
          <article className="scroll-feed__empty">
            <span>standby</span>
            <p>Mock scrolls will appear here as local telemetry cycles.</p>
          </article>
        ) : (
          items.map((item) => (
            <article className="scroll-feed__card" key={item.id}>
              <span>{item.source}</span>
              <p>{item.preview}</p>
              <time>{formatAge(item.ts)}</time>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}

function formatAge(ts: number) {
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

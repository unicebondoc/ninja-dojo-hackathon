type CastCardProps = {
  accent: "gold" | "red" | "teal" | "cream" | "ash" | "pink";
  line: string;
  name: string;
  role: string;
};

export function CastCard({ accent, line, name, role }: CastCardProps) {
  const spritePath = `/assets/dojo/${name.toLowerCase()}.png`;

  return (
    <article className="cast-card" data-accent={accent}>
      <div className="cast-card__top">
        <span className="cast-card__crest">
          <img alt="" aria-hidden="true" draggable={false} src={spritePath} />
        </span>
        <span>{role}</span>
      </div>
      <strong>{name}</strong>
      <p>{line}</p>
    </article>
  );
}

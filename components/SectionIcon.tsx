export type SectionIconVariant =
  | "agents"
  | "cast"
  | "moon"
  | "scroll"
  | "timeline";

type SectionIconProps = {
  variant: SectionIconVariant;
};

const iconMap = {
  agents: "/icons/six-ninja-agents.png",
  cast: "/icons/decor-elements.png",
  moon: "/icons/moonrise-shipped.png",
  scroll: "/icons/scroll-input.png",
  timeline: "/icons/workflow-timeline.png"
};

export function SectionIcon({ variant }: SectionIconProps) {
  return (
    <span className="section-icon" data-variant={variant}>
      <img alt="" aria-hidden="true" draggable={false} src={iconMap[variant]} />
    </span>
  );
}

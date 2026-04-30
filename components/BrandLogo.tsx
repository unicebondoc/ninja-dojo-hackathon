"use client";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <div className={["brand-logo", className].filter(Boolean).join(" ")}>
      <span className="brand-logo__live" aria-label="Live" />
      <img
        alt="Ninja Dojo"
        className="brand-logo__lockup-art"
        draggable={false}
        src="/brand/logo-lockup.png"
      />
      <h1>NINJA DOJO</h1>
    </div>
  );
}

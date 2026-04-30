"use client";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <div className={["brand-logo", className].filter(Boolean).join(" ")}>
      <span className="brand-logo__live" aria-label="Live" />
      <img
        alt=""
        aria-hidden="true"
        className="brand-logo__mark-art"
        draggable={false}
        src="/brand/ninja-cat-mark.png"
      />
      <img
        alt=""
        aria-hidden="true"
        className="brand-logo__wordmark-art"
        draggable={false}
        src="/brand/ninja-dojo-wordmark.png"
      />
      <h1>NINJA DOJO</h1>
    </div>
  );
}

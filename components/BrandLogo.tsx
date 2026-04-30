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
        className="brand-logo__lockup-art"
        draggable={false}
        src="/brand/logo-lockup.png"
      />
      <img
        alt=""
        aria-hidden="true"
        className="brand-logo__mark"
        draggable={false}
        src="/brand/logo-mark.png"
      />
      <span className="brand-logo__wordmark">
        <span>NINJA DOJO</span>
        <i />
      </span>
    </div>
  );
}

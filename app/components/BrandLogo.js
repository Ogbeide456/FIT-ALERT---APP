"use client";

export function BrandLogoMark({ size = 32, className = "" }) {
  return (
    <span
      className={`brand-mark-wrapper ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.32),
        background: "linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%)",
        boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <svg
        width={Math.round(size * 0.72)}
        height={Math.round(size * 0.72)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dynamic Athletic Fitalert Emblem: Energy Bolt & Athletic Pulse */}
        <path
          d="M13 2L4 13.5H11.5L9.5 22L20 9.5H13.5L15.5 2H13Z"
          fill="white"
          stroke="white"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
        <circle cx="18.5" cy="5.5" r="1.5" fill="#fef08a" />
      </svg>
    </span>
  );
}

export function BrandLogo({ size = 32, textClass = "" }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
      <BrandLogoMark size={size} />
      <span className={textClass} style={{ font: "800 21px 'Manrope', sans-serif", letterSpacing: "-0.6px" }}>
        fitalert
      </span>
    </div>
  );
}

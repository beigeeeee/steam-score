"use client";

interface ShinyTextProps {
  text: string;
  className?: string;
  shimmerWidth?: number;
  speed?: number;
}

export function ShinyText({
  text,
  className = "",
  shimmerWidth = 100,
  speed = 3,
}: ShinyTextProps) {
  return (
    <span
      className={`inline-block bg-clip-text ${className}`}
      style={{
        backgroundImage: `linear-gradient(
          120deg,
          rgba(0,0,0,1) 40%,
          rgba(16,185,129,0.8) 50%,
          rgba(0,0,0,1) 60%
        )`,
        backgroundSize: `${shimmerWidth}% 100%`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: `shiny-text ${speed}s ease-in-out infinite`,
      }}
    >
      {text}
      <style>{`
        @keyframes shiny-text {
          0%, 100% { background-position: 100% center; }
          50% { background-position: 0% center; }
        }
      `}</style>
    </span>
  );
}

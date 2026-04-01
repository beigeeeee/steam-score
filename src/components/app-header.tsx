"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  backLabel?: string;
  backHref?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  backLabel,
  backHref,
  onBack,
  rightAction,
  transparent = false,
}: AppHeaderProps) {
  const router = useRouter();

  function handleBack() {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  }

  const showBack = backLabel || backHref || onBack;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full",
        transparent
          ? "bg-transparent"
          : "bg-background/80 backdrop-blur-lg border-b"
      )}
    >
      <div className="flex items-center justify-between h-12 px-4 max-w-3xl mx-auto">
        {/* Left: back button */}
        <div className="flex items-center gap-1 min-w-[72px]">
          {showBack && (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1 text-sm text-primary font-medium cursor-pointer -ml-1 px-1 py-1 rounded-md hover:bg-primary/5 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
              {backLabel && <span>{backLabel}</span>}
            </button>
          )}
        </div>

        {/* Center: title */}
        <div className="flex-1 text-center min-w-0">
          {title && (
            <h1 className="text-sm font-semibold truncate">{title}</h1>
          )}
          {subtitle && (
            <p className="text-[10px] text-muted-foreground truncate leading-tight">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: action */}
        <div className="flex items-center justify-end min-w-[72px]">
          {rightAction}
        </div>
      </div>
    </header>
  );
}

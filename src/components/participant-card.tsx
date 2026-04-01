"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SpotlightCard } from "@/components/reactbits/spotlight-card";

interface ParticipantCardProps {
  name: string;
  projectTitle: string;
  grade?: string;
  type?: string;
  members?: string[];
  table?: number;
  location?: number;
  scored: boolean;
  onClick: () => void;
}

export function ParticipantCard({
  name,
  projectTitle,
  grade,
  type,
  members,
  table,
  location,
  scored,
  onClick,
}: ParticipantCardProps) {
  return (
    <SpotlightCard
      className={cn(
        "rounded-xl border transition-all duration-200",
        scored
          ? "border-primary/20 bg-primary/[0.02]"
          : "hover:border-primary/30 hover:shadow-sm"
      )}
    >
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full flex items-center justify-between p-4 gap-3 group",
          "text-left cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
            scored
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {scored ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : type === "team" ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm truncate">{name}</span>
            {type === "team" && (
              <span className="shrink-0 text-[9px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                Team
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {projectTitle}
            {grade && (
              <span className="ml-1.5 text-[10px] text-muted-foreground/70">· {grade} grade</span>
            )}
          </div>
          {(table || location) && (
            <div className="flex items-center gap-2 mt-1">
              {table && (
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
                  </svg>
                  Table {table}
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  Location {location}
                </span>
              )}
            </div>
          )}
          {type === "team" && members && members.length > 0 && (
            <div className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
              {members.join(", ")}
            </div>
          )}
        </div>

        {/* Badge */}
        {scored ? (
          <span className="shrink-0 text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full transition-all group-hover:bg-primary/20">
            Done
            <span className="hidden group-hover:inline ml-0.5">&middot; Edit</span>
          </span>
        ) : (
          <span className="shrink-0 text-xs font-medium bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full flex items-center gap-1">
            Score
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </span>
        )}
      </motion.button>
    </SpotlightCard>
  );
}

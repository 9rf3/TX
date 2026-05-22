"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  upcomingTournaments,
  type UpcomingTournamentEntry,
} from "@/components/tournaments/data";

/* ------------------------------------------------------------------ */
/*  Icon components                                                    */
/* ------------------------------------------------------------------ */

function HtmlIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 3L5.5 16L10 17.5L14.5 16L16 3H4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 6H13L12.5 11L10 12L7.5 11L7.3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PythonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3C7 3 7 5 7 5V7H10.5V8H5.5C5.5 8 3 7.8 3 11C3 14.2 5 14 5 14H6.5V12C6.5 12 6.3 10 8.5 10H11.5C11.5 10 13 10.1 13 8.5V5.5C13 5.5 13.2 3 10 3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M10 17C13 17 13 15 13 15V13H9.5V12H14.5C14.5 12 17 12.2 17 9C17 5.8 15 6 15 6H13.5V8C13.5 8 13.7 10 11.5 10H8.5C8.5 10 7 9.9 7 11.5V14.5C7 14.5 6.8 17 10 17Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="8.5" cy="5.5" r="0.8" fill="currentColor" />
      <circle cx="11.5" cy="14.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

function ReactIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="10" cy="10" rx="8" ry="3" stroke="currentColor" strokeWidth="1.3" />
      <ellipse cx="10" cy="10" rx="8" ry="3" stroke="currentColor" strokeWidth="1.3" transform="rotate(60 10 10)" />
      <ellipse cx="10" cy="10" rx="8" ry="3" stroke="currentColor" strokeWidth="1.3" transform="rotate(120 10 10)" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
    </svg>
  );
}

function AlgoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="4" r="2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="5" cy="10" r="2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="15" cy="10" r="2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="5" cy="16" r="2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="15" cy="16" r="2" stroke="currentColor" strokeWidth="1.3" />
      <line x1="10" y1="6" x2="5" y2="8" stroke="currentColor" strokeWidth="1.3" />
      <line x1="10" y1="6" x2="15" y2="8" stroke="currentColor" strokeWidth="1.3" />
      <line x1="5" y1="12" x2="5" y2="14" stroke="currentColor" strokeWidth="1.3" />
      <line x1="15" y1="12" x2="15" y2="14" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

const iconMap: Record<UpcomingTournamentEntry["iconType"], React.FC> = {
  html: HtmlIcon,
  python: PythonIcon,
  react: ReactIcon,
  algo: AlgoIcon,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function UpcomingTournaments() {
  return (
    <Card hover={false} className="p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-light" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Upcoming Tournaments
          </h3>
        </div>
        <button className="text-[11px] font-medium text-primary-light hover:text-primary transition-colors cursor-pointer">
          View All
        </button>
      </div>

      {/* List */}
      <div className="px-3 pb-3">
        {upcomingTournaments.map((t, i) => {
          const Icon = iconMap[t.iconType];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
            >
              {i > 0 && (
                <div className="mx-2 border-t border-white/[0.04]" />
              )}

              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2 py-3",
                  "hover:bg-white/[0.03] transition-colors"
                )}
              >
                {/* Icon block */}
                <div
                  className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg"
                  style={{ backgroundColor: `${t.iconBg}20`, color: t.iconBg }}
                >
                  <Icon />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">
                    {t.title}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    {t.date} · {t.time}
                  </p>
                  <p className="text-[11px] font-semibold text-amber-400 mt-0.5">
                    🏆 {t.prize}
                  </p>
                </div>

                {/* Action */}
                <Button variant="outline" size="sm" className="flex-shrink-0 text-[11px] px-3 py-1">
                  Join
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

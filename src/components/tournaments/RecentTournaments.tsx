"use client";

import { motion } from "framer-motion";
import { History, Trophy, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  recentTournamentHistory as defaultHistory,
} from "@/components/tournaments/data";
import { useTournaments } from "@/components/providers/TournamentProvider";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function RecentTournaments() {
  const { recentHistory, isHydrated } = useTournaments();

  const history = isHydrated ? recentHistory : defaultHistory;

  return (
    <Card hover={false} className="p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-3">
        <History className="w-4 h-4 text-primary-light" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
          Your Recent Tournaments
        </h3>
      </div>

      {/* List */}
      <div className="px-3 pb-3">
        {history.map((t, i) => {
          const won = t.status === "Won";

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              {i > 0 && (
                <div className="mx-2 border-t border-white/[0.04]" />
              )}

              <div className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                {/* Status icon */}
                <div
                  className={cn(
                    "flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg",
                    won ? "bg-accent-green/15 text-accent-green" : "bg-accent-red/15 text-accent-red"
                  )}
                >
                  {won ? <Trophy className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                </div>

                {/* Name + date */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">
                    {t.name}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">{t.date}</p>
                </div>

                {/* Rank badge */}
                <span
                  className={cn(
                    "flex-shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-md",
                    "bg-white/[0.06] text-muted-light"
                  )}
                >
                  {t.rank}
                </span>

                {/* XP gained */}
                <span className="flex-shrink-0 text-[11px] font-semibold text-amber-400 tabular-nums min-w-[60px] text-right">
                  {t.xp}
                </span>

                {/* Status pill */}
                <span
                  className={cn(
                    "flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full",
                    won
                      ? "bg-accent-green/15 text-accent-green"
                      : "bg-accent-red/15 text-accent-red"
                  )}
                >
                  {t.status}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

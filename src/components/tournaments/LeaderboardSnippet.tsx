"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  leaderboardData as defaultLeaderboardData,
  currentPlayerLeaderboard,
  type LeaderboardUser,
} from "@/components/tournaments/data";
import { useTournaments } from "@/components/providers/TournamentProvider";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const rankMedalColors: Record<number, string> = {
  1: "bg-amber-400/20 text-amber-400 ring-amber-400/30",
  2: "bg-gray-300/20 text-gray-300 ring-gray-300/30",
  3: "bg-amber-700/20 text-amber-700 ring-amber-700/30",
};

function RankBadge({ rank }: { rank: number }) {
  const medal = rankMedalColors[rank];
  if (medal) {
    return (
      <span
        className={cn(
          "flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ring-1",
          medal
        )}
      >
        {rank}
      </span>
    );
  }
  return (
    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-medium text-muted">
      {rank}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Row                                                                */
/* ------------------------------------------------------------------ */

function LeaderboardRow({
  entry,
  index,
  isCurrentUser = false,
}: {
  entry: LeaderboardUser;
  index: number;
  isCurrentUser?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors",
        isCurrentUser
          ? "bg-primary/[0.08] border border-primary/20"
          : "hover:bg-white/[0.03]"
      )}
    >
      {/* Rank */}
      <RankBadge rank={entry.rank} />

      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-br",
          entry.avatarGradient
        )}
      >
        {entry.initials}
      </div>

      {/* Name + tier */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold truncate", isCurrentUser ? "text-primary-light" : "text-foreground")}>
          {entry.username}
        </p>
        <p className="text-[10px] font-medium" style={{ color: entry.tierColor }}>
          {entry.tier}
        </p>
      </div>

      {/* XP */}
      <span className="text-sm font-bold text-foreground tabular-nums">
        {entry.xpDisplay}
      </span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LeaderboardSnippet() {
  const { leaderboard, isHydrated } = useTournaments();

  const leaders = isHydrated ? leaderboard : defaultLeaderboardData;
  const topFive = leaders.slice(0, 5);

  return (
    <Card hover={false} className="p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Leaderboard
          </h3>
        </div>

        {/* Glass pill select */}
        <select
          defaultValue="global"
          className={cn(
            "appearance-none bg-white/[0.06] text-[11px] font-medium text-muted-light",
            "px-3 py-1 rounded-full border border-white/10",
            "hover:border-white/20 focus:outline-none focus:border-primary/40",
            "cursor-pointer transition-colors backdrop-blur-sm"
          )}
        >
          <option value="global" className="bg-surface text-foreground">Global</option>
          <option value="regional" className="bg-surface text-foreground">Regional</option>
          <option value="friends" className="bg-surface text-foreground">Friends</option>
        </select>
      </div>

      {/* Top 5 */}
      <div className="px-2 space-y-0.5">
        {topFive.map((entry, i) => (
          <LeaderboardRow key={entry.username} entry={entry} index={i} />
        ))}
      </div>

      {/* Separator dots */}
      <div className="flex items-center justify-center gap-1 py-2">
        <span className="w-1.5 h-1.5 rounded-full bg-muted/40" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted/40" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted/40" />
      </div>

      {/* Current user */}
      <div className="px-2 pb-3">
        <LeaderboardRow
          entry={currentPlayerLeaderboard}
          index={topFive.length}
          isCurrentUser
        />
      </div>
    </Card>
  );
}

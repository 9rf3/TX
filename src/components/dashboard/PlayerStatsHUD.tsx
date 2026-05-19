"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { AnimatedCounter } from "./AnimatedCounter";
import { RankBadge } from "./RankBadge";
import { Zap, Flame, Sparkles, Trophy, TrendingUp, Star, Target, Crown, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PlayerStatsHUDProps {
  xp: number;
  level: number;
  xpForNext: number;
  xpRemaining: number;
  rankTier: string;
  nextRankTier: string | null;
  nextRankLevel: number | null;
  rank: number;
  percentile: number;
  totalUsers: number;
  totalXpEarned: number;
  txCoins: number;
  streak: number;
  longestStreak: number;
  showLevelUp: boolean;
}

export function PlayerStatsHUD({
  xp, level, xpForNext, xpRemaining,
  rankTier, nextRankTier, nextRankLevel,
  rank, percentile, totalUsers, totalXpEarned,
  txCoins, streak, longestStreak, showLevelUp,
}: PlayerStatsHUDProps) {
  const progressPct = xpForNext > 0 ? Math.min((xp / xpForNext) * 100, 100) : 0;

  const statGroups = [
    {
      label: 'Player',
      items: [
        { icon: Zap, value: xp.toLocaleString(), sub: 'Current XP', color: 'text-primary-light' },
        { icon: TrendingUp, value: totalXpEarned.toLocaleString(), sub: 'Lifetime XP', color: 'text-secondary' },
        { icon: Trophy, value: rank > 0 ? `#${rank}` : '--', sub: `Global Rank of ${totalUsers}`, color: 'text-accent-orange' },
      ],
    },
    {
      label: 'Currency',
      items: [
        { icon: Sparkles, value: txCoins.toLocaleString(), sub: 'TX Coins', color: 'text-yellow-400' },
        { icon: Flame, value: `${streak}`, sub: `Day streak · Best: ${longestStreak}`, color: 'text-accent-orange' },
        { icon: Star, value: `Top ${100 - percentile}%`, sub: 'Percentile', color: 'text-accent-green' },
      ],
    },
  ];

  return (
    <Card className="relative overflow-hidden">
      {/* Background ambiance */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent-pink/[0.03]" />
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />

      {/* Level-up overlay */}
      {showLevelUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-3" />
            </motion.div>
            <h2 className="text-3xl font-black gradient-text mb-1">LEVEL UP!</h2>
            <div className="text-5xl font-black text-white mb-2">{level}</div>
            <p className="text-sm text-muted-light">You reached a new level</p>
          </motion.div>
        </motion.div>
      )}

      <div className="relative z-10 p-5">
        {/* Top section: Level + Rank */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-[10px] text-muted uppercase tracking-widest font-semibold mb-1">Player Level</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">{level}</span>
              <span className="text-sm font-medium text-muted-light">{rankTier}</span>
            </div>
          </div>
          <RankBadge tier={rankTier} level={level} size="lg" />
        </div>

        {/* XP bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-sm">
              <Zap className="w-4 h-4 text-primary-light" />
              <span className="font-semibold"><AnimatedCounter to={xp} duration={1.5} formatter={v => v.toLocaleString()} /></span>
              <span className="text-xs text-muted font-normal">/ <AnimatedCounter to={xpForNext} duration={1} formatter={v => v.toLocaleString()} /> XP</span>
            </div>
            <span className="text-[10px] text-muted">{progressPct.toFixed(0)}%</span>
          </div>
          <Progress value={xp} max={xpForNext} size="lg" color="primary" />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted">
              <AnimatedCounter to={xpRemaining} duration={1} formatter={v => v.toLocaleString()} /> XP to Level {level + 1}
            </span>
            {nextRankTier && nextRankLevel && (
              <Link href="/profile" className="flex items-center gap-1 text-[10px] text-primary-light hover:text-primary transition-colors">
                <Target className="w-3 h-3" /> Next rank: {nextRankTier} (Lvl {nextRankLevel})
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          {statGroups.map(group => (
            <div key={group.label}>
              <div className="text-[9px] text-muted uppercase tracking-widest mb-2 font-semibold">{group.label}</div>
              <div className="space-y-2">
                {group.items.map(item => (
                  <div key={item.sub} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.02]">
                    <div className="flex items-center gap-1.5">
                      <item.icon className={`w-3 h-3 ${item.color}`} />
                      <span className="text-[10px] text-muted">{item.sub}</span>
                    </div>
                    <span className={`text-xs font-bold tabular-nums ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

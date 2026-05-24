"use client";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { getRankTier, getNextRankTier } from "@/lib/types";

interface XPProgressCardProps {
  xp: number;
  level: number;
  xpForNext: number;
  totalXpEarned: number;
  percentile?: number;
}

export function XPProgressCard({ xp, level, xpForNext, totalXpEarned, percentile = 50 }: XPProgressCardProps) {
  const progress = Math.min((xp / xpForNext) * 100, 100);
  const remaining = Math.max(0, xpForNext - xp);
  const tier = getRankTier(level);
  const nextTier = getNextRankTier(level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5"
    >
      {/* Background glow */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20"
        style={{ background: tier.color }}
      />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{
                background: `linear-gradient(135deg, ${tier.color}30, ${tier.color}10)`,
                border: `1px solid ${tier.color}40`,
                color: tier.color,
              }}
            >
              {level}
            </div>
            <div>
              <div className="text-sm font-semibold">Level {level}</div>
              <div className="text-[10px] text-muted">{tier.name} Tier</div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-muted-light">
              <TrendingUp className="w-3 h-3 text-accent-green" />
              Top {percentile}%
            </div>
            <div className="text-[10px] text-muted">{totalXpEarned.toLocaleString()} total XP</div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-light">Current XP</span>
            <span className="text-muted">{xp.toLocaleString()} / {xpForNext.toLocaleString()}</span>
          </div>
          <div className="relative h-4 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full relative"
              style={{
                background: `linear-gradient(90deg, ${tier.color}, ${tier.color}cc, ${tier.color}88)`,
                boxShadow: `0 0 20px ${tier.color}60`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:200%_100%]" />
            </motion.div>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-light">
              {remaining.toLocaleString()} XP to Level {level + 1}
            </span>
            <span className="text-muted">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Next rank preview */}
        {nextTier && (
          <motion.div
            className="flex items-center justify-between rounded-xl bg-white/5 border border-border/50 p-3"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-accent-green" />
              <span className="text-xs text-muted-light">Next Rank</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: nextTier.color }}>
                {nextTier.name}
              </span>
              <span className="text-[10px] text-muted">
                at Level {nextTier.minLevel}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

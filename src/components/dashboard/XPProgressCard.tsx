"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { AnimatedCounter } from "./AnimatedCounter";
import { RankBadge } from "./RankBadge";
import { Zap, TrendingUp } from "lucide-react";

interface XPProgressCardProps {
  xp: number;
  level: number;
  xpForNext: number;
  rankTier: string;
  rank: number;
  percentile: number;
  totalXpEarned: number;
}

export function XPProgressCard({
  xp, level, xpForNext, rankTier, rank, percentile, totalXpEarned,
}: XPProgressCardProps) {
  const progressPct = xpForNext > 0 ? Math.min((xp / xpForNext) * 100, 100) : 0;

  return (
    <Card className="relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-60" />
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-all duration-700" />

      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Player Level</div>
            <div className="flex items-baseline gap-1">
              <AnimatedCounter
                to={level}
                className="text-4xl font-black gradient-text"
                duration={1}
              />
              <span className="text-sm text-muted-light font-medium">{rankTier}</span>
            </div>
          </div>
          <RankBadge tier={rankTier} level={level} size="lg" />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-sm">
              <Zap className="w-4 h-4 text-primary-light" />
              <span className="font-semibold">
                <AnimatedCounter to={xp} duration={1.5} /> <span className="text-muted font-normal text-xs">XP</span>
              </span>
            </div>
            <span className="text-xs text-muted">
              <AnimatedCounter to={xpForNext} duration={1} /> XP to next
            </span>
          </div>
          <Progress value={xp} max={xpForNext} size="lg" color="primary" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wider">Global Rank</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-accent-green" />
              <span className="text-sm font-bold">
                {rank > 0 ? `#${rank}` : '--'}
              </span>
              <span className="text-[10px] text-muted">of {">"}100</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wider">Lifetime XP</div>
            <div className="text-sm font-bold mt-0.5">
              <AnimatedCounter to={totalXpEarned || xp} duration={2} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

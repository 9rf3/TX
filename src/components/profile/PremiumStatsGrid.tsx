"use client";
import { memo } from "react";
import {
  Award, BookOpen, Coins, Flame, Medal, Sparkles, Swords,
  Target, Timer, Trophy, Zap,
} from "lucide-react";
import { GamePanel } from "@/components/ui/GamePanel";
import { cn, formatNumber } from "@/lib/utils";

interface PremiumStatsGridProps {
  tournamentsWon: number;
  pvpWon: number;
  completedCourses: number;
  practiceHours: number;
  quizAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  txCoins: number;
  rank: number;
  achievementsUnlocked?: number;
}

const statsConfig: { key: string; label: string; icon: typeof Trophy; color: string; suffix?: string; prefix?: string; formatter?: (v: number) => string }[] = [
  { key: "tournamentsWon",     label: "Tournaments Won", icon: Trophy,       color: "text-accent-orange" },
  { key: "completedCourses",   label: "Courses Done",    icon: BookOpen,     color: "text-accent-green" },
  { key: "pvpWon",             label: "PvP Won",         icon: Swords,       color: "text-accent-pink" },
  { key: "practiceHours",      label: "Practice Hours",  icon: Timer,        color: "text-secondary", suffix: "h" },
  { key: "quizAccuracy",       label: "Quiz Accuracy",   icon: Target,       color: "text-primary-light", suffix: "%" },
  { key: "currentStreak",      label: "Current Streak",  icon: Flame,        color: "text-accent-orange", suffix: "d" },
  { key: "longestStreak",      label: "Longest Streak",  icon: Flame,        color: "text-accent-red", suffix: "d" },
  { key: "rank",               label: "Global Rank",     icon: Medal,        color: "text-accent-orange", prefix: "#" },
  { key: "totalXp",            label: "Total XP",        icon: Zap,          color: "text-primary", formatter: (v) => formatNumber(v) },
  { key: "txCoins",            label: "TX Coins",        icon: Sparkles,     color: "text-accent-orange", formatter: (v) => formatNumber(v) },
];

export const PremiumStatsGrid = memo(function PremiumStatsGrid(stats: PremiumStatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statsConfig.map((cfg) => {
        const Icon = cfg.icon;
        const raw = (stats as unknown as Record<string, number>)[cfg.key] ?? 0;
        const formatted = cfg.formatter ? cfg.formatter(raw) : raw;
        const value = `${cfg.prefix ?? ""}${formatted}${cfg.suffix ?? ""}`;
        return (
          <GamePanel key={cfg.key} className="p-4 text-center">
            <div className={cn("mx-auto mb-2 grid h-10 w-10 place-items-center rounded-[8px] border border-current/25 bg-white/5", cfg.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-xl font-black text-white">{value}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-light">{cfg.label}</div>
          </GamePanel>
        );
      })}
    </div>
  );
});

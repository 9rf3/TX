"use client";
import { motion } from "framer-motion";
import {
  Trophy, Flame, Zap, Sparkles, Clock, Target,
  Swords, Crosshair, BookOpen, Users,
} from "lucide-react";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import { cn } from "@/lib/utils";

interface StatItem {
  icon: typeof Zap;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  color: string;
  bgColor: string;
  formatter?: (v: number) => string;
}

interface AnimatedStatsGridProps {
  stats: {
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
  };
}

export function AnimatedStatsGrid({ stats }: AnimatedStatsGridProps) {
  const items: StatItem[] = [
    {
      icon: Trophy, label: "Tournaments Won", value: stats.tournamentsWon,
      color: "text-accent-orange", bgColor: "bg-accent-orange/10",
    },
    {
      icon: Swords, label: "PVP Won", value: stats.pvpWon,
      color: "text-accent-pink", bgColor: "bg-accent-pink/10",
    },
    {
      icon: BookOpen, label: "Courses Completed", value: stats.completedCourses,
      color: "text-primary-light", bgColor: "bg-primary/10",
    },
    {
      icon: Clock, label: "Practice Hours", value: stats.practiceHours,
      suffix: "h", color: "text-secondary", bgColor: "bg-secondary/10",
    },
    {
      icon: Target, label: "Quiz Accuracy", value: Math.round(stats.quizAccuracy),
      suffix: "%", color: "text-accent-green", bgColor: "bg-accent-green/10",
    },
    {
      icon: Flame, label: "Current Streak", value: stats.currentStreak,
      suffix: "d", color: "text-accent-orange", bgColor: "bg-accent-orange/10",
    },
    {
      icon: Flame, label: "Longest Streak", value: stats.longestStreak,
      suffix: "d", color: "text-accent-red", bgColor: "bg-accent-red/10",
    },
    {
      icon: Users, label: "Global Rank", value: stats.rank,
      prefix: "#", color: "text-yellow-400", bgColor: "bg-yellow-400/10",
    },
    {
      icon: Zap, label: "Total XP", value: stats.totalXp,
      color: "text-primary", bgColor: "bg-primary/10",
      formatter: (v) => v.toLocaleString(),
    },
    {
      icon: Sparkles, label: "TX Coins", value: stats.txCoins,
      color: "text-yellow-400", bgColor: "bg-yellow-400/10",
      formatter: (v) => v.toLocaleString(),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 * i, duration: 0.4 }}
          className={cn(
            "rounded-xl border border-border/50 p-4 transition-all duration-300",
            "hover:border-border-light hover:bg-surface-light/50 group cursor-default",
          )}
        >
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", stat.bgColor, stat.color)}>
            <stat.icon className="w-4 h-4" />
          </div>
          <AnimatedCounter
            from={0}
            to={stat.value}
            duration={1.2 + i * 0.1}
            suffix={stat.suffix || ""}
            prefix={stat.prefix || ""}
            formatter={stat.formatter}
            className={cn("text-2xl font-bold", stat.color)}
          />
          <div className="text-[10px] text-muted mt-1 uppercase tracking-wider">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

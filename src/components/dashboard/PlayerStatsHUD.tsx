"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { AnimatedCounter } from "./AnimatedCounter";
import { RankBadge } from "./RankBadge";
import { Zap, Flame, Sparkles, Trophy, TrendingUp, Star, Target, Crown, ChevronRight, Award, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

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
  const { user, profile } = useAuth();
  const progressPct = xpForNext > 0 ? Math.min((xp / xpForNext) * 100, 100) : 0;

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-surface via-[#0d0d1a] to-surface-light shadow-[0_8px_32px_rgba(139,92,246,0.15)] group !p-6">
      {/* Dynamic cyberpunk grid mesh & glow effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

      {/* Level-up overlay */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="text-center p-6 space-y-3"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Crown className="w-20 h-20 text-yellow-400 mx-auto filter drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
              </motion.div>
              <h2 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mb-1">
                LEVEL UP!
              </h2>
              <div className="text-6xl font-black text-white">{level}</div>
              <p className="text-sm text-primary-light font-bold">LEGENDARY ADVANCEMENT UNLOCKED</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 space-y-6">
        {/* Profile Details (Gaming Profile Banner layout) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group/avatar">
              {/* Outer pulsing ring */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-accent-pink to-secondary opacity-75 blur group-hover/avatar:opacity-100 transition duration-1000 group-hover/avatar:duration-200 animate-glow-rotate pointer-events-none" />
              <div className="w-16 h-16 rounded-full bg-surface border-2 border-primary-light flex items-center justify-center text-xl font-black text-white shrink-0 overflow-hidden relative z-10 shadow-lg">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover group-hover/avatar:scale-110 transition duration-300" />
                ) : (
                  initials
                )}
              </div>
              {/* Active level label */}
              <div className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-r from-primary to-secondary text-white border border-primary-light text-[10px] font-black px-2 py-0.5 rounded-full z-20 shadow-md">
                LVL {level}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-wide truncate max-w-[200px] md:max-w-xs">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </h1>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-white/5 border border-white/10 text-muted-light">
                  PRO MEMBER
                </span>
              </div>
              <div className="text-xs text-muted-light mt-0.5">
                {profile?.username ? `@${profile.username}` : user?.email}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <Award className="w-3.5 h-3.5 text-accent-pink animate-float" />
                <span className="text-xs font-semibold text-accent-pink uppercase tracking-wider">
                  Season Rank: {rankTier} IV
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <span className="text-[9px] uppercase tracking-widest font-black text-muted block">Current Division</span>
              <span className="text-sm font-bold text-white uppercase">{rankTier} Tier</span>
            </div>
            <div className="relative">
              <div className="absolute -inset-1 rounded-3xl bg-primary/20 blur opacity-75" />
              <RankBadge tier={rankTier} level={level} size="lg" />
            </div>
          </div>
        </div>

        {/* XP Progress Bar Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary-light">
              <Zap className="w-4 h-4 text-primary-light animate-bounce" />
              <span className="text-white">
                <AnimatedCounter to={xp} duration={1.5} formatter={v => v.toLocaleString()} />
              </span>
              <span className="text-muted">/ <AnimatedCounter to={xpForNext} duration={1} formatter={v => v.toLocaleString()} /> XP</span>
            </div>
            <span className="text-xs font-black text-white bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
              {progressPct.toFixed(0)}%
            </span>
          </div>

          {/* Upgraded Progress Bar */}
          <div className="relative">
            {/* Soft background glow matching the gradient */}
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-[2px] pointer-events-none" />
            <Progress value={xp} max={xpForNext} size="lg" color="primary" />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-light">
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-primary-light" />
              <span className="font-semibold text-white">
                <AnimatedCounter to={xpRemaining} duration={1} formatter={v => v.toLocaleString()} />
              </span>
              <span>XP to next level</span>
            </span>

            {nextRankTier && nextRankLevel && (
              <Link href="/profile" className="flex items-center gap-0.5 text-primary-light hover:text-white transition-colors font-bold uppercase tracking-wider">
                Rank Up: {nextRankTier} (Lvl {nextRankLevel}) <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid inside Profile Card */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Global Rank", icon: Trophy, value: rank > 0 ? `#${rank}` : "--", color: "text-accent-orange bg-accent-orange/10 border-accent-orange/20" },
            { label: "TX Coins", icon: Sparkles, value: txCoins.toLocaleString(), color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
            { label: "Daily Streak", icon: Flame, value: `${streak} Days`, color: "text-accent-pink bg-accent-pink/10 border-accent-pink/20" }
          ].map((stat, i) => (
            <div key={i} className={`p-3 rounded-2xl border text-center space-y-1 hover:scale-[1.03] transition duration-300 bg-white/[0.01] ${stat.color.split(" ")[2]}`}>
              <div className="flex items-center justify-center gap-1">
                <stat.icon className={`w-3.5 h-3.5 ${stat.color.split(" ")[0]}`} />
                <span className="text-[9px] uppercase tracking-wider text-muted-light font-bold">{stat.label}</span>
              </div>
              <div className={`text-base font-black ${stat.color.split(" ")[0]}`}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

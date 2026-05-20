"use client";
import { motion } from "framer-motion";
import { useGamificationEngine } from "@/lib/hooks/useGamificationEngine";
import { useSound } from "@/lib/hooks/useSound";
import { PlayerStatsHUD } from "@/components/dashboard/PlayerStatsHUD";
import { DailyRewardCard } from "@/components/dashboard/DailyRewardCard";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { ContinueLearning } from "@/components/dashboard/ContinueLearning";
import { LeaderboardPreview } from "@/components/dashboard/LeaderboardPreview";
import { AchievementsPanel } from "@/components/dashboard/AchievementsPanel";
import { FriendsOnline } from "@/components/dashboard/FriendsOnline";
import { GoalsWidget } from "@/components/dashboard/GoalsWidget";
import { AIMotivationWidget } from "@/components/dashboard/AIMotivationWidget";
import { SkillTreeWidget } from "@/components/dashboard/SkillTreeWidget";
import { LiveTournaments } from "@/components/dashboard/LiveTournaments";
import { TXCoinsCard } from "@/components/dashboard/TXCoinsCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEffect, useRef, useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
} as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 14 } }
} as const;


export default function DashboardPage() {
  const { profile: authProfile, user } = useAuth();
  const {
    profile, isLoading, error,
    claimDailyReward, claiming, claimResult, canClaimDaily,
    timeUntilNextClaim, nextLevelXp, rankTier,
    nextRankTier, nextRankLevel, rewardTier,
    xpRemaining, showLevelUp,
    clearClaimResult,
    fetchProfile
  } = useGamificationEngine();
  const { playClick } = useSound();
  const [aiTrigger, setAiTrigger] = useState(0);

  // Allow custom AI companions to listen to telemetries
  useEffect(() => {
    const handleAiReval = () => {
      setAiTrigger(prev => prev + 1);
    };
    window.addEventListener("tx-ai-re-evaluate", handleAiReval);
    return () => window.removeEventListener("tx-ai-re-evaluate", handleAiReval);
  }, []);

  const firstName = authProfile?.full_name
    ? authProfile.full_name.split(" ")[0]
    : user?.email?.split('@')[0] || "Student";

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const rank = profile?.rank ?? 0;
  const percentile = profile?.percentile ?? 0;
  const totalXpEarned = profile?.total_xp_earned ?? 0;
  const streak = profile?.current_streak ?? 0;
  const longestStreak = profile?.longest_streak ?? 0;
  const txCoins = profile?.tx_coins ?? 0;
  const totalUsers = profile?.totalUsers ?? 1;
  const lastActive = profile?.last_active_at ?? null;

  if (error) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="rounded-2xl bg-accent-red/10 border border-accent-red/20 p-6 text-center shadow-lg">
          <p className="text-accent-red font-bold">Failed to sync neural profiles: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto min-h-screen bg-background/50"
    >
      {/* Top Banner section */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">
            Control <span className="gradient-text">Center</span>
          </h1>
          <p className="text-xs text-muted-light mt-1">
            Welcome back, commander <span className="text-primary-light font-bold">@{firstName}</span>. Select your active educational campaign.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-light">
            Season 1: Cyber Genesis
          </span>
        </div>
      </motion.div>

      {/* AI Telemetry Companion Card */}
      <motion.div variants={item}>
        <AIMotivationWidget
          key={aiTrigger}
          xp={xp}
          level={level}
          xpForNext={nextLevelXp}
          streak={streak}
          rankTier={rankTier}
        />
      </motion.div>

      {/* Profile HUD + Daily reward row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <PlayerStatsHUD
            xp={xp}
            level={level}
            xpForNext={nextLevelXp}
            xpRemaining={xpRemaining}
            rankTier={rankTier}
            nextRankTier={nextRankTier}
            nextRankLevel={nextRankLevel}
            rank={rank}
            percentile={percentile}
            totalUsers={totalUsers}
            totalXpEarned={totalXpEarned}
            txCoins={txCoins}
            streak={streak}
            longestStreak={longestStreak}
            showLevelUp={showLevelUp}
          />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <DailyRewardCard
            canClaim={canClaimDaily}
            claiming={claiming}
            streak={streak}
            longestStreak={longestStreak}
            timeUntilNext={timeUntilNextClaim}
            rewardTier={rewardTier}
            onClaim={async () => {
              playClick();
              await claimDailyReward();
              if (fetchProfile) fetchProfile();
            }}
            claimResult={claimResult}
            onClearResult={clearClaimResult}
          />
        </div>
      </motion.div>

      {/* Split grid columns - Action Center vs Social Lobby */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LHS Columns - Action Center (spans 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skill Tree preview widget */}
          <motion.div variants={item}>
            <SkillTreeWidget />
          </motion.div>

          {/* PvP Arena section */}
          <motion.div variants={item}>
            <LiveTournaments />
          </motion.div>

          {/* Continue Learning cards */}
          <motion.div variants={item}>
            <ContinueLearning />
          </motion.div>

          {/* Medal cases */}
          <motion.div variants={item}>
            <AchievementsPanel />
          </motion.div>

          {/* Objectives Checkboxes */}
          <motion.div variants={item}>
            <GoalsWidget />
          </motion.div>
        </div>

        {/* RHS Columns - Social Lobby (spans 1/3) */}
        <div className="space-y-6">
          {/* Treasury Vault coins balance */}
          <motion.div variants={item}>
            <TXCoinsCard balance={txCoins} rank={rank} />
          </motion.div>

          {/* Streak tracker calendar */}
          <motion.div variants={item}>
            <StreakCard streak={streak} lastActive={lastActive} />
          </motion.div>

          {/* Leaderboard Preview */}
          <motion.div variants={item}>
            <LeaderboardPreview />
          </motion.div>

          {/* Squad Lobby list */}
          <motion.div variants={item}>
            <FriendsOnline />
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}

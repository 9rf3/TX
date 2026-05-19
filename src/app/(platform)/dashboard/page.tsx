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
import { MotivationBar } from "@/components/dashboard/MotivationBar";
import { GoalsWidget } from "@/components/dashboard/GoalsWidget";
import { ActiveEvents } from "@/components/dashboard/ActiveEvents";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEffect, useRef } from "react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { profile: authProfile, user } = useAuth();
  const {
    profile, isLoading, error,
    claimDailyReward, claiming, claimResult, canClaimDaily,
    timeUntilNextClaim, nextLevelXp, rankTier,
    nextRankTier, nextRankLevel, rewardTier,
    xpRemaining, showLevelUp,
    clearClaimResult,
  } = useGamificationEngine();
  const { playRewardClaim, playClick } = useSound();
  const hasClaimedRef = useRef(false);

  useEffect(() => {
    if (claimResult && !hasClaimedRef.current) {
      hasClaimedRef.current = true;
      playRewardClaim();
    }
    if (!claimResult) hasClaimedRef.current = false;
  }, [claimResult, playRewardClaim]);

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
        <div className="rounded-2xl bg-accent-red/10 border border-accent-red/20 p-6 text-center">
          <p className="text-accent-red font-semibold">Failed to load profile: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Motivation bar */}
      <motion.div variants={item}>
        <MotivationBar
          level={level}
          xp={xp}
          xpForNext={nextLevelXp}
          streak={streak}
          rankTier={rankTier}
          rank={rank}
          percentile={percentile}
        />
      </motion.div>

      {/* Welcome */}
      <motion.div variants={item}>
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome back, <span className="gradient-text">{firstName}</span>
        </h1>
        <p className="text-muted-light mt-1">
          {streak >= 7
            ? `Amazing ${streak}-day streak! You're unstoppable.`
            : streak >= 3
              ? `You're on a ${streak}-day streak! Keep the momentum going.`
              : "Continue your learning journey. You're doing great!"}
        </p>
      </motion.div>

      {/* Player HUD + Daily Reward row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-5 gap-4">
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
        <div className="lg:col-span-2 space-y-4">
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
            }}
            claimResult={claimResult}
            onClearResult={clearClaimResult}
          />
          <StreakCard streak={streak} lastActive={lastActive} />
        </div>
      </motion.div>

      {/* Events row */}
      <motion.div variants={item}>
        <ActiveEvents />
      </motion.div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left col - Learning */}
        <div className="lg:col-span-2 space-y-6">
          <ContinueLearning />
          <AchievementsPanel />
          <GoalsWidget />
        </div>

        {/* Right col - Social & Progress */}
        <div className="space-y-6">
          <LeaderboardPreview />
          <FriendsOnline />
        </div>
      </div>
    </motion.div>
  );
}

"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { UserRole } from "@/lib/types";

export interface GamificationProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: UserRole;
  xp: number;
  level: number;
  tx_coins: number;
  current_streak: number;
  longest_streak: number;
  last_reward_claimed_at: string | null;
  total_xp_earned: number;
  total_coins_earned: number;
  last_active_at: string | null;
  rank: number;
  totalUsers: number;
  percentile: number;
  xpForNext: number;
}

export function useGamificationEngine() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{
    xp: number; coins: number; streak: number; streakBonus: number; leveledUp?: boolean;
  } | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const supabase = useRef(createClient());
  const mountedRef = useRef(true);
  const lastLevelRef = useRef(1);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    try {
      const { getGamificationProfile } = await import('@/actions/gamification');
      const data = await getGamificationProfile();
      if (mountedRef.current && data) {
        const gData = data as unknown as GamificationProfile;
        setProfile(gData);
        // Detect level-up for animation
        if (gData.level > lastLevelRef.current) {
          setShowLevelUp(true);
          setTimeout(() => {
            if (mountedRef.current) setShowLevelUp(false);
          }, 3000);
        }
        lastLevelRef.current = gData.level;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      if (mountedRef.current) setError(message);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    fetchProfile();
    return () => { mountedRef.current = false; };
  }, [fetchProfile]);

  const claimDailyReward = useCallback(async () => {
    if (claiming || !user) return;
    setClaiming(true);
    setClaimResult(null);
    try {
      const { claimDailyReward: claim } = await import('@/actions/gamification');
      const result = await claim();
      if (mountedRef.current) {
        setClaimResult(result);
        await fetchProfile();
        if (result.leveledUp) {
          setShowLevelUp(true);
          setTimeout(() => {
            if (mountedRef.current) setShowLevelUp(false);
          }, 3000);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to claim';
      if (mountedRef.current) setError(message);
      throw err;
    } finally {
      if (mountedRef.current) setClaiming(false);
    }
  }, [claiming, user, fetchProfile]);

  const canClaimDaily = profile
    ? !profile.last_reward_claimed_at
      ? true
      : (Date.now() - new Date(profile.last_reward_claimed_at).getTime()) >= 86400000
    : false;

  const timeUntilNextClaim = profile?.last_reward_claimed_at
    ? Math.max(0, 86400000 - (Date.now() - new Date(profile.last_reward_claimed_at).getTime()))
    : 0;

  const nextLevelXp = profile?.xpForNext || 100;
  const progressToNext = profile
    ? Math.min((profile.xp / nextLevelXp) * 100, 100)
    : 0;

  const rankTier = profile?.level
    ? profile.level <= 10 ? 'Bronze'
      : profile.level <= 25 ? 'Silver'
      : profile.level <= 50 ? 'Gold'
      : profile.level <= 75 ? 'Platinum'
      : profile.level <= 99 ? 'Diamond'
      : 'Elite'
    : 'Unranked';

  const nextRankTier = rankTier === 'Bronze' ? 'Silver'
    : rankTier === 'Silver' ? 'Gold'
    : rankTier === 'Gold' ? 'Platinum'
    : rankTier === 'Platinum' ? 'Diamond'
    : rankTier === 'Diamond' ? 'Elite'
    : null;

  const nextRankLevel = rankTier === 'Bronze' ? 11
    : rankTier === 'Silver' ? 26
    : rankTier === 'Gold' ? 51
    : rankTier === 'Platinum' ? 76
    : rankTier === 'Diamond' ? 100
    : null;

  const clearClaimResult = useCallback(() => setClaimResult(null), []);

  // Reward tiers for display
  const rewardTier = profile?.current_streak
    ? profile.current_streak >= 30 ? 'Diamond'
      : profile.current_streak >= 14 ? 'Gold'
      : profile.current_streak >= 7 ? 'Silver'
      : 'Bronze'
    : 'Bronze';

  const xpRemaining = Math.max(0, nextLevelXp - (profile?.xp ?? 0));

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    claimDailyReward,
    claiming,
    claimResult,
    canClaimDaily,
    timeUntilNextClaim,
    nextLevelXp,
    progressToNext,
    rankTier,
    nextRankTier,
    nextRankLevel,
    rewardTier,
    xpRemaining,
    showLevelUp,
    clearClaimResult,
  };
}

"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Gift, Zap, Flame, Clock, CheckCircle, Sparkles, Loader2,
  Star, Diamond, Shield, ChevronRight, Lock
} from "lucide-react";
import { useSound } from "@/lib/hooks/useSound";

interface DailyRewardCardProps {
  canClaim: boolean;
  claiming: boolean;
  streak: number;
  longestStreak?: number;
  timeUntilNext: number;
  onClaim: () => Promise<void>;
  claimResult: {
    xp: number; coins: number; streak: number; streakBonus: number; leveledUp?: boolean;
  } | null;
  onClearResult: () => void;
  rewardTier?: string;
}

const dailyMilestones = [
  { day: 1, xp: 50, coins: 5, reward: "Bronze Chest" },
  { day: 2, xp: 75, coins: 10, reward: "Silver Chest" },
  { day: 3, xp: 100, coins: 15, reward: "Gold Chest" },
  { day: 4, xp: 125, coins: 20, reward: "Epic Booster" },
  { day: 5, xp: 150, coins: 25, reward: "Legendary Booster" },
  { day: 6, xp: 200, coins: 30, reward: "Cosmetics Key" },
  { day: 7, xp: 500, coins: 100, reward: "Elite Crest + rare Badge" },
];

export function DailyRewardCard({
  canClaim, claiming, streak, longestStreak = 0, timeUntilNext, onClaim,
  claimResult, onClearResult, rewardTier = 'Bronze',
}: DailyRewardCardProps) {
  const { playRewardClaim, playCoinReward } = useSound();
  const [timeLeft, setTimeLeft] = useState(timeUntilNext);
  const [showResult, setShowResult] = useState(false);
  const hasClaimedRef = useRef(false);

  useEffect(() => { setTimeLeft(timeUntilNext); }, [timeUntilNext]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1000)), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    if (claimResult && !hasClaimedRef.current) {
      hasClaimedRef.current = true;
      setShowResult(true);
      playRewardClaim();
      setTimeout(() => playCoinReward(), 200);
      const timer = setTimeout(() => {
        setShowResult(false);
        onClearResult();
      }, 6000);
      return () => clearTimeout(timer);
    }
    if (!claimResult) {
      hasClaimedRef.current = false;
      setShowResult(false);
    }
  }, [claimResult, onClearResult, playRewardClaim, playCoinReward]);

  const hours = Math.floor(timeLeft / 3600000);
  const minutes = Math.floor((timeLeft % 3600000) / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const canClaimNow = canClaim && !claiming;

  // Visual position in the 7 day cycle (1-indexed, loop back to 1 after 7)
  const currentCycleDay = ((streak) % 7) || 7;

  return (
    <Card className="relative overflow-hidden group border-primary/20 bg-gradient-to-br from-surface to-[#0e0e1b] shadow-xl !p-5" hover={false}>
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-pink/5 opacity-80 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-accent-pink/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary-light animate-float" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Daily Login Rewards</h3>
              <p className="text-[10px] text-muted-light">Claim premium daily bundles to boost your XP rank</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-orange/10 border border-accent-orange/20">
            <Flame className="w-3.5 h-3.5 text-accent-orange animate-pulse" />
            <span className="text-xs font-black text-accent-orange tabular-nums">{streak}</span>
            <span className="text-[9px] uppercase tracking-wider text-muted font-bold">Days</span>
          </div>
        </div>

        {/* 7-Day rewards progression track */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {dailyMilestones.map((m) => {
            const isCompleted = m.day < currentCycleDay || (m.day === currentCycleDay && !canClaimNow && streak > 0);
            const isCurrent = m.day === currentCycleDay && canClaimNow;
            const isUpcoming = m.day > currentCycleDay || (m.day === currentCycleDay && !canClaimNow && streak === 0);

            return (
              <div
                key={m.day}
                className={`relative p-2.5 rounded-xl border text-center flex flex-col items-center justify-between min-h-[85px] transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary/10 border-primary/30 opacity-60"
                    : isCurrent
                    ? "bg-gradient-to-b from-primary/20 to-accent-pink/15 border-primary shadow-[0_0_15px_rgba(139,92,246,0.25)] scale-[1.04]"
                    : "bg-white/[0.01] border-white/5 opacity-80"
                }`}
              >
                {/* Visual day identifier */}
                <div className="text-[9px] font-black uppercase text-muted">D{m.day}</div>

                {/* Reward preview icon */}
                <div className="my-1.5 select-none">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-accent-green" />
                  ) : m.day === 7 ? (
                    <Diamond className={`w-5 h-5 text-yellow-400 ${isCurrent ? "animate-bounce" : "animate-float"}`} />
                  ) : (
                    <Zap className={`w-5 h-5 ${isCurrent ? "text-primary-light" : "text-muted-light"}`} />
                  )}
                </div>

                {/* Reward value label */}
                <div className="space-y-0.5">
                  <div className={`text-[10px] font-black ${isCurrent ? "text-primary-light" : "text-white"}`}>
                    +{m.xp} XP
                  </div>
                  <div className="text-[8px] text-muted-light">
                    +{m.coins} TX
                  </div>
                </div>

                {/* Glowing pulsing dot for active claim state */}
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-pink border border-white animate-ping" />
                )}
              </div>
            );
          })}
        </div>

        {/* Claim Experience Overlay / Cooldown view */}
        <AnimatePresence mode="wait">
          {showResult && claimResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-2xl bg-gradient-to-r from-primary/15 via-accent-pink/10 to-primary/10 border border-primary/30 p-4 text-center space-y-3 relative overflow-hidden"
            >
              {/* Confetti or spark glow backlights */}
              <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />

              <div className="flex justify-center gap-1">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-spin" />
                <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 uppercase tracking-widest">
                  Daily Bundle Acquired!
                </h4>
              </div>

              <div className="flex justify-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/20 border border-primary/30">
                  <Zap className="w-4 h-4 text-primary-light" />
                  <span className="text-xs font-black text-white">+{claimResult.xp} XP</span>
                  {claimResult.streakBonus > 0 && (
                    <span className="text-[9px] text-muted-light">(+{claimResult.streakBonus} Streak Bonus)</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-400/10 border border-yellow-400/20">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-black text-yellow-400">+{claimResult.coins} Coins</span>
                </div>
              </div>

              {/* Autoclose countdown progress indicator */}
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent-pink rounded-full"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 6, ease: "linear" }}
                />
              </div>
            </motion.div>
          ) : canClaimNow ? (
            <motion.div
              key="claim"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Button
                onClick={onClaim}
                disabled={claiming}
                size="lg"
                className="w-full font-black text-xs uppercase tracking-wider rounded-xl shadow-lg animate-pulse-glow"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary), var(--color-accent-pink))`,
                  color: "#ffffff",
                  boxShadow: `0 4px 20px rgba(139, 92, 246, 0.4)`,
                }}
              >
                {claiming ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching Daily Bundle...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <Gift className="w-4 h-4" /> Claim Day {currentCycleDay} Rewards
                  </span>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="cooldown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl border border-white/5 bg-white/[0.01]"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted" />
                <span className="text-xs text-muted-light">Next daily reward available in:</span>
              </div>

              <div className="flex gap-2">
                {[
                  { val: hours, unit: "H" },
                  { val: minutes, unit: "M" },
                  { val: seconds, unit: "S" },
                ].map((u, i) => (
                  <div key={i} className="flex items-center gap-0.5 bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                    <span className="text-xs font-black text-white tabular-nums">{String(u.val).padStart(2, "0")}</span>
                    <span className="text-[8px] text-muted font-bold">{u.unit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Gift, Zap, Flame, Clock, CheckCircle, Sparkles, Loader2,
  Star, Diamond, Shield, ChevronRight,
} from "lucide-react";

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

const tierConfig = {
  Bronze:  { color: '#cd7f32', glow: 'rgba(205,127,50,0.2)', gradient: 'from-amber-800/20 via-amber-700/10 to-amber-600/5', streakMin: 0 },
  Silver:  { color: '#c0c0c0', glow: 'rgba(192,192,192,0.25)', gradient: 'from-slate-400/20 via-slate-300/10 to-slate-200/5', streakMin: 7 },
  Gold:    { color: '#ffd700', glow: 'rgba(255,215,0,0.3)', gradient: 'from-yellow-500/20 via-yellow-400/10 to-yellow-300/5', streakMin: 14 },
  Diamond: { color: '#b9f2ff', glow: 'rgba(185,242,255,0.3)', gradient: 'from-sky-400/20 via-sky-300/10 to-sky-200/5', streakMin: 30 },
};

const coinValues: Record<string, number> = { Bronze: 10, Silver: 15, Gold: 20, Diamond: 30 };
const baseXp = 50;

export function DailyRewardCard({
  canClaim, claiming, streak, longestStreak = 0, timeUntilNext, onClaim,
  claimResult, onClearResult, rewardTier = 'Bronze',
}: DailyRewardCardProps) {
  const [timeLeft, setTimeLeft] = useState(timeUntilNext);
  const [showResult, setShowResult] = useState(false);
  const hasClaimedRef = useRef(false);
  const tier = tierConfig[rewardTier as keyof typeof tierConfig] || tierConfig.Bronze;
  const streakBonus = Math.min(streak * 5, 100);
  const totalXp = baseXp + streakBonus;
  const coinReward = coinValues[rewardTier as keyof typeof coinValues] || 10;

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
      const timer = setTimeout(() => {
        setShowResult(false);
        onClearResult();
      }, 5000);
      return () => clearTimeout(timer);
    }
    if (!claimResult) {
      hasClaimedRef.current = false;
      setShowResult(false);
    }
  }, [claimResult, onClearResult]);

  const hours = Math.floor(timeLeft / 3600000);
  const minutes = Math.floor((timeLeft % 3600000) / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const canClaimNow = canClaim && !claiming;

  const StreakIcon = rewardTier === 'Diamond' ? Diamond
    : rewardTier === 'Gold' ? Star
    : rewardTier === 'Silver' ? Shield
    : Flame;

  return (
    <Card className="relative overflow-hidden group" hover={false}>
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-80`} />
      <div
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl transition-all duration-1000 group-hover:scale-110"
        style={{ background: tier.glow }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-60"
        style={{ background: tier.glow }}
      />

      {/* Corner ornament */}
      <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 -mr-10 -mt-10 rotate-45 opacity-10"
          style={{ backgroundColor: tier.color }} />
      </div>

      <div className="relative z-10 p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative"
              animate={canClaimNow ? { scale: [1, 1.05, 1], rotate: [0, -3, 3, 0] } : {}}
              transition={{ repeat: canClaimNow ? Infinity : 0, duration: 2 }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: `${tier.color}15`,
                  borderColor: `${tier.color}30`,
                  borderWidth: 1,
                }}
              >
                <Gift size={22} style={{ color: tier.color }} />
              </div>
              {canClaimNow && (
                <motion.div
                  className="absolute -inset-1 rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ border: `2px solid ${tier.color}`, boxShadow: `0 0 12px ${tier.glow}` }}
                />
              )}
            </motion.div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                Daily Reward
                {claimResult && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                  >
                    Claimed!
                  </motion.span>
                )}
              </h3>
              <p className="text-[10px] text-muted">Login every day for bigger bonuses</p>
            </div>
          </div>

          {/* Streak badge */}
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: `${tier.color}15`,
              borderColor: `${tier.color}25`,
              borderWidth: 1,
            }}
            animate={streak >= 7 ? { scale: [1, 1.03, 1] } : {}}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <Flame size={14} style={{ color: tier.color }} />
            <span className="text-sm font-bold tabular-nums" style={{ color: tier.color }}>{streak}</span>
            <span className="text-[10px] text-muted">day{streak !== 1 ? 's' : ''}</span>
          </motion.div>
        </div>

        {/* Reward preview chips */}
        <AnimatePresence mode="wait">
          {showResult && claimResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-4"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `${tier.color}20`,
                    borderColor: `${tier.color}30`,
                    borderWidth: 1,
                  }}
                >
                  <CheckCircle size={30} style={{ color: tier.color }} />
                </motion.div>
              </div>

              <h4 className="text-center text-base font-bold mb-3" style={{ color: tier.color }}>
                Reward Claimed!
              </h4>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl"
                  style={{ background: `${tier.color}12` }}
                >
                  <Zap size={16} className="text-primary-light" />
                  <span className="font-bold text-sm" style={{ color: tier.color }}>+{claimResult.xp}</span>
                  <span className="text-[10px] text-muted">XP</span>
                  {claimResult.streakBonus > 0 && (
                    <span className="text-[9px] text-muted">(bonus +{claimResult.streakBonus})</span>
                  )}
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl"
                  style={{ background: `${tier.color}12` }}
                >
                  <Sparkles size={16} style={{ color: tier.color }} />
                  <span className="font-bold text-sm" style={{ color: tier.color }}>+{claimResult.coins}</span>
                  <span className="text-[10px] text-muted">TX</span>
                </motion.div>
                {claimResult.leveledUp && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-green/15 text-accent-green text-sm font-bold"
                  >
                    <Star size={16} /> LEVEL UP!
                  </motion.div>
                )}
              </div>

              {/* Progress bar countdown */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-0.5 rounded-full mt-4 mx-auto"
                style={{ backgroundColor: tier.color, maxWidth: '80%' }}
              />
            </motion.div>
          ) : canClaimNow ? (
            <motion.div
              key="claim"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Reward preview */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { icon: Zap, label: 'Base XP', value: `+${baseXp}`, sub: 'Daily' },
                  { icon: Flame, label: 'Streak', value: `+${streakBonus}`, sub: `${streak} day${streak !== 1 ? 's' : ''}` },
                  { icon: Sparkles, label: 'Coins', value: `+${coinReward}`, sub: rewardTier === 'Bronze' ? 'TX Coins' : `${rewardTier} Tier` },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-center p-2 rounded-xl"
                    style={{ background: `${tier.color}08` }}
                  >
                    <item.icon size={16} className="mx-auto mb-1" style={{ color: tier.color }} />
                    <div className="text-sm font-bold tabular-nums" style={{ color: tier.color }}>{item.value}</div>
                    <div className="text-[9px] text-muted">{item.sub}</div>
                  </motion.div>
                ))}
              </div>

              {/* Total XP display */}
              <div className="flex items-center justify-center gap-1.5 mb-3 text-xs text-muted">
                <Zap size={12} className="text-primary-light" />
                <span className="font-medium text-primary-light">+{baseXp + streakBonus} XP total</span>
              </div>

              {/* Next tier info */}
              {streak < 30 && (
                <div className="text-center mb-3">
                  <div className="text-[9px] text-muted">
                    {streak < 7
                      ? `${7 - streak} more days to Silver tier`
                      : streak < 14
                        ? `${14 - streak} more days to Gold tier`
                        : `${30 - streak} more days to Diamond tier`
                    }
                  </div>
                </div>
              )}

              <Button
                onClick={onClaim}
                disabled={claiming}
                size="lg"
                className="w-full font-bold shadow-lg text-sm"
                style={{
                  background: `linear-gradient(135deg, ${tier.color}, ${tier.color}dd)`,
                  color: '#000',
                  boxShadow: `0 4px 20px ${tier.glow}`,
                }}
              >
                {claiming ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Claiming...</>
                ) : (
                  <><Gift className="w-4 h-4 mr-2" /> Claim Daily Reward</>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="cooldown"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-2"
            >
              {/* Streak info */}
              {streak > 0 && (
                <div className="flex items-center justify-center gap-2 mb-3 text-xs">
                  <Flame size={14} style={{ color: tier.color }} />
                  <span style={{ color: tier.color }} className="font-semibold">{streak}-day streak</span>
                  {longestStreak > streak && (
                    <span className="text-muted">· Best: {longestStreak}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted" />
                <span className="text-sm text-muted">Next reward in</span>
              </div>

              <div className="flex items-center justify-center gap-3 mb-3">
                {[
                  { value: hours, label: 'h' },
                  { value: minutes, label: 'm' },
                  { value: seconds, label: 's' },
                ].map((unit, i) => (
                  <motion.div
                    key={unit.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-center"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${tier.color}08`,
                        borderColor: `${tier.color}15`,
                        borderWidth: 1,
                      }}
                    >
                      <span className="text-xl font-black tabular-nums" style={{ color: tier.color }}>
                        {String(unit.value).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="text-[9px] text-muted mt-0.5 uppercase">{unit.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-center text-[10px] text-muted">
                <StreakIcon size={10} className="mr-1" style={{ color: tier.color }} />
                Next tier: {streak < 7 ? 'Silver (7 days)' : streak < 14 ? 'Gold (14 days)' : 'Diamond (30 days)'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

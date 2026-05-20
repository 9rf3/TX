"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Zap, Sparkles, Award, Medal, Trophy, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { RARITY_COLORS, RARITY_GLOWS } from "@/lib/types";
import type { AchievementDisplay, UserAchievementDisplay } from "@/lib/types";

interface AchievementsGridProps {
  catalog: AchievementDisplay[];
  unlocked: UserAchievementDisplay[];
}

const rarityIcons: Record<string, typeof Trophy> = {
  common: Medal, rare: Award, epic: Trophy, legendary: Crown,
};

export function AchievementsGrid({ catalog, unlocked }: AchievementsGridProps) {
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);
  const unlockedIds = new Set(unlocked.map(u => u.achievement_id));

  useEffect(() => {
    if (unlocked.length > 0) {
      const last = unlocked[unlocked.length - 1];
      setJustUnlocked(last.achievement_id);
      const t = setTimeout(() => setJustUnlocked(null), 2000);
      return () => clearTimeout(t);
    }
  }, [unlocked.length]);

  if (catalog.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <Award className="w-12 h-12 text-muted/30 mx-auto mb-3" />
        <p className="text-muted-light">No achievements available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Award className="w-5 h-5 text-accent-orange" />
          Achievements
        </h2>
        <span className="text-xs text-muted bg-white/5 px-3 py-1 rounded-full">
          {unlocked.length}/{catalog.length}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {catalog.map((achievement, i) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const ua = unlocked.find(u => u.achievement_id === achievement.id);
          const rarity = achievement.rarity || 'common';
          const Icon = rarityIcons[rarity] || Medal;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{
                opacity: 1, scale: 1, y: 0,
                transition: { delay: i * 0.03, duration: 0.3 },
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={cn(
                "relative rounded-xl border p-4 text-center transition-all duration-300 overflow-hidden group",
                isUnlocked
                  ? RARITY_COLORS[rarity] || 'border-primary/20 bg-primary/5'
                  : 'border-white/5 bg-white/[0.02] opacity-50',
              )}
              style={{
                boxShadow: isUnlocked ? RARITY_GLOWS[rarity] || 'none' : 'none',
              }}
            >
              {/* Rarity shimmer for unlocked */}
              {isUnlocked && (
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}

              {/* Just unlocked burst */}
              <AnimatePresence>
                {justUnlocked === achievement.id && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <Sparkles className="w-full h-full text-yellow-400" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Icon */}
              <div className="relative mb-2 flex items-center justify-center">
                {isUnlocked ? (
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, currentColor15, currentColor05)`,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-muted" />
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="text-xs font-semibold leading-tight mb-1 line-clamp-1">
                {achievement.title}
              </div>
              <div className="text-[9px] text-muted leading-tight line-clamp-2 mb-2">
                {achievement.description}
              </div>

              {/* XP Reward */}
              <div className="flex items-center justify-center gap-1 text-[9px]">
                <Zap className="w-2.5 h-2.5 text-primary-light" />
                <span className="font-medium text-primary-light">
                  +{achievement.xp_reward} XP
                </span>
              </div>

              {/* Rarity label */}
              <div
                className={cn(
                  "text-[8px] font-bold uppercase tracking-wider mt-2",
                  rarity === 'legendary' && 'animate-pulse',
                )}
              >
                {rarity}
              </div>

              {/* Unlock date */}
              {isUnlocked && ua && (
                <div className="text-[8px] text-accent-green mt-1">
                  {new Date(ua.unlocked_at).toLocaleDateString()}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

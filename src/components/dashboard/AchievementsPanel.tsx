"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Trophy, ChevronRight, Lock, Sparkles, Zap, Award } from "lucide-react";
import { useSound } from "@/lib/hooks/useSound";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  coins_reward: number;
  rarity: string;
}

interface UnlockedAchievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement: Achievement;
}

export function AchievementsPanel() {
  const { playClick } = useSound();
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { getAchievements } = await import('@/actions/gamification');
        const result = await getAchievements();
        setUnlocked(result.unlocked as unknown as UnlockedAchievement[]);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const rarityColors: Record<string, { border: string; bg: string; text: string; shadow: string }> = {
    common: {
      border: 'border-slate-500/20 group-hover:border-slate-500/40',
      bg: 'from-slate-900/40 to-slate-950/60',
      text: 'text-slate-400',
      shadow: 'group-hover:shadow-[0_0_10px_rgba(148,163,184,0.1)]'
    },
    rare: {
      border: 'border-secondary/20 group-hover:border-secondary/40',
      bg: 'from-cyan-950/20 to-slate-950/60',
      text: 'text-cyan-400',
      shadow: 'group-hover:shadow-[0_0_12px_rgba(6,182,212,0.15)]'
    },
    epic: {
      border: 'border-accent-pink/20 group-hover:border-accent-pink/40',
      bg: 'from-pink-950/20 to-slate-950/60',
      text: 'text-accent-pink',
      shadow: 'group-hover:shadow-[0_0_15px_rgba(236,72,153,0.2)]'
    },
    legendary: {
      border: 'border-yellow-500/30 group-hover:border-yellow-500/50',
      bg: 'from-yellow-950/25 to-slate-950/60',
      text: 'text-yellow-400',
      shadow: 'group-hover:shadow-[0_0_20px_rgba(250,204,21,0.25)]'
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Award className="w-5 h-5 text-primary-light" />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wider">Hall of Achievements</h2>
            <p className="text-[10px] text-muted-light">Milestone medals and elite rarity badges</p>
          </div>
        </div>

        <Link
          href="/profile"
          onClick={() => playClick()}
          className="text-xs text-primary-light hover:text-white transition-colors flex items-center gap-0.5 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <Card className="p-6 text-center text-muted text-sm bg-surface">Loading medals...</Card>
      ) : unlocked.length === 0 ? (
        <Card className="relative overflow-hidden border-white/5 bg-white/[0.01] !p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="relative z-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-6 h-6 text-primary-light animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Medal Case is Empty</h3>
              <p className="text-xs text-muted-light max-w-xs mx-auto">Complete courses, maintain streaks, and win PvP speedruns to display medals.</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {unlocked.slice(0, 6).map(ua => {
            const styles = rarityColors[ua.achievement.rarity] || rarityColors.common;

            return (
              <motion.div
                key={ua.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.04, y: -2 }}
                className="group cursor-pointer"
              >
                <div className={`rounded-xl border p-3 text-center bg-gradient-to-b transition-all duration-300 ${styles.border} ${styles.bg} ${styles.shadow}`}>
                  <div className="text-2xl mb-1.5 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] animate-float">
                    {ua.achievement.icon}
                  </div>
                  <div className="text-[10px] font-black leading-snug truncate text-white uppercase group-hover:text-primary-light transition-colors">
                    {ua.achievement.title}
                  </div>
                  <div className={`text-[8px] font-bold tracking-widest uppercase mt-0.5 ${styles.text}`}>
                    {ua.achievement.rarity}
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 mt-2.5 bg-black/20 border border-white/5 py-1 rounded-md">
                    <Zap className="w-3 h-3 text-primary-light" />
                    <span className="text-[9px] font-black text-white">+{ua.achievement.xp_reward} XP</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

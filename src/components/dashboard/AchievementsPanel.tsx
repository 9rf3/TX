"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, ChevronRight, Lock, Sparkles, Zap } from "lucide-react";

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

  const rarityColors: Record<string, string> = {
    common: 'text-slate-400 border-slate-400/30 bg-slate-400/10',
    rare: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    epic: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    legendary: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" /> Recent Achievements
        </h2>
        <Link href="/profile" className="text-sm text-primary-light hover:text-primary flex items-center gap-1 transition-colors">
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <Card className="p-6 text-center text-muted text-sm">Loading achievements...</Card>
      ) : unlocked.length === 0 ? (
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="relative z-10 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-primary-light" />
            </div>
            <h3 className="font-semibold text-sm mb-1">No achievements yet</h3>
            <p className="text-xs text-muted">Complete lessons and maintain streaks to unlock achievements.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {unlocked.slice(0, 6).map(ua => (
            <motion.div
              key={ua.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-xl border p-3 text-center ${rarityColors[ua.achievement.rarity] || rarityColors.common}`}
            >
              <div className="text-lg mb-1">{ua.achievement.icon}</div>
              <div className="text-[10px] font-semibold leading-tight truncate">{ua.achievement.title}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Zap className="w-2.5 h-2.5" />
                <span className="text-[9px] font-medium">+{ua.achievement.xp_reward} XP</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

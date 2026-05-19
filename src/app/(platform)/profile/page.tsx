"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import { RankBadge } from "@/components/dashboard/RankBadge";
import { Progress } from "@/components/ui/Progress";
import { Zap, Trophy, Flame, Award, Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useGamificationEngine } from "@/lib/hooks/useGamificationEngine";

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

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };
const rarityColors: Record<string, string> = {
  common: 'border-slate-400/20 bg-slate-400/5 text-slate-300',
  rare: 'border-blue-400/20 bg-blue-400/5 text-blue-300',
  epic: 'border-purple-400/20 bg-purple-400/5 text-purple-300',
  legendary: 'border-yellow-400/20 bg-yellow-400/5 text-yellow-300',
};

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const {
    profile: gProfile, rankTier, nextLevelXp,
  } = useGamificationEngine();
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>([]);
  const [catalog, setCatalog] = useState<Achievement[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { getAchievements } = await import('@/actions/gamification');
        const result = await getAchievements();
        setUnlocked(result.unlocked as unknown as UnlockedAchievement[]);
        setCatalog(result.catalog as unknown as Achievement[]);
      } catch { /* silent */ }
    };
    load();
  }, []);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || "Student";
  const username = profile?.username || user?.email?.split('@')[0] || "student";
  const xp = gProfile?.xp ?? 0;
  const level = gProfile?.level ?? 1;
  const streak = gProfile?.current_streak ?? 0;
  const txCoins = gProfile?.tx_coins ?? 0;
  const totalXpEarned = gProfile?.total_xp_earned ?? 0;
  const rank = gProfile?.rank ?? 0;
  const xpForNext = nextLevelXp;

  const unlockedIds = new Set(unlocked.map(u => u.achievement_id));
  const lockedCount = catalog.filter(a => !unlockedIds.has(a.id)).length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Profile header */}
      <motion.div variants={item}>
        <Card hover={false} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
          <div className="relative flex flex-col md:flex-row items-center gap-6 p-2">
            <div className="relative">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-surface" />
              ) : (
                <Avatar name={displayName} size="xl" />
              )}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white border-2 border-surface">
                {level}
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <p className="text-muted-light">@{username}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                <Badge variant="primary" size="md"><Trophy className="w-3 h-3" /> {rankTier}</Badge>
                {streak >= 7 && <Badge variant="warning" size="md"><Flame className="w-3 h-3" /> {streak}-day streak</Badge>}
                <Badge variant="info" size="md"><Zap className="w-3 h-3" /> {totalXpEarned.toLocaleString()} total XP</Badge>
              </div>
            </div>
            <RankBadge tier={rankTier} level={level} size="lg" />
          </div>
        </Card>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Zap className="w-5 h-5 text-primary" />, label: "Current XP", value: xp.toLocaleString(), sub: `Lvl ${level}` },
          { icon: <Trophy className="w-5 h-5 text-accent-orange" />, label: "Global Rank", value: rank > 0 ? `#${rank}` : "--", sub: rankTier },
          { icon: <Flame className="w-5 h-5 text-accent-orange" />, label: "Streak", value: `${streak} days`, sub: streak >= 7 ? "On fire!" : "Keep going" },
          { icon: <Sparkles className="w-5 h-5 text-yellow-400" />, label: "TX Coins", value: txCoins.toLocaleString(), sub: "Platform currency" },
        ].map((stat) => (
          <Card key={stat.label} className="text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-white/5 flex items-center justify-center">{stat.icon}</div>
            <div className="text-xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted">{stat.label}</div>
            <div className="text-[10px] text-muted-light">{stat.sub}</div>
          </Card>
        ))}
      </motion.div>

      {/* XP progress */}
      <motion.div variants={item}>
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Level {level} → {level + 1}</span>
            <span className="text-xs text-muted">{xp.toLocaleString()} / {xpForNext.toLocaleString()} XP</span>
          </div>
          <Progress value={xp} max={xpForNext} size="lg" color="primary" showLabel />
          <p className="text-xs text-muted mt-2">
            {Math.max(0, xpForNext - xp).toLocaleString()} XP needed to reach Level {level + 1}
          </p>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={item}>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-accent-orange" /> Achievements
          <span className="text-xs font-normal text-muted bg-white/5 px-2 py-0.5 rounded-full">
            {unlocked.length}/{catalog.length} unlocked
          </span>
        </h2>
        {catalog.length === 0 ? (
          <Card hover={false} className="text-center py-12">
            <Award className="w-10 h-10 text-muted/30 mx-auto mb-3" />
            <p className="text-muted-light">No achievements available yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {catalog.map((achievement) => {
              const isUnlocked = unlockedIds.has(achievement.id);
              const ua = unlocked.find(u => u.achievement_id === achievement.id);

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-xl border p-4 text-center transition-all duration-300 ${
                    isUnlocked
                      ? rarityColors[achievement.rarity] || 'border-primary/20 bg-primary/5'
                      : 'border-white/5 bg-white/[0.02] opacity-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{isUnlocked ? achievement.icon : <Lock className="w-6 h-6 mx-auto text-muted" />}</div>
                  <div className="text-xs font-semibold leading-tight mb-1">{achievement.title}</div>
                  <div className="text-[9px] text-muted leading-tight mb-2 line-clamp-2">{achievement.description}</div>
                  <div className="flex items-center justify-center gap-1 text-[9px]">
                    <Zap className="w-2.5 h-2.5 text-primary-light" />
                    <span className="font-medium text-primary-light">+{achievement.xp_reward} XP</span>
                  </div>
                  {isUnlocked && ua && (
                    <div className="text-[8px] text-accent-green mt-2">
                      Unlocked {new Date(ua.unlocked_at).toLocaleDateString()}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

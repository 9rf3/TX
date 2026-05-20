"use client";
import { motion } from "framer-motion";
import {
  Crown, Diamond, Medal, Shield, Star, Zap, Flame,
  MapPin, GraduationCap, Sparkles, Sword, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GamificationProfile, RankTierConfig } from "@/lib/types";
import { getRankTier, getNextRankTier, RANK_TIERS } from "@/lib/types";

const tierIcons: Record<string, typeof Crown> = {
  Bronze: Shield, Silver: Shield, Gold: Medal,
  Platinum: Diamond, Diamond: Diamond, Elite: Crown,
};

interface ProfileHeroProps {
  profile: GamificationProfile | null;
  displayName: string;
  username: string;
}

export function ProfileHero({ profile, displayName, username }: ProfileHeroProps) {
  const level = profile?.level ?? 1;
  const tier = getRankTier(level);
  const nextTier = getNextRankTier(level);
  const Icon = tierIcons[tier.name] || Shield;

  const stats = [
    { icon: Zap, label: "Level", value: String(level), color: "text-primary" },
    { icon: Star, label: "Rank", value: profile?.rank ? `#${profile.rank}` : "--", color: "text-accent-orange" },
    { icon: Flame, label: "Streak", value: `${profile?.current_streak ?? 0}d`, color: "text-accent-orange" },
    { icon: Sparkles, label: "TX Coins", value: (profile?.tx_coins ?? 0).toLocaleString(), color: "text-yellow-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl border border-border bg-surface"
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `linear-gradient(135deg, ${tier.color}22, transparent 60%, ${tier.color}11)`,
        }}
      />
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-glow"
        style={{ background: `${tier.color}15` }}
      />

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with frame */}
          <div className="relative shrink-0">
            <motion.div
              className="relative w-28 h-28 rounded-2xl overflow-hidden"
              style={{
                border: `3px solid ${tier.color}`,
                boxShadow: `0 0 30px ${tier.color}40, inset 0 0 30px ${tier.color}20`,
              }}
              animate={{ boxShadow: [`0 0 20px ${tier.color}30`, `0 0 40px ${tier.color}60`, `0 0 20px ${tier.color}30`] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {profile?.selected_avatar || profile?.avatar_url ? (
                <img
                  src={profile.selected_avatar || profile.avatar_url || ""}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-4xl font-bold text-white/60">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Level badge on avatar */}
              <div
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-surface"
                style={{
                  background: `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)`,
                  boxShadow: `0 0 10px ${tier.color}60`,
                }}
              >
                {level}
              </div>
            </motion.div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {displayName}
              </h1>
              <p className="text-muted-light text-sm">@{username}</p>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p className="text-sm text-muted-light/80 max-w-lg leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Demographics */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-muted-light">
              {profile?.country && (
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
                  <MapPin className="w-3 h-3" /> {profile.country}
                </span>
              )}
              {profile?.university && (
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
                  <GraduationCap className="w-3 h-3" /> {profile.university}
                </span>
              )}
              {profile?.focus_areas && profile.focus_areas.length > 0 && (
                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
                  <Target className="w-3 h-3" /> {profile.focus_areas.join(", ")}
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <motion.div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  background: `${tier.color}20`,
                  border: `1px solid ${tier.color}40`,
                  color: tier.color,
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Icon className="w-3.5 h-3.5" />
                {tier.name} Tier
              </motion.div>
              {nextTier && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted bg-white/5 border border-border">
                  Next: {nextTier.name}
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted bg-white/5 border border-border">
                <Sword className="w-3 h-3" />
                {profile?.total_xp_earned?.toLocaleString() || 0} Total XP
              </div>
            </div>
          </div>

          {/* Large rank badge */}
          <motion.div
            className="hidden md:flex flex-col items-center gap-1 shrink-0"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${tier.color}30, ${tier.color}10)`,
                border: `2px solid ${tier.color}50`,
                boxShadow: `0 0 30px ${tier.color}30`,
              }}
            >
              <Icon className="w-10 h-10" style={{ color: tier.color, filter: `drop-shadow(0 0 8px ${tier.color}60)` }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tier.color }}>
              {tier.name}
            </span>
            <span className="text-[9px] text-muted-light">Level {level}</span>
          </motion.div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              className="flex items-center gap-3 rounded-xl bg-white/5 border border-border/50 p-3"
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center bg-white/5", stat.color)}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <div className={cn("text-lg font-bold", stat.color)}>{stat.value}</div>
                <div className="text-[10px] text-muted uppercase tracking-wider">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

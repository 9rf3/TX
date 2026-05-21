"use client";
import { memo } from "react";
import { Calendar, Crown, Diamond, Flame, GraduationCap, MapPin, Medal, Shield, Sparkles, Star, Swords, Target, Zap } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { GamePanel, Ring } from "@/components/ui/GamePanel";
import { cn, formatNumber } from "@/lib/utils";
import { getRankTier, getNextRankTier } from "@/lib/types";
import type { GamificationProfile } from "@/lib/types";

const tierIcons: Record<string, typeof Crown> = {
  Bronze: Shield, Silver: Shield, Gold: Medal,
  Platinum: Diamond, Diamond: Diamond, Elite: Crown,
};

interface PremiumProfileHeroProps {
  profile: GamificationProfile | null;
  displayName: string;
  username: string;
  userEmail?: string;
}

export const PremiumProfileHero = memo(function PremiumProfileHero({
  profile, displayName, username,
}: PremiumProfileHeroProps) {
  const level = profile?.level ?? 1;
  const tier = getRankTier(level);
  const nextTier = getNextRankTier(level);
  const Icon = tierIcons[tier.name] || Shield;
  const xp = profile?.xp ?? 0;
  const xpForNext = profile?.xpForNext ?? 100;
  const xpProg = Math.min((xp / xpForNext) * 100, 100);

  return (
    <GamePanel glow className="p-0 overflow-hidden">
      <div
        className="relative h-36 sm:h-44"
        style={{
          background: profile?.profile_banner
            ? `url(${profile.profile_banner}) center/cover`
            : `linear-gradient(135deg, ${tier.color}44, ${tier.color}22, #0a0a0f)`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(139,92,246,0.3),transparent_60%),radial-gradient(ellipse_at_80%_80%,rgba(6,182,212,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#10182d] to-transparent" />
      </div>

      <div className="relative px-5 pb-5 md:px-8">
        <div className="relative -mt-14 sm:-mt-16 mb-4 inline-block">
          <div className="absolute -inset-2 rounded-full border border-dashed animate-[spin_24s_linear_infinite]" style={{ borderColor: `${tier.color}55` }} />
          <div
            className="relative rounded-full border-[3px] p-1"
            style={{ borderColor: tier.color, boxShadow: `0 0 40px ${tier.glow}` }}
          >
            <Avatar name={displayName} size="xl" />
          </div>
          <div
            className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-black text-white"
            style={{ borderColor: "#10182d", background: `linear-gradient(135deg, ${tier.color}, #06b6d4)` }}
          >
            {level}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{displayName}</h1>
              <span className="rounded-[8px] border border-secondary/35 bg-secondary/10 px-2 py-1 text-xs font-bold text-secondary">
                @{username}
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-[8px] border px-2 py-1 text-xs font-black"
                style={{ borderColor: `${tier.color}55`, backgroundColor: `${tier.color}22`, color: tier.color, boxShadow: `0 0 18px ${tier.glow}` }}
              >
                <Icon className="w-3.5 h-3.5" /> {tier.name}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-accent-green/15 border border-accent-green/30 px-2 py-0.5 text-[10px] font-black text-accent-green">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-green animate-pulse" />
                Online
              </span>
            </div>

            {profile?.bio && (
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-light">{profile.bio}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-light">
              {profile?.country && (
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.country}</span>
              )}
              {profile?.university && (
                <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {profile.university}</span>
              )}
              {profile?.created_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              )}
              {profile?.focus_areas && profile.focus_areas.length > 0 && (
                <span className="flex items-center gap-1"><Target className="h-3.5 w-3.5" /> {profile.focus_areas.join(", ")}</span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {nextTier && (
                <span
                  className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold"
                  style={{ borderColor: `${nextTier.color}44`, backgroundColor: `${nextTier.color}18`, color: nextTier.color }}
                >
                  <ArrowUpIcon className="w-3 h-3" /> Next: {nextTier.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-white/5 px-2.5 py-1 text-xs font-bold text-muted-light">
                <Swords className="w-3 h-3" /> {formatNumber(profile?.total_xp_earned ?? 0)} Total XP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Ring value={xpProg} label="XP" size={88} />
            <div className="text-right">
              <div className="text-xs font-black uppercase tracking-[0.14em] text-muted-light">Rank progress</div>
              <div className="mt-1 text-lg font-black" style={{ color: tier.color }}>{tier.name}</div>
              {nextTier && (
                <div className="mt-1 text-xs text-muted-light">{Math.round(xpProg)}% to {nextTier.name}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GamePanel>
  );
});

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l7-7 7 7" />
      <path d="M12 5v14" />
    </svg>
  );
}

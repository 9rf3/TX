"use client";
import { motion } from "framer-motion";
import {
  Trophy,
  Award,
  Medal,
  Star,
  ChevronRight,
  Coins,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { rewardTiers, REWARD_STYLE, type RewardTier } from "@/components/tournaments/data";

/* ───────────────────── icon map ───────────────────── */
const TIER_ICONS: Record<RewardTier["badgeVariant"], React.ElementType> = {
  gold: Trophy,
  silver: Medal,
  bronze: Award,
  purple: Star,
  gray: Sparkles,
};

/* ───────────────────── animations ───────────────────── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const cardAnim = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

/* ───────────────────── component ───────────────────── */
export function TournamentRewards() {
  return (
    <motion.section variants={container} initial="hidden" animate="show">
      {/* header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-accent-orange flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wide leading-tight">
              Tournament Rewards
            </h2>
            <p className="text-xs text-muted-light mt-0.5">Compete to win amazing rewards</p>
          </div>
        </div>
        <button className="text-sm text-muted-light hover:text-primary-light transition-colors flex items-center gap-1 group cursor-pointer">
          View All Rewards <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* rewards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {rewardTiers.map((reward) => {
          const style = REWARD_STYLE[reward.badgeVariant];
          const Icon = TIER_ICONS[reward.badgeVariant];

          return (
            <motion.div
              key={reward.id}
              variants={cardAnim}
              className={cn(
                "group relative rounded-2xl border overflow-hidden transition-all duration-300",
                "hover:-translate-y-1",
                style.borderColor,
                style.glowColor
              )}
              style={{ background: style.bgGradient }}
            >
              <div className="p-4 flex flex-col items-center text-center">
                {/* trophy image or icon */}
                {reward.image ? (
                  <div className="relative w-20 h-20 mb-3 group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={reward.image}
                      alt={reward.place}
                      fill
                      className="object-contain drop-shadow-lg"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-300">
                    <Icon className={cn("w-7 h-7", style.iconColor)} />
                  </div>
                )}

                {/* place label */}
                <p className={cn("text-xs font-bold uppercase tracking-wider mb-0.5 leading-tight", style.textColor)}>
                  {reward.place}
                </p>
                <p className="text-sm font-bold text-white mb-3 leading-tight">{reward.title}</p>

                {/* rewards */}
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-center gap-1.5 bg-white/5 rounded-lg py-1.5 px-2 border border-white/5">
                    <Coins className="w-3 h-3 text-accent-orange flex-shrink-0" />
                    <span className="text-xs font-semibold text-white whitespace-nowrap">{reward.coins}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 bg-white/[0.03] rounded-lg py-1.5 px-2 border border-white/5">
                    <Award className="w-3 h-3 flex-shrink-0" style={{ color: style.cssColor }} />
                    <span className={cn("text-xs font-medium whitespace-nowrap", style.textColor)}>{reward.badge} Badge</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

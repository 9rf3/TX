"use client";

import { memo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Gift, Star, Coins, Award, Atom, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface RewardItem {
  icon: ReactNode;
  iconWrapClass: string;
  amount: string;
  description: string;
}

const DEFAULT_REWARDS: RewardItem[] = [
  {
    icon: <Star className="h-4 w-4" fill="currentColor" />,
    iconWrapClass: "border-primary/30 bg-primary/15 text-primary-light",
    amount: "+2,450 XP",
    description: "For completing this course",
  },
  {
    icon: <Coins className="h-4 w-4" />,
    iconWrapClass: "border-accent-orange/30 bg-accent-orange/15 text-accent-orange",
    amount: "+500 TX Coins",
    description: "For completing all lessons",
  },
  {
    icon: <Award className="h-4 w-4" />,
    iconWrapClass: "border-secondary/30 bg-secondary/15 text-secondary",
    amount: "Certificate",
    description: "Showcase your achievement",
  },
  {
    icon: <Atom className="h-4 w-4" />,
    iconWrapClass: "border-accent-pink/30 bg-accent-pink/15 text-accent-pink",
    amount: "React Developer Badge",
    description: "Add to your profile",
  },
];

interface WorkspaceRewardsCardProps {
  rewards?: RewardItem[];
}

export const WorkspaceRewardsCard = memo(function WorkspaceRewardsCard({
  rewards = DEFAULT_REWARDS,
}: WorkspaceRewardsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="gp-base overflow-hidden rounded-2xl border border-white/10 bg-[#10182d]/85 p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-accent-orange/25 bg-accent-orange/10 text-accent-orange">
          <Gift className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">
          What You&rsquo;ll Earn
        </h3>
      </div>

      <ul className="space-y-2">
        {rewards.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.06, duration: 0.35 }}
            className="group/reward flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.05]"
          >
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-transform duration-200 group-hover/reward:scale-110",
                item.iconWrapClass
              )}
            >
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white">{item.amount}</div>
              <div className="text-[11px] text-muted-light">{item.description}</div>
            </div>
            <Shield className="h-3.5 w-3.5 text-muted/60 opacity-0 transition-opacity group-hover/reward:opacity-100" />
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
});

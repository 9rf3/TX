"use client";

import { memo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Gift, Star, Coins, Award, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { GamePanel, PanelHeader } from "@/components/ui/GamePanel";

interface RewardItem {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
}

interface RewardsPanelProps {
  rewards?: RewardItem[];
}

const DEFAULT_REWARDS: RewardItem[] = [
  {
    icon: <Star className="h-4 w-4" fill="currentColor" />,
    title: "+2,450 XP",
    description: "For completing this course",
    color: "text-primary-light bg-primary/15 border-primary/25",
  },
  {
    icon: <Coins className="h-4 w-4" />,
    title: "+500 TX Coins",
    description: "For completing all lessons",
    color: "text-accent-orange bg-accent-orange/15 border-accent-orange/25",
  },
  {
    icon: <Award className="h-4 w-4" />,
    title: "Certificate",
    description: "Showcase your achievement",
    color: "text-secondary bg-secondary/15 border-secondary/25",
  },
  {
    icon: <Shield className="h-4 w-4" />,
    title: "React Developer Badge",
    description: "Add to your profile",
    color: "text-accent-pink bg-accent-pink/15 border-accent-pink/25",
  },
];

export const RewardsPanel = memo(function RewardsPanel({ rewards }: RewardsPanelProps) {
  const items = rewards ?? DEFAULT_REWARDS;

  return (
    <GamePanel className="p-5">
      <PanelHeader icon={<Gift className="h-4 w-4" />} title="What You'll Earn" />

      <div className="space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
            className="group/reward flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.05]"
          >
            {/* Icon circle */}
            <div
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-transform duration-200 group-hover/reward:scale-110",
                item.color
              )}
            >
              {item.icon}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white">{item.title}</div>
              <div className="text-xs text-muted-light">{item.description}</div>
            </div>

            {/* Hover arrow */}
            <div className="text-muted opacity-0 transition-opacity duration-200 group-hover/reward:opacity-100">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>
    </GamePanel>
  );
});

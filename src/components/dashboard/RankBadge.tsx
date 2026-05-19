"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Crown, Diamond, Medal, Shield, Star, Zap } from "lucide-react";

const tierConfig: Record<string, {
  color: string; gradient: string; glow: string; icon: typeof Zap; label: string;
}> = {
  Bronze:   { color: "#cd7f32", gradient: "from-amber-700/20 to-amber-600/10", glow: "rgba(205,127,50,0.3)", icon: Shield, label: "Bronze" },
  Silver:   { color: "#c0c0c0", gradient: "from-slate-300/20 to-slate-200/10", glow: "rgba(192,192,192,0.3)", icon: Shield, label: "Silver" },
  Gold:     { color: "#ffd700", gradient: "from-yellow-400/20 to-yellow-300/10", glow: "rgba(255,215,0,0.4)", icon: Medal, label: "Gold" },
  Platinum: { color: "#e5e4e2", gradient: "from-cyan-200/20 to-cyan-100/10", glow: "rgba(229,228,226,0.3)", icon: Diamond, label: "Platinum" },
  Diamond:  { color: "#b9f2ff", gradient: "from-sky-300/20 to-sky-200/10", glow: "rgba(185,242,255,0.4)", icon: Diamond, label: "Diamond" },
  Elite:    { color: "#ff6b35", gradient: "from-orange-400/20 to-red-400/10", glow: "rgba(255,107,53,0.5)", icon: Crown, label: "Elite" },
};

interface RankBadgeProps {
  tier: string;
  level: number;
  size?: "sm" | "md" | "lg";
}

export function RankBadge({ tier, level, size = "md" }: RankBadgeProps) {
  const config = tierConfig[tier] || tierConfig.Bronze;
  const Icon = config.icon;
  const dims = size === "sm" ? "w-9 h-9" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  const iconSize = size === "sm" ? 14 : size === "lg" ? 28 : 20;

  return (
    <motion.div
      className={cn("relative flex items-center justify-center rounded-2xl", dims)}
      style={{
        background: `linear-gradient(135deg, ${config.color}22, ${config.color}11)`,
        borderColor: `${config.color}44`,
        borderWidth: 1,
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Icon style={{ color: config.color, filter: `drop-shadow(0 0 6px ${config.glow})` }} size={iconSize} />
      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1 rounded bg-black/80 text-[8px] font-bold uppercase whitespace-nowrap"
        style={{ color: config.color }}>
        {tier}
      </div>
    </motion.div>
  );
}

"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { cn } from "@/lib/utils";
import { Zap, Flame, Target, Trophy, Star, BookOpen, Users, Clock } from "lucide-react";

interface QuestCardProps {
  variant: "daily" | "achievement" | "goal" | "event" | "streak";
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  xpReward?: number;
  icon?: typeof Zap;
  action?: React.ReactNode;
  glow?: boolean;
}

const variantStyles: Record<string, {
  gradient: string; border: string; iconColor: string; accent: string;
}> = {
  daily:       { gradient: "from-accent-orange/10 to-transparent", border: "border-accent-orange/20", iconColor: "text-accent-orange", accent: "accent-orange" },
  achievement: { gradient: "from-primary/10 to-transparent",       border: "border-primary/20",       iconColor: "text-primary-light", accent: "primary" },
  goal:        { gradient: "from-accent-green/10 to-transparent",  border: "border-accent-green/20",  iconColor: "text-accent-green", accent: "green" },
  event:       { gradient: "from-accent-pink/10 to-transparent",   border: "border-accent-pink/20",   iconColor: "text-accent-pink", accent: "pink" },
  streak:      { gradient: "from-secondary/10 to-transparent",     border: "border-secondary/20",     iconColor: "text-secondary",   accent: "cyan" },
};

export function QuestCard({
  variant, title, description, progress, maxProgress,
  xpReward, icon: Icon, action, glow = false,
}: QuestCardProps) {
  const style = variantStyles[variant];
  const Icn = Icon || Target;
  const pct = Math.min((progress / maxProgress) * 100, 100);

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden border transition-all duration-300",
          style.border,
          glow && "shadow-[0_0_20px_rgba(139,92,246,0.15)]",
          "hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]"
        )}
      >
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", style.gradient)} />
        <div className="relative z-10 p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              `bg-${style.accent}/10 border border-${style.accent}/20`
            )}>
              <Icn className={cn("w-5 h-5", style.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate">{title}</h4>
              <p className="text-xs text-muted line-clamp-1 mt-0.5">{description}</p>
              <div className="mt-3">
                <Progress
                  value={progress}
                  max={maxProgress}
                  size="sm"
                  color={style.accent as "primary" | "green" | "orange" | "pink" | "cyan"}
                  showLabel
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 shrink-0">
              {xpReward ? (
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary-light bg-primary/10 px-2 py-1 rounded-full">
                  <Zap className="w-3 h-3" />+{xpReward}
                </div>
              ) : null}
              {action}
            </div>
          </div>
        </div>
        {pct >= 100 && (
          <div className="absolute top-2 right-2">
            <div className="w-5 h-5 rounded-full bg-accent-green/20 border border-accent-green/40 flex items-center justify-center">
              <Star className="w-3 h-3 text-accent-green" />
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

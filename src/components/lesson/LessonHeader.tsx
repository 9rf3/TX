"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { GamePanel, ProgressBar, NeonButton } from "@/components/ui/GamePanel";

interface LessonHeaderProps {
  lessonNumber: string;
  title: string;
  description?: string;
  progressPercent: number;
  xpEarned: number;
  onContinue?: () => void;
}

export const LessonHeader = memo(function LessonHeader({
  lessonNumber,
  title,
  description,
  progressPercent,
  xpEarned,
  onContinue,
}: LessonHeaderProps) {
  return (
    <GamePanel glow className="p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: Title + description */}
        <div className="min-w-0 flex-1 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="mb-1 inline-block rounded-md border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-widest text-primary-light">
              Lesson {lessonNumber}
            </span>
            <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight lg:text-3xl">
              <span className="gradient-text">{lessonNumber}</span>
              <span className="ml-2 text-white">{title}</span>
            </h1>
          </motion.div>

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="max-w-2xl text-sm leading-relaxed text-muted-light"
            >
              {description}
            </motion.p>
          )}
        </div>

        {/* Right: XP badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-accent-orange/25 bg-accent-orange/10 px-4 py-2.5"
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent-orange/20">
            <Star className="h-4 w-4 text-accent-orange" fill="currentColor" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-light">XP Earned</div>
            <div className="text-lg font-black text-accent-orange">+{xpEarned.toLocaleString()} XP</div>
          </div>
        </motion.div>
      </div>

      {/* Progress section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="mt-6 space-y-2"
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-light">
            <Sparkles className="h-3.5 w-3.5 text-primary-light" />
            Your Progress
          </span>
          <span className="text-sm font-black text-white">{progressPercent}%</span>
        </div>
        <ProgressBar value={progressPercent} max={100} />
      </motion.div>

      {/* Continue button */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="mt-5"
      >
        <NeonButton onClick={onContinue} className="w-full sm:w-auto">
          <Sparkles className="h-4 w-4" />
          Continue Learning
        </NeonButton>
      </motion.div>
    </GamePanel>
  );
});

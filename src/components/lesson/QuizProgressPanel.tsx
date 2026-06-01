"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Target, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { GamePanel, PanelHeader, Ring } from "@/components/ui/GamePanel";

interface QuizProgressPanelProps {
  scorePercent: number;
  correctAnswers: number;
  totalQuestions: number;
  streak: number;
  pointsEarned: number;
}

export const QuizProgressPanel = memo(function QuizProgressPanel({
  scorePercent,
  correctAnswers,
  totalQuestions,
  streak,
  pointsEarned,
}: QuizProgressPanelProps) {
  return (
    <GamePanel className="p-5">
      <PanelHeader icon={<Target className="h-4 w-4" />} title="Quiz Progress" />

      {/* Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex justify-center py-4"
      >
        <Ring value={scorePercent} label="Score" size={100} />
      </motion.div>

      {/* Correct answers */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="text-center"
      >
        <motion.span
          key={correctAnswers}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="text-lg font-black text-white"
        >
          {correctAnswers}
        </motion.span>
        <span className="text-lg font-normal text-muted-light"> / {totalQuestions} </span>
        <span className="text-sm text-muted">Correct</span>
      </motion.div>

      {/* Stat badges */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="mt-5 grid grid-cols-2 gap-2.5"
      >
        {/* Streak badge */}
        <div className="rounded-xl border border-accent-orange/20 bg-accent-orange/[0.07] p-3 text-center">
          <div className="mb-1 flex items-center justify-center gap-1">
            <span className="text-lg">🔥</span>
          </div>
          <motion.div
            key={streak}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-xl font-black text-accent-orange"
          >
            {streak}
          </motion.div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-light">
            Streak
          </div>
        </div>

        {/* Points badge */}
        <div className="rounded-xl border border-primary/20 bg-primary/[0.07] p-3 text-center">
          <div className="mb-1 flex items-center justify-center gap-1">
            <Star className="h-4 w-4 text-primary-light" fill="currentColor" />
          </div>
          <motion.div
            key={pointsEarned}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-xl font-black text-primary-light"
          >
            +{pointsEarned}
          </motion.div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-light">
            XP Points
          </div>
        </div>
      </motion.div>
    </GamePanel>
  );
});

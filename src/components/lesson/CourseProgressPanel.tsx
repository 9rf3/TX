"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, Clock } from "lucide-react";
import { GamePanel, PanelHeader, Ring, NeonButton } from "@/components/ui/GamePanel";

interface CourseProgressPanelProps {
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  timeSpent: string;
  totalTime: string;
  onViewCurriculum?: () => void;
}

export const CourseProgressPanel = memo(function CourseProgressPanel({
  progressPercent,
  completedLessons,
  totalLessons,
  timeSpent,
  totalTime,
  onViewCurriculum,
}: CourseProgressPanelProps) {
  return (
    <GamePanel className="p-5">
      <PanelHeader icon={<BarChart3 className="h-4 w-4" />} title="Course Progress" />

      {/* Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex justify-center py-4"
      >
        <Ring value={progressPercent} label="Complete" size={100} />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-2 space-y-3"
      >
        {/* Lessons stat */}
        <div className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15">
            <BookOpen className="h-4 w-4 text-primary-light" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted">Lessons</div>
            <div className="text-sm font-bold text-white">
              {completedLessons}{" "}
              <span className="font-normal text-muted-light">/ {totalLessons}</span>
            </div>
          </div>
        </div>

        {/* Time stat */}
        <div className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary/15">
            <Clock className="h-4 w-4 text-secondary" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted">Time Invested</div>
            <div className="text-sm font-bold text-white">
              {timeSpent}{" "}
              <span className="font-normal text-muted-light">/ {totalTime}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="mt-5"
      >
        <NeonButton onClick={onViewCurriculum} className="w-full">
          View Curriculum
        </NeonButton>
      </motion.div>
    </GamePanel>
  );
});

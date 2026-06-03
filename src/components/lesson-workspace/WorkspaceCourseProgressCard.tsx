"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceCourseProgressCardProps {
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  timeSpent: string;
  totalTime: string;
  onViewCurriculum?: () => void;
}

function CourseProgressRing({ value, size = 140 }: { value: number; size?: number }) {
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference * (1 - Math.max(0, Math.min(value, 100)) / 100);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ws-course-ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="ws-course-ring" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#a78bfa" />
            <stop offset="0.55" stopColor="#ec4899" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-black text-white">{Math.round(value)}%</div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-light">
          Complete
        </div>
      </div>
    </div>
  );
}

export const WorkspaceCourseProgressCard = memo(function WorkspaceCourseProgressCard({
  progressPercent,
  completedLessons,
  totalLessons,
  timeSpent,
  totalTime,
  onViewCurriculum,
}: WorkspaceCourseProgressCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="gp-base overflow-hidden rounded-2xl border border-white/10 bg-[#10182d]/85 p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary-light">
          <BarChart3 className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">
          Course Progress
        </h3>
      </div>

      <div className="flex justify-center py-2">
        <CourseProgressRing value={progressPercent} />
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary-light">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-light">
              Lessons
            </div>
            <div className="text-sm font-bold text-white">
              {completedLessons}{" "}
              <span className="font-normal text-muted-light">/ {totalLessons}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary/15 text-secondary">
            <Clock className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-light">
              Time tracked
            </div>
            <div className="text-sm font-bold text-white">
              {timeSpent}{" "}
              <span className="font-normal text-muted-light">/ {totalTime}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onViewCurriculum}
        className={cn(
          "mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg",
          "h-10 px-3 text-xs font-black uppercase tracking-wider",
          "border border-white/10 bg-white/[0.04] text-muted-light transition-all",
          "hover:border-primary/30 hover:bg-primary/10 hover:text-white"
        )}
      >
        View Curriculum
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
});

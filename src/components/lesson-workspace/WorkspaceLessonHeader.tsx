"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceLessonHeaderProps {
  lessonNumber: string;
  title: string;
  description?: string;
  progressPercent: number;
  xpEarned: number;
  durationLabel?: string;
  onContinue?: () => void;
}

export const WorkspaceLessonHeader = memo(function WorkspaceLessonHeader({
  lessonNumber,
  title,
  description,
  progressPercent,
  xpEarned,
  durationLabel = "12 min",
  onContinue,
}: WorkspaceLessonHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="gp-base relative overflow-hidden rounded-2xl border border-white/10 bg-[#10182d]/85 p-5"
    >
      {/* Top row: pill + title + xp badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-light">
              <BookOpen className="h-3 w-3" />
              Lesson {lessonNumber}
            </span>
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-light">
              {durationLabel}
            </span>
          </div>
          <h1 className="text-xl font-black leading-tight tracking-tight text-white sm:text-2xl">
            <span className="text-primary-light">{lessonNumber}</span>{" "}
            <span>{title}</span>
          </h1>
        </div>

        {/* XP earned badge */}
        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-accent-orange/25 bg-accent-orange/10 px-3 py-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-accent-orange/20">
            <Star className="h-3.5 w-3.5 text-accent-orange" fill="currentColor" />
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-light">
              XP Earned
            </div>
            <div className="text-sm font-black text-accent-orange">+{xpEarned} XP</div>
          </div>
        </div>
      </div>

      {/* Description placeholder lines */}
      <div className="mt-3 space-y-1.5">
        {description ? (
          <p className="text-sm leading-relaxed text-muted-light">{description}</p>
        ) : (
          <>
            <div className="h-2.5 w-[92%] rounded-full bg-white/[0.06]" />
            <div className="h-2.5 w-[78%] rounded-full bg-white/[0.05]" />
            <div className="h-2.5 w-[64%] rounded-full bg-white/[0.04]" />
          </>
        )}
      </div>

      {/* Progress */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-light">
            <Sparkles className="h-3 w-3 text-primary-light" />
            Your Progress
          </span>
          <span className="text-sm font-black text-white">{progressPercent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-primary via-accent-pink to-secondary"
          />
        </div>
      </div>

      {/* Continue button */}
      <button
        type="button"
        onClick={onContinue}
        className={cn(
          "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl",
          "h-11 px-4 text-sm font-black text-white",
          "border border-primary/35 bg-gradient-to-r from-primary to-secondary",
          "shadow-[0_0_22px_rgba(139,92,246,0.25)] transition-all duration-200",
          "hover:brightness-110 hover:shadow-[0_0_28px_rgba(139,92,246,0.4)] active:scale-[0.99]"
        )}
      >
        Continue Learning
        <ArrowRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
});

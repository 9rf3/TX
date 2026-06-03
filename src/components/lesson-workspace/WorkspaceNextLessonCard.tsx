"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { FastForward, ArrowRight } from "lucide-react";

interface WorkspaceNextLessonCardProps {
  lessonNumber: string;
  title: string;
  description?: string;
  durationLabel?: string;
  href?: string;
  onClick?: () => void;
}

export const WorkspaceNextLessonCard = memo(function WorkspaceNextLessonCard({
  lessonNumber,
  title,
  description,
  durationLabel = "9 min",
  href,
  onClick,
}: WorkspaceNextLessonCardProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="gp-base group/next overflow-hidden rounded-2xl border border-white/10 bg-[#10182d]/85 p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-secondary/25 bg-secondary/10 text-secondary">
          <FastForward className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">
          Next Up
        </h3>
      </div>

      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-light">
          Lesson {lessonNumber}
        </span>
        <h4 className="mt-1 text-base font-black text-white">{title}</h4>
      </div>

      {description ? (
        <p className="mt-2 text-[12px] leading-relaxed text-muted-light">
          {description}
        </p>
      ) : (
        <div className="mt-2 space-y-1.5">
          <div className="h-2 w-[95%] rounded-full bg-white/[0.06]" />
          <div className="h-2 w-[70%] rounded-full bg-white/[0.05]" />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-light">
          {durationLabel}
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-light transition-transform group-hover/next:translate-x-0.5">
          Next Lesson
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} onClick={onClick} className="block">
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {content}
    </button>
  );
});

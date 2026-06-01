"use client";

import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/GamePanel";

interface LessonLink {
  number: string;
  title: string;
  href?: string;
  onClick?: () => void;
}

interface LessonFooterProps {
  prevLesson?: LessonLink;
  nextLesson?: LessonLink;
  progressPercent: number;
}

export const LessonFooter = memo(function LessonFooter({
  prevLesson,
  nextLesson,
  progressPercent,
}: LessonFooterProps) {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="border-t border-white/8 bg-[#10182d]/80 backdrop-blur-xl"
    >
      <div className="grid grid-cols-3 items-center gap-4 px-6 py-4">
        {/* Previous lesson */}
        <div className="flex justify-start">
          {prevLesson ? prevLesson.href ? (
            <Link
              href={prevLesson.href}
              className="group/prev flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/5"
            >
              <ChevronLeft className="h-5 w-5 text-muted-light transition-transform group-hover/prev:-translate-x-0.5" />
              <div className="text-right">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Previous
                </div>
                <div className="text-sm text-muted-light transition-colors group-hover/prev:text-white">
                  <span className="font-bold text-primary-light">{prevLesson.number}</span>{" "}
                  {prevLesson.title}
                </div>
              </div>
            </Link>
          ) : (
            <button
              onClick={prevLesson.onClick}
              className="group/prev flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/5 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5 text-muted-light transition-transform group-hover/prev:-translate-x-0.5" />
              <div className="text-right">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Previous
                </div>
                <div className="text-sm text-muted-light transition-colors group-hover/prev:text-white">
                  <span className="font-bold text-primary-light">{prevLesson.number}</span>{" "}
                  {prevLesson.title}
                </div>
              </div>
            </button>
          ) : (
            <div />
          )}
        </div>

        {/* Center: Progress */}
        <div className="space-y-1.5 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Lesson Progress
          </div>
          <ProgressBar value={progressPercent} max={100} className="h-1.5" />
          <div className="text-xs font-bold text-muted-light">{progressPercent}%</div>
        </div>

        {/* Next lesson */}
        <div className="flex justify-end">
          {nextLesson ? nextLesson.href ? (
            <Link
              href={nextLesson.href}
              className="group/next flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/5"
            >
              <div className="text-left">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Next
                </div>
                <div className="text-sm text-muted-light transition-colors group-hover/next:text-white">
                  <span className="font-bold text-primary-light">{nextLesson.number}</span>{" "}
                  {nextLesson.title}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-light transition-transform group-hover/next:translate-x-0.5" />
            </Link>
          ) : (
            <button
              onClick={nextLesson.onClick}
              className="group/next flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/5 cursor-pointer"
            >
              <div className="text-left">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Next
                </div>
                <div className="text-sm text-muted-light transition-colors group-hover/next:text-white">
                  <span className="font-bold text-primary-light">{nextLesson.number}</span>{" "}
                  {nextLesson.title}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-light transition-transform group-hover/next:translate-x-0.5" />
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </motion.footer>
  );
});

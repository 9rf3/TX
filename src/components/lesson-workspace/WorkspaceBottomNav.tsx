"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonLink {
  number: string;
  title: string;
  href?: string;
  onClick?: () => void;
}

interface WorkspaceBottomNavProps {
  prevLesson?: LessonLink;
  nextLesson?: LessonLink;
  progressPercent: number;
}

export const WorkspaceBottomNav = memo(function WorkspaceBottomNav({
  prevLesson,
  nextLesson,
  progressPercent,
}: WorkspaceBottomNavProps) {
  const pct = Math.max(0, Math.min(progressPercent, 100));
  const Inner = (
    <>
      {/* Left zone: Previous */}
      <div className="flex min-w-0 flex-1 items-center justify-start">
        {prevLesson ? (
          <NavLink
            direction="prev"
            number={prevLesson.number}
            title={prevLesson.title}
            href={prevLesson.href}
            onClick={prevLesson.onClick}
          />
        ) : (
          <span className="text-xs text-muted">Start of course</span>
        )}
      </div>

      {/* Center zone: progress */}
      <div className="hidden w-full max-w-xs shrink-0 px-6 md:block">
        <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-light">
          <span>Lesson Progress</span>
          <span className="text-white">{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-primary via-accent-pink to-secondary"
          />
        </div>
      </div>

      {/* Right zone: Next */}
      <div className="flex min-w-0 flex-1 items-center justify-end">
        {nextLesson ? (
          <NavLink
            direction="next"
            number={nextLesson.number}
            title={nextLesson.title}
            href={nextLesson.href}
            onClick={nextLesson.onClick}
          />
        ) : (
          <span className="text-xs text-muted">End of course</span>
        )}
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn(
        "sticky bottom-0 z-10",
        "border-t border-white/8 bg-[#0a0a0f]/90 backdrop-blur-xl",
        "px-4 py-3 md:px-6"
      )}
    >
      <div className="flex items-center gap-3">{Inner}</div>

      {/* Mobile-only centered progress */}
      <div className="mt-2 md:hidden">
        <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-light">
          <span>Lesson Progress</span>
          <span className="text-white">{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-primary via-accent-pink to-secondary"
          />
        </div>
      </div>
    </motion.div>
  );
});

function NavLink({
  direction,
  number,
  title,
  href,
  onClick,
}: {
  direction: "prev" | "next";
  number: string;
  title: string;
  href?: string;
  onClick?: () => void;
}) {
  const isPrev = direction === "prev";
  const className = cn(
    "group/nav flex max-w-full items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-200",
    "hover:bg-white/[0.04]"
  );

  const inner = (
    <>
      {isPrev && (
        <ChevronLeft className="h-5 w-5 shrink-0 text-muted-light transition-transform group-hover/nav:-translate-x-0.5" />
      )}
      <div className={cn("min-w-0", isPrev ? "text-left" : "text-right")}>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted">
          {isPrev ? "← Previous" : "Next →"}
        </div>
        <div className="truncate text-sm text-muted-light transition-colors group-hover/nav:text-white">
          <span className="font-bold text-primary-light">{number}</span>{" "}
          <span className="hidden sm:inline">{title}</span>
          <span className="sm:hidden">{title.length > 18 ? title.slice(0, 18) + "…" : title}</span>
        </div>
      </div>
      {!isPrev && (
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-light transition-transform group-hover/nav:translate-x-0.5" />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}

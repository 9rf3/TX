"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Target, Flame, Sparkles } from "lucide-react";

interface RadialRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  centerLabel?: string;
  centerSub?: string;
  trackColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

function WorkspaceRadialRing({
  value,
  size = 120,
  strokeWidth = 10,
  label,
  centerLabel,
  centerSub,
  trackColor = "rgba(255,255,255,0.08)",
  gradientFrom = "#a78bfa",
  gradientTo = "#06b6d4",
}: RadialRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference * (1 - Math.max(0, Math.min(value, 100)) / 100);
  const gradId = `ws-ring-${gradientFrom.replace("#", "")}-${gradientTo.replace("#", "")}`;

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="1">
            <stop stopColor={gradientFrom} />
            <stop offset="1" stopColor={gradientTo} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-lg font-black text-white">
          {centerLabel ?? `${Math.round(value)}%`}
        </div>
        {centerSub && (
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-light">
            {centerSub}
          </div>
        )}
      </div>
    </div>
  );
}

interface WorkspaceQuizSidebarProps {
  scorePercent: number;
  correctAnswers: number;
  totalQuestions: number;
  streak: number;
  points: number;
}

export const WorkspaceQuizSidebar = memo(function WorkspaceQuizSidebar({
  scorePercent,
  correctAnswers,
  totalQuestions,
  streak,
  points,
}: WorkspaceQuizSidebarProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Quiz Progress card with ring */}
      <motion.div
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="gp-base rounded-2xl border border-white/10 bg-[#10182d]/85 p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-primary/25 bg-primary/10 text-primary-light">
            <Target className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">
            Quiz Progress
          </h3>
        </div>
        <div className="flex flex-col items-center">
          <WorkspaceRadialRing
            value={scorePercent}
            size={120}
            strokeWidth={10}
            gradientFrom="#a78bfa"
            gradientTo="#06b6d4"
          />
          <div className="mt-3 text-center">
            <div className="text-base font-black text-white">
              {correctAnswers}{" "}
              <span className="font-normal text-muted-light">/ {totalQuestions}</span>
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-light">
              Correct
            </div>
          </div>
        </div>
      </motion.div>

      {/* Streak card */}
      <motion.div
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="gp-base flex items-center gap-4 rounded-2xl border border-rose-500/20 bg-gradient-to-r from-rose-500/[0.08] to-orange-500/[0.06] p-4"
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-rose-500/30 bg-rose-500/15">
          <Flame className="h-6 w-6 text-rose-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
            Streak
          </div>
          <div className="flex items-baseline gap-1.5">
            <motion.span
              key={streak}
              initial={{ scale: 1.35 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-2xl font-black text-white"
            >
              {streak}
            </motion.span>
            <span className="text-xs text-muted-light">day{streak === 1 ? "" : "s"}</span>
          </div>
        </div>
      </motion.div>

      {/* Points card */}
      <motion.div
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.16 }}
        className="gp-base flex items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.08] to-accent-pink/[0.06] p-4"
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/15">
          <Sparkles className="h-6 w-6 text-primary-light" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
            Points Earned
          </div>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={points}
              initial={{ scale: 1.35 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-2xl font-black text-white"
            >
              +{points}
            </motion.span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-light">
              XP
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

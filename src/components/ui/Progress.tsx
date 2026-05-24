"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "green" | "orange" | "pink" | "cyan";
  showLabel?: boolean;
  className?: string;
}

export function Progress({ value, max = 100, size = "md", color = "primary", showLabel = false, className }: ProgressProps) {
  const pct = Math.min((value / max) * 100, 100);
  const heights: Record<string, string> = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };
  const colors: Record<string, string> = {
    primary: "from-primary to-primary-light",
    green: "from-accent-green to-emerald-400",
    orange: "from-accent-orange to-amber-400",
    pink: "from-accent-pink to-pink-400",
    cyan: "from-secondary to-cyan-400",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-xs">
          <span className="text-muted-light">{Math.round(pct)}%</span>
          <span className="text-muted">{value}/{max}</span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-white/5 overflow-hidden", heights[size])}>
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r", colors[color])}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

interface XPRingProps {
  xp: number;
  level: number;
  size?: number;
}

export function XPRing({ xp, level, size = 120 }: XPRingProps) {
  const pct = (xp % 1000) / 1000;
  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#xp-gradient)" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold">{level}</div>
        <div className="text-[10px] text-muted-light uppercase tracking-wider">Level</div>
      </div>
    </div>
  );
}

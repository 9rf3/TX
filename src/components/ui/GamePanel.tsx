"use client";
import { memo, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const GamePanel = memo(function GamePanel({
  children,
  className,
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <section
      className={cn(
        "gp-base group relative overflow-hidden rounded-[8px] border border-white/10 bg-[#10182d]/82 p-4",
        glow && "border-primary/25 shadow-[0_0_26px_rgba(139,92,246,0.16)]",
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </section>
  );
});

export const PanelHeader = memo(function PanelHeader({
  icon,
  title,
  action,
}: {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] border border-primary/25 bg-primary/12 text-primary-light">
          {icon}
        </span>
        <h2 className="truncate text-sm font-black uppercase tracking-[0.16em] text-white/95">{title}</h2>
      </div>
      {action}
    </div>
  );
});

export const ProgressBar = memo(function ProgressBar({
  value,
  max = 100,
  tone = "from-primary via-accent-pink to-secondary",
  className,
}: {
  value: number;
  max?: number;
  tone?: string;
  className?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-white/8", className)}>
      <div
        style={{ width: `${pct}%` }}
        className={cn("h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out", tone)}
      />
    </div>
  );
});

export const Ring = memo(function Ring({ value, label, size = 76 }: { value: number; label: string; size?: number }) {
  const radius = (size - 10) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference * (1 - value / 100);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gp-ring)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="gp-ring" x1="0" x2="1">
            <stop stopColor="#a78bfa" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-sm font-black text-white">{Math.round(value)}%</div>
        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-light">{label}</div>
      </div>
    </div>
  );
});

export const StatShard = memo(function StatShard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <GamePanel className="p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-[8px] border border-white/10 bg-white/7 text-primary-light">
          {icon}
        </span>
        <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-light">
          {detail}
        </span>
      </div>
      <div className="mt-4 text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-sm text-muted-light">{label}</div>
    </GamePanel>
  );
});

export function NeonButton({
  children,
  onClick,
  href,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
}) {
  const classes = cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-primary/40 bg-gradient-to-r from-primary to-secondary px-4 text-sm font-black text-white transition duration-200",
    "hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55",
    className
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Star, Coins, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceTopBarProps {
  courseHref: string;
  xp: number;
  coins: number;
  streak: number;
  level: number;
  user: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  };
}

export const WorkspaceTopBar = memo(function WorkspaceTopBar({
  courseHref,
  xp,
  coins,
  streak,
  level,
  user,
}: WorkspaceTopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : (user.email?.substring(0, 2) ?? "U").toUpperCase();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-white/8 bg-[#0a0a0f]/80 px-4 backdrop-blur-xl md:px-6"
    >
      {/* Left: back to course */}
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href={courseHref}
          className="group inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm font-medium text-muted-light transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline">Back to Course</span>
        </Link>
      </div>

      {/* Right: stats + actions */}
      <div className="flex items-center gap-2">
        {/* XP pill */}
        <div className="hidden items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 sm:flex">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/20">
            <Star className="h-3.5 w-3.5 text-primary-light" fill="currentColor" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
            XP
          </span>
          <span className="text-sm font-black tabular-nums text-white">
            {xp.toLocaleString()}
          </span>
        </div>

        {/* TX Coins pill */}
        <div className="hidden items-center gap-2 rounded-full border border-accent-orange/25 bg-accent-orange/10 px-3 py-1.5 md:flex">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-accent-orange/20">
            <Coins className="h-3.5 w-3.5 text-accent-orange" />
          </span>
          <span className="text-sm font-black tabular-nums text-accent-orange">
            {coins.toLocaleString()}
            <span className="ml-0.5 text-[10px] font-bold text-accent-orange/70">X</span>
          </span>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="hidden items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 lg:flex">
            <Flame className="h-3.5 w-3.5 text-rose-400" />
            <span className="text-sm font-black tabular-nums text-rose-300">
              {streak}
            </span>
          </div>
        )}

        {/* Level badge */}
        <div className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04]">
          <span className="text-[11px] font-black text-primary-light">{level}</span>
        </div>

        {/* Notification bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/8 bg-white/[0.03] text-muted-light transition-all hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-red shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          </button>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-white/10 bg-surface/95 p-3 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-light">
                Notifications
              </div>
              <div className="space-y-2">
                <div className="rounded-lg border border-white/8 bg-white/[0.03] p-2.5 text-xs text-muted-light">
                  <span className="font-semibold text-white">+30 XP</span> earned from quiz
                </div>
                <div className="rounded-lg border border-white/8 bg-white/[0.03] p-2.5 text-xs text-muted-light">
                  <span className="font-semibold text-white">Streak</span> extended to {streak} days
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Avatar */}
        <button
          type="button"
          className={cn(
            "grid h-9 w-9 place-items-center overflow-hidden rounded-full",
            "bg-gradient-to-br from-primary to-accent-pink text-xs font-black text-white",
            "border border-white/15 shadow-[0_0_14px_rgba(139,92,246,0.35)] transition-transform hover:scale-105"
          )}
          aria-label="Open profile menu"
        >
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name ?? "Profile"}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </button>
      </div>
    </motion.header>
  );
});

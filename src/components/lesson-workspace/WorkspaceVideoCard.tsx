"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, Maximize, Sparkles } from "lucide-react";

interface WorkspaceVideoCardProps {
  title?: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export const WorkspaceVideoCard = memo(function WorkspaceVideoCard({
  title = "Lesson Video",
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
}: WorkspaceVideoCardProps) {
  const pct = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="gp-base group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d1a]"
    >
      {/* Frame */}
      <div className="relative aspect-video w-full">
        {/* Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-secondary/15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.18)_0%,transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Title overlay (top-left) */}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-red shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/85">
            {title}
          </span>
        </div>

        {/* Center play / pause */}
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.span
            key={isPlaying ? "pause" : "play"}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative grid h-20 w-20 place-items-center rounded-full bg-black/40 backdrop-blur-sm transition-transform duration-200 hover:scale-105"
          >
            <span className="absolute inset-0 -z-10 rounded-full bg-primary/30 blur-xl" />
            {isPlaying ? (
              <Pause className="h-9 w-9 text-white drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]" />
            ) : (
              <Play
                className="h-9 w-9 translate-x-0.5 text-white drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                fill="currentColor"
              />
            )}
          </motion.span>
        </button>

        {/* Bottom controls */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-3 pt-10">
          {/* Scrub bar */}
          <div className="group/scrub relative mb-3 h-1.5 cursor-pointer rounded-full bg-white/15">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-primary-light to-secondary shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
            <div
              className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-primary shadow-[0_0_8px_rgba(139,92,246,0.7)] opacity-0 transition-opacity group-hover/scrub:opacity-100"
              style={{ left: `${pct}%` }}
            />
          </div>

          {/* Time row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-white/85">
              <Volume2 className="h-3.5 w-3.5 text-white/60" />
              <span className="font-mono tabular-nums">
                {formatTime(currentTime)}{" "}
                <span className="text-white/40">/ {formatTime(duration)}</span>
              </span>
            </div>
            <button
              type="button"
              className="grid h-6 w-6 place-items-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Fullscreen"
            >
              <Maximize className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Meta strip */}
      <div className="flex items-center justify-between gap-3 border-t border-white/8 bg-[#10182d]/60 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-light">
          <Sparkles className="h-3.5 w-3.5 text-primary-light" />
          <span>HD • 1080p • Lesson 1.3</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
          <span className="text-muted-light">Watched</span>
          <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-primary-light">
            {Math.round(pct)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
});

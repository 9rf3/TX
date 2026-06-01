"use client";

import { memo, useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, PauseCircle, Volume2, VolumeX, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoUrl?: string | null;
  duration?: number;
  currentTime?: number;
  onTimeUpdate?: (seconds: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export const VideoPlayer = memo(function VideoPlayer({
  videoUrl,
  duration = 0,
  currentTime = 0,
  onTimeUpdate,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [internalTime, setInternalTime] = useState(currentTime);
  const [internalDuration, setInternalDuration] = useState(duration);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const progress = internalDuration > 0 ? (internalTime / internalDuration) * 100 : 0;

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || isDragging) return;
    setInternalTime(video.currentTime);
    onTimeUpdate?.(video.currentTime);
  }, [onTimeUpdate, isDragging]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setInternalDuration(video.duration);
  }, []);

  const seekTo = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    const video = videoRef.current;
    if (!bar || !video) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pct * (video.duration || internalDuration);
    video.currentTime = newTime;
    setInternalTime(newTime);
    onTimeUpdate?.(newTime);
  }, [internalDuration, onTimeUpdate]);

  const handleProgressHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverProgress(pct * 100);
  }, []);

  const handleMouseActivity = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Placeholder when no video URL
  if (!videoUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d1a]">
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12)_0%,transparent_70%)]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Central play button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 animate-pulse-glow rounded-full" />
            <PlayCircle className="h-20 w-20 text-primary-light drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]" strokeWidth={1.2} />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium text-muted-light"
          >
            Video content will appear here
          </motion.p>
        </div>

        {/* Bottom fake progress bar */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5">
          <div className="h-full w-0 rounded-full bg-gradient-to-r from-primary to-secondary" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d1a] shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      onMouseMove={handleMouseActivity}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Gradient border glow */}
      <div className="pointer-events-none absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
      />

      {/* Play/Pause overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center bg-black/20"
            onClick={togglePlay}
          >
            <motion.div
              key={isPlaying ? "pause" : "play"}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isPlaying ? (
                <PauseCircle className="h-16 w-16 text-white/90 drop-shadow-lg" strokeWidth={1.2} />
              ) : (
                <PlayCircle className="h-16 w-16 text-white/90 drop-shadow-lg" strokeWidth={1.2} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-8"
          >
            {/* Progress bar */}
            <div
              ref={progressRef}
              className="group/progress relative mb-3 h-1.5 cursor-pointer rounded-full bg-white/15 transition-all hover:h-2.5"
              onClick={seekTo}
              onMouseMove={handleProgressHover}
              onMouseLeave={() => setHoverProgress(null)}
            >
              {/* Hover preview */}
              {hoverProgress !== null && (
                <div
                  className="absolute top-0 h-full rounded-full bg-white/10"
                  style={{ width: `${hoverProgress}%` }}
                />
              )}

              {/* Played progress */}
              <div
                className="absolute top-0 h-full rounded-full bg-gradient-to-r from-primary via-primary-light to-secondary shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                style={{ width: `${progress}%` }}
              />

              {/* Drag handle */}
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-[0_0_8px_rgba(139,92,246,0.6)] opacity-0 transition-opacity group-hover/progress:opacity-100"
                style={{ left: `${progress}%`, transform: `translateX(-50%) translateY(-50%)` }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="text-white/90 transition-colors hover:text-white"
                >
                  {isPlaying ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                  className="text-white/70 transition-colors hover:text-white"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>

                <span className="font-mono text-xs text-white/70">
                  {formatTime(internalTime)} / {formatTime(internalDuration)}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  videoRef.current?.requestFullscreen?.();
                }}
                className="text-white/70 transition-colors hover:text-white"
              >
                <Maximize className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

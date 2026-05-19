"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { AnimatedCounter } from "./AnimatedCounter";
import { Flame, Zap } from "lucide-react";

interface StreakCardProps {
  streak: number;
  lastActive: string | null;
}

export function StreakCard({ streak, lastActive }: StreakCardProps) {
  const today = new Date().toDateString();
  const lastActiveDate = lastActive ? new Date(lastActive).toDateString() : null;
  const activeToday = lastActiveDate === today;
  const activeYesterday = lastActiveDate === new Date(Date.now() - 86400000).toDateString();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/5 to-accent-pink/5" />
      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-accent-orange" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Streak</h3>
              <p className="text-[10px] text-muted">Daily login consistency</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <AnimatedCounter
                to={streak}
                duration={1}
                className="text-3xl font-black text-accent-orange"
              />
              <span className="text-xs text-muted">days</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1">
          {days.map((dayStr, i) => {
            const isActive = dayStr === today && activeToday;
            const wasActive = dayStr === lastActiveDate;
            const isFuture = dayStr > today;
            const filled = isActive || wasActive;

            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <motion.div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    filled
                      ? 'bg-accent-orange border border-accent-orange/50 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : isFuture
                        ? 'bg-white/5 border border-white/10 text-muted/30'
                        : 'bg-white/[0.03] border border-white/5 text-muted/50'
                  }`}
                  whileHover={filled ? { scale: 1.1 } : {}}
                  animate={isActive ? {
                    scale: [1, 1.1, 1],
                    transition: { repeat: Infinity, duration: 2 },
                  } : {}}
                >
                  {filled ? <Flame className="w-3.5 h-3.5" /> : i + 1}
                </motion.div>
                <span className="text-[8px] text-muted uppercase">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Weekly activity</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-orange" />
              <span className="text-muted-light">
                {streak >= 7 ? 'Perfect week!' : `${streak}/7 days`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

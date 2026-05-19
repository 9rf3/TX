"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, Zap, Flame, Award, Star } from "lucide-react";

interface MotivationBarProps {
  level: number;
  xp: number;
  xpForNext: number;
  streak: number;
  rankTier: string;
  rank: number;
  percentile: number;
}

const messages = [
  "You're on fire! Keep that streak going.",
  "Every lesson brings you closer to mastery.",
  "Consistency beats intensity. Keep showing up.",
  "Small steps every day lead to big results.",
  "The only person you should compete with is yesterday's you.",
];

export function MotivationBar({
  level, xp, xpForNext, streak, rankTier, rank, percentile,
}: MotivationBarProps) {
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx(prev => (prev + 1) % messages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const xpToNext = Math.max(0, xpForNext - xp);
  const nextTier = rankTier === 'Bronze' ? 'Silver'
    : rankTier === 'Silver' ? 'Gold'
    : rankTier === 'Gold' ? 'Platinum'
    : rankTier === 'Platinum' ? 'Diamond'
    : rankTier === 'Diamond' ? 'Elite'
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/5 border border-primary/20 p-4"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      <div className="relative z-10 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-light" />
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIdx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-muted-light"
            >
              {messages[messageIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {xpToNext > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs">
              <Zap className="w-3 h-3 text-primary-light" />
              <span className="text-muted-light">{xpToNext} XP to next level</span>
            </div>
          )}
          {streak >= 3 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-xs">
              <Flame className="w-3 h-3 text-accent-orange" />
              <span className="text-accent-orange font-medium">{streak} day streak</span>
            </div>
          )}
          {percentile >= 80 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-green/10 border border-accent-green/20 text-xs">
              <TrendingUp className="w-3 h-3 text-accent-green" />
              <span className="text-accent-green font-medium">Top {100 - percentile}%</span>
            </div>
          )}
          {nextTier && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-pink/10 border border-accent-pink/20 text-xs">
              <Award className="w-3 h-3 text-accent-pink" />
              <span className="text-accent-pink font-medium">Next: {nextTier}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

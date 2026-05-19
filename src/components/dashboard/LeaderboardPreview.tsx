"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Trophy, ChevronRight, Zap, Medal, Crown } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { useAuth } from "@/components/providers/AuthProvider";

interface LeaderEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string | null;
  xp: number;
  level: number;
  streak: number;
}

export function LeaderboardPreview() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { getLeaderboardData } = await import('@/actions/gamification');
        const data = await getLeaderboardData(10);
        setEntries(data as unknown as LeaderEntry[]);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent-orange" /> Top Learners
        </h2>
        <Link href="/leaderboard" className="text-sm text-primary-light hover:text-primary flex items-center gap-1 transition-colors">
          Full board <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <Card className="p-6 text-center text-muted text-sm">Loading rankings...</Card>
      ) : entries.length === 0 ? (
        <Card className="p-8 text-center">
          <Trophy className="w-10 h-10 text-muted/30 mx-auto mb-3" />
          <p className="text-sm text-muted">Be the first to earn XP and claim the top spot!</p>
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          {entries.map((entry, i) => {
            const isMe = entry.id === user?.id;
            const RankIcon = i === 0 ? Crown : i === 1 ? Medal : i === 2 ? Medal : null;
            const rankColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600'];

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-3 px-4 py-3 ${
                  isMe ? 'bg-primary/10 border border-primary/20' : 'border-b border-white/5 last:border-b-0'
                } hover:bg-white/[0.02] transition-colors`}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                  {RankIcon && i < 3 ? (
                    <RankIcon className={`w-5 h-5 ${rankColors[i]}`} />
                  ) : (
                    <span className="text-muted">#{entry.rank}</span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {entry.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{entry.name}</span>
                    <span className="text-[10px] text-muted bg-white/5 px-1.5 py-0.5 rounded">Lvl {entry.level}</span>
                    {isMe && <span className="text-[10px] text-primary-light font-semibold">(you)</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Zap className="w-3 h-3 text-primary-light" />
                  <span className="font-semibold tabular-nums">
                    <AnimatedCounter to={entry.xp} duration={1} formatter={v => v.toLocaleString()} />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

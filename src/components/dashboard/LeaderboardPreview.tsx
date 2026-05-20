"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Trophy, ChevronRight, Zap, Medal, Crown, Sparkles, Swords } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSound } from "@/lib/hooks/useSound";

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
  const { playClick } = useSound();
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { getLeaderboardData } = await import('@/actions/gamification');
        const data = await getLeaderboardData(8);
        setEntries(data as unknown as LeaderEntry[]);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const myIndex = entries.findIndex(e => e.id === user?.id);
  const me = myIndex !== -1 ? entries[myIndex] : null;
  const aheadUser = myIndex > 0 ? entries[myIndex - 1] : null;
  const xpGap = me && aheadUser ? aheadUser.xp - me.xp : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-accent-orange/15 border border-accent-orange/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Trophy className="w-5 h-5 text-accent-orange animate-float" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              Championship Leaderboard
            </h2>
            <p className="text-xs text-muted-light">Global rank divisions & active XP competitors</p>
          </div>
        </div>

        <Link
          href="/leaderboard"
          onClick={() => playClick()}
          className="text-xs text-primary-light hover:text-white transition-colors flex items-center gap-0.5 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl"
        >
          View Full <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <Card className="p-6 text-center text-muted text-sm bg-surface">Loading global ranks...</Card>
      ) : entries.length === 0 ? (
        <Card className="p-8 text-center bg-surface border-white/5">
          <Trophy className="w-10 h-10 text-muted/30 mx-auto mb-3" />
          <p className="text-sm text-muted">Be the first to earn XP and claim the top spot!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Personalized Competition Gap Callout */}
          {me && aheadUser && xpGap > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-primary/30 bg-primary/10 p-3.5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-primary-light animate-pulse" />
                <span className="text-muted-light">
                  You are only <strong className="text-white">{xpGap.toLocaleString()} XP</strong> away from overtaking <strong className="text-primary-light">@{aheadUser.name}</strong>!
                </span>
              </div>
              <span className="text-[9px] font-black uppercase text-primary bg-primary-light px-2 py-0.5 rounded">
                COMPETE
              </span>
            </motion.div>
          )}

          <Card className="!p-0 overflow-hidden border-white/5 bg-surface-light/30">
            {entries.slice(0, 5).map((entry, i) => {
              const isMe = entry.id === user?.id;
              const RankIcon = i === 0 ? Crown : i === 1 ? Medal : i === 2 ? Medal : null;
              const rankColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600'];
              
              // Custom gradient backgrounds for Top 3 Elite items
              const getEliteBg = () => {
                if (isMe) return 'bg-primary/10 border border-primary/20 relative z-10 shadow-[0_0_12px_rgba(139,92,246,0.1)]';
                if (i === 0) return 'bg-gradient-to-r from-yellow-500/5 to-transparent border-b border-yellow-500/10';
                if (i === 1) return 'bg-gradient-to-r from-slate-400/5 to-transparent border-b border-white/5';
                if (i === 2) return 'bg-gradient-to-r from-amber-600/5 to-transparent border-b border-white/5';
                return 'border-b border-white/5 last:border-b-0';
              };

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition duration-200 ${getEliteBg()}`}
                >
                  {/* Rank positioning */}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 bg-white/[0.02]">
                    {RankIcon && i < 3 ? (
                      <RankIcon className={`w-5 h-5 ${rankColors[i]} filter drop-shadow-[0_0_8px_rgba(250,204,21,0.2)]`} />
                    ) : (
                      <span className="text-muted text-xs">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Gamer-style Initial Tag */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 shadow-md ${
                    i === 0
                      ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                      : i === 1
                      ? "bg-gradient-to-br from-slate-300 to-slate-500"
                      : i === 2
                      ? "bg-gradient-to-br from-amber-600 to-amber-800"
                      : "bg-gradient-to-br from-primary to-accent-pink"
                  }`}>
                    {entry.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Competitor identity details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black truncate ${isMe ? "text-primary-light" : "text-white"}`}>
                        {entry.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted font-bold">
                        Lvl {entry.level}
                      </span>
                      {isMe && (
                        <span className="text-[9px] text-accent-pink uppercase font-black tracking-widest animate-pulse">
                          (you)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Live animated XP counter */}
                  <div className="flex items-center gap-1.5 text-xs text-primary-light font-bold">
                    <Zap className="w-3.5 h-3.5 text-primary-light" />
                    <span className="tabular-nums">
                      <AnimatedCounter to={entry.xp} duration={1} formatter={v => v.toLocaleString()} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import { Trophy, Zap, Crown, Medal, Flame, Search } from "lucide-react";
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

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("weekly");
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { getLeaderboardData } = await import('@/actions/gamification');
        const data = await getLeaderboardData(100);
        setEntries(data as unknown as LeaderEntry[]);
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = searchQuery.trim()
    ? entries.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : entries;

  const userEntry = entries.find(e => e.id === user?.id);
  const userRank = userEntry?.rank ?? 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Trophy className="w-7 h-7 text-accent-orange" /> Leaderboard
          </h1>
          <p className="text-muted-light mt-1">
            {entries.length > 0
              ? `${entries.length} learners competing`
              : "Compete with other learners"}
          </p>
        </div>
        <Tabs
          tabs={[
            { id: "weekly", label: "Weekly" },
            { id: "monthly", label: "Monthly" },
            { id: "all", label: "All Time" },
          ]}
          activeTab={period}
          onChange={setPeriod}
        />
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by name..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-all"
        />
      </motion.div>

      {/* Your rank */}
      {userEntry && (
        <motion.div variants={item}>
          <Card className="relative overflow-hidden border-primary/30 bg-primary/5">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
            <div className="relative z-10 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary-light">
                #{userRank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-primary-light">Your rank</div>
                <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                  <span>{userEntry.name}</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{userEntry.xp.toLocaleString()} XP</span>
                  <span>Lvl {userEntry.level}</span>
                </div>
              </div>
              {userEntry.streak >= 3 && (
                <div className="flex items-center gap-1 text-xs text-accent-orange">
                  <Flame className="w-3.5 h-3.5" /> {userEntry.streak}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Leaderboard list */}
      <motion.div variants={item}>
        {loading ? (
          <Card className="p-12 text-center text-muted">Loading rankings...</Card>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Trophy className="w-14 h-14 text-muted/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-1">
              {searchQuery ? "No learners found" : "No Leaderboard Data"}
            </h3>
            <p className="text-muted-light text-sm">
              {searchQuery ? "Try a different search term." : "Complete courses and earn XP to appear on the leaderboard!"}
            </p>
          </Card>
        ) : (
          <Card className="!p-0 overflow-hidden">
            {filtered.map((entry, i) => {
              const isMe = entry.id === user?.id;
              const position = filtered.indexOf(entry);
              const RankIcon = position === 0 ? Crown : position === 1 ? Medal : position === 2 ? Medal : null;
              const rankColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600'];

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    isMe
                      ? 'bg-primary/10 border-b border-primary/20'
                      : 'border-b border-white/5 last:border-b-0'
                  } hover:bg-white/[0.02] transition-colors`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                    {RankIcon && position < 3 ? (
                      <RankIcon className={`w-6 h-6 ${rankColors[position]}`} />
                    ) : (
                      <span className="text-sm font-bold text-muted">#{entry.rank}</span>
                    )}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{entry.name}</span>
                      <span className="text-[10px] text-muted bg-white/5 px-1.5 py-0.5 rounded font-medium">
                        Lvl {entry.level}
                      </span>
                      {isMe && (
                        <span className="text-[10px] text-primary-light font-semibold">(you)</span>
                      )}
                    </div>
                    {entry.streak >= 3 && (
                      <div className="flex items-center gap-1 text-[10px] text-accent-orange mt-0.5">
                        <Flame className="w-3 h-3" /> {entry.streak}-day streak
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Zap className="w-3.5 h-3.5 text-primary-light" />
                    <span className="font-bold tabular-nums text-primary-light">
                      <AnimatedCounter to={entry.xp} duration={1} formatter={v => v.toLocaleString()} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
}

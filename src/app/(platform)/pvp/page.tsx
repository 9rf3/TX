"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Swords, Clock, Loader2, Zap, Trophy, Users, X, Search,
  ArrowLeft, AlertTriangle, Coins, Check, ChevronRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { quickMatch, cancelMatch, getMatchState, getPvPStats, getUserMatches } from "@/actions/pvp";
import { useAuth } from "@/components/providers/AuthProvider";
import type { PvPCategory, PvPMatch } from "@/lib/types";
import { PVP_CATEGORIES } from "@/lib/types";

type PagePhase = "idle" | "queueing" | "waiting" | "error" | "history";

export default function PvPPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [phase, setPhase] = useState<PagePhase>("idle");
  const [selectedCategory, setSelectedCategory] = useState<PvPCategory>("javascript");
  const [matchTimer, setMatchTimer] = useState(30);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, wins: 0, losses: 0, winRate: 0 });
  const [recentMatches, setRecentMatches] = useState<PvPMatch[]>([]);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentMatchId = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (user) {
      getPvPStats().then(setStats).catch(() => {});
      getUserMatches().then((m) => setRecentMatches(m.slice(0, 5))).catch(() => {});
    }
    return () => {
      mountedRef.current = false;
      cleanupTimers();
    };
  }, [user]);

  const cleanupTimers = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const handleQuickMatch = useCallback(async () => {
    if (!user || phase === "queueing") return;
    setErrorMsg(null);
    setPhase("queueing");
    setMatchTimer(30);

    try {
      const result = await quickMatch(selectedCategory);
      if (!mountedRef.current) return;

      currentMatchId.current = result.match.id;

      if (result.match.status === "active") {
        router.push(`/pvp/match/${result.match.id}`);
        return;
      }

      setPhase("waiting");

      // Poll for opponent
      pollRef.current = setInterval(async () => {
        if (!mountedRef.current || !currentMatchId.current) return;
        try {
          const state = await getMatchState(currentMatchId.current);
          if (!mountedRef.current) return;
          if (state.status === "active" && state.player2Id) {
            cleanupTimers();
            router.push(`/pvp/match/${currentMatchId.current}`);
          }
        } catch { /* retry */ }
      }, 1500);

      // Countdown timer
      timerRef.current = setInterval(() => {
        setMatchTimer((t) => {
          if (t <= 1) {
            cleanupTimers();
            handleCancel();
            return 0;
          }
          return t - 1;
        });
      }, 1000);

    } catch (e) {
      if (!mountedRef.current) return;
      setErrorMsg(e instanceof Error ? e.message : "Failed to start match");
      setPhase("error");
      cleanupTimers();
    }
  }, [user, selectedCategory, phase, router, cleanupTimers]);

  const handleCancel = useCallback(async () => {
    if (currentMatchId.current) {
      try { await cancelMatch(currentMatchId.current); } catch { /* ignore */ }
      currentMatchId.current = null;
    }
    cleanupTimers();
    if (mountedRef.current) {
      setPhase("idle");
      setMatchTimer(30);
    }
  }, [cleanupTimers]);

  useEffect(() => {
    return () => {
      if (currentMatchId.current) {
        cancelMatch(currentMatchId.current).catch(() => {});
      }
    };
  }, []);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 max-w-[1200px] mx-auto min-h-screen"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 flex items-center justify-center">
            <Swords className="w-5 h-5 text-primary-light" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-wide">PvP Arena</h1>
            <p className="text-xs text-muted-light">Real-time 1v1 coding duels</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            {stats.wins}W / {stats.losses}L
          </Badge>
          {stats.total > 0 && (
            <Badge variant="warning" size="sm">{stats.winRate}% WR</Badge>
          )}
        </div>
      </div>

      {/* Queue Phase */}
      {(phase === "queueing" || phase === "waiting") && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl border border-white/10 overflow-hidden mb-6"
          style={{ background: "linear-gradient(145deg, #0c1230 0%, #0f0f2e 50%, #0d1435 100%)" }}
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.2) 0%, transparent 60%)" }}
          />
          <div className="relative z-10 p-8 text-center">
            {phase === "queueing" ? (
              <>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-blue-600/30 flex items-center justify-center mx-auto mb-4 border-2 border-primary/30">
                  <Loader2 className="w-8 h-8 text-primary-light animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Finding Match...</h2>
                <p className="text-muted-light text-sm capitalize">{selectedCategory} · Quick Match</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-blue-600/30 flex items-center justify-center mx-auto mb-4 border-2 border-primary/30 animate-pulse">
                  <Search className="w-8 h-8 text-primary-light" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Waiting for Opponent</h2>
                <p className="text-muted-light text-sm mb-2 capitalize">{selectedCategory} · Quick Match</p>
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold tabular-nums mb-4",
                  matchTimer < 10 ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white"
                )}>
                  <Clock className="w-4 h-4" />
                  {formatTime(matchTimer)}
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary-light animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary-light animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary-light animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <Button variant="ghost" onClick={handleCancel}>
                  <X className="w-4 h-4" /> Cancel
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Error Phase */}
      {phase === "error" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center mb-6"
        >
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Match Failed</h3>
          <p className="text-sm text-muted-light mb-4">{errorMsg || "Could not create match"}</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="primary" onClick={() => setPhase("idle")}>
              Try Again
            </Button>
            <Button variant="ghost" onClick={() => setPhase("idle")}>
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Idle Phase - Arena Content */}
      {phase === "idle" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            {/* Quick Match Card */}
            <div className="group relative rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(124,58,237,0.15)] hover:border-primary/20"
              style={{ background: "linear-gradient(145deg, #0c1230 0%, #0f0f2e 50%, #0d1435 100%)" }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 70% 30%, rgba(139,92,246,0.1) 0%, transparent 50%)" }}
              />
              <div className="relative z-10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 flex items-center justify-center">
                    <Swords className="w-5 h-5 text-primary-light" />
                  </div>
                  <Badge variant="primary" size="sm">Quick Match</Badge>
                </div>
                <h3 className="text-xl font-extrabold text-white mb-1.5 tracking-tight">1V1 ARENA</h3>
                <p className="text-sm text-muted-light mb-6">Compete against other learners in real-time knowledge battles</p>

                <div className="mb-6">
                  <p className="text-xs text-muted-light mb-2 uppercase tracking-wider">Select Category</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PVP_CATEGORIES.slice(0, 6).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                          selectedCategory === cat.id
                            ? "border-primary/40 bg-primary/10 text-primary-light"
                            : "border-white/5 bg-white/[0.03] text-muted-light hover:border-white/10 hover:text-white",
                        )}
                      >
                        <span>{cat.icon === "code" ? "JS" : cat.icon === "zap" ? "⚛" : cat.icon === "brain" ? "Δ" : cat.icon === "globe" ? "🌐" : cat.icon === "book" ? "📖" : cat.icon}</span>
                        <span className="truncate">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  glow
                  disabled={!user}
                  onClick={handleQuickMatch}
                >
                  <Zap className="w-4 h-4" /> Quick Match
                </Button>
              </div>
            </div>

            {/* Category Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PVP_CATEGORIES.filter((c) => c.id === selectedCategory).map((cat) => (
                <div key={cat.id}
                  className="rounded-xl border border-white/5 p-4 bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
                    >
                      <BookOpen className="w-5 h-5" style={{ color: cat.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{cat.label}</p>
                      <p className="text-xs text-muted-light">{cat.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-light">
                    <span>5 questions</span>
                    <span>·</span>
                    <span>3 min timer</span>
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-white/5 p-4 bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Rewards</p>
                    <p className="text-xs text-muted-light">Win big</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-muted-light">
                  <p><span className="text-amber-400 font-semibold">+50 XP</span> per win</p>
                  <p><span className="text-amber-400 font-semibold">+25 TX</span> per win</p>
                  <p><span className="text-muted">+15 XP</span> / <span className="text-muted">+5 TX</span> participation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Stats Card */}
            <Card hover={false} className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-5 pt-5 pb-3">
                <Trophy className="w-4 h-4 text-primary-light" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Your Stats</h3>
              </div>
              <div className="px-5 pb-5">
                {stats.total === 0 ? (
                  <p className="text-sm text-muted-light">No matches played yet.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-black text-white">{stats.total}</p>
                      <p className="text-[10px] text-muted uppercase">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-accent-green">{stats.wins}</p>
                      <p className="text-[10px] text-muted uppercase">Wins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-red-400">{stats.losses}</p>
                      <p className="text-[10px] text-muted uppercase">Losses</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Recent Matches */}
            <Card hover={false} className="p-0 overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-muted" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Recent</h3>
                </div>
              </div>
              <div className="px-3 pb-3">
                {recentMatches.length === 0 ? (
                  <p className="text-sm text-muted-light px-2">No recent matches.</p>
                ) : (
                  <div className="space-y-1">
                    {recentMatches.slice(0, 3).map((m) => (
                      <button key={m.id}
                        onClick={() => router.push(`/pvp/match/${m.id}`)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            m.status === "completed" ? "bg-accent-green" : m.status === "active" ? "bg-primary-light" : "bg-muted"
                          )} />
                          <span className="text-xs text-muted-light capitalize">{m.category}</span>
                        </div>
                        <span className={cn(
                          "text-xs font-bold",
                          m.status === "completed" ? "text-white" : "text-muted-light"
                        )}>
                          {m.status === "completed" ? `${m.player_1_score} - ${m.player_2_score}` : m.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </aside>
        </div>
      )}
    </motion.div>
  );
}

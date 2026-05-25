"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Swords, Clock, Loader2, Zap, Trophy, Users, X, Search,
  AlertTriangle, Coins, BookOpen, Sparkles, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { quickMatch, cancelMatch, getMatchState, getPvPStats, getUserMatches } from "@/actions/pvp";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { PvPCategory, PvPMatch } from "@/lib/types";
import { PVP_CATEGORIES } from "@/lib/types";

type PagePhase = "idle" | "queueing" | "waiting" | "error";

function ArenaParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, rgba(139,92,246,${0.3 + Math.random() * 0.4}), transparent)`,
          }}
          animate={{
            y: [0, -20 - Math.random() * 30],
            opacity: [0, 0.6, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 4,
          }}
        />
      ))}
    </div>
  );
}

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
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const currentMatchId = useRef<string | null>(null);
  const navigating = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (user) {
      getPvPStats().then(setStats).catch(() => {});
      getUserMatches().then((m) => setRecentMatches(m.slice(0, 5))).catch(() => {});
    }
    return () => {
      mountedRef.current = false;
      cancelMatchmaking();
    };
  }, [user]);

  const cancelMatchmaking = useCallback(() => {
    if (currentMatchId.current && !navigating.current) {
      cancelMatch(currentMatchId.current).catch(() => {});
    }
    currentMatchId.current = null;
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (channelRef.current && supabaseRef.current) {
      supabaseRef.current.removeChannel(channelRef.current);
      channelRef.current = null;
      supabaseRef.current = null;
    }
  }, []);

  const navigateToMatch = useCallback((matchId: string) => {
    navigating.current = true;
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (channelRef.current && supabaseRef.current) {
      supabaseRef.current.removeChannel(channelRef.current);
      channelRef.current = null;
      supabaseRef.current = null;
    }
    currentMatchId.current = null;
    router.push(`/pvp/match/${matchId}`);
  }, [router]);

  const handleQuickMatch = useCallback(async () => {
    if (!user || phase === "queueing" || navigating.current) return;
    setErrorMsg(null);
    setPhase("queueing");
    setMatchTimer(30);

    try {
      const result = await quickMatch(selectedCategory);
      if (!mountedRef.current) return;

      if (result.match.status === "active") {
        navigateToMatch(result.match.id);
        return;
      }

      currentMatchId.current = result.match.id;
      setPhase("waiting");

      const supabase = createClient();
      supabaseRef.current = supabase;
      const channel = supabase
        .channel(`pvp-match-${result.match.id}`)
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "pvp_matches",
          filter: `id=eq.${result.match.id}`,
        }, (payload) => {
          if (!mountedRef.current || navigating.current) return;
          const newStatus = (payload.new as Record<string, unknown>).status;
          const newP2 = (payload.new as Record<string, unknown>).player_2_id;
          if (newStatus === "active" && newP2) {
            navigateToMatch(result.match.id);
          }
        })
        .subscribe();
      channelRef.current = channel;

      pollRef.current = setInterval(async () => {
        if (!mountedRef.current || !currentMatchId.current || navigating.current) return;
        try {
          const state = await getMatchState(currentMatchId.current);
          if (state.status === "active" && state.player2Id) {
            navigateToMatch(currentMatchId.current);
          }
        } catch { /* retry */ }
      }, 2000);

      timerRef.current = setInterval(() => {
        setMatchTimer((t) => {
          if (t <= 1) {
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
      cancelMatchmaking();
    }
  }, [user, selectedCategory, phase, router, navigateToMatch, cancelMatchmaking]);

  const handleCancel = useCallback(async () => {
    cancelMatchmaking();
    if (mountedRef.current) {
      setPhase("idle");
      setMatchTimer(30);
    }
  }, [cancelMatchmaking]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 max-w-[1200px] mx-auto min-h-screen relative"
    >
      <ArenaParticles />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 flex items-center justify-center"
            animate={{ boxShadow: ["0 0 0px rgba(139,92,246,0)", "0 0 20px rgba(139,92,246,0.2)", "0 0 0px rgba(139,92,246,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Swords className="w-5 h-5 text-primary-light" />
          </motion.div>
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
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center mx-auto mb-4 border-2 border-primary/30">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-8 h-8 text-primary-light" />
                  </motion.div>
                </div>
                <motion.h2
                  className="text-2xl font-black text-white mb-1"
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Finding Match...
                </motion.h2>
                <p className="text-muted-light text-sm capitalize">{selectedCategory} · Quick Match</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, rgba(139,92,246,${0.8 - i * 0.2}), rgba(6,182,212,${0.8 - i * 0.2}))`,
                      }}
                      animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <motion.div
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center mx-auto mb-4 border-2 border-primary/30"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Search className="w-8 h-8 text-primary-light" />
                </motion.div>
                <h2 className="text-2xl font-black text-white mb-1">Waiting for Opponent</h2>
                <p className="text-muted-light text-sm mb-3 capitalize">{selectedCategory} · Quick Match</p>

                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold tabular-nums mb-4",
                  matchTimer < 10 ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white"
                )}>
                  <Clock className="w-4 h-4" />
                  {formatTime(matchTimer)}
                </div>

                <div className="flex items-center justify-center gap-3 mb-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, rgba(139,92,246,${0.8 - i * 0.2}), rgba(6,182,212,${0.8 - i * 0.2}))`,
                        boxShadow: `0 0 10px rgba(139,92,246,${0.5 - i * 0.15})`,
                      }}
                      animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>

                <Button variant="ghost" onClick={handleCancel}>
                  <X className="w-4 h-4" /> Cancel
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Error */}
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

      {/* Idle */}
      {phase === "idle" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 relative z-10">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] hover:border-primary/20"
              style={{ background: "linear-gradient(145deg, #0c1230 0%, #0f0f2e 50%, #0d1435 100%)" }}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 70% 30%, rgba(139,92,246,0.1) 0%, transparent 50%)" }}
              />
              <div className="relative z-10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 flex items-center justify-center"
                    animate={{ boxShadow: ["0 0 0px rgba(139,92,246,0)", "0 0 15px rgba(139,92,246,0.15)", "0 0 0px rgba(139,92,246,0)"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Swords className="w-5 h-5 text-primary-light" />
                  </motion.div>
                  <Badge variant="primary" size="sm">Quick Match</Badge>
                </div>
                <h3 className="text-xl font-extrabold text-white mb-1.5 tracking-tight">1V1 ARENA</h3>
                <p className="text-sm text-muted-light mb-6">Compete against other learners in real-time knowledge battles</p>

                <div className="mb-6">
                  <p className="text-xs text-muted-light mb-2 uppercase tracking-wider">Select Category</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PVP_CATEGORIES.slice(0, 6).map((cat) => (
                      <motion.button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                          selectedCategory === cat.id
                            ? "border-primary/40 bg-primary/10 text-primary-light shadow-[0_0_12px_rgba(139,92,246,0.1)]"
                            : "border-white/5 bg-white/[0.03] text-muted-light hover:border-white/10 hover:text-white",
                        )}
                      >
                        <span className="text-base">{cat.icon === "code" ? "JS" : cat.icon === "zap" ? "⚛" : cat.icon === "brain" ? "Δ" : cat.icon === "globe" ? "🌐" : cat.icon === "book" ? "📖" : cat.icon}</span>
                        <span className="truncate">{cat.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary" className="w-full" glow
                  disabled={!user}
                  onClick={handleQuickMatch}
                >
                  <Zap className="w-4 h-4" /> Quick Match
                </Button>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PVP_CATEGORIES.filter((c) => c.id === selectedCategory).map((cat) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
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
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-white/5 p-4 bg-white/[0.02]"
              >
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
              </motion.div>
            </div>
          </div>

          <aside className="space-y-4">
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
                    <motion.div
                      className="text-center p-2 rounded-lg bg-white/[0.02]"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <p className="text-lg font-black text-white">{stats.total}</p>
                      <p className="text-[10px] text-muted uppercase">Total</p>
                    </motion.div>
                    <motion.div
                      className="text-center p-2 rounded-lg bg-white/[0.02]"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-lg font-black text-accent-green">{stats.wins}</p>
                      <p className="text-[10px] text-muted uppercase">Wins</p>
                    </motion.div>
                    <motion.div
                      className="text-center p-2 rounded-lg bg-white/[0.02]"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-lg font-black text-red-400">{stats.losses}</p>
                      <p className="text-[10px] text-muted uppercase">Losses</p>
                    </motion.div>
                  </div>
                )}
              </div>
            </Card>

            <Card hover={false} className="p-0 overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Recent</h3>
                </div>
              </div>
              <div className="px-3 pb-3">
                {recentMatches.length === 0 ? (
                  <p className="text-sm text-muted-light px-2">No recent matches.</p>
                ) : (
                  <div className="space-y-1">
                    {recentMatches.slice(0, 3).map((m) => (
                      <motion.button
                        key={m.id}
                        onClick={() => router.push(`/pvp/match/${m.id}`)}
                        whileHover={{ x: 3 }}
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
                      </motion.button>
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

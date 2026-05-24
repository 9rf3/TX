"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Zap, Users, Coins, Crown, Timer, Award, Swords,
  Clock, Signal, ChevronRight, Calendar, Star, Medal, Sparkles,
  AlertTriangle, Loader2, Check, X, Play, Eye,
} from "lucide-react";
import { useTournaments } from "@/components/providers/TournamentProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  registerForTournament, cancelRegistration,
  getTournamentLeaderboard, getRegistrationCount, getTournamentQuestions,
} from "@/actions/tournaments";
import { TournamentPlayModal } from "@/components/tournaments/TournamentPlayModal";
import { PvPMatchModal } from "@/components/tournaments/PvPMatchModal";
import type { Tournament, TournamentRegistration, LeaderboardEntry, PvPCategory } from "@/lib/types";

/* ==================================================================== */
/*  Countdown Hook                                                       */
/* ==================================================================== */

function useCountdown(target: Date) {
  const calc = useCallback(() => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      d: Math.floor(diff / 86_400_000),
      h: Math.floor((diff % 86_400_000) / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
    };
  }, [target]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    setTime(calc());
    const id = setInterval(() => setTime(calc()), 1_000);
    return () => clearInterval(id);
  }, [calc]);

  return time;
}

/* ==================================================================== */
/*  Status Badge                                                         */
/* ==================================================================== */

function StatusBadge({ status }: { status: Tournament["status"] }) {
  const config = {
    upcoming: { label: "Upcoming", color: "text-secondary bg-secondary/15 border-secondary/20" },
    registration_open: { label: "Registration Open", color: "text-accent-green bg-accent-green/15 border-accent-green/20" },
    live: { label: "LIVE", color: "text-accent-red bg-accent-red/15 border-accent-red/20" },
    completed: { label: "Completed", color: "text-muted-light bg-white/5 border-white/10" },
  }[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border", config.color)}>
      {status === "live" && <span className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />}
      {config.label}
    </span>
  );
}

/* ==================================================================== */
/*  Section Header                                                       */
/* ==================================================================== */

function SectionHeader({ icon, title, subtitle, count }: { icon: React.ReactNode; title: string; subtitle?: string; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wide leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-muted-light mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {count !== undefined && (
        <Badge variant="primary" size="sm">{count} {count === 1 ? "Entry" : "Entries"}</Badge>
      )}
    </div>
  );
}

/* ==================================================================== */
/*  Tournament Card                                                      */
/* ==================================================================== */

function TournamentCard({ tournament, registration, onRegister, onEnter, onViewResults, isLoading }: {
  tournament: Tournament;
  registration?: TournamentRegistration | null;
  onRegister: () => void;
  onEnter: () => void;
  onViewResults: () => void;
  isLoading: boolean;
}) {
  const endDate = new Date(tournament.end_at);
  const startDate = new Date(tournament.start_at);
  const countdown = useCountdown(tournament.status === "live" ? endDate : startDate);

  const gradients: Record<string, string> = {
    solo: "linear-gradient(145deg, #0f172a 0%, #1a0b2e 40%, #0c1a2e 100%)",
    pvp: "linear-gradient(145deg, #0c1230 0%, #0f0f2e 50%, #0d1435 100%)",
    team: "linear-gradient(145deg, #1a1006 0%, #2a1a0a 40%, #1a1206 100%)",
  };

  const isRegistered = !!registration;
  const canRegister = tournament.status === "registration_open" && !isRegistered;
  const canUnregister = tournament.status === "registration_open" && isRegistered;
  const canEnter = tournament.status === "live" && isRegistered;
  const isPast = tournament.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(124,58,237,0.15)] hover:border-primary/20"
      style={{ background: gradients[tournament.type] || gradients.solo }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(circle at 80% 20%, rgba(139,92,246,0.15) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(6,182,212,0.1) 0%, transparent 50%)"
        }}
      />

      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between mb-4">
          <StatusBadge status={tournament.status} />
          {tournament.type === "pvp" && (
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
              <Swords className="w-4 h-4 text-primary-light" />
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-white mb-1">{tournament.title}</h3>
        {tournament.description && (
          <p className="text-sm text-muted-light mb-4 line-clamp-2">{tournament.description}</p>
        )}

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center justify-center gap-1 bg-white/[0.03] rounded-lg py-2.5 px-1 border border-white/5">
            <Users className="w-3.5 h-3.5 text-muted-light" />
            <p className="text-xs font-bold text-white">{tournament.max_participants > 0 ? `${tournament.max_participants}` : "∞"}</p>
            <p className="text-[10px] text-muted">Max</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 bg-white/[0.03] rounded-lg py-2.5 px-1 border border-white/5">
            <Coins className="w-3.5 h-3.5 text-accent-orange" />
            <p className="text-xs font-bold text-white">{tournament.rewards_config?.coin_pool?.toLocaleString() ?? "—"}</p>
            <p className="text-[10px] text-muted">Prize</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 bg-white/[0.03] rounded-lg py-2.5 px-1 border border-white/5">
            <Signal className="w-3.5 h-3.5 text-primary-light" />
            <p className="text-xs font-bold text-white">{tournament.type.toUpperCase()}</p>
            <p className="text-[10px] text-muted">Type</p>
          </div>
        </div>

        {!isPast && (
          <div className="flex items-center gap-2 mb-4 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
            <Clock className="w-3.5 h-3.5 text-primary-light flex-shrink-0" />
            <span className="text-xs text-muted-light">
              {tournament.status === "live" ? "Ends in" : "Starts in"}
            </span>
            <span className="text-sm font-bold text-white tabular-nums ml-auto">
              {String(countdown.d).padStart(2, "0")}:{String(countdown.h).padStart(2, "0")}:{String(countdown.m).padStart(2, "0")}:{String(countdown.s).padStart(2, "0")}
            </span>
          </div>
        )}

        {isLoading ? (
          <Button variant="outline" className="w-full" disabled>
            <Loader2 className="w-4 h-4 animate-spin" />
          </Button>
        ) : canEnter ? (
          <Button variant="primary" className="w-full" glow onClick={onEnter}>
            <Play className="w-4 h-4" /> Enter Tournament
          </Button>
        ) : canRegister ? (
          <Button variant="primary" className="w-full" glow onClick={onRegister}>
            <Check className="w-4 h-4" /> Register Now
          </Button>
        ) : canUnregister ? (
          <Button variant="outline" className="w-full" onClick={onRegister}>
            <X className="w-4 h-4" /> Cancel Registration
          </Button>
        ) : isPast && isRegistered ? (
          <Button variant="primary" className="w-full" onClick={onViewResults}>
            <Eye className="w-4 h-4" /> View Results
          </Button>
        ) : isPast ? (
          <Button variant="outline" className="w-full" disabled>
            <Award className="w-4 h-4" /> Completed
          </Button>
        ) : isRegistered ? (
          <Button variant="outline" className="w-full" disabled>
            <Check className="w-4 h-4" /> Registered
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            <Clock className="w-4 h-4" /> Waiting
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/* ==================================================================== */
/*  Hero Banner                                                          */
/* ==================================================================== */

function HeroBanner({ tournaments, onAction }: {
  tournaments: Tournament[];
  onAction: (action: string, t: Tournament) => void;
}) {
  const primaryTournament = tournaments.find((t) => t.status === "live") ?? tournaments.find((t) => t.status === "registration_open") ?? tournaments[0];
  const hasPrimary = !!primaryTournament;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden rounded-2xl border border-border"
      style={{ background: "linear-gradient(to right, #0F0F1A, #131326)" }}
    >
      <div className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: "url(/tournaments/hero-banner-bg.png)",
          backgroundSize: "cover", backgroundPosition: "center",
          mixBlendMode: "screen",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-transparent to-cyan-600/10 pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center mb-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <Badge variant="primary" size="md">Tournament Arena</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-3 leading-none">
              COMPETE. WIN. EARN.
            </h1>
            <p className="text-muted-light text-sm md:text-base mt-2 max-w-md leading-relaxed">
              Real-time coding battles. <span className="text-primary-light font-semibold">Become a Legend.</span>
            </p>
          </div>

          {hasPrimary && (
            <div className="w-full lg:w-[300px] rounded-2xl border border-primary/20 p-5"
              style={{ background: "linear-gradient(145deg, rgba(124,58,237,0.12) 0%, rgba(15,15,42,0.9) 100%)" }}
            >
              <p className="text-[10px] text-muted-light uppercase tracking-widest mb-1">
                {primaryTournament.status === "live" ? "⚡ LIVE NOW" : primaryTournament.status === "registration_open" ? "📢 REGISTRATION OPEN" : "UPCOMING"}
              </p>
              <p className="text-lg font-bold text-white leading-tight mb-1">{primaryTournament.title}</p>
              <p className="text-xs text-muted-light mb-3">{primaryTournament.description ?? ""}</p>
              <Button
                variant="primary" size="sm" className="w-full" glow
                onClick={() => onAction(primaryTournament.status === "live" ? "enter" : primaryTournament.status === "registration_open" ? "register" : "view", primaryTournament)}
              >
                {primaryTournament.status === "live" ? <Play className="w-4 h-4" /> : primaryTournament.status === "registration_open" ? <Check className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                {primaryTournament.status === "live" ? "Enter Now" : primaryTournament.status === "registration_open" ? "Register" : "View Details"}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Active Tournaments", value: tournaments.filter((t) => t.status === "live" || t.status === "registration_open").length.toString(), icon: Trophy, color: "text-primary-light", bg: "from-violet-500/20 to-purple-600/5" },
            { label: "Total Players", value: "8,432+", icon: Users, color: "text-accent-green", bg: "from-emerald-500/20 to-green-600/5" },
            { label: "Prize Pool", value: `${tournaments.reduce((a, t) => a + (t.rewards_config?.coin_pool ?? 0), 0).toLocaleString()} TX`, icon: Coins, color: "text-accent-orange", bg: "from-yellow-500/20 to-amber-600/5" },
            { label: "Live Now", value: tournaments.filter((t) => t.status === "live").length.toString(), icon: Signal, color: "text-accent-red", bg: "from-red-500/20 to-rose-600/5" },
          ].map((stat) => (
            <div key={stat.label} className={cn("relative rounded-xl p-4 border border-white/5 transition-all duration-300 bg-gradient-to-br", stat.bg, "hover:border-white/10")}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={cn("w-4 h-4 flex-shrink-0", stat.color)} />
                <span className="text-[11px] uppercase tracking-wider text-muted-light font-medium">{stat.label}</span>
              </div>
              <p className="text-2xl font-extrabold text-white tabular-nums leading-none">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ==================================================================== */
/*  Leaderboard                                                          */
/* ==================================================================== */

function LeaderboardSection({ tournamentId }: { tournamentId?: string }) {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tournamentId) return;
    setLoading(true);
    getTournamentLeaderboard(tournamentId)
      .then(setLeaders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tournamentId]);

  if (!tournamentId) {
    return (
      <Card hover={false} className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Leaderboard</h3>
        </div>
        <div className="px-5 pb-5 text-sm text-muted-light">
          No active tournament to display rankings.
        </div>
      </Card>
    );
  }

  const rankStyles: Record<number, string> = {
    1: "bg-amber-400/20 text-amber-400 ring-amber-400/30",
    2: "bg-gray-300/20 text-gray-300 ring-gray-300/30",
    3: "bg-amber-700/20 text-amber-700 ring-amber-700/30",
  };

  return (
    <Card hover={false} className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Leaderboard</h3>
        </div>
        {!loading && leaders.length > 0 && (
          <Badge variant="primary" size="sm">{leaders.length} Players</Badge>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-muted-light animate-spin" />
        </div>
      ) : leaders.length === 0 ? (
        <div className="px-5 pb-5 text-sm text-muted-light">No scores yet. Be the first!</div>
      ) : (
        <div className="px-2 pb-3 space-y-0.5">
          {leaders.map((entry, i) => (
            <div key={entry.user_id} className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors",
              "hover:bg-white/[0.03]"
            )}>
              <span className={cn(
                "flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold",
                rankStyles[entry.rank] ?? "text-muted"
              )}>
                {entry.rank}
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                {entry.username?.substring(0, 2).toUpperCase() || entry.full_name?.substring(0, 2).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{entry.username || entry.full_name || "Unknown"}</p>
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums">{entry.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ==================================================================== */
/*  Upcoming Tournaments Sidebar                                         */
/* ==================================================================== */

function UpcomingTournamentsList({ tournaments, registrations, onAction }: {
  tournaments: Tournament[];
  registrations: TournamentRegistration[];
  onAction: (action: string, t: Tournament) => void;
}) {
  if (tournaments.length === 0) {
    return (
      <Card hover={false} className="p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <Calendar className="w-4 h-4 text-primary-light" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Upcoming</h3>
        </div>
        <div className="px-5 pb-5 text-sm text-muted-light">No upcoming tournaments scheduled.</div>
      </Card>
    );
  }

  return (
    <Card hover={false} className="p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-light" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Upcoming</h3>
        </div>
      </div>

      <div className="px-3 pb-3 space-y-1">
        {tournaments.map((t, i) => {
          const reg = registrations.find((r) => r.tournament_id === t.id);
          const startDate = new Date(t.start_at);

          return (
            <div key={t.id}>
              {i > 0 && <div className="mx-2 border-t border-white/[0.04]" />}
              <div className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-white/[0.03] transition-colors">
                <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary-light">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">{t.title}</p>
                  <p className="text-[11px] text-muted mt-0.5">{startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                  {t.rewards_config?.coin_pool && (
                    <p className="text-[11px] font-semibold text-amber-400 mt-0.5">🏆 {t.rewards_config.coin_pool.toLocaleString()} TX</p>
                  )}
                </div>
                <Button
                  variant={reg ? "outline" : "primary"}
                  size="sm"
                  className="flex-shrink-0 text-[11px] px-3 py-1"
                  onClick={() => onAction("register", t)}
                >
                  {reg ? "Registered" : "Join"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ==================================================================== */
/*  Main Page                                                            */
/* ==================================================================== */

export default function TournamentsPage() {
  const { activeTournaments, upcomingTournaments, completedTournaments, registrations, isLoading, refetch } = useTournaments();
  const { user } = useAuth();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});

  // Modal states
  const [enteringTournament, setEnteringTournament] = useState<Tournament | null>(null);
  const [pvPMatchCategory, setPvPMatchCategory] = useState<PvPCategory | null>(null);
  const [viewingResults, setViewingResults] = useState<Tournament | null>(null);
  const [viewingResultsData, setViewingResultsData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const ids = activeTournaments.map((t) => t.id);
    if (ids.length === 0) return;

    let cancelled = false;
    const fetch = async () => {
      const counts: Record<string, number> = {};
      for (const id of ids) {
        try {
          counts[id] = await getRegistrationCount(id);
        } catch { /* ignore */ }
      }
      if (!cancelled) setParticipantCounts(counts);
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [activeTournaments]);

  const handleAction = async (action: string, tournament: Tournament) => {
    if (!user) return;

    if (action === "enter") {
      if (tournament.status === "live") {
        setEnteringTournament(tournament);
      }
      return;
    }

    if (action === "view") {
      // View results of a completed tournament
      if (tournament.status === "completed") {
        setViewingResults(tournament);
        try {
          const leaders = await getTournamentLeaderboard(tournament.id);
          setViewingResultsData(leaders);
        } catch { /* ignore */ }
      }
      return;
    }

    setActionLoading(tournament.id);
    try {
      const existingReg = registrations.find((r) => r.tournament_id === tournament.id);
      if (action === "unregister" || (existingReg && tournament.status === "registration_open")) {
        await cancelRegistration(tournament.id);
      } else if (action === "register" || tournament.status === "registration_open") {
        await registerForTournament(tournament.id);
      }
      refetch();
    } catch (e) {
      console.error("Action failed:", e);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-light animate-spin mx-auto mb-4" />
          <p className="text-muted-light">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-screen"
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        {/* Main Column */}
        <div className="space-y-8 min-w-0">
          <HeroBanner tournaments={activeTournaments} onAction={handleAction} />

          {/* Active Tournaments */}
          {activeTournaments.length > 0 && (
            <section>
              <SectionHeader
                icon={<Trophy className="w-5 h-5 text-primary-light" />}
                title={activeTournaments.some((t) => t.status === "live") ? "⚡ Live Tournaments" : "📢 Registration Open"}
                subtitle={activeTournaments.some((t) => t.status === "live") ? "Compete now in active battles" : "Secure your spot in upcoming competitions"}
                count={activeTournaments.length}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTournaments.map((t) => {
                  const reg = registrations.find((r) => r.tournament_id === t.id);
                  return (
                    <div key={t.id} className="relative">
                      {actionLoading === t.id && (
                        <div className="absolute inset-0 z-20 bg-black/40 rounded-2xl flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-primary-light animate-spin" />
                        </div>
                      )}
                      <TournamentCard
                        tournament={t}
                        registration={reg}
                        onRegister={() => handleAction("register", t)}
                        onEnter={() => handleAction("enter", t)}
                        onViewResults={() => handleAction("view", t)}
                        isLoading={actionLoading === t.id}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* PvP Arena */}
          <PvpArenaSection onStartMatch={(cat) => setPvPMatchCategory(cat)} />

          {/* Completed Tournaments */}
          {completedTournaments.length > 0 && (
            <section>
              <SectionHeader
                icon={<Award className="w-5 h-5 text-accent-orange" />}
                title="Past Tournaments"
                subtitle="View final standings and rewards"
                count={completedTournaments.length}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {completedTournaments.slice(0, 3).map((t) => {
                  const reg = registrations.find((r) => r.tournament_id === t.id);
                  return (
                    <TournamentCard
                      key={t.id}
                      tournament={t}
                      registration={reg}
                      onRegister={() => {}}
                      onEnter={() => {}}
                      onViewResults={() => handleAction("view", t)}
                      isLoading={false}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Rewards */}
          <TournamentRewardsSection />
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-5">
          <UpcomingTournamentsList
            tournaments={upcomingTournaments}
            registrations={registrations}
            onAction={handleAction}
          />
          <LeaderboardSection tournamentId={activeTournaments.find((t) => t.status === "live")?.id ?? activeTournaments.find((t) => t.status === "registration_open")?.id} />
        </aside>
      </div>

      {/* Tournament Play Modal */}
      {enteringTournament && user && (
        <TournamentPlayModal
          tournament={enteringTournament}
          onClose={() => { setEnteringTournament(null); refetch(); }}
        />
      )}

      {/* PvP Match Modal */}
      {pvPMatchCategory && user && (
        <PvPMatchModal
          category={pvPMatchCategory}
          onClose={() => { setPvPMatchCategory(null); }}
          currentUserId={user.id}
        />
      )}

      {/* View Results Modal */}
      {viewingResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-[#0e1220] border border-white/10 rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent-pink to-secondary" />
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Results — {viewingResults.title}</h3>
              <button onClick={() => { setViewingResults(null); setViewingResultsData([]); }}
                className="p-1 rounded-lg hover:bg-white/5 text-muted-light hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {viewingResultsData.length === 0 ? (
                <p className="text-sm text-muted-light text-center py-8">No results yet.</p>
              ) : (
                <div className="space-y-2">
                  {viewingResultsData.map((entry, i) => (
                    <div key={entry.user_id} className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-colors",
                      i === 0 ? "bg-amber-400/10 border border-amber-400/20" : "bg-white/[0.02] border border-white/5",
                    )}>
                      <span className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                        i === 0 ? "bg-amber-400/20 text-amber-400" :
                        i === 1 ? "bg-slate-300/20 text-slate-300" :
                        i === 2 ? "bg-amber-700/20 text-amber-700" :
                        "bg-white/5 text-muted",
                      )}>
                        {entry.rank}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {entry.username?.substring(0, 2).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{entry.username || entry.full_name || "Unknown"}</p>
                      </div>
                      <span className="text-sm font-bold text-white tabular-nums">{entry.score.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

/* ==================================================================== */
/*  PvP Arena Section                                                    */
/* ==================================================================== */

function PvpArenaSection({ onStartMatch }: { onStartMatch: (cat: PvPCategory) => void }) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<PvPCategory>("javascript");

  const categories = [
    { id: "javascript" as PvPCategory, label: "JavaScript", icon: "JS", color: "#f7df1e", bg: "from-yellow-600/10 to-yellow-800/5" },
    { id: "react" as PvPCategory, label: "React", icon: "⚛", color: "#61dafb", bg: "from-cyan-600/10 to-blue-800/5" },
    { id: "algorithms" as PvPCategory, label: "Algorithms", icon: "Δ", color: "#8b5cf6", bg: "from-violet-600/10 to-purple-800/5" },
    { id: "python" as PvPCategory, label: "Python", icon: "🐍", color: "#3776ab", bg: "from-blue-600/10 to-indigo-800/5" },
  ];

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <SectionHeader
        icon={<Swords className="w-5 h-5 text-primary-light" />}
        title="PVP Arena"
        subtitle="Challenge other players in real-time coding duels"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="group relative rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(124,58,237,0.15)] hover:border-primary/20"
          style={{ background: "linear-gradient(145deg, #0c1230 0%, #0f0f2e 50%, #0d1435 100%)" }}>
          <div className="absolute inset-0 opacity-25 pointer-events-none"
            style={{ backgroundImage: "url(/tournaments/pvp-arena-bg.png)", backgroundSize: "cover", backgroundPosition: "center", mixBlendMode: "screen" }}
          />
          <div className="relative z-10 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 flex items-center justify-center">
                <Swords className="w-5 h-5 text-primary-light" />
              </div>
              <Badge variant="primary" size="sm">PvP</Badge>
            </div>
            <h3 className="text-xl font-extrabold text-white mb-1.5 tracking-tight">1V1 ARENA</h3>
            <p className="text-sm text-muted-light mb-6">Compete against other learners in real-time knowledge battles</p>

            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center w-full">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/30" />
                <div className="mx-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)] border-2 border-primary-light/30 flex-shrink-0">
                  <span className="text-sm font-black text-white">VS</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/30" />
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              glow
              disabled={!user}
              onClick={() => onStartMatch(selectedCategory)}
            >
              <Swords className="w-4 h-4" /> Fight Now
            </Button>
          </div>
        </div>

        <div className="group relative rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:border-accent-orange/20"
          style={{ background: "linear-gradient(145deg, #1a1206 0%, #1e150a 50%, #191008 100%)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 30%, rgba(245,158,11,0.08) 0%, transparent 60%)" }} />
          <div className="relative z-10 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent-orange" />
              </div>
              <Badge variant="warning" size="sm">Quick</Badge>
            </div>
            <h3 className="text-xl font-extrabold text-white mb-1.5 tracking-tight">QUICK MATCH</h3>
            <p className="text-sm text-muted-light mb-6">Find a random opponent in your skill range for a fast duel</p>

            <div className="mb-6">
              <p className="text-xs text-muted-light mb-2 uppercase tracking-wider">Select Category</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                      selectedCategory === cat.id
                        ? "border-primary/40 bg-primary/10 text-primary-light"
                        : "border-white/5 bg-white/[0.03] text-muted-light hover:border-white/10",
                    )}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              glow
              disabled={!selectedCategory || !user}
              onClick={() => onStartMatch(selectedCategory)}
            >
              <Zap className="w-4 h-4" /> Quick Match
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 px-5 py-3.5 flex items-center justify-between gap-4"
        style={{ background: "linear-gradient(90deg, rgba(139,92,246,0.08) 0%, rgba(15,15,26,0.9) 50%, rgba(239,68,68,0.06) 100%)" }}>
        <div className="flex items-center gap-3 min-w-0">
          <Swords className="w-4 h-4 text-primary-light" />
          <span className="text-sm font-bold text-white uppercase tracking-wide">PvP Battles</span>
          <span className="text-xs text-muted-light">Real-time 1v1 coding duels</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Badge variant="primary" size="sm">LIVE</Badge>
        </div>
      </div>
    </motion.section>
  );
}

/* ==================================================================== */
/*  Tournament Rewards Section                                           */
/* ==================================================================== */

const REWARD_TIERS = [
  { place: "1st Place", title: "Champion", coins: "10,000 TX", badge: "Legendary", variant: "gold", image: "/tournaments/gold-trophy.png",
    style: { textColor: "text-amber-400", borderColor: "border-amber-500/30", glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.15)]", bgGradient: "linear-gradient(145deg, #1a1508 0%, #221a06 100%)", iconColor: "text-amber-400" } },
  { place: "2nd Place", title: "Elite", coins: "7,500 TX", badge: "Elite", variant: "silver", image: "/tournaments/silver-trophy.png",
    style: { textColor: "text-slate-300", borderColor: "border-slate-400/20", glowColor: "shadow-[0_0_15px_rgba(148,163,184,0.1)]", bgGradient: "linear-gradient(145deg, #0f1218 0%, #151a22 100%)", iconColor: "text-slate-300" } },
  { place: "3rd Place", title: "Veteran", coins: "5,000 TX", badge: "Rare", variant: "bronze", image: "/tournaments/bronze-trophy.png",
    style: { textColor: "text-amber-700", borderColor: "border-amber-800/20", glowColor: "shadow-[0_0_15px_rgba(180,83,9,0.1)]", bgGradient: "linear-gradient(145deg, #181008 0%, #1e1510 100%)", iconColor: "text-amber-700" } },
  { place: "Top 4-10", title: "Contender", coins: "2,500 TX", badge: "Epic", variant: "purple",
    style: { textColor: "text-primary-light", borderColor: "border-primary/20", glowColor: "", bgGradient: "linear-gradient(145deg, #0e0e1e 0%, #13132a 100%)", iconColor: "text-primary-light" } },
  { place: "Top 11-50", title: "Participant", coins: "500 TX", badge: "Common", variant: "gray",
    style: { textColor: "text-muted-light", borderColor: "border-white/5", glowColor: "", bgGradient: "linear-gradient(145deg, #0c0c16 0%, #101020 100%)", iconColor: "text-muted-light" } },
];

function TournamentRewardsSection() {
  return (
    <section>
      <SectionHeader
        icon={<Trophy className="w-5 h-5 text-accent-orange" />}
        title="Tournament Rewards"
        subtitle="Compete to win amazing prizes"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {REWARD_TIERS.map((reward) => {
          const s = reward.style;
          return (
            <motion.div
              key={reward.place}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn("group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1", s.borderColor, s.glowColor)}
              style={{ background: s.bgGradient }}
            >
              <div className="p-4 flex flex-col items-center text-center">
                {reward.image ? (
                  <div className="relative w-20 h-20 mb-3 group-hover:scale-105 transition-transform duration-300">
                    <img src={reward.image} alt={reward.place} className="object-contain drop-shadow-lg w-full h-full" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Award className={cn("w-7 h-7", s.iconColor)} />
                  </div>
                )}
                <p className={cn("text-xs font-bold uppercase tracking-wider mb-0.5 leading-tight", s.textColor)}>
                  {reward.place}
                </p>
                <p className="text-sm font-bold text-white mb-3 leading-tight">{reward.title}</p>
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-center gap-1.5 bg-white/5 rounded-lg py-1.5 px-2 border border-white/5">
                    <Coins className="w-3 h-3 text-accent-orange flex-shrink-0" />
                    <span className="text-xs font-semibold text-white">{reward.coins}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 bg-white/[0.03] rounded-lg py-1.5 px-2 border border-white/5">
                    <Star className="w-3 h-3 flex-shrink-0" />
                    <span className={cn("text-xs font-medium", s.textColor)}>{reward.badge} Badge</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

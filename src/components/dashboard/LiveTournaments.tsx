"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Swords, Trophy, Clock, Users, Zap, Sparkles, ChevronRight, Play } from "lucide-react";
import { useSound } from "@/lib/hooks/useSound";

interface Tournament {
  id: string;
  title: string;
  subtitle: string;
  type: "pvp" | "league" | "boss";
  endsAt: string;
  rewardXp: number;
  rewardCoins: number;
  participants: number;
  maxParticipants?: number;
  joined: boolean;
  intensity: "low" | "medium" | "high" | "critical";
}

const mockTournaments: Tournament[] = [
  {
    id: "t1",
    title: "AI Prompting Arena: PvP Speedrun",
    subtitle: "Out-prompt your opponent in 5-minute code battles",
    type: "pvp",
    endsAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(), // 45 mins from now
    rewardXp: 1500,
    rewardCoins: 150,
    participants: 84,
    maxParticipants: 100,
    joined: false,
    intensity: "high",
  },
  {
    id: "t2",
    title: "TypeScript Masters Championship",
    subtitle: "Weekly elite competitive coding league",
    type: "league",
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days
    rewardXp: 5000,
    rewardCoins: 500,
    participants: 1243,
    joined: true,
    intensity: "critical",
  },
  {
    id: "t3",
    title: "Global React Combat: Module 4 Battle",
    subtitle: "Defeat the React Hooks boss with your squad",
    type: "boss",
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(), // 6 hours
    rewardXp: 2500,
    rewardCoins: 200,
    participants: 312,
    maxParticipants: 500,
    joined: false,
    intensity: "medium",
  }
];

export function LiveTournaments() {
  const { playClick, playRewardClaim } = useSound();
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [timers, setTimers] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTimers = () => {
      const updated: Record<string, string> = {};
      tournaments.forEach((t) => {
        const diff = new Date(t.endsAt).getTime() - Date.now();
        if (diff <= 0) {
          updated[t.id] = "ENDED";
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);

          if (days > 0) {
            updated[t.id] = `${days}d ${hours}h left`;
          } else if (hours > 0) {
            updated[t.id] = `${hours}h ${mins}m left`;
          } else {
            updated[t.id] = `${mins}m ${secs}s left`;
          }
        }
      });
      setTimers(updated);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [tournaments]);

  const handleJoin = (id: string) => {
    playClick();
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newJoined = !t.joined;
          if (newJoined) {
            setTimeout(() => playRewardClaim(), 150);
          }
          return {
            ...t,
            joined: newJoined,
            participants: newJoined ? t.participants + 1 : t.participants - 1,
          };
        }
        return t;
      })
    );
  };

  const getIntensityBadgeColor = (intensity: string) => {
    switch (intensity) {
      case "critical":
        return "text-accent-red border-accent-red/30 bg-accent-red/10 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse";
      case "high":
        return "text-accent-pink border-accent-pink/30 bg-accent-pink/10 shadow-[0_0_8px_rgba(236,72,153,0.15)]";
      case "medium":
        return "text-primary-light border-primary/30 bg-primary/10";
      default:
        return "text-accent-green border-accent-green/30 bg-accent-green/10";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-accent-pink/15 border border-accent-pink/30 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.25)]">
            <Swords className="w-5 h-5 text-accent-pink animate-float" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide uppercase flex items-center gap-2">
              Live Arenas & PvP <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent-pink animate-ping" />
            </h2>
            <p className="text-xs text-muted-light">Esports-grade coding challenges & tournaments</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {tournaments.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="group"
          >
            <Card className="relative overflow-hidden border-white/5 bg-gradient-to-r from-surface to-surface-light group-hover:border-accent-pink/30 transition-all duration-300 !p-5">
              {/* Glow accent */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent-pink/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {t.joined && (
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-pink to-primary shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${getIntensityBadgeColor(t.intensity)}`}>
                      {t.type} · {t.intensity}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-accent-orange font-semibold bg-accent-orange/10 border border-accent-orange/20 px-2 py-0.5 rounded-md">
                      <Clock className="w-3.5 h-3.5" />
                      {timers[t.id] || "Calculating..."}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-accent-pink transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-xs text-muted-light">{t.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-light">
                      <Users className="w-4 h-4 text-primary-light" />
                      <span className="font-semibold text-foreground">
                        {t.participants.toLocaleString()}
                      </span>
                      <span className="text-[10px]">competitors</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-primary-light bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full font-bold">
                      <Zap className="w-3.5 h-3.5 text-primary-light" />
                      <span>+{t.rewardXp} XP</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-0.5 rounded-full font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      <span>+{t.rewardCoins} TX</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center md:self-center">
                  <Button
                    onClick={() => handleJoin(t.id)}
                    variant={t.joined ? "ghost" : "primary"}
                    className={`w-full md:w-auto font-bold px-6 py-2.5 text-xs rounded-xl transition-all duration-300 ${
                      t.joined
                        ? "border-accent-pink/30 text-accent-pink bg-accent-pink/5 hover:bg-accent-pink/15"
                        : "bg-gradient-to-r from-accent-pink to-primary hover:from-primary hover:to-accent-pink text-white shadow-accent-pink/20 hover:shadow-primary/30"
                    }`}
                  >
                    {t.joined ? (
                      <span className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 animate-bounce" /> Registered
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5" /> Enter Arena
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

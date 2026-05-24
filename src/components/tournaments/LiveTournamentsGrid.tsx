"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Users,
  Coins,
  Signal,
  Zap,
  Brain,
  Mic,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  liveTournaments as defaultLiveTournaments,
  DIFFICULTY_CONFIG,
  type TournamentCard,
} from "@/components/tournaments/data";
import { useTournaments } from "@/components/providers/TournamentProvider";

/* ───────────────────── icon map ───────────────────── */
const ICON_MAP: Record<TournamentCard["iconName"], React.ElementType> = {
  zap: Zap,
  brain: Brain,
  mic: Mic,
  code: Zap,
  globe: Zap,
  shield: Zap,
};

/* ───────────────────── countdown hook ───────────────────── */
function useCountdowns(tournaments: TournamentCard[]) {
  const [times, setTimes] = useState<string[]>([]);

  useEffect(() => {
    const calc = () =>
      tournaments.map((t) => {
        const diff = Math.max(0, new Date(t.endTime).getTime() - Date.now());
        const h = Math.floor(diff / 3_600_000);
        const m = Math.floor((diff % 3_600_000) / 60_000);
        const s = Math.floor((diff % 60_000) / 1_000);
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimes(calc());
    const id = setInterval(() => setTimes(calc()), 1_000);
    return () => clearInterval(id);
  }, [tournaments]);

  return times;
}

/* ───────────────────── animations ───────────────────── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const cardAnim = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

/* ───────────────────── stat block subcomponent ───────────────────── */
function StatBlock({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 bg-white/[0.03] rounded-lg py-2.5 px-1 border border-white/5 min-h-0 h-auto overflow-hidden">
      <div className="flex-shrink-0">{icon}</div>
      <p className="text-xs font-bold text-white whitespace-nowrap leading-tight">{value}</p>
      <p className="text-[10px] text-muted leading-tight whitespace-nowrap">{label}</p>
    </div>
  );
}

/* ───────────────────── component ───────────────────── */
export function LiveTournamentsGrid() {
  const { tournaments, isHydrated } = useTournaments();

  const liveItems = isHydrated
    ? tournaments.filter((t) => t.status === "LIVE")
    : defaultLiveTournaments;

  const countdowns = useCountdowns(liveItems);

  return (
    <motion.section variants={container} initial="hidden" animate="show">
      {/* header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent-red animate-pulse flex-shrink-0" />
          <h2 className="text-lg font-bold text-white uppercase tracking-wide">
            Live Tournaments
          </h2>
          <Badge variant="danger" size="sm">
            {liveItems.length} Live
          </Badge>
        </div>
        <button className="text-sm text-muted-light hover:text-primary-light transition-colors flex items-center gap-1 group cursor-pointer">
          View All <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {liveItems.map((t, i) => {
          const Icon = ICON_MAP[t.iconName] || Zap;
          const diffConfig = DIFFICULTY_CONFIG[t.difficulty] || DIFFICULTY_CONFIG.Medium;

          return (
            <motion.div
              key={t.id}
              variants={cardAnim}
              className="group relative rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(124,58,237,0.15)] hover:border-primary/20 flex flex-col"
              style={{ background: t.gradient }}
            >
              {/* pattern overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: t.overlayPattern }} />

              {/* LIVE pill */}
              <div className="absolute top-4 left-4 z-20">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-red/90 text-white text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </span>
              </div>

              {/* card content — flex-col to push button to bottom */}
              <div className="relative z-10 p-5 pt-14 flex flex-col flex-1">
                {/* icon + title */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-light" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-white leading-tight truncate">
                      {t.title}
                    </h3>
                    <p className="text-xs text-muted-light mt-0.5 truncate">{t.category}</p>
                  </div>
                </div>

                {/* countdown */}
                <div className="flex items-center gap-2 mb-4 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                  <Clock className="w-3.5 h-3.5 text-primary-light flex-shrink-0" />
                  <span className="text-xs text-muted-light whitespace-nowrap">Ends in</span>
                  <span className="text-sm font-bold text-white tabular-nums ml-auto whitespace-nowrap">
                    {countdowns[i] || "00:00:00"}
                  </span>
                </div>

                {/* metadata row — isolated flex columns with safe spacing */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <StatBlock
                    icon={<Users className="w-3.5 h-3.5 text-muted-light" />}
                    value={t.participants.toLocaleString()}
                    label="Players"
                  />
                  <StatBlock
                    icon={<Coins className="w-3.5 h-3.5 text-accent-orange" />}
                    value={t.prizeDisplay || `${t.prizePool.toLocaleString()} TX`}
                    label="Prize Pool"
                  />
                  <StatBlock
                    icon={<Signal className="w-3.5 h-3.5" style={{ color: diffConfig.cssColor }} />}
                    value={t.difficulty}
                    label="Difficulty"
                  />
                </div>

                {/* join button — pushed to bottom via flex-1 parent */}
                <div className="mt-auto pt-1">
                  <Button variant="primary" className="w-full" glow>
                    <Zap className="w-4 h-4" /> Join Now
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Users, Coins, Crown, Timer, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { heroStats, currentSeason, type HeroStat } from "@/components/tournaments/data";

/* ───────────────────── icon map ───────────────────── */
const ICON_MAP: Record<HeroStat["iconName"], React.ElementType> = {
  crown: Crown,
  star: Star,
  users: Users,
  coins: Coins,
};

/* ───────────────────── countdown hook ───────────────────── */
function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    const d = Math.floor(diff / 86_400_000);
    const h = Math.floor((diff % 86_400_000) / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    return { d, h, m, s };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc), 1_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return time;
}

/* ───────────────────── animations ───────────────────── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

/* ───────────────────── component ───────────────────── */
export function HeroBanner() {
  const seasonEnd = new Date(currentSeason.endDate);
  const countdown = useCountdown(seasonEnd);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-2xl border border-border"
      style={{
        background: "linear-gradient(to right, #0F0F1A, #131326)",
      }}
    >
      {/* background image overlay */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: "url(/tournaments/hero-banner-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "screen",
        }}
      />

      {/* gradient mesh overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-transparent to-cyan-600/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />

      {/* animated particles */}
      <div className="absolute top-4 left-8 w-2 h-2 rounded-full bg-primary-light/60 animate-particle-float pointer-events-none" />
      <div className="absolute top-12 right-16 w-1.5 h-1.5 rounded-full bg-secondary/50 animate-particle-float pointer-events-none" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-8 left-1/3 w-1 h-1 rounded-full bg-accent-orange/40 animate-particle-float pointer-events-none" style={{ animationDelay: "2s" }} />

      {/* ── Main content grid ── */}
      <div className="relative z-10 p-6 md:p-8">
        {/* Top row: CSS Grid for precise alignment */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center mb-8">
          {/* Left: title block */}
          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] flex-shrink-0">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <Badge variant="primary" size="md">Season {currentSeason.number} Active</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-3 leading-none">
              TOURNAMENTS
            </h1>
            <p className="text-muted-light text-sm md:text-base mt-2 max-w-md leading-relaxed">
              Compete. Win. Earn. <span className="text-primary-light font-semibold">Become a Legend.</span>
            </p>
          </motion.div>

          {/* Right: season card — fixed width, vertically centered */}
          <motion.div
            variants={item}
            className="w-full lg:w-[280px] rounded-2xl border border-primary/20 p-5 flex-shrink-0"
            style={{ background: "linear-gradient(145deg, rgba(124,58,237,0.12) 0%, rgba(15,15,42,0.9) 100%)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-primary-light" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-light uppercase tracking-widest">Current Season</p>
                <p className="text-lg font-bold text-white leading-tight">{currentSeason.name}</p>
              </div>
            </div>

            {/* countdown label */}
            <div className="flex items-center gap-1.5 mb-3">
              <Timer className="w-3.5 h-3.5 text-primary-light flex-shrink-0" />
              <span className="text-[11px] text-muted-light">Ends in</span>
            </div>

            {/* countdown grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { val: countdown.d, label: "Days" },
                { val: String(countdown.h).padStart(2, "0"), label: "Hrs" },
                { val: String(countdown.m).padStart(2, "0"), label: "Min" },
                { val: String(countdown.s).padStart(2, "0"), label: "Sec" },
              ].map((t) => (
                <div key={t.label} className="flex flex-col items-center">
                  <div className="w-full text-center text-xl font-bold text-white tabular-nums bg-white/5 rounded-lg py-1.5 border border-white/5 leading-none">
                    {t.val}
                  </div>
                  <span className="text-[9px] text-muted uppercase tracking-wider mt-1.5">{t.label}</span>
                </div>
              ))}
            </div>

            <Button variant="primary" size="sm" className="w-full" glow>
              <Award className="w-4 h-4" /> Season Rewards
            </Button>
          </motion.div>
        </div>

        {/* Stat badges — uniform 4-column grid */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {heroStats.map((stat) => {
            const Icon = ICON_MAP[stat.iconName];
            return (
              <div
                key={stat.id}
                className={cn(
                  "relative rounded-xl p-4 border border-white/5 transition-all duration-300",
                  "bg-gradient-to-br",
                  stat.bgGlow,
                  "hover:border-white/10 hover:scale-[1.02]"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn("w-4 h-4 flex-shrink-0", stat.iconColor)} />
                  <span className="text-[11px] uppercase tracking-wider text-muted-light font-medium whitespace-nowrap">{stat.label}</span>
                </div>
                <p className="text-2xl font-extrabold text-white tabular-nums leading-none">{stat.value}</p>
                <p className={cn("text-xs mt-1", stat.subColor)}>{stat.sub}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}

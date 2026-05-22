"use client";
import { motion } from "framer-motion";
import {
  Swords,
  Zap,
  ChevronRight,
  Users,
  Diamond,
  Eye,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { arenaModes, liveBattlesData, type ArenaMode } from "@/components/tournaments/data";

/* ───────────────────── animations ───────────────────── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ───────────────────── arena card styles ───────────────────── */
const VARIANT_STYLES: Record<
  ArenaMode["variant"],
  {
    bg: string;
    iconBg: string;
    iconBorder: string;
    badgeVariant: "primary" | "warning";
    hoverShadow: string;
    hoverBorder: string;
    iconElement: React.ElementType;
    iconClass: string;
  }
> = {
  purple: {
    bg: "linear-gradient(145deg, #0c1230 0%, #0f0f2e 50%, #0d1435 100%)",
    iconBg: "from-violet-600/20 to-blue-600/20",
    iconBorder: "border-violet-500/20",
    badgeVariant: "primary",
    hoverShadow: "hover:shadow-[0_0_25px_rgba(124,58,237,0.15)]",
    hoverBorder: "hover:border-primary/20",
    iconElement: Swords,
    iconClass: "text-primary-light",
  },
  gold: {
    bg: "linear-gradient(145deg, #1a1206 0%, #1e150a 50%, #191008 100%)",
    iconBg: "from-amber-600/20 to-orange-600/20",
    iconBorder: "border-amber-500/20",
    badgeVariant: "warning",
    hoverShadow: "hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]",
    hoverBorder: "hover:border-accent-orange/20",
    iconElement: Zap,
    iconClass: "text-accent-orange",
  },
};

/* ───────────────────── component ───────────────────── */
export function PvpArena() {
  return (
    <motion.section variants={container} initial="hidden" animate="show">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Swords className="w-5 h-5 text-primary-light flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wide leading-tight">
              PVP Arena
            </h2>
            <p className="text-xs text-muted-light mt-0.5">Fight. Win. Climb the ranks.</p>
          </div>
        </div>
        <button className="text-sm text-muted-light hover:text-primary-light transition-colors flex items-center gap-1 group cursor-pointer">
          View Arena <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* arena cards — synchronized 2-column grid with consistent gap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        {arenaModes.map((mode) => {
          const style = VARIANT_STYLES[mode.variant];
          const IconEl = style.iconElement;

          return (
            <motion.div
              key={mode.id}
              variants={item}
              className={cn(
                "group relative rounded-2xl border border-white/5 overflow-hidden transition-all duration-300",
                "hover:-translate-y-1",
                style.hoverShadow,
                style.hoverBorder
              )}
              style={{ background: style.bg }}
            >
              {/* background image — only for 1v1 */}
              {mode.variant === "purple" && (
                <>
                  <div
                    className="absolute inset-0 opacity-25 group-hover:opacity-35 transition-opacity pointer-events-none"
                    style={{
                      backgroundImage: "url(/tournaments/pvp-arena-bg.png)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      mixBlendMode: "screen",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1230]/90 via-[#0c1230]/40 to-transparent pointer-events-none" />
                </>
              )}

              {/* gold glow overlay for Quick Match */}
              {mode.variant === "gold" && (
                <>
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 30%, rgba(245,158,11,0.08) 0%, transparent 60%)" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1206]/90 via-transparent to-transparent pointer-events-none" />
                </>
              )}

              <div className="relative z-10 p-6 flex flex-col">
                {/* icon + badge row */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br border flex items-center justify-center flex-shrink-0", style.iconBg, style.iconBorder)}>
                    <IconEl className={cn("w-5 h-5", style.iconClass)} />
                  </div>
                  <Badge variant={style.badgeVariant} size="sm">{mode.subtitle}</Badge>
                </div>

                {/* title + description */}
                <h3 className="text-xl font-extrabold text-white mb-1.5 tracking-tight leading-tight">
                  {mode.title}
                </h3>
                <p className="text-sm text-muted-light mb-6 leading-relaxed">
                  {mode.description}
                </p>

                {/* center emblem */}
                <div className="flex items-center justify-center mb-6">
                  {mode.variant === "purple" ? (
                    /* VS divider — perfectly centered */
                    <div className="flex items-center w-full">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/30" />
                      <div className="mx-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)] border-2 border-primary-light/30 flex-shrink-0">
                        <span className="text-sm font-black text-white tracking-tighter">VS</span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/30" />
                    </div>
                  ) : (
                    /* crossed swords emblem */
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-600/10 animate-pulse" />
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center border border-amber-500/20">
                        <Swords className="w-6 h-6 text-accent-orange" style={{ transform: "rotate(-15deg)" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* online players pill — centered alignment */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse flex-shrink-0" />
                  <Users className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
                  <span className="text-sm text-accent-green font-semibold tabular-nums">
                    {mode.playersOnline.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-light">Players Online</span>
                </div>

                {/* action button */}
                <Button variant="primary" className="w-full" glow={mode.variant === "purple"}>
                  {mode.variant === "purple" ? (
                    <Swords className="w-4 h-4" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {mode.buttonLabel}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Live Battles Ticker — matches full width of arena grid above */}
      <motion.div
        variants={item}
        className="rounded-xl border border-white/5 px-5 py-3.5 flex items-center justify-between gap-4"
        style={{ background: "linear-gradient(90deg, rgba(139,92,246,0.08) 0%, rgba(15,15,26,0.9) 50%, rgba(239,68,68,0.06) 100%)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Diamond className="w-4 h-4 text-primary-light" />
            <Radio className="w-3.5 h-3.5 text-accent-red animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-white uppercase tracking-wide">Live Battles</span>
            <span className="text-xs text-muted-light ml-2 hidden sm:inline">Watch real-time battles and learn from the best!</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* stacked avatars */}
          <div className="flex -space-x-2">
            {liveBattlesData.streamers.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "w-7 h-7 rounded-full bg-gradient-to-br border-2 border-[#0f0f1a] flex items-center justify-center",
                  s.gradient
                )}
              >
                <span className="text-[8px] font-bold text-white">{s.initials}</span>
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-white tabular-nums">
              {liveBattlesData.liveBattles} <span className="text-muted-light font-normal">Live</span>
            </p>
            <div className="flex items-center gap-1 justify-end">
              <Eye className="w-3 h-3 text-muted" />
              <p className="text-[10px] text-muted tabular-nums">+{liveBattlesData.watching} watching</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}

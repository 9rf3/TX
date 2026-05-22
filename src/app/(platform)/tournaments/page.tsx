"use client";
import { motion } from "framer-motion";
import { HeroBanner } from "@/components/tournaments/HeroBanner";
import { LiveTournamentsGrid } from "@/components/tournaments/LiveTournamentsGrid";
import { PvpArena } from "@/components/tournaments/PvpArena";
import { TournamentRewards } from "@/components/tournaments/TournamentRewards";
import { UpcomingTournaments } from "@/components/tournaments/UpcomingTournaments";
import { LeaderboardSnippet } from "@/components/tournaments/LeaderboardSnippet";
import { RecentTournaments } from "@/components/tournaments/RecentTournaments";

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

export default function TournamentsPage() {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-screen"
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        {/* ─────────── Left / Main Column ─────────── */}
        <div className="space-y-8 min-w-0">
          {/* Section A: Hero Banner */}
          <HeroBanner />

          {/* Section B: Live Tournaments */}
          <LiveTournamentsGrid />

          {/* Section C: PvP Arena */}
          <PvpArena />

          {/* Section D: Tournament Rewards */}
          <TournamentRewards />
        </div>

        {/* ─────────── Right Sidebar ─────────── */}
        <aside className="space-y-5">
          {/* Section E1: Upcoming Tournaments */}
          <UpcomingTournaments />

          {/* Section E2: Leaderboard */}
          <LeaderboardSnippet />

          {/* Section E3: Recent Tournaments */}
          <RecentTournaments />
        </aside>
      </div>
    </motion.div>
  );
}

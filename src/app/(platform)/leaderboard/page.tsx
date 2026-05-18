"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { leaderboard, currentUser } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";
import { Trophy, Medal, TrendingUp, TrendingDown, Minus, Flame, Zap } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const podiumColors = ["from-amber-400 to-amber-600", "from-slate-300 to-slate-400", "from-amber-600 to-amber-800"];
const podiumIcons = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("weekly");

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Trophy className="w-7 h-7 text-accent-orange" /> Leaderboard</h1>
          <p className="text-muted-light mt-1">Compete with other learners</p>
        </div>
        <Tabs
          tabs={[{ id: "weekly", label: "Weekly" }, { id: "monthly", label: "Monthly" }, { id: "all", label: "All Time" }]}
          activeTab={period} onChange={setPeriod}
        />
      </motion.div>

      {/* Podium */}
      <motion.div variants={item} className="flex items-end justify-center gap-4 pt-6 pb-4">
        {[1, 0, 2].map((idx) => {
          const entry = leaderboard[idx];
          const heights = ["h-32", "h-24", "h-20"];
          return (
            <div key={idx} className="flex flex-col items-center gap-2">
              <Avatar name={entry.user.name} size={idx === 0 ? "xl" : "lg"} />
              <div className="text-center">
                <div className="text-sm font-bold">{entry.user.name}</div>
                <div className="text-xs text-muted">{formatNumber(entry.xp)} XP</div>
              </div>
              <div className={`w-24 ${heights[idx]} rounded-t-2xl bg-gradient-to-t ${podiumColors[idx]} flex items-center justify-center`}>
                <span className="text-3xl">{podiumIcons[idx]}</span>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Rankings */}
      <motion.div variants={item}>
        <Card hover={false} animate={false} className="!p-0 overflow-hidden">
          <div className="divide-y divide-border">
            {leaderboard.map((entry) => {
              const isMe = entry.user.id === currentUser.id;
              return (
                <motion.div key={entry.rank} variants={item}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors ${isMe ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${entry.rank <= 3 ? "bg-gradient-to-br " + podiumColors[entry.rank - 1] + " text-white" : "bg-white/10 text-muted-light"}`}>
                    {entry.rank}
                  </div>
                  <Avatar name={entry.user.name} size="md" online={entry.user.isOnline} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${isMe ? "text-primary-light" : ""}`}>{entry.user.name}</span>
                      {isMe && <Badge variant="primary">You</Badge>}
                    </div>
                    <div className="text-xs text-muted">Level {entry.level}</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-accent-orange"><Flame className="w-3.5 h-3.5" /> {entry.streak}</div>
                    <div className="flex items-center gap-1 font-semibold text-primary-light"><Zap className="w-3.5 h-3.5" /> {formatNumber(entry.xp)}</div>
                    <div className={`flex items-center gap-0.5 text-xs ${entry.change > 0 ? "text-accent-green" : entry.change < 0 ? "text-accent-red" : "text-muted"}`}>
                      {entry.change > 0 ? <TrendingUp className="w-3 h-3" /> : entry.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {Math.abs(entry.change)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

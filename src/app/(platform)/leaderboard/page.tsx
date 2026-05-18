"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Trophy } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("weekly");

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Trophy className="w-7 h-7 text-accent-orange" /> Leaderboard</h1>
          <p className="text-muted-light mt-1">Compete with other learners</p>
        </div>
        <Tabs
          tabs={[{ id: "weekly", label: "Weekly" }, { id: "monthly", label: "Monthly" }, { id: "all", label: "All Time" }]}
          activeTab={period} onChange={setPeriod}
        />
      </motion.div>

      <motion.div variants={item} className="pt-12">
        <Card hover={false} className="text-center py-20 flex flex-col justify-center items-center">
           <Trophy className="w-16 h-16 text-muted/30 mx-auto mb-4" />
           <h3 className="font-semibold text-xl text-foreground">No Leaderboard Data</h3>
           <p className="text-muted-light mt-2 max-w-md mx-auto">Complete courses and earn XP to appear on the leaderboard!</p>
        </Card>
      </motion.div>
    </motion.div>
  );
}

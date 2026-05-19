"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { AnimatedCounter } from "./AnimatedCounter";
import { Sparkles, TrendingUp } from "lucide-react";

interface TXCoinsCardProps {
  balance: number;
  rank: number;
}

export function TXCoinsCard({ balance, rank }: TXCoinsCardProps) {
  return (
    <Card className="relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/5 via-yellow-500/5 to-accent-pink/5" />
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-yellow-500/10 blur-3xl group-hover:bg-yellow-500/20 transition-all duration-700" />
      <div className="relative z-10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-accent-orange/20 border border-yellow-400/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold">TX Coins</h3>
            <p className="text-[10px] text-muted">Platform currency</p>
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <AnimatedCounter
            to={balance}
            duration={1.5}
            className="text-3xl font-black gradient-text-pink"
            formatter={v => v.toLocaleString()}
          />
          <span className="text-xs text-muted">coins</span>
        </div>
        {rank > 0 && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
            <TrendingUp className="w-3 h-3 text-accent-green" />
            <span>Earn more by completing lessons and daily rewards</span>
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
          {['Daily reward', 'Achievements', 'Streaks'].map((source, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted">
              {source}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

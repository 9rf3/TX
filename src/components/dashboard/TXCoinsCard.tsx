"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { AnimatedCounter } from "./AnimatedCounter";
import { Sparkles, TrendingUp, ShoppingBag, Landmark, ArrowUpRight } from "lucide-react";

interface TXCoinsCardProps {
  balance: number;
  rank: number;
}

export function TXCoinsCard({ balance, rank }: TXCoinsCardProps) {
  return (
    <Card className="relative overflow-hidden group border-yellow-400/20 bg-gradient-to-br from-surface via-[#14120a] to-surface-light shadow-[0_8px_32px_rgba(250,204,21,0.1)] !p-5" hover={false}>
      {/* Radiant backlights and coin halos */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-yellow-500/10 blur-3xl group-hover:bg-yellow-500/20 transition-all duration-700 pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Spinning Golden Coin Container */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-accent-orange/20 border border-yellow-400/40 flex items-center justify-center shadow-[0_0_12px_rgba(250,204,21,0.2)]">
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </motion.div>
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Treasury Vault</h3>
              <p className="text-[10px] text-muted-light">Platform gold & cosmetic currency</p>
            </div>
          </div>

          <span className="text-[9px] uppercase tracking-widest text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded font-black">
            TX COIN
          </span>
        </div>

        {/* Currency balance and counter */}
        <div className="flex items-baseline justify-between py-2 border-y border-white/5">
          <div className="flex items-baseline gap-1.5">
            <AnimatedCounter
              to={balance}
              duration={1.5}
              className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500"
              formatter={v => v.toLocaleString()}
            />
            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">TX Coins</span>
          </div>

          <div className="text-right">
            <span className="text-[9px] text-muted-light block uppercase font-bold">Estimated Value</span>
            <span className="text-xs font-bold text-white">Premium Tier</span>
          </div>
        </div>

        {/* Dynamic transaction activity logger */}
        <div className="space-y-1.5">
          <div className="text-[9px] uppercase tracking-wider text-muted font-black">Recent Coin Ledger</div>
          <div className="space-y-1">
            {[
              { desc: "Daily Streak Chest Claim", amount: "+50", plus: true },
              { desc: "CSS Constellation Mastery Node", amount: "+15", plus: true },
            ].map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between text-[10px] bg-white/[0.01] border border-white/5 rounded-lg px-2.5 py-1.5">
                <span className="text-muted-light truncate max-w-[170px]">{tx.desc}</span>
                <span className={`font-black ${tx.plus ? "text-accent-green" : "text-accent-red"}`}>
                  {tx.amount} TX
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Explanations tag area showing cosmetics and subscription usage */}
        <div className="pt-2">
          <div className="text-[9px] uppercase tracking-wider text-muted font-black mb-1.5">Utility Ecosystem</div>
          <div className="flex gap-1.5 flex-wrap">
            {["Subscriptions", "Elite Courses", "Cosmetics Shop", "Profile Effects", "Esports PvP Entry"].map((u, i) => (
              <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-yellow-400/5 text-yellow-400/80 border border-yellow-400/10">
                {u}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

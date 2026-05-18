"use client";
import { motion } from "framer-motion";
import { Users, MessageCircle, Trophy, Heart, Flame, Zap } from "lucide-react";

const activities = [
  { name: "Emma Wilson", action: "completed", target: "React Masterclass", icon: "🎓", time: "2m ago" },
  { name: "James Liu", action: "won a quiz battle vs", target: "Sofia Garcia", icon: "⚔️", time: "5m ago" },
  { name: "Michael Kim", action: "reached", target: "Level 30!", icon: "🏆", time: "12m ago" },
  { name: "Sarah Chen", action: "unlocked", target: "Quiz Master badge", icon: "🏅", time: "18m ago" },
  { name: "Alex Morgan", action: "started", target: "AI & Machine Learning", icon: "🤖", time: "25m ago" },
];

export function Community() {
  return (
    <section id="community" className="relative py-32 overflow-hidden">
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#10b981]/[0.04] rounded-full blur-[150px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-xs font-medium mb-6">
              <Users className="w-3 h-3" /> Community
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
              Learn together,<br />
              <span className="bg-gradient-to-r from-[#10b981] to-[#06b6d4] bg-clip-text text-transparent">grow together</span>
            </h2>
            <p className="text-lg text-[#94a3b8] leading-relaxed mb-10">
              Education is better with friends. Join study groups, compete in team challenges, share achievements, and support each other on your learning journey.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Users className="w-5 h-5 text-[#10b981]" />, value: "50K+", label: "Active members" },
                { icon: <MessageCircle className="w-5 h-5 text-[#06b6d4]" />, value: "120K+", label: "Messages/day" },
                { icon: <Trophy className="w-5 h-5 text-[#f59e0b]" />, value: "8K+", label: "Daily matches" },
                { icon: <Heart className="w-5 h-5 text-[#ec4899]" />, value: "98%", label: "Love it" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-[#64748b]">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — activity feed mockup */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-[#06b6d4]/5 rounded-3xl blur-[40px]" />
              <div className="relative bg-[#12121a]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Flame className="w-4 h-4 text-[#f59e0b]" /> Live Activity</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-[#10b981] opacity-75" /><span className="relative rounded-full h-2 w-2 bg-[#10b981]" /></span>
                    <span className="text-xs text-[#10b981]">5,234 online</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {activities.map((act, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                    >
                      <span className="text-lg shrink-0">{act.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">
                          <span className="font-semibold text-white">{act.name}</span>{" "}
                          <span className="text-[#64748b]">{act.action}</span>{" "}
                          <span className="text-[#a78bfa] font-medium">{act.target}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#475569] shrink-0">{act.time}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Online users */}
                <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] border-2 border-[#12121a] flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ opacity: 1 - i * 0.12 }}>
                        {["EW", "JL", "MK", "SC", "AM", "DV"][i]}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] border-2 border-[#12121a] flex items-center justify-center text-[9px] text-[#64748b]">
                      +5K
                    </div>
                  </div>
                  <div className="text-xs text-[#64748b]">Join the community →</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

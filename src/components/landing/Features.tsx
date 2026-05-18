"use client";
import { motion } from "framer-motion";
import { Sparkles, Swords, Trophy, BookOpen, Award, Target, BarChart3, Zap } from "lucide-react";

const features = [
  { icon: <Sparkles className="w-6 h-6" />, title: "AI Chat", desc: "Your personal AI tutor — ask anything, get instant explanations with code examples.", color: "#8b5cf6" },
  { icon: <Swords className="w-6 h-6" />, title: "PvP Quiz Battles", desc: "Challenge friends to real-time quiz battles. Fastest correct answer wins XP.", color: "#ef4444" },
  { icon: <Trophy className="w-6 h-6" />, title: "Leaderboards", desc: "Weekly and monthly rankings. Compete globally and earn your spot at the top.", color: "#f59e0b" },
  { icon: <BookOpen className="w-6 h-6" />, title: "Premium Courses", desc: "Expert-crafted courses in development, design, AI, data science, and more.", color: "#06b6d4" },
  { icon: <Award className="w-6 h-6" />, title: "Achievements", desc: "Unlock badges from Common to Legendary. Collect them all and show off your skills.", color: "#ec4899" },
  { icon: <Target className="w-6 h-6" />, title: "Daily Challenges", desc: "Fresh challenges every day with bonus XP. Keep your streak alive and growing.", color: "#10b981" },
  { icon: <BarChart3 className="w-6 h-6" />, title: "Smart Progress", desc: "AI analyzes your performance and recommends what to study next.", color: "#8b5cf6" },
  { icon: <Zap className="w-6 h-6" />, title: "XP & Levels", desc: "Every action earns XP. Level up, unlock features, and track your growth journey.", color: "#f59e0b" },
];

export function Features() {
  return (
    <section id="platform" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/[0.03] rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ec4899]/10 border border-[#ec4899]/20 text-[#ec4899] text-xs font-medium mb-6">
            Platform Features
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
            Everything you need<br />
            <span className="bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] bg-clip-text text-transparent">in one place</span>
          </h2>
          <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto">
            A complete ecosystem designed to make learning addictive, social, and incredibly effective.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-400 cursor-default"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${f.color}15`, color: f.color }}>
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">{f.title}</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

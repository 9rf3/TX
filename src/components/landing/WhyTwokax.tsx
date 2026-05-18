"use client";
import { motion } from "framer-motion";
import { Sparkles, Gamepad2, Trophy, Zap, Users, GraduationCap } from "lucide-react";

const features = [
  { icon: <Sparkles className="w-6 h-6" />, title: "AI Learning Assistant", desc: "Get instant help from an AI tutor that understands your learning style and adapts in real-time.", color: "#8b5cf6", glow: "rgba(139,92,246,0.15)" },
  { icon: <Gamepad2 className="w-6 h-6" />, title: "Gamified Learning", desc: "Earn XP, unlock achievements, maintain streaks, and level up as you learn. Education that feels like play.", color: "#06b6d4", glow: "rgba(6,182,212,0.15)" },
  { icon: <Trophy className="w-6 h-6" />, title: "Live Competitions", desc: "Challenge friends to quiz battles, climb leaderboards, and prove your knowledge in real-time.", color: "#f59e0b", glow: "rgba(245,158,11,0.15)" },
  { icon: <Zap className="w-6 h-6" />, title: "XP & Level System", desc: "Every lesson, quiz, and challenge earns XP. Watch your level grow and unlock exclusive rewards.", color: "#ec4899", glow: "rgba(236,72,153,0.15)" },
  { icon: <Users className="w-6 h-6" />, title: "Social Learning", desc: "Study with friends, share progress, form teams, and learn together in a vibrant community.", color: "#10b981", glow: "rgba(16,185,129,0.15)" },
  { icon: <GraduationCap className="w-6 h-6" />, title: "Expert Courses", desc: "World-class content from industry leaders. From coding to AI, design to business — all in one place.", color: "#8b5cf6", glow: "rgba(139,92,246,0.15)" },
];

export function WhyTwokax() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#8b5cf6]/[0.04] rounded-full blur-[150px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#a78bfa] text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" /> Why TWOKAX
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
            Not just learning.<br />
            <span className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">A growth ecosystem.</span>
          </h2>
          <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto">
            We combined the best of AI, gamification, and social learning to create an experience that makes you actually want to study.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="group relative rounded-3xl bg-[#12121a]/80 border border-white/[0.06] p-7 hover:border-white/[0.12] transition-all duration-500 hover:shadow-[0_0_40px_var(--card-glow)]"
              style={{ "--card-glow": f.glow } as React.CSSProperties}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_var(--card-glow)]"
                style={{ background: `${f.color}15`, color: f.color, "--card-glow": f.glow } as React.CSSProperties}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

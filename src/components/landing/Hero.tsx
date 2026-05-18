"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Zap, Trophy, Users, Sparkles, BookOpen, Flame } from "lucide-react";

function FloatingCard({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay + 0.8, duration: 0.6 }}
      className={className}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        {/* Radial glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#8b5cf6]/[0.08] rounded-full blur-[150px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#06b6d4]/[0.06] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#ec4899]/[0.05] rounded-full blur-[130px]" />
        {/* Gradient fade at top */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0a0a0f] to-transparent" />
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div key={i}
          className="absolute w-1 h-1 rounded-full bg-[#8b5cf6]/40"
          style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ y: [0, -40, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8b5cf6] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8b5cf6]" />
            </span>
            <span className="text-[#a78bfa] text-sm font-medium">AI-Powered Education Platform</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6"
          >
            <span className="block text-white">Education</span>
            <span className="block bg-gradient-to-r from-[#8b5cf6] via-[#a78bfa] to-[#06b6d4] bg-clip-text text-transparent">
              Reimagined
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="text-lg sm:text-xl text-[#94a3b8] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Learn with AI, compete with friends, earn XP, and level up your skills.
            The first platform where education feels like a game.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/register"
              className="group relative inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#8b5cf6] rounded-2xl hover:bg-[#7c3aed] transition-all duration-300 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:scale-[1.02] active:scale-[0.98]">
              <Sparkles className="w-5 h-5" />
              Start Learning Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/dashboard"
              className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white/80 bg-white/[0.04] border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300">
              <Play className="w-4 h-4" />
              Explore Platform
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mb-20"
          >
            {[
              { value: "50K+", label: "Active Students" },
              { value: "1.2M", label: "Lessons Completed" },
              { value: "98%", label: "Satisfaction" },
              { value: "24/7", label: "AI Support" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm text-[#64748b] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard mockup with floating cards */}
        <div className="relative max-w-5xl mx-auto">
          {/* Glow behind mockup */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#8b5cf6]/10 to-transparent rounded-3xl blur-[60px] scale-95" />

          {/* Main mockup card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }}
            className="relative bg-[#12121a]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 sm:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.5)]"
          >
            {/* Fake top bar */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]/60" />
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]/60" />
                <div className="w-3 h-3 rounded-full bg-[#10b981]/60" />
              </div>
              <div className="flex-1 h-7 bg-white/[0.04] rounded-lg max-w-xs mx-auto" />
            </div>

            {/* Dashboard content */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: <Zap className="w-5 h-5 text-[#8b5cf6]" />, label: "Total XP", value: "23,450", sub: "Level 24", color: "from-[#8b5cf6]/10 to-[#8b5cf6]/5" },
                { icon: <Flame className="w-5 h-5 text-[#f59e0b]" />, label: "Streak", value: "14 days", sub: "🔥 On fire!", color: "from-[#f59e0b]/10 to-[#f59e0b]/5" },
                { icon: <BookOpen className="w-5 h-5 text-[#10b981]" />, label: "Courses", value: "12/18", sub: "67% complete", color: "from-[#10b981]/10 to-[#10b981]/5" },
                { icon: <Trophy className="w-5 h-5 text-[#06b6d4]" />, label: "Rank", value: "#5", sub: "Top 5%", color: "from-[#06b6d4]/10 to-[#06b6d4]/5" },
              ].map((stat) => (
                <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl border border-white/[0.06] p-4`}>
                  <div className="flex items-center gap-2 mb-2">{stat.icon}<span className="text-xs text-[#64748b] uppercase tracking-wider">{stat.label}</span></div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-[#64748b] mt-0.5">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Fake chart area */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-4 h-32 sm:h-40 flex items-end gap-1 sm:gap-2">
              {[35, 50, 30, 65, 45, 80, 55, 70, 40, 90, 60, 75].map((h, i) => (
                <motion.div key={i}
                  initial={{ height: 0 }} animate={{ height: `${h}%` }}
                  transition={{ delay: 1.2 + i * 0.05, duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-[#8b5cf6] to-[#8b5cf6]/30 rounded-t-lg"
                />
              ))}
            </div>

            {/* Gradient fade at bottom */}
            <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#0a0a0f] to-transparent rounded-b-3xl pointer-events-none" />
          </motion.div>

          {/* Floating cards */}
          <FloatingCard delay={0} className="absolute -left-4 sm:-left-8 top-1/4 z-20">
            <div className="bg-[#12121a]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">AI Assistant</div>
                  <div className="text-xs text-[#10b981]">● Online</div>
                </div>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard delay={0.3} className="absolute -right-4 sm:-right-8 top-1/3 z-20">
            <div className="bg-[#12121a]/90 backdrop-blur-xl rounded-2xl border border-[#8b5cf6]/20 p-4 shadow-[0_8px_40px_rgba(139,92,246,0.15)]">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-[#f59e0b]" />
                <span className="text-xs text-[#64748b]">Achievement</span>
              </div>
              <div className="text-sm font-semibold text-white">🏆 Quiz Master</div>
              <div className="text-xs text-[#8b5cf6] mt-1">+500 XP</div>
            </div>
          </FloatingCard>

          <FloatingCard delay={0.6} className="absolute left-8 sm:left-16 -bottom-4 z-20">
            <div className="bg-[#12121a]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["from-[#8b5cf6] to-[#ec4899]", "from-[#06b6d4] to-[#10b981]", "from-[#f59e0b] to-[#ef4444]"].map((g, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} border-2 border-[#12121a] flex items-center justify-center text-[9px] font-bold text-white`}>
                      {["AM", "JL", "SC"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">5,200+</div>
                  <div className="text-xs text-[#64748b]">Online now</div>
                </div>
              </div>
            </div>
          </FloatingCard>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
    </section>
  );
}

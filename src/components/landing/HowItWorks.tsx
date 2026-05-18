"use client";
import { motion } from "framer-motion";
import { BookOpen, Code, Trophy } from "lucide-react";

const steps = [
  { num: "01", icon: <BookOpen className="w-7 h-7" />, title: "Learn", desc: "Explore expert-crafted courses with AI-powered lessons that adapt to your pace and style.", color: "#8b5cf6", gradient: "from-[#8b5cf6] to-[#7c3aed]" },
  { num: "02", icon: <Code className="w-7 h-7" />, title: "Practice", desc: "Apply knowledge through interactive quizzes, coding challenges, and real-world projects.", color: "#06b6d4", gradient: "from-[#06b6d4] to-[#0891b2]" },
  { num: "03", icon: <Trophy className="w-7 h-7" />, title: "Compete & Grow", desc: "Challenge friends, climb leaderboards, earn XP, and unlock achievements as you master new skills.", color: "#f59e0b", gradient: "from-[#f59e0b] to-[#d97706]" },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#06b6d4]/[0.04] rounded-full blur-[150px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/20 text-[#06b6d4] text-xs font-medium mb-6">
            How It Works
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
            Three steps to<br />
            <span className="bg-gradient-to-r from-[#06b6d4] to-[#8b5cf6] bg-clip-text text-transparent">mastery</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-24 left-[17%] right-[17%] h-[2px] bg-gradient-to-r from-[#8b5cf6]/30 via-[#06b6d4]/30 to-[#f59e0b]/30" />

          {steps.map((step, i) => (
            <motion.div key={step.num}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Step circle */}
              <div className="relative mx-auto mb-8">
                <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-[0_0_30px_${step.color}33]`}>
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#12121a] border-2 border-white/10 flex items-center justify-center text-xs font-bold text-white">
                  {step.num}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

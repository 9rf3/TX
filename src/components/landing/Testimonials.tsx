"use client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Sarah Chen", role: "Software Engineer", company: "Google", text: "TWOKAX completely changed how I learn. The AI tutor is like having a senior engineer by your side 24/7. I went from junior to senior in 8 months.", rating: 5, avatar: "SC" },
  { name: "David Kim", role: "CS Student", company: "MIT", text: "The gamification is addictive — in a good way. I've maintained a 90-day streak and learned more than in two semesters of school. The quiz battles are insanely fun.", rating: 5, avatar: "DK" },
  { name: "Maria Garcia", role: "Product Designer", company: "Figma", text: "Beautiful platform, incredible content. The way TWOKAX blends learning with community and competition is genius. Best investment in my career.", rating: 5, avatar: "MG" },
  { name: "Alex Rivera", role: "Data Scientist", company: "Netflix", text: "The AI-powered study paths saved me months of wasted time. It knew exactly what I needed to learn next. The leaderboards kept me motivated daily.", rating: 5, avatar: "AR" },
  { name: "Emily Watson", role: "Freelance Developer", company: "Self-employed", text: "I tried Coursera, Udemy, and others. Nothing comes close to TWOKAX. The social features and XP system make it impossible to stop learning.", rating: 5, avatar: "EW" },
  { name: "James Park", role: "CTO", company: "Startup", text: "I'm using TWOKAX to upskill my entire team. The progress tracking and team features are exactly what we needed. 10/10 would recommend.", rating: 5, avatar: "JP" },
];

const gradients = [
  "from-[#8b5cf6] to-[#ec4899]",
  "from-[#06b6d4] to-[#10b981]",
  "from-[#f59e0b] to-[#ef4444]",
  "from-[#ec4899] to-[#8b5cf6]",
  "from-[#10b981] to-[#06b6d4]",
  "from-[#8b5cf6] to-[#06b6d4]",
];

export function Testimonials() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#ec4899]/[0.03] rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] text-xs font-medium mb-6">
            <Star className="w-3 h-3" /> Testimonials
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            Loved by<br />
            <span className="bg-gradient-to-r from-[#f59e0b] to-[#ec4899] bg-clip-text text-transparent">learners worldwide</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="group relative rounded-3xl bg-[#12121a]/80 border border-white/[0.06] p-7 hover:border-white/[0.12] transition-all duration-400"
            >
              <Quote className="w-8 h-8 text-[#8b5cf6]/20 mb-4" />
              <p className="text-sm text-[#94a3b8] leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[i]} flex items-center justify-center text-xs font-bold text-white`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-[#64748b]">{t.role} @ {t.company}</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

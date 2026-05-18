"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f]" />
      {/* Big glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[#8b5cf6]/[0.08] rounded-full blur-[180px]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {/* Floating badge */}
          <motion.div
            animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-[#a78bfa]" />
            <span className="text-[#a78bfa] text-sm font-medium">Free forever. No credit card required.</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-[1.05]">
            Join the future<br />
            <span className="bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#06b6d4] bg-clip-text text-transparent">
              of learning
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-[#94a3b8] max-w-xl mx-auto mb-12">
            Start your journey today. Learn smarter, compete harder, and grow faster with 50,000+ students worldwide.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register"
              className="group relative inline-flex items-center gap-2 px-10 py-5 text-lg font-semibold text-white bg-[#8b5cf6] rounded-2xl hover:bg-[#7c3aed] transition-all duration-300 hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] hover:scale-[1.03] active:scale-[0.98]">
              <Sparkles className="w-5 h-5" />
              Start Learning Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-[#8b5cf6]/50 ring-offset-2 ring-offset-[#0a0a0f] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-5 text-lg font-semibold text-white/80 bg-white/[0.04] border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300">
              Explore Platform
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] border-2 border-[#0a0a0f] flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ filter: `hue-rotate(${i * 40}deg)` }}>
                  {["AJ", "KM", "SR", "DL", "MN"][i]}
                </div>
              ))}
            </div>
            <div className="text-sm text-[#64748b]">
              <span className="text-white font-semibold">2,847</span> joined this week
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

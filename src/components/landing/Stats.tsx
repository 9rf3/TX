"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Users, BookOpen, Zap, Swords } from "lucide-react";

function AnimatedCounter({ target, suffix = "", display }: { target: number; suffix?: string; display?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); setDone(true); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  if (done && display) return <span ref={ref}>{display}</span>;
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { icon: <Users className="w-8 h-8" />, value: 52, suffix: "K+", display: "52K+", label: "Active Students", desc: "learning every day", color: "#8b5cf6", gradient: "from-[#8b5cf6]/10 to-[#8b5cf6]/5" },
  { icon: <BookOpen className="w-8 h-8" />, value: 1200, suffix: "K+", display: "1.2M+", label: "Lessons Completed", desc: "and counting", color: "#06b6d4", gradient: "from-[#06b6d4]/10 to-[#06b6d4]/5" },
  { icon: <Zap className="w-8 h-8" />, value: 89, suffix: "M+", display: "89M+", label: "XP Earned", desc: "by the community", color: "#f59e0b", gradient: "from-[#f59e0b]/10 to-[#f59e0b]/5" },
  { icon: <Swords className="w-8 h-8" />, value: 340, suffix: "K+", display: "340K+", label: "Competitions Played", desc: "this month", color: "#ec4899", gradient: "from-[#ec4899]/10 to-[#ec4899]/5" },
];

export function Stats() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0f0f18] to-[#0a0a0f]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            Numbers that<br />
            <span className="bg-gradient-to-r from-[#f59e0b] to-[#ec4899] bg-clip-text text-transparent">speak volumes</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`relative text-center rounded-3xl bg-gradient-to-br ${stat.gradient} border border-white/[0.06] p-8 group hover:border-white/[0.12] transition-all duration-400`}
            >
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mb-2">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} display={stat.display} />
              </div>
              <div className="text-base font-semibold text-white mb-1">{stat.label}</div>
              <div className="text-sm text-[#64748b]">{stat.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

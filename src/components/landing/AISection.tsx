"use client";
import { motion } from "framer-motion";
import { Sparkles, Brain, Target, TrendingUp, Bot } from "lucide-react";

export function AISection() {
  return (
    <section id="ai" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/[0.05] rounded-full blur-[180px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — AI chat mockup */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/8 to-[#ec4899]/5 rounded-3xl blur-[50px]" />
              <div className="relative bg-[#12121a]/80 backdrop-blur-xl rounded-3xl border border-white/[0.08] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                {/* Chat header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">TWOKAX AI</div>
                    <div className="text-xs text-[#10b981] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Always online
                    </div>
                  </div>
                </div>

                {/* Chat messages */}
                <div className="p-6 space-y-4 min-h-[320px]">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-white">Can you explain how closures work in JavaScript?</p>
                    </div>
                  </div>

                  {/* AI response */}
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                      <p className="text-sm text-[#e2e8f0] mb-3">Great question! A closure is a function that &quot;remembers&quot; variables from its outer scope, even after the outer function has returned.</p>
                      <div className="bg-[#0a0a0f] rounded-xl p-3 font-mono text-xs text-[#a78bfa] border border-white/[0.06]">
                        <div className="text-[#64748b]">// Closure example</div>
                        <div><span className="text-[#ec4899]">function</span> <span className="text-[#06b6d4]">counter</span>() {"{"}</div>
                        <div>  <span className="text-[#ec4899]">let</span> count = <span className="text-[#f59e0b]">0</span>;</div>
                        <div>  <span className="text-[#ec4899]">return</span> () =&gt; ++count;</div>
                        <div>{"}"}</div>
                      </div>
                      <p className="text-sm text-[#e2e8f0] mt-3">The inner function &quot;closes over&quot; the <code className="text-[#a78bfa] bg-[#8b5cf6]/10 px-1.5 py-0.5 rounded text-xs">count</code> variable. Want me to explain more? 🚀</p>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-3 bg-white/[0.04] rounded-xl px-4 py-3 border border-white/[0.06]">
                    <span className="text-sm text-[#475569] flex-1">Ask anything...</span>
                    <div className="w-8 h-8 rounded-lg bg-[#8b5cf6] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right content */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#a78bfa] text-xs font-medium mb-6">
              <Sparkles className="w-3 h-3" /> AI-Powered
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
              Your personal<br />
              <span className="bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">AI tutor</span>
            </h2>
            <p className="text-lg text-[#94a3b8] leading-relaxed mb-10">
              Powered by advanced AI that understands your learning style, identifies weak areas, and creates personalized study paths just for you.
            </p>

            <div className="space-y-4">
              {[
                { icon: <Brain className="w-5 h-5" />, title: "Personalized Learning", desc: "AI adapts content difficulty based on your performance and preferences.", color: "#8b5cf6" },
                { icon: <Target className="w-5 h-5" />, title: "Weak Topic Analysis", desc: "Identifies knowledge gaps and recommends targeted practice.", color: "#ec4899" },
                { icon: <TrendingUp className="w-5 h-5" />, title: "Smart Recommendations", desc: "Suggests the perfect next course, lesson, or challenge for your growth.", color: "#06b6d4" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${item.color}15`, color: item.color }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">{item.title}</h4>
                    <p className="text-xs text-[#94a3b8]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

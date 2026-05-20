"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Sparkles, Cpu, Lightbulb, Zap, HelpCircle } from "lucide-react";
import { useSound } from "@/lib/hooks/useSound";

interface AIMotivationWidgetProps {
  xp: number;
  level: number;
  xpForNext: number;
  streak: number;
  rankTier: string;
}

export function AIMotivationWidget({ xp, level, xpForNext, streak, rankTier }: AIMotivationWidgetProps) {
  const { playClick } = useSound();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Generate game-aware motivational tips
  useEffect(() => {
    setLoading(true);
    const xpRemaining = xpForNext - xp;
    
    const prompts = [
      `System Analysis: You are currently Level ${level}. Just ${xpRemaining} XP to level up! Let's conquer the next lesson together.`,
      `Motivational Directive: Your ${streak}-day streak is impressive! A 7-day streak awards premium TX Coins. Keep it burning!`,
      `Tactical Tip: You're currently ranked as a ${rankTier} competitor. Dedicating 10 minutes to courses today will cement your leadership standing.`,
      `AI Prediction: Complete 1 more module in React Hooks or TypeScript to unlock rare legendary cosmetics in the shop!`,
      `Social Intel: Some of your friends are currently practicing IELTS and React. Ready for a quick cooperative PvP speedrun?`
    ];

    // Pick a random prompt
    const index = Math.floor(Math.random() * prompts.length);
    const selectedText = prompts[index];

    // Simple typing animation effect
    let currentText = "";
    let i = 0;
    const interval = setInterval(() => {
      if (i < selectedText.length) {
        currentText += selectedText[i];
        setMessage(currentText);
        i++;
      } else {
        clearInterval(interval);
        setLoading(false);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [xp, level, xpForNext, streak, rankTier]);

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-surface to-surface-light hover:border-primary/40 transition-all duration-300 !p-5">
      {/* Floating backlights */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-node-pulse" />
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-secondary/15 rounded-full blur-2xl" />

      <div className="relative z-10 flex gap-4 items-start">
        {/* Futuristic pulsing AI Avatar */}
        <div className="relative flex-shrink-0">
          <motion.div
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-secondary flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.35)]"
            animate={{
              boxShadow: [
                "0 0 15px rgba(139,92,246,0.35)",
                "0 0 25px rgba(6,182,212,0.5)",
                "0 0 15px rgba(139,92,246,0.35)",
              ],
            }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <Cpu className="w-6 h-6 text-white animate-float" />
          </motion.div>
          {/* Status Indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-accent-green border-2 border-surface flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-ping" />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-widest text-primary-light uppercase">KAX-AI COMPANION</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted-light font-bold">ONLINE</span>
            </div>
            <button
              onClick={() => {
                playClick();
                // trigger re-eval
                const event = new CustomEvent("tx-ai-re-evaluate");
                window.dispatchEvent(event);
              }}
              className="text-[10px] text-primary-light hover:text-white transition-colors cursor-pointer flex items-center gap-1 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md"
            >
              <Sparkles className="w-3 h-3 animate-spin" /> Refresh Guidance
            </button>
          </div>

          <div className="relative rounded-2xl bg-white/[0.02] border border-white/5 p-3.5 min-h-[64px] flex items-center">
            {loading && message === "" ? (
              <div className="flex gap-1.5 items-center text-muted-light text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-bounce [animation-delay:0.4s]" />
                Analyzing telemetry...
              </div>
            ) : (
              <p className="text-xs md:text-sm font-medium leading-relaxed text-foreground select-none">
                {message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 text-[10px] text-muted-light">
            <span className="flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
              Tip: Complete 3 lessons today to earn a +100 XP Mastery Bonus.
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

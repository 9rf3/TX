"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSkillTree } from "@/lib/hooks/useSkillTree";
import { useSound } from "@/lib/hooks/useSound";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Swords, Star, Lock, Sparkles, Zap, Award, ChevronRight } from "lucide-react";
import Link from "next/link";

export function SkillTreeWidget() {
  const { skills, availablePoints, invest, isLoading } = useSkillTree();
  const { playClick, playLevelUp, playAchievement } = useSound();
  const [investingId, setInvestingId] = useState<string | null>(null);
  const [successNode, setSuccessNode] = useState<string | null>(null);

  const handleNodeClick = async (skillId: string, name: string, isUnlocked: boolean, isAvailable: boolean) => {
    if (!isAvailable || availablePoints <= 0) {
      playClick();
      return;
    }
    setInvestingId(skillId);
    try {
      await invest(skillId);
      playLevelUp();
      setSuccessNode(skillId);
      setTimeout(() => setSuccessNode(null), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setInvestingId(null);
    }
  };

  if (isLoading) {
    return <Card className="p-6 text-center text-muted text-sm">Loading skill trees...</Card>;
  }

  // Pick top frontend skills or any subset of skills to display
  const displaySkills = skills.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.25)]">
            <Swords className="w-5 h-5 text-primary-light" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide uppercase">
              RPG Skill Tree
            </h2>
            <p className="text-xs text-muted-light">Invest Skill Points (SP) to unlock master level coding nodes</p>
          </div>
        </div>

        <Link
          href="/skills"
          className="text-xs text-primary-light hover:text-white transition-colors flex items-center gap-0.5 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl"
        >
          Expand Tree <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-surface to-[#0f0f1b] !p-6">
        {/* Glow accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Constellation Grid dots background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(139,92,246,0.3) 1px, transparent 1px)`,
            backgroundSize: `24px 24px`,
          }}
        />

        {/* Skill Point display */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 border border-primary/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary-light" />
              <span className="text-xs font-semibold text-muted-light">Available Points:</span>
              <span className="text-sm font-black text-white">{availablePoints} SP</span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted">
            Frontend Path
          </span>
        </div>

        {/* Constellation nodes row */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 py-4 z-10">
          {/* Connector Line behind nodes */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 hidden md:block" />

          {displaySkills.map((skill, index) => {
            const isUnlocked = skill.currentLevel > 0;
            const isMaxed = skill.currentLevel >= skill.max_level;
            const isAvailable = skill.isAvailable && availablePoints > 0;
            const isPending = investingId === skill.id;
            const isSuccess = successNode === skill.id;

            return (
              <div key={skill.id} className="relative flex flex-col items-center group">
                {/* Node */}
                <motion.div
                  onClick={() => handleNodeClick(skill.id, skill.name, isUnlocked, isAvailable)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 cursor-pointer relative z-20 transition-all duration-300 ${
                    isSuccess
                      ? "bg-accent-green border-white shadow-[0_0_20px_#10b981]"
                      : isMaxed
                      ? "bg-yellow-500/10 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.25)] hover:bg-yellow-500/20"
                      : isUnlocked
                      ? "bg-primary/10 border-primary shadow-[0_0_12px_rgba(139,92,246,0.2)] hover:bg-primary/20"
                      : isAvailable
                      ? "bg-surface-light border-primary-light/40 hover:border-primary animate-pulse-glow"
                      : "bg-surface border-white/5 opacity-55 cursor-not-allowed"
                  }`}
                  whileHover={isAvailable ? { scale: 1.1, y: -2 } : { scale: 1.02 }}
                >
                  <AnimatePresence>
                    {isSuccess && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-accent-green/30 border border-white"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.3, opacity: [0.8, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                      />
                    )}
                  </AnimatePresence>

                  <span className="text-xl relative z-10 select-none">
                    {isPending ? (
                      <span className="inline-block w-4 h-4 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
                    ) : !isUnlocked && !isAvailable ? (
                      <Lock className="w-4 h-4 text-muted" />
                    ) : (
                      skill.icon || "⚛️"
                    )}
                  </span>

                  {/* Level Counter Bubble */}
                  {isUnlocked && (
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-[9px] font-black border flex items-center justify-center shadow-md select-none ${
                      isMaxed
                        ? "bg-yellow-500 text-black border-yellow-300"
                        : "bg-primary text-white border-primary-light"
                    }`}>
                      {skill.currentLevel}
                    </div>
                  )}
                </motion.div>

                {/* Node info tooltip */}
                <div className="mt-3 text-center">
                  <div className="text-xs font-bold text-white group-hover:text-primary-light transition-colors">
                    {skill.name}
                  </div>
                  <div className="text-[9px] text-muted-light mt-0.5">
                    {isMaxed
                      ? "Mastered"
                      : isUnlocked
                      ? `Lvl ${skill.currentLevel}/${skill.max_level}`
                      : isAvailable
                      ? "Unlock Available"
                      : "Locked"}
                  </div>
                </div>

                {/* Invite to unlock glow particle */}
                {isAvailable && (
                  <motion.div
                    className="absolute -inset-1.5 rounded-3xl border border-primary/20 pointer-events-none"
                    animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.95, 1.05, 0.95] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

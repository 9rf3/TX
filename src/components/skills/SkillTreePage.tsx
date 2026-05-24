"use client";
import { motion } from "framer-motion";
import { useSkillTree } from "@/lib/hooks/useSkillTree";
import { SkillTreeCanvas } from "./SkillTreeCanvas";
import { Swords } from "lucide-react";

export function SkillTreePage() {
  const { skills, availablePoints, userLevel, isLoading, invest } = useSkillTree();

  const handleInvest = async (skillId: string) => {
    try {
      const result = await invest(skillId);
      return { xpRewarded: result.xpRewarded, coinsRewarded: result.coinsRewarded };
    } catch {
      return undefined;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted text-sm">Loading skill tree...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      {/* Background ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.04) 0%, transparent 50%)
          `,
        }}
      />

      {/* Hero header */}
      <div className="relative px-6 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/20 flex items-center justify-center">
            <Swords className="w-7 h-7 text-primary-light" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              <span className="gradient-text">Skill Tree</span>
            </h1>
            <p className="text-sm text-muted-light">
              Invest skill points to unlock abilities and master new domains
            </p>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <SkillTreeCanvas
        skills={skills}
        availablePoints={availablePoints}
        userLevel={userLevel}
        onInvest={handleInvest}
      />
    </motion.div>
  );
}

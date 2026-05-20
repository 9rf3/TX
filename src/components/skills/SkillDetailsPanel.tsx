"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Coins, ArrowUp, Lock, Crown, Brain, Book, Eye, Target, Puzzle, Mic, Search, Clock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkillNodeWithProgress } from "@/lib/hooks/useSkillTree";

const iconMap: Record<string, React.ElementType> = {
  brain: Brain, book: Book, eye: Eye, target: Target,
  puzzle: Puzzle, mic: Mic, search: Search, clock: Clock,
  circle: Circle,
};

const categoryColors: Record<string, { primary: string; label: string }> = {
  Foundational: { primary: "#8b5cf6", label: "Foundational" },
  Productivity: { primary: "#06b6d4", label: "Productivity" },
  Critical: { primary: "#10b981", label: "Critical Thinking" },
  Social: { primary: "#ec4899", label: "Social" },
};

interface SkillDetailsPanelProps {
  skill: SkillNodeWithProgress | null;
  availablePoints: number;
  onInvest: (skillId: string) => Promise<{ xpRewarded: number; coinsRewarded: number } | undefined>;
  onClose: () => void;
  investing: boolean;
}

export function SkillDetailsPanel({ skill, availablePoints, onInvest, onClose, investing }: SkillDetailsPanelProps) {
  if (!skill) return null;

  const Icon = iconMap[skill.icon] || Circle;
  const colors = categoryColors[skill.category] || categoryColors.Foundational;
  const isLocked = !skill.isAvailable && !skill.isUnlocked;
  const isMaxed = skill.isMaxed;

  const canInvest = skill.isAvailable && availablePoints > 0 && !investing;
  const xpReward = 75 + (skill.max_level * 10);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-80 border-l border-border bg-surface/80 backdrop-blur-xl shrink-0 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: skill.isUnlocked ? `${colors.primary}22` : "rgba(255,255,255,0.05)",
                border: `1px solid ${skill.isUnlocked ? colors.primary + "44" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              <Icon
                className="w-5 h-5"
                style={{ color: skill.isUnlocked ? colors.primary : "rgba(255,255,255,0.3)" }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{skill.name}</h3>
              <span
                className="text-[10px] font-medium"
                style={{ color: colors.primary }}
              >
                {colors.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-light hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Description</h4>
            <p className="text-sm text-muted-light leading-relaxed">
              {skill.description || "Unlock this skill to enhance your capabilities."}
            </p>
          </div>

          {/* Progress */}
          <div>
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Progress</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-light">Level</span>
                <span className="font-semibold" style={{ color: colors.primary }}>
                  {skill.currentLevel} / {skill.max_level}
                </span>
              </div>
              {/* Level bars */}
              <div className="flex gap-1">
                {Array.from({ length: skill.max_level }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-2 rounded-full transition-all duration-500"
                    style={{
                      background: i < skill.currentLevel ? colors.primary : "rgba(255,255,255,0.06)",
                      boxShadow: i < skill.currentLevel ? `0 0 8px ${colors.primary}44` : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Status</h4>
            <div
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2",
                isMaxed && "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
                isLocked && "bg-white/5 text-muted border border-white/10",
                skill.isUnlocked && !isMaxed && "border",
              )}
              style={
                skill.isUnlocked && !isMaxed
                  ? { background: `${colors.primary}11`, color: colors.primary, borderColor: `${colors.primary}33` }
                  : undefined
              }
            >
              {isMaxed ? (
                <><Crown className="w-4 h-4" /> Mastered</>
              ) : skill.isUnlocked ? (
                <><Zap className="w-4 h-4" /> Active</>
              ) : (
                <><Lock className="w-4 h-4" /> Locked</>
              )}
            </div>
          </div>

          {/* Rewards preview */}
          {!isMaxed && (
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Unlock Rewards</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/5">
                  <div className="flex items-center gap-1.5 text-primary-light mb-0.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">XP</span>
                  </div>
                  <span className="text-lg font-bold text-white">+{xpReward}</span>
                </div>
                <div className="bg-white/5 rounded-xl px-3 py-2.5 border border-white/5">
                  <div className="flex items-center gap-1.5 text-yellow-400 mb-0.5">
                    <Coins className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">Coins</span>
                  </div>
                  <span className="text-lg font-bold text-white">+15</span>
                </div>
              </div>
            </div>
          )}

          {/* Prerequisite */}
          {skill.parent_skill_id && !skill.isUnlocked && (
            <div>
              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Prerequisite</h4>
              <div className="bg-white/5 rounded-xl px-3 py-2 border border-white/5 text-sm text-muted-light">
                Requires the parent skill to be at least level 1
              </div>
            </div>
          )}
        </div>

        {/* Invest button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => onInvest(skill.id)}
            disabled={!canInvest}
            className={cn(
              "w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2",
              canInvest
                ? "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] cursor-pointer"
                : isMaxed
                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 cursor-default"
                  : "bg-white/5 text-muted border border-white/10 cursor-not-allowed"
            )}
          >
            {investing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isMaxed ? (
              <><Crown className="w-4 h-4" /> Fully Mastered</>
            ) : canInvest ? (
              <><ArrowUp className="w-4 h-4" /> Invest Skill Point</>
            ) : !skill.isAvailable ? (
              <><Lock className="w-4 h-4" /> Prerequisite Required</>
            ) : (
              <><Lock className="w-4 h-4" /> No Points Available</>
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

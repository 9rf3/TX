"use client";
import { motion } from "framer-motion";
import {
  Brain, Book, Eye, Target, Puzzle, Mic, Search, Clock,
  Circle, Lock, Zap, Crown, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkillNodeWithProgress } from "@/lib/hooks/useSkillTree";

const iconMap: Record<string, React.ElementType> = {
  brain: Brain, book: Book, eye: Eye, target: Target,
  puzzle: Puzzle, mic: Mic, search: Search, clock: Clock,
  circle: Circle, zap: Zap, crown: Crown, star: Star,
};

const categoryColors: Record<string, { primary: string; glow: string; bg: string; border: string }> = {
  Foundational: {
    primary: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.5)",
    bg: "rgba(139, 92, 246, 0.15)",
    border: "rgba(139, 92, 246, 0.3)",
  },
  Productivity: {
    primary: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.5)",
    bg: "rgba(6, 182, 212, 0.15)",
    border: "rgba(6, 182, 212, 0.3)",
  },
  Critical: {
    primary: "#10b981",
    glow: "rgba(16, 185, 129, 0.5)",
    bg: "rgba(16, 185, 129, 0.15)",
    border: "rgba(16, 185, 129, 0.3)",
  },
  Social: {
    primary: "#ec4899",
    glow: "rgba(236, 72, 153, 0.5)",
    bg: "rgba(236, 72, 153, 0.15)",
    border: "rgba(236, 72, 153, 0.3)",
  },
};

interface SkillNodeProps {
  skill: SkillNodeWithProgress;
  onClick: () => void;
  isSelected: boolean;
  gridSize: number;
}

export function SkillNode({ skill, onClick, isSelected, gridSize }: SkillNodeProps) {
  const Icon = iconMap[skill.icon] || Circle;
  const colors = categoryColors[skill.category] || categoryColors.Foundational;
  const nodeSize = 128;

  const x = skill.position_x * gridSize;
  const y = skill.position_y * gridSize;

  const isLocked = !skill.isAvailable && !skill.isUnlocked;
  const isAvailable = skill.isAvailable && !skill.isMaxed;
  const isUnlocked = skill.isUnlocked && !skill.isMaxed;
  const isMastered = skill.isMaxed;


  return (
    <motion.button
      onClick={onClick}
      className="absolute cursor-pointer"
      style={{ left: x - nodeSize / 2, top: y - nodeSize / 2, width: nodeSize, height: nodeSize }}
      initial={false}
      animate={{
        scale: isSelected ? 1.08 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: isLocked ? 1.03 : 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow ring behind node */}
      {(isUnlocked || isMastered || isSelected) && (
        <motion.div
          className="absolute inset-[-8px] rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            filter: `blur(${isMastered ? 8 : 4}px)`,
          }}
        />
      )}

      {/* Mastered aura ring */}
      {isMastered && (
        <motion.div
          className="absolute inset-[-16px] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{
            background: `conic-gradient(from 0deg, ${colors.primary}, #facc15, ${colors.primary}, #facc15, ${colors.primary})`,
            opacity: 0.3,
            filter: "blur(6px)",
          }}
        />
      )}

      {/* Node body */}
      <div
        className={cn(
          "relative w-full h-full rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 border-2 overflow-hidden",
          isMastered && "animate-mastered-glow",
          isSelected && "ring-2 ring-offset-2 ring-offset-background",
        )}
        style={{
          background: isLocked
            ? "linear-gradient(135deg, rgba(30,30,50,0.8), rgba(15,15,25,0.9))"
            : `linear-gradient(135deg, ${colors.bg}, rgba(15,15,25,0.8))`,
          borderColor: isLocked
            ? "rgba(255,255,255,0.06)"
            : isMastered
              ? "#facc15"
              : colors.border,
          boxShadow: isLocked
            ? "none"
            : isMastered
              ? `0 0 30px rgba(250,204,21,0.3), 0 0 60px ${colors.glow}`
              : isUnlocked || isSelected
                ? `0 0 20px ${colors.glow}`
                : `inset 0 0 20px ${colors.glow.replace("0.5", "0.1")}`,
        }}
      >
        {/* Inner glow overlay */}
        {(isUnlocked || isMastered) && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${colors.primary}22, transparent 70%)`,
            }}
          />
        )}

        {/* Lock icon overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl z-10">
            <Lock className="w-6 h-6 text-muted" />
          </div>
        )}

        {/* Level dots */}
        {isUnlocked && (
          <div className="absolute top-2 right-2 flex gap-0.5">
            {Array.from({ length: skill.max_level }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: i < skill.currentLevel ? colors.primary : "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>
        )}

        {/* Mastered badge */}
        {isMastered && (
          <div className="absolute top-2 right-2">
            <Crown className="w-4 h-4 text-yellow-400" />
          </div>
        )}

        {/* Icon */}
        <div
          className={cn(
            "relative z-[5] transition-all duration-300",
            isMastered && "text-yellow-400",
            isUnlocked && "text-white",
            isAvailable && !isUnlocked && "text-white/80",
            isLocked && "text-white/20"
          )}
        >
          <Icon className={cn("w-8 h-8", isMastered && "drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]")} />
        </div>

        {/* Name */}
        <span
          className={cn(
            "text-[10px] font-semibold text-center leading-tight px-1 relative z-[5]",
            isLocked ? "text-muted" : "text-white/90"
          )}
          style={{ maxWidth: nodeSize - 16 }}
        >
          {skill.name}
        </span>

        {/* Level text */}
        {isUnlocked && (
          <span
            className="text-[9px] font-medium relative z-[5]"
            style={{ color: colors.primary }}
          >
            Lv.{skill.currentLevel}/{skill.max_level}
          </span>
        )}

        {/* Available glow dots */}
        {isAvailable && !isUnlocked && (
          <motion.div
            className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-1 h-1 rounded-full animate-node-pulse" style={{ background: colors.primary }} />
          </motion.div>
        )}

        {/* Border glow animation on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 30px ${colors.glow.replace("0.5", "0.15")}`,
          }}
        />
      </div>
    </motion.button>
  );
}

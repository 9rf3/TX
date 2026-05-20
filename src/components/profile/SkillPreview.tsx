"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  GitBranch, ArrowRight, Brain, Book, Eye, Target,
  Puzzle, Mic, Search, Clock, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const skillIcons: Record<string, typeof Brain> = {
  brain: Brain, book: Book, eye: Eye, target: Target,
  puzzle: Puzzle, mic: Mic, search: Search, clock: Clock,
};

interface SkillData {
  id: string;
  name: string;
  category: string;
  icon: string;
  max_level: number;
}

interface UserSkillData {
  skill_id: string;
  current_level: number;
  points_invested: number;
}

interface SkillPreviewProps {
  skills?: SkillData[];
  userProgress?: UserSkillData[];
  availablePoints?: number;
}

export function SkillPreview({ skills = [], userProgress = [], availablePoints = 0 }: SkillPreviewProps) {
  const router = useRouter();
  const progressMap = new Map(userProgress.map(s => [s.skill_id, s]));
  const [activeIndex, setActiveIndex] = useState(0);

  const displaySkills = skills.slice(0, 6).map(skill => {
    const progress = progressMap.get(skill.id);
    return {
      ...skill,
      currentLevel: progress?.current_level ?? 0,
      pointsInvested: progress?.points_invested ?? 0,
      isUnlocked: (progress?.current_level ?? 0) > 0,
      mastery: progress ? Math.min((progress.current_level / skill.max_level) * 100, 100) : 0,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-surface p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          Skill Tree
        </h2>
        <motion.button
          onClick={() => router.push('/skills')}
          className="flex items-center gap-1 text-xs text-primary-light hover:text-primary transition-colors"
          whileHover={{ x: 2 }}
        >
          View Full Tree <ArrowRight className="w-3 h-3" />
        </motion.button>
      </div>

      {displaySkills.length === 0 ? (
        <div className="text-center py-6">
          <GitBranch className="w-8 h-8 text-muted/30 mx-auto mb-2" />
          <p className="text-xs text-muted-light">No skills available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {displaySkills.map((skill, i) => {
            const Icon = skillIcons[skill.icon] || Brain;
            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className={cn(
                  "rounded-xl border p-3 transition-all duration-200",
                  skill.isUnlocked
                    ? "border-primary/20 bg-primary/5 hover:border-primary/30"
                    : "border-white/5 bg-white/[0.02] opacity-50",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center",
                    skill.isUnlocked ? "bg-primary/20 text-primary-light" : "bg-white/5 text-muted",
                  )}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{skill.name}</div>
                    <div className="text-[9px] text-muted">{skill.category}</div>
                  </div>
                </div>

                {/* Mastery bar */}
                <div className="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.mastery}%` }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.05 }}
                  />
                </div>
                <div className="flex justify-between text-[8px] text-muted mt-1">
                  <span>Level {skill.currentLevel}/{skill.max_level}</span>
                  <span>{Math.round(skill.mastery)}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {availablePoints > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 rounded-xl bg-accent-orange/10 border border-accent-orange/20 p-3"
        >
          <Zap className="w-4 h-4 text-accent-orange" />
          <span className="text-xs text-accent-orange font-semibold">
            {availablePoints} skill point{availablePoints !== 1 ? 's' : ''} available!
          </span>
          <motion.button
            onClick={() => router.push('/skills')}
            className="ml-auto text-xs text-accent-orange underline"
            whileHover={{ x: 2 }}
          >
            Invest Now
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

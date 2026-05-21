"use client";
import { memo } from "react";
import { useRouter } from "next/navigation";
import { GitBranch, ArrowRight, Brain, Book, Eye, Target, Puzzle, Mic, Search, Clock, Zap } from "lucide-react";
import { GamePanel, PanelHeader, ProgressBar } from "@/components/ui/GamePanel";
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

interface PremiumSkillPreviewProps {
  skills?: SkillData[];
  userProgress?: UserSkillData[];
  availablePoints?: number;
}

export const PremiumSkillPreview = memo(function PremiumSkillPreview({
  skills = [], userProgress = [], availablePoints = 0,
}: PremiumSkillPreviewProps) {
  const router = useRouter();
  const progressMap = new Map(userProgress.map(s => [s.skill_id, s]));

  return (
    <GamePanel>
      <PanelHeader
        icon={<GitBranch className="h-4 w-4" />}
        title="Skill Tree"
        action={
          <button
            onClick={() => router.push('/skills')}
            className="flex items-center gap-1 text-xs font-black text-primary-light transition hover:text-white"
          >
            View Full <ArrowRight className="h-3 w-3" />
          </button>
        }
      />
      {skills.length === 0 ? (
        <div className="py-8 text-center text-muted-light text-sm">No skills available</div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {skills.slice(0, 6).map((skill) => {
            const progress = progressMap.get(skill.id);
            const currentLevel = progress?.current_level ?? 0;
            const isUnlocked = currentLevel > 0;
            const mastery = progress ? Math.min((currentLevel / skill.max_level) * 100, 100) : 0;
            const Icon = skillIcons[skill.icon] || Brain;

            return (
              <div
                key={skill.id}
                className={cn(
                  "rounded-[8px] border border-white/10 bg-black/18 p-3 transition hover:border-primary/30",
                  !isUnlocked && "opacity-50"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "grid h-8 w-8 place-items-center rounded-[8px]",
                    isUnlocked ? "bg-primary/20 text-primary-light" : "bg-white/5 text-muted",
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{skill.name}</div>
                    <div className="text-[10px] text-muted-light">{skill.category}</div>
                  </div>
                </div>
                <ProgressBar value={mastery} max={100} tone="from-primary to-secondary" className="mt-1.5" />
                <div className="flex justify-between text-[10px] text-muted-light mt-1">
                  <span>Level {currentLevel}/{skill.max_level}</span>
                  <span>{Math.round(mastery)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {availablePoints > 0 && (
        <div className="mt-3 flex items-center gap-2 rounded-[8px] border border-accent-orange/25 bg-accent-orange/10 p-3">
          <Zap className="h-4 w-4 text-accent-orange" />
          <span className="text-xs font-bold text-accent-orange">
            {availablePoints} skill point{availablePoints !== 1 ? "s" : ""} available!
          </span>
          <button
            onClick={() => router.push('/skills')}
            className="ml-auto text-xs font-black text-accent-orange underline"
          >
            Invest
          </button>
        </div>
      )}
    </GamePanel>
  );
});

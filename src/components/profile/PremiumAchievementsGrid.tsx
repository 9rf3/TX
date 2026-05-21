"use client";
import { memo } from "react";
import { Award, Sparkles } from "lucide-react";
import { GamePanel, PanelHeader, ProgressBar } from "@/components/ui/GamePanel";
import { cn, getRarityColor } from "@/lib/utils";
import type { AchievementDisplay, UserAchievementDisplay } from "@/lib/types";

interface PremiumAchievementsGridProps {
  catalog: AchievementDisplay[];
  unlocked: UserAchievementDisplay[];
}

export const PremiumAchievementsGrid = memo(function PremiumAchievementsGrid({ catalog, unlocked }: PremiumAchievementsGridProps) {
  const unlockedIds = new Set(unlocked.map(u => u.achievement_id));

  return (
    <GamePanel>
      <PanelHeader
        icon={<Award className="h-4 w-4" />}
        title="Achievements"
        action={
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
            {unlocked.length}/{catalog.length}
          </span>
        }
      />
      {catalog.length === 0 ? (
        <div className="py-8 text-center text-muted-light text-sm">No achievements available yet.</div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {catalog.map((ach) => {
            const isUnlocked = unlockedIds.has(ach.id);
            const ua = unlocked.find(u => u.achievement_id === ach.id);
            return (
              <div
                key={ach.id}
                className={cn(
                  "flex items-center gap-3 rounded-[8px] border border-white/10 bg-black/18 p-3 transition hover:border-primary/30",
                  !isUnlocked && "opacity-50"
                )}
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border text-lg"
                  style={{
                    borderColor: `${getRarityColor(ach.rarity)}44`,
                    backgroundColor: `${getRarityColor(ach.rarity)}18`,
                    color: getRarityColor(ach.rarity),
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white">{ach.title}</div>
                  <div className="text-xs text-muted-light">{ach.description}</div>
                  {!isUnlocked && (
                    <ProgressBar value={0} max={1} tone="from-primary to-secondary" className="mt-1.5" />
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-black" style={{ color: getRarityColor(ach.rarity) }}>{ach.rarity}</div>
                  <div className="text-[10px] text-muted-light">+{ach.xp_reward} XP</div>
                  {isUnlocked && ua && (
                    <div className="text-[9px] text-accent-green mt-0.5">
                      {new Date(ua.unlocked_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GamePanel>
  );
});

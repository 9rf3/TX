"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { SkillTreeData, SkillNode, UserSkillProgress } from "@/lib/types";

export interface SkillNodeWithProgress extends SkillNode {
  currentLevel: number;
  pointsInvested: number;
  isUnlocked: boolean;
  isMaxed: boolean;
  isAvailable: boolean;
}

export function useSkillTree() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<SkillNodeWithProgress[]>([]);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useRef(createClient());

  const fetchSkillTree = useCallback(async () => {
    if (!user) {
      setSkills([]);
      setAvailablePoints(0);
      setIsLoading(false);
      return;
    }
    try {
      const { getSkillTreeData } = await import('@/actions/skill-tree');
      const data: SkillTreeData = await getSkillTreeData();

      const processed: SkillNodeWithProgress[] = data.skills.map((skill) => {
        const progress = data.userProgress.find((p) => p.skill_id === skill.id);
        const currentLevel = progress?.current_level || 0;
        const pointsInvested = progress?.points_invested || 0;

        let isAvailable = false;
        if (!skill.parent_skill_id) {
          isAvailable = currentLevel < skill.max_level;
        } else {
          const parentProgress = data.userProgress.find(
            (p) => p.skill_id === skill.parent_skill_id
          );
          isAvailable =
            currentLevel < skill.max_level &&
            (parentProgress?.current_level || 0) >= 1;
        }

        return {
          ...skill,
          currentLevel,
          pointsInvested,
          isUnlocked: currentLevel > 0,
          isMaxed: currentLevel >= skill.max_level,
          isAvailable,
        };
      });

      setSkills(processed);
      setAvailablePoints(data.availablePoints);
      setUserLevel(data.userLevel);
    } catch (err) {
      console.error("Failed to load skill tree:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSkillTree();
  }, [fetchSkillTree]);

  const invest = useCallback(
    async (skillId: string) => {
      try {
        const { investSkillPoint } = await import('@/actions/skill-tree');
        const result = await investSkillPoint(skillId);
        setAvailablePoints(result.availablePoints);
        setUserLevel(result.userLevel);

        setSkills((prev) =>
          prev.map((s) => {
            const updated = result.userProgress.find(
              (p: UserSkillProgress) => p.skill_id === s.id
            );
            if (updated) {
              return {
                ...s,
                currentLevel: updated.current_level,
                pointsInvested: updated.points_invested,
                isUnlocked: updated.current_level > 0,
                isMaxed: updated.current_level >= s.max_level,
                isAvailable: updated.current_level < s.max_level,
              };
            }
            return s;
          })
        );

        return result;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to invest";
        throw new Error(message);
      }
    },
    []
  );

  return {
    skills,
    availablePoints,
    userLevel,
    isLoading,
    invest,
    refresh: fetchSkillTree,
  };
}

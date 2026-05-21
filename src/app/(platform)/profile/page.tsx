"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, RefreshCw, Sparkles, GraduationCap, Flame, BookOpen } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { GamePanel, PanelHeader, ProgressBar } from "@/components/ui/GamePanel";
import { PremiumProfileHero } from "@/components/profile/PremiumProfileHero";
import { PremiumStatsGrid } from "@/components/profile/PremiumStatsGrid";
import { PremiumAchievementsGrid } from "@/components/profile/PremiumAchievementsGrid";
import { PremiumSkillPreview } from "@/components/profile/PremiumSkillPreview";
import { PremiumProfileShop } from "@/components/profile/PremiumProfileShop";
import { PremiumPortfolioSection } from "@/components/profile/PremiumPortfolioSection";
import { ProfileIdentity } from "@/components/profile/ProfileIdentity";
import type { GamificationProfile, AchievementDisplay, UserAchievementDisplay, PortfolioProject, Certificate, ShopItem, SkillNode, UserSkillProgress, GitHubRepo } from "@/lib/types";

interface FullProfileData {
  profile: GamificationProfile | null;
  achievements: { catalog: AchievementDisplay[]; unlocked: UserAchievementDisplay[] };
  projects: PortfolioProject[];
  certificates: Certificate[];
  enrollments: { id: string; course: Record<string, unknown>; progress: number; completed: boolean; enrolled_at: string }[];
  inventory: { id: string; item_id: string; is_equipped: boolean; item: ShopItem }[];
  shopItems: ShopItem[];
  githubRepos: GitHubRepo[];
}

export default function ProfilePage() {
  const { profile: authProfile, user } = useAuth();
  const [data, setData] = useState<FullProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { getFullProfileData } = await import('@/actions/profile');
      const result = await getFullProfileData();
      if (result) {
        setData(result as unknown as FullProfileData);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const handleSelectAvatar = async (avatarId: string) => {
    const { selectAvatar } = await import('@/actions/profile');
    await selectAvatar(avatarId);
    handleRefresh();
  };

  const handleUploadAvatar = async (formData: FormData) => {
    const { uploadAvatar } = await import('@/actions/profile');
    return await uploadAvatar(formData);
  };

  const handleUpdateProfile = async (updateData: Record<string, unknown>) => {
    const { updateProfile } = await import('@/actions/profile');
    await updateProfile(updateData);
  };

  const handlePurchase = async (itemId: string) => {
    const { purchaseItem } = await import('@/actions/profile');
    await purchaseItem(itemId);
  };

  const handleEquip = async (itemId: string) => {
    const { equipItem } = await import('@/actions/profile');
    await equipItem(itemId);
  };

  const handleCreateProject = async (projectData: { title: string; description?: string; project_url?: string; github_url?: string; tags?: string[] }) => {
    const { createProject } = await import('@/actions/profile');
    await createProject(projectData);
  };

  const handleDeleteProject = async (id: string) => {
    const { deleteProject } = await import('@/actions/profile');
    await deleteProject(id);
    handleRefresh();
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-light text-sm">Loading player profile...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-accent-red mx-auto" />
          <p className="text-muted-light text-sm">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-xl bg-primary/20 text-primary-light text-sm hover:bg-primary/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const profile = data?.profile || null;
  const displayName = profile?.display_name || authProfile?.full_name || user?.email?.split('@')[0] || "Player";
  const username = profile?.username || user?.email?.split('@')[0] || "player";

  const stats = {
    tournamentsWon: profile?.tournaments_won ?? 0,
    pvpWon: profile?.pvp_won ?? 0,
    completedCourses: data?.enrollments?.filter(e => e.completed).length ?? 0,
    practiceHours: profile?.practice_hours ?? 0,
    quizAccuracy: profile?.quiz_accuracy ?? 0,
    currentStreak: profile?.current_streak ?? 0,
    longestStreak: profile?.longest_streak ?? 0,
    totalXp: profile?.total_xp_earned ?? 0,
    txCoins: profile?.tx_coins ?? 0,
    rank: profile?.rank ?? 0,
    achievementsUnlocked: data?.achievements?.unlocked?.length ?? 0,
  };

  const activeEnrollments = data?.enrollments?.filter(e => !e.completed) ?? [];

  return (
    <div className="relative min-h-full overflow-hidden bg-[#070b16] px-3 py-4 text-foreground sm:px-4 md:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(139,92,246,0.15),transparent_40%),radial-gradient(circle_at_85%_16%,rgba(6,182,212,0.12),transparent_38%),linear-gradient(180deg,rgba(10,10,15,0)_0%,rgba(7,11,22,1)_100%)]" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-5">
        <PremiumProfileHero profile={profile} displayName={displayName} username={username} />

        <PremiumStatsGrid {...stats} />

        {activeEnrollments.length > 0 && (
          <GamePanel>
            <PanelHeader
              icon={<BookOpen className="h-4 w-4" />}
              title="Active Courses"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {activeEnrollments.slice(0, 4).map((enrollment) => {
                const course = enrollment.course as { title?: string; thumbnail?: string; gradient?: string } | undefined;
                return (
                  <div key={enrollment.id} className="rounded-[8px] border border-white/10 bg-black/18 p-4 transition hover:border-primary/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] text-lg"
                        style={{ background: course?.gradient || "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}
                      >
                        {course?.title?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-white">{course?.title || "Unknown Course"}</div>
                        <div className="text-[10px] text-muted-light">In progress</div>
                      </div>
                    </div>
                    <ProgressBar value={enrollment.progress} max={100} tone="from-primary to-secondary" />
                    <div className="mt-1 text-right text-[10px] text-muted-light">{enrollment.progress}%</div>
                  </div>
                );
              })}
            </div>
          </GamePanel>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <PremiumSkillPreview />
          <PremiumAchievementsGrid
            catalog={data?.achievements?.catalog || []}
            unlocked={data?.achievements?.unlocked || []}
          />
        </div>

        <PremiumPortfolioSection
          projects={data?.projects || []}
          certificates={data?.certificates || []}
          githubRepos={data?.githubRepos || []}
        />

        <ProfileIdentity
          profile={profile}
          onSelectAvatar={handleSelectAvatar}
          onUploadAvatar={handleUploadAvatar}
          onUploadBanner={async () => ({ url: '' })}
          onUpdateProfile={handleUpdateProfile}
          onRefresh={handleRefresh}
        />

        {data?.shopItems && data.shopItems.length > 0 && (
          <PremiumProfileShop
            profile={profile}
            items={data.shopItems}
            inventory={data.inventory}
            onPurchase={handlePurchase}
            onEquip={handleEquip}
            onRefresh={handleRefresh}
          />
        )}
      </div>
    </div>
  );
}

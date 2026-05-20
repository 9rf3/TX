"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { AnimatedStatsGrid } from "@/components/profile/AnimatedStatsGrid";
import { XPProgressCard } from "@/components/profile/XPProgressCard";
import { AchievementsGrid } from "@/components/profile/AchievementsGrid";
import { SkillPreview } from "@/components/profile/SkillPreview";
import { ProfileShop } from "@/components/profile/ProfileShop";
import { ProfileIdentity } from "@/components/profile/ProfileIdentity";
import { PortfolioSection } from "@/components/profile/PortfolioSection";
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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

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
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 pb-24"
    >
      {/* Hero Section */}
      <motion.div variants={sectionVariants}>
        <ProfileHero profile={profile} displayName={displayName} username={username} />
      </motion.div>

      {/* XP Progress */}
      <motion.div variants={sectionVariants}>
        <XPProgressCard
          xp={profile?.xp ?? 0}
          level={profile?.level ?? 1}
          xpForNext={profile?.xpForNext ?? 100}
          totalXpEarned={profile?.total_xp_earned ?? 0}
          percentile={profile?.percentile ?? 0}
        />
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={sectionVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-orange" />
            Player Stats
          </h2>
          <motion.button
            onClick={handleRefresh}
            className="flex items-center gap-1 text-xs text-muted-light hover:text-white transition-colors"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </motion.button>
        </div>
        <AnimatedStatsGrid stats={stats} />
      </motion.div>

      {/* Learning Identity - Active Courses */}
      {data?.enrollments && data.enrollments.length > 0 && (
        <motion.div variants={sectionVariants}>
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-secondary" />
              Active Learning
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.enrollments.slice(0, 4).map((enrollment) => {
                const course = enrollment.course as { title?: string; thumbnail?: string; gradient?: string } | undefined;
                return (
                  <motion.div
                    key={enrollment.id}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-border/50 bg-white/5 p-4 hover:border-border-light transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{
                          background: course?.gradient ? `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` : undefined,
                        }}
                      >
                        {course?.title?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{course?.title || 'Unknown Course'}</div>
                        <div className="text-[10px] text-muted">
                          {enrollment.completed ? 'Completed' : `${enrollment.progress}% complete`}
                        </div>
                      </div>
                    </div>
                    <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        initial={{ width: 0 }}
                        animate={{ width: `${enrollment.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Skill Preview & Achievements Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={sectionVariants}>
          <SkillPreview
            availablePoints={0}
          />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <AchievementsGrid
            catalog={data?.achievements?.catalog || []}
            unlocked={data?.achievements?.unlocked || []}
          />
        </motion.div>
      </div>

      {/* Identity & Customization */}
      <motion.div variants={sectionVariants}>
        <ProfileIdentity
          profile={profile}
          onSelectAvatar={handleSelectAvatar}
          onUploadAvatar={handleUploadAvatar}
          onUploadBanner={async () => ({ url: '' })}
          onUpdateProfile={handleUpdateProfile}
          onRefresh={handleRefresh}
        />
      </motion.div>

      {/* Portfolio */}
      <motion.div variants={sectionVariants}>
        <PortfolioSection
          projects={data?.projects || []}
          certificates={data?.certificates || []}
          githubRepos={data?.githubRepos || []}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onUploadCertificate={async () => {}}
          onRefresh={handleRefresh}
        />
      </motion.div>

      {/* Shop */}
      {data?.shopItems && data.shopItems.length > 0 && (
        <motion.div variants={sectionVariants}>
          <ProfileShop
            profile={profile}
            items={data.shopItems}
            inventory={data.inventory}
            onPurchase={handlePurchase}
            onEquip={handleEquip}
            onRefresh={handleRefresh}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

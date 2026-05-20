export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNext: number;
  rank: number;
  streak: number;
  badges: Badge[];
  completedCourses: number;
  totalCourses: number;
  joinedAt: string;
  isOnline: boolean;
  role: UserRole;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  thumbnail: string;
  gradient: string;
  instructor: Instructor;
  lessons: Lesson[];
  totalLessons: number;
  completedLessons: number;
  duration: string;
  xpReward: number;
  rating: number;
  students: number;
  price: number | 'free';
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  achievements: Achievement[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  order: number;
  isCompleted: boolean;
  isLocked: boolean;
  xpReward: number;
  type: 'video' | 'reading' | 'quiz' | 'project';
}

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  title: string;
  bio: string;
  rating: number;
  students: number;
  courses: number;
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  questions: Question[];
  timeLimit: number; // seconds
  xpReward: number;
  passingScore: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  xp: number;
  level: number;
  streak: number;
  change: number; // position change
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface Friend {
  user: User;
  status: 'online' | 'offline' | 'away';
  lastActivity: string;
  mutualFriends: number;
}

export interface ActivityItem {
  id: string;
  user: User;
  action: string;
  target: string;
  timestamp: string;
  type: 'course_complete' | 'achievement' | 'level_up' | 'streak' | 'quiz';
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  maxProgress: number;
  icon: string;
  isCompleted: boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalRevenue: number;
  userGrowth: number;
  courseGrowth: number;
  revenueGrowth: number;
  engagementRate: number;
}

export type CourseCategory = 'all' | 'development' | 'design' | 'data-science' | 'business' | 'marketing' | 'ai';

export interface WeeklyStats {
  day: string;
  xp: number;
  lessons: number;
}

export interface MonthlyStats {
  month: string;
  users: number;
  revenue: number;
  courses: number;
}

// ─── Database model types ────────────────────────────────────────────────────

export type DbVideoType = 'upload' | 'external' | 'none';

export interface DbCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string | null;
  gradient: string | null;
  price: string;
  level: string;
  published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DbCourseWithInstructor extends DbCourse {
  instructor: {
    id: string;
    email: string | null;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    role: UserRole;
  } | null;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// ─── Skill Tree types ─────────────────────────────────────────────────────────

export interface SkillNode {
  id: string;
  name: string;
  category: string;
  description: string | null;
  icon: string;
  max_level: number;
  parent_skill_id: string | null;
  position_x: number;
  position_y: number;
}

export interface UserSkillProgress {
  skill_id: string;
  current_level: number;
  points_invested: number;
}

export interface SkillTreeData {
  skills: SkillNode[];
  userProgress: UserSkillProgress[];
  availablePoints: number;
  userLevel: number;
}

export interface DbCourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_type: DbVideoType;
  duration: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// ─── Extended Profile types ──────────────────────────────────────────────────

export interface ExtendedProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: UserRole;
  xp: number;
  level: number;
  tx_coins: number;
  current_streak: number;
  longest_streak: number;
  total_xp_earned: number;
  total_coins_earned: number;
  last_reward_claimed_at: string | null;
  last_active_at: string | null;
  tournaments_won: number;
  pvp_won: number;
  practice_hours: number;
  quiz_accuracy: number;
  // Premium profile fields
  display_name: string | null;
  bio: string | null;
  country: string | null;
  university: string | null;
  focus_areas: string[] | null;
  github_username: string | null;
  profile_banner: string | null;
  profile_theme: string | null;
  profile_accent: string | null;
  selected_avatar: string | null;
  created_at: string;
}

export interface GamificationProfile extends ExtendedProfile {
  rank: number;
  totalUsers: number;
  percentile: number;
  xpForNext: number;
}

// ─── Shop types ──────────────────────────────────────────────────────────────

export type ShopItemType = 'avatar_frame' | 'profile_banner' | 'profile_theme' | 'profile_accent' | 'avatar' | 'effect' | 'badge';

export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  item_type: ShopItemType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image_url: string | null;
  preview_url: string | null;
  price_coins: number;
  price_xp: number;
  level_requirement: number;
  tier_requirement: string | null;
  is_limited: boolean;
  is_active: boolean;
  created_at: string;
}

export interface UserInventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  purchased_at: string;
  is_equipped: boolean;
  item: ShopItem;
}

// ─── Portfolio types ─────────────────────────────────────────────────────────

export interface PortfolioProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  project_url: string | null;
  github_url: string | null;
  tags: string[] | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  title: string;
  issuer: string | null;
  image_url: string | null;
  issued_at: string | null;
  created_at: string;
}

// ─── Enrollment types ────────────────────────────────────────────────────────

export interface UserEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed: boolean;
  enrolled_at: string;
  completed_at: string | null;
  course?: DbCourse;
}

// ─── Rank tier config ────────────────────────────────────────────────────────

export interface RankTierConfig {
  name: string;
  color: string;
  gradient: string;
  glow: string;
  icon: string;
  minLevel: number;
  maxLevel: number;
}

export const RANK_TIERS: RankTierConfig[] = [
  { name: 'Bronze',   color: '#cd7f32', gradient: 'from-amber-700/20 to-amber-600/10', glow: 'rgba(205,127,50,0.3)', icon: 'Shield', minLevel: 1, maxLevel: 10 },
  { name: 'Silver',   color: '#c0c0c0', gradient: 'from-slate-300/20 to-slate-200/10', glow: 'rgba(192,192,192,0.3)', icon: 'Shield', minLevel: 11, maxLevel: 25 },
  { name: 'Gold',     color: '#ffd700', gradient: 'from-yellow-400/20 to-yellow-300/10', glow: 'rgba(255,215,0,0.4)', icon: 'Medal', minLevel: 26, maxLevel: 50 },
  { name: 'Platinum', color: '#e5e4e2', gradient: 'from-cyan-200/20 to-cyan-100/10', glow: 'rgba(229,228,226,0.3)', icon: 'Diamond', minLevel: 51, maxLevel: 75 },
  { name: 'Diamond',  color: '#b9f2ff', gradient: 'from-sky-300/20 to-sky-200/10', glow: 'rgba(185,242,255,0.4)', icon: 'Diamond', minLevel: 76, maxLevel: 99 },
  { name: 'Elite',    color: '#ff6b35', gradient: 'from-orange-400/20 to-red-400/10', glow: 'rgba(255,107,53,0.5)', icon: 'Crown', minLevel: 100, maxLevel: 999 },
];

export function getRankTier(level: number): RankTierConfig {
  return RANK_TIERS.find(t => level >= t.minLevel && level <= t.maxLevel) || RANK_TIERS[0];
}

export function getNextRankTier(level: number): RankTierConfig | null {
  const current = getRankTier(level);
  const idx = RANK_TIERS.findIndex(t => t.name === current.name);
  return idx < RANK_TIERS.length - 1 ? RANK_TIERS[idx + 1] : null;
}

// ─── Achievement display types ───────────────────────────────────────────────

export interface AchievementDisplay {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  coins_reward: number;
  rarity: string;
  criteria_type: string;
  criteria_value: number;
}

export interface UserAchievementDisplay {
  id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement: AchievementDisplay;
}

export const RARITY_COLORS: Record<string, string> = {
  common: 'border-slate-400/20 bg-slate-400/5 text-slate-300 shadow-slate-400/10',
  rare: 'border-blue-400/20 bg-blue-400/5 text-blue-300 shadow-blue-400/10',
  epic: 'border-purple-400/20 bg-purple-400/5 text-purple-300 shadow-purple-400/10',
  legendary: 'border-yellow-400/20 bg-yellow-400/5 text-yellow-300 shadow-yellow-400/10',
};

export const RARITY_GLOWS: Record<string, string> = {
  common: '0 0 10px rgba(148,163,184,0.2)',
  rare: '0 0 15px rgba(96,165,250,0.3)',
  epic: '0 0 20px rgba(168,85,247,0.4)',
  legendary: '0 0 30px rgba(250,204,21,0.5)',
};

// ─── Preset avatars ──────────────────────────────────────────────────────────

export interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  updated_at: string;
}

export const PRESET_AVATARS = [
  { id: 'preset-1',  name: 'Phoenix',   url: '/avatars/preset-1.svg' },
  { id: 'preset-2',  name: 'Dragon',    url: '/avatars/preset-2.svg' },
  { id: 'preset-3',  name: 'Wolf',      url: '/avatars/preset-3.svg' },
  { id: 'preset-4',  name: 'Knight',    url: '/avatars/preset-4.svg' },
  { id: 'preset-5',  name: 'Mage',      url: '/avatars/preset-5.svg' },
  { id: 'preset-6',  name: 'Cyber',     url: '/avatars/preset-6.svg' },
  { id: 'preset-7',  name: 'Samurai',   url: '/avatars/preset-7.svg' },
  { id: 'preset-8',  name: 'Ghost',     url: '/avatars/preset-8.svg' },
  { id: 'preset-9',  name: 'Titan',     url: '/avatars/preset-9.svg' },
  { id: 'preset-10', name: 'Void',      url: '/avatars/preset-10.svg' },
];

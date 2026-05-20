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

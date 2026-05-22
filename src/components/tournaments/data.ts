/**
 * Centralized data types and mock data for the Tournaments feature.
 * All component data is defined here for single-source-of-truth management
 * and easy replacement with API bindings.
 */

/* ================================================================== */
/*  Shared Enums & Constants                                          */
/* ================================================================== */

export type TournamentStatus = "LIVE" | "UPCOMING" | "COMPLETED";
export type Difficulty = "Easy" | "Medium" | "Hard" | "Elite";
export type TournamentResult = "Won" | "Lost";
export type LeaderboardScope = "Global" | "Regional" | "Friends";

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { color: string; cssColor: string }
> = {
  Easy: { color: "text-accent-green", cssColor: "#10b981" },
  Medium: { color: "text-secondary", cssColor: "#06b6d4" },
  Hard: { color: "text-accent-orange", cssColor: "#f59e0b" },
  Elite: { color: "text-accent-red", cssColor: "#ef4444" },
};

/* ================================================================== */
/*  Season                                                             */
/* ================================================================== */

export interface SeasonInfo {
  number: number;
  name: string;
  endDate: string; // ISO string
}

export const currentSeason: SeasonInfo = {
  number: 3,
  name: "Season 3",
  endDate: "2025-06-03T12:00:00Z",
};

/* ================================================================== */
/*  Hero Stats                                                         */
/* ================================================================== */

export interface HeroStat {
  id: string;
  label: string;
  value: string;
  sub: string;
  subColor: string;
  iconName: "crown" | "star" | "users" | "coins";
  iconColor: string;
  bgGlow: string;
}

export const heroStats: HeroStat[] = [
  {
    id: "rank",
    label: "My Rank",
    value: "#24",
    sub: "Top 2%",
    subColor: "text-accent-orange",
    iconName: "crown",
    iconColor: "text-accent-orange",
    bgGlow: "from-amber-500/20 to-orange-600/5",
  },
  {
    id: "points",
    label: "My Points",
    value: "2,450 XP",
    sub: "Next Rank: 2,800 XP",
    subColor: "text-primary-light",
    iconName: "star",
    iconColor: "text-primary-light",
    bgGlow: "from-violet-500/20 to-purple-600/5",
  },
  {
    id: "players",
    label: "Total Players",
    value: "8,432",
    sub: "+124 this week",
    subColor: "text-accent-green",
    iconName: "users",
    iconColor: "text-accent-green",
    bgGlow: "from-emerald-500/20 to-green-600/5",
  },
  {
    id: "prize",
    label: "Prize Pool",
    value: "25,000",
    sub: "TX Coins",
    subColor: "text-accent-orange",
    iconName: "coins",
    iconColor: "text-accent-orange",
    bgGlow: "from-yellow-500/20 to-amber-600/5",
  },
];

/* ================================================================== */
/*  Tournament Cards (Live / Upcoming / Completed)                     */
/* ================================================================== */

export interface TournamentCard {
  id: string;
  status: TournamentStatus;
  title: string;
  category: string;
  endTime: string; // ISO string or relative offset for demo
  participants: number;
  maxParticipants: number;
  prizePool: number;
  prizeDisplay: string;
  difficulty: Difficulty;
  iconName: "zap" | "brain" | "mic" | "code" | "globe" | "shield";
  gradient: string;
  overlayPattern: string;
}

export const liveTournaments: TournamentCard[] = [
  {
    id: "live-1",
    status: "LIVE",
    title: "Code Warriors",
    category: "Full-Stack Development",
    endTime: new Date(Date.now() + 3 * 3_600_000 + 45 * 60_000).toISOString(),
    participants: 1245,
    maxParticipants: 2000,
    prizePool: 10000,
    prizeDisplay: "10,000 TX",
    difficulty: "Hard",
    iconName: "zap",
    gradient: "linear-gradient(145deg, #0f172a 0%, #1a0b2e 40%, #0c1a2e 100%)",
    overlayPattern:
      "radial-gradient(circle at 80% 20%, rgba(139,92,246,0.15) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(6,182,212,0.1) 0%, transparent 50%)",
  },
  {
    id: "live-2",
    status: "LIVE",
    title: "AI Challenge",
    category: "Machine Learning",
    endTime: new Date(Date.now() + 1 * 3_600_000 + 22 * 60_000).toISOString(),
    participants: 876,
    maxParticipants: 1500,
    prizePool: 15000,
    prizeDisplay: "15,000 TX",
    difficulty: "Elite",
    iconName: "brain",
    gradient: "linear-gradient(145deg, #0a1628 0%, #0c1a3d 40%, #091230 100%)",
    overlayPattern:
      "radial-gradient(circle at 70% 30%, rgba(59,130,246,0.15) 0%, transparent 60%), radial-gradient(circle at 30% 70%, rgba(139,92,246,0.1) 0%, transparent 50%)",
  },
  {
    id: "live-3",
    status: "LIVE",
    title: "IELTS Battle",
    category: "English Language",
    endTime: new Date(Date.now() + 5 * 3_600_000 + 10 * 60_000).toISOString(),
    participants: 2134,
    maxParticipants: 3000,
    prizePool: 8000,
    prizeDisplay: "8,000 TX",
    difficulty: "Medium",
    iconName: "mic",
    gradient: "linear-gradient(145deg, #1a1006 0%, #2a1a0a 40%, #1a1206 100%)",
    overlayPattern:
      "radial-gradient(circle at 60% 40%, rgba(245,158,11,0.12) 0%, transparent 60%), radial-gradient(circle at 40% 60%, rgba(234,179,8,0.08) 0%, transparent 50%)",
  },
];

/* ================================================================== */
/*  PvP Arena                                                          */
/* ================================================================== */

export interface ArenaMode {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  playersOnline: number;
  buttonLabel: string;
  variant: "purple" | "gold";
}

export const arenaModes: ArenaMode[] = [
  {
    id: "1v1",
    title: "1V1 ARENA",
    subtitle: "PvP",
    description: "Compete against other learners in real-time knowledge battles",
    playersOnline: 1245,
    buttonLabel: "Fight Now",
    variant: "purple",
  },
  {
    id: "quick",
    title: "QUICK MATCH",
    subtitle: "Quick",
    description: "Find a random opponent in your skill range for a fast duel",
    playersOnline: 964,
    buttonLabel: "Quick Match",
    variant: "gold",
  },
];

export interface LiveBattlesTicker {
  liveBattles: number;
  watching: number;
  streamers: { initials: string; gradient: string }[];
}

export const liveBattlesData: LiveBattlesTicker = {
  liveBattles: 128,
  watching: 125,
  streamers: [
    { initials: "AK", gradient: "from-violet-500 to-purple-600" },
    { initials: "SL", gradient: "from-blue-500 to-cyan-600" },
    { initials: "MR", gradient: "from-pink-500 to-rose-600" },
    { initials: "JP", gradient: "from-amber-500 to-orange-600" },
  ],
};

/* ================================================================== */
/*  Rewards                                                            */
/* ================================================================== */

export interface RewardTier {
  id: number;
  place: string;
  title: string;
  coins: string;
  badge: string;
  badgeVariant: "gold" | "silver" | "bronze" | "purple" | "gray";
  image?: string;
}

export const rewardTiers: RewardTier[] = [
  { id: 1, place: "1st Place", title: "Champion", coins: "10,000 TX", badge: "Legendary", badgeVariant: "gold", image: "/tournaments/gold-trophy.png" },
  { id: 2, place: "2nd Place", title: "Elite", coins: "7,500 TX", badge: "Elite", badgeVariant: "silver", image: "/tournaments/silver-trophy.png" },
  { id: 3, place: "3rd Place", title: "Veteran", coins: "5,000 TX", badge: "Rare", badgeVariant: "bronze", image: "/tournaments/bronze-trophy.png" },
  { id: 4, place: "Top 4-10", title: "Contender", coins: "2,500 TX", badge: "Epic", badgeVariant: "purple" },
  { id: 5, place: "Top 11-50", title: "Participant", coins: "500 TX", badge: "Common", badgeVariant: "gray" },
];

export const REWARD_STYLE: Record<
  RewardTier["badgeVariant"],
  { textColor: string; borderColor: string; glowColor: string; bgGradient: string; iconColor: string; cssColor: string }
> = {
  gold: {
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    bgGradient: "linear-gradient(145deg, #1a1508 0%, #221a06 100%)",
    iconColor: "text-amber-400",
    cssColor: "#fbbf24",
  },
  silver: {
    textColor: "text-slate-300",
    borderColor: "border-slate-400/20",
    glowColor: "shadow-[0_0_15px_rgba(148,163,184,0.1)]",
    bgGradient: "linear-gradient(145deg, #0f1218 0%, #151a22 100%)",
    iconColor: "text-slate-300",
    cssColor: "#94a3b8",
  },
  bronze: {
    textColor: "text-amber-700",
    borderColor: "border-amber-800/20",
    glowColor: "shadow-[0_0_15px_rgba(180,83,9,0.1)]",
    bgGradient: "linear-gradient(145deg, #181008 0%, #1e1510 100%)",
    iconColor: "text-amber-700",
    cssColor: "#b45309",
  },
  purple: {
    textColor: "text-primary-light",
    borderColor: "border-primary/20",
    glowColor: "",
    bgGradient: "linear-gradient(145deg, #0e0e1e 0%, #13132a 100%)",
    iconColor: "text-primary-light",
    cssColor: "#a78bfa",
  },
  gray: {
    textColor: "text-muted-light",
    borderColor: "border-white/5",
    glowColor: "",
    bgGradient: "linear-gradient(145deg, #0c0c16 0%, #101020 100%)",
    iconColor: "text-muted-light",
    cssColor: "#94a3b8",
  },
};

/* ================================================================== */
/*  Leaderboard                                                        */
/* ================================================================== */

export interface LeaderboardUser {
  rank: number;
  username: string;
  tier: string;
  tierColor: string;
  xp: number;
  xpDisplay: string;
  initials: string;
  avatarGradient: string;
}

export const leaderboardData: LeaderboardUser[] = [
  { rank: 1, username: "DragonSlayer", tier: "Legend", tierColor: "#F59E0B", xp: 12450, xpDisplay: "12,450", initials: "DS", avatarGradient: "from-amber-500 to-orange-600" },
  { rank: 2, username: "CodeNinja", tier: "Legend", tierColor: "#F59E0B", xp: 11200, xpDisplay: "11,200", initials: "CN", avatarGradient: "from-purple-500 to-pink-600" },
  { rank: 3, username: "PixelQueen", tier: "Elite", tierColor: "#3B82F6", xp: 10800, xpDisplay: "10,800", initials: "PQ", avatarGradient: "from-cyan-500 to-blue-600" },
  { rank: 4, username: "ByteKing", tier: "Elite", tierColor: "#3B82F6", xp: 9650, xpDisplay: "9,650", initials: "BK", avatarGradient: "from-green-500 to-emerald-600" },
  { rank: 5, username: "AlgoMaster", tier: "Master", tierColor: "#8B5CF6", xp: 8900, xpDisplay: "8,900", initials: "AM", avatarGradient: "from-indigo-500 to-violet-600" },
];

export const currentPlayerLeaderboard: LeaderboardUser = {
  rank: 24,
  username: "You",
  tier: "Diamond",
  tierColor: "#06B6D4",
  xp: 2450,
  xpDisplay: "2,450",
  initials: "JG",
  avatarGradient: "from-violet-500 to-purple-600",
};

/* ================================================================== */
/*  Upcoming Tournaments                                               */
/* ================================================================== */

export interface UpcomingTournamentEntry {
  id: number;
  title: string;
  iconType: "html" | "python" | "react" | "algo";
  iconBg: string;
  date: string;
  time: string;
  prize: string;
  participants: number;
}

export const upcomingTournaments: UpcomingTournamentEntry[] = [
  { id: 1, title: "Web Dev Championship", iconType: "html", iconBg: "#E34F26", date: "May 28, 2025", time: "3:00 PM", prize: "5,000 TX", participants: 234 },
  { id: 2, title: "Python Masters", iconType: "python", iconBg: "#3776AB", date: "Jun 2, 2025", time: "5:00 PM", prize: "8,000 TX", participants: 456 },
  { id: 3, title: "React Challenge", iconType: "react", iconBg: "#06B6D4", date: "Jun 5, 2025", time: "2:00 PM", prize: "6,500 TX", participants: 312 },
  { id: 4, title: "Algorithm Arena", iconType: "algo", iconBg: "#8B5CF6", date: "Jun 10, 2025", time: "4:00 PM", prize: "10,000 TX", participants: 567 },
];

/* ================================================================== */
/*  Recent Tournament History                                          */
/* ================================================================== */

export interface RecentTournamentEntry {
  id: number;
  name: string;
  date: string;
  rank: string;
  xp: string;
  status: TournamentResult;
}

export const recentTournamentHistory: RecentTournamentEntry[] = [
  { id: 1, name: "JavaScript Cup", date: "May 15", rank: "#1", xp: "+450 XP", status: "Won" },
  { id: 2, name: "CSS Battle Royale", date: "May 12", rank: "#3", xp: "+280 XP", status: "Won" },
  { id: 3, name: "TypeScript Arena", date: "May 8", rank: "#12", xp: "+120 XP", status: "Lost" },
  { id: 4, name: "React Masters", date: "May 5", rank: "#2", xp: "+350 XP", status: "Won" },
  { id: 5, name: "Node.js Clash", date: "May 1", rank: "#24", xp: "+80 XP", status: "Lost" },
];

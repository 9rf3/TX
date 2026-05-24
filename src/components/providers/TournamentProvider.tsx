"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  TournamentCard,
  LeaderboardUser,
  RecentTournamentEntry,
  RewardTier,
  HeroStat,
  liveTournaments as defaultLive,
  upcomingTournaments as defaultUpcoming,
  leaderboardData as defaultLeaderboard,
  recentTournamentHistory as defaultHistory,
  rewardTiers as defaultRewards,
  heroStats as defaultStats,
} from "@/components/tournaments/data";

interface TournamentContextType {
  tournaments: TournamentCard[];
  leaderboard: LeaderboardUser[];
  recentHistory: RecentTournamentEntry[];
  rewardTiers: RewardTier[];
  heroStats: HeroStat[];
  
  // Tournament CRUD
  addTournament: (t: Omit<TournamentCard, "id">) => void;
  updateTournament: (id: string, updates: Partial<TournamentCard>) => void;
  deleteTournament: (id: string) => void;
  
  // Leaderboard CRUD
  addLeaderboardUser: (u: LeaderboardUser) => void;
  updateLeaderboardUser: (username: string, updates: Partial<LeaderboardUser>) => void;
  deleteLeaderboardUser: (username: string) => void;
  
  // History CRUD
  addHistoryEntry: (h: Omit<RecentTournamentEntry, "id">) => void;
  deleteHistoryEntry: (id: number) => void;
  
  // Global actions
  resetToDefaults: () => void;
  isHydrated: boolean;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  TOURNAMENTS: "twokax_tournaments_list",
  LEADERBOARD: "twokax_tournaments_leaderboard",
  HISTORY: "twokax_tournaments_history",
  REWARDS: "twokax_tournaments_rewards",
  STATS: "twokax_tournaments_stats",
};

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [tournaments, setTournaments] = useState<TournamentCard[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [recentHistory, setRecentHistory] = useState<RecentTournamentEntry[]>([]);
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>([]);
  const [heroStats, setHeroStats] = useState<HeroStat[]>([]);

  // 1. Client hydration
  useEffect(() => {
    try {
      // Load tournaments (combined live & upcoming, or parse defaults)
      const storedTournaments = localStorage.getItem(LOCAL_STORAGE_KEYS.TOURNAMENTS);
      if (storedTournaments) {
        setTournaments(JSON.parse(storedTournaments));
      } else {
        // Merge initial mock data into a unified array
        const initialCombined: TournamentCard[] = [
          ...defaultLive,
          ...defaultUpcoming.map((item) => ({
            id: `upcoming-${item.id}`,
            status: "UPCOMING" as const,
            title: item.title,
            category: item.iconType === "html" ? "Web Development" : 
                      item.iconType === "python" ? "Python Programming" : 
                      item.iconType === "react" ? "React Frontend" : "Algorithms",
            endTime: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
            participants: item.participants,
            maxParticipants: item.participants + 100,
            prizePool: parseInt(item.prize.replace(/[^0-9]/g, "")),
            prizeDisplay: item.prize,
            difficulty: (item.iconType === "algo" ? "Hard" : "Medium") as unknown as TournamentCard["difficulty"],
            iconName: (item.iconType === "algo" ? "zap" : 
                       item.iconType === "react" ? "zap" : "code") as unknown as TournamentCard["iconName"],
            gradient: "linear-gradient(145deg, #0a101f 0%, #150f28 100%)",
            overlayPattern: "",
          })),
        ];
        setTournaments(initialCombined);
        localStorage.setItem(LOCAL_STORAGE_KEYS.TOURNAMENTS, JSON.stringify(initialCombined));
      }

      // Load leaderboard
      const storedLeaderboard = localStorage.getItem(LOCAL_STORAGE_KEYS.LEADERBOARD);
      if (storedLeaderboard) {
        setLeaderboard(JSON.parse(storedLeaderboard));
      } else {
        setLeaderboard(defaultLeaderboard);
        localStorage.setItem(LOCAL_STORAGE_KEYS.LEADERBOARD, JSON.stringify(defaultLeaderboard));
      }

      // Load history
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEYS.HISTORY);
      if (storedHistory) {
        setRecentHistory(JSON.parse(storedHistory));
      } else {
        setRecentHistory(defaultHistory);
        localStorage.setItem(LOCAL_STORAGE_KEYS.HISTORY, JSON.stringify(defaultHistory));
      }

      // Load rewards
      const storedRewards = localStorage.getItem(LOCAL_STORAGE_KEYS.REWARDS);
      if (storedRewards) {
        setRewardTiers(JSON.parse(storedRewards));
      } else {
        setRewardTiers(defaultRewards);
        localStorage.setItem(LOCAL_STORAGE_KEYS.REWARDS, JSON.stringify(defaultRewards));
      }

      // Load stats
      const storedStats = localStorage.getItem(LOCAL_STORAGE_KEYS.STATS);
      if (storedStats) {
        setHeroStats(JSON.parse(storedStats));
      } else {
        setHeroStats(defaultStats);
        localStorage.setItem(LOCAL_STORAGE_KEYS.STATS, JSON.stringify(defaultStats));
      }
    } catch (e) {
      console.error("Failed to hydrate tournament localState", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // 2. Helper sync to localStorage
  const saveToStorage = (key: string, data: unknown) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  // 3. Tournament actions
  const addTournament = (newT: Omit<TournamentCard, "id">) => {
    const fresh: TournamentCard = {
      ...newT,
      // eslint-disable-next-line react-hooks/purity
      id: `t-${Date.now()}`,
    };
    const updated = [fresh, ...tournaments];
    setTournaments(updated);
    saveToStorage(LOCAL_STORAGE_KEYS.TOURNAMENTS, updated);

    // Dynamic stats update: Total prize pool & players incrementation
    updateCalculatedStats(updated);
  };

  const updateTournament = (id: string, updates: Partial<TournamentCard>) => {
    const updated = tournaments.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTournaments(updated);
    saveToStorage(LOCAL_STORAGE_KEYS.TOURNAMENTS, updated);
    updateCalculatedStats(updated);
  };

  const deleteTournament = (id: string) => {
    const updated = tournaments.filter((t) => t.id !== id);
    setTournaments(updated);
    saveToStorage(LOCAL_STORAGE_KEYS.TOURNAMENTS, updated);
    updateCalculatedStats(updated);
  };

  // 4. Leaderboard actions
  const addLeaderboardUser = (u: LeaderboardUser) => {
    const updated = [...leaderboard, u].sort((a, b) => b.xp - a.xp).map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
    setLeaderboard(updated);
    saveToStorage(LOCAL_STORAGE_KEYS.LEADERBOARD, updated);
    updateCalculatedStats(tournaments);
  };

  const updateLeaderboardUser = (username: string, updates: Partial<LeaderboardUser>) => {
    const updated = leaderboard
      .map((u) => (u.username === username ? { ...u, ...updates } : u))
      .sort((a, b) => b.xp - a.xp)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
    setLeaderboard(updated);
    saveToStorage(LOCAL_STORAGE_KEYS.LEADERBOARD, updated);
    updateCalculatedStats(tournaments);
  };

  const deleteLeaderboardUser = (username: string) => {
    const updated = leaderboard
      .filter((u) => u.username !== username)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));
    setLeaderboard(updated);
    saveToStorage(LOCAL_STORAGE_KEYS.LEADERBOARD, updated);
    updateCalculatedStats(tournaments);
  };

  // 5. Match history actions
  const addHistoryEntry = (entry: Omit<RecentTournamentEntry, "id">) => {
    const fresh: RecentTournamentEntry = {
      ...entry,
      id: Date.now(),
    };
    const updated = [fresh, ...recentHistory].slice(0, 10);
    setRecentHistory(updated);
    saveToStorage(LOCAL_STORAGE_KEYS.HISTORY, updated);
  };

  const deleteHistoryEntry = (id: number) => {
    const updated = recentHistory.filter((h) => h.id !== id);
    setRecentHistory(updated);
    saveToStorage(LOCAL_STORAGE_KEYS.HISTORY, updated);
  };

  // 6. Recalculate stats dynamically based on actual entries
  const updateCalculatedStats = (tList: TournamentCard[]) => {
    const totalPrize = tList.reduce((acc, curr) => acc + curr.prizePool, 0);
    
    const updatedStats = heroStats.map((stat) => {
      if (stat.id === "players") {
        const totalParticipants = tList.reduce((acc, curr) => acc + curr.participants, 0);
        return {
          ...stat,
          value: (totalParticipants + 5000).toLocaleString(), // Offset with base global pool
        };
      }
      if (stat.id === "prize") {
        return {
          ...stat,
          value: totalPrize.toLocaleString(),
        };
      }
      return stat;
    });

    setHeroStats(updatedStats);
    saveToStorage(LOCAL_STORAGE_KEYS.STATS, updatedStats);
  };

  // 7. Global reset
  const resetToDefaults = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOURNAMENTS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.LEADERBOARD);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.HISTORY);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.REWARDS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.STATS);
    }
    
    // Clear in memory
    const initialCombined: TournamentCard[] = [
      ...defaultLive,
      ...defaultUpcoming.map((item) => ({
        id: `upcoming-${item.id}`,
        status: "UPCOMING" as const,
        title: item.title,
        category: item.iconType === "html" ? "Web Development" : 
                  item.iconType === "python" ? "Python Programming" : 
                  item.iconType === "react" ? "React Frontend" : "Algorithms",
        endTime: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        participants: item.participants,
        maxParticipants: item.participants + 100,
        prizePool: parseInt(item.prize.replace(/[^0-9]/g, "")),
        prizeDisplay: item.prize,
        difficulty: (item.iconType === "algo" ? "Hard" : "Medium") as unknown as TournamentCard["difficulty"],
        iconName: (item.iconType === "algo" ? "zap" : 
                   item.iconType === "react" ? "zap" : "code") as unknown as TournamentCard["iconName"],
        gradient: "linear-gradient(145deg, #0a101f 0%, #150f28 100%)",
        overlayPattern: "",
      })),
    ];

    setTournaments(initialCombined);
    setLeaderboard(defaultLeaderboard);
    setRecentHistory(defaultHistory);
    setRewardTiers(defaultRewards);
    setHeroStats(defaultStats);
    
    // Save defaults
    saveToStorage(LOCAL_STORAGE_KEYS.TOURNAMENTS, initialCombined);
    saveToStorage(LOCAL_STORAGE_KEYS.LEADERBOARD, defaultLeaderboard);
    saveToStorage(LOCAL_STORAGE_KEYS.HISTORY, defaultHistory);
    saveToStorage(LOCAL_STORAGE_KEYS.REWARDS, defaultRewards);
    saveToStorage(LOCAL_STORAGE_KEYS.STATS, defaultStats);
  };

  return (
    <TournamentContext.Provider
      value={{
        tournaments,
        leaderboard,
        recentHistory,
        rewardTiers,
        heroStats,
        addTournament,
        updateTournament,
        deleteTournament,
        addLeaderboardUser,
        updateLeaderboardUser,
        deleteLeaderboardUser,
        addHistoryEntry,
        deleteHistoryEntry,
        resetToDefaults,
        isHydrated,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournaments() {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error("useTournaments must be used within a TournamentProvider");
  }
  return context;
}

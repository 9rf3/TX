/**
 * Utility types and constants for the Tournaments feature.
 * No mock data — all data comes from Supabase backend.
 */

export type TournamentStatus = "LIVE" | "UPCOMING" | "COMPLETED";
export type Difficulty = "Easy" | "Medium" | "Hard" | "Elite";
export type TournamentResult = "Won" | "Lost";

export const DIFFICULTY_CONFIG: Record<Difficulty, { color: string; cssColor: string }> = {
  Easy: { color: "text-accent-green", cssColor: "#10b981" },
  Medium: { color: "text-secondary", cssColor: "#06b6d4" },
  Hard: { color: "text-accent-orange", cssColor: "#f59e0b" },
  Elite: { color: "text-accent-red", cssColor: "#ef4444" },
};

"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { PvPMatch, PvPCategory } from "@/lib/types";

export async function getActiveMatches() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("pvp_matches")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data as PvPMatch[];
}

export async function getUserMatches() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("pvp_matches")
    .select("*")
    .or(`player_1_id.eq.${user.id},player_2_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data as PvPMatch[];
}

export async function createMatch(category: PvPCategory) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("pvp_matches")
    .insert({
      player_1_id: user.id,
      category,
      status: "waiting",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PvPMatch;
}

export async function joinMatch(matchId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("pvp_matches")
    .update({
      player_2_id: user.id,
      status: "active",
      started_at: new Date().toISOString(),
      current_state_hash: crypto.randomUUID(),
    })
    .eq("id", matchId)
    .eq("status", "waiting")
    .is("player_2_id", null)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PvPMatch;
}

export async function getMatchStatus(matchId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("pvp_matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (error) throw new Error(error.message);
  return data as PvPMatch;
}

export async function findAvailableMatches(category?: PvPCategory) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("pvp_matches")
    .select("*")
    .eq("status", "waiting")
    .is("player_2_id", null)
    .order("created_at", { ascending: true })
    .limit(10);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as PvPMatch[];
}

export async function getPvPStats() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { total: 0, wins: 0, losses: 0, winRate: 0 };

  const { data: matches, error } = await supabase
    .from("pvp_matches")
    .select("*")
    .or(`player_1_id.eq.${user.id},player_2_id.eq.${user.id}`)
    .eq("status", "completed");

  if (error) throw new Error(error.message);

  const total = matches?.length ?? 0;
  const wins = matches?.filter((m) => m.winner_id === user.id).length ?? 0;
  const losses = total - wins;

  return {
    total,
    wins,
    losses,
    winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
  };
}

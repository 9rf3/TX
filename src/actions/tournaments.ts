"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { Tournament, TournamentQuestion } from "@/lib/types";

export async function getTournaments() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .order("start_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Tournament[];
}

export async function getActiveTournaments() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .in("status", ["registration_open", "live"])
    .order("start_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Tournament[];
}

export async function getUpcomingTournaments() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("status", "upcoming")
    .order("start_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Tournament[];
}

export async function getCompletedTournaments() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("status", "completed")
    .order("end_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Tournament[];
}

export async function getTournamentById(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Tournament;
}

export async function getUserRegistration(tournamentId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("tournament_registrations")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function registerForTournament(tournamentId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("register_for_tournament_safe", {
    p_user_id: user.id,
    p_tournament_id: tournamentId,
  });

  if (error) throw new Error(error.message);
  return data as { success: boolean; error?: string; registration_id?: string; participant_count?: number };
}

export async function cancelRegistration(tournamentId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("cancel_tournament_registration_safe", {
    p_user_id: user.id,
    p_tournament_id: tournamentId,
  });

  if (error) throw new Error(error.message);
  return data as { success: boolean; error?: string };
}

export async function getTournamentLeaderboard(tournamentId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.rpc("get_tournament_leaderboard", {
    p_tournament_id: tournamentId,
    p_limit: 50,
  });

  if (error) throw new Error(error.message);
  return data as { rank: number; user_id: string; username: string; full_name: string; avatar_url: string; score: number; registered_at: string }[];
}

export async function getTournamentQuestions(tournamentId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("tournament_questions")
    .select("id, tournament_id, type, data, points, order_index")
    .eq("tournament_id", tournamentId)
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);
  return data as TournamentQuestion[];
}

export async function getRegistrationCount(tournamentId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { count, error } = await supabase
    .from("tournament_registrations")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", tournamentId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

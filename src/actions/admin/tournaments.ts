"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { TournamentStatus, TournamentType, QuestionType } from "@/lib/types";

export async function createTournament(data: {
  title: string;
  type: TournamentType;
  description?: string;
  max_participants?: number;
  registration_open_at?: string;
  registration_close_at?: string;
  start_at: string;
  end_at: string;
  rewards_config?: Record<string, unknown>;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Admin only");

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .insert({
      title: data.title,
      type: data.type,
      status: "upcoming",
      description: data.description ?? null,
      max_participants: data.max_participants ?? 0,
      registration_open_at: data.registration_open_at ?? null,
      registration_close_at: data.registration_close_at ?? null,
      start_at: data.start_at,
      end_at: data.end_at,
      rewards_config: data.rewards_config ?? {},
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return tournament;
}

export async function updateTournament(
  id: string,
  data: Partial<{
    title: string;
    type: TournamentType;
    status: TournamentStatus;
    description: string;
    max_participants: number;
    registration_open_at: string;
    registration_close_at: string;
    start_at: string;
    end_at: string;
    rewards_config: Record<string, unknown>;
  }>,
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Admin only");

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return tournament;
}

export async function deleteTournament(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Admin only");

  const { error } = await supabase.from("tournaments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function addQuestion(data: {
  tournament_id: string;
  type: QuestionType;
  data: Record<string, unknown>;
  evaluation_vector: Record<string, unknown>;
  points?: number;
  order_index?: number;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: question, error } = await supabase
    .from("tournament_questions")
    .insert({
      tournament_id: data.tournament_id,
      type: data.type,
      data: data.data,
      evaluation_vector: data.evaluation_vector,
      points: data.points ?? 100,
      order_index: data.order_index ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return question;
}

export async function updateQuestion(
  id: string,
  data: Partial<{
    type: QuestionType;
    data: Record<string, unknown>;
    evaluation_vector: Record<string, unknown>;
    points: number;
    order_index: number;
  }>,
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: question, error } = await supabase
    .from("tournament_questions")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return question;
}

export async function deleteQuestion(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("tournament_questions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getRegistrations(tournamentId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("tournament_registrations")
    .select("*, profiles:user_id(username, full_name, avatar_url)")
    .eq("tournament_id", tournamentId)
    .order("registered_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function updateTournamentStatus(id: string, status: TournamentStatus) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return tournament;
}

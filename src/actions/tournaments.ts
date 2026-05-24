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

/* ==================================================================== */
/*  ENTER TOURNAMENT — starts the gameplay session                       */
/* ==================================================================== */

export async function enterTournament(tournamentId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Verify tournament is live
  const { data: tournament, error: tError } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", tournamentId)
    .single();

  if (tError || !tournament) throw new Error("Tournament not found");
  if (tournament.status !== "live") throw new Error("Tournament is not live");

  // Verify or confirm registration
  const { data: reg, error: rError } = await supabase
    .from("tournament_registrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("tournament_id", tournamentId)
    .single();

  if (rError || !reg) throw new Error("Not registered for this tournament");

  // Confirm the registration if not already
  if (reg.status !== "confirmed") {
    await supabase
      .from("tournament_registrations")
      .update({ status: "confirmed", metadata: { entered_at: new Date().toISOString() } })
      .eq("id", reg.id);
  }

  // Fetch questions (no evaluation_vector — server-side only)
  const { data: questions, error: qError } = await supabase
    .from("tournament_questions")
    .select("id, tournament_id, type, data, points, order_index")
    .eq("tournament_id", tournamentId)
    .order("order_index", { ascending: true });

  if (qError) throw new Error(qError.message);

  return {
    tournament,
    registration: reg,
    questions: questions as TournamentQuestion[],
  };
}

/* ==================================================================== */
/*  SUBMIT TOURNAMENT ANSWER — evaluates and scores                      */
/* ==================================================================== */

export async function submitTournamentAnswer(
  tournamentId: string,
  questionId: string,
  answer: string | string[] | Record<string, unknown>,
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const answerJson = typeof answer === "string" ? answer : JSON.stringify(answer);

  // First try the SQL RPC (handles multiple_choice natively)
  const { data: rpcResult, error: rpcError } = await supabase.rpc("submit_tournament_answer_safe", {
    p_user_id: user.id,
    p_tournament_id: tournamentId,
    p_question_id: questionId,
    p_answer: answerJson,
  });

  if (rpcError) {
    // Fallback: app-level evaluation
    return handleFallbackEvaluation(supabase, user.id, tournamentId, questionId, answerJson);
  }

  const result = rpcResult as {
    success: boolean;
    correct?: boolean;
    points?: number;
    base_points?: number;
    time_bonus?: number;
    error?: string;
  };

  // If the RPC returned success but correct=false for non-MC types
  // (the SQL evaluators are stubs), do app-level re-evaluation
  if (result.success && result.correct === false && result.points === 0) {
    return handleFallbackEvaluation(supabase, user.id, tournamentId, questionId, answerJson);
  }

  return {
    success: result.success ?? false,
    correct: result.correct ?? false,
    points: result.points ?? 0,
    basePoints: result.base_points ?? 0,
    timeBonus: result.time_bonus ?? 0,
  };
}

async function handleFallbackEvaluation(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  tournamentId: string,
  questionId: string,
  answerJson: string,
) {
  // Fetch question with evaluation_vector (server-side only)
  const { data: question, error: qError } = await supabase
    .from("tournament_questions")
    .select("*")
    .eq("id", questionId)
    .eq("tournament_id", tournamentId)
    .single();

  if (qError || !question) throw new Error("Question not found");

  let correct = false;

  if (question.type === "multiple_choice") {
    const correctAnswer = question.evaluation_vector?.correct_answer;
    correct = answerJson === correctAnswer;
  } else if (question.type === "coding_challenge") {
    const testCases = question.evaluation_vector?.test_cases as { input: string; expected: string }[] | undefined;
    if (testCases && testCases.length > 0) {
      // Simple check: does the answer contain the expected output pattern?
      const allPass = testCases.every((tc) => {
        const answerLower = answerJson.toLowerCase();
        return answerLower.includes(tc.expected.toLowerCase()) || answerLower.includes(tc.input.toLowerCase());
      });
      correct = allPass;
    } else {
      // Check if answer is non-empty
      correct = answerJson.length > 10;
    }
  } else if (question.type === "written") {
    const keywords = question.evaluation_vector?.keywords as string[] | undefined;
    if (keywords && keywords.length > 0) {
      const answerLower = answerJson.toLowerCase();
      const matchCount = keywords.filter((kw) => answerLower.includes(kw.toLowerCase())).length;
      correct = matchCount >= Math.ceil(keywords.length * 0.5);
    } else {
      correct = answerJson.length > 20;
    }
  }

  const points = correct ? (question.points ?? 100) : 0;

  // Update registration score directly
  if (correct && points > 0) {
    await supabase.rpc("award_xp_safe", {
      p_user_id: userId,
      p_amount: Math.floor(points * 0.1),
      p_reason: "tournament_question",
      p_metadata: { tournament_id: tournamentId, question_id: questionId },
    });

    const { data: reg } = await supabase
      .from("tournament_registrations")
      .select("*")
      .eq("user_id", userId)
      .eq("tournament_id", tournamentId)
      .single();

    if (reg) {
      await supabase
        .from("tournament_registrations")
        .update({ score: (reg.score ?? 0) + points })
        .eq("id", reg.id);
    }
  }

  return {
    success: true,
    correct,
    points,
    basePoints: question.points ?? 100,
    timeBonus: 0,
  };
}

/* ==================================================================== */
/*  FINISH TOURNAMENT — awards final rewards based on rank                */
/* ==================================================================== */

export async function finishTournament(tournamentId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get final leaderboard position
  const { data: leaderboard, error: lbError } = await supabase.rpc("get_tournament_leaderboard", {
    p_tournament_id: tournamentId,
    p_limit: 100,
  });

  if (lbError) throw new Error(lbError.message);

  const entry = (leaderboard as { rank: number; user_id: string; score: number }[]).find(
    (e) => e.user_id === user.id,
  );

  if (!entry) throw new Error("No registration found");

  const rank = entry.rank;
  const score = entry.score;

  // Get tournament for reward config
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", tournamentId)
    .single();

  const rewardConfig = tournament?.rewards_config ?? {};
  const distribution = (rewardConfig.distribution as { rank: number; xp: number; coins: number }[]) ?? [];

  // Find matching reward tier
  let xpReward = Math.max(10, Math.floor(score * 0.5));
  let coinReward = Math.max(5, Math.floor(score * 0.2));

  for (const tier of distribution) {
    if (rank <= tier.rank) {
      xpReward = tier.xp;
      coinReward = tier.coins;
      break;
    }
  }

  // Award XP
  let leveledUp = false;
  try {
    const { data: xpResult } = await supabase.rpc("award_xp_safe", {
      p_user_id: user.id,
      p_amount: xpReward,
      p_reason: "tournament_completed",
      p_metadata: { tournament_id: tournamentId, rank, score },
    });
    leveledUp = (xpResult as { leveled_up?: boolean })?.leveled_up ?? false;
  } catch { /* non-critical */ }

  // Award coins
  try {
    await supabase.rpc("award_coins_safe", {
      p_user_id: user.id,
      p_amount: coinReward,
      p_reason: "tournament_reward",
      p_metadata: { tournament_id: tournamentId, rank },
    });
  } catch { /* non-critical */ }

  // Update profile stats (tournaments_won if rank 1)
  if (rank === 1) {
    await supabase
      .from("profiles")
      .update({ tournaments_won: (await supabase.from("profiles").select("tournaments_won").eq("id", user.id).single()).data?.tournaments_won + 1 })
      .eq("id", user.id);
  }

  // Update registration rank
  await supabase
    .from("tournament_registrations")
    .update({ rank })
    .eq("user_id", user.id)
    .eq("tournament_id", tournamentId);

  return {
    rank,
    score,
    xpReward,
    coinReward,
    leveledUp,
  };
}

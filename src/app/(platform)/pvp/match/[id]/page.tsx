"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  Swords, Clock, Check, X, Loader2, Zap, Coins,
  Trophy, ArrowLeft, AlertTriangle, ChevronRight, Users,
  Target, Timer,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { getMatchState, submitPvPAnswer, finishMatch, forceFinishMatch, getPvPQuestions } from "@/actions/pvp";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { MatchStateResult } from "@/actions/pvp";

interface PvPQuestion {
  id: string;
  type: "multiple_choice" | "coding_challenge" | "written";
  data: {
    question: string;
    options?: string[];
    code?: string;
  };
  points: number;
  correctAnswer: string;
}

interface AnswerRec {
  answer: string;
  correct: boolean;
  points: number;
}

type PagePhase =
  | "loading"
  | "not_found"
  | "waiting_opponent"
  | "playing"
  | "player_finished"
  | "waiting_opponent_finish"
  | "completed"
  | "cancelled";

interface ResultData {
  winnerId: string | null;
  isWinner: boolean;
  p1Score: number;
  p2Score: number;
  p1Xp: number;
  p2Xp: number;
  p1Coins: number;
  p2Coins: number;
  p1Accuracy: number | null;
  p2Accuracy: number | null;
  p1Finished: boolean;
  p2Finished: boolean;
  totalQuestions: number;
}

const MATCH_DURATION = 180;
const POLL_INTERVAL = 2000;
const MOTIVATIONAL_MESSAGES = [
  "You're crushing it!",
  "Opponent is still thinking...",
  "Almost there...",
  "Stay sharp!",
  "Great performance so far!",
  "The wait is worth it!",
  "Victory is loading...",
];

export default function PvPMatchPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const matchId = params.id as string;

  const [phase, setPhase] = useState<PagePhase>("loading");
  const [questions, setQuestions] = useState<PvPQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, AnswerRec>>({});
  const [score, setScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [isPlayer1, setIsPlayer1] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [matchTimer, setMatchTimer] = useState(MATCH_DURATION);
  const [matchCategory, setMatchCategory] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [motivationIndex, setMotivationIndex] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishRef = useRef(false);
  const mountedRef = useRef(true);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const forceFinishAttempted = useRef(false);

  const totalQ = questions.length || totalQuestions;
  const currentQuestion = questions[currentIndex];
  const answeredCurrent = currentQuestion ? answers[currentQuestion.id] !== undefined : false;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;
  const totalAnswered = Object.keys(answers).length;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const timerExpired = matchTimer <= 0;
  const allAnswered = totalQ > 0 && currentIndex >= totalQ;

  const motivationalText = MOTIVATIONAL_MESSAGES[motivationIndex % MOTIVATIONAL_MESSAGES.length];

  // Rotate motivation messages
  useEffect(() => {
    if (phase !== "waiting_opponent_finish" && phase !== "player_finished") return;
    const iv = setInterval(() => setMotivationIndex((i) => i + 1), 4000);
    return () => clearInterval(iv);
  }, [phase]);

  // ---------- Realtime subscription ----------
  const subscribeToMatch = useCallback((state: MatchStateResult) => {
    const supabase = createClient();
    supabaseRef.current = supabase;
    const channel = supabase
      .channel(`pvp-match-${matchId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "pvp_matches",
        filter: `id=eq.${matchId}`,
      }, (payload) => {
        if (!mountedRef.current) return;
        const newStatus = (payload.new as Record<string, unknown>).status as string;
        const newP1Finished = (payload.new as Record<string, unknown>).player_1_finished as boolean;
        const newP2Finished = (payload.new as Record<string, unknown>).player_2_finished as boolean;
        const newP2Id = (payload.new as Record<string, unknown>).player_2_id as string | null;

        // Handle waiting → active transition (opponent joined)
        if (state.status === "waiting" && newStatus === "active" && newP2Id) {
          loadMatchData();
          return;
        }

        // Handle completion (both finished or force-finished)
        if (newStatus === "completed") {
          loadMatchResults();
          return;
        }

        // Handle opponent finishing
        const selfFinished = isPlayer1 ? newP1Finished : newP2Finished;
        const oppFinished = isPlayer1 ? newP2Finished : newP1Finished;
        if (selfFinished && oppFinished) {
          loadMatchResults();
          return;
        }
      })
      .subscribe();
    channelRef.current = channel;
  }, [matchId, isPlayer1]);

  // ---------- Load match data ----------
  const loadMatchData = useCallback(async () => {
    if (!matchId || !user || !mountedRef.current) return;
    try {
      const state = await getMatchState(matchId);
      if (!mountedRef.current) return;

      if (state.status === "cancelled") {
        setPhase("cancelled");
        setErrorMsg("Match was cancelled");
        return;
      }

      if (state.status === "completed") {
        await loadMatchResults();
        return;
      }

      setIsPlayer1(state.player1Id === user.id);
      setMatchCategory(state.category);
      setTotalQuestions(state.totalQuestions);

      // Check if this player already finished
      const selfFinished = state.player1Id === user.id ? state.p1Finished : state.p2Finished;
      const oppFinished = state.player1Id === user.id ? state.p2Finished : state.p1Finished;

      if (selfFinished) {
        // Player already finished — check if match is done
        if (oppFinished) {
          await loadMatchResults();
          return;
        }
        // Player already finished, waiting for opponent
        setPhase("waiting_opponent_finish");
        setScore(state.player1Id === user.id ? state.p1Score : state.p2Score);
        setOpponentScore(state.player1Id === user.id ? state.p2Score : state.p1Score);
        const qs = await getPvPQuestions(matchId).catch(() => []);
        if (mountedRef.current) setQuestions(qs);
        startPolling();
        subscribeToMatch(state);
        return;
      }

      if (state.status === "waiting" && !state.player2Id) {
        setPhase("waiting_opponent");
        startPolling();
        subscribeToMatch(state);
        return;
      }

      // Active match — load questions and start playing
      setScore(state.player1Id === user.id ? state.p1Score : state.p2Score);
      setOpponentScore(state.player1Id === user.id ? state.p2Score : state.p1Score);

      const qs = await getPvPQuestions(matchId) as PvPQuestion[];
      if (mountedRef.current) {
        setQuestions(qs);
        setTotalQuestions(qs.length);
        setPhase("playing");
        startTimer();
        startScorePoll();
        subscribeToMatch(state);
      }
    } catch (e) {
      if (!mountedRef.current) return;
      setPhase("not_found");
      setErrorMsg(e instanceof Error ? e.message : "Match not found");
    }
  }, [matchId, user]);

  // ---------- Load match results ----------
  const loadMatchResults = useCallback(async () => {
    if (!matchId || !user || !mountedRef.current) return;
    try {
      const state = await getMatchState(matchId);
      if (!mountedRef.current) return;

      const isP1 = state.player1Id === user.id;
      setResultData({
        winnerId: state.winnerId,
        isWinner: state.winnerId === user.id,
        p1Score: state.p1Score,
        p2Score: state.p2Score,
        p1Xp: state.p1Xp,
        p2Xp: state.p2Xp,
        p1Coins: state.p1Coins,
        p2Coins: state.p2Coins,
        p1Accuracy: state.p1Accuracy,
        p2Accuracy: state.p2Accuracy,
        p1Finished: state.p1Finished,
        p2Finished: state.p2Finished,
        totalQuestions: state.totalQuestions,
      });
      setScore(isP1 ? state.p1Score : state.p2Score);
      setOpponentScore(isP1 ? state.p2Score : state.p1Score);
      setPhase("completed");
      cleanup();
    } catch {
      if (mountedRef.current) {
        setPhase("cancelled");
        setErrorMsg("Failed to load results");
      }
    }
  }, [matchId, user]);

  // ---------- Effect: load match on mount ----------
  useEffect(() => {
    mountedRef.current = true;
    loadMatchData();
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [matchId, user]);

  // ---------- Timer ----------
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setMatchTimer((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
  }, []);

  // ---------- Score polling ----------
  const startScorePoll = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      if (!matchId || !mountedRef.current) return;
      try {
        const state = await getMatchState(matchId);
        if (!mountedRef.current) return;
        if (state.status === "completed") {
          loadMatchResults();
          return;
        }
        setOpponentScore(isPlayer1 ? state.p2Score : state.p1Score);
      } catch { /* ignore */ }
    }, POLL_INTERVAL);
  }, [matchId, isPlayer1]);

  // ---------- Polling for opponent join / completion ----------
  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      if (!matchId || !mountedRef.current) return;
      try {
        const state = await getMatchState(matchId);
        if (!mountedRef.current) return;

        if (state.status === "completed") {
          loadMatchResults();
          return;
        }

        // Waiting → active transition
        if (state.status === "active" && state.player2Id) {
          loadMatchData();
          return;
        }
      } catch { /* ignore */ }
    }, POLL_INTERVAL);
  }, [matchId]);

  // ---------- Cleanup ----------
  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (channelRef.current && supabaseRef.current) {
      supabaseRef.current.removeChannel(channelRef.current);
      channelRef.current = null;
      supabaseRef.current = null;
    }
  }, []);

  // ---------- Auto-finish on timer expiry or all questions answered ----------
  useEffect(() => {
    if (phase !== "playing" || finishRef.current) return;

    if (timerExpired) {
      handleFinish();
    } else if (allAnswered) {
      handleFinish();
    }
  }, [timerExpired, allAnswered, phase]);

  // ---------- Force finish check: if opponent never finishes after timer expires ----------
  useEffect(() => {
    if (phase !== "waiting_opponent_finish" || forceFinishAttempted.current) return;
    if (!timerExpired) return;

    forceFinishAttempted.current = true;
    (async () => {
      try {
        await forceFinishMatch(matchId);
        await loadMatchResults();
      } catch {
        if (mountedRef.current) {
          setPhase("cancelled");
          setErrorMsg("Opponent did not finish in time");
        }
      }
    })();
  }, [phase, timerExpired, matchId]);

  // ---------- Submit answer ----------
  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion || !matchId || submitting || finishRef.current) return;
    const answer = currentQuestion.type === "written" ? writtenAnswer : selectedAnswer;
    if (!answer) return;

    setSubmitting(true);
    try {
      const res = await submitPvPAnswer(matchId, currentQuestion.id, answer);
      if (!mountedRef.current) return;

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: { answer, correct: res.correct, points: res.points },
      }));
      setScore(res.totalScore);
      setSelectedAnswer("");
      setWrittenAnswer("");
    } catch (e) {
      console.error("Submit failed:", e);
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }, [currentQuestion, matchId, submitting, selectedAnswer, writtenAnswer]);

  // ---------- Finish match ----------
  const handleFinish = useCallback(async () => {
    if (finishRef.current || !matchId) return;
    finishRef.current = true;
    cleanup();

    try {
      const accuracyVal = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
      const res = await finishMatch(matchId, accuracyVal, totalAnswered);

      if (!mountedRef.current) return;

      if (res.action === "completed") {
        // Both finished — match is over
        await loadMatchResults();
      } else {
        // Player finished, waiting for opponent
        setPhase("waiting_opponent_finish");
        startScorePoll();
        subscribeToMatch(await getMatchState(matchId));
      }
    } catch (e) {
      if (!mountedRef.current) return;
      setErrorMsg(e instanceof Error ? e.message : "Failed to finish match");
      setPhase("cancelled");
    }
  }, [matchId, correctCount, totalAnswered]);

  // ---------- Navigation ----------
  const handleNext = useCallback(() => {
    if (finishRef.current) return;
    setCurrentIndex((i) => (i >= totalQ - 1 ? i : i + 1));
  }, [totalQ]);

  const handleSkip = useCallback(() => {
    if (!currentQuestion || finishRef.current) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { answer: "", correct: false, points: 0 },
    }));
    setCurrentIndex((i) => (i >= totalQ - 1 ? i : i + 1));
  }, [currentQuestion, totalQ]);

  const minutes = Math.floor(matchTimer / 60);
  const seconds = matchTimer % 60;

  // ====================================================================
  // RENDER — Phase-based
  // ====================================================================

  // LOADING
  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070b16]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-light animate-spin mx-auto mb-4" />
          <p className="text-white font-bold text-lg">Loading match...</p>
        </div>
      </div>
    );
  }

  // NOT FOUND
  if (phase === "not_found") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070b16] p-4">
        <div className="bg-[#0e1220] border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Match Not Found</h3>
          <p className="text-muted-light text-sm mb-6">{errorMsg || "This match doesn't exist"}</p>
          <Button variant="primary" onClick={() => router.push("/pvp")}>
            <ArrowLeft className="w-4 h-4" /> Back to Arena
          </Button>
        </div>
      </div>
    );
  }

  // WAITING FOR OPPONENT (match found, waiting for opponent to join)
  if (phase === "waiting_opponent") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070b16] p-4">
        <div className="bg-[#0e1220] border border-white/10 rounded-2xl p-8 max-w-sm text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.3) 0%, transparent 60%)" }}
          />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-blue-600/30 flex items-center justify-center mx-auto mb-4 border-2 border-primary/30 animate-pulse">
              <Swords className="w-10 h-10 text-primary-light" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Waiting for Opponent</h3>
            <p className="text-muted-light text-sm mb-4 capitalize">{matchCategory} · Duel</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary-light animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary-light animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-primary-light animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <Button variant="ghost" className="w-full" onClick={() => router.push("/pvp")}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // CANCELLED
  if (phase === "cancelled") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070b16] p-4">
        <div className="bg-[#0e1220] border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Match Ended</h3>
          <p className="text-muted-light mb-6">{errorMsg || "Could not complete the match"}</p>
          <Button variant="primary" onClick={() => router.push("/pvp")}>
            <ArrowLeft className="w-4 h-4" /> Back to Arena
          </Button>
        </div>
      </div>
    );
  }

  // COMPLETED — Results
  if (phase === "completed" && resultData) {
    const isWinner = resultData.isWinner;
    const myScore = isPlayer1 ? resultData.p1Score : resultData.p2Score;
    const oppScore = isPlayer1 ? resultData.p2Score : resultData.p1Score;
    const myXp = isPlayer1 ? resultData.p1Xp : resultData.p2Xp;
    const myCoins = isPlayer1 ? resultData.p1Coins : resultData.p2Coins;
    const myAccuracy = isPlayer1 ? resultData.p1Accuracy : resultData.p2Accuracy;
    const oppAccuracy = isPlayer1 ? resultData.p2Accuracy : resultData.p1Accuracy;

    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <div className="bg-[#0e1220] border border-white/10 rounded-2xl overflow-hidden">
            <div className={cn(
              "h-2 w-full",
              isWinner
                ? "bg-gradient-to-r from-amber-400 via-yellow-500 to-accent-orange"
                : "bg-gradient-to-r from-muted to-white/10",
            )} />
            <div className="p-8 text-center">
              {/* Winner/Loser icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, duration: 0.5 }}
              >
                {isWinner ? (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/30 to-accent-orange/30 flex items-center justify-center mx-auto mb-4 border-2 border-amber-400/30">
                    <Trophy className="w-10 h-10 text-amber-400" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border-2 border-white/10">
                    <Swords className="w-10 h-10 text-muted-light" />
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-3xl font-black text-white mb-1">
                  {isWinner ? "Victory!" : "Defeat"}
                </h2>
                <p className="text-muted-light text-sm mb-2 capitalize">{matchCategory} Duel</p>
              </motion.div>

              {/* Score comparison */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-6 mb-6 mt-4"
              >
                <div className="text-center">
                  <p className="text-4xl font-black text-white">{myScore}</p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider">You</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-xs font-bold text-muted uppercase tracking-widest mb-1">vs</div>
                  <div className={cn(
                    "text-xs font-bold px-3 py-0.5 rounded-full",
                    isWinner ? "bg-accent-green/10 text-accent-green" : "bg-red-500/10 text-red-400",
                  )}>
                    {isWinner ? "WIN" : "LOSS"}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-black text-white">{oppScore}</p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider">Opponent</p>
                </div>
              </motion.div>

              {/* Stats grid */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 gap-4 mb-6"
              >
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <Zap className="w-5 h-5 text-accent-orange mx-auto mb-1" />
                  <p className="text-xl font-black text-white">+{myXp}</p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider">XP Earned</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-white">+{myCoins}</p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider">TX Coins</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <Target className="w-5 h-5 text-primary-light mx-auto mb-1" />
                  <p className="text-xl font-black text-white">{myAccuracy ?? 0}%</p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider">Accuracy</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <Timer className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-white">{totalAnswered}/{resultData.totalQuestions}</p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider">Answered</p>
                </div>
              </motion.div>

              {/* Answer detail */}
              {Object.keys(answers).length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2 mb-6"
                >
                  <p className="text-xs text-muted-light uppercase tracking-wider mb-3">Your Answers</p>
                  {Object.entries(answers).map(([qId, ans], i) => (
                    <div key={qId} className={cn(
                      "flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm",
                      ans.correct
                        ? "bg-accent-green/10 border-accent-green/20 text-accent-green"
                        : "bg-red-500/10 border-red-500/20 text-red-400",
                    )}>
                      <span>Q{i + 1}</span>
                      <span className="flex items-center gap-1">
                        {ans.correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        {ans.points} pts
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Button variant="primary" className="w-full" glow onClick={() => router.push("/pvp")}>
                  <Swords className="w-4 h-4" /> Back to Arena
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // WAITING FOR OPPONENT FINISH — Player finished, opponent still playing
  if (phase === "waiting_opponent_finish" || phase === "player_finished") {
    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="relative rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: "linear-gradient(145deg, #0c1230 0%, #0f0f2e 50%, #0d1435 100%)" }}
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.2) 0%, transparent 60%)" }}
            />
            <div className="relative z-10 p-8 text-center">
              {/* Animated icon */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-blue-600/30 flex items-center justify-center mx-auto mb-4 border-2 border-primary/30">
                <motion.div
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  <Users className="w-10 h-10 text-primary-light" />
                </motion.div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Waiting for Opponent</h3>
              <p className="text-muted-light text-sm mb-1 capitalize">{matchCategory} · {matchCategory}</p>

              {/* Animated dots */}
              <div className="flex items-center justify-center gap-2 my-6">
                <motion.div
                  className="w-2.5 h-2.5 rounded-full bg-primary-light"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                />
                <motion.div
                  className="w-2.5 h-2.5 rounded-full bg-primary-light"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }}
                />
                <motion.div
                  className="w-2.5 h-2.5 rounded-full bg-primary-light"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }}
                />
              </div>

              {/* Motivational text */}
              <motion.p
                key={motivationIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-sm text-muted-light italic mb-6"
              >
                {motivationalText}
              </motion.p>

              {/* Timer display */}
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold tabular-nums mb-6",
                matchTimer < 30 ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white",
              )}>
                <Clock className="w-4 h-4" />
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>

              {/* Score preview */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-6">
                <p className="text-xs text-muted-light uppercase tracking-wider mb-3">Your Performance</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-lg font-black text-white">{score}</p>
                    <p className="text-[10px] text-muted-light">Score</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-white">{accuracy}%</p>
                    <p className="text-[10px] text-muted-light">Accuracy</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-white">{totalAnswered}/{totalQ}</p>
                    <p className="text-[10px] text-muted-light">Done</p>
                  </div>
                </div>
              </div>

              {/* XP/Coins preview */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                  <div className="flex items-center justify-center gap-1.5">
                    <Zap className="w-4 h-4 text-accent-orange" />
                    <span className="text-sm font-bold text-white">
                      +{correctCount >= totalQ * 0.6 ? 50 : 15}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-light">Est. XP</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                  <div className="flex items-center justify-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-white">
                      +{correctCount >= totalQ * 0.6 ? 25 : 5}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-light">Est. Coins</p>
                </div>
              </div>

              {matchTimer <= 0 && (
                <p className="text-xs text-red-400 mb-4">Timer expired. Finalizing match...</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // PLAYING — no current question (should not happen)
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070b16]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-light animate-spin mx-auto mb-4" />
          <p className="text-white font-bold text-lg">Loading challenge...</p>
        </div>
      </div>
    );
  }

  const progress = totalQ > 0 ? (currentIndex / totalQ) * 100 : 0;
  const qData = currentQuestion.data;
  const questionOptions = qData.options;

  // PLAYING — Active game
  return (
    <div className="min-h-screen bg-[#070b16] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/10 bg-[#0e1220]">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/pvp")} className="p-2 rounded-lg hover:bg-white/5 text-muted-light hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-primary-light" />
              <h2 className="text-sm font-bold text-white capitalize">{matchCategory} Duel</h2>
            </div>
            <p className="text-[10px] text-muted-light">Question {currentIndex + 1} of {totalQ}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-white tabular-nums">{score}</p>
              <p className="text-[9px] text-muted-light uppercase">You</p>
            </div>
            <div className="text-xs font-bold text-muted">:</div>
            <div className="text-right">
              <p className="text-xs font-bold text-white tabular-nums">{opponentScore}</p>
              <p className="text-[9px] text-muted-light uppercase">Opp</p>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold tabular-nums",
            matchTimer < 30 ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/5 text-white border border-white/10",
          )}>
            <Clock className="w-4 h-4" />
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-white/5">
        <div className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-500"
          style={{ width: `${progress + (answeredCurrent ? 100 / totalQ : 0)}%` }} />
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="primary" size="sm">{currentQuestion.type.replace("_", " ").toUpperCase()}</Badge>
                <span className="text-xs text-muted-light">{currentQuestion.points} pts</span>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">{String(qData.question)}</h3>

              {qData.code && (
                <pre className="bg-black/60 border border-white/10 rounded-xl p-4 mb-6 text-sm font-mono text-green-400 overflow-x-auto">
                  <code>{String(qData.code)}</code>
                </pre>
              )}

              {currentQuestion.type === "multiple_choice" && questionOptions && (
                <div className="space-y-2 mt-6">
                  {questionOptions.map((opt, i) => {
                    const isSelected = selectedAnswer === opt;
                    const showCorrect = answeredCurrent && currentQuestion.correctAnswer === opt;
                    const showWrong = answeredCurrent && isSelected && !showCorrect;
                    return (
                      <button key={i}
                        onClick={() => !answeredCurrent && setSelectedAnswer(opt)}
                        disabled={answeredCurrent}
                        className={cn(
                          "w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3",
                          answeredCurrent
                            ? showCorrect ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                              : showWrong ? "border-red-500/40 bg-red-500/10 text-red-400"
                              : "border-white/5 bg-white/[0.02] text-muted-light"
                            : isSelected ? "border-primary/50 bg-primary/15 text-white"
                            : "border-white/10 bg-white/[0.03] text-muted-light hover:border-white/20 hover:bg-white/[0.05] hover:text-white",
                        )}
                      >
                        <span className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                          answeredCurrent && showCorrect ? "bg-accent-green/20 text-accent-green" :
                          answeredCurrent && showWrong ? "bg-red-500/20 text-red-400" :
                          isSelected ? "bg-primary/20 text-primary-light" : "bg-white/5 text-muted",
                        )}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm font-medium">{opt}</span>
                        {answeredCurrent && showCorrect && <Check className="w-4 h-4 ml-auto shrink-0" />}
                        {answeredCurrent && showWrong && <X className="w-4 h-4 ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === "written" && (
                <div className="mt-6">
                  <textarea value={answeredCurrent ? (answers[currentQuestion.id]?.answer ?? "") : writtenAnswer}
                    onChange={(e) => !answeredCurrent && setWrittenAnswer(e.target.value)}
                    disabled={answeredCurrent}
                    placeholder="Type your answer..."
                    className="w-full h-40 rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>
              )}

              {currentQuestion.type === "coding_challenge" && (
                <div className="mt-6">
                  <textarea value={answeredCurrent ? (answers[currentQuestion.id]?.answer ?? "") : selectedAnswer}
                    onChange={(e) => !answeredCurrent && setSelectedAnswer(e.target.value)}
                    disabled={answeredCurrent}
                    placeholder="Write your solution..."
                    className="w-full h-48 rounded-xl bg-black/80 border border-white/10 px-4 py-3 text-sm font-mono text-green-400 placeholder:text-muted focus:outline-none focus:border-primary/50 resize-none"
                    spellCheck={false}
                  />
                </div>
              )}

              {answeredCurrent && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "mt-4 px-4 py-3 rounded-xl border flex items-center gap-2 text-sm font-medium",
                    answers[currentQuestion.id]?.correct
                      ? "bg-accent-green/10 border-accent-green/20 text-accent-green"
                      : "bg-red-500/10 border-red-500/20 text-red-400",
                  )}
                >
                  {answers[currentQuestion.id]?.correct ? (
                    <><Check className="w-4 h-4" /> Correct! +{answers[currentQuestion.id]?.points} pts</>
                  ) : (
                    <><X className="w-4 h-4" /> Incorrect</>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-[#0e1220] px-4 md:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-light">
            <span>Score: {score}</span>
            <span>Correct: {correctCount}/{totalAnswered}</span>
            <span className="hidden sm:inline">Accuracy: {accuracy}%</span>
          </div>
          <div className="flex items-center gap-2">
            {!answeredCurrent && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>Skip</Button>
            )}
            {!answeredCurrent ? (
              <Button variant="primary" size="sm" glow onClick={handleSubmitAnswer}
                disabled={submitting || finishRef.current ||
                  (currentQuestion.type === "multiple_choice" && !selectedAnswer) ||
                  (currentQuestion.type === "written" && !writtenAnswer) ||
                  (currentQuestion.type === "coding_challenge" && !selectedAnswer)
                }
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {submitting ? "Submitting..." : "Submit Answer"}
              </Button>
            ) : (
              <Button variant="primary" size="sm" glow onClick={handleNext}>
                {currentIndex >= totalQ - 1 ? (
                  <><Trophy className="w-4 h-4" /> Finish</>
                ) : (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

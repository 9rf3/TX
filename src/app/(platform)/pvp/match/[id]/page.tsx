"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  Swords, Clock, Check, X, Loader2, Zap, Coins,
  Trophy, ArrowLeft, AlertTriangle, ChevronRight, Users,
  Target, Timer, Crown, Shield, Star, Sparkles,
  Flame, Medal, Activity, Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getMatchState, submitPvPAnswer, finishMatch, forceFinishMatch, getPvPQuestions, getOpponentProfile } from "@/actions/pvp";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { MatchStateResult, OpponentProfile } from "@/actions/pvp";
import { useSound } from "@/lib/hooks/useSound";

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
  | "vs_intro"
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
const VS_INTRO_DURATION = 3200;

const RANK_COLORS: Record<string, string> = {
  Bronze: "#cd7f32", Silver: "#c0c0c0", Gold: "#ffd700",
  Platinum: "#e5e4e2", Diamond: "#b9f2ff", Elite: "#ff6b35",
};

const RANK_TIERS = [
  { min: 1, max: 10, name: "Bronze", icon: Shield },
  { min: 11, max: 25, name: "Silver", icon: Shield },
  { min: 26, max: 50, name: "Gold", icon: Medal },
  { min: 51, max: 75, name: "Platinum", icon: Star },
  { min: 76, max: 99, name: "Diamond", icon: Star },
  { min: 100, max: 999, name: "Elite", icon: Crown },
];

function getPlayerRank(level: number) {
  return RANK_TIERS.find((t) => level >= t.min && level <= t.max) ?? RANK_TIERS[0];
}

function Particles({ count = 20 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary-light/60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40],
            x: [0, (Math.random() - 0.5) * 20],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function VsParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, rgba(139,92,246,${0.4 + Math.random() * 0.6}), transparent)`,
            boxShadow: `0 0 6px rgba(139,92,246,${0.3 + Math.random() * 0.5})`,
          }}
          animate={{
            y: [0, -50 - Math.random() * 80, 0],
            x: [0, (Math.random() - 0.5) * 30, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 2 + Math.random() * 2, 0],
          }}
          transition={{
            duration: 2.5 + Math.random() * 2.5,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function SparkleParticles({ color = "rgba(139,92,246,0.8)" }: { color?: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${50 + (Math.random() - 0.5) * 60}%`,
            top: `${50 + (Math.random() - 0.5) * 60}%`,
          }}
          animate={{
            y: [0, -20 - Math.random() * 30],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 1.2 + Math.random(),
            repeat: Infinity,
            delay: i * 0.08,
            ease: "easeOut",
          }}
        >
          <Sparkles className="w-3 h-3" style={{ color }} />
        </motion.div>
      ))}
    </div>
  );
}

function XpFloatAnimation({ xp, coins }: { xp: number; coins: number }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.5, y: -40 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md rounded-2xl px-6 py-3 border border-accent-orange/30">
          <Zap className="w-6 h-6 text-accent-orange" />
          <span className="text-2xl font-black text-white">+{xp} XP</span>
        </div>
        <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md rounded-2xl px-6 py-3 border border-amber-400/30">
          <Coins className="w-6 h-6 text-amber-400" />
          <span className="text-2xl font-black text-white">+{coins} TX</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function PvPMatchPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile: myProfile } = useAuth();
  const sound = useSound();
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
  const [opponentProfile, setOpponentProfile] = useState<OpponentProfile | null>(null);
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [lastScoreChange, setLastScoreChange] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selfProfile, setSelfProfile] = useState<{ username: string; avatar_url: string | null; level: number } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishRef = useRef(false);
  const mountedRef = useRef(true);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const forceFinishAttempted = useRef(false);
  const prevScoreRef = useRef(0);

  const totalQ = questions.length || totalQuestions;
  const currentQuestion = questions[currentIndex];
  const answeredCurrent = currentQuestion ? answers[currentQuestion.id] !== undefined : false;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;
  const totalAnswered = Object.keys(answers).length;
  const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const timerExpired = matchTimer <= 0;
  const allAnswered = totalQ > 0 && currentIndex >= totalQ;
  const progress = totalQ > 0 ? (currentIndex / totalQ) * 100 : 0;
  const progressWithCurrent = progress + (answeredCurrent ? 100 / totalQ : 0);

  const motivationalTexts = useMemo(() => [
    "Your opponent is still battling...",
    "Victory is loading...",
    "Stay sharp, champion!",
    "The wait will be worth it!",
    "Great performance so far!",
    "Opponent is taking their time...",
  ], []);

  const [motivationIndex, setMotivationIndex] = useState(0);

  useEffect(() => {
    if (phase !== "waiting_opponent_finish" && phase !== "player_finished") return;
    const iv = setInterval(() => setMotivationIndex((i) => i + 1), 4000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    if (!myProfile) return;
    setSelfProfile({
      username: myProfile.username ?? myProfile.full_name ?? "You",
      avatar_url: myProfile.avatar_url,
      level: 1,
    });
  }, [myProfile]);

  // Fetch opponent profile when transitioning to vs_intro or playing
  const fetchOpponent = useCallback(async () => {
    if (!matchId || opponentProfile) return;
    try {
      const prof = await getOpponentProfile(matchId);
      if (mountedRef.current) setOpponentProfile(prof);
    } catch { /* ignore */ }
  }, [matchId, opponentProfile]);

  // Real-time subscription
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

        if (state.status === "waiting" && newStatus === "active" && newP2Id) {
          loadMatchData();
          return;
        }

        if (newStatus === "completed") {
          loadMatchResults();
          return;
        }

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

  // Load match data
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

      const selfFinished = state.player1Id === user.id ? state.p1Finished : state.p2Finished;
      const oppFinished = state.player1Id === user.id ? state.p2Finished : state.p1Finished;

      if (selfFinished) {
        if (oppFinished) {
          await loadMatchResults();
          return;
        }
        setPhase("waiting_opponent_finish");
        setScore(state.player1Id === user.id ? state.p1Score : state.p2Score);
        setOpponentScore(state.player1Id === user.id ? state.p2Score : state.p1Score);
        const qs = await getPvPQuestions(matchId).catch(() => []);
        if (mountedRef.current) setQuestions(qs);
        startPolling();
        subscribeToMatch(state);
        fetchOpponent();
        return;
      }

      if (state.status === "waiting" && !state.player2Id) {
        setPhase("waiting_opponent");
        startPolling();
        subscribeToMatch(state);
        return;
      }

      setScore(state.player1Id === user.id ? state.p1Score : state.p2Score);
      setOpponentScore(state.player1Id === user.id ? state.p2Score : state.p1Score);

      const qs = await getPvPQuestions(matchId) as PvPQuestion[];
      if (mountedRef.current) {
        setQuestions(qs);
        setTotalQuestions(qs.length);
        fetchOpponent();
        setPhase("vs_intro");
        subscribeToMatch(state);
      }
    } catch (e) {
      if (!mountedRef.current) return;
      setPhase("not_found");
      setErrorMsg(e instanceof Error ? e.message : "Match not found");
    }
  }, [matchId, user]);

  // VS intro → playing transition
  useEffect(() => {
    if (phase !== "vs_intro") return;
    const t = setTimeout(() => {
      if (mountedRef.current) {
        setPhase("playing");
        startTimer();
        startScorePoll();
      }
    }, VS_INTRO_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  // Load match results
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
      fetchOpponent();
    } catch {
      if (mountedRef.current) {
        setPhase("cancelled");
        setErrorMsg("Failed to load results");
      }
    }
  }, [matchId, user]);

  useEffect(() => {
    mountedRef.current = true;
    loadMatchData();
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [matchId, user]);

  // Timer
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setMatchTimer((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
  }, []);

  // Score polling
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

  // Polling for opponent join
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

        if (state.status === "active" && state.player2Id) {
          loadMatchData();
          return;
        }
      } catch { /* ignore */ }
    }, POLL_INTERVAL);
  }, [matchId]);

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (channelRef.current && supabaseRef.current) {
      supabaseRef.current.removeChannel(channelRef.current);
      channelRef.current = null;
      supabaseRef.current = null;
    }
  }, []);

  // Auto-finish
  useEffect(() => {
    if (phase !== "playing" || finishRef.current) return;
    if (timerExpired) handleFinish();
    else if (allAnswered) handleFinish();
  }, [timerExpired, allAnswered, phase]);

  // Force finish
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

  // Submit answer
  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion || !matchId || submitting || finishRef.current) return;
    const answer = currentQuestion.type === "written" ? writtenAnswer : selectedAnswer;
    if (!answer) return;

    setSubmitting(true);
    try {
      const res = await submitPvPAnswer(matchId, currentQuestion.id, answer);
      if (!mountedRef.current) return;

      const wasCorrect = res.correct;
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: { answer, correct: wasCorrect, points: res.points },
      }));
      setScore(res.totalScore);
      setAnswerFeedback(wasCorrect ? "correct" : "wrong");

      if (wasCorrect) {
        sound.playXpGain();
        setComboCount((c) => c + 1);
      } else {
        setComboCount(0);
        sound.playClick();
      }

      setLastScoreChange(res.points);

      if (wasCorrect && res.points > 0) {
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 1500);
      }

      setTimeout(() => setAnswerFeedback(null), 800);
      setSelectedAnswer("");
      setWrittenAnswer("");
    } catch (e) {
      console.error("Submit failed:", e);
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }, [currentQuestion, matchId, submitting, selectedAnswer, writtenAnswer, sound]);

  // Finish match
  const handleFinish = useCallback(async () => {
    if (finishRef.current || !matchId) return;
    finishRef.current = true;
    cleanup();
    try {
      const accuracyVal = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
      const res = await finishMatch(matchId, accuracyVal, totalAnswered);
      if (!mountedRef.current) return;

      if (res.action === "completed") {
        await loadMatchResults();
      } else {
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

  const handleNext = useCallback(() => {
    if (finishRef.current) return;
    setCurrentIndex((i) => (i >= totalQ - 1 ? i : i + 1));
    setAnswerFeedback(null);
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

  // Show XP animation on results
  useEffect(() => {
    if (phase === "completed" && resultData) {
      const myXp = isPlayer1 ? resultData.p1Xp : resultData.p2Xp;
      const myCoins = isPlayer1 ? resultData.p1Coins : resultData.p2Coins;
      if (myXp > 0 || myCoins > 0) {
        const t = setTimeout(() => {
          if (mountedRef.current) setShowXpAnimation(true);
        }, 600);
        const t2 = setTimeout(() => {
          if (mountedRef.current) setShowXpAnimation(false);
        }, 2000);
        return () => { clearTimeout(t); clearTimeout(t2); };
      }
    }
  }, [phase, resultData, isPlayer1]);

  // ====================================================================
  // RENDER
  // ====================================================================

  // ----------------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------------
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center mx-auto mb-6 border border-primary/20 animate-pulse-glow">
            <Swords className="w-10 h-10 text-primary-light" />
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <p className="text-white font-bold text-lg tracking-wide">Preparing Battle Arena</p>
            <p className="text-muted-light text-sm mt-1">Loading match data...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // NOT FOUND
  // ----------------------------------------------------------------
  if (phase === "not_found") {
    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#0e1220] border border-red-500/20 rounded-2xl p-8 max-w-md text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5" style={{ background: "radial-gradient(circle at 50% 50%, rgba(239,68,68,0.3) 0%, transparent 60%)" }} />
          <div className="relative z-10">
            <AlertTriangle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">Match Not Found</h3>
            <p className="text-muted-light text-sm mb-6">{errorMsg || "This match doesn't exist or has expired"}</p>
            <Button variant="primary" className="w-full" glow onClick={() => router.push("/pvp")}>
              <ArrowLeft className="w-4 h-4" /> Back to Arena
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // WAITING FOR OPPONENT (before match starts)
  // ----------------------------------------------------------------
  if (phase === "waiting_opponent") {
    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.5) 0%, transparent 50%)" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative"
        >
          <div className="relative rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: "linear-gradient(145deg, #0c1230 0%, #0f0f2e 50%, #0d1435 100%)" }}
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.25) 0%, transparent 60%)" }}
            />
            <div className="relative z-10 p-8 text-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center mx-auto mb-5 border-2 border-primary/30"
              >
                <div className="relative">
                  <Search className="w-12 h-12 text-primary-light" />
                  <motion.div
                    className="absolute -top-2 -right-2 w-5 h-5"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  </motion.div>
                </div>
              </motion.div>

              <h2 className="text-2xl font-black text-white mb-1">Searching for Opponent</h2>
              <p className="text-muted-light text-sm mb-4 capitalize">{matchCategory} Duel</p>

              <div className="flex items-center justify-center gap-3 mb-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, rgba(139,92,246,${0.8 - i * 0.2}), rgba(6,182,212,${0.8 - i * 0.2}))`,
                      boxShadow: `0 0 10px rgba(139,92,246,${0.5 - i * 0.15})`,
                    }}
                    animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-bold tabular-nums text-white mb-6">
                <Clock className="w-4 h-4 text-muted-light" />
                <span className={cn(matchTimer < 10 && "text-red-400")}>
                  {String(Math.floor(matchTimer / 60)).padStart(2, "0")}:{String(matchTimer % 60).padStart(2, "0")}
                </span>
              </div>

              <Button variant="ghost" className="w-full" onClick={() => router.push("/pvp")}>
                <X className="w-4 h-4" /> Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // VS INTRO SCREEN
  // ----------------------------------------------------------------
  if (phase === "vs_intro") {
    const myLevel = selfProfile?.level ?? 1;
    const myRank = getPlayerRank(myLevel);
    const oppLevel = opponentProfile?.level ?? 1;
    const oppRank = getPlayerRank(oppLevel);
    const myName = selfProfile?.username ?? "You";
    const oppName = opponentProfile?.username ?? "Opponent";
    const myAvatar = selfProfile?.avatar_url;
    const oppAvatar = opponentProfile?.avatar_url;

    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 animate-bg-scroll"
          style={{
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.12) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 50%, rgba(6,182,212,0.1) 0%, transparent 60%),
              radial-gradient(ellipse at 50% 20%, rgba(236,72,153,0.06) 0%, transparent 50%)
            `,
          }}
        />
        <VsParticles />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-4xl relative z-10"
        >
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {/* Player (Left) */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="flex flex-col items-center gap-3 flex-1"
            >
              <div className="relative">
                <motion.div
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 overflow-hidden"
                  style={{ borderColor: `${RANK_COLORS[myRank.name]}44`, boxShadow: `0 0 30px ${RANK_COLORS[myRank.name]}22` }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center">
                    {myAvatar ? (
                      <img src={myAvatar} alt={myName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-white">{myName[0]?.toUpperCase()}</span>
                    )}
                  </div>
                </motion.div>
                <motion.div
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#070b16]"
                  style={{ background: RANK_COLORS[myRank.name] }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <span className="text-[10px] font-black text-black">{myLevel}</span>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <p className="text-white font-bold text-lg md:text-xl">{myName}</p>
                <div className="flex items-center gap-1.5 justify-center mt-1">
                  <myRank.icon className="w-3.5 h-3.5" style={{ color: RANK_COLORS[myRank.name] }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: RANK_COLORS[myRank.name] }}>
                    {myRank.name}
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* VS Center */}
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="text-6xl md:text-8xl font-black tracking-tighter leading-none select-none"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="animate-vs-pulse text-transparent bg-clip-text bg-gradient-to-br from-primary-light via-accent-pink to-secondary">
                  VS
                </span>
              </motion.div>
              <motion.div
                className="mt-2 px-4 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest"
                style={{
                  borderColor: `${RANK_COLORS[myRank.name]}44`,
                  color: RANK_COLORS[myRank.name],
                  background: `${RANK_COLORS[myRank.name]}11`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Battle Ready
              </motion.div>
            </motion.div>

            {/* Opponent (Right) */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="flex flex-col items-center gap-3 flex-1"
            >
              <div className="relative">
                <motion.div
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 overflow-hidden"
                  style={{ borderColor: `${RANK_COLORS[oppRank.name]}44`, boxShadow: `0 0 30px ${RANK_COLORS[oppRank.name]}22` }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                    {oppAvatar ? (
                      <img src={oppAvatar} alt={oppName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-white">{oppName[0]?.toUpperCase()}</span>
                    )}
                  </div>
                </motion.div>
                <motion.div
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#070b16]"
                  style={{ background: RANK_COLORS[oppRank.name] }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <span className="text-[10px] font-black text-black">{oppLevel}</span>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <p className="text-white font-bold text-lg md:text-xl">{oppName}</p>
                <div className="flex items-center gap-1.5 justify-center mt-1">
                  <oppRank.icon className="w-3.5 h-3.5" style={{ color: RANK_COLORS[oppRank.name] }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: RANK_COLORS[oppRank.name] }}>
                    {oppRank.name}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom countdown text */}
          <motion.p
            className="text-center text-muted-light text-xs mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Preparing battle arena...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // CANCELLED
  // ----------------------------------------------------------------
  if (phase === "cancelled") {
    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#0e1220] border border-white/10 rounded-2xl p-8 max-w-md text-center"
        >
          <AlertTriangle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-white mb-2">Match Ended</h3>
          <p className="text-muted-light mb-6">{errorMsg || "Could not complete the match"}</p>
          <Button variant="primary" className="w-full" glow onClick={() => router.push("/pvp")}>
            <ArrowLeft className="w-4 h-4" /> Back to Arena
          </Button>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // COMPLETED — Results
  // ----------------------------------------------------------------
  if (phase === "completed" && resultData) {
    const isWinner = resultData.isWinner;
    const myScore = isPlayer1 ? resultData.p1Score : resultData.p2Score;
    const oppScore = isPlayer1 ? resultData.p2Score : resultData.p1Score;
    const myXp = isPlayer1 ? resultData.p1Xp : resultData.p2Xp;
    const myCoins = isPlayer1 ? resultData.p1Coins : resultData.p2Coins;
    const myAccuracy = isPlayer1 ? resultData.p1Accuracy : resultData.p2Accuracy;
    const oppAccuracy = isPlayer1 ? resultData.p2Accuracy : resultData.p1Accuracy;

    const oppName = opponentProfile?.username ?? "Opponent";
    const oppAvatar = opponentProfile?.avatar_url;
    const myName = selfProfile?.username ?? "You";
    const myAvatar = selfProfile?.avatar_url;

    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 animate-bg-scroll opacity-30"
          style={{
            background: `
              radial-gradient(ellipse at 30% 50%, ${isWinner ? "rgba(255,215,0,0.08)" : "rgba(100,100,120,0.05)"} 0%, transparent 60%),
              radial-gradient(ellipse at 70% 50%, ${isWinner ? "rgba(255,107,53,0.06)" : "rgba(80,80,100,0.03)"} 0%, transparent 60%)
            `,
          }}
        />
        <AnimatePresence>
          {showXpAnimation && <XpFloatAnimation xp={myXp} coins={myCoins} />}
        </AnimatePresence>

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-full max-w-lg relative z-10"
        >
          <div className="rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #0c1230 0%, #0f0f2e 50%, #0d1435 100%)",
              border: isWinner ? "1px solid rgba(255,215,0,0.2)" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: isWinner ? "0 0 60px rgba(255,215,0,0.1)" : "none",
            }}
          >
            {/* Top gradient bar */}
            <div className={cn(
              "h-1.5 w-full",
              isWinner
                ? "bg-gradient-to-r from-amber-400 via-yellow-500 to-accent-orange"
                : "bg-gradient-to-r from-muted to-white/10",
            )} />

            <div className="p-6 md:p-8 text-center">
              {/* Winner/Loser Crown */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                className="mb-4"
              >
                {isWinner ? (
                  <div className="relative inline-flex">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400/20 to-accent-orange/20 flex items-center justify-center border-2 border-amber-400/30">
                      <motion.div
                        animate={{ rotate: [0, -5, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Crown className="w-12 h-12 text-amber-400 animate-crown-glow" />
                      </motion.div>
                    </div>
                    <motion.div
                      className="absolute -top-2 -right-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Sparkles className="w-6 h-6 text-yellow-300" />
                    </motion.div>
                    <SparkleParticles color="rgba(255,215,0,0.6)" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border-2 border-white/10">
                    <Swords className="w-12 h-12 text-muted" />
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className={cn(
                  "text-4xl font-black mb-1",
                  isWinner ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-accent-orange" : "text-white",
                )}>
                  {isWinner ? "VICTORY!" : "DEFEAT"}
                </h2>
                <p className="text-muted-light text-sm capitalize mb-4">{matchCategory} Duel</p>
              </motion.div>

              {/* Score comparison — game style */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-4 mb-6"
              >
                {/* Player Score */}
                <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                      {myAvatar ? <img src={myAvatar} alt="" className="w-full h-full object-cover" /> : myName[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs text-muted-light truncate max-w-[80px]">{myName}</span>
                  </div>
                  <motion.p
                    className="text-3xl font-black text-white"
                    key={myScore}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {myScore}
                  </motion.p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider mt-1">
                    <Target className="w-3 h-3 inline mr-1" />
                    {myAccuracy ?? 0}% accuracy
                  </p>
                </div>

                {/* VS */}
                <div className="flex flex-col items-center px-2">
                  <div className={cn(
                    "text-xs font-bold px-3 py-1 rounded-full",
                    isWinner ? "bg-accent-green/15 text-accent-green" : "bg-red-500/15 text-red-400",
                  )}>
                    {isWinner ? "WIN" : "LOSS"}
                  </div>
                </div>

                {/* Opponent Score */}
                <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                      {oppAvatar ? <img src={oppAvatar} alt="" className="w-full h-full object-cover" /> : oppName[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs text-muted-light truncate max-w-[80px]">{oppName}</span>
                  </div>
                  <motion.p
                    className="text-3xl font-black text-white"
                    key={oppScore}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {oppScore}
                  </motion.p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider mt-1">
                    <Target className="w-3 h-3 inline mr-1" />
                    {oppAccuracy ?? 0}% accuracy
                  </p>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-3 mb-6"
              >
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <Zap className="w-5 h-5 text-accent-orange mx-auto mb-1" />
                  <p className="text-xl font-black text-white">+{myXp}</p>
                  <p className="text-[9px] text-muted-light uppercase tracking-wider">XP</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-white">+{myCoins}</p>
                  <p className="text-[9px] text-muted-light uppercase tracking-wider">Coins</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <Flame className={cn("w-5 h-5 mx-auto mb-1", comboCount >= 2 ? "text-accent-orange" : "text-muted-light")} />
                  <p className="text-xl font-black text-white">{comboCount > 0 ? `${comboCount}x` : "0"}</p>
                  <p className="text-[9px] text-muted-light uppercase tracking-wider">Combo</p>
                </div>
              </motion.div>

              {/* Answer detail */}
              {Object.keys(answers).length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-6"
                >
                  <p className="text-xs text-muted-light uppercase tracking-wider mb-3">Your Answers</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Object.entries(answers).map(([qId, ans], i) => (
                      <motion.div
                        key={qId}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + i * 0.05 }}
                        className={cn(
                          "flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-xs",
                          ans.correct
                            ? "bg-accent-green/10 border-accent-green/20 text-accent-green"
                            : "bg-red-500/10 border-red-500/20 text-red-400",
                        )}
                      >
                        <span className="font-bold">Q{i + 1}</span>
                        <span>{ans.correct ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-2"
              >
                <Button variant="primary" className="w-full" glow onClick={() => router.push("/pvp")}>
                  <Swords className="w-4 h-4" /> Play Again
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1" onClick={() => router.push("/friends")}>
                    <Users className="w-4 h-4" /> Add Friend
                  </Button>
                  <Button variant="ghost" className="flex-1" onClick={() => router.push("/pvp")}>
                    <ArrowLeft className="w-4 h-4" /> Arena
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // WAITING FOR OPPONENT FINISH
  // ----------------------------------------------------------------
  if (phase === "waiting_opponent_finish" || phase === "player_finished") {
    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.4) 0%, transparent 60%)" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="relative rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: "linear-gradient(145deg, #0c1230 0%, #0f0f2e 50%, #0d1435 100%)" }}
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.2) 0%, transparent 60%)" }}
            />
            <div className="relative z-10 p-8 text-center">
              {/* Animated ring */}
              <div className="relative w-24 h-24 mx-auto mb-5">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-transparent"
                  style={{
                    borderTopColor: "rgba(139,92,246,0.6)",
                    borderRightColor: "rgba(6,182,212,0.4)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border-2 border-transparent"
                  style={{
                    borderBottomColor: "rgba(236,72,153,0.4)",
                    borderLeftColor: "rgba(139,92,246,0.3)",
                  }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: [0, 5, 0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  >
                    <Users className="w-10 h-10 text-primary-light" />
                  </motion.div>
                </div>
              </div>

              <h3 className="text-2xl font-black text-white mb-2">Waiting for Opponent</h3>
              <p className="text-muted-light text-sm mb-1 capitalize">{matchCategory} Duel</p>
              <p className="text-xs text-muted-light/60 mb-4">Your opponent is still finishing the battle</p>

              {/* Animated dots */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full animate-dot-pulse"
                    style={{
                      background: `linear-gradient(135deg, rgba(139,92,246,${0.8 - i * 0.15}), rgba(6,182,212,${0.8 - i * 0.15}))`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>

              {/* Motivational text */}
              <motion.p
                key={motivationIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-sm text-muted-light italic mb-6"
              >
                &ldquo;{motivationalTexts[motivationIndex % motivationalTexts.length]}&rdquo;
              </motion.p>

              {/* Timer */}
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold tabular-nums mb-6",
                matchTimer < 30 ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white",
              )}>
                <Clock className="w-4 h-4" />
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>

              {/* Performance Preview */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-4">
                <p className="text-xs text-muted-light uppercase tracking-wider mb-3 flex items-center gap-1.5 justify-center">
                  <Activity className="w-3.5 h-3.5" /> Your Performance
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <motion.div
                    className="text-center p-2 rounded-lg bg-white/[0.03]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-2xl font-black text-white">{score}</p>
                    <p className="text-[10px] text-muted-light uppercase">Score</p>
                  </motion.div>
                  <motion.div
                    className="text-center p-2 rounded-lg bg-white/[0.03]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-2xl font-black text-white">{accuracy}%</p>
                    <p className="text-[10px] text-muted-light uppercase">Accuracy</p>
                  </motion.div>
                  <motion.div
                    className="text-center p-2 rounded-lg bg-white/[0.03]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-2xl font-black text-white">{totalAnswered}/{totalQ}</p>
                    <p className="text-[10px] text-muted-light uppercase">Answered</p>
                  </motion.div>
                </div>
              </div>

              {/* Estimated rewards */}
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <p className="text-[10px] text-muted-light uppercase tracking-wider mb-2">Estimated Rewards</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-accent-orange" />
                    <span className="text-sm font-bold text-white">
                      +{correctCount >= totalQ * 0.6 ? 50 : 15}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-white">
                      +{correctCount >= totalQ * 0.6 ? 25 : 5}
                    </span>
                  </div>
                </div>
              </div>

              {matchTimer <= 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-400 mt-4"
                >
                  Timer expired. Finalizing match...
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // PLAYING — Active Battle
  // ----------------------------------------------------------------
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-light animate-spin mx-auto mb-4" />
          <p className="text-white font-bold text-lg">Loading challenge...</p>
        </div>
      </div>
    );
  }

  const qData = currentQuestion.data;
  const questionOptions = qData.options;
  const oppName = opponentProfile?.username ?? "Opponent";
  const myName = selfProfile?.username ?? "You";

  return (
    <div className="min-h-screen bg-[#070b16] flex flex-col relative overflow-hidden">
      {/* Background arena effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background: `
            radial-gradient(ellipse at 20% 0%, rgba(139,92,246,0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 100%, rgba(6,182,212,0.2) 0%, transparent 50%)
          `,
        }}
      />
      <Particles count={8} />

      {/* ─── TOP HUD ─── */}
      <div className="relative z-10 bg-[#0a0f1e]/90 backdrop-blur-md border-b border-white/5">
        {/* Main HUD row */}
        <div className="flex items-center justify-between px-3 md:px-5 py-2.5">
          {/* Player (Left) */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative shrink-0">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/20 flex items-center justify-center text-xs font-bold overflow-hidden">
                {selfProfile?.avatar_url ? (
                  <img src={selfProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  myName[0]?.toUpperCase()
                )}
              </div>
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-[#070b16] flex items-center justify-center"
                style={{ background: "#10b981" }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </motion.div>
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-bold text-white truncate">{myName}</p>
              <motion.p
                className="text-lg md:text-xl font-black text-white tabular-nums"
                key={score}
                animate={score > 0 ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {score}
              </motion.p>
            </div>
          </div>

          {/* Center: Timer + Progress */}
          <div className="flex flex-col items-center flex-shrink-0 px-2">
            <div className="flex items-center gap-2 mb-1">
              <motion.div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold tabular-nums",
                  matchTimer < 30
                    ? "bg-red-500/20 text-red-400"
                    : matchTimer < 60
                    ? "bg-yellow-500/15 text-yellow-400"
                    : "bg-white/10 text-white",
                )}
                animate={matchTimer < 30 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1, repeat: matchTimer < 30 ? Infinity : 0 }}
              >
                <Clock className="w-3.5 h-3.5" />
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </motion.div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-light font-medium tabular-nums">
                Q{currentIndex + 1}/{totalQ}
              </span>
              {/* Mini progress dots */}
              <div className="flex gap-1">
                {Array.from({ length: totalQ }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      i < currentIndex
                        ? "bg-primary-light"
                        : i === currentIndex
                        ? "bg-white"
                        : "bg-white/15",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Opponent (Right) */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end">
            <div className="text-right min-w-0">
              <p className="text-xs md:text-sm font-bold text-white truncate">{oppName}</p>
              <motion.p
                className="text-lg md:text-xl font-black text-white tabular-nums text-right"
                key={opponentScore}
                animate={opponentScore > 0 ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {opponentScore}
              </motion.p>
            </div>
            <div className="relative shrink-0">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/20 flex items-center justify-center text-xs font-bold overflow-hidden">
                {opponentProfile?.avatar_url ? (
                  <img src={opponentProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  oppName[0]?.toUpperCase()
                )}
              </div>
              {opponentProfile && (
                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-[#070b16] bg-accent-green">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mx-auto mt-0.5" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-600 via-primary to-cyan-500"
            animate={{ width: `${progressWithCurrent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ boxShadow: "0 0 10px rgba(139,92,246,0.3)" }}
          />
        </div>
      </div>

      {/* ─── QUESTION CONTENT ─── */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-3xl mx-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {/* Question header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                  currentQuestion.type === "multiple_choice"
                    ? "bg-primary/15 text-primary-light border border-primary/20"
                    : currentQuestion.type === "coding_challenge"
                    ? "bg-accent-green/15 text-accent-green border border-accent-green/20"
                    : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
                )}>
                  {currentQuestion.type.replace("_", " ")}
                </div>
                <span className="text-xs text-muted-light font-medium">{currentQuestion.points} pts</span>

                {/* Combo display */}
                <AnimatePresence>
                  {showCombo && comboCount >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="flex items-center gap-1 ml-auto"
                    >
                      <Flame className="w-4 h-4 text-accent-orange" />
                      <span className="text-xs font-black text-accent-orange animate-combo-flash">
                        {comboCount}x Combo!
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Question text */}
              <h3 className="text-xl md:text-2xl font-bold text-white mb-6 leading-tight">
                {String(qData.question)}
              </h3>

              {/* Code block */}
              {qData.code && (
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-cyan-500/5 rounded-xl opacity-50" />
                  <pre className="relative bg-black/60 border border-white/10 rounded-xl p-4 text-sm font-mono text-green-400 overflow-x-auto">
                    <code>{String(qData.code)}</code>
                  </pre>
                </div>
              )}

              {/* Multiple Choice */}
              {currentQuestion.type === "multiple_choice" && questionOptions && (
                <div className="space-y-2.5 mt-4">
                  {questionOptions.map((opt, i) => {
                    const isSelected = selectedAnswer === opt;
                    const showCorrect = answeredCurrent && currentQuestion.correctAnswer === opt;
                    const showWrong = answeredCurrent && isSelected && !showCorrect;
                    return (
                      <motion.button
                        key={i}
                        onClick={() => !answeredCurrent && setSelectedAnswer(opt)}
                        disabled={answeredCurrent}
                        className={cn(
                          "w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3 group relative overflow-hidden",
                          answeredCurrent
                            ? showCorrect
                              ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
                              : showWrong
                              ? "border-red-500/50 bg-red-500/10 text-red-400"
                              : "border-white/5 bg-white/[0.02] text-muted-light"
                            : isSelected
                              ? "border-primary/50 bg-primary/15 text-white shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                              : "border-white/10 bg-white/[0.03] text-muted-light hover:border-white/20 hover:bg-white/[0.05] hover:text-white",
                        )}
                        whileHover={!answeredCurrent ? { scale: 1.01, x: 2 } : {}}
                        whileTap={!answeredCurrent ? { scale: 0.99 } : {}}
                      >
                        {answeredCurrent && showCorrect && (
                          <motion.div
                            className="absolute inset-0 bg-accent-green/5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                        <span className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 relative z-10",
                          answeredCurrent && showCorrect
                            ? "bg-accent-green/20 text-accent-green"
                            : answeredCurrent && showWrong
                              ? "bg-red-500/20 text-red-400"
                              : isSelected
                                ? "bg-primary/20 text-primary-light"
                                : "bg-white/5 text-muted group-hover:bg-white/10",
                        )}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm font-medium relative z-10">{opt}</span>
                        {answeredCurrent && showCorrect && (
                          <motion.div
                            className="ml-auto shrink-0 relative z-10"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring" }}
                          >
                            <Check className="w-5 h-5 text-accent-green" />
                          </motion.div>
                        )}
                        {answeredCurrent && showWrong && (
                          <motion.div
                            className="ml-auto shrink-0 relative z-10"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                          >
                            <X className="w-5 h-5 text-red-400" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Written answer */}
              {currentQuestion.type === "written" && (
                <div className="mt-4">
                  <textarea
                    value={answeredCurrent ? (answers[currentQuestion.id]?.answer ?? "") : writtenAnswer}
                    onChange={(e) => !answeredCurrent && setWrittenAnswer(e.target.value)}
                    disabled={answeredCurrent}
                    placeholder="Type your answer..."
                    className="w-full h-36 rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary/50 resize-none transition-colors"
                  />
                </div>
              )}

              {/* Coding challenge */}
              {currentQuestion.type === "coding_challenge" && (
                <div className="mt-4">
                  <textarea
                    value={answeredCurrent ? (answers[currentQuestion.id]?.answer ?? "") : selectedAnswer}
                    onChange={(e) => !answeredCurrent && setSelectedAnswer(e.target.value)}
                    disabled={answeredCurrent}
                    placeholder="Write your solution..."
                    className="w-full h-48 rounded-xl bg-black/80 border border-white/10 px-4 py-3 text-sm font-mono text-green-400 placeholder:text-muted focus:outline-none focus:border-primary/50 resize-none"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* Answer feedback */}
              <AnimatePresence>
                {answeredCurrent && answerFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className={cn(
                      "mt-4 px-4 py-3.5 rounded-xl border flex items-center gap-2 text-sm font-medium overflow-hidden",
                      answers[currentQuestion.id]?.correct
                        ? "bg-accent-green/10 border-accent-green/20 text-accent-green"
                        : "bg-red-500/10 border-red-500/20 text-red-400",
                    )}
                  >
                    {answers[currentQuestion.id]?.correct ? (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          <Check className="w-5 h-5" />
                        </motion.div>
                        <span>Correct! <span className="font-bold">+{answers[currentQuestion.id]?.points} pts</span></span>
                        {lastScoreChange > 0 && (
                          <motion.span
                            className="ml-auto text-xs opacity-60"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            Score: {score}
                          </motion.span>
                        )}
                      </>
                    ) : (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          <X className="w-5 h-5" />
                        </motion.div>
                        <span>Incorrect</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── BOTTOM BAR ─── */}
      <div className="relative z-10 border-t border-white/5 bg-[#0a0f1e]/90 backdrop-blur-md px-3 md:px-5 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-light">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-accent-orange" />
              <span className="tabular-nums">{score}</span>
            </div>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-primary-light" />
              <span>{accuracy}%</span>
            </div>
            <span className="text-white/20">|</span>
            <span>{correctCount}/{totalAnswered} correct</span>
          </div>

          <div className="flex items-center gap-2">
            {!answeredCurrent && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip
              </Button>
            )}
            {!answeredCurrent ? (
              <Button
                variant="primary" size="sm" glow
                onClick={handleSubmitAnswer}
                disabled={submitting || finishRef.current ||
                  (currentQuestion.type === "multiple_choice" && !selectedAnswer) ||
                  (currentQuestion.type === "written" && !writtenAnswer) ||
                  (currentQuestion.type === "coding_challenge" && !selectedAnswer)
                }
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {submitting ? "Submitting..." : "Submit"}
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

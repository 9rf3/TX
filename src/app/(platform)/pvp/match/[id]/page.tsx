"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Swords, Clock, Check, X, Loader2, Zap, Coins,
  Trophy, ArrowLeft, AlertTriangle, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { getMatchState, submitPvPAnswer, completePvPMatch, getPvPQuestions } from "@/actions/pvp";
import { useAuth } from "@/components/providers/AuthProvider";

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

type PageStatus = "loading" | "not_found" | "waiting" | "playing" | "finished" | "cancelled";

export default function PvPMatchPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const matchId = params.id as string;

  const [status, setStatus] = useState<PageStatus>("loading");
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
  const [matchTimer, setMatchTimer] = useState(180);
  const [matchCategory, setMatchCategory] = useState("");

  // Result state
  const [resultData, setResultData] = useState<{
    status: string; winner: string | null; isWinner: boolean;
    p1Score: number; p2Score: number; xpReward: number; coinReward: number;
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scorePollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishRef = useRef(false);
  const mountedRef = useRef(true);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const answeredCurrent = currentQuestion ? answers[currentQuestion.id] !== undefined : false;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;

  // Load match state
  useEffect(() => {
    mountedRef.current = true;
    if (!matchId || !user) return;

    const load = async () => {
      try {
        const state = await getMatchState(matchId);
        if (!mountedRef.current) return;

        if (state.status === "cancelled") {
          setStatus("cancelled");
          setErrorMsg("Match was cancelled");
          return;
        }

        if (state.status === "completed") {
          const qs = await getPvPQuestions(matchId).catch(() => []) as PvPQuestion[];
          if (mountedRef.current) {
            setMatchCategory(state.category);
            setQuestions(qs);
            setScore(state.p1Score);
            setOpponentScore(state.p2Score);
            setIsPlayer1(state.player1Id === user.id);
            setResultData({
              status: "completed", winner: state.winnerId,
              isWinner: state.winnerId === user.id,
              p1Score: state.p1Score, p2Score: state.p2Score,
              xpReward: state.winnerId === user.id ? 50 : 15,
              coinReward: state.winnerId === user.id ? 25 : 5,
            });
            setStatus("finished");
          }
          return;
        }

        if (state.status === "waiting" && !state.player2Id) {
          if (mountedRef.current) {
            setMatchCategory(state.category);
            setIsPlayer1(state.player1Id === user.id);
            setStatus("waiting");
            // Poll for opponent
            const poll = setInterval(async () => {
              if (!mountedRef.current) return;
              try {
                const s = await getMatchState(matchId);
                if (!mountedRef.current) return;
                if (s.status === "active" && s.player2Id) {
                  clearInterval(poll);
                  const qs = await getPvPQuestions(matchId) as PvPQuestion[];
                  if (mountedRef.current) {
                    setQuestions(qs);
                    setOpponentScore(0);
                    setStatus("playing");
                  }
                }
              } catch { /* retry */ }
            }, 1500);
            // Timeout after 30s
            setTimeout(() => {
              clearInterval(poll);
              if (mountedRef.current && status === "waiting") {
                setStatus("cancelled");
                setErrorMsg("No opponent found");
              }
            }, 30000);
          }
          return;
        }

        // Active match
        setIsPlayer1(state.player1Id === user.id);
        setScore(state.p1Score);
        setOpponentScore(state.p2Score);
        setMatchCategory(state.category);

        const qs = await getPvPQuestions(matchId) as PvPQuestion[];
        if (mountedRef.current) {
          setQuestions(qs);
          setStatus("playing");
        }
      } catch (e) {
        if (!mountedRef.current) return;
        setStatus("not_found");
        setErrorMsg(e instanceof Error ? e.message : "Match not found");
      }
    };
    load();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (scorePollRef.current) clearInterval(scorePollRef.current);
    };
  }, [matchId, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start timer + score polling when playing
  useEffect(() => {
    if (status !== "playing" || finishRef.current) return;

    timerRef.current = setInterval(() => {
      setMatchTimer((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);

    scorePollRef.current = setInterval(async () => {
      if (!matchId || !mountedRef.current) return;
      try {
        const state = await getMatchState(matchId);
        if (mountedRef.current) {
          setOpponentScore(isPlayer1 ? state.p2Score : state.p1Score);
        }
      } catch { /* ignore */ }
    }, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (scorePollRef.current) clearInterval(scorePollRef.current);
    };
  }, [status, matchId, isPlayer1]);

  // Auto-finish on timer expiry or all questions done
  useEffect(() => {
    if (status === "playing") {
      if (matchTimer <= 0 && !finishRef.current) {
        handleFinish();
      } else if (totalQuestions > 0 && currentIndex >= totalQuestions && !finishRef.current) {
        handleFinish();
      }
    }
  }, [matchTimer, currentIndex, totalQuestions, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFinish = useCallback(async () => {
    if (finishRef.current || !matchId) return;
    finishRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (scorePollRef.current) clearInterval(scorePollRef.current);

    try {
      const res = await completePvPMatch(matchId);
      if (!mountedRef.current) return;
      if (res.status === "cancelled") {
        setStatus("cancelled");
        setErrorMsg("No opponent found");
      } else {
        setResultData(res);
        setStatus("finished");
      }
    } catch (e) {
      if (mountedRef.current) {
        setErrorMsg(e instanceof Error ? e.message : "Failed to complete match");
        setStatus("cancelled");
      }
    }
  }, [matchId]);

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

  const handleNext = useCallback(() => {
    if (finishRef.current) return;
    setCurrentIndex((i) => (i >= totalQuestions - 1 ? i : i + 1));
  }, [totalQuestions]);

  const handleSkip = useCallback(() => {
    if (!currentQuestion || finishRef.current) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { answer: "", correct: false, points: 0 },
    }));
    setCurrentIndex((i) => (i >= totalQuestions - 1 ? i : i + 1));
  }, [currentQuestion, totalQuestions]);

  const minutes = Math.floor(matchTimer / 60);
  const seconds = matchTimer % 60;

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070b16]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-light animate-spin mx-auto mb-4" />
          <p className="text-white font-bold text-lg">Loading match...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (status === "not_found") {
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

  // Waiting for opponent
  if (status === "waiting") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070b16] p-4">
        <div className="bg-[#0e1220] border border-white/10 rounded-2xl p-8 max-w-sm text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-blue-600/30 flex items-center justify-center mx-auto mb-4 border-2 border-primary/30 animate-pulse">
            <Swords className="w-10 h-10 text-primary-light" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Waiting for Opponent</h3>
          <p className="text-muted-light text-sm mb-4 capitalize">{matchCategory} · Match</p>
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
    );
  }

  // Cancelled
  if (status === "cancelled") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070b16] p-4">
        <div className="bg-[#0e1220] border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Match Cancelled</h3>
          <p className="text-muted-light mb-6">{errorMsg || "Could not complete the match"}</p>
          <Button variant="primary" onClick={() => router.push("/pvp")}>
            <ArrowLeft className="w-4 h-4" /> Back to Arena
          </Button>
        </div>
      </div>
    );
  }

  // Finished / Results
  if (status === "finished" && resultData) {
    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg">
          <div className="bg-[#0e1220] border border-white/10 rounded-2xl overflow-hidden">
            <div className={cn("h-2 w-full",
              resultData.isWinner ? "bg-gradient-to-r from-amber-400 to-accent-orange" : "bg-gradient-to-r from-muted to-white/10"
            )} />
            <div className="p-8 text-center">
              {resultData.isWinner ? (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/30 to-accent-orange/30 flex items-center justify-center mx-auto mb-4 border-2 border-amber-400/30">
                  <Trophy className="w-10 h-10 text-amber-400" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border-2 border-white/10">
                  <Swords className="w-10 h-10 text-muted-light" />
                </div>
              )}
              <h2 className="text-2xl font-black text-white mb-1">
                {resultData.isWinner ? "Victory!" : "Defeat"}
              </h2>
              <p className="text-muted-light text-sm mb-2 capitalize">{matchCategory} Duel</p>
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-black text-white">{resultData.p1Score}</p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider">You</p>
                </div>
                <div className="text-2xl font-black text-muted">VS</div>
                <div className="text-center">
                  <p className="text-3xl font-black text-white">{resultData.p2Score}</p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider">Opponent</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <Zap className="w-5 h-5 text-accent-orange mx-auto mb-1" />
                  <p className="text-xl font-black text-white">+{resultData.xpReward}</p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider">XP</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-white">+{resultData.coinReward}</p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider">TX Coins</p>
                </div>
              </div>
              {Object.keys(answers).length > 0 && (
                <div className="space-y-2 mb-6">
                  {Object.entries(answers).map(([qId, ans], i) => (
                    <div key={qId} className={cn(
                      "flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm",
                      ans.correct ? "bg-accent-green/10 border-accent-green/20 text-accent-green" : "bg-red-500/10 border-red-500/20 text-red-400",
                    )}>
                      <span>Q{i + 1}</span>
                      <span className="flex items-center gap-1">
                        {ans.correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        {ans.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="primary" className="w-full" glow onClick={() => router.push("/pvp")}>
                <Swords className="w-4 h-4" /> Back to Arena
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Playing — no current question
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

  const progress = totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0;
  const qData = currentQuestion.data;
  const questionOptions = qData.options;

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
            <p className="text-[10px] text-muted-light">Question {currentIndex + 1} of {totalQuestions}</p>
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
          style={{ width: `${progress + (answeredCurrent ? 100 / totalQuestions : 0)}%` }} />
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 md:p-8">
          <div key={currentQuestion.id}>
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
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-[#0e1220] px-4 md:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-light">
            <span>Score: {score}</span>
            <span>Correct: {correctCount}/{Object.keys(answers).length}</span>
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
                {currentIndex >= totalQuestions - 1 ? (
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

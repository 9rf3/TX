"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords, Clock, Check, X, Loader2, Zap, Coins, Star,
  Trophy, User, Users, ArrowLeft, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { quickMatch, submitPvPAnswer, completePvPMatch, getPvPMatchState } from "@/actions/pvp";
import type { PvPCategory } from "@/lib/types";

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

interface MatchResult {
  status: string;
  winner: string | null;
  isWinner: boolean;
  p1Score: number;
  p2Score: number;
  xpReward: number;
  coinReward: number;
}

type PvPPhase = "queue" | "matched" | "playing" | "finished" | "waiting_opponent" | "cancelled";

export function PvPMatchModal({
  category,
  onClose,
  currentUserId,
}: {
  category: PvPCategory;
  onClose: () => void;
  currentUserId: string;
}) {
  const [phase, setPhase] = useState<PvPPhase>("queue");
  const [questions, setQuestions] = useState<PvPQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, { answer: string; correct: boolean; points: number }>>({});
  const [score, setScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [isPlayer1, setIsPlayer1] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchTimer, setMatchTimer] = useState(180); // 3 min
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const answered = currentQuestion ? answers[currentQuestion.id] !== undefined : false;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;

  // Initialize match
  useEffect(() => {
    const init = async () => {
      try {
        const data = await quickMatch(category);
        setMatchId(data.match.id);
        setIsPlayer1(data.match.player_1_id === currentUserId);

        if (data.match.status === "active") {
          setPhase("matched");
          setQuestions(data.questions as PvPQuestion[]);
          setTimeout(() => setPhase("playing"), 2000);
        } else {
          setPhase("waiting_opponent");
          // Poll for opponent
          pollRef.current = setInterval(async () => {
            try {
              const state = await getPvPMatchState(data.match.id);
              if (state.status === "active" && state.player2Id) {
                if (pollRef.current) clearInterval(pollRef.current);
                setPhase("matched");
                setOpponentScore(0);
                const qs = data.questions as PvPQuestion[];
                setQuestions(qs);
                setTimeout(() => setPhase("playing"), 2000);
              }
            } catch { /* ignore */ }
          }, 2000);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create match");
        setPhase("cancelled");
      }
    };
    init();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [category, currentUserId]);

  // Match timer
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setMatchTimer((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleFinish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    // Poll opponent score
    const scorePoll = setInterval(async () => {
      if (!matchId) return;
      try {
        const state = await getPvPMatchState(matchId);
        if (isPlayer1) {
          setOpponentScore(state.p2Score);
        } else {
          setOpponentScore(state.p1Score);
        }
      } catch { /* ignore */ }
    }, 3000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearInterval(scorePoll);
    };
  }, [phase, matchId, isPlayer1]);

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion || !matchId || submitting) return;

    const answer = currentQuestion.type === "written" ? writtenAnswer : selectedAnswer;
    if (!answer) return;

    setSubmitting(true);
    try {
      const res = await submitPvPAnswer(matchId, currentQuestion.id, answer);
      setAnswers((a) => ({
        ...a,
        [currentQuestion.id]: { answer, correct: res.correct, points: res.points },
      }));
      setScore(res.totalScore);
      setSelectedAnswer("");
      setWrittenAnswer("");

      setTimeout(() => {
        setCurrentIndex((i) => {
          if (i >= totalQuestions - 1) {
            handleFinish();
            return i;
          }
          return i + 1;
        });
      }, 800);
    } catch (e) {
      console.error("PvP submit failed:", e);
    } finally {
      setSubmitting(false);
    }
  }, [currentQuestion, matchId, submitting, selectedAnswer, writtenAnswer, totalQuestions]);

  const handleFinish = useCallback(async () => {
    if (!matchId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await completePvPMatch(matchId);
      if (res.status === "cancelled") {
        setPhase("cancelled");
        setError("No opponent found");
      } else {
        setResult(res as MatchResult);
        setPhase("finished");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to complete match");
      setPhase("cancelled");
    }
  }, [matchId]);

  const handleSkip = () => {
    if (currentQuestion) {
      setAnswers((a) => ({
        ...a,
        [currentQuestion.id]: { answer: "", correct: false, points: 0 },
      }));
    }
    setCurrentIndex((i) => {
      if (i >= totalQuestions - 1) {
        handleFinish();
        return i;
      }
      return i + 1;
    });
  };

  const minutes = Math.floor(matchTimer / 60);
  const seconds = matchTimer % 60;

  // Queue Phase
  if (phase === "queue") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-primary-light animate-spin mx-auto mb-4" />
          <p className="text-white font-bold text-xl">Finding Match...</p>
          <p className="text-muted-light text-sm mt-1">Searching for an opponent</p>
        </motion.div>
      </div>
    );
  }

  // Waiting for opponent
  if (phase === "waiting_opponent") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#0e1220] border border-white/10 rounded-2xl p-8 max-w-sm text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-blue-600/30 flex items-center justify-center mx-auto mb-4 border-2 border-primary/30 animate-pulse">
            <Users className="w-10 h-10 text-primary-light" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Waiting for Opponent</h3>
          <p className="text-muted-light text-sm mb-4">{category} · Quick Match</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary-light animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary-light animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary-light animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <Button variant="ghost" className="w-full" onClick={onClose}>Cancel</Button>
        </motion.div>
      </div>
    );
  }

  // Matched animation
  if (phase === "matched") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center mx-auto mb-4 border-4 border-primary-light/30"
          >
            <Swords className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-2xl font-black text-white mb-1">Match Found!</h2>
          <p className="text-muted-light text-sm">Get ready to battle</p>
        </motion.div>
      </div>
    );
  }

  // Error / Cancelled
  if (phase === "cancelled") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#0e1220] border border-white/10 rounded-2xl p-8 max-w-md text-center"
        >
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Match Cancelled</h3>
          <p className="text-muted-light mb-6">{error || "Could not complete the match"}</p>
          <Button variant="primary" onClick={onClose}>Close</Button>
        </motion.div>
      </div>
    );
  }

  // Finished / Results
  if (phase === "finished" && result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg mx-4"
        >
          <div className="bg-[#0e1220] border border-white/10 rounded-2xl overflow-hidden">
            <div className={cn(
              "h-2 w-full",
              result.isWinner ? "bg-gradient-to-r from-amber-400 to-accent-orange" : "bg-gradient-to-r from-muted to-white/10",
            )} />
            <div className="p-8 text-center">
              {result.isWinner ? (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/30 to-accent-orange/30 flex items-center justify-center mx-auto mb-4 border-2 border-amber-400/30">
                  <Trophy className="w-10 h-10 text-amber-400" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border-2 border-white/10">
                  <Swords className="w-10 h-10 text-muted-light" />
                </div>
              )}

              <h2 className="text-2xl font-black text-white mb-1">
                {result.isWinner ? "Victory!" : "Defeat"}
              </h2>
              <p className="text-muted-light text-sm mb-2 capitalize">{category} Duel</p>

              {/* Score Comparison */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-black text-white">{result.p1Score}</p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider">You</p>
                </div>
                <div className="text-2xl font-black text-muted">VS</div>
                <div className="text-center">
                  <p className="text-3xl font-black text-white">{result.p2Score}</p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider">Opponent</p>
                </div>
              </div>

              {/* Rewards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <Zap className="w-5 h-5 text-accent-orange mx-auto mb-1" />
                  <p className="text-xl font-black text-white">+{result.xpReward}</p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider">XP</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-xl font-black text-white">+{result.coinReward}</p>
                  <p className="text-[10px] text-muted-light uppercase tracking-wider">TX Coins</p>
                </div>
              </div>

              {/* Answer Summary */}
              <div className="space-y-2 mb-6">
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
              </div>

              <Button variant="primary" className="w-full" glow onClick={onClose}>
                <Swords className="w-4 h-4" /> Back to Arena
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Playing
  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-10 h-10 text-primary-light animate-spin mx-auto mb-4" />
          <p className="text-white font-bold text-lg">Loading challenge...</p>
        </motion.div>
      </div>
    );
  }

  const progress = totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070b16]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/10 bg-[#0e1220]">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-muted-light hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-primary-light" />
              <h2 className="text-sm font-bold text-white capitalize">{category} Duel</h2>
            </div>
            <p className="text-[10px] text-muted-light">Question {currentIndex + 1} of {totalQuestions}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Score display */}
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
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-500"
          style={{ width: `${progress + (answered ? 100 / totalQuestions : 0)}%` }}
        />
      </div>

      {/* Question Area */}
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

              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
                {currentQuestion.data.question}
              </h3>

              {currentQuestion.data.code && (
                <pre className="bg-black/60 border border-white/10 rounded-xl p-4 mb-6 text-sm font-mono text-green-400 overflow-x-auto">
                  <code>{currentQuestion.data.code}</code>
                </pre>
              )}

              {currentQuestion.type === "multiple_choice" && (
                <div className="space-y-2 mt-6">
                  {currentQuestion.data.options?.map((opt, i) => {
                    const isSelected = selectedAnswer === opt;
                    const showCorrect = answered && currentQuestion.correctAnswer === opt;
                    const showWrong = answered && isSelected && !showCorrect;

                    return (
                      <button
                        key={i}
                        onClick={() => !answered && setSelectedAnswer(opt)}
                        disabled={answered}
                        className={cn(
                          "w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 cursor-pointer",
                          "flex items-center gap-3",
                          answered
                            ? showCorrect
                              ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                              : showWrong
                                ? "border-red-500/40 bg-red-500/10 text-red-400"
                                : "border-white/5 bg-white/[0.02] text-muted-light"
                            : isSelected
                              ? "border-primary/50 bg-primary/15 text-white"
                              : "border-white/10 bg-white/[0.03] text-muted-light hover:border-white/20 hover:bg-white/[0.05] hover:text-white",
                        )}
                      >
                        <span className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                          answered && showCorrect ? "bg-accent-green/20 text-accent-green" :
                          answered && showWrong ? "bg-red-500/20 text-red-400" :
                          isSelected ? "bg-primary/20 text-primary-light" : "bg-white/5 text-muted",
                        )}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm font-medium">{opt}</span>
                        {answered && showCorrect && <Check className="w-4 h-4 ml-auto shrink-0" />}
                        {answered && showWrong && <X className="w-4 h-4 ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === "written" && (
                <div className="mt-6">
                  <textarea
                    value={answered ? answers[currentQuestion.id]?.answer ?? "" : writtenAnswer}
                    onChange={(e) => !answered && setWrittenAnswer(e.target.value)}
                    disabled={answered}
                    placeholder="Type your answer..."
                    className="w-full h-40 rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>
              )}

              {currentQuestion.type === "coding_challenge" && (
                <div className="mt-6">
                  <textarea
                    value={answered ? answers[currentQuestion.id]?.answer ?? "" : selectedAnswer}
                    onChange={(e) => !answered && setSelectedAnswer(e.target.value)}
                    disabled={answered}
                    placeholder="Write your solution..."
                    className="w-full h-48 rounded-xl bg-black/80 border border-white/10 px-4 py-3 text-sm font-mono text-green-400 placeholder:text-muted focus:outline-none focus:border-primary/50 resize-none"
                    spellCheck={false}
                  />
                </div>
              )}

              {answered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
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
            <span>Correct: {correctCount}/{Object.keys(answers).length}</span>
          </div>
          <div className="flex items-center gap-2">
            {!answered && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip
              </Button>
            )}
            {!answered ? (
              <Button
                variant="primary"
                size="sm"
                glow
                onClick={handleSubmitAnswer}
                disabled={
                  submitting ||
                  (currentQuestion.type === "multiple_choice" && !selectedAnswer) ||
                  (currentQuestion.type === "written" && !writtenAnswer) ||
                  (currentQuestion.type === "coding_challenge" && !selectedAnswer)
                }
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {submitting ? "Submitting..." : "Submit Answer"}
              </Button>
            ) : (
              <Button variant="primary" size="sm" glow onClick={() => {
                if (currentIndex >= totalQuestions - 1) {
                  handleFinish();
                } else {
                  setCurrentIndex((i) => i + 1);
                }
              }}>
                {currentIndex >= totalQuestions - 1 ? (
                  <><Trophy className="w-4 h-4" /> Finish</>
                ) : (
                  <>Next <ChevronRightIcon className="w-4 h-4" /></>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

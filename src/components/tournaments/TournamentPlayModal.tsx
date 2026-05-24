"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Clock, Check, X, ChevronRight, Loader2, Zap,
  Star, Coins, ArrowLeft, AlertTriangle, Swords,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { enterTournament, submitTournamentAnswer, finishTournament } from "@/actions/tournaments";
import type { Tournament, TournamentQuestion } from "@/lib/types";

interface AnswerRecord {
  answer: string;
  correct: boolean;
  points: number;
}

interface ResultData {
  rank: number;
  score: number;
  xpReward: number;
  coinReward: number;
  leveledUp: boolean;
}

type PlayPhase = "loading" | "playing" | "error" | "finished";

export function TournamentPlayModal({
  tournament,
  onClose,
}: {
  tournament: Tournament;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<PlayPhase>("loading");
  const [questions, setQuestions] = useState<TournamentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishRef = useRef(false);
  const mountedRef = useRef(true);
  const nextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TOTAL_TIME = Math.min(
    Math.max(60, Math.floor((new Date(tournament.end_at).getTime() - new Date(tournament.start_at).getTime()) / 1000)),
    600,
  );

  useEffect(() => {
    mountedRef.current = true;
    const load = async () => {
      try {
        const data = await enterTournament(tournament.id);
        if (!mountedRef.current) return;
        setQuestions(data.questions);
        setTimeLeft(TOTAL_TIME);
        setPhase("playing");
      } catch (e) {
        if (!mountedRef.current) return;
        setError(e instanceof Error ? e.message : "Failed to enter tournament");
        setPhase("error");
      }
    };
    load();
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
    };
  }, [tournament.id, TOTAL_TIME]);

  const handleFinish = useCallback(async () => {
    if (finishRef.current) return;
    finishRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await finishTournament(tournament.id);
      if (mountedRef.current) {
        setResult(res);
        setPhase("finished");
      }
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : "Failed to finish");
        setPhase("error");
      }
    }
  }, [tournament.id]);

  // Timer countdown — stable interval, no timeLeft dep
  useEffect(() => {
    if (phase !== "playing" || finishRef.current) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Auto-finish when timer expires
  useEffect(() => {
    if (phase === "playing" && timeLeft <= 0 && questions.length > 0 && !finishRef.current) {
      handleFinish();
    }
  }, [timeLeft, phase, handleFinish, questions.length]);

  // Auto-finish when all questions answered
  useEffect(() => {
    if (phase === "playing" && questions.length > 0 && currentIndex >= questions.length && !finishRef.current) {
      handleFinish();
    }
  }, [currentIndex, questions.length, phase, handleFinish]);

  const currentQuestion = questions[currentIndex];
  const answered = currentQuestion ? answers[currentQuestion.id] !== undefined : false;
  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;
  const correctCount = Object.values(answers).filter((a) => a.correct).length;
  const totalAnswered = Object.keys(answers).length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const qData = currentQuestion?.data as Record<string, unknown> | undefined;
  const questionText = qData?.question != null ? String(qData.question) : "";
  const questionCode = qData?.code != null ? String(qData.code) : undefined;
  const questionOptions = qData?.options as string[] | undefined;
  const correctAnswer = qData?.correctAnswer != null ? String(qData.correctAnswer) : undefined;

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion || submitting || finishRef.current) return;

    const answer = currentQuestion.type === "written" ? writtenAnswer : selectedAnswer;
    if (!answer && currentQuestion.type !== "coding_challenge") return;

    setSubmitting(true);
    try {
      const res = await submitTournamentAnswer(tournament.id, currentQuestion.id, answer);
      if (!mountedRef.current) return;

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: { answer, correct: res.correct, points: res.points },
      }));
      setScore((prev) => prev + res.points);
      setSelectedAnswer("");
      setWrittenAnswer("");

      nextTimeoutRef.current = setTimeout(() => {
        if (!mountedRef.current || finishRef.current) return;
        if (currentIndex >= questions.length - 1) {
          handleFinish();
        } else {
          setCurrentIndex((i) => i + 1);
        }
      }, 800);
    } catch (e) {
      console.error("Submit failed:", e);
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }, [currentQuestion, submitting, selectedAnswer, writtenAnswer, tournament.id, questions.length, currentIndex, handleFinish]);

  const handleNext = useCallback(() => {
    if (finishRef.current) return;
    if (currentIndex >= questions.length - 1) {
      handleFinish();
      return;
    }
    setCurrentIndex((i) => i + 1);
  }, [questions.length, currentIndex, handleFinish]);

  const handleSkip = useCallback(() => {
    if (!currentQuestion || finishRef.current) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { answer: "", correct: false, points: 0 },
    }));
    handleNext();
  }, [currentQuestion, handleNext]);

  // Loading phase
  if (phase === "loading") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <Loader2 className="w-10 h-10 text-primary-light animate-spin mx-auto mb-4" />
          <p className="text-white font-bold text-lg">Entering Tournament...</p>
          <p className="text-muted-light text-sm mt-1">Loading questions</p>
        </motion.div>
      </div>
    );
  }

  // Error phase
  if (phase === "error") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-[#0e1220] border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Error</h3>
          <p className="text-muted-light mb-6">{error || "An error occurred"}</p>
          <Button variant="primary" onClick={onClose}>Close</Button>
        </motion.div>
      </div>
    );
  }

  // Finished / Results
  if (phase === "finished") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm overflow-y-auto">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg mx-4">
          <div className="bg-[#0e1220] border border-white/10 rounded-2xl overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-primary via-accent-pink to-amber-400" />
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/30 to-primary/30 flex items-center justify-center mx-auto mb-4 border-2 border-amber-400/30">
                <Trophy className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Tournament Complete!</h2>
              <p className="text-muted-light text-sm mb-2">{tournament.title}</p>

              {result ? (
                <>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary-light text-sm font-bold mb-6">
                    #{result.rank} Place · {result.score.toLocaleString()} pts
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <Zap className="w-5 h-5 text-accent-orange mx-auto mb-1" />
                      <p className="text-xl font-black text-white">+{result.xpReward}</p>
                      <p className="text-[10px] text-muted-light uppercase tracking-wider">XP Earned</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                      <p className="text-xl font-black text-white">+{result.coinReward}</p>
                      <p className="text-[10px] text-muted-light uppercase tracking-wider">TX Coins</p>
                    </div>
                  </div>
                  {result.leveledUp && (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent-green/15 border border-accent-green/20 text-accent-green text-sm font-bold mb-4">
                      <Star className="w-4 h-4" /> LEVEL UP!
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-light mb-6">Results are being calculated...</p>
              )}

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
                <Trophy className="w-4 h-4" /> Back to Tournaments
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Playing — no questions available
  if (!currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-light animate-spin mx-auto mb-4" />
          <p className="text-white font-bold text-lg">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070b16]">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/10 bg-[#0e1220]">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-muted-light hover:text-white cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white">{tournament.title}</h2>
            <p className="text-[10px] text-muted-light">Question {currentIndex + 1} of {questions.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white tabular-nums">{score.toLocaleString()}</span>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold tabular-nums",
            timeLeft < 30 ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/5 text-white border border-white/10",
          )}>
            <Clock className="w-4 h-4" />
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
      </div>

      <div className="h-1 bg-white/5">
        <div className="h-full bg-gradient-to-r from-primary to-accent-pink transition-all duration-500"
          style={{ width: `${progress + (answered ? 100 / questions.length : 0)}%` }} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="primary" size="sm">{String(currentQuestion.type).replace("_", " ").toUpperCase()}</Badge>
                <span className="text-xs text-muted-light">{currentQuestion.points} pts</span>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">{questionText}</h3>

              {questionCode && (
                <pre className="bg-black/60 border border-white/10 rounded-xl p-4 mb-6 text-sm font-mono text-green-400 overflow-x-auto">
                  <code>{questionCode}</code>
                </pre>
              )}

              {currentQuestion.type === "multiple_choice" && questionOptions && (
                <div className="space-y-2 mt-6">
                  {questionOptions.map((opt, i) => {
                    const isSelected = selectedAnswer === opt;
                    const showCorrect = answered && correctAnswer === opt;
                    const showWrong = answered && isSelected && !showCorrect;
                    return (
                      <button key={i}
                        onClick={() => !answered && setSelectedAnswer(opt)}
                        disabled={answered}
                        className={cn(
                          "w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-3",
                          answered
                            ? showCorrect ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                              : showWrong ? "border-red-500/40 bg-red-500/10 text-red-400"
                              : "border-white/5 bg-white/[0.02] text-muted-light"
                            : isSelected ? "border-primary/50 bg-primary/15 text-white"
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
                  <textarea value={answered ? (answers[currentQuestion.id]?.answer ?? "") : writtenAnswer}
                    onChange={(e) => !answered && setWrittenAnswer(e.target.value)}
                    disabled={answered}
                    placeholder="Type your answer..."
                    className="w-full h-40 rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>
              )}

              {currentQuestion.type === "coding_challenge" && (
                <div className="mt-6">
                  <textarea value={answered ? (answers[currentQuestion.id]?.answer ?? "") : selectedAnswer}
                    onChange={(e) => !answered && setSelectedAnswer(e.target.value)}
                    disabled={answered}
                    placeholder="Write your solution..."
                    className="w-full h-48 rounded-xl bg-black/80 border border-white/10 px-4 py-3 text-sm font-mono text-green-400 placeholder:text-muted focus:outline-none focus:border-primary/50 resize-none"
                    spellCheck={false}
                  />
                </div>
              )}

              {answered && (
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

      <div className="border-t border-white/10 bg-[#0e1220] px-4 md:px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-light">
            <span>Answered: {totalAnswered}/{questions.length}</span>
            <span>Correct: {correctCount}</span>
          </div>
          <div className="flex items-center gap-2">
            {!answered && currentQuestion.type !== "written" && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>Skip</Button>
            )}
            {!answered ? (
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
                {currentIndex >= questions.length - 1 ? (
                  <><Trophy className="w-4 h-4" /> Finish</>
                ) : (
                  <><ChevronRight className="w-4 h-4" /> Next</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

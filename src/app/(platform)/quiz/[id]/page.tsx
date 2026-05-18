"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { quizData } from "@/lib/mock-data";
import { Zap, Clock, CheckCircle, XCircle, Trophy, ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quizData.timeLimit);
  const [isFinished, setIsFinished] = useState(false);

  const finishQuiz = useCallback(() => {
    setIsFinished(true);
    setShowResult(true);
  }, []);

  useEffect(() => {
    if (isFinished || timeLeft <= 0) { if (timeLeft <= 0) finishQuiz(); return; }
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, isFinished, finishQuiz]);

  const question = quizData.questions[current];
  const correctCount = answers.filter((a, i) => a === quizData.questions[i].correctIndex).length;
  const score = Math.round((correctCount / quizData.questions.length) * 100);
  const passed = score >= quizData.passingScore;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (current < quizData.questions.length - 1) {
        setCurrent(current + 1);
        setSelected(null);
      } else {
        finishQuiz();
      }
    }, 1500);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const urgency = timeLeft < 30;

  if (showResult) {
    return (
      <div className="p-4 md:p-6 max-w-xl mx-auto flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 15 }} className="w-full">
          <Card hover={false} className="text-center space-y-6 !p-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
              className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${passed ? "bg-accent-green/15 neon-glow" : "bg-accent-red/15"}`}
              style={passed ? { boxShadow: "0 0 40px rgba(16,185,129,0.3)" } : {}}>
              {passed ? <Trophy className="w-12 h-12 text-accent-green" /> : <XCircle className="w-12 h-12 text-accent-red" />}
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold">{passed ? "🎉 Awesome!" : "Keep Trying!"}</h1>
              <p className="text-muted-light mt-2">{passed ? "You passed the quiz!" : "You need 60% to pass."}</p>
            </div>
            <div className="text-6xl font-bold gradient-text">{score}%</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-xl p-3"><div className="text-lg font-bold text-accent-green">{correctCount}</div><div className="text-xs text-muted">Correct</div></div>
              <div className="glass rounded-xl p-3"><div className="text-lg font-bold text-accent-red">{quizData.questions.length - correctCount}</div><div className="text-xs text-muted">Wrong</div></div>
              <div className="glass rounded-xl p-3"><div className="text-lg font-bold text-primary-light">+{passed ? quizData.xpReward : Math.floor(quizData.xpReward * 0.3)}</div><div className="text-xs text-muted">XP</div></div>
            </div>

            {/* Review */}
            <div className="space-y-2 text-left">
              {quizData.questions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.correctIndex;
                return (
                  <div key={q.id} className={`flex items-start gap-3 p-3 rounded-xl ${isCorrect ? "bg-accent-green/5 border border-accent-green/10" : "bg-accent-red/5 border border-accent-red/10"}`}>
                    {isCorrect ? <CheckCircle className="w-5 h-5 text-accent-green shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-accent-red shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{q.text}</div>
                      {!isCorrect && <div className="text-xs text-accent-green mt-1">Correct: {q.options[q.correctIndex]}</div>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setCurrent(0); setSelected(null); setAnswers([]); setShowResult(false); setIsFinished(false); setTimeLeft(quizData.timeLimit); }}>
                <RotateCcw className="w-4 h-4" /> Retry
              </Button>
              <Link href="/courses"><Button>Continue <ArrowRight className="w-4 h-4" /></Button></Link>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{quizData.title}</h1>
          <p className="text-sm text-muted">Question {current + 1} of {quizData.questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-mono font-bold ${urgency ? "bg-accent-red/10 border-accent-red/30 text-accent-red animate-pulse" : "glass border-white/10 text-foreground"}`}>
          <Clock className="w-4 h-4" /> {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
      </div>

      <Progress value={current + 1} max={quizData.questions.length} size="sm" />

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
          <Card hover={false} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary-light font-bold">{current + 1}</div>
              <h2 className="text-lg font-semibold flex-1">{question.text}</h2>
            </div>

            <div className="space-y-3">
              {question.options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = i === question.correctIndex;
                const showFeedback = selected !== null;

                return (
                  <motion.button key={i} whileHover={!showFeedback ? { scale: 1.01 } : {}} whileTap={!showFeedback ? { scale: 0.99 } : {}}
                    onClick={() => handleSelect(i)}
                    disabled={showFeedback}
                    className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all cursor-pointer disabled:cursor-default ${
                      showFeedback
                        ? isCorrect
                          ? "bg-accent-green/15 border-accent-green/40 text-accent-green"
                          : isSelected
                            ? "bg-accent-red/15 border-accent-red/40 text-accent-red"
                            : "bg-white/3 border-white/5 text-muted"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        showFeedback && isCorrect ? "bg-accent-green/20" : showFeedback && isSelected ? "bg-accent-red/20" : "bg-white/10"
                      }`}>
                        {showFeedback && isCorrect ? <CheckCircle className="w-4 h-4" /> : showFeedback && isSelected ? <XCircle className="w-4 h-4" /> : String.fromCharCode(65 + i)}
                      </div>
                      {opt}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {selected !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4 text-sm">
                <p className="text-muted-light">{question.explanation}</p>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center">
        <Badge variant="primary" size="md"><Zap className="w-3 h-3" /> +{quizData.xpReward} XP reward</Badge>
      </div>
    </div>
  );
}

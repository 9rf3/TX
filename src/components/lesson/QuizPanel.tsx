"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Check, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GamePanel, PanelHeader, NeonButton } from "@/components/ui/GamePanel";

interface QuizQuestion {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

interface QuizPanelProps {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedOption: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  correctOption: string | null;
  onSelectOption: (option: string) => void;
  onNextQuestion: () => void;
  onSubmitAnswer: () => void;
}

const OPTION_KEYS = ["a", "b", "c", "d"] as const;
const OPTION_LABELS = { a: "A", b: "B", c: "C", d: "D" } as const;

export const QuizPanel = memo(function QuizPanel({
  questions,
  currentQuestionIndex,
  selectedOption,
  isAnswered,
  isCorrect,
  correctOption,
  onSelectOption,
  onNextQuestion,
  onSubmitAnswer,
}: QuizPanelProps) {
  const question = questions[currentQuestionIndex];
  if (!question) return null;

  const totalQuestions = questions.length;
  const questionNum = currentQuestionIndex + 1;

  const getOptionText = (key: string): string => {
    switch (key) {
      case "a": return question.option_a;
      case "b": return question.option_b;
      case "c": return question.option_c;
      case "d": return question.option_d;
      default: return "";
    }
  };

  const getOptionState = (key: string): "default" | "selected" | "correct" | "wrong" => {
    if (!isAnswered) {
      return selectedOption === key ? "selected" : "default";
    }
    if (key === correctOption) return "correct";
    if (key === selectedOption && !isCorrect) return "wrong";
    return "default";
  };

  const optionStyles = {
    default: "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8",
    selected: "border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]",
    correct: "border-accent-green/50 bg-accent-green/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    wrong: "border-accent-red/50 bg-accent-red/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
  };

  const labelStyles = {
    default: "border-white/15 bg-white/5 text-muted-light",
    selected: "border-primary/40 bg-primary/20 text-primary-light",
    correct: "border-accent-green/40 bg-accent-green/20 text-accent-green",
    wrong: "border-accent-red/40 bg-accent-red/20 text-accent-red",
  };

  return (
    <GamePanel className="p-5">
      <PanelHeader
        icon={<HelpCircle className="h-4 w-4" />}
        title="Quiz"
        action={
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-muted-light">
            {questionNum} / {totalQuestions}
          </span>
        }
      />

      {/* Progress dots */}
      <div className="mb-5 flex items-center gap-1.5">
        {questions.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              i < currentQuestionIndex
                ? "bg-accent-green"
                : i === currentQuestionIndex
                ? "bg-gradient-to-r from-primary to-secondary"
                : "bg-white/10"
            )}
          />
        ))}
      </div>

      {/* Question area with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Question text */}
          <div className="mb-5 rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-sm font-semibold leading-relaxed text-white">
              <span className="mr-2 text-primary-light">Q{questionNum}.</span>
              {question.question_text}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {OPTION_KEYS.map((key) => {
              const state = getOptionState(key);
              const isDisabled = isAnswered;

              return (
                <motion.button
                  key={key}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelectOption(key)}
                  className={cn(
                    "group/opt flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200",
                    optionStyles[state],
                    !isDisabled && "cursor-pointer"
                  )}
                  whileTap={!isDisabled ? { scale: 0.985 } : undefined}
                >
                  {/* Letter label */}
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-xs font-black transition-colors",
                      labelStyles[state]
                    )}
                  >
                    {state === "correct" ? (
                      <Check className="h-4 w-4" />
                    ) : state === "wrong" ? (
                      <X className="h-4 w-4" />
                    ) : (
                      OPTION_LABELS[key]
                    )}
                  </span>

                  {/* Option text */}
                  <span
                    className={cn(
                      "text-sm transition-colors",
                      state === "default" && "text-muted-light group-hover/opt:text-white",
                      state === "selected" && "text-white",
                      state === "correct" && "font-medium text-accent-green",
                      state === "wrong" && "text-accent-red"
                    )}
                  >
                    {getOptionText(key)}
                  </span>

                  {/* Indicator icons for answered state */}
                  {state === "correct" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-accent-green/20">
                        <Check className="h-3.5 w-3.5 text-accent-green" />
                      </div>
                    </motion.div>
                  )}
                  {state === "wrong" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto"
                    >
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-accent-red/20">
                        <X className="h-3.5 w-3.5 text-accent-red" />
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feedback message */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "mt-4 rounded-xl border p-3 text-center text-sm font-semibold",
                isCorrect
                  ? "border-accent-green/30 bg-accent-green/10 text-accent-green"
                  : "border-accent-red/30 bg-accent-red/10 text-accent-red"
              )}
            >
              {isCorrect ? "🎉 Correct! Great job!" : "❌ Not quite. The correct answer is highlighted above."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="mt-5">
        {!isAnswered && selectedOption && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <NeonButton onClick={onSubmitAnswer} className="w-full">
              Submit Answer
            </NeonButton>
          </motion.div>
        )}

        {isAnswered && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <NeonButton onClick={onNextQuestion} className="w-full">
              {questionNum < totalQuestions ? (
                <>
                  Next Question
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                "Finish Quiz"
              )}
            </NeonButton>
          </motion.div>
        )}
      </div>
    </GamePanel>
  );
});

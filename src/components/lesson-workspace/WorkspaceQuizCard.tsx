"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuizOption {
  key: "A" | "B" | "C" | "D";
  text: string;
}

interface WorkspaceQuizCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: QuizOption[];
  selected: QuizOption["key"] | null;
  correctOption?: QuizOption["key"] | null;
  isAnswered: boolean;
  onSelect: (key: QuizOption["key"]) => void;
  onNext: () => void;
}

export const WorkspaceQuizCard = memo(function WorkspaceQuizCard({
  questionNumber,
  totalQuestions,
  question,
  options,
  selected,
  correctOption,
  isAnswered,
  onSelect,
  onNext,
}: WorkspaceQuizCardProps) {
  const progressPct = Math.round((questionNumber / totalQuestions) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="gp-base flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#10182d]/85"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-accent-pink/25 bg-accent-pink/10 text-accent-pink">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="text-sm font-black uppercase tracking-[0.16em] text-white">
              Quiz
            </div>
            <div className="text-[10px] text-muted-light">
              Question {questionNumber} of {totalQuestions}
            </div>
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-light">
          {progressPct}% Complete
        </div>
      </div>

      {/* Question */}
      <div className="px-5 pt-5">
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-primary-light">
            Question
          </div>
          <p className="text-sm font-semibold leading-relaxed text-white sm:text-base">
            {question}
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 space-y-2.5 px-5 py-5">
        {options.map((opt) => {
          const isSelected = selected === opt.key;
          const isThisCorrect = isAnswered && correctOption === opt.key;
          const isThisWrong =
            isAnswered && isSelected && correctOption !== opt.key;

          return (
            <button
              key={opt.key}
              type="button"
              disabled={isAnswered}
              onClick={() => onSelect(opt.key)}
              className={cn(
                "group/opt flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200",
                !isAnswered && !isSelected && "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.07]",
                !isAnswered && isSelected && "border-primary/50 bg-primary/10 shadow-[0_0_18px_rgba(139,92,246,0.18)]",
                isThisCorrect && "border-accent-green/50 bg-accent-green/10",
                isThisWrong && "border-accent-red/50 bg-accent-red/10",
                isAnswered && !isSelected && !isThisCorrect && "border-white/5 bg-white/[0.02] opacity-60"
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-xs font-black transition-colors",
                  !isAnswered && !isSelected && "border-white/15 bg-white/[0.04] text-muted-light",
                  !isAnswered && isSelected && "border-primary/40 bg-primary/20 text-primary-light",
                  isThisCorrect && "border-accent-green/40 bg-accent-green/20 text-accent-green",
                  isThisWrong && "border-accent-red/40 bg-accent-red/20 text-accent-red"
                )}
              >
                {isThisCorrect ? (
                  <Check className="h-4 w-4" />
                ) : (
                  opt.key
                )}
              </span>
              <span
                className={cn(
                  "text-sm",
                  !isAnswered && !isSelected && "text-muted-light group-hover/opt:text-white",
                  !isAnswered && isSelected && "text-white",
                  isThisCorrect && "font-medium text-accent-green",
                  isThisWrong && "text-accent-red"
                )}
              >
                {opt.text}
              </span>
              {isThisCorrect && (
                <span className="ml-auto grid h-6 w-6 place-items-center rounded-full bg-accent-green/20">
                  <Check className="h-3.5 w-3.5 text-accent-green" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/8 bg-white/[0.02] px-5 py-3.5">
        <div className="text-[10px] text-muted-light">
          Select the best answer, then continue.
        </div>
        <button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-black transition-all",
            selected
              ? "border border-primary/35 bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_18px_rgba(139,92,246,0.3)] hover:brightness-110"
              : "cursor-not-allowed border border-white/10 bg-white/[0.04] text-muted"
          )}
        >
          Next Question
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
});

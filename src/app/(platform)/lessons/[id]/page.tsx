"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { VideoPlayer } from "@/components/lesson/VideoPlayer";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { LessonTabs } from "@/components/lesson/LessonTabs";
import { LessonFooter } from "@/components/lesson/LessonFooter";
import { QuizPanel } from "@/components/lesson/QuizPanel";
import { CourseProgressPanel } from "@/components/lesson/CourseProgressPanel";
import { QuizProgressPanel } from "@/components/lesson/QuizProgressPanel";
import { RewardsPanel } from "@/components/lesson/RewardsPanel";
import { NextLessonPanel } from "@/components/lesson/NextLessonPanel";
import { useAuth } from "@/components/providers/AuthProvider";
import { useGamificationEngine } from "@/lib/hooks/useGamificationEngine";
import {
  getLessonData,
  saveVideoProgress,
  submitQuizAnswer,
  completeQuiz,
  type LessonData,
} from "@/actions/lesson";

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: moduleId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { fetchProfile } = useGamificationEngine();

  const [data, setData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("quiz");
  const [watchedSeconds, setWatchedSeconds] = useState(0);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctOption, setCorrectOption] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalCorrectCount, setFinalCorrectCount] = useState(0);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!user) return;

    getLessonData(moduleId).then((lessonData) => {
      if (!mountedRef.current) return;
      setData(lessonData);
      if (lessonData.lessonProgress) {
        setWatchedSeconds(lessonData.lessonProgress.watched_seconds);
      }
    }).catch((err) => {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load lesson");
      }
    }).finally(() => {
      if (mountedRef.current) setLoading(false);
    });

    return () => { mountedRef.current = false; };
  }, [moduleId, user]);

  const handleVideoTimeUpdate = useCallback(async (seconds: number) => {
    setWatchedSeconds(seconds);
    try {
      await saveVideoProgress(moduleId, Math.round(seconds));
    } catch { /* non-critical */ }
  }, [moduleId]);

  const handleSelectOption = useCallback((option: string) => {
    if (!isAnswered) setSelectedOption(option);
  }, [isAnswered]);

  const handleSubmitAnswer = useCallback(async () => {
    if (!selectedOption || !data?.quiz) return;

    try {
      const question = data.quiz.questions[currentQuestionIndex];
      const result = await submitQuizAnswer(data.quiz.id, question.id, selectedOption);

      setIsAnswered(true);
      setIsCorrect(result.correct);
      setCorrectOption(result.correctOption);
      if (result.correct) setCorrectCount((prev) => prev + 1);
    } catch { /* handled silently */ }
  }, [selectedOption, data, currentQuestionIndex]);

  const handleNextQuestion = useCallback(async () => {
    if (!data?.quiz) return;

    if (currentQuestionIndex < data.quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(null);
      setCorrectOption(null);
    } else {
      // Quiz complete
      setQuizCompleted(true);
      setFinalCorrectCount(correctCount);
      try {
        await completeQuiz(
          data.quiz.id,
          correctCount,
          data.quiz.questions.length
        );
        await fetchProfile();
      } catch { /* non-critical */ }
    }
  }, [data, currentQuestionIndex, correctCount, fetchProfile]);

  const handleContinueLearning = useCallback(() => {
    if (data?.nextModule) {
      router.push(`/lessons/${data.nextModule.id}`);
    }
  }, [data, router]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary-light" />
          <p className="text-sm text-muted-light">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center p-4">
        <Card hover={false} className="max-w-md w-full text-center py-16">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted/30" />
          <h3 className="text-xl font-semibold text-foreground">Lesson Not Found</h3>
          <p className="mt-2 text-sm text-muted-light">{error || "This lesson is unavailable."}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-muted-light hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Courses
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary-light hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const { module, course, prevModule, nextModule, courseProgress, quiz, latestAttempt } = data;

  const courseProgressPercent = courseProgress?.progress_percentage ?? 0;
  const completedLessons = courseProgress?.completed_lessons ?? 0;
  const totalModules = data.totalModules;
  const timeSpentSeconds = courseProgress?.total_time_seconds ?? 0;
  const timeSpentFormatted = `${Math.floor(timeSpentSeconds / 3600)}h ${Math.floor((timeSpentSeconds % 3600) / 60)}m`;
  const totalTimeFormatted = "28h";

  const quizScorePercent = latestAttempt?.score_percentage ?? 0;
  const quizCorrect = latestAttempt?.correct_answers ?? 0;
  const quizTotal = latestAttempt?.total_questions ?? 5;
  const streakCount = 2;
  const quizXpEarned = latestAttempt?.xp_earned ?? 30;
  const lessonXpEarned = courseProgress?.xp_earned ?? 240;

  const videoProgress = watchedSeconds > 0 && module.duration > 0
    ? Math.round((watchedSeconds / module.duration) * 100)
    : 0;

  const moduleNumber = `${data.currentIndex + 1}`;

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Top bar */}
      <div className="px-6 pt-4 pb-2">
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-light hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Course
        </Link>
      </div>

      {/* Three-column layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 px-6 pb-6">
        {/* Main content */}
        <div className="flex flex-col gap-6 min-w-0">
          {/* Lesson Header */}
          <LessonHeader
            lessonNumber={moduleNumber}
            title={module.title}
            description={module.description ?? undefined}
            progressPercent={videoProgress}
            xpEarned={lessonXpEarned}
            onContinue={handleContinueLearning}
          />

          {/* Video Player */}
          <VideoPlayer
            videoUrl={module.video_url}
            duration={module.duration}
            currentTime={watchedSeconds}
            onTimeUpdate={handleVideoTimeUpdate}
          />

          {/* Tabs */}
          <LessonTabs activeTab={activeTab} onChange={setActiveTab} />

          {/* Tab content: Quiz */}
          {activeTab === "quiz" && quiz && !quizCompleted && (
            <QuizPanel
              questions={quiz.questions}
              currentQuestionIndex={currentQuestionIndex}
              selectedOption={selectedOption}
              isAnswered={isAnswered}
              isCorrect={isCorrect}
              correctOption={correctOption}
              onSelectOption={handleSelectOption}
              onNextQuestion={handleNextQuestion}
              onSubmitAnswer={handleSubmitAnswer}
            />
          )}

          {activeTab === "quiz" && quizCompleted && quiz && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.05] p-8 text-center"
            >
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-xl font-black text-white">Quiz Complete!</h3>
              <p className="mt-2 text-muted-light">
                You got <span className="font-bold text-accent-green">{finalCorrectCount}</span> /{" "}
                <span className="font-bold text-white">{quiz.questions.length}</span> correct
              </p>
            </motion.div>
          )}

          {activeTab === "lesson" && (
            <div className="rounded-2xl border border-white/10 bg-[#10182d]/50 p-6">
              <p className="text-sm leading-relaxed text-muted-light">
                {module.description || "No additional notes for this lesson."}
              </p>
            </div>
          )}

          {activeTab === "practice" && (
            <div className="rounded-2xl border border-white/10 bg-[#10182d]/50 p-8 text-center">
              <p className="text-sm text-muted-light">Practice mode coming soon.</p>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="rounded-2xl border border-white/10 bg-[#10182d]/50 p-8 text-center">
              <p className="text-sm text-muted-light">Notes feature coming soon.</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          <CourseProgressPanel
            progressPercent={courseProgressPercent}
            completedLessons={completedLessons}
            totalLessons={totalModules}
            timeSpent={timeSpentFormatted}
            totalTime={totalTimeFormatted}
            onViewCurriculum={() => router.push(`/courses/${course.id}`)}
          />

          <QuizProgressPanel
            scorePercent={quizScorePercent || 60}
            correctAnswers={quizCorrect || 3}
            totalQuestions={quizTotal || 5}
            streak={streakCount}
            pointsEarned={quizXpEarned || 30}
          />

          <RewardsPanel />

          {nextModule && (
            <NextLessonPanel
              lessonNumber={`${data.currentIndex + 2}`}
              title={nextModule.title}
              description={nextModule.description ?? ""}
              href={`/lessons/${nextModule.id}`}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <LessonFooter
        prevLesson={
          prevModule
            ? {
                number: `${data.currentIndex}`,
                title: prevModule.title,
                href: `/lessons/${prevModule.id}`,
              }
            : undefined
        }
        nextLesson={
          nextModule
            ? {
                number: `${data.currentIndex + 2}`,
                title: nextModule.title,
                href: `/lessons/${nextModule.id}`,
              }
            : undefined
        }
        progressPercent={courseProgressPercent}
      />
    </div>
  );
}

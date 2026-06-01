"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Loader2, AlertCircle, RefreshCw,
  BookOpen, Circle, PlayCircle,
} from "lucide-react";

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
  type LessonModule,
} from "@/actions/lesson";
import { createClient } from "@/utils/supabase/client";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const courseId = use(params).id;
  const { user } = useAuth();
  const { fetchProfile } = useGamificationEngine();

  const [courseTitle, setCourseTitle] = useState("");
  const [modules, setModules] = useState<LessonModule[]>([]);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [loadingCourse, setLoadingCourse] = useState(true);

  const [data, setData] = useState<LessonData | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(true);
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

  // Load course + modules metadata
  useEffect(() => {
    mountedRef.current = true;
    const supabase = createClient();

    Promise.all([
      supabase.from("courses").select("title").eq("id", courseId).single(),
      supabase.from("course_modules").select("*").eq("course_id", courseId).order("order_index", { ascending: true }),
    ]).then(([courseRes, modulesRes]) => {
      if (!mountedRef.current) return;
      if (courseRes.data) setCourseTitle(courseRes.data.title);
      setModules((modulesRes.data || []) as LessonModule[]);
    }).catch(() => {}).finally(() => {
      if (mountedRef.current) setLoadingCourse(false);
    });

    return () => { mountedRef.current = false; };
  }, [courseId]);

  const activeModuleId = modules[activeModuleIndex]?.id;

  // Load lesson data when active module changes
  useEffect(() => {
    if (!user || !activeModuleId) return;

    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setCorrectOption(null);
    setCorrectCount(0);
    setFinalCorrectCount(0);

    getLessonData(activeModuleId).then((lessonData) => {
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
      if (mountedRef.current) setLoadingLesson(false);
    });
  }, [user, activeModuleId]);

  const handleVideoTimeUpdate = useCallback(async (seconds: number) => {
    if (!activeModuleId) return;
    setWatchedSeconds(seconds);
    try { await saveVideoProgress(activeModuleId, Math.round(seconds)); } catch { /* non-critical */ }
  }, [activeModuleId]);

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
      setQuizCompleted(true);
      setFinalCorrectCount(correctCount);
      try {
        await completeQuiz(data.quiz.id, correctCount, data.quiz.questions.length);
        await fetchProfile();
      } catch { /* non-critical */ }
    }
  }, [data, currentQuestionIndex, correctCount, fetchProfile]);

  const goToModule = useCallback((index: number) => {
    if (index < 0 || index >= modules.length) return;
    setActiveModuleIndex(index);
    setWatchedSeconds(0);
  }, [modules.length]);

  if (loadingCourse) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary-light" />
          <p className="text-sm text-muted-light">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!courseTitle) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center p-4">
        <Card hover={false} className="max-w-md w-full text-center py-16">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted/30" />
          <h3 className="text-xl font-semibold text-foreground">Course Not Found</h3>
          <p className="mt-2 text-sm text-muted-light">This course does not exist or has been removed.</p>
          <div className="mt-6">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-muted-light hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Courses
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center p-4">
        <Card hover={false} className="max-w-md w-full text-center py-16">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted/30" />
          <h3 className="text-xl font-semibold text-foreground">Failed to Load</h3>
          <p className="mt-2 text-sm text-muted-light">{error}</p>
          <div className="mt-6">
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

  const prevModule = activeModuleIndex > 0 ? modules[activeModuleIndex - 1] : null;
  const nextModule = activeModuleIndex < modules.length - 1 ? modules[activeModuleIndex + 1] : null;

  const courseProgressPercent = data?.courseProgress?.progress_percentage ?? 0;
  const completedLessons = data?.courseProgress?.completed_lessons ?? 0;
  const totalModules = modules.length;
  const timeSpentSeconds = data?.courseProgress?.total_time_seconds ?? 0;
  const timeSpentFormatted = `${Math.floor(timeSpentSeconds / 3600)}h ${Math.floor((timeSpentSeconds % 3600) / 60)}m`;

  const latestAttempt = data?.latestAttempt;
  const quizScorePercent = latestAttempt?.score_percentage ?? 60;
  const quizCorrect = latestAttempt?.correct_answers ?? 3;
  const quizTotal = latestAttempt?.total_questions ?? 5;
  const quizXpEarned = latestAttempt?.xp_earned ?? 30;
  const lessonXpEarned = data?.courseProgress?.xp_earned ?? 240;

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2 gap-4">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-sm text-muted-light hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>

        {/* Module selector chips */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto max-w-[60%]">
          {modules.map((mod, i) => (
            <button
              key={mod.id}
              onClick={() => goToModule(i)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                i === activeModuleIndex
                  ? "bg-primary/15 text-primary-light border border-primary/30"
                  : "text-muted-light hover:text-foreground hover:bg-white/5 border border-transparent"
              }`}
            >
              {i === activeModuleIndex ? (
                <PlayCircle className="h-3 w-3" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
              {i + 1}. {mod.title.length > 20 ? mod.title.slice(0, 20) + "…" : mod.title}
            </button>
          ))}
        </div>

        <div className="text-sm font-medium text-muted-light shrink-0">
          {courseTitle}
        </div>
      </div>

      {loadingLesson ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary-light" />
            <p className="text-xs text-muted-light">Loading lesson...</p>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Three-column layout */}
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 px-6 pb-6">
            {/* Main content */}
            <div className="flex flex-col gap-6 min-w-0">
              {/* Lesson Header */}
              <LessonHeader
                lessonNumber={`${activeModuleIndex + 1}`}
                title={data.module.title}
                description={data.module.description ?? undefined}
                progressPercent={
                  watchedSeconds > 0 && data.module.duration > 0
                    ? Math.round((watchedSeconds / data.module.duration) * 100)
                    : 0
                }
                xpEarned={lessonXpEarned}
                onContinue={() => nextModule && goToModule(activeModuleIndex + 1)}
              />

              {/* Video Player */}
              <VideoPlayer
                videoUrl={data.module.video_url}
                duration={data.module.duration}
                currentTime={watchedSeconds}
                onTimeUpdate={handleVideoTimeUpdate}
              />

              {/* Tabs */}
              <LessonTabs activeTab={activeTab} onChange={setActiveTab} />

              {/* Quiz tab */}
              {activeTab === "quiz" && data.quiz && !quizCompleted && (
                <QuizPanel
                  questions={data.quiz.questions}
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

              {activeTab === "quiz" && quizCompleted && data.quiz && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.05] p-8 text-center"
                >
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-xl font-black text-white">Quiz Complete!</h3>
                  <p className="mt-2 text-muted-light">
                    You got <span className="font-bold text-accent-green">{finalCorrectCount}</span> /{" "}
                    <span className="font-bold text-white">{data.quiz.questions.length}</span> correct
                  </p>
                </motion.div>
              )}

              {activeTab === "lesson" && (
                <div className="rounded-2xl border border-white/10 bg-[#10182d]/50 p-6">
                  <p className="text-sm leading-relaxed text-muted-light">
                    {data.module.description || "No additional notes for this lesson."}
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
                totalTime={`${Math.round(modules.reduce((acc, m) => acc + m.duration, 0) / 60)}h`}
                onViewCurriculum={() => {/* scroll to module list */}}
              />

              <QuizProgressPanel
                scorePercent={quizScorePercent}
                correctAnswers={quizCorrect}
                totalQuestions={quizTotal}
                streak={2}
                pointsEarned={quizXpEarned}
              />

              <RewardsPanel />

              {nextModule && (
                <NextLessonPanel
                  lessonNumber={`${activeModuleIndex + 2}`}
                  title={nextModule.title}
                  description={nextModule.description ?? ""}
                  onClick={() => goToModule(activeModuleIndex + 1)}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <LessonFooter
            prevLesson={
              prevModule
                ? {
                    number: `${activeModuleIndex}`,
                    title: prevModule.title,
                    onClick: () => goToModule(activeModuleIndex - 1),
                  }
                : undefined
            }
            nextLesson={
              nextModule
                ? {
                    number: `${activeModuleIndex + 2}`,
                    title: nextModule.title,
                    onClick: () => goToModule(activeModuleIndex + 1),
                  }
                : undefined
            }
            progressPercent={courseProgressPercent}
          />
        </>
      ) : null}
    </div>
  );
}

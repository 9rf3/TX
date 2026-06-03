"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BookOpen, Code2, HelpCircle, FileText, AlertCircle, RefreshCw, Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { useGamificationEngine } from "@/lib/hooks/useGamificationEngine";
import {
  getLessonData,
  type LessonData,
} from "@/actions/lesson";

import { WorkspaceTopBar } from "@/components/lesson-workspace/WorkspaceTopBar";
import { WorkspaceVideoCard } from "@/components/lesson-workspace/WorkspaceVideoCard";
import { WorkspaceLessonHeader } from "@/components/lesson-workspace/WorkspaceLessonHeader";
import { WorkspaceTabs, type WorkspaceTab } from "@/components/lesson-workspace/WorkspaceTabs";
import { WorkspaceQuizCard, type QuizOption } from "@/components/lesson-workspace/WorkspaceQuizCard";
import { WorkspaceQuizSidebar } from "@/components/lesson-workspace/WorkspaceQuizSidebar";
import { WorkspaceCourseProgressCard } from "@/components/lesson-workspace/WorkspaceCourseProgressCard";
import { WorkspaceRewardsCard } from "@/components/lesson-workspace/WorkspaceRewardsCard";
import { WorkspaceNextLessonCard } from "@/components/lesson-workspace/WorkspaceNextLessonCard";
import { WorkspaceBottomNav } from "@/components/lesson-workspace/WorkspaceBottomNav";

const WORKSPACE_TABS: WorkspaceTab[] = [
  { id: "lesson", label: "Lesson", icon: <BookOpen className="h-4 w-4" /> },
  { id: "practice", label: "Practice", icon: <Code2 className="h-4 w-4" /> },
  { id: "quiz", label: "Quiz", icon: <HelpCircle className="h-4 w-4" /> },
  { id: "notes", label: "Notes", icon: <FileText className="h-4 w-4" /> },
];

const MOCK_QUIZ: {
  question: string;
  options: QuizOption[];
  correct: QuizOption["key"];
} = {
  question:
    "Which of the following best describes a React component?",
  options: [
    { key: "A", text: "A JavaScript function that returns HTML markup (JSX) to be rendered to the DOM." },
    { key: "B", text: "A CSS class that styles a portion of the user interface." },
    { key: "C", text: "A database query that loads UI data on demand." },
    { key: "D", text: "An HTTP endpoint that returns React markup as a string." },
  ],
  correct: "A",
};

export default function LessonWorkspacePage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id: courseId, lessonId } = use(params);
  const router = useRouter();
  const { user, profile } = useAuth();
  const { profile: gProfile } = useGamificationEngine();

  const [data, setData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("quiz");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(320); // 05:20
  const [duration] = useState(765); // 12:45

  // Quiz state
  const [selectedOption, setSelectedOption] = useState<QuizOption["key"] | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(3);
  const [questionNumber, setQuestionNumber] = useState(4);
  const totalQuestions = 5;

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!user) return;
    getLessonData(lessonId)
      .then((lessonData) => {
        if (mountedRef.current) setData(lessonData);
      })
      .catch((err) => {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : "Failed to load lesson");
        }
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });
    return () => {
      mountedRef.current = false;
    };
  }, [lessonId, user]);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => {
      const next = !p;
      if (next) {
        // simple simulation: advance time when playing
        const id = setInterval(() => {
          setCurrentTime((t) => (t < duration ? t + 1 : duration));
        }, 1000);
        (window as unknown as { __lessonInterval?: ReturnType<typeof setInterval> }).__lessonInterval = id;
      } else {
        const id = (window as unknown as { __lessonInterval?: ReturnType<typeof setInterval> }).__lessonInterval;
        if (id) clearInterval(id);
      }
      return next;
    });
  }, [duration]);

  useEffect(() => {
    return () => {
      const id = (window as unknown as { __lessonInterval?: ReturnType<typeof setInterval> }).__lessonInterval;
      if (id) clearInterval(id);
    };
  }, []);

  const handleSelectOption = useCallback(
    (key: QuizOption["key"]) => {
      if (isAnswered) return;
      setSelectedOption(key);
    },
    [isAnswered]
  );

  const handleNextQuestion = useCallback(() => {
    if (!isAnswered) {
      // Submitting
      setIsAnswered(true);
      if (selectedOption === MOCK_QUIZ.correct) {
        setCorrectCount((c) => c + 1);
      }
      return;
    }
    if (questionNumber < totalQuestions) {
      setQuestionNumber((n) => n + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  }, [isAnswered, selectedOption, questionNumber, totalQuestions]);

  const handleContinue = useCallback(() => {
    router.push(`/courses/${courseId}/lessons/${lessonId}/next`);
  }, [router, courseId, lessonId]);

  // ─── Derived values with mock fallbacks ─────────────────────────────────
  const lessonTitle =
    data?.module?.title ?? "Your First React Component";
  const lessonNumber = data ? `${(data.currentIndex ?? 0) + 1}` : "1.3";
  const lessonDescription = data?.module?.description ?? undefined;
  const lessonXp = data?.courseProgress?.xp_earned ?? 240;
  const watched = data?.lessonProgress?.watched_seconds ?? currentTime;
  const videoProgress =
    duration > 0 ? Math.round((watched / duration) * 100) : 0;

  const courseProgressPct = data?.courseProgress?.progress_percentage ?? 65;
  const completedLessons = data?.courseProgress?.completed_lessons ?? 42;
  const totalLessons = data?.totalModules ?? 65;
  const timeSpentSeconds = data?.courseProgress?.total_time_seconds ?? 18 * 3600 + 45 * 60;
  const timeSpent = `${Math.floor(timeSpentSeconds / 3600)}h ${Math.floor(
    (timeSpentSeconds % 3600) / 60
  )
    .toString()
    .padStart(2, "0")}m`;
  const totalTime = "28h 00m";

  const xp = gProfile?.xp ?? 2450;
  const coins = gProfile?.tx_coins ?? 507;
  const streak = gProfile?.current_streak ?? 2;
  const level = gProfile?.level ?? 7;

  const nextLessonTitle = data?.nextModule?.title ?? "JSX Explained";
  const nextLessonNumber = data ? `${(data.currentIndex ?? 0) + 2}` : "1.4";
  const prevLessonTitle = data?.prevModule?.title ?? "Setting Up the Environment";
  const prevLessonNumber = data ? `${data.currentIndex ?? 1}` : "1.2";

  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  const renderErrorState = () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="gp-base w-full max-w-md rounded-2xl border border-white/10 bg-[#10182d]/85 p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted/40" />
        <h3 className="text-xl font-black text-white">Lesson not loaded</h3>
        <p className="mt-2 text-sm text-muted-light">
          {error ?? "We couldn't fetch the lesson content. Showing demo data instead."}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary-light transition-colors hover:bg-primary/20"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-full flex-col">
      <WorkspaceTopBar
        courseHref={`/courses/${courseId}`}
        xp={xp}
        coins={coins}
        streak={streak}
        level={level}
        user={{
          name: profile?.full_name ?? null,
          email: user?.email ?? null,
          avatarUrl: profile?.avatar_url ?? null,
        }}
      />

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary-light" />
            <p className="text-xs text-muted-light">Loading workspace…</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 px-4 pb-6 pt-4 md:px-6 md:pt-6">
          {error && (
            <div className="mb-4">
              {renderErrorState()}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
            {/* ─── Main Content Workspace ─────────────────────────────── */}
            <div className="flex min-w-0 flex-col gap-5">
              {/* Row 1: Video + Quick Progress */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
                <WorkspaceVideoCard
                  title={`Lesson ${lessonNumber}`}
                  currentTime={currentTime}
                  duration={duration}
                  isPlaying={isPlaying}
                  onTogglePlay={togglePlay}
                />
                <WorkspaceLessonHeader
                  lessonNumber={lessonNumber}
                  title={lessonTitle}
                  description={lessonDescription}
                  progressPercent={videoProgress || 65}
                  xpEarned={lessonXp}
                  durationLabel="12:45"
                  onContinue={handleContinue}
                />
              </div>

              {/* Row 2: Tabs + content */}
              <div className="flex flex-col gap-4">
                <WorkspaceTabs
                  tabs={WORKSPACE_TABS}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />

                {activeTab === "quiz" && (
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
                    <WorkspaceQuizCard
                      questionNumber={questionNumber}
                      totalQuestions={totalQuestions}
                      question={MOCK_QUIZ.question}
                      options={MOCK_QUIZ.options}
                      selected={selectedOption}
                      correctOption={
                        isAnswered ? MOCK_QUIZ.correct : null
                      }
                      isAnswered={isAnswered}
                      onSelect={handleSelectOption}
                      onNext={handleNextQuestion}
                    />
                    <WorkspaceQuizSidebar
                      scorePercent={scorePercent}
                      correctAnswers={correctCount}
                      totalQuestions={totalQuestions}
                      streak={streak}
                      points={30}
                    />
                  </div>
                )}

                {activeTab === "lesson" && (
                  <LessonPane
                    title="Lesson notes"
                    body={
                      lessonDescription ??
                      "In this lesson you'll learn the fundamentals of building a React component — from function signatures to JSX syntax. Follow along with the video and complete the quiz to earn XP."
                    }
                  />
                )}

                {activeTab === "practice" && (
                  <LessonPane
                    title="Practice exercises"
                    body="Hands-on coding challenges for this lesson are coming soon. Stay on the lookout for new practice sets released every week."
                    placeholder
                  />
                )}

                {activeTab === "notes" && (
                  <LessonPane
                    title="Your notes"
                    body="Take notes while you watch. Your notes are saved per lesson and are searchable from the dashboard."
                    placeholder
                  />
                )}
              </div>
            </div>

            {/* ─── Gamified Right Info Sidebar ────────────────────────── */}
            <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
              <WorkspaceCourseProgressCard
                progressPercent={courseProgressPct}
                completedLessons={completedLessons}
                totalLessons={totalLessons}
                timeSpent={timeSpent}
                totalTime={totalTime}
                onViewCurriculum={() => router.push(`/courses/${courseId}`)}
              />
              <WorkspaceRewardsCard />
              <WorkspaceNextLessonCard
                lessonNumber={nextLessonNumber}
                title={nextLessonTitle}
                description="Understand how JSX works under the hood and write your first expressions."
                durationLabel="9:12"
                href={
                  data?.nextModule
                    ? `/courses/${courseId}/lessons/${data.nextModule.id}`
                    : undefined
                }
              />
            </aside>
          </div>
        </div>
      )}

      <WorkspaceBottomNav
        prevLesson={
          data?.prevModule
            ? {
                number: prevLessonNumber,
                title: prevLessonTitle,
                href: `/courses/${courseId}/lessons/${data.prevModule.id}`,
              }
            : {
                number: prevLessonNumber,
                title: prevLessonTitle,
                href: `/courses/${courseId}/lessons/${lessonId}`,
              }
        }
        nextLesson={{
          number: nextLessonNumber,
          title: nextLessonTitle,
          href: data?.nextModule
            ? `/courses/${courseId}/lessons/${data.nextModule.id}`
            : `/courses/${courseId}/lessons/${lessonId}`,
        }}
        progressPercent={Math.max(videoProgress, courseProgressPct)}
      />
    </div>
  );
}

function LessonPane({
  title,
  body,
  placeholder,
}: {
  title: string;
  body: string;
  placeholder?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "gp-base rounded-2xl border border-white/10 bg-[#10182d]/85 p-5",
        placeholder && "text-center"
      )}
    >
      <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-light">{body}</p>
      {placeholder && (
        <div className="mx-auto mt-5 grid w-full max-w-md grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-lg border border-white/8 bg-white/[0.03]"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

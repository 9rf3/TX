'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────

export interface LessonModule {
  id: string
  course_id: string
  title: string
  description: string | null
  video_url: string | null
  video_type: 'upload' | 'external' | 'none'
  duration: number
  order_index: number
  created_at: string
  updated_at: string
}

export interface LessonCourse {
  id: string
  title: string
  description: string
  category: string
  thumbnail: string | null
  gradient: string | null
}

export interface LessonProgress {
  id: string
  user_id: string
  module_id: string
  watched_seconds: number
  is_completed: boolean
  completed_at: string | null
}

export interface CourseProgress {
  id: string
  user_id: string
  course_id: string
  completed_lessons: number
  total_time_seconds: number
  progress_percentage: number
  xp_earned: number
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  order_index: number
}

export interface Quiz {
  id: string
  module_id: string
  title: string
  questions: QuizQuestion[]
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  correct_answers: number
  total_questions: number
  score_percentage: number
  xp_earned: number
  completed_at: string
}

export interface LessonData {
  module: LessonModule
  course: LessonCourse
  modules: LessonModule[]
  prevModule: LessonModule | null
  nextModule: LessonModule | null
  lessonProgress: LessonProgress | null
  courseProgress: CourseProgress | null
  quiz: Quiz | null
  latestAttempt: QuizAttempt | null
  totalModules: number
  currentIndex: number
}

// ──────────────────────────────────────────────
// GET LESSON DATA
// Fetches all data needed for the lesson page
// ──────────────────────────────────────────────

export async function getLessonData(moduleId: string): Promise<LessonData> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Fetch the current module (lesson)
  const { data: module, error: moduleError } = await supabase
    .from('course_modules')
    .select('*')
    .eq('id', moduleId)
    .single()

  if (moduleError || !module) throw new Error('Lesson not found')

  // 2. Fetch the parent course
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, description, category, thumbnail, gradient')
    .eq('id', module.course_id)
    .single()

  if (courseError || !course) throw new Error('Course not found')

  // 3. Fetch all sibling modules in the same course (ordered)
  const { data: modules } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', module.course_id)
    .order('order_index', { ascending: true })

  const allModules = (modules || []) as LessonModule[]
  const currentIndex = allModules.findIndex(m => m.id === moduleId)
  const prevModule = currentIndex > 0 ? allModules[currentIndex - 1] : null
  const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null

  // 4. Fetch user's progress, quiz, and latest attempt in parallel
  const [progressRes, courseProgressRes, quizRes, attemptRes] = await Promise.all([
    // Lesson progress
    supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_id', moduleId)
      .maybeSingle(),

    // Course progress
    supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', module.course_id)
      .maybeSingle(),

    // Quiz for this module (with questions)
    supabase
      .from('lesson_quizzes')
      .select('id, module_id, title')
      .eq('module_id', moduleId)
      .maybeSingle(),

    // Latest quiz attempt (we'll refine after we have the quiz id)
    supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(10),
  ])

  // 5. If quiz exists, fetch its questions
  let quiz: Quiz | null = null
  let latestAttempt: QuizAttempt | null = null

  if (quizRes.data) {
    const { data: questions } = await supabase
      .from('lesson_questions')
      .select('id, quiz_id, question_text, option_a, option_b, option_c, option_d, order_index')
      .eq('quiz_id', quizRes.data.id)
      .order('order_index', { ascending: true })

    quiz = {
      ...quizRes.data,
      questions: (questions || []) as QuizQuestion[],
    }

    // Find the latest attempt for this specific quiz
    const attempts = (attemptRes.data || []) as QuizAttempt[]
    latestAttempt = attempts.find(a => a.quiz_id === quizRes.data!.id) || null
  }

  return {
    module: module as LessonModule,
    course: course as LessonCourse,
    modules: allModules,
    prevModule,
    nextModule,
    lessonProgress: (progressRes.data as LessonProgress | null),
    courseProgress: (courseProgressRes.data as CourseProgress | null),
    quiz,
    latestAttempt,
    totalModules: allModules.length,
    currentIndex,
  }
}

// ──────────────────────────────────────────────
// SAVE VIDEO PROGRESS
// Upserts watched_seconds for a user+module pair
// ──────────────────────────────────────────────

export async function saveVideoProgress(moduleId: string, watchedSeconds: number) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (watchedSeconds < 0) throw new Error('Invalid watched seconds')

  const { error } = await supabase
    .from('user_lesson_progress')
    .upsert(
      {
        user_id: user.id,
        module_id: moduleId,
        watched_seconds: watchedSeconds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,module_id' }
    )

  if (error) throw new Error(error.message)

  return { success: true, watchedSeconds }
}

// ──────────────────────────────────────────────
// MARK LESSON COMPLETE
// Marks a lesson as completed, updates course
// progress, and awards XP
// ──────────────────────────────────────────────

export async function markLessonComplete(moduleId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify module exists
  const { data: module } = await supabase
    .from('course_modules')
    .select('id, title, course_id, duration')
    .eq('id', moduleId)
    .single()

  if (!module) throw new Error('Lesson not found')

  // Check if already completed
  const { data: existingProgress } = await supabase
    .from('user_lesson_progress')
    .select('id, is_completed')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .maybeSingle()

  if (existingProgress?.is_completed) {
    return { success: true, alreadyCompleted: true, xp: 0, coins: 0 }
  }

  // Upsert lesson progress as completed
  const { error: upsertError } = await supabase
    .from('user_lesson_progress')
    .upsert(
      {
        user_id: user.id,
        module_id: moduleId,
        is_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,module_id' }
    )

  if (upsertError) throw new Error(upsertError.message)

  // Count completed lessons for this course
  const { data: allModules } = await supabase
    .from('course_modules')
    .select('id')
    .eq('course_id', module.course_id)

  const totalModules = allModules?.length || 1

  const { count: completedCount } = await supabase
    .from('user_lesson_progress')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_completed', true)
    .in('module_id', (allModules || []).map(m => m.id))

  const completed = completedCount || 0
  const progressPercentage = Math.round((completed / totalModules) * 10000) / 100

  // Upsert aggregated course progress
  const { error: courseProgressError } = await supabase
    .from('user_course_progress')
    .upsert(
      {
        user_id: user.id,
        course_id: module.course_id,
        completed_lessons: completed,
        progress_percentage: progressPercentage,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,course_id' }
    )

  if (courseProgressError) throw new Error(courseProgressError.message)

  // Award XP for lesson completion
  const xpAmount = 25
  const coinAmount = 5
  let leveledUp = false

  try {
    const { data: xpResult } = await supabase.rpc('award_xp_safe', {
      p_user_id: user.id,
      p_amount: xpAmount,
      p_reason: 'lesson_completed',
      p_metadata: { lesson_id: moduleId, lesson_title: module.title },
    })

    const xpData = xpResult as { success: boolean; leveled_up?: boolean } | null
    leveledUp = xpData?.leveled_up ?? false

    // Award coins (non-critical)
    try {
      await supabase.rpc('award_coins_safe', {
        p_user_id: user.id,
        p_amount: coinAmount,
        p_reason: 'lesson_completed',
        p_metadata: { lesson_id: moduleId },
      })
    } catch { /* coin award is non-critical */ }
  } catch { /* XP award is non-critical to lesson completion */ }

  // Update XP earned in course progress
  try {
    const { data: currentCourseProgress } = await supabase
      .from('user_course_progress')
      .select('xp_earned')
      .eq('user_id', user.id)
      .eq('course_id', module.course_id)
      .single()

    if (currentCourseProgress) {
      await supabase
        .from('user_course_progress')
        .update({ xp_earned: (currentCourseProgress.xp_earned || 0) + xpAmount })
        .eq('user_id', user.id)
        .eq('course_id', module.course_id)
    }
  } catch { /* non-critical */ }

  return {
    success: true,
    alreadyCompleted: false,
    xp: xpAmount,
    coins: coinAmount,
    leveledUp,
    completedLessons: completed,
    totalModules,
    progressPercentage,
  }
}

// ──────────────────────────────────────────────
// SUBMIT QUIZ ANSWER
// Validates a single question answer
// ──────────────────────────────────────────────

export async function submitQuizAnswer(
  quizId: string,
  questionId: string,
  selectedOption: string
): Promise<{ correct: boolean; correctOption: string }> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Validate selectedOption
  const validOptions = ['A', 'B', 'C', 'D']
  const normalizedOption = selectedOption.toUpperCase()
  if (!validOptions.includes(normalizedOption)) {
    throw new Error('Invalid option. Must be A, B, C, or D')
  }

  // Fetch the question
  const { data: question, error } = await supabase
    .from('lesson_questions')
    .select('id, quiz_id, correct_option')
    .eq('id', questionId)
    .eq('quiz_id', quizId)
    .single()

  if (error || !question) throw new Error('Question not found')

  const correct = normalizedOption === question.correct_option

  return {
    correct,
    correctOption: question.correct_option,
  }
}

// ──────────────────────────────────────────────
// COMPLETE QUIZ
// Saves attempt, calculates score, awards XP
// ──────────────────────────────────────────────

export async function completeQuiz(
  quizId: string,
  correctAnswers: number,
  totalQuestions: number
): Promise<{
  attemptId: string
  scorePercentage: number
  xpEarned: number
  coinsEarned: number
  leveledUp: boolean
  isPerfect: boolean
}> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (totalQuestions <= 0) throw new Error('Invalid total questions')
  if (correctAnswers < 0 || correctAnswers > totalQuestions) {
    throw new Error('Invalid correct answers count')
  }

  // Verify quiz exists
  const { data: quiz } = await supabase
    .from('lesson_quizzes')
    .select('id, module_id, title')
    .eq('id', quizId)
    .single()

  if (!quiz) throw new Error('Quiz not found')

  // Verify question count matches
  const { count: actualQuestionCount } = await supabase
    .from('lesson_questions')
    .select('id', { count: 'exact', head: true })
    .eq('quiz_id', quizId)

  if (actualQuestionCount !== null && actualQuestionCount !== totalQuestions) {
    throw new Error('Question count mismatch — possible tampering')
  }

  // Calculate results
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 10000) / 100
  const isPerfect = correctAnswers === totalQuestions

  // XP: 10 per correct answer + 25 bonus for perfect score
  const baseXp = correctAnswers * 10
  const perfectBonus = isPerfect ? 25 : 0
  const xpEarned = baseXp + perfectBonus

  // Coins: 2 per correct answer + 10 bonus for perfect score
  const baseCoins = correctAnswers * 2
  const perfectCoinBonus = isPerfect ? 10 : 0
  const coinsEarned = baseCoins + perfectCoinBonus

  // Insert quiz attempt
  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: user.id,
      quiz_id: quizId,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      score_percentage: scorePercentage,
      xp_earned: xpEarned,
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (attemptError) throw new Error(attemptError.message)

  // Award XP
  let leveledUp = false
  if (xpEarned > 0) {
    try {
      const { data: xpResult } = await supabase.rpc('award_xp_safe', {
        p_user_id: user.id,
        p_amount: xpEarned,
        p_reason: 'quiz_completion',
        p_metadata: {
          quiz_id: quizId,
          quiz_title: quiz.title,
          score: scorePercentage,
          correct: correctAnswers,
          total: totalQuestions,
          is_perfect: isPerfect,
        },
      })

      const xpData = xpResult as { success: boolean; leveled_up?: boolean } | null
      leveledUp = xpData?.leveled_up ?? false
    } catch { /* XP award is non-critical */ }
  }

  // Award coins (non-critical)
  if (coinsEarned > 0) {
    try {
      await supabase.rpc('award_coins_safe', {
        p_user_id: user.id,
        p_amount: coinsEarned,
        p_reason: 'quiz_completion',
        p_metadata: {
          quiz_id: quizId,
          score: scorePercentage,
          is_perfect: isPerfect,
        },
      })
    } catch { /* coin award is non-critical */ }
  }

  return {
    attemptId: attempt.id,
    scorePercentage,
    xpEarned,
    coinsEarned,
    leveledUp,
    isPerfect,
  }
}

// ──────────────────────────────────────────────
// GET COURSE PROGRESS DATA
// Fetches aggregated course progress for user
// ──────────────────────────────────────────────

export async function getCourseProgressData(courseId: string): Promise<{
  courseProgress: CourseProgress | null
  lessonStatuses: Array<{ module_id: string; is_completed: boolean; watched_seconds: number }>
  totalModules: number
}> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch all data in parallel
  const [courseProgressRes, modulesRes] = await Promise.all([
    supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle(),

    supabase
      .from('course_modules')
      .select('id')
      .eq('course_id', courseId),
  ])

  const moduleIds = (modulesRes.data || []).map(m => m.id)

  // Fetch per-lesson progress for all modules in this course
  let lessonStatuses: Array<{ module_id: string; is_completed: boolean; watched_seconds: number }> = []

  if (moduleIds.length > 0) {
    const { data: progressRows } = await supabase
      .from('user_lesson_progress')
      .select('module_id, is_completed, watched_seconds')
      .eq('user_id', user.id)
      .in('module_id', moduleIds)

    lessonStatuses = (progressRows || []).map(p => ({
      module_id: p.module_id,
      is_completed: p.is_completed ?? false,
      watched_seconds: p.watched_seconds ?? 0,
    }))
  }

  return {
    courseProgress: (courseProgressRes.data as CourseProgress | null),
    lessonStatuses,
    totalModules: moduleIds.length,
  }
}

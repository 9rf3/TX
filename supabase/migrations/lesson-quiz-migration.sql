-- ==========================================
-- TWOKAX Lesson & Quiz Migration
-- Tables: user_lesson_progress, user_course_progress,
--         lesson_quizzes, lesson_questions, quiz_attempts
-- Fully re-runnable — safe to run multiple times
-- ==========================================

-- ──────────────────────────────────────────────
-- USER LESSON PROGRESS (per module/lesson)
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
  watched_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON public.user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_module ON public.user_lesson_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_module ON public.user_lesson_progress(user_id, module_id);

-- ──────────────────────────────────────────────
-- AGGREGATED COURSE PROGRESS
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  completed_lessons INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  progress_percentage NUMERIC(5,2) DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_course_progress_user ON public.user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_course ON public.user_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_course ON public.user_course_progress(user_id, course_id);

-- ──────────────────────────────────────────────
-- LESSON QUIZZES
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lesson_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Lesson Quiz',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lesson_quizzes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_lesson_quizzes_module ON public.lesson_quizzes(module_id);

-- ──────────────────────────────────────────────
-- QUIZ QUESTIONS (4 options: A/B/C/D)
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lesson_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.lesson_quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lesson_questions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_lesson_questions_quiz ON public.lesson_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_lesson_questions_order ON public.lesson_questions(quiz_id, order_index);

-- ──────────────────────────────────────────────
-- QUIZ ATTEMPTS TRACKING
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES public.lesson_quizzes(id) ON DELETE CASCADE NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  score_percentage NUMERIC(5,2) DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY POLICIES
-- ──────────────────────────────────────────────

-- User Lesson Progress: users manage their own records
DO $$ BEGIN
  CREATE POLICY "Users manage own lesson progress"
    ON public.user_lesson_progress FOR ALL
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- User Course Progress: users manage their own records
DO $$ BEGIN
  CREATE POLICY "Users manage own course progress"
    ON public.user_course_progress FOR ALL
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Lesson Quizzes: anyone can read
DO $$ BEGIN
  CREATE POLICY "Anyone can read quizzes"
    ON public.lesson_quizzes FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admin quiz management
DO $$ BEGIN
  CREATE POLICY "Admins can manage quizzes"
    ON public.lesson_quizzes FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Lesson Questions: anyone can read
DO $$ BEGIN
  CREATE POLICY "Anyone can read questions"
    ON public.lesson_questions FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admin question management
DO $$ BEGIN
  CREATE POLICY "Admins can manage questions"
    ON public.lesson_questions FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Quiz Attempts: users manage their own records
DO $$ BEGIN
  CREATE POLICY "Users manage own quiz attempts"
    ON public.quiz_attempts FOR ALL
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ──────────────────────────────────────────────
-- UPDATED_AT TRIGGER FUNCTION
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at on user_lesson_progress
DROP TRIGGER IF EXISTS set_updated_at_user_lesson_progress ON public.user_lesson_progress;
CREATE TRIGGER set_updated_at_user_lesson_progress
  BEFORE UPDATE ON public.user_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-update updated_at on user_course_progress
DROP TRIGGER IF EXISTS set_updated_at_user_course_progress ON public.user_course_progress;
CREATE TRIGGER set_updated_at_user_course_progress
  BEFORE UPDATE ON public.user_course_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

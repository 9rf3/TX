import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { type NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return Response.json({ error: 'Quiz ID is required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: quiz, error: quizError } = await supabase
      .from('lesson_quizzes')
      .select('id, module_id, title')
      .eq('id', id)
      .single()

    if (quizError || !quiz) {
      return Response.json({ error: 'Quiz not found' }, { status: 404 })
    }

    const { data: questions } = await supabase
      .from('lesson_questions')
      .select('id, quiz_id, question_text, option_a, option_b, option_c, option_d, order_index')
      .eq('quiz_id', id)
      .order('order_index', { ascending: true })

    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('quiz_id', id)
      .order('completed_at', { ascending: false })
      .limit(1)

    return Response.json({
      data: {
        ...quiz,
        questions: (questions || []).map(q => ({
          ...q,
          correct_option: undefined,
        })),
        latestAttempt: (attempts || [])[0] || null,
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Unauthorized' ? 401
      : message === 'Quiz not found' ? 404
      : 500

    return Response.json({ error: message }, { status })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return Response.json({ error: 'Quiz ID is required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'submit-answer') {
      const { questionId, selectedOption } = body

      if (!questionId || !selectedOption) {
        return Response.json({ error: 'questionId and selectedOption required' }, { status: 400 })
      }

      const normalized = selectedOption.toUpperCase()
      if (!['A', 'B', 'C', 'D'].includes(normalized)) {
        return Response.json({ error: 'Invalid option. Must be A, B, C, or D' }, { status: 400 })
      }

      const { data: question, error: qError } = await supabase
        .from('lesson_questions')
        .select('id, correct_option')
        .eq('id', questionId)
        .eq('quiz_id', id)
        .single()

      if (qError || !question) {
        return Response.json({ error: 'Question not found' }, { status: 404 })
      }

      const correct = normalized === question.correct_option

      return Response.json({ data: { correct, correctOption: question.correct_option } })
    }

    if (action === 'complete') {
      const { correctAnswers, totalQuestions } = body

      if (typeof correctAnswers !== 'number' || typeof totalQuestions !== 'number') {
        return Response.json({ error: 'correctAnswers and totalQuestions required' }, { status: 400 })
      }

      const scorePercent = Math.round((correctAnswers / totalQuestions) * 10000) / 100
      const isPerfect = correctAnswers === totalQuestions
      const baseXp = correctAnswers * 10
      const perfectBonus = isPerfect ? 25 : 0
      const xpEarned = baseXp + perfectBonus

      const { data: attempt, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: id,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          score_percentage: scorePercent,
          xp_earned: xpEarned,
          completed_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (attemptError) {
        return Response.json({ error: attemptError.message }, { status: 500 })
      }

      if (xpEarned > 0) {
        try {
          await supabase.rpc('award_xp_safe', {
            p_user_id: user.id,
            p_amount: xpEarned,
            p_reason: 'quiz_completion',
            p_metadata: {
              quiz_id: id,
              score: scorePercent,
              correct: correctAnswers,
              total: totalQuestions,
              is_perfect: isPerfect,
            },
          })
        } catch { /* non-critical */ }
      }

      return Response.json({
        data: {
          attemptId: attempt.id,
          scorePercent,
          xpEarned,
          isPerfect,
        }
      })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}

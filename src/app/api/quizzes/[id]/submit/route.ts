import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { type NextRequest } from 'next/server'
import { submitQuizAnswer } from '@/actions/lesson'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params

    if (!quizId) {
      return Response.json({ error: 'Quiz ID is required' }, { status: 400 })
    }

    // Verify authentication
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { questionId, selectedOption } = body

    if (!questionId || typeof questionId !== 'string') {
      return Response.json({ error: 'questionId is required' }, { status: 400 })
    }

    if (!selectedOption || typeof selectedOption !== 'string') {
      return Response.json({ error: 'selectedOption is required' }, { status: 400 })
    }

    const result = await submitQuizAnswer(quizId, questionId, selectedOption)
    return Response.json({ data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Unauthorized' ? 401
      : message === 'Question not found' ? 404
      : message.includes('Invalid option') ? 400
      : 500

    return Response.json({ error: message }, { status })
  }
}

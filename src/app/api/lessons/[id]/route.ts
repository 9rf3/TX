import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { type NextRequest } from 'next/server'
import { getLessonData } from '@/actions/lesson'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return Response.json({ error: 'Module ID is required' }, { status: 400 })
    }

    // Verify authentication via supabase before delegating
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await getLessonData(id)
    return Response.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Unauthorized' ? 401
      : message === 'Lesson not found' || message === 'Course not found' ? 404
      : 500

    return Response.json({ error: message }, { status })
  }
}

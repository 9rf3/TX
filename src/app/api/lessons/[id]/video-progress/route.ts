import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { type NextRequest } from 'next/server'
import { saveVideoProgress } from '@/actions/lesson'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return Response.json({ error: 'Module ID is required' }, { status: 400 })
    }

    // Verify authentication
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { watchedSeconds } = body

    if (typeof watchedSeconds !== 'number' || watchedSeconds < 0) {
      return Response.json(
        { error: 'watchedSeconds must be a non-negative number' },
        { status: 400 }
      )
    }

    const result = await saveVideoProgress(id, Math.floor(watchedSeconds))
    return Response.json({ data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Unauthorized' ? 401 : 500

    return Response.json({ error: message }, { status })
  }
}

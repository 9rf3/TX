import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // Exchange the auth code for a session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  // You can pass the 'next' search param to conditionally redirect
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}

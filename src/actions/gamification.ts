'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// ──────────────────────────────────────────────
// DAILY REWARD — uses transaction-safe SQL RPC
// ──────────────────────────────────────────────
export async function claimDailyReward() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data, error } = await supabase.rpc('claim_daily_reward_safe', {
    p_user_id: user.id,
  })

  if (error) throw new Error(error.message)

  const result = data as {
    success: boolean
    error?: string
    xp?: number
    coins?: number
    streak?: number
    streak_bonus?: number
    leveled_up?: boolean
    next_in_seconds?: number
  }

  if (!result.success) {
    throw new Error(result.error || 'Failed to claim reward')
  }

  return {
    xp: result.xp!,
    coins: result.coins!,
    streak: result.streak!,
    streakBonus: result.streak_bonus!,
    leveledUp: result.leveled_up ?? false,
  }
}

// ──────────────────────────────────────────────
// GET GAMIFICATION PROFILE
// ──────────────────────────────────────────────
export async function getGamificationProfile() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check & reset streak on profile load
  try { await supabase.rpc('check_and_reset_streak', { p_user_id: user.id }) } catch {}

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, total_xp_earned')
    .order('total_xp_earned', { ascending: false })

  const rank = allProfiles
    ? allProfiles.findIndex(p => p.id === profile.id) + 1
    : 0

  const totalUsers = allProfiles?.length || 1
  const percentile = Math.round(((totalUsers - rank) / totalUsers) * 100)

  const { data: xpForNext } = await supabase.rpc('xp_for_next_level', { current_level: profile.level })
  const xpForNextVal = xpForNext || 100

  return {
    ...profile,
    rank,
    totalUsers,
    percentile,
    xpForNext: xpForNextVal,
  }
}

// ──────────────────────────────────────────────
// AWARD XP (transaction-safe)
// ──────────────────────────────────────────────
export async function awardXp(amount: number, reason: string, metadata?: Record<string, unknown>) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (amount <= 0) throw new Error('Amount must be positive')

  // Rate cap: no single grant > 10000 XP via this action
  if (amount > 10000) throw new Error('Amount exceeds maximum')

  const { data, error } = await supabase.rpc('award_xp_safe', {
    p_user_id: user.id,
    p_amount: amount,
    p_reason: reason,
    p_metadata: (metadata || {}) as Record<string, unknown>,
  })

  if (error) throw new Error(error.message)

  const result = data as {
    success: boolean
    error?: string
    xp_awarded?: number
    xp_before?: number
    xp_after?: number
    level_before?: number
    level_after?: number
    leveled_up?: boolean
  }

  if (!result.success) throw new Error(result.error || 'Failed to award XP')

  return result
}

// ──────────────────────────────────────────────
// AWARD TX COINS (transaction-safe)
// ──────────────────────────────────────────────
export async function awardCoins(amount: number, reason: string, metadata?: Record<string, unknown>) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (amount <= 0) throw new Error('Amount must be positive')
  if (amount > 10000) throw new Error('Amount exceeds maximum')

  const { data, error } = await supabase.rpc('award_coins_safe', {
    p_user_id: user.id,
    p_amount: amount,
    p_reason: reason,
    p_metadata: (metadata || {}) as Record<string, unknown>,
  })

  if (error) throw new Error(error.message)

  const result = data as { success: boolean; error?: string; coins_awarded?: number; balance?: number }
  if (!result.success) throw new Error(result.error || 'Failed to award coins')

  return result
}

// ──────────────────────────────────────────────
// AWARD LESSON COMPLETION XP
// ──────────────────────────────────────────────
export async function awardLessonXp(lessonId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify lesson exists
  const { data: lesson } = await supabase
    .from('course_modules')
    .select('id, title')
    .eq('id', lessonId)
    .single()

  if (!lesson) throw new Error('Lesson not found')

  // Check for duplicate (anti-abuse)
  const { data: existing } = await supabase
    .from('xp_events')
    .select('id')
    .eq('user_id', user.id)
    .eq('reason', 'lesson_completed')
    .filter('metadata->>lesson_id', 'eq', lessonId)
    .maybeSingle()

  if (existing) throw new Error('XP already awarded for this lesson')

  const xpAmount = 25
  const coinAmount = 5

  // Award XP
  const xpResult = await supabase.rpc('award_xp_safe', {
    p_user_id: user.id,
    p_amount: xpAmount,
    p_reason: 'lesson_completed',
    p_metadata: { lesson_id: lessonId, lesson_title: lesson.title },
  })

  const xpData = xpResult.data as { success: boolean; error?: string; leveled_up?: boolean }
  if (!xpResult.error && xpData?.success) {
    try {
      await supabase.rpc('award_coins_safe', {
        p_user_id: user.id,
        p_amount: coinAmount,
        p_reason: 'lesson_completed',
        p_metadata: { lesson_id: lessonId },
      })
    } catch {
      // Coin award is non-critical
    }
  }

  return { xp: xpAmount, coins: coinAmount, leveledUp: xpData?.leveled_up ?? false }
}

// ──────────────────────────────────────────────
// GET REWARD STATE
// ──────────────────────────────────────────────
export async function getRewardState() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.rpc('get_reward_state', { p_user_id: user.id })
  if (error) return null

  return data as {
    can_claim: boolean
    streak: number
    last_claimed: string | null
    next_in_seconds: number
    next_tier_streak: number
    next_tier_label: string
  }
}

// ──────────────────────────────────────────────
// LEADERBOARD
// ──────────────────────────────────────────────
export async function getLeaderboardData(limit = 50) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url, xp, level, total_xp_earned, current_streak, longest_streak')
    .order('total_xp_earned', { ascending: false })
    .limit(limit)

  if (error) return []

  return profiles.map((p, i) => ({
    rank: i + 1,
    id: p.id,
    name: p.full_name || p.username || 'Anonymous',
    avatar: p.avatar_url,
    xp: p.total_xp_earned || p.xp,
    level: p.level,
    streak: p.current_streak,
    longestStreak: p.longest_streak,
  }))
}

// ──────────────────────────────────────────────
// ACHIEVEMENTS
// ──────────────────────────────────────────────
export async function getAchievements(userId?: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  const targetId = userId || user?.id
  if (!targetId) return { catalog: [], unlocked: [] }

  const [catalogRes, unlockedRes] = await Promise.all([
    supabase.from('achievements').select('*').order('xp_reward', { ascending: false }),
    supabase.from('user_achievements').select('*, achievement:achievements(*)').eq('user_id', targetId),
  ])

  return {
    catalog: catalogRes.data || [],
    unlocked: unlockedRes.data || [],
  }
}

// ──────────────────────────────────────────────
// RECENT XP EVENTS (for activity feed)
// ──────────────────────────────────────────────
export async function getRecentXpEvents(limit = 10) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('xp_events')
    .select('amount, reason, metadata, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}

// ──────────────────────────────────────────────
// RECENT COIN EVENTS
// ──────────────────────────────────────────────
export async function getRecentCoinEvents(limit = 10) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('coin_events')
    .select('amount, balance_after, reason, metadata, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}

// ──────────────────────────────────────────────
// GET RANK TIER
// ──────────────────────────────────────────────
export async function getRankTier(level: number) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data } = await supabase.rpc('get_rank_tier', { player_level: level })
  return data || 'Unranked'
}

// ──────────────────────────────────────────────
// UPDATE LAST ACTIVE
// ──────────────────────────────────────────────
export async function updateLastActive() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  try {
    await supabase.rpc('check_and_reset_streak', { p_user_id: user.id })
  } catch {
    supabase.from('profiles').update({ last_active_at: new Date().toISOString() }).eq('id', user.id)
  }
}

// ──────────────────────────────────────────────
// FRIENDS WITH PRESENCE
// ──────────────────────────────────────────────
export async function getFriendsWithPresence() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: friendships } = await supabase
    .from('friendships')
    .select('user_id_1, user_id_2')
    .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)

  if (!friendships) return []

  const friendIds = friendships.map(f =>
    f.user_id_1 === user.id ? f.user_id_2 : f.user_id_1
  )

  if (friendIds.length === 0) return []

  const { data: friends } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url, level, current_streak, last_active_at, total_xp_earned')
    .in('id', friendIds)

  if (!friends) return []

  const now = Date.now()
  return friends.map(f => ({
    ...f,
    isOnline: f.last_active_at
      ? (now - new Date(f.last_active_at).getTime()) < 300000
      : false,
    wasRecentlyActive: f.last_active_at
      ? (now - new Date(f.last_active_at).getTime()) < 3600000
      : false,
  }))
}

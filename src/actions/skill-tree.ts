'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import type { SkillTreeData, SkillNode, UserSkillProgress } from '@/lib/types'

export async function getSkillTreeData(): Promise<SkillTreeData> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { skills: [], userProgress: [], availablePoints: 0, userLevel: 0 }

  const [skillsRes, progressRes, profileRes] = await Promise.all([
    supabase.from('skills').select('*').order('position_x').order('position_y'),
    supabase.from('user_skills').select('skill_id, current_level, points_invested').eq('user_id', user.id),
    supabase.from('profiles').select('level').eq('id', user.id).single(),
  ])

  const skills = (skillsRes.data || []) as SkillNode[]
  const userProgress = (progressRes.data || []) as UserSkillProgress[]
  const userLevel = profileRes.data?.level || 1
  const totalInvested = userProgress.reduce((sum, p) => sum + p.points_invested, 0)
  const availablePoints = Math.max(0, userLevel - totalInvested)

  return { skills, userProgress, availablePoints, userLevel }
}

export async function investSkillPoint(skillId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: skill } = await supabase.from('skills').select('*').eq('id', skillId).single()
  if (!skill) throw new Error('Skill not found')

  const { data: profile } = await supabase
    .from('profiles')
    .select('level')
    .eq('id', user.id)
    .single()
  if (!profile) throw new Error('Profile not found')

  const { data: allProgress } = await supabase
    .from('user_skills')
    .select('points_invested')
    .eq('user_id', user.id)
  const totalInvested = (allProgress || []).reduce((sum, p) => sum + p.points_invested, 0)
  const availablePoints = profile.level - totalInvested

  if (availablePoints <= 0) throw new Error('No skill points available')

  const { data: existing } = await supabase
    .from('user_skills')
    .select('*')
    .eq('user_id', user.id)
    .eq('skill_id', skillId)
    .maybeSingle()

  if (existing) {
    if (existing.current_level >= skill.max_level) {
      throw new Error('Skill already at max level')
    }
    const { error: updateError } = await supabase
      .from('user_skills')
      .update({
        current_level: existing.current_level + 1,
        points_invested: existing.points_invested + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
    if (updateError) throw updateError
  } else {
    if (skill.parent_skill_id) {
      const { data: parentSkill } = await supabase
        .from('user_skills')
        .select('current_level')
        .eq('user_id', user.id)
        .eq('skill_id', skill.parent_skill_id)
        .maybeSingle()
      if (!parentSkill || parentSkill.current_level < 1) {
        throw new Error('Complete the prerequisite skill first')
      }
    }
    const { error: insertError } = await supabase
      .from('user_skills')
      .insert({
        user_id: user.id,
        skill_id: skillId,
        current_level: 1,
        points_invested: 1,
      })
    if (insertError) throw insertError
  }

  const xpReward = 75 + (skill.max_level * 10)
  try {
    await supabase.rpc('award_xp_safe', {
      p_user_id: user.id,
      p_amount: xpReward,
      p_reason: 'skill_invested',
      p_metadata: { skill_id: skillId, skill_name: skill.name },
    })
  } catch { /* non-critical */ }

  try {
    await supabase.rpc('award_coins_safe', {
      p_user_id: user.id,
      p_amount: 15,
      p_reason: 'skill_invested',
      p_metadata: { skill_id: skillId },
    })
  } catch { /* non-critical */ }

  const { data: updated } = await supabase
    .from('user_skills')
    .select('skill_id, current_level, points_invested')
    .eq('user_id', user.id)

  const { data: freshProfile } = await supabase
    .from('profiles')
    .select('level')
    .eq('id', user.id)
    .single()

  const totalInvestedNow = (updated || []).reduce((sum, p) => sum + p.points_invested, 0)
  const freshLevel = freshProfile?.level || profile.level
  const newAvailable = Math.max(0, freshLevel - totalInvestedNow)

  return {
    skillId,
    pointsInvested: totalInvestedNow,
    availablePoints: newAvailable,
    userLevel: freshLevel,
    xpRewarded: xpReward,
    coinsRewarded: 15,
    userProgress: (updated || []) as UserSkillProgress[],
  }
}

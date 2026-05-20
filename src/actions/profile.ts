'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// ──────────────────────────────────────────────
// GET EXTENDED PROFILE
// ──────────────────────────────────────────────
export async function getExtendedProfile() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

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

  const { data: xpForNext } = await supabase.rpc('xp_for_next_level', { current_level: profile.level })

  return {
    ...profile,
    rank,
    totalUsers,
    xpForNext: xpForNext || 100,
  }
}

// ──────────────────────────────────────────────
// UPDATE PROFILE
// ──────────────────────────────────────────────
export async function updateProfile(data: {
  display_name?: string
  bio?: string
  country?: string
  university?: string
  focus_areas?: string[]
  github_username?: string
  username?: string
  full_name?: string
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const updateData: Record<string, unknown> = {}
  if (data.display_name !== undefined) updateData.display_name = data.display_name
  if (data.bio !== undefined) updateData.bio = data.bio
  if (data.country !== undefined) updateData.country = data.country
  if (data.university !== undefined) updateData.university = data.university
  if (data.focus_areas !== undefined) updateData.focus_areas = data.focus_areas
  if (data.github_username !== undefined) updateData.github_username = data.github_username
  if (data.username !== undefined) updateData.username = data.username
  if (data.full_name !== undefined) updateData.full_name = data.full_name

  if (Object.keys(updateData).length === 0) return { success: true }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  return { success: true }
}

// ──────────────────────────────────────────────
// SELECT AVATAR
// ──────────────────────────────────────────────
export async function selectAvatar(avatarId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('profiles')
    .update({ selected_avatar: avatarId })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  return { success: true }
}

// ──────────────────────────────────────────────
// UPLOAD CUSTOM AVATAR
// ──────────────────────────────────────────────
export async function uploadAvatar(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')

  const ext = file.name.split('.').pop()
  const filePath = `${user.id}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('profile-avatars')
    .upload(filePath, file)

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from('profile-avatars')
    .getPublicUrl(filePath)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ selected_avatar: publicUrl, avatar_url: publicUrl })
    .eq('id', user.id)

  if (updateError) throw new Error(updateError.message)

  return { url: publicUrl, success: true }
}

// ──────────────────────────────────────────────
// UPLOAD BANNER
// ──────────────────────────────────────────────
export async function uploadBanner(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')

  const ext = file.name.split('.').pop()
  const filePath = `${user.id}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('profile-banners')
    .upload(filePath, file)

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from('profile-banners')
    .getPublicUrl(filePath)

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ profile_banner: publicUrl })
    .eq('id', user.id)

  if (updateError) throw new Error(updateError.message)

  return { url: publicUrl, success: true }
}

// ──────────────────────────────────────────────
// SHOP — GET ALL ITEMS
// ──────────────────────────────────────────────
export async function getShopItems() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  const { data: items } = await supabase
    .from('shop_items')
    .select('*')
    .eq('is_active', true)
    .order('rarity', { ascending: false })
    .order('price_coins', { ascending: true })

  if (!userId) return { items: items || [], inventory: [] }

  const { data: inventory } = await supabase
    .from('user_inventory')
    .select('*, item:shop_items(*)')
    .eq('user_id', userId)

  return {
    items: items || [],
    inventory: (inventory || []) as unknown as { id: string; item_id: string; is_equipped: boolean; item: Record<string, unknown> }[],
  }
}

// ──────────────────────────────────────────────
// SHOP — PURCHASE ITEM
// ──────────────────────────────────────────────
export async function purchaseItem(itemId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase.rpc('purchase_item_safe', {
    p_user_id: user.id,
    p_item_id: itemId,
  })

  if (error) throw new Error(error.message)

  const result = data as { success: boolean; error?: string; coins_spent?: number; balance?: number }
  if (!result.success) throw new Error(result.error || 'Purchase failed')

  return result
}

// ──────────────────────────────────────────────
// SHOP — EQUIP ITEM
// ──────────────────────────────────────────────
export async function equipItem(itemId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase.rpc('equip_item_safe', {
    p_user_id: user.id,
    p_item_id: itemId,
  })

  if (error) throw new Error(error.message)

  const result = data as { success: boolean; error?: string }
  if (!result.success) throw new Error(result.error || 'Equip failed')

  return result
}

// ──────────────────────────────────────────────
// SHOP — UNEQUIP ITEM
// ──────────────────────────────────────────────
export async function unequipItem(itemId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('user_inventory')
    .update({ is_equipped: false })
    .eq('user_id', user.id)
    .eq('item_id', itemId)

  if (error) throw new Error(error.message)
  return { success: true }
}

// ──────────────────────────────────────────────
// PORTFOLIO — GET PROJECTS
// ──────────────────────────────────────────────
export async function getPortfolioProjects(userId?: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  const targetId = userId || user?.id
  if (!targetId) return []

  const { data } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('user_id', targetId)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  return data || []
}

// ──────────────────────────────────────────────
// PORTFOLIO — CREATE/UPDATE/DELETE PROJECT
// ──────────────────────────────────────────────
export async function createProject(data: {
  title: string
  description?: string
  project_url?: string
  github_url?: string
  tags?: string[]
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('portfolio_projects').insert({
    user_id: user.id,
    title: data.title,
    description: data.description || null,
    project_url: data.project_url || null,
    github_url: data.github_url || null,
    tags: data.tags || [],
  })

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function updateProject(id: string, data: {
  title?: string
  description?: string
  project_url?: string
  github_url?: string
  tags?: string[]
  is_featured?: boolean
}) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('portfolio_projects')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function deleteProject(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('portfolio_projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  return { success: true }
}

// ──────────────────────────────────────────────
// CERTIFICATES — GET/CREATE/DELETE
// ──────────────────────────────────────────────
export async function getCertificates(userId?: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  const targetId = userId || user?.id
  if (!targetId) return []

  const { data } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', targetId)
    .order('issued_at', { ascending: false })

  return data || []
}

export async function uploadCertificate(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const file = formData.get('file') as File
  const title = formData.get('title') as string
  const issuer = formData.get('issuer') as string

  if (!file || !title) throw new Error('File and title required')

  const ext = file.name.split('.').pop()
  const filePath = `${user.id}/certificates/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('certificates')
    .upload(filePath, file)

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from('certificates')
    .getPublicUrl(filePath)

  const { error } = await supabase.from('certificates').insert({
    user_id: user.id,
    title,
    issuer: issuer || null,
    image_url: publicUrl,
    issued_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)
  return { url: publicUrl, success: true }
}

export async function deleteCertificate(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('certificates')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  return { success: true }
}

// ──────────────────────────────────────────────
// ENROLLMENTS — GET ACTIVE COURSES
// ──────────────────────────────────────────────
export async function getActiveEnrollments() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('user_enrollments')
    .select('*, course:courses(*)')
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false })

  return data || []
}

// ──────────────────────────────────────────────
// GITHUB — FETCH PUBLIC REPOS
// ──────────────────────────────────────────────
export async function getGitHubRepos(username: string) {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`)
    if (!res.ok) return []
    const repos = await res.json()
    return repos.map((r: Record<string, unknown>) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      url: r.html_url,
      stars: r.stargazers_count,
      language: r.language,
      updated_at: r.updated_at,
    }))
  } catch {
    return []
  }
}

// ──────────────────────────────────────────────
// GET FULL PROFILE DATA (for page load)
// ──────────────────────────────────────────────
export async function getFullProfileData(userId?: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  const targetId = userId || user?.id
  if (!targetId) return null

  const [profileResult, achievementsResult, projectsResult, certsResult, enrollmentsResult, inventoryResult, shopResult] = await Promise.all([
    getExtendedProfile(),
    (async () => {
      const [cat, unlocked] = await Promise.all([
        supabase.from('achievements').select('*').order('xp_reward', { ascending: false }),
        supabase.from('user_achievements').select('*, achievement:achievements(*)').eq('user_id', targetId),
      ])
      return { catalog: cat.data || [], unlocked: unlocked.data || [] }
    })(),
    supabase.from('portfolio_projects').select('*').eq('user_id', targetId).order('is_featured', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('certificates').select('*').eq('user_id', targetId).order('issued_at', { ascending: false }),
    supabase.from('user_enrollments').select('*, course:courses(*)').eq('user_id', targetId).order('enrolled_at', { ascending: false }),
    supabase.from('user_inventory').select('*, item:shop_items(*)').eq('user_id', targetId),
    supabase.from('shop_items').select('*').eq('is_active', true).order('rarity', { ascending: false }).order('price_coins', { ascending: true }),
  ])

  const profile = profileResult
  const ghRepos = profile?.github_username
    ? await getGitHubRepos(profile.github_username)
    : []

  return {
    profile,
    achievements: achievementsResult,
    projects: projectsResult.data || [],
    certificates: certsResult.data || [],
    enrollments: enrollmentsResult.data || [],
    inventory: inventoryResult.data || [],
    shopItems: shopResult.data || [],
    githubRepos: ghRepos,
  }
}

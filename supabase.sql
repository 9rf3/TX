-- Run this script in your Supabase SQL Editor
-- ==========================================
-- TWOKAX Platform - Complete Database Setup
-- Includes base schema + gamification engine (Phases 1 & 2)
-- Fully re-runnable — safe to run multiple times
-- ==========================================

-- ==========================================
-- ENUM TYPES
-- ==========================================

do $$ begin
  create type public.user_role as enum ('student', 'teacher', 'admin');
exception
  when duplicate_object then null;
end $$;

-- ==========================================
-- TABLES — BASE SCHEMA
-- ==========================================

create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  username text,
  avatar_url text,
  role public.user_role default 'student'::public.user_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  category text not null default 'uncategorized',
  thumbnail text,
  gradient text,
  price text not null default 'free',
  level text not null default 'beginner',
  published boolean default false not null,
  created_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.courses enable row level security;

create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

insert into public.categories (name, slug) values
  ('Development', 'development'),
  ('Design', 'design'),
  ('Business', 'business'),
  ('Data Science', 'data-science'),
  ('Marketing', 'marketing'),
  ('AI & ML', 'ai-ml'),
  ('Computer Science', 'computer-science')
on conflict (slug) do nothing;

create table if not exists public.course_categories (
  course_id uuid references public.courses(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  primary key (course_id, category_id)
);

alter table public.course_categories enable row level security;

create table if not exists public.course_modules (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  video_url text,
  video_type text check (video_type in ('upload', 'external', 'none')) default 'none' not null,
  duration integer default 0 not null,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.course_modules enable row level security;

create table if not exists public.friend_requests (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) not null,
  receiver_id uuid references public.profiles(id) not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(sender_id, receiver_id)
);

alter table public.friend_requests enable row level security;

create table if not exists public.friendships (
  id uuid default gen_random_uuid() primary key,
  user_id_1 uuid references public.profiles(id) not null,
  user_id_2 uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (user_id_1 < user_id_2),
  unique(user_id_1, user_id_2)
);

alter table public.friendships enable row level security;

-- ==========================================
-- BASE INDEXES
-- ==========================================

create index if not exists idx_course_modules_course_id on public.course_modules(course_id);
create index if not exists idx_course_modules_order on public.course_modules(course_id, order_index);
create index if not exists idx_courses_published on public.courses(published);
create index if not exists idx_courses_created_by on public.courses(created_by);
create index if not exists idx_courses_category on public.courses(category);
create index if not exists idx_courses_created_at on public.courses(created_at desc);
create index if not exists idx_profiles_role on public.profiles(role);

-- ==========================================
-- BASE ROW LEVEL SECURITY POLICIES
-- ==========================================

do $$ begin
  create policy "Public profiles are viewable by everyone." on profiles for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update own profile." on profiles for update using (auth.uid() = id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Published courses are viewable by everyone." on courses for select using (published = true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can view all courses." on courses for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can insert courses." on courses for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can update courses." on courses for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can delete courses." on courses for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Categories are viewable by everyone." on categories for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can insert categories." on categories for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can update categories." on categories for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can delete categories." on categories for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Course categories are viewable by everyone." on course_categories for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can manage course categories." on course_categories for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Published course modules are viewable by everyone." on course_modules for select using (
    exists (select 1 from public.courses where id = course_id and published = true)
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can view all course modules." on course_modules for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can manage course modules." on course_modules for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can view requests they sent or received." on friend_requests
    for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can send requests." on friend_requests for insert with check (auth.uid() = sender_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update requests they received." on friend_requests
    for update using (auth.uid() = receiver_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can delete their own requests." on friend_requests
    for delete using (auth.uid() = sender_id or auth.uid() = receiver_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can view their friendships." on friendships
    for select using (auth.uid() = user_id_1 or auth.uid() = user_id_2);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can delete their friendships." on friendships
    for delete using (auth.uid() = user_id_1 or auth.uid() = user_id_2);
exception when duplicate_object then null;
end $$;

-- ==========================================
-- BASE FUNCTIONS & TRIGGERS
-- ==========================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role, xp, level, tx_coins, current_streak)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'student'::public.user_role,
    0, 1, 0, 0
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.accept_friend_request(request_id uuid)
returns void as $$
declare
  req record;
  u1 uuid;
  u2 uuid;
begin
  select * into req from public.friend_requests
  where id = request_id and receiver_id = auth.uid() and status = 'pending';

  if not found then
    raise exception 'Request not found or unauthorized';
  end if;

  update public.friend_requests set status = 'accepted' where id = request_id;

  if req.sender_id < req.receiver_id then
    u1 := req.sender_id;
    u2 := req.receiver_id;
  else
    u1 := req.receiver_id;
    u2 := req.sender_id;
  end if;

  insert into public.friendships (user_id_1, user_id_2)
  values (u1, u2)
  on conflict do nothing;
end;
$$ language plpgsql security definer;

-- ==========================================
-- STORAGE BUCKETS & POLICIES
-- ==========================================

insert into storage.buckets (id, name, public) values ('course-videos', 'course-videos', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('course-thumbnails', 'course-thumbnails', true) on conflict do nothing;

do $$ begin
  create policy "Videos are publicly accessible." on storage.objects for select using (bucket_id = 'course-videos');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can upload videos." on storage.objects for insert with check (
    bucket_id = 'course-videos' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can update videos." on storage.objects for update using (
    bucket_id = 'course-videos' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can delete videos." on storage.objects for delete using (
    bucket_id = 'course-videos' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Thumbnails are publicly accessible." on storage.objects for select using (bucket_id = 'course-thumbnails');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can upload thumbnails." on storage.objects for insert with check (
    bucket_id = 'course-thumbnails' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can update thumbnails." on storage.objects for update using (
    bucket_id = 'course-thumbnails' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can delete thumbnails." on storage.objects for delete using (
    bucket_id = 'course-thumbnails' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
exception when duplicate_object then null;
end $$;

-- ==================================================================
-- PHASE 1: GAMIFICATION ENGINE — PROFILE EXTENSIONS & CORE SYSTEMS
-- ==================================================================

alter table public.profiles
  add column if not exists xp integer not null default 0,
  add column if not exists level integer not null default 1,
  add column if not exists tx_coins integer not null default 0,
  add column if not exists current_streak integer not null default 0,
  add column if not exists last_reward_claimed_at timestamp with time zone,
  add column if not exists total_xp_earned integer not null default 0,
  add column if not exists last_active_at timestamp with time zone default timezone('utc'::text, now());

do $$ begin
  alter table public.profiles add constraint profiles_xp_check check (xp >= 0);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.profiles add constraint profiles_level_check check (level >= 1);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.profiles add constraint profiles_tx_coins_check check (tx_coins >= 0);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.profiles add constraint profiles_current_streak_check check (current_streak >= 0);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.profiles add constraint profiles_total_xp_earned_check check (total_xp_earned >= 0);
exception when duplicate_object then null;
end $$;

comment on column public.profiles.xp is 'Current XP — resets partially on level-up to allow progression display';
comment on column public.profiles.level is 'Current player level (1-based)';
comment on column public.profiles.tx_coins is 'Premium currency earned through achievements and streaks';
comment on column public.profiles.current_streak is 'Consecutive daily login streak count';
comment on column public.profiles.last_reward_claimed_at is 'Timestamp of the last daily reward claim (24h cooldown)';
comment on column public.profiles.total_xp_earned is 'Lifetime XP earned (never resets — used for leaderboards)';
comment on column public.profiles.last_active_at is 'Last activity timestamp for presence tracking';

-- --- Rank Tier System ---

create or replace function public.get_rank_tier(player_level int)
returns text as $$
begin
  return case
    when player_level between 1 and 10   then 'Bronze'
    when player_level between 11 and 25  then 'Silver'
    when player_level between 26 and 50  then 'Gold'
    when player_level between 51 and 75  then 'Platinum'
    when player_level between 76 and 99  then 'Diamond'
    when player_level >= 100             then 'Elite'
    else 'Unranked'
  end;
end;
$$ language plpgsql immutable;

-- --- XP-to-next-level calculation (floor(100 × level^1.5)) ---

create or replace function public.xp_for_next_level(current_level int)
returns integer as $$
begin
  return floor(100 * power(current_level, 1.5));
end;
$$ language plpgsql immutable;

-- --- Achievements catalog ---

create table if not exists public.achievements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  icon text not null default 'trophy',
  xp_reward integer not null default 0,
  coins_reward integer not null default 0,
  rarity text not null default 'common'
    check (rarity in ('common', 'rare', 'epic', 'legendary')),
  criteria_type text not null,
  criteria_value integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.achievements enable row level security;

insert into public.achievements (title, description, icon, xp_reward, coins_reward, rarity, criteria_type, criteria_value) values
  ('First Steps',      'Complete your first lesson',             'footprints', 100,  10,  'common',   'lessons_completed', 1),
  ('Dedicated Learner','Complete 10 lessons',                    'book',       500,  50,  'common',   'lessons_completed', 10),
  ('Course Champion',  'Complete an entire course',              'trophy',     1000, 100, 'rare',     'courses_completed', 1),
  ('Knowledge Seeker', 'Complete 5 courses',                     'award',      2500, 250, 'rare',     'courses_completed', 5),
  ('Streak Starter',   'Reach a 3-day login streak',             'flame',      200,  20,  'common',   'streak_days', 3),
  ('Weekly Warrior',   'Reach a 7-day login streak',             'zap',        700,  70,  'rare',     'streak_days', 7),
  ('Unstoppable',      'Reach a 30-day login streak',            'diamond',    5000, 500, 'epic',     'streak_days', 30),
  ('Century',          'Reach level 100',                        'crown',      10000,1000,'legendary','level_reached', 100),
  ('Skill Collector',  'Unlock 10 skill tree nodes',             'git-branch', 1500, 150, 'epic',     'skills_unlocked', 10),
  ('Social Butterfly', 'Make 5 friends',                         'users',      300,  30,  'common',   'friends_count', 5),
  ('Quiz Master',      'Score 100% on any quiz',                 'brain',      800,  80,  'rare',     'perfect_quiz', 1),
  ('Big Spender',      'Spend 1000 TX Coins',                    'shopping-bag',2000, 0,  'epic',     'coins_spent', 1000)
on conflict do nothing;

comment on table public.achievements is 'Master catalog of all possible achievements';

-- --- User achievements (junction) ---

create table if not exists public.user_achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  achievement_id uuid references public.achievements(id) on delete cascade not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  notified boolean not null default false,
  unique(user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

comment on table public.user_achievements is 'Tracks which achievements each user has unlocked';

-- --- Skill tree ---

create table if not exists public.skills (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  category text not null,
  description text,
  icon text not null default 'circle',
  max_level integer not null default 5,
  parent_skill_id uuid references public.skills(id) on delete set null,
  position_x integer not null default 0,
  position_y integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.skills enable row level security;

insert into public.skills (name, category, description, icon, max_level, parent_skill_id, position_x, position_y) values
  ('Logic & Reasoning',     'Foundational', 'Sharpen your logical thinking',      'brain',     5, null,  0,  0),
  ('Memory Palace',         'Foundational', 'Improve information retention',      'book',      5, null,  2,  0),
  ('Speed Reading',         'Productivity', 'Read faster while comprehending more','eye',       5, null,  0,  2),
  ('Deep Focus',            'Productivity', 'Enter flow state faster and longer',  'target',    5, (select id from public.skills where name = 'Logic & Reasoning' limit 1), 1, 1),
  ('Problem Solving',       'Critical',    'Break down complex problems',          'puzzle',    5, (select id from public.skills where name = 'Logic & Reasoning' limit 1), -1, 1),
  ('Public Speaking',       'Social',      'Present ideas with confidence',        'mic',       5, null,  -2, 0),
  ('Critical Analysis',     'Critical',    'Evaluate arguments and evidence',      'search',    5, (select id from public.skills where name = 'Logic & Reasoning' limit 1), 1, -1),
  ('Time Management',       'Productivity', 'Optimize your study schedule',        'clock',     5, null,  0, -2)
on conflict (name) do nothing;

comment on table public.skills is 'Nodes in the interactive skill tree — prerequisites and position define the visual layout';

-- --- User skills (tracked progression) ---

create table if not exists public.user_skills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  current_level integer not null default 1,
  points_invested integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, skill_id)
);

alter table public.user_skills enable row level security;

do $$ begin
  alter table public.user_skills add constraint user_skills_level_check check (current_level >= 1);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.user_skills add constraint user_skills_points_check check (points_invested >= 0);
exception when duplicate_object then null;
end $$;

comment on table public.user_skills is 'Tracks each user investment in skill tree nodes';

-- --- Gamification indexes ---

create index if not exists idx_profiles_xp on public.profiles(xp desc);
create index if not exists idx_profiles_level on public.profiles(level desc);
create index if not exists idx_profiles_total_xp on public.profiles(total_xp_earned desc);
create index if not exists idx_profiles_last_active on public.profiles(last_active_at desc);
create index if not exists idx_user_achievements_user on public.user_achievements(user_id);
create index if not exists idx_user_achievements_achievement on public.user_achievements(achievement_id);
create index if not exists idx_user_skills_user on public.user_skills(user_id);
create index if not exists idx_user_skills_skill on public.user_skills(skill_id);

-- --- Automated level-up trigger ---

create or replace function public.handle_level_up()
returns trigger as $$
declare
  next_xp_needed integer;
begin
  if new.xp is distinct from old.xp then
    if new.xp > old.xp then
      new.total_xp_earned := coalesce(old.total_xp_earned, 0) + (new.xp - old.xp);
    end if;

    loop
      next_xp_needed := public.xp_for_next_level(new.level);
      exit when new.xp < next_xp_needed;
      new.level := new.level + 1;
      new.xp := new.xp - next_xp_needed;
    end loop;
  end if;

  new.last_active_at := timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_xp_change on public.profiles;
create trigger on_profile_xp_change
  before update on public.profiles
  for each row
  when (old.xp is distinct from new.xp)
  execute procedure public.handle_level_up();

comment on function public.handle_level_up is 'Auto-levels users when XP crosses the threshold. XP overflow carries into the next level.';

-- --- Verification helper ---

create or replace function public.calculate_level_from_xp(total_xp int)
returns int as $$
declare
  lvl int := 1;
  needed int;
begin
  if total_xp < 0 then return 1; end if;
  loop
    needed := public.xp_for_next_level(lvl);
    exit when total_xp < needed;
    total_xp := total_xp - needed;
    lvl := lvl + 1;
  end loop;
  return lvl;
end;
$$ language plpgsql immutable;

-- --- Gamification RLS policies ---

do $$ begin
  create policy "Achievements are viewable by everyone." on public.achievements for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can insert achievements." on public.achievements
    for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can update achievements." on public.achievements
    for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can delete achievements." on public.achievements
    for delete using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can view their own achievements." on public.user_achievements for select using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "System can insert achievements." on public.user_achievements for insert with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update their achievement notification status." on public.user_achievements
    for update using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Skills are viewable by everyone." on public.skills for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can manage skills." on public.skills
    for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can view their own skills." on public.user_skills for select using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert their own skills." on public.user_skills for insert with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update their own skills." on public.user_skills for update using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update their own gamification profile." on public.profiles
    for update using (auth.uid() = id);
exception when duplicate_object then null;
end $$;

-- --- User XP log (audit trail) ---

create table if not exists public.xp_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null,
  reason text not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.xp_events enable row level security;

create index if not exists idx_xp_events_user on public.xp_events(user_id);
create index if not exists idx_xp_events_created on public.xp_events(created_at desc);

do $$ begin
  alter table public.xp_events add constraint xp_events_amount_check check (amount > 0);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can view their own XP events." on public.xp_events for select using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "System can insert XP events." on public.xp_events for insert with check (true);
exception when duplicate_object then null;
end $$;

comment on table public.xp_events is 'Immutable audit log recording every XP event for anti-cheat and rollback safety';

-- --- Supabase Realtime publication ---

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    perform supabase_realtime.add_table('public', 'profiles');
    perform supabase_realtime.add_table('public', 'user_achievements');
    perform supabase_realtime.add_table('public', 'user_skills');
  end if;
exception when sqlstate '3F000' then
  null;
end $$;

-- ==================================================================
-- PHASE 2: GAMIFICATION ENGINE — HARDENED TRANSACTIONS & LEDGER
-- ==================================================================

alter table public.profiles
  add column if not exists longest_streak integer not null default 0,
  add column if not exists total_coins_earned integer not null default 0;

do $$ begin
  alter table public.profiles add constraint profiles_longest_streak_check check (longest_streak >= 0);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.profiles add constraint profiles_total_coins_earned_check check (total_coins_earned >= 0);
exception when duplicate_object then null;
end $$;

comment on column public.profiles.longest_streak is 'All-time longest daily login streak';
comment on column public.profiles.total_coins_earned is 'Lifetime TX Coins earned (never resets)';

-- --- TX Coins ledger ---

create table if not exists public.coin_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null,
  balance_after integer not null,
  reason text not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.coin_events enable row level security;

create index if not exists idx_coin_events_user on public.coin_events(user_id);
create index if not exists idx_coin_events_created on public.coin_events(created_at desc);

do $$ begin
  alter table public.coin_events add constraint coin_events_amount_check check (amount > 0);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can view their own coin events." on public.coin_events for select using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "System can insert coin events." on public.coin_events for insert with check (true);
exception when duplicate_object then null;
end $$;

comment on table public.coin_events is 'Immutable audit log for all TX Coin earnings';

-- --- Transaction-safe XP award ---

create or replace function public.award_xp_safe(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_metadata jsonb default '{}'
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_current_xp integer;
  v_current_level integer;
  v_new_xp integer;
  v_new_level integer;
  v_xp_for_next integer;
  v_total_earned integer;
begin
  if p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Amount must be positive');
  end if;

  select xp, level, total_xp_earned
  into v_current_xp, v_current_level, v_total_earned
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Profile not found');
  end if;

  v_new_xp := v_current_xp + p_amount;
  v_new_level := v_current_level;
  v_total_earned := v_total_earned + p_amount;

  loop
    v_xp_for_next := public.xp_for_next_level(v_new_level);
    exit when v_new_xp < v_xp_for_next;
    v_new_xp := v_new_xp - v_xp_for_next;
    v_new_level := v_new_level + 1;
  end loop;

  update public.profiles
  set xp = v_new_xp, level = v_new_level, total_xp_earned = v_total_earned,
    last_active_at = timezone('utc'::text, now())
  where id = p_user_id;

  insert into public.xp_events (user_id, amount, reason, metadata)
  values (p_user_id, p_amount, p_reason, p_metadata);

  return jsonb_build_object(
    'success', true, 'xp_awarded', p_amount,
    'xp_before', v_current_xp, 'xp_after', v_new_xp,
    'level_before', v_current_level, 'level_after', v_new_level,
    'leveled_up', v_new_level > v_current_level
  );
end;
$$;

comment on function public.award_xp_safe is 'Transaction-safe XP award with row locking, auto level-up, and audit logging';

-- --- Transaction-safe coin award ---

create or replace function public.award_coins_safe(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_metadata jsonb default '{}'
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_current_coins integer;
  v_total_earned integer;
begin
  if p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Amount must be positive');
  end if;

  select tx_coins, total_coins_earned
  into v_current_coins, v_total_earned
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Profile not found');
  end if;

  v_total_earned := v_total_earned + p_amount;

  update public.profiles
  set tx_coins = v_current_coins + p_amount, total_coins_earned = v_total_earned,
    last_active_at = timezone('utc'::text, now())
  where id = p_user_id;

  insert into public.coin_events (user_id, amount, balance_after, reason, metadata)
  values (p_user_id, p_amount, v_current_coins + p_amount, p_reason, p_metadata);

  return jsonb_build_object('success', true, 'coins_awarded', p_amount, 'balance', v_current_coins + p_amount);
end;
$$;

comment on function public.award_coins_safe is 'Transaction-safe TX Coin award with row locking and audit logging';

-- --- Streak check and reset ---

create or replace function public.check_and_reset_streak(
  p_user_id uuid
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_streak integer;
  v_longest integer;
  v_last_active timestamptz;
  v_hours_since integer;
  v_reset boolean := false;
begin
  select current_streak, longest_streak, last_active_at
  into v_streak, v_longest, v_last_active
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Profile not found');
  end if;

  if v_last_active is not null then
    v_hours_since := extract(epoch from (timezone('utc'::text, now()) - v_last_active)) / 3600;

    if v_hours_since > 48 and v_streak > 0 then
      if v_streak > v_longest then
        v_longest := v_streak;
      end if;

      update public.profiles
      set current_streak = 0, longest_streak = v_longest
      where id = p_user_id;

      v_streak := 0;
      v_reset := true;
    end if;
  end if;

  update public.profiles
  set last_active_at = timezone('utc'::text, now())
  where id = p_user_id;

  return jsonb_build_object(
    'success', true, 'current_streak', v_streak,
    'longest_streak', v_longest, 'reset', v_reset
  );
end;
$$;

comment on function public.check_and_reset_streak is 'Checks if streak should be reset (>48h inactivity) and updates last_active_at';

-- --- Reward state query ---

create or replace function public.get_reward_state(
  p_user_id uuid
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_last_claimed timestamptz;
  v_streak integer;
  v_hours_since integer;
  v_can_claim boolean;
  v_next_in_seconds integer;
  v_next_tier_streak integer;
  v_next_tier_label text;
begin
  select last_reward_claimed_at, current_streak
  into v_last_claimed, v_streak
  from public.profiles
  where id = p_user_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Profile not found');
  end if;

  if v_last_claimed is null then
    v_can_claim := true;
    v_next_in_seconds := 0;
  else
    v_hours_since := extract(epoch from (timezone('utc'::text, now()) - v_last_claimed)) / 3600;
    v_can_claim := v_hours_since >= 24;
    v_next_in_seconds := greatest(0, 86400 - extract(epoch from (timezone('utc'::text, now()) - v_last_claimed)));
  end if;

  v_next_tier_streak := case when v_streak < 7 then 7 when v_streak < 30 then 30 else 999 end;
  v_next_tier_label := case when v_streak < 7 then '7-Day Streak Bonus' when v_streak < 30 then '30-Day Streak Bonus' else 'Max Streak' end;

  return jsonb_build_object('can_claim', v_can_claim, 'streak', v_streak,
    'last_claimed', v_last_claimed, 'next_in_seconds', v_next_in_seconds,
    'next_tier_streak', v_next_tier_streak, 'next_tier_label', v_next_tier_label);
end;
$$;

comment on function public.get_reward_state is 'Returns current daily reward claim state including cooldown and next tier info';

-- --- All-in-one daily reward claim ---

create or replace function public.claim_daily_reward_safe(
  p_user_id uuid
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_last_claimed timestamptz;
  v_streak integer;
  v_longest integer;
  v_tx_coins integer;
  v_hours_since integer;
  v_is_consecutive boolean;
  v_new_streak integer;
  v_daily_xp integer := 50;
  v_streak_bonus integer;
  v_total_xp integer;
  v_daily_coins integer := 10;
  v_result jsonb;
begin
  select last_reward_claimed_at, current_streak, longest_streak, tx_coins
  into v_last_claimed, v_streak, v_longest, v_tx_coins
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Profile not found');
  end if;

  if v_last_claimed is not null then
    v_hours_since := extract(epoch from (timezone('utc'::text, now()) - v_last_claimed)) / 3600;
    if v_hours_since < 24 then
      return jsonb_build_object('success', false, 'error', 'Reward already claimed',
        'next_in_seconds', greatest(0, 86400 - extract(epoch from (timezone('utc'::text, now()) - v_last_claimed))));
    end if;
    v_is_consecutive := v_last_claimed::date = (timezone('utc'::text, now())::date - interval '1 day');
  else
    v_is_consecutive := false;
  end if;

  if v_is_consecutive then
    v_new_streak := v_streak + 1;
  else
    if v_streak > v_longest then v_longest := v_streak; end if;
    v_new_streak := 1;
  end if;

  if v_new_streak > v_longest then
    v_longest := v_new_streak;
  end if;

  v_streak_bonus := case
    when v_new_streak >= 30 then 100
    when v_new_streak >= 14 then 75
    when v_new_streak >= 7 then 50
    else least(v_new_streak * 5, 25)
  end;

  v_total_xp := v_daily_xp + v_streak_bonus;

  v_daily_coins := case
    when v_new_streak >= 30 then 30
    when v_new_streak >= 14 then 20
    when v_new_streak >= 7 then 15
    else 10
  end;

  v_result := public.award_xp_safe(p_user_id, v_total_xp, 'daily_reward',
    jsonb_build_object('streak', v_new_streak, 'streak_bonus', v_streak_bonus, 'coins', v_daily_coins));

  update public.profiles
  set tx_coins = tx_coins + v_daily_coins, total_coins_earned = total_coins_earned + v_daily_coins,
    current_streak = v_new_streak, longest_streak = v_longest,
    last_reward_claimed_at = timezone('utc'::text, now()),
    last_active_at = timezone('utc'::text, now())
  where id = p_user_id;

  insert into public.coin_events (user_id, amount, balance_after, reason, metadata)
  values (p_user_id, v_daily_coins, v_tx_coins + v_daily_coins, 'daily_reward',
    jsonb_build_object('streak', v_new_streak));

  return jsonb_build_object('success', true, 'xp', v_total_xp, 'coins', v_daily_coins,
    'streak', v_new_streak, 'streak_bonus', v_streak_bonus,
    'leveled_up', (v_result->>'leveled_up')::boolean);
end;
$$;

comment on function public.claim_daily_reward_safe is 'All-in-one daily reward claim with streak validation, cooldown check, XP/coin award, and audit logging';

-- --- Additional indexes for gamification columns ---

create index if not exists idx_profiles_longest_streak on public.profiles(longest_streak desc);
create index if not exists idx_profiles_total_coins on public.profiles(total_coins_earned desc);

-- ==================================================================
-- PHASE 3: PREMIUM PROFILE — SHOP, INVENTORY, PORTFOLIO, COSMETICS
-- ==================================================================

-- Extend profiles with premium profile fields
alter table public.profiles
  add column if not exists display_name text,
  add column if not exists bio text,
  add column if not exists country text,
  add column if not exists university text,
  add column if not exists focus_areas text[],
  add column if not exists github_username text,
  add column if not exists profile_banner text,
  add column if not exists profile_theme text default 'default',
  add column if not exists profile_accent text default 'primary',
  add column if not exists selected_avatar text,
  add column if not exists tournaments_won integer not null default 0,
  add column if not exists pvp_won integer not null default 0,
  add column if not exists practice_hours integer not null default 0,
  add column if not exists quiz_accuracy real not null default 0;

do $$ begin
  alter table public.profiles add constraint profiles_tournaments_won_check check (tournaments_won >= 0);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.profiles add constraint profiles_pvp_won_check check (pvp_won >= 0);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.profiles add constraint profiles_practice_hours_check check (practice_hours >= 0);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.profiles add constraint profiles_quiz_accuracy_check check (quiz_accuracy >= 0 and quiz_accuracy <= 100);
exception when duplicate_object then null;
end $$;

comment on column public.profiles.display_name is 'Stylized display name shown on profile (can differ from username)';
comment on column public.profiles.bio is 'Player bio showcasing goals and interests';
comment on column public.profiles.country is 'Country of residence';
comment on column public.profiles.university is 'University or educational institution';
comment on column public.profiles.focus_areas is 'Learning focus areas (e.g.: Frontend, Backend, AI/ML)';
comment on column public.profiles.github_username is 'Linked GitHub username for portfolio integration';
comment on column public.profiles.profile_banner is 'URL to equipped profile banner image';
comment on column public.profiles.profile_theme is 'Equipped profile theme identifier';
comment on column public.profiles.profile_accent is 'Equipped accent color identifier';
comment on column public.profiles.selected_avatar is 'Selected avatar: preset-1..10 or custom upload URL';

-- --- Shop items catalog ---

create table if not exists public.shop_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  item_type text not null check (item_type in ('avatar_frame', 'profile_banner', 'profile_theme', 'profile_accent', 'avatar', 'effect', 'badge')),
  rarity text not null default 'common' check (rarity in ('common', 'rare', 'epic', 'legendary')),
  image_url text,
  preview_url text,
  price_coins integer not null default 0,
  price_xp integer not null default 0,
  level_requirement integer not null default 1,
  tier_requirement text,
  is_limited boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.shop_items enable row level security;

do $$ begin
  alter table public.shop_items add constraint shop_items_price_coins_check check (price_coins >= 0);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.shop_items add constraint shop_items_price_xp_check check (price_xp >= 0);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.shop_items add constraint shop_items_level_req_check check (level_requirement >= 1);
exception when duplicate_object then null;
end $$;

comment on table public.shop_items is 'Catalog of purchasable cosmetic items for profile customization';

-- Insert default shop items
insert into public.shop_items (name, description, item_type, rarity, image_url, price_coins, price_xp, level_requirement) values
  ('Neon Blade Frame',    'A sharp neon-edged avatar frame',    'avatar_frame',  'rare',     '/frames/neon-blade.png',     500,  0,    5),
  ('Royal Crown Frame',   'A majestic golden crown frame',      'avatar_frame',  'epic',     '/frames/royal-crown.png',    1500, 500,  15),
  ('Diamond Halo Frame',  'Ethereal diamond dust halo',         'avatar_frame',  'legendary','/frames/diamond-halo.png',   5000, 2000, 50),
  ('Cyberpunk Banner',    'Neon-lit city skyline banner',       'profile_banner','rare',     '/banners/cyberpunk.png',     800,  0,    10),
  ('Galaxy Banner',       'Deep space nebula banner',           'profile_banner','epic',     '/banners/galaxy.png',        2500, 1000, 25),
  ('Dark Theme',          'Sleek dark cosmetic theme',           'profile_theme', 'common',   null,                        200,  0,    3),
  ('Plasma Theme',        'Energetic plasma glow theme',        'profile_theme', 'rare',     null,                        1000, 300,  10),
  ('Nebula Theme',        'Cosmic nebula color theme',          'profile_theme', 'epic',     null,                        3000, 1500, 30),
  ('Neon Accent',         'Vibrant neon pink accent',           'profile_accent','rare',     null,                        400,  0,    5),
  ('Gold Accent',         'Premium gold accent color',          'profile_accent','epic',     null,                        2000, 500,  20),
  ('Crystal Accent',      'Rare crystal cyan accent',           'profile_accent','legendary',null,                        5000, 2000, 50),
  ('Phoenix Avatar',      'Legendary phoenix avatar',           'avatar',        'legendary','/avatars/phoenix.png',      8000, 5000, 75),
  ('Shadow Badge',        'Dark shadow operative badge',        'badge',         'rare',     '/badges/shadow.png',         600,  0,    8),
  ('Legend Badge',        'Legendary status badge',             'badge',         'legendary','/badges/legend.png',        10000, 5000, 100),
  ('XP Boost Effect',     'Golden XP particles effect',         'effect',        'epic',     null,                        3000, 1000, 20)
on conflict do nothing;

-- --- User inventory (owned items) ---

create table if not exists public.user_inventory (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_id uuid references public.shop_items(id) on delete cascade not null,
  purchased_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_equipped boolean default false not null,
  unique(user_id, item_id)
);

alter table public.user_inventory enable row level security;

do $$ begin
  create policy "Users can view their own inventory." on public.user_inventory for select using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert their own inventory." on public.user_inventory for insert with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update their own inventory." on public.user_inventory for update using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

comment on table public.user_inventory is 'Tracks which cosmetic items each user owns and their equip status';

-- --- Portfolio projects ---

create table if not exists public.portfolio_projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  image_url text,
  project_url text,
  github_url text,
  tags text[],
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.portfolio_projects enable row level security;

create index if not exists idx_portfolio_projects_user on public.portfolio_projects(user_id);

do $$ begin
  create policy "Portfolio projects are viewable by everyone." on public.portfolio_projects for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert their own projects." on public.portfolio_projects for insert with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update their own projects." on public.portfolio_projects for update using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can delete their own projects." on public.portfolio_projects for delete using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

comment on table public.portfolio_projects is 'User portfolio project showcase';

-- --- Certificates ---

create table if not exists public.certificates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  issuer text,
  image_url text,
  issued_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.certificates enable row level security;

create index if not exists idx_certificates_user on public.certificates(user_id);

do $$ begin
  create policy "Certificates are viewable by everyone." on public.certificates for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert their own certificates." on public.certificates for insert with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update their own certificates." on public.certificates for update using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can delete their own certificates." on public.certificates for delete using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

comment on table public.certificates is 'User certificate uploads for portfolio display';

-- --- User enrollments (course progress tracking) ---

create table if not exists public.user_enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  progress integer default 0,
  completed boolean default false,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  unique(user_id, course_id)
);

alter table public.user_enrollments enable row level security;

create index if not exists idx_user_enrollments_user on public.user_enrollments(user_id);
create index if not exists idx_user_enrollments_course on public.user_enrollments(course_id);

do $$ begin
  create policy "Users can view their own enrollments." on public.user_enrollments for select using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can insert their own enrollments." on public.user_enrollments for insert with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update their own enrollments." on public.user_enrollments for update using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

comment on table public.user_enrollments is 'Tracks user course enrollment and completion progress';

-- --- Storage buckets for profile content ---

insert into storage.buckets (id, name, public) values ('profile-avatars', 'profile-avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('profile-banners', 'profile-banners', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('certificates', 'certificates', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true) on conflict do nothing;

do $$ begin
  create policy "Profile avatars are publicly accessible." on storage.objects for select using (bucket_id = 'profile-avatars');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can upload their own avatar." on storage.objects for insert with check (
    bucket_id = 'profile-avatars' and auth.uid() is not null
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update their own avatar." on storage.objects for update using (
    bucket_id = 'profile-avatars' and auth.uid() is not null
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can delete their own avatar." on storage.objects for delete using (
    bucket_id = 'profile-avatars' and auth.uid() is not null
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Profile banners are publicly accessible." on storage.objects for select using (bucket_id = 'profile-banners');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can upload their own banner." on storage.objects for insert with check (
    bucket_id = 'profile-banners' and auth.uid() is not null
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can update their own banner." on storage.objects for update using (
    bucket_id = 'profile-banners' and auth.uid() is not null
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can delete their own banner." on storage.objects for delete using (
    bucket_id = 'profile-banners' and auth.uid() is not null
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Certificates are publicly accessible." on storage.objects for select using (bucket_id = 'certificates');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can upload certificates." on storage.objects for insert with check (
    bucket_id = 'certificates' and auth.uid() is not null
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can delete their own certificates." on storage.objects for delete using (
    bucket_id = 'certificates' and auth.uid() is not null
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Portfolio images are publicly accessible." on storage.objects for select using (bucket_id = 'portfolio');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can upload portfolio images." on storage.objects for insert with check (
    bucket_id = 'portfolio' and auth.uid() is not null
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Users can delete their own portfolio images." on storage.objects for delete using (
    bucket_id = 'portfolio' and auth.uid() is not null
  );
exception when duplicate_object then null;
end $$;

-- === Equip item function ===
create or replace function public.equip_item_safe(
  p_user_id uuid,
  p_item_id uuid
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_item_type text;
  v_item_name text;
  v_owned boolean;
begin
  -- Check ownership
  select exists(select 1 from public.user_inventory where user_id = p_user_id and item_id = p_item_id)
  into v_owned;

  if not v_owned then
    return jsonb_build_object('success', false, 'error', 'Item not owned');
  end if;

  -- Get item type
  select item_type, name into v_item_type, v_item_name
  from public.shop_items where id = p_item_id;

  -- Unequip same type
  update public.user_inventory ui
  set is_equipped = false
  from public.shop_items si
  where ui.item_id = si.id
    and si.item_type = v_item_type
    and ui.user_id = p_user_id;

  -- Equip new item
  update public.user_inventory
  set is_equipped = true
  where user_id = p_user_id and item_id = p_item_id;

  -- Update profile based on item type
  case v_item_type
    when 'avatar_frame' then
      update public.profiles set selected_avatar = v_item_name where id = p_user_id;
    when 'profile_banner' then
      update public.profiles set profile_banner = v_item_name where id = p_user_id;
    when 'profile_theme' then
      update public.profiles set profile_theme = v_item_name where id = p_user_id;
    when 'profile_accent' then
      update public.profiles set profile_accent = v_item_name where id = p_user_id;
    else
      -- badge/effect/avatar - no direct profile column update needed
  end case;

  return jsonb_build_object('success', true, 'item_type', v_item_type, 'item_name', v_item_name);
end;
$$;

comment on function public.equip_item_safe is 'Transaction-safe equip: unequips same type, equips new item, updates profile';

-- === Purchase item function ===
create or replace function public.purchase_item_safe(
  p_user_id uuid,
  p_item_id uuid
)
returns jsonb
language plpgsql security definer
as $$
declare
  v_price_coins integer;
  v_price_xp integer;
  v_level_req integer;
  v_has_coins boolean;
  v_has_xp boolean;
  v_has_level boolean;
  v_user_level integer;
  v_user_coins integer;
  v_user_xp integer;
  v_owned boolean;
begin
  -- Check not already owned
  select exists(select 1 from public.user_inventory where user_id = p_user_id and item_id = p_item_id)
  into v_owned;

  if v_owned then
    return jsonb_build_object('success', false, 'error', 'Already owned');
  end if;

  -- Get item details
  select price_coins, price_xp, level_requirement
  into v_price_coins, v_price_xp, v_level_req
  from public.shop_items
  where id = p_item_id and is_active = true;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Item not found or not available');
  end if;

  -- Get user state (with row lock)
  select level, tx_coins, xp
  into v_user_level, v_user_coins, v_user_xp
  from public.profiles
  where id = p_user_id
  for update;

  v_has_level := v_user_level >= v_level_req;
  v_has_coins := v_user_coins >= v_price_coins;
  v_has_xp := v_user_xp >= v_price_xp;

  if not v_has_level then
    return jsonb_build_object('success', false, 'error', 'Level requirement not met',
      'required_level', v_level_req, 'current_level', v_user_level);
  end if;

  if not v_has_coins then
    return jsonb_build_object('success', false, 'error', 'Not enough TX Coins',
      'required', v_price_coins, 'available', v_user_coins);
  end if;

  if not v_has_xp then
    return jsonb_build_object('success', false, 'error', 'Not enough XP',
      'required', v_price_xp, 'available', v_user_xp);
  end if;

  -- Deduct costs
  update public.profiles
  set tx_coins = tx_coins - v_price_coins
  where id = p_user_id;

  -- Log coin spend
  insert into public.coin_events (user_id, amount, balance_after, reason, metadata)
  values (p_user_id, -v_price_coins, v_user_coins - v_price_coins, 'shop_purchase',
    jsonb_build_object('item_id', p_item_id));

  -- Add to inventory
  insert into public.user_inventory (user_id, item_id)
  values (p_user_id, p_item_id);

  return jsonb_build_object('success', true,
    'coins_spent', v_price_coins, 'balance', v_user_coins - v_price_coins);
end;
$$;

comment on function public.purchase_item_safe is 'Transaction-safe purchase: validates requirements, deducts cost, adds to inventory';

-- === Realtime publication for new tables ===
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    perform supabase_realtime.add_table('public', 'user_inventory');
    perform supabase_realtime.add_table('public', 'user_enrollments');
  end if;
exception when sqlstate '3F000' then
  null;
end $$;
